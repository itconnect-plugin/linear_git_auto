# Research: Linear-GitHub Automation

**Date**: 2025-10-21
**Feature**: 001-linear-github-sync

## Research Questions

This document resolves all "NEEDS CLARIFICATION" items from the Technical Context section.

---

## 1. Programming Language & Runtime Selection

**Question**: Which language/runtime should be used for this automation system?

**Decision**: **TypeScript/Node.js 20+**

**Rationale**:
- **Official SDK Support**: @linear/sdk provides first-class TypeScript support with complete type safety
- **GitHub Integration**: Octokit (official GitHub SDK) is Node.js native with excellent documentation
- **Ecosystem Fit**: Speckit is a TypeScript-based framework, maintaining language consistency
- **Webhook Framework**: Express.js or Fastify provide mature webhook handling
- **Async/Await**: Native async handling perfect for API calls and concurrent operations
- **Deployment Flexibility**: Can deploy as CLI tool, serverless function, or containerized service

**Alternatives Considered**:
- **Python**: Strong in automation, but Linear SDK is community-maintained; GitHub API clients less mature than Octokit
- **Go**: Excellent for performance/concurrency, but both Linear and GitHub SDKs are third-party; overkill for 100 concurrent operations requirement
- **Rust**: Maximum performance, but steep learning curve and immature ecosystem for this use case

**Implementation Details**:
- **Version**: Node.js 20 LTS (active LTS, stable until 2026-04-30)
- **TypeScript**: 5.x for latest type system features
- **Package Manager**: npm or pnpm (pnpm for monorepo scenarios)

---

## 2. Primary Dependencies

**Question**: Which libraries/SDKs should be used for core functionality?

**Decision**:

| Category | Library | Version | Purpose | Phase |
|----------|---------|---------|---------|-------|
| Linear API | @linear/sdk | ^20.0.0 | Official Linear GraphQL client | 0 |
| GitHub API | @octokit/rest | ^20.0.0 | Official GitHub REST API client | 0 |
| File I/O | fs-extra | ^11.0.0 | Enhanced file operations for mapping.json | 0 |
| Config Management | dotenv | ^16.0.0 | Environment variable management | 0 |
| CLI Framework | commander | ^11.0.0 | CLI argument parsing | 0 |
| CLI Prompts | inquirer | ^9.0.0 | Interactive task selector | 0 |
| Logging | pino | ^8.0.0 | Structured JSON logging | 0 |
| Testing | vitest | ^1.0.0 | Fast unit/integration testing | 0 |
| GitHub Webhooks | @octokit/webhooks | ^12.0.0 | Webhook event parsing & validation | **2** |
| Webhook Server | express | ^4.18.0 | HTTP server for webhooks | **2** |

**Rationale**:
- **@linear/sdk**: Only official SDK, ensures API compatibility and type safety
- **Octokit**: GitHub's official toolkit, handles authentication, rate limiting, retries
- **express**: Industry standard, simple webhook server, extensive middleware ecosystem
- **pino**: High-performance structured logging (constitution observability requirement)
- **vitest**: Fast Vite-based test runner, native ESM support, compatible with Jest APIs

**Alternatives Considered**:
- **Fastify** (vs Express): Faster but less ecosystem support for middleware
- **Winston** (vs Pino): More plugins but slower performance
- **Jest** (vs Vitest): Slower, requires complex ESM configuration

---

## 3. Deployment Model & Target Platform

**Question**: How should this automation be deployed?

**Decision**: **CLI Tool + Git Hooks (Phase 0)**

**Phase 0 Architecture** (Simplified):

```
┌─────────────────────────────────────────────────────────┐
│  Phase 0: Local Developer Tool                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Installation:                                           │
│  ├─ npm install -g linear-github-sync                   │
│  └─ linear-sync init  # Setup tokens + install Git hooks│
│                                                          │
│  CLI Commands:                                           │
│  ├─ linear-sync run         # Sync tasks.md → Linear    │
│  ├─ linear-sync start-task  # Pick task → create branch │
│  └─ linear-sync status      # Show mapping stats        │
│                                                          │
│  Git Hooks (auto-installed):                            │
│  └─ prepare-commit-msg      # Auto-add Linear ID to     │
│                              # commit messages           │
│                                                          │
│  External Integration:                                   │
│  └─ Linear's GitHub Integration (official)              │
│      └─ Handles PR merge → Linear "Done"                │
└─────────────────────────────────────────────────────────┘
```

