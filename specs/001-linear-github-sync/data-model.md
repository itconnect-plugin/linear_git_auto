# Data Model: Linear-GitHub Automation

**Date**: 2025-10-21
**Feature**: 001-linear-github-sync

This document defines all entities, their attributes, relationships, and validation rules extracted from the feature specification.

---

## Entity Overview

```
┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
│    Task      │────────▶│  TaskMapping     │◀────────│ LinearIssue  │
│ (tasks.md)   │         │ (mapping.json)   │         │ (Linear API) │
└──────────────┘         └──────────────────┘         └──────────────┘
                                  │
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   PullRequest    │
                         │  (GitHub API)    │
                         └──────────────────┘
                                  │
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    SyncEvent     │
                         │  (audit logs)    │
                         └──────────────────┘
```

---

## 1. Task

**Source**: Parsed from `.specify/specs/[feature]/tasks.md` (Speckit format)

**Purpose**: Represents a work item defined in the feature specification's task breakdown.

### Attributes

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string | ✅ | Task identifier from tasks.md (T001, T002, etc.) | `"T001"` |
| `title` | string | ✅ | Human-readable task description | `"Implement user authentication API"` |
| `description` | string | ❌ | Detailed task description (if present in tasks.md) | `"Create REST endpoint for login..."` |
| `userStoryTag` | string | ❌ | User story association marker | `"US1"` (from `[US1]` tag) |
| `priorityMarker` | boolean | ❌ | Parallel execution marker | `true` (from `[P]` tag) |
| `dependencies` | string[] | ❌ | List of task IDs this task depends on | `["T004", "T005"]` |
| `phase` | string | ❌ | Phase/section from tasks.md | `"Phase 2: Foundational"` |
| `status` | enum | ❌ | Checkbox status from tasks.md | `"pending" \| "in_progress" \| "completed"` |

### Validation Rules

- `id` MUST match pattern `T\d{3}` (T001-T999)
- `title` MUST NOT be empty
- `title` MUST be unique within a tasks.md file
- `userStoryTag` MUST match pattern `US\d+` if present
- `dependencies` MUST reference valid task IDs from same tasks.md

### State Transitions

```
pending ──────────────▶ in_progress ──────────────▶ completed
   │                                                      │
   └──────────────────────────────────────────────────────┘
              (tasks can be reopened)
```

### Example (JSON representation after parsing)

```json
{
  "id": "T012",
  "title": "Create User model in src/models/user.py",
  "description": null,
  "userStoryTag": "US1",
  "priorityMarker": true,
  "dependencies": ["T010", "T011"],
  "phase": "Phase 3: User Story 1",
  "status": "pending"
}
```

---

## 2. TaskMapping

**Source**: Stored in `.specify/linear-mapping.json` (persistent file)

**Purpose**: Bidirectional mapping between tasks.md entries and Linear issues. Enables duplicate prevention and sync correlation.

### Attributes

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `taskTitle` | string | ✅ | Task title from tasks.md (used as unique key) | `"Implement user authentication API"` |
| `linearIssueId` | string | ✅ | Linear issue identifier (team prefix + number) | `"ABC-123"` |
| `linearIssueUrl` | string | ✅ | Full URL to Linear issue | `"https://linear.app/team/issue/ABC-123"` |
| `branchName` | string | ✅ | Suggested git branch name | `"ABC-123-implement-user-auth"` |
| `taskId` | string | ❌ | Original task ID from tasks.md (for reference) | `"T012"` |
| `createdAt` | ISO8601 | ✅ | Timestamp when mapping was created | `"2025-10-21T10:30:00.000Z"` |
| `lastSyncedAt` | ISO8601 | ❌ | Last successful sync timestamp | `"2025-10-21T11:15:00.000Z"` |

### Validation Rules

- `taskTitle` MUST be unique within mapping file (primary key)
- `linearIssueId` MUST match pattern `[A-Z]+-[0-9]+`
- `linearIssueUrl` MUST be valid HTTPS URL
- `branchName` MUST match git branch naming conventions (lowercase, hyphens, no spaces)
- `createdAt` MUST be valid ISO8601 timestamp

### File Structure

```json
[
  {
    "taskTitle": "Implement user authentication API",
    "linearIssueId": "ABC-123",
    "linearIssueUrl": "https://linear.app/myteam/issue/ABC-123",
    "branchName": "ABC-123-implement-user-auth",
    "taskId": "T012",
    "createdAt": "2025-10-21T10:30:00.000Z",
    "lastSyncedAt": "2025-10-21T11:15:00.000Z"
  },
  {
    "taskTitle": "Add login endpoint",
    "linearIssueId": "ABC-124",
    "linearIssueUrl": "https://linear.app/myteam/issue/ABC-124",
    "branchName": "ABC-124-add-login-endpoint",
    "taskId": "T013",
    "createdAt": "2025-10-21T10:31:00.000Z"
  }
]
```

