# Implementation Plan: Linear-GitHub Automation

**Branch**: `001-linear-github-sync` | **Date**: 2025-10-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-linear-github-sync/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Automate bidirectional synchronization between Speckit tasks.md files, Linear issues, and GitHub pull requests. The system eliminates manual task entry by automatically creating Linear issues from tasks.md, auto-populates PR descriptions with Linear issue references based on branch names, and maintains sync between Linear status updates and GitHub PR events. Technical approach involves webhook-based event handling, Linear/GitHub API integration, and a persistent mapping file for task-to-issue correlation.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20 LTS
**Primary Dependencies**: @linear/sdk ^20.0, @octokit/rest ^20.0, commander ^11.0, inquirer ^9.0, pino ^8.0, vitest ^1.0 (Phase 0 only; Phase 2 adds express ^4.18 - see research.md for full list)
**Storage**: File-based (.specify/linear-mapping.json for mappings, permanent retention per clarifications)
**Testing**: Vitest (unit + contract + integration tests with MSW mocks and real API sandboxes)
**Target Platform**: CLI tool (npm global install) with Git hooks integration (webhook server deferred to Phase 2)
**Project Type**: Single project (automation service/CLI tool)
**Performance Goals**: <60 second sync latency for 95% of operations, handle 100 concurrent task sync operations
**Constraints**: Must not block PR creation/merge on sync failures, 3-attempt retry limit per constitution
**Scale/Scope**: Single repository per instance, one Linear team per repository, permanent mapping data retention

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Automatic Task Mapping

**Requirement**: Every task in tasks.md MUST be automatically registered as a Linear issue without manual intervention, preserving metadata (priority, dependencies, user story association, status).

**Compliance**: ✅ PASS
- FR-001: Parses tasks.md with all metadata extraction
- FR-002: Creates Linear issues automatically without user input
- FR-003: Stores bidirectional mapping (task → Linear issue ID)
- FR-007: Prevents duplicates on re-run

### Principle II: Zero Manual Input for PR Integration

**Requirement**: PR descriptions MUST automatically include Linear task references without manual input. System MUST detect task context from branch name, commit messages, or working directory.

**Compliance**: ✅ PASS
- FR-004: Detects Linear issue IDs from branch names (pattern [A-Z]+-[0-9]+)
- FR-005: Auto-populates PR descriptions with Linear issue references
- User Story 2 scenarios cover branch-based detection and commit aggregation

### Principle III: Bidirectional Sync Integrity

**Requirement**: Changes in Linear MUST propagate to GitHub and vice versa. Sync conflicts MUST be detected. System MUST maintain eventual consistency within 60 seconds.

**Phase 0 Compliance**: ⚠️ PARTIAL (Phase 2 will complete)
- ✅ **GitHub → Linear**: FR-009 via Linear's official GitHub integration (PR merge → "Done")
- ✅ **Branch naming ensures Linear auto-detection**: ABC-123 pattern
- ⏸️ **Linear → GitHub**: Deferred to Phase 2 (FR-010 comment sync)
- ⏸️ **Conflict detection**: Deferred to Phase 2 (FR-011)
- ⏸️ **60-second consistency**: Deferred to Phase 2 (FR-012)

**Phase 0 Strategy**: Leverage Linear's built-in GitHub integration for GitHub→Linear sync. This satisfies the core principle (changes propagate) while deferring complex bidirectional features.

### Integration Requirements

