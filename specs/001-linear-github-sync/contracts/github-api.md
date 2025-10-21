# GitHub API Contract

**Date**: 2025-10-21
**Feature**: 001-linear-github-sync

This document defines the contract with GitHub REST API and Linear's GitHub Integration.

---

## Phase 0 Scope

**Important**: Phase 0 leverages **Linear's official GitHub Integration** instead of building custom GitHub API integration. This contract documents:
1. Linear GitHub Integration setup requirements
2. Branch naming conventions for auto-linking
3. Phase 2 GitHub API operations (deferred)

---

## Authentication (Phase 2)

**Phase 0**: Not required (using Linear's GitHub Integration)

**Phase 2**: GitHub Personal Access Token or GitHub App

```typescript
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});
```

**Required Scopes** (Phase 2):
- `repo` - Full repository access
- `write:discussion` - Create PR comments
- `read:org` - Read organization data (for team mapping)

---

## Linear GitHub Integration Setup (Phase 0)

**Purpose**: Enable automatic PR → Linear issue linking without custom code.

### Installation Steps

1. **In Linear Settings**:
   - Navigate to Settings → Integrations → GitHub
   - Click "Add GitHub Integration"
   - Authorize Linear to access GitHub repositories
   - Select repositories to sync

2. **Configuration**:
   ```json
   {
     "autoLinkPRs": true,
     "autoCloseIssuesOnMerge": true,
     "syncComments": false  // Phase 2 feature
   }
   ```

3. **Verification**:
   - Create test branch: `ABC-123-test-integration`
   - Create PR from that branch
   - Verify Linear issue ABC-123 shows PR link
   - Merge PR → Verify issue moves to "Done"

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│  Developer Workflow (Phase 0)                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. linear-sync start-task                              │
│     → Creates branch: ABC-123-feature-name              │
│                                                          │
│  2. git commit -m "Add feature"                         │
│     → Hook auto-adds: "ABC-123: Add feature"            │
│                                                          │
│  3. git push + Create PR (via GitHub UI/CLI)            │
│     → Linear detects ABC-123 in branch name             │
│     → Automatically links PR to Linear issue            │
│                                                          │
│  4. Merge PR                                             │
│     → Linear's integration detects merge                │
│     → Automatically moves ABC-123 to "Done"             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Branch Naming Convention (Phase 0)

**Required Pattern**: `{LINEAR_ISSUE_ID}-{slug}`

**Regex**: `^[A-Z]+-[0-9]+-[\w-]+$`

**Examples**:
- ✅ `ABC-123-implement-user-auth`
- ✅ `XYZ-456-fix-payment-bug`
- ✅ `DEV-789-refactor-api-client`
- ❌ `feature/authentication` (no issue ID)
- ❌ `abc-123-lowercase-prefix` (team prefix must be uppercase)
- ❌ `ABC-123` (missing slug)

**Implementation** (Phase 0):
```typescript
// src/github/branch-validator.ts
export function validateBranchName(branchName: string): {
  valid: boolean;
  issueId?: string;
  slug?: string;
  error?: string;
} {
  const pattern = /^([A-Z]+-[0-9]+)-([\w-]+)$/;
  const match = branchName.match(pattern);

  if (!match) {
    return {
      valid: false,
      error: 'Branch name must follow pattern: ABC-123-feature-name'
    };
  }

  return {
    valid: true,
    issueId: match[1],  // "ABC-123"
    slug: match[2]      // "feature-name"
  };
}

export function extractIssueId(branchName: string): string | null {
  const match = branchName.match(/[A-Z]+-[0-9]+/);
  return match ? match[0] : null;
}
```

**Usage in start-task**:
```typescript
// src/cli/start-task.ts
const branchName = mapping.branchName; // Already validated during mapping creation
execSync(`git checkout -b ${branchName}`);
```

---

## GitHub API Operations (Phase 2)

**Note**: These operations are **deferred to Phase 2** when we build custom webhook server.

### 1. Create Pull Request Comment

**Endpoint**: `POST /repos/{owner}/{repo}/issues/{issue_number}/comments`

**Purpose**: Sync Linear comments to GitHub PR

**Input**:
```typescript
{
  owner: string;      // "myorg"
  repo: string;       // "myrepo"
  issue_number: number;  // PR number
  body: string;       // Markdown comment
}
```

**Output**:
```typescript
{
  id: number;
  body: string;
  user: {
    login: string;
  };
  created_at: string;
  html_url: string;
}
```

**Example**:
```typescript
await octokit.rest.issues.createComment({
  owner: 'myorg',
  repo: 'myrepo',
  issue_number: 42,
  body: '**From Linear**: Task completed and ready for review.'
});
```

---

### 2. List Pull Request Commits

**Endpoint**: `GET /repos/{owner}/{repo}/pulls/{pull_number}/commits`

**Purpose**: Extract commit messages for PR description generation

**Input**:
```typescript
{
  owner: string;
  repo: string;
  pull_number: number;
}
```

**Output**:
```typescript
Array<{
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
}>
```

**Usage** (Phase 2):
```typescript
const commits = await octokit.rest.pulls.listCommits({
  owner: 'myorg',
  repo: 'myrepo',
  pull_number: 42
});

const commitMessages = commits.data.map(c => ({
  message: c.commit.message,
  sha: c.sha.substring(0, 7)
}));

// Use in PR description template
const prBody = formatPRDescription(mapping, commitMessages);
```

---

### 3. Update Pull Request

**Endpoint**: `PATCH /repos/{owner}/{repo}/pulls/{pull_number}`

**Purpose**: Auto-update PR description with Linear issue references

**Input**:
```typescript
{
  owner: string;
  repo: string;
  pull_number: number;
  title?: string;
  body?: string;
}
```

**Example** (Phase 2):
```typescript
await octokit.rest.pulls.update({
  owner: 'myorg',
  repo: 'myrepo',
  pull_number: 42,
  body: `## Linear Issue
https://linear.app/myteam/issue/ABC-123

## Changes
- feat: implement authentication (abc1234)
- test: add auth tests (def5678)

---
_Auto-generated by Linear-GitHub Sync_`
});
```

---

### 4. Get Pull Request

**Endpoint**: `GET /repos/{owner}/{repo}/pulls/{pull_number}`

**Purpose**: Check PR status for sync operations

**Output**:
```typescript
{
  number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  merged: boolean;
  head: {
    ref: string;  // Branch name (contains issue ID)
    sha: string;
  };
  base: {
    ref: string;  // Target branch (usually "main")
  };
  user: {
    login: string;
  };
  created_at: string;
  updated_at: string;
  merged_at: string | null;
}
```

**Usage** (Phase 2):
```typescript
const pr = await octokit.rest.pulls.get({
  owner: 'myorg',
  repo: 'myrepo',
  pull_number: 42
});

const issueId = extractIssueId(pr.data.head.ref); // Extract from branch name
if (pr.data.merged) {
  // Update Linear issue to "Done"
  await updateLinearIssueStatus(issueId, 'completed');
}
```

---

## Webhooks (Phase 2)

**Note**: Phase 0 uses Linear's GitHub Integration instead of custom webhooks.

### Pull Request Events

**Event**: `pull_request`

**Actions**: `opened`, `closed`, `reopened`, `edited`

**Payload**:
```json
{
  "action": "closed",
  "pull_request": {
    "number": 42,
    "title": "ABC-123: Implement authentication",
    "state": "closed",
    "merged": true,
    "head": {
      "ref": "ABC-123-implement-auth"
    },
    "user": {
      "login": "developer"
    },
    "merged_at": "2025-10-21T10:30:00Z"
  },
  "repository": {
    "name": "myrepo",
    "owner": {
      "login": "myorg"
    }
  }
}
```

**Webhook Signature Validation**:
```typescript
import crypto from 'crypto';

function validateGitHubWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const expectedSignature = `sha256=${hmac}`;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Express middleware (Phase 2)
app.post('/webhooks/github', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);

  if (!validateGitHubWebhook(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook...
});
```

---

## Rate Limiting

**Limits**:
- **Authenticated**: 5000 requests/hour per token
- **Unauthenticated**: 60 requests/hour per IP

**Response Headers**:
```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1640995200  # Unix timestamp
```

**Handling** (per FR-006):
```typescript
async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  const maxAttempts = 3;
  const baseDelay = 1000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (error.status === 403 && error.response.headers['x-ratelimit-remaining'] === '0') {
        const resetTime = parseInt(error.response.headers['x-ratelimit-reset']) * 1000;
        const waitTime = resetTime - Date.now();

        if (attempt < maxAttempts && waitTime < 60000) { // Wait max 1 minute
          await sleep(waitTime);
          continue;
        }
      }

      if (isRetriable(error) && attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await sleep(delay);
        continue;
      }

      throw error;
    }
  }
}
```

---

## Error Handling

| Error | HTTP Status | Retry? | Action |
|-------|-------------|--------|--------|
| Invalid token | 401 | ❌ | Fail fast, log error |
| Rate limit exceeded | 403 | ✅ | Wait until reset time |
| PR not found | 404 | ❌ | Log warning, skip |
| Invalid input | 422 | ❌ | Log validation error |
| Server error | 500 | ✅ | Retry with backoff |
| Service unavailable | 503 | ✅ | Retry with backoff |

---

## Testing Strategy

### Phase 0 Testing

**Manual Tests**:
1. Configure Linear GitHub Integration
2. Create branch with pattern: `ABC-123-test`
3. Create PR → Verify Linear shows PR link
4. Merge PR → Verify Linear issue moves to "Done"

**Unit Tests**:
```typescript
import { describe, test, expect } from 'vitest';
import { validateBranchName, extractIssueId } from '../github/branch-validator';

describe('Branch Validation', () => {
  test('validates correct branch name', () => {
    const result = validateBranchName('ABC-123-implement-auth');
    expect(result.valid).toBe(true);
    expect(result.issueId).toBe('ABC-123');
    expect(result.slug).toBe('implement-auth');
  });

  test('rejects invalid branch name', () => {
    const result = validateBranchName('feature/auth');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('pattern');
  });

  test('extracts issue ID from branch', () => {
    expect(extractIssueId('ABC-123-feature')).toBe('ABC-123');
    expect(extractIssueId('feature-branch')).toBeNull();
  });
});
```

### Phase 2 Testing

**Integration Tests** (with real GitHub API):
```typescript
import { Octokit } from '@octokit/rest';
import { describe, test, expect } from 'vitest';

describe('GitHub API Integration', () => {
  const octokit = new Octokit({ auth: process.env.GITHUB_TEST_TOKEN });

  test('creates PR comment', async () => {
    const comment = await octokit.rest.issues.createComment({
      owner: 'test-org',
      repo: 'test-repo',
      issue_number: 1,
      body: 'Test comment from integration test'
    });

    expect(comment.status).toBe(201);
    expect(comment.data.body).toContain('Test comment');
  });
});
```

---

## Contract Validation Checklist

### Phase 0
- ✅ Branch naming convention documented
- ✅ Linear GitHub Integration setup steps provided
- ✅ Branch validation utilities specified
- ✅ Manual testing procedure defined

### Phase 2 (Deferred)
- ⏸️ GitHub API authentication documented
- ⏸️ Required scopes listed
- ⏸️ Webhook signature validation implemented
- ⏸️ Rate limit handling specified
- ⏸️ Error handling covers all HTTP status codes
- ⏸️ Integration tests defined

---

**Next**: Create quickstart.md developer onboarding guide