**Phase 2 Architecture** (Future - Deferred):

```
┌─────────────────────────────────────────────────────────┐
│  Phase 2: Real-time Webhook Server                      │
├─────────────────────────────────────────────────────────┤
│  ├─ Deploy as Node.js service (Docker/Cloud)            │
│  ├─ Configure webhooks: Linear → server, GitHub → server│
│  └─ Auto-sync on events (PR create, merge, comment)     │
└─────────────────────────────────────────────────────────┘
```

**Rationale for Phase 0 Approach**:
- **Simplicity**: No server infrastructure, no deployment complexity
- **Developer-friendly**: Works locally, integrates with existing Git workflow
- **Leverage Linear's GitHub Integration**: Don't reinvent what Linear already provides well
- **Fast time to value**: Install → configure → use (5 minutes)
- **Low operational overhead**: No servers to maintain

**Why Defer Webhook Server to Phase 2**:
- Linear's official GitHub integration already handles PR→Linear sync reliably
- Webhook server adds infrastructure complexity (deployment, monitoring, scaling)
- 70% of automation value achievable with CLI + Git hooks alone
- Teams can validate core value before investing in server infrastructure

**Platform Requirements**:
- **Developer Machine**: Node.js 20+ (macOS, Linux, Windows WSL)
- **Git**: Version 2.9+ (for Git hooks support)
- **Linear Account**: With GitHub integration configured

**Alternatives Considered**:
- **Webhook Server First**: Rejected due to complexity barrier, infrastructure requirements
- **GitHub Action**: Violates out-of-scope clarification (per modify.md feedback)
- **Serverless (AWS Lambda)**: Adds cloud dependency, overkill for Phase 0

---

## 4. Authentication & Secrets Management

**Question**: How should Linear API tokens and GitHub credentials be stored securely?

**Decision**: **Environment Variables + Optional Secret Management Integration**

**Implementation Strategy**:

```typescript
// Configuration priority order:
1. Environment variables (LINEAR_API_KEY, GITHUB_TOKEN)
2. .env file (for local development, gitignored)
3. Secret management integration (optional):
   - AWS Secrets Manager
   - HashiCorp Vault
   - GitHub Secrets (for Action deployment)
```

**Security Requirements** (per constitution):
- ✅ No tokens in logs or error messages
- ✅ Validate webhook signatures (Linear HMAC, GitHub SHA256)
- ✅ Least-privilege permissions:
  - Linear: Read/write issues, read teams
  - GitHub: Read PRs, write PR descriptions, read webhooks

**Rationale**:
- **Environment Variables**: Universal, works in CLI and server modes, cloud-native
- **.env for Dev**: Standard practice, prevents accidental commits
- **Optional Secret Managers**: Advanced users can integrate, not required for MVP
- **No Config File Storage**: Prevents accidental token commits

**Implementation**:
```typescript
// src/config/secrets.ts
import { config } from 'dotenv';

config(); // Load .env if present

export const getLinearToken = (): string => {
  const token = process.env.LINEAR_API_KEY;
  if (!token) throw new Error('LINEAR_API_KEY not configured');
  return token;
};

export const getGitHubToken = (): string => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN not configured');
  return token;
};
```

---

## 5. Testing Framework & Strategy

**Question**: Which testing tools and patterns should be used?

**Decision**: **Vitest + Contract Testing with Real API Sandboxes**

**Testing Pyramid**:

```
        ┌──────────────┐
        │  Integration │  ← End-to-end sync scenarios (5-10 tests)
        │   (Vitest)   │     Real Linear/GitHub sandbox accounts
        └──────────────┘
             ▲
             │
      ┌─────────────────┐
      │    Contract     │  ← API contract validation (20-30 tests)
      │  (Vitest + MSW) │     Mock server with Linear/GitHub schemas
      └─────────────────┘
             ▲
             │
   ┌────────────────────────┐
   │        Unit           │  ← Parser, mapper, retry logic (50+ tests)
   │ (Vitest + test doubles)│     Fast, isolated, no external deps
   └────────────────────────┘
```

**Test Categories**:

1. **Unit Tests** (fast, isolated):
   - tasks.md parser (Markdown → structured data)
   - Mapping file CRUD operations
   - Branch name pattern detection
   - Retry/backoff logic
   - Conflict resolution (GitHub-takes-precedence)

2. **Contract Tests** (API behavior):
   - Linear issue creation/update schemas
   - GitHub PR description formatting
   - Webhook payload validation
   - Rate limit response handling