### Retention Policy

- **Permanent retention** (per clarification - no automatic deletion)
- File grows indefinitely
- Manual cleanup via CLI command (future enhancement)

---

## 3. LinearIssue

**Source**: Created/updated via Linear GraphQL API (@linear/sdk)

**Purpose**: Represents an issue in Linear workspace, synchronized from tasks.md.

### Attributes (Linear API Schema)

| Field | Type | Required | Description | Mapped From |
|-------|------|----------|-------------|-------------|
| `id` | UUID | ✅ | Linear internal ID | Auto-generated |
| `identifier` | string | ✅ | Human-readable ID (ABC-123) | Auto-generated by Linear |
| `title` | string | ✅ | Issue title | `Task.title` |
| `description` | string | ❌ | Markdown description | `Task.description` + metadata |
| `status` | object | ✅ | Issue status object | Mapped from state |
| `assignee` | object | ❌ | Assigned user | `null` initially |
| `labels` | Label[] | ❌ | Issue labels/tags | `Task.userStoryTag`, `Task.priorityMarker` |
| `teamId` | UUID | ✅ | Linear team ID | From config (FR-016) |
| `url` | string | ✅ | Issue URL | Auto-generated by Linear |
| `createdAt` | ISO8601 | ✅ | Creation timestamp | Auto-generated |
| `updatedAt` | ISO8601 | ✅ | Last update timestamp | Auto-generated |

### Label Mapping Strategy

```typescript
// tasks.md → Linear labels
Task.userStoryTag = "US1"     → Label "User Story 1"
Task.priorityMarker = true    → Label "Parallel"
Task.phase = "Phase 2: ..."   → Label "Phase 2"
Task.status = "in_progress"   → (affects status, not label)
```

### Description Format

```markdown
**Task ID**: T012
**User Story**: US1
**Phase**: Phase 3: User Story 1
**Can run in parallel**: Yes

---

[Original task description if present]

**Dependencies**:
- T010: Setup database schema
- T011: Implement authentication middleware

---
_Synced from tasks.md by Linear-GitHub Automation_
```

### State Mapping

| tasks.md Status | Linear Status |
|-----------------|---------------|
| `pending` | "Backlog" or "Todo" |
| `in_progress` | "In Progress" |
| `completed` | "Done" |
| (PR merged) | "Done" (via GitHub→Linear sync) |

---

## 4. PullRequest

**Source**: GitHub API (@octokit/rest)

**Purpose**: Represents a GitHub pull request linked to a Linear issue via branch name.

### Attributes (GitHub API Schema)

| Field | Type | Required | Description | Auto-populated? |
|-------|------|----------|-------------|-----------------|
| `number` | number | ✅ | PR number | GitHub-generated |
| `title` | string | ✅ | PR title | ✅ Auto: `${issueId}: ${taskTitle}` |
| `description` | string | ❌ | PR body (Markdown) | ✅ Auto: Linear issue link + changes |
| `head` | object | ✅ | Source branch | User-provided |
| `base` | object | ✅ | Target branch | User-provided (usually `main`) |
| `state` | enum | ✅ | `"open" \| "closed"` | GitHub-managed |
| `merged` | boolean | ✅ | Merge status | GitHub-managed |
| `assignees` | User[] | ❌ | Assigned reviewers | Synced from Linear |
| `labels` | Label[] | ❌ | PR labels | Synced from Linear labels |
| `created_at` | ISO8601 | ✅ | Creation timestamp | GitHub-generated |
| `updated_at` | ISO8601 | ✅ | Last update timestamp | GitHub-managed |

### Branch Name Pattern

**Required Format**: `{LINEAR_ISSUE_ID}-{slug}`

**Examples**:
- ✅ `ABC-123-implement-user-auth`
- ✅ `XYZ-456-fix-payment-bug`
- ❌ `feature/authentication` (no issue ID)
- ❌ `abc-123-lowercase-team-prefix` (team prefix must be uppercase)

**Regex**: `^[A-Z]+-[0-9]+-[\w-]+$`

### PR Description Template

```markdown
## Linear Issue
https://linear.app/myteam/issue/ABC-123

## Task
Implement user authentication API

## Changes
- feat: add authentication middleware (commit abc123)
- feat: implement login endpoint (commit def456)
- test: add auth integration tests (commit ghi789)

## Testing
- [x] Unit tests passing
- [x] Integration tests passing

---
_Auto-generated by Linear-GitHub Sync_
```

---

## 5. SyncEvent

**Source**: Generated during sync operations (logged via Pino)

