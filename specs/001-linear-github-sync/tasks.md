# Tasks: Linear-GitHub Automation

**Input**: Design documents from `/specs/001-linear-github-sync/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure with src/, tests/, and .specify/ directories
- [X] T002 Initialize TypeScript project with Node.js 20 LTS and configure tsconfig.json
- [X] T003 [P] Install core dependencies (@linear/sdk ^20.0, @octokit/rest ^20.0, commander ^11.0, inquirer ^9.0, pino ^8.0, vitest ^1.0)
- [X] T004 [P] Configure ESLint and Prettier for TypeScript code formatting
- [X] T005 [P] Setup Vitest configuration in vitest.config.ts
- [X] T006 [P] Create package.json with CLI bin entry for global installation
- [X] T007 Create .env.example file with required environment variables (LINEAR_API_KEY, LINEAR_TEAM_ID)
- [X] T008 [P] Setup Git hooks directory structure and scripts in src/hooks/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Create configuration management module in src/config/index.ts (loads environment variables)
- [X] T010 [P] Implement structured logging with Pino in src/lib/logger.ts (JSON format with redaction)
- [X] T011 [P] Create retry logic with exponential backoff in src/lib/retry.ts (max 3 attempts per constitution)
- [X] T012 [P] Implement Linear API client wrapper in src/linear/client.ts (authentication, error handling)
- [X] T013 [P] Implement branch name validator in src/github/branch-validator.ts (pattern: [A-Z]+-[0-9]+-[\w-]+)
- [X] T014 [P] Create mapping file manager in src/mapping/manager.ts (read/write .specify/linear-mapping.json)
- [X] T015 Create TypeScript types for Task, TaskMapping, LinearIssue, PullRequest entities in src/types/index.ts
- [X] T016 [P] Setup error handling utilities in src/lib/errors.ts (custom error classes)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Automatic Task Registration (Priority: P1) 🎯 MVP

**Goal**: Automatically create Linear issues from tasks.md without manual intervention, preserving metadata (priority, dependencies, user story tags)

**Independent Test**: Run sync command on a tasks.md file and verify all tasks appear as Linear issues with correct metadata (title, description, labels, dependencies)

### Implementation for User Story 1

- [X] T017 [P] [US1] Implement tasks.md parser in src/parsers/tasks-parser.ts (extract task ID, title, description, metadata)
- [X] T018 [P] [US1] Create task metadata extractor in src/parsers/metadata-extractor.ts (parse [P], [US#], phase tags)
- [X] T019 [US1] Implement dependency parser in src/parsers/dependency-parser.ts (extract task dependencies from descriptions)
- [X] T020 [P] [US1] Create Linear label manager in src/linear/label-manager.ts (create/find labels for user stories, phases, priority)
- [X] T021 [US1] Implement Linear issue creator in src/linear/issue-creator.ts (format description, create issue, handle labels)
- [X] T022 [US1] Build sync orchestrator in src/sync/orchestrator.ts (task → Linear sync flow, deduplication via mapping file)
- [X] T023 [US1] Implement duplicate detection in src/sync/dedup.ts (check mapping file, prompt user on conflicts)
- [X] T024 [US1] Create branch name generator in src/sync/branch-generator.ts (generate ABC-123-task-slug format)
- [X] T025 [US1] Implement CLI init command in src/cli/commands/init.ts (configure tokens, team ID, install Git hooks)
- [X] T026 [US1] Implement CLI run command in src/cli/commands/run.ts (trigger sync orchestrator, show progress)
- [X] T027 [US1] Implement CLI status command in src/cli/commands/status.ts (show mapping stats, API connection status)
- [X] T028 [US1] Create main CLI entry point in src/cli/index.ts (commander setup with all commands)
- [X] T029 [US1] Add sync event logging throughout sync operations (log all create/update/skip operations with structured data)

**Checkpoint**: At this point, User Story 1 should be fully functional - tasks.md can sync to Linear with full metadata preservation

---

## Phase 4: User Story 2 - Zero-Input PR Integration (Priority: P1) 🎯 MVP

**Goal**: PR descriptions automatically include Linear issue references when branch names follow pattern, with commit message automation via Git hooks

**Independent Test**: Create a PR from a feature branch and verify the PR description contains the correct Linear issue reference in a format that Linear auto-detects and links

### Implementation for User Story 2

- [X] T030 [P] [US2] Create prepare-commit-msg Git hook script in src/hooks/prepare-commit-msg.sh (auto-inject Linear ID from branch name)
- [X] T031 [P] [US2] Implement Git hook installer in src/cli/commands/init.ts (copy hook to .git/hooks/, set executable permissions)
- [X] T032 [P] [US2] Create interactive task selector in src/cli/commands/start-task.ts (inquirer-based selection from mapping file)
- [X] T033 [US2] Implement branch creation logic in src/cli/commands/start-task.ts (git checkout with Linear issue ID pattern)
- [X] T034 [US2] Add branch validation checks in src/cli/commands/start-task.ts (verify branch name follows pattern, handle existing branches)
- [X] T035 [US2] Create issue ID extractor utility in src/github/issue-extractor.ts (extract from branch names and commit messages)
- [X] T036 [US2] Update CLI status command to show Git hooks installation status

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - developers can sync tasks, start tasks with auto-created branches, and commits auto-include Linear IDs

---

## Phase 5: User Story 3 - Bidirectional Status Sync (Priority: P2)

**Goal**: PR merges automatically transition Linear issues to "Done" status via Linear's GitHub Integration, with future comment sync capability

**Independent Test**: Merge a PR and check Linear issue status changes to "Done"; update a Linear issue and verify GitHub PR reflects updates (Phase 2 feature)

**Note**: Phase 0 leverages Linear's official GitHub Integration for PR merge → Linear "Done" sync. Custom bidirectional sync (Linear → GitHub) is deferred to Phase 2.

### Implementation for User Story 3

- [ ] T037 [P] [US3] Document Linear GitHub Integration setup in quickstart.md (configuration steps, verification)
- [ ] T038 [P] [US3] Add Linear integration validation to CLI init command (verify integration is configured)
- [ ] T039 [P] [US3] Create branch naming validation in CLI start-task command (enforce pattern for Linear auto-detection)
- [ ] T040 [US3] Add Linear issue URL display in CLI start-task output (guide developers to configure integration)
- [ ] T041 [US3] Update CLI status command to show Linear GitHub Integration configuration status
- [ ] T042 [US3] Add logging for Linear status change detection (Phase 2 preparation - webhook event handling structure)

**Checkpoint**: All user stories should now be independently functional - complete automation from tasks.md → Linear → GitHub with PR merge triggering Linear status updates via Linear's integration

---

## Phase 6: Testing & Validation

**Purpose**: Comprehensive testing across all user stories

### Unit Tests

- [ ] T043 [P] Write unit tests for tasks.md parser in tests/unit/parsers/tasks-parser.test.ts (validate parsing logic)
- [ ] T044 [P] Write unit tests for metadata extractor in tests/unit/parsers/metadata-extractor.test.ts (test [P], [US#] extraction)
- [ ] T045 [P] Write unit tests for branch name validator in tests/unit/github/branch-validator.test.ts (pattern matching)
- [ ] T046 [P] Write unit tests for mapping file manager in tests/unit/mapping/manager.test.ts (CRUD operations)
- [ ] T047 [P] Write unit tests for retry logic in tests/unit/lib/retry.test.ts (exponential backoff, max attempts)
- [ ] T048 [P] Write unit tests for duplicate detection in tests/unit/sync/dedup.test.ts (mapping file checks)
- [ ] T049 [P] Write unit tests for branch name generator in tests/unit/sync/branch-generator.test.ts (slug generation)
- [ ] T050 [P] Write unit tests for issue ID extractor in tests/unit/github/issue-extractor.test.ts (extraction from various formats)

### Contract Tests

- [ ] T051 [P] Write Linear API contract tests in tests/contract/linear-api.test.ts (issue creation, label management with MSW mocks)
- [ ] T052 [P] Write GitHub branch validation contract tests in tests/contract/github-branch.test.ts (pattern validation edge cases)
- [ ] T053 [P] Write mapping file contract tests in tests/contract/mapping-file.test.ts (JSON schema validation)

### Integration Tests

- [ ] T054 Write end-to-end sync test in tests/integration/sync-e2e.test.ts (tasks.md → Linear with real/sandbox API)
- [ ] T055 Write Git hook integration test in tests/integration/git-hooks.test.ts (commit message automation)
- [ ] T056 Write CLI workflow test in tests/integration/cli-workflow.test.ts (init → run → start-task → status sequence)
- [ ] T057 Write deduplication integration test in tests/integration/dedup.test.ts (re-running sync prevents duplicates)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Production readiness and documentation

- [ ] T058 [P] Create comprehensive README.md with installation instructions and quick start guide
- [ ] T059 [P] Add inline code documentation (JSDoc) for all public functions
- [ ] T060 [P] Create CONTRIBUTING.md with development setup and testing guidelines
- [ ] T061 [P] Add error messages with actionable guidance throughout CLI commands
- [ ] T062 [P] Implement graceful error handling for network failures (non-blocking per constitution)
- [ ] T063 Create example tasks.md file in examples/sample-tasks.md for testing
- [ ] T064 [P] Add version command to CLI in src/cli/commands/version.ts
- [ ] T065 Setup CI/CD pipeline configuration (GitHub Actions for test automation)
- [ ] T066 Run quickstart.md validation with real Linear workspace and GitHub repository
- [ ] T067 Performance testing for 100 concurrent task sync operations (per FR-005 requirement)
- [ ] T068 Security audit (token redaction in logs, environment variable validation)
- [ ] T069 Create troubleshooting guide in docs/troubleshooting.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
- **Testing (Phase 6)**: Depends on corresponding user story implementation
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 for mapping file structure but can run in parallel
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Leverages Linear's GitHub Integration, minimal code dependencies

### Within Each User Story

- **User Story 1**: Parser → Linear client wrapper → Sync orchestrator → CLI commands
- **User Story 2**: Git hook scripts → CLI start-task command → Branch validation
- **User Story 3**: Documentation → Integration validation → CLI status updates

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (6 tasks)
- All Foundational tasks marked [P] can run in parallel within Phase 2 (7 tasks)
- Once Foundational phase completes, User Stories 1, 2, and 3 can start in parallel
- Within User Story 1: T017, T018, T020 (parser, metadata extractor, label manager) can run in parallel
- Within User Story 2: T030, T031, T032 (hook script, installer, task selector) can run in parallel
- Within User Story 3: T037, T038, T039 (documentation, validation, naming checks) can run in parallel
- All unit tests marked [P] can run in parallel (8 tasks)
- All contract tests marked [P] can run in parallel (3 tasks)
- All polish tasks marked [P] can run in parallel (9 tasks)

---

## Parallel Execution Examples

### Foundational Phase (After Setup)
```bash
# Launch in parallel:
Task T010: Implement structured logging with Pino in src/lib/logger.ts
Task T011: Create retry logic with exponential backoff in src/lib/retry.ts
Task T012: Implement Linear API client wrapper in src/linear/client.ts
Task T013: Implement branch name validator in src/github/branch-validator.ts
Task T014: Create mapping file manager in src/mapping/manager.ts
Task T016: Setup error handling utilities in src/lib/errors.ts
```

### User Story 1 - Initial Tasks
```bash
# Launch in parallel:
Task T017: Implement tasks.md parser in src/parsers/tasks-parser.ts
Task T018: Create task metadata extractor in src/parsers/metadata-extractor.ts
Task T020: Create Linear label manager in src/linear/label-manager.ts
```

### User Story 2 - Initial Tasks
```bash
# Launch in parallel:
Task T030: Create prepare-commit-msg Git hook script in src/hooks/prepare-commit-msg.sh
Task T031: Implement Git hook installer in src/cli/commands/init.ts
Task T032: Create interactive task selector in src/cli/commands/start-task.ts
```

### Testing Phase - Unit Tests
```bash
# Launch all unit tests in parallel:
Task T043: Write unit tests for tasks.md parser
Task T044: Write unit tests for metadata extractor
Task T045: Write unit tests for branch name validator
Task T046: Write unit tests for mapping file manager
Task T047: Write unit tests for retry logic
Task T048: Write unit tests for duplicate detection
Task T049: Write unit tests for branch name generator
Task T050: Write unit tests for issue ID extractor
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T016) - CRITICAL blocker
3. Complete Phase 3: User Story 1 (T017-T029)
4. Complete Phase 4: User Story 2 (T030-T036)
5. **STOP and VALIDATE**: Test core sync and Git hook automation
6. Run integration tests (T054-T056)
7. Deploy/demo if ready