3. **Integration Tests** (end-to-end):
   - Sync tasks.md → Linear issues (with dedup)
   - PR creation → Auto-populated description
   - PR merge → Linear status update
   - Conflict scenarios (GitHub overrides Linear)

**Tools**:
- **Vitest**: Primary test runner (fast, ESM-native)
- **MSW (Mock Service Worker)**: Mock Linear/GitHub API responses
- **Testcontainers** (optional): Isolated webhook server tests

**Rationale**:
- **Vitest**: 10x faster than Jest for TypeScript, great DX
- **Real API Testing**: Small integration suite with actual Linear/GitHub sandboxes ensures API compatibility
- **Contract Tests**: Validate assumptions about API behavior without hitting real endpoints constantly

---

## 6. Error Handling & Retry Strategy

**Question**: How should API failures and transient errors be handled?

**Decision**: **Exponential Backoff with Circuit Breaker Pattern**

**Implementation** (per constitution FR-006):

```typescript
// src/lib/retry.ts
interface RetryConfig {
  maxAttempts: 3;        // Constitution requirement
  baseDelay: 1000;       // 1 second
  maxDelay: 30000;       // 30 seconds
  backoffMultiplier: 2;  // Exponential: 1s, 2s, 4s...
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let attempt = 0;
  let delay = config.baseDelay;

  while (attempt < config.maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      attempt++;

      if (attempt >= config.maxAttempts) {
        logger.error({ error, attempts: attempt }, 'Max retries exceeded');
        throw error;
      }

      if (!isRetriable(error)) {
        logger.error({ error }, 'Non-retriable error');
        throw error;
      }

      logger.warn({ error, attempt, nextDelay: delay }, 'Retrying operation');
      await sleep(delay);
      delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
    }
  }
}

function isRetriable(error: any): boolean {
  // Retry on network errors, rate limits, 5xx errors
  return error.status >= 500 ||
         error.status === 429 ||
         error.code === 'ECONNRESET';
}
```

**Error Categories**:

| Error Type | Retry? | Block Operation? | Example |
|------------|--------|------------------|---------|
| Rate Limit (429) | ✅ Yes | ❌ No | Linear API throttle |
| Network Error | ✅ Yes | ❌ No | Timeout, DNS failure |
| 5xx Server Error | ✅ Yes | ❌ No | Linear/GitHub downtime |
| 4xx Client Error | ❌ No | ❌ No | Invalid token, malformed request |
| Validation Error | ❌ No | ❌ No | Invalid tasks.md format |

**Non-Blocking Requirement** (per constitution):
- ✅ PR creation/merge NEVER blocked by sync failures
- ✅ Manual sync CLI command reports errors but doesn't block git operations
- ✅ Webhook failures logged and reported, but HTTP 200 returned to avoid webhook retries

**Rationale**:
- **Exponential Backoff**: Industry standard, prevents thundering herd
- **Max 3 Attempts**: Constitution requirement, balances reliability vs latency
- **Circuit Breaker**: Prevents cascading failures if Linear/GitHub goes down
- **Non-Blocking**: Users can always proceed with development even if automation fails

---

## 7. Logging & Observability

**Question**: How should structured logging and monitoring be implemented?

**Decision**: **Pino Structured Logging + OpenTelemetry-Ready**

**Log Structure** (per constitution observability requirements):

```typescript
// Every operation logs:
{
  "timestamp": "2025-10-21T10:30:00.000Z",
  "level": "info",
  "operation": "sync_task_to_linear",
  "taskTitle": "Implement user authentication",
  "linearIssueId": "ABC-123",
  "duration": 1250,        // milliseconds
  "success": true,
  "metadata": {
    "taskId": "T001",
    "userStory": "US1",
    "priority": "P1"
  }
}
```

**Required Log Points** (per FR-014):
1. Task sync start/complete (with task metadata)
2. Linear API calls (with latency)
3. GitHub API calls (with latency)
4. PR annotation events
5. Conflict detection events
6. Retry attempts
7. Health check calls

**Metrics to Track**:
- Sync latency (p50, p95, p99)
- API call success rate
- Retry counts by error type
- Mapping file size growth
- Webhook processing time

**Implementation**:
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  redact: ['token', 'apiKey', 'secret'], // Prevent token leakage
});