**Purpose**: Audit trail for all automated changes (FR-014, FR-007 compliance requirement).

### Attributes

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `timestamp` | ISO8601 | ✅ | Event occurrence time | `"2025-10-21T10:30:00.000Z"` |
| `operation` | enum | ✅ | Type of sync operation | `"sync_task_to_linear"` |
| `source` | enum | ✅ | Event origin | `"tasks_md" \| "linear" \| "github"` |
| `target` | enum | ✅ | Event destination | `"linear" \| "github" \| "mapping_file"` |
| `status` | enum | ✅ | Operation result | `"success" \| "failed" \| "retrying"` |
| `entityId` | string | ❌ | Related entity identifier | `"ABC-123"` (Linear issue) or `"T012"` (task) |
| `duration` | number | ❌ | Operation duration (ms) | `1250` |
| `errorMessage` | string | ❌ | Error details if failed | `"Linear API rate limit exceeded"` |
| `retryAttempt` | number | ❌ | Retry count (1-3) | `2` |
| `metadata` | object | ❌ | Operation-specific data | `{ "taskTitle": "...", "issueId": "..." }` |

### Operation Types

| Operation | Description | Source → Target |
|-----------|-------------|-----------------|
| `sync_task_to_linear` | Create/update Linear issue from task | tasks.md → Linear |
| `sync_linear_to_github` | Update PR from Linear changes | Linear → GitHub |
| `sync_github_to_linear` | Update Linear from PR events | GitHub → Linear |
| `annotate_pr` | Auto-populate PR description | mapping file → GitHub |
| `detect_conflict` | Conflict detected | Linear + GitHub → audit |
| `resolve_conflict` | Conflict resolved (GitHub wins) | GitHub → Linear |

### Example (JSON Log)

```json
{
  "timestamp": "2025-10-21T10:30:15.250Z",
  "level": "info",
  "operation": "sync_task_to_linear",
  "source": "tasks_md",
  "target": "linear",
  "status": "success",
  "entityId": "ABC-123",
  "duration": 1250,
  "metadata": {
    "taskId": "T012",
    "taskTitle": "Implement user authentication API",
    "userStoryTag": "US1",
    "linearIssueUrl": "https://linear.app/myteam/issue/ABC-123"
  }
}
```

---

## Relationships

### 1. Task ↔ TaskMapping (1:1)

- **Cardinality**: One Task maps to one TaskMapping entry
- **Key**: `Task.title` = `TaskMapping.taskTitle` (unique constraint)
- **Lifecycle**: TaskMapping created when Task first synced to Linear

### 2. TaskMapping ↔ LinearIssue (1:1)

- **Cardinality**: One TaskMapping links to one LinearIssue
- **Key**: `TaskMapping.linearIssueId` = `LinearIssue.identifier`
- **Lifecycle**: LinearIssue created when Task first synced

### 3. LinearIssue ↔ PullRequest (1:N)

- **Cardinality**: One LinearIssue can have multiple PRs
- **Key**: `PullRequest.head.ref` (branch name) contains `LinearIssue.identifier`
- **Lifecycle**: PR auto-linked when branch name includes issue ID

### 4. SyncEvent → All Entities (N:1 references)

- **Cardinality**: Many SyncEvents reference each entity
- **Key**: `SyncEvent.entityId` may reference Task, Linear issue, or PR
- **Lifecycle**: SyncEvents never deleted (permanent audit trail)

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  User runs: /speckit.tasks → generates tasks.md                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  1. Parser reads tasks.md → creates Task objects                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. For each Task:                                                  │
│     - Check TaskMapping.json (dedup)                                │
│     - If not exists → Linear.createIssue()                          │
│     - Store TaskMapping entry                                       │
│     - Log SyncEvent                                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. Developer creates branch: ABC-123-implement-feature             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. On PR creation:                                                 │
│     - Extract issue ID from branch name                             │
│     - Lookup TaskMapping for title                                  │
│     - Auto-populate PR title & description                          │
│     - Log SyncEvent                                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. On PR merge:                                                    │
│     - GitHub webhook → sync service                                 │
│     - Update Linear issue status → "Done"                           │
│     - Log SyncEvent                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Validation Summary

| Entity | Primary Key | Unique Constraints | Foreign Keys |
|--------|-------------|-------------------|--------------|
| Task | `id` | `title` within tasks.md | None |
| TaskMapping | `taskTitle` | `linearIssueId` | None (external APIs) |
| LinearIssue | `id` (UUID) | `identifier` within team | None |
| PullRequest | `number` | None | Implicit via branch name |
| SyncEvent | `timestamp` + `operation` | None | `entityId` (soft reference) |

---

**Next**: Generate API contracts in `/contracts/` directory
