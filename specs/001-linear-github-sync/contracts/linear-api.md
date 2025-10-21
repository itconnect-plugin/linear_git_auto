# Linear API Contract

**Date**: 2025-10-21
**Feature**: 001-linear-github-sync

This document defines the contract with Linear GraphQL API using the @linear/sdk.

---

## Authentication

**Method**: Bearer Token (API Key)

```typescript
import { LinearClient } from '@linear/sdk';

const client = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY
});
```

**Required Scopes**:
- `read:issues` - Read issue data
- `write:issues` - Create/update issues
- `read:teams` - Read team information
- `read:users` - Read user assignments (for sync)

---

## Operations

### 1. Create Issue

**Mutation**: `issueCreate`

**Input**:
```typescript
{
  teamId: string;          // UUID of Linear team (from config)
  title: string;           // Task title from tasks.md
  description?: string;    // Formatted markdown (see data-model.md)
  labelIds?: string[];     // UUIDs of labels (user story, phase, priority)
}
```

**Output**:
```typescript
{
  success: boolean;
  issue?: {
    id: string;            // UUID (internal ID)
    identifier: string;    // Human-readable (ABC-123)
    title: string;
    description: string;
    url: string;           // https://linear.app/...
    team: {
      id: string;
      key: string;         // "ABC" part of ABC-123
    };
    createdAt: Date;
  };
  error?: string;
}
```

**Example**:
```typescript
const result = await client.issueCreate({
  teamId: 'team-uuid-here',
  title: 'Implement user authentication API',
  description: `**Task ID**: T012
**User Story**: US1
**Phase**: Phase 3

Can run in parallel: Yes

---
_Synced from tasks.md_`,
  labelIds: ['label-us1-uuid', 'label-parallel-uuid']
});

if (result.success && result.issue) {
  const issue = await result.issue;
  console.log(issue.identifier); // "ABC-123"
  console.log(issue.url);
}
```

---

### 2. Update Issue

**Mutation**: `issueUpdate`

**Input**:
```typescript
{
  id: string;              // Linear issue UUID (not identifier!)
  title?: string;
  description?: string;
  stateId?: string;        // UUID of target state
  assigneeId?: string;     // UUID of user
  labelIds?: string[];
}
```

**Output**:
```typescript
{
  success: boolean;
  issue?: {
    id: string;
    identifier: string;
    updatedAt: Date;
  };
  error?: string;
}
```

**Usage Note**: To update, must first query issue by identifier to get UUID.

---

### 3. Query Issue by Identifier

**Query**: `issue`

**Input**:
```typescript
{
  id: string;  // Can use identifier (ABC-123) OR UUID
}
```