// Usage:
logger.info({
  operation: 'sync_task_to_linear',
  taskTitle: task.title,
  linearIssueId: issue.identifier,
  duration: Date.now() - startTime
}, 'Task synced successfully');
```

**Rationale**:
- **Structured JSON**: Machine-readable, easy to query in log aggregators
- **Redaction**: Prevents token leakage per security requirements
- **OpenTelemetry-Ready**: Can upgrade to distributed tracing later
- **Performance**: Pino is one of fastest Node.js loggers (minimal overhead)

---

## 8. Linear PR Description Format

**Question**: What format should PR descriptions use to ensure Linear auto-detection?

**Decision**: **Linear-Compatible Markdown with Issue Reference**

**Format** (based on Linear documentation):

```markdown
## Linear Issue
ABC-123

## Changes
- Implement user authentication API
- Add login endpoint
- Add JWT token generation

## Related Commits
- feat: add authentication middleware (commit abc123)
- feat: implement login endpoint (commit def456)

## Testing
- [x] Unit tests passing
- [x] Integration tests passing

---
_Auto-generated by Linear-GitHub Sync_
```

**Linear Auto-Detection Requirements**:
1. Issue ID appears as standalone text or link: `ABC-123` or `https://linear.app/.../ABC-123`
2. Issue ID pattern: `[A-Z]+-[0-9]+` (team prefix + number)
3. Must appear in PR title OR description (we'll put in both)

**Implementation**:
```typescript
// src/github/pr-formatter.ts
export function formatPRDescription(mapping: TaskMapping, commits: Commit[]): string {
  const { linearIssueId, linearIssueUrl, taskTitle } = mapping;

  return `## Linear Issue
${linearIssueUrl}

## Task
${taskTitle}

## Changes
${commits.map(c => `- ${c.message}`).join('\n')}

---
_Auto-generated by Linear-GitHub Sync_`;
}

export function formatPRTitle(branchName: string, taskTitle: string): string {
  const issueId = extractIssueId(branchName); // Extracts ABC-123 from branch
  return `${issueId}: ${taskTitle}`;
}
```

**Rationale**:
- **Redundancy**: Issue ID in both title and description ensures detection
- **Human-Readable**: Developers can understand PR context without clicking links
- **Conventional**: Follows standard PR description patterns (Issue → Changes → Testing)

---

## 9. Git Hooks Implementation

**Question**: How should Git hooks be installed and what should they do?

**Decision**: **Auto-install `prepare-commit-msg` hook via `linear-sync init`**

**Hook Purpose**:
Automatically inject Linear issue ID from branch name into commit messages, ensuring commits are linked to Linear issues without manual typing.

**Implementation**:

```bash
# .git/hooks/prepare-commit-msg
#!/bin/bash

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

# Skip if merge/squash commit
if [ "$COMMIT_SOURCE" = "merge" ] || [ "$COMMIT_SOURCE" = "squash" ]; then
  exit 0
fi

# Get current branch name
BRANCH_NAME=$(git symbolic-ref --short HEAD 2>/dev/null)

# Extract Linear issue ID (pattern: ABC-123)
ISSUE_ID=$(echo "$BRANCH_NAME" | grep -oE '[A-Z]+-[0-9]+' | head -1)

if [ -n "$ISSUE_ID" ]; then
  # Read existing commit message
  ORIGINAL_MSG=$(cat "$COMMIT_MSG_FILE")

  # Only add if not already present
  if ! echo "$ORIGINAL_MSG" | grep -q "$ISSUE_ID"; then
    # Prepend issue ID to commit message
    echo "$ISSUE_ID: $ORIGINAL_MSG" > "$COMMIT_MSG_FILE"
  fi
fi
```

**Installation via CLI**:

```typescript
// src/cli/init.ts
async function installGitHooks() {
  const hookPath = path.join(process.cwd(), '.git/hooks/prepare-commit-msg');
  const hookContent = fs.readFileSync(
    path.join(__dirname, '../hooks/prepare-commit-msg.sh'),
    'utf-8'
  );

  fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
  console.log('✅ Git hook installed: prepare-commit-msg');
}
```

**User Workflow**:
```bash
# 1. Initialize (one-time setup)
$ linear-sync init
✅ Git hook installed: prepare-commit-msg

# 2. Developer creates branch
$ git checkout -b ABC-123-implement-login

# 3. Developer commits (hook auto-adds issue ID)
$ git add .
$ git commit -m "Add login endpoint"
# Becomes: "ABC-123: Add login endpoint"

# 4. Git log shows Linear-linked commits
$ git log --oneline
abc1234 ABC-123: Add login endpoint
def5678 ABC-123: Add authentication middleware
```

**Rationale**:
- **Zero manual effort**: Developers never type Linear IDs manually
- **Git-native**: Uses standard Git hooks, no external tools needed
- **Safe**: Only modifies new commits, doesn't touch history
- **Conventional**: Follows pattern similar to Husky, pre-commit, etc.

**Edge Cases Handled**:
- Merge commits: Skipped (preserve merge message)
- Branches without Linear IDs: Hook does nothing (no error)
- Issue ID already in message: Prevents duplication

---

## 10. `start-task` CLI Command

**Question**: How should task selection and branch creation work?

**Decision**: **Interactive CLI with task selector using `inquirer`**

**Implementation**:

```typescript
// src/cli/start-task.ts
import inquirer from 'inquirer';
import { readMappingFile } from '../mapping';
import { execSync } from 'child_process';

export async function startTask() {
  // 1. Load mapping file
  const mappings = await readMappingFile('.specify/linear-mapping.json');

  if (mappings.length === 0) {
    console.error('❌ No tasks found. Run `linear-sync run` first.');
    process.exit(1);
  }

  // 2. Present task selector
  const choices = mappings.map((m, index) => ({
    name: `${m.linearIssueId}: ${m.taskTitle}`,
    value: index,
    short: m.linearIssueId
  }));

  const { taskIndex } = await inquirer.prompt([{
    type: 'list',
    name: 'taskIndex',
    message: 'Select a task to work on:',
    choices,
    pageSize: 15
  }]);

  const selected = mappings[taskIndex];

  // 3. Create and checkout branch
  const branchName = selected.branchName; // e.g., "ABC-123-implement-login"

  try {
    execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    console.log(`\n✅ Created branch: ${branchName}`);
    console.log(`📌 Linear Issue: ${selected.linearIssueUrl}`);
    console.log(`\n💡 Your commits will automatically include "${selected.linearIssueId}" prefix`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      // Branch exists, just checkout
      execSync(`git checkout ${branchName}`, { stdio: 'inherit' });
      console.log(`\n✅ Switched to existing branch: ${branchName}`);
    } else {
      throw error;
    }
  }
}
```

**User Experience**:

```bash
$ linear-sync start-task

? Select a task to work on: (Use arrow keys)
❯ ABC-123: Implement user authentication API
  ABC-124: Add login endpoint
  ABC-125: Create password reset flow
  ABC-126: Implement JWT token generation
  (Move up and down to reveal more choices)

✅ Created branch: ABC-123-implement-user-auth
📌 Linear Issue: https://linear.app/myteam/issue/ABC-123

💡 Your commits will automatically include "ABC-123" prefix
```

**Features**:
- **Fuzzy search** (via inquirer): Type to filter tasks
- **Auto-branch-name**: Uses suggested name from mapping file
- **Handles existing branches**: If branch exists, just checkout
- **Shows Linear URL**: Easy access to task details
- **Clear feedback**: Confirms branch creation and next steps

**Rationale**:
- **Low friction**: No manual branch naming, no Linear ID lookup
- **Discoverable**: Developers can browse all available tasks
- **Integrates with hooks**: Branch name ensures commit message automation
- **Fail-safe**: Gracefully handles edge cases (existing branch, no tasks, etc.)

**Dependency**: `inquirer` (interactive CLI prompts)

---

## Summary Table

| Question | Decision | Key Tradeoff |
|----------|----------|--------------|
| Language | TypeScript/Node.js 20 | Ecosystem fit vs raw performance |
| Deployment | **CLI + Git hooks** (Phase 0), webhook server (Phase 2) | Simplicity vs real-time sync |
| Auth Storage | Environment variables + .env | Security vs ease of setup |
| Testing | Vitest + contract + integration | Speed vs API coverage |
| Error Handling | Exponential backoff (max 3) | Reliability vs latency |
| Logging | Pino structured JSON | Performance vs feature richness |
| Git Hooks | prepare-commit-msg (auto-install) | Automation vs git purity |
| Task Selection | Interactive CLI (inquirer) | UX vs simplicity |
| GitHub Integration | **Linear's official integration** (Phase 0), custom webhooks (Phase 2) | Leverage existing vs full control |

---

**Next Steps**: Proceed to Phase 1 Design (data-model.md, contracts/, quickstart.md)