### Incremental Delivery

1. **Foundation** (Phases 1-2): Setup + Foundational → Infrastructure ready
2. **MVP Release** (Phase 3-4): User Stories 1 & 2 → Core automation complete
   - Tasks sync to Linear automatically
   - Developers can start tasks with auto-created branches
   - Commits auto-include Linear issue IDs
   - Test independently → Deploy/Demo
3. **Enhanced Release** (Phase 5): User Story 3 → Bidirectional sync via Linear integration
   - PR merges auto-update Linear status
   - Test independently → Deploy/Demo
4. **Production Release** (Phases 6-7): Testing + Polish → Production ready
   - Comprehensive test coverage
   - Documentation complete
   - CI/CD pipeline active

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (Phases 1-2)
2. **Once Foundational is done**:
   - Developer A: User Story 1 (tasks → Linear sync)
   - Developer B: User Story 2 (Git hooks + CLI)
   - Developer C: User Story 3 (integration setup)
3. **Stories complete and integrate independently**
4. **All developers**: Testing phase (can split unit/contract/integration tests)

---

## Notes

- **[P] tasks**: Different files, no dependencies - safe to run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Each user story**: Independently completable and testable
- **Phase 0 scope**: User Stories 1, 2, and 3 (Phase 2 webhook server deferred)
- **Linear GitHub Integration**: Used for PR merge → Linear "Done" sync (no custom code needed)
- **Constitution compliance**: Max 3 retries, non-blocking failures, structured logging, single Linear team
- **Test strategy**: Unit (mocks) → Contract (API schemas) → Integration (real/sandbox APIs)
- **Commit often**: After each task or logical group
- **Stop at checkpoints**: Validate each story independently before proceeding
- **Avoid**: Vague tasks, same file conflicts, unnecessary cross-story dependencies

---

## Success Metrics (from spec.md)

- ✅ **SC-001**: 100% of tasks in tasks.md automatically registered as Linear issues (User Story 1)
- ✅ **SC-002**: Zero manual input for PR-Linear linking via branch naming (User Story 2)
- ✅ **SC-003**: <60 second sync latency for 95% of operations (Performance test T067)
- ✅ **SC-004**: 95% automatic retry success rate (Retry logic T011)
- ✅ **SC-005**: Handle 100 concurrent operations (Performance test T067)
- ✅ **SC-006**: Save 5+ minutes per PR (automation elimination)
- ✅ **SC-007**: 100% audit trail via structured logging (T010, T029)
- ✅ **SC-008**: GitHub-takes-precedence conflict resolution (Phase 2 - deferred)