**Output**:
```typescript
{
  id: string;
  identifier: string;
  title: string;
  description: string;
  state: {
    id: string;
    name: string;   // "Todo", "In Progress", "Done"
    type: string;   // "backlog", "started", "completed"
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  labels: {
    nodes: Array<{
      id: string;
      name: string;
    }>;
  };
  url: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 4. List Team Issues

**Query**: `issues` (with team filter)

**Input**:
```typescript
{
  filter: {
    team: { id: { eq: string } };  // Team UUID
  };
  first?: number;   // Pagination limit (default 50)
  after?: string;   // Pagination cursor
}
```

**Output**:
```typescript
{
  nodes: Issue[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string;
  };
}
```

**Usage**: Check for existing issues during initial sync (FR-007).

---

### 5. Get Team Info

**Query**: `team`

**Input**:
```typescript
{
  id: string;  // Team UUID or key (e.g., "ABC")
}
```

**Output**:
```typescript
{
  id: string;
  key: string;          // Team prefix ("ABC")
  name: string;
  description: string;
}
```

**Usage**: Validate configured team exists during initialization.

---

### 6. List/Create Labels

**Query**: `issueLabels`

**Mutation**: `issueLabelCreate`

**Strategy**:
1. Query existing labels by name
2. If not found, create new label
3. Store label UUID for reuse

**Example - Create Label**:
```typescript
const result = await client.issueLabelCreate({
  name: 'User Story 1',
  color: '#4A90E2',  // Blue
  teamId: 'team-uuid'
});
```

---

## Rate Limiting

**Limits**: Linear API uses cost-based rate limiting (GraphQL complexity)

**Typical Costs**:
- Simple query (issue by ID): ~10 points
- Create issue: ~20 points
- List issues (50 items): ~100 points

**Rate Limit**: ~5000 points per minute per API key

**Handling** (per FR-006):
```typescript
async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  const maxAttempts = 3;
  const baseDelay = 1000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (error.message?.includes('rate limit') && attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
}
```

**Response Header**: Check `X-RateLimit-Remaining` (if exposed)

---

## Webhook Events (for bidirectional sync)

**Linear → System** events

### Issue Updated

**Event**: `Issue`

**Trigger**: Issue status/assignee/description changed

**Payload**:
```json
{
  "action": "update",
  "type": "Issue",
  "data": {
    "id": "uuid",
    "identifier": "ABC-123",
    "title": "...",
    "state": {
      "name": "Done",
      "type": "completed"
    },
    "assignee": { ... },
    "updatedAt": "2025-10-21T10:30:00.000Z"
  },
  "url": "https://linear.app/..."
}
```

**Action**:
- If `state.type === "completed"` → Trigger GitHub PR check (if exists, mark as completed)
- If `assignee` changed → Update GitHub PR assignee
- Log SyncEvent

### Comment Created

**Event**: `Comment`

**Payload**:
```json
{
  "action": "create",
  "type": "Comment",
  "data": {
    "id": "uuid",
    "body": "Comment text",
    "issue": {
      "identifier": "ABC-123"
    },
    "user": { "name": "..." },
    "createdAt": "..."
  }
}
```

**Action**: Post comment to GitHub PR (if linked)

---

## Webhook Signature Validation

**Method**: HMAC SHA256

```typescript
import crypto from 'crypto';

function validateLinearWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hmac)
  );
}

// Express middleware
app.post('/webhooks/linear', (req, res) => {
  const signature = req.headers['linear-signature'];
  const payload = JSON.stringify(req.body);

  if (!validateLinearWebhook(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook...
});
```

---

## Error Handling

### Common Errors

| Error | HTTP Status | Retry? | Action |
|-------|-------------|--------|--------|
| Invalid API key | 401 | ❌ | Fail fast, log error |
| Rate limit exceeded | 429 | ✅ | Exponential backoff |
| Issue not found | 404 | ❌ | Log warning, skip |
| Invalid input | 400 | ❌ | Log validation error |
| Server error | 500 | ✅ | Retry with backoff |

### GraphQL Error Format

```json
{
  "errors": [
    {
      "message": "Rate limit exceeded",
      "extensions": {
        "code": "RATE_LIMITED"
      }
    }
  ]
}
```

---

## Testing Strategy

### Unit Tests (with mocks)

```typescript
import { LinearClient } from '@linear/sdk';
import { vi } from 'vitest';

vi.mock('@linear/sdk');

test('creates Linear issue from task', async () => {
  const mockClient = {
    issueCreate: vi.fn().mockResolvedValue({
      success: true,
      issue: Promise.resolve({
        id: 'uuid',
        identifier: 'ABC-123',
        url: 'https://linear.app/...'
      })
    })
  };

  // Test implementation...
});
```

### Integration Tests (with sandbox account)

**Setup**: Create Linear workspace for testing

**Test Cases**:
1. Create issue → Verify in Linear UI
2. Update issue → Verify changes reflected
3. Rate limit → Verify retry logic
4. Invalid token → Verify error handling

---

## Contract Validation Checklist

- ✅ All required scopes documented
- ✅ Rate limit handling specified (max 3 retries)
- ✅ Webhook signature validation implemented
- ✅ Error handling covers all HTTP status codes
- ✅ GraphQL query/mutation types match @linear/sdk
- ✅ Testing strategy includes both mocks and real API

**Next**: Define GitHub API contract