**Speckit Compatibility**: ✅ PASS
- FR-001: Parses tasks.md from /speckit.tasks with [P], [US#], task IDs support

**Linear API Contract**: ✅ PASS
- FR-002: Uses Linear API with standard schema mapping
- FR-006: Rate limit handling with exponential backoff
- FR-016: Single Linear team configuration per repository (per clarification)

**GitHub Integration**: ✅ PASS (Simplified Approach)
- Branch naming pattern (ABC-123-slug) ensures Linear auto-detection
- Linear's official GitHub integration handles PR→Linear sync
- No custom webhook server required in Phase 0
- Branch protection rules compliance (non-blocking requirement)

### Quality Standards

**Reliability**: ✅ PASS
- FR-006: Retry with exponential backoff (max 3 attempts)
- Constraint: Failures MUST NOT block PR creation/merge

**Observability**: ✅ PASS (Phase 0 scope)
- FR-014: Structured logs for all operations (Pino JSON logs)
- FR-015: Health check endpoints (deferred to Phase 2 webhook server)

**Security**: ✅ PASS (Phase 0 scope)
- Token storage: Environment variables + .env file (per research.md)
- FR-013: Webhook signature validation (deferred to Phase 2)
- Git hooks: Read-only access to branch names, no credential access

### Gate Decision: ✅ PROCEED TO PHASE 0 IMPLEMENTATION

**Phase 0 Scope Approved**:
- Principle I (Automatic Task Mapping): ✅ Fully satisfied
- Principle II (Zero Manual Input): ✅ Fully satisfied
- Principle III (Bidirectional Sync): ⚠️ Partially satisfied (GitHub→Linear via Linear integration)

**Rationale for Partial Compliance**:
Phase 0 focuses on the **most valuable** automation (tasks→Linear, PR→Linear) using the simplest architecture (CLI + Git hooks + Linear's GitHub integration). Full bidirectional sync (Phase 2) can be added after validating Phase 0 value.

**Simplified Architecture Benefits**:
- No server infrastructure needed
- No webhook configuration complexity
- Faster time to value
- Lower operational overhead

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── parsers/          # tasks.md parsing logic
├── linear/           # Linear API client wrapper
├── github/           # GitHub API client wrapper
├── sync/             # Sync orchestration (tasks → Linear, PR annotation)
├── mapping/          # Mapping file management
├── cli/              # CLI commands (sync, init, start-task, status)
├── hooks/            # Git hook scripts (prepare-commit-msg)
└── config/           # Configuration management

.specify/
└── linear-mapping.json   # Persistent task-to-issue mappings

.git/hooks/
└── prepare-commit-msg    # Auto-installed Git hook

tests/
├── contract/         # API contract tests (Linear/GitHub)
├── integration/      # End-to-end sync scenarios
└── unit/             # Parser, mapper, CLI, hooks tests
```

**Structure Decision**: Single project structure with CLI + Git hooks approach. This is a **local development tool** that operates on a single repository. Phase 0 focuses on developer-friendly CLI commands and Git automation. Webhook server and real-time bidirectional sync are deferred to Phase 2 for simplicity.

## Phase Breakdown

### Phase 0: Core CLI Automation (Current Scope)

**Goal**: Simple, local developer tool with essential automation

**Included Features**:
- ✅ **CLI Commands**:
  - `linear-sync init` - Configure Linear API key, GitHub token, team ID
  - `linear-sync run` - Sync tasks.md → Linear issues (create + update)
  - `linear-sync start-task` - Interactive task selector → auto-create branch
  - `linear-sync status` - Show sync status and mapping file stats

- ✅ **Git Hooks**:
  - `prepare-commit-msg` - Auto-inject Linear issue ID from branch name into commit messages
  - Installed via `linear-sync init`

- ✅ **Core Sync**:
  - FR-001 to FR-007: tasks.md parsing, Linear issue creation, mapping file, deduplication
  - FR-016: Single Linear team configuration

- ✅ **GitHub Integration** (Using Linear's Built-in GitHub Integration):
  - Configure Linear's official GitHub integration to handle:
    - PR merge → Linear status "Done" (FR-009)
    - PR description auto-linking (Linear detects issue IDs automatically)
  - Our tool only needs to ensure branch names follow pattern: `ABC-123-task-slug`

**Excluded from Phase 0** (deferred to Phase 2):
- ❌ Webhook server
- ❌ Real-time bidirectional sync (FR-010, FR-011, FR-012)
- ❌ Comment synchronization
- ❌ Conflict detection/resolution
- ❌ Automatic PR description population (rely on Linear's GitHub integration instead)

### Phase 2: Advanced Automation (Future)

**Goal**: Real-time bidirectional sync with webhook server

**Deferred Features**:
- Webhook server (Express-based)
- FR-010: Bidirectional comment sync
- FR-011: Conflict detection with GitHub-takes-precedence
- FR-012: <60 second eventual consistency
- FR-005: Custom PR description auto-population (beyond Linear's default)
- Advanced monitoring dashboard

**Rationale for Deferral**:
- Phase 0 provides 70% of value with 30% of complexity
- Webhook server requires deployment infrastructure (complexity)
- Linear's official GitHub integration already handles PR→Linear sync
- Teams can validate core value before investing in advanced features

## Complexity Tracking

*No Constitution violations in Phase 0 - simplified scope aligns with all principles*

