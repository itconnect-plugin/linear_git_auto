# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Constitution-Driven Development

**CRITICAL**: This project follows strict constitution principles defined in `/constitution.md`. All development MUST comply with these non-negotiable rules.

## Core Principle: TDD (Test-Driven Development) - NON-NEGOTIABLE

### Required TDD Cycle

Every feature MUST follow this exact sequence:

1. **🔴 RED Phase**: Write failing test first
   - Create test in `tests/` directory
   - Run tests → MUST FAIL
   - Commit: `git commit -m "🔴 RED: Add {feature} tests ({task-id})"`

2. **🟢 GREEN Phase**: Write minimal implementation
   - Write code to make test pass
   - Run tests → MUST PASS
   - Commit: `git commit -m "🟢 GREEN: Implement {feature} ({task-id})"`

3. **🔵 REFACTOR Phase**: Improve code quality
   - Refactor without changing behavior
   - Run tests → MUST STILL PASS
   - Commit: `git commit -m "🔵 REFACTOR: Improve {aspect} ({task-id})"`

### TDD Enforcement Rules

✅ **REQUIRED**:
- Ask "테스트를 먼저 작성할까요?" when receiving feature requests
- Write tests BEFORE any implementation code
- Confirm test failure before writing implementation
- Maintain 80%+ test coverage (100% for core logic)

❌ **FORBIDDEN**:
- Writing implementation before tests
- Skipping test execution between TDD phases
- Committing code without tests
- Proceeding with failed tests

## MSA (Microservices Architecture) Principles

### Service Separation Checklist

Every service MUST satisfy:
- [ ] Handles single business domain only
- [ ] Independently testable
- [ ] Failures don't affect other services
- [ ] Independently deployable

### Communication Rules

🚫 **FORBIDDEN**:
- Direct database access between services
- Shared databases (Database per Service rule)

✅ **REQUIRED**:
- API Gateway for single entry point
- Circuit Breaker pattern
- API Contract (OpenAPI) for all endpoints

**Synchronous**: REST API, gRPC (high performance needs)
**Asynchronous**: Message Queue (RabbitMQ, Kafka), Event-Driven Architecture

## Project Structure

### MSA Directory Organization

```
services/
├── user-service/      # Agent A dedicated
├── order-service/     # Agent B dedicated
├── payment-service/   # Agent C dedicated
shared/                # Architect approval required
docs/                  # Writer Agent dedicated
tests/
├── unit/              # TDD cycle tests
├── contract/          # Pact contract tests
├── integration/       # Service integration tests
└── e2e/               # Playwright E2E tests
```

### Git Branch Structure

```
main (production)
├─ develop (integration)
│  ├─ service/user-service
│  │  ├─ feature/US-101-user-registration
│  │  └─ bugfix/US-103-email-validation
│  ├─ service/order-service
│  └─ service/payment-service
```

## Commands

### Testing (Vitest)

```bash
npm test                    # Run all tests
npm test -- --coverage      # Run with coverage report
npm test -- {filename}      # Run specific test file
npm test -- --watch         # Watch mode for TDD
```

**Coverage Requirements**:
- Overall: ≥80%
- Core logic: 100%

### Code Quality

```bash
npm run lint               # ESLint check
npm run format             # Prettier format
npm audit                  # Security audit (weekly)
```

### Development

```bash
npm run dev               # Development mode with watch
npm run build             # Production build
```

### Security Scanning

```bash
# Semgrep scan (REQUIRED before deployment)
semgrep --config auto

# Must have 0 critical issues
```

## Git Workflow

### Branch Naming Convention

- Service: `service/{service-name}`
- Feature: `feature/{task-id}-{short-description}`
- Bugfix: `bugfix/{task-id}-{short-description}`
- Hotfix: `hotfix/{task-id}-{short-description}`

### Commit Message Convention

```
{emoji} {type}: {subject} ({task-id})
```

**Required Emojis**:
- 🔴 RED: Test writing (failing state)
- 🟢 GREEN: Implementation (tests passing)
- 🔵 REFACTOR: Refactoring
- 🐛 BUGFIX: Bug fix
- 📝 DOCS: Documentation update
- 🔧 CONFIG: Configuration change
- 🚀 DEPLOY: Deployment related

**Example**:
```bash
git commit -m "🔴 RED: Add user registration tests (US-101)"
git commit -m "🟢 GREEN: Implement user registration (US-101)"
git commit -m "🔵 REFACTOR: Improve validation logic (US-101)"
```

### Merge Strategy

- Feature → Service: **Squash and merge**
- Service → Develop: **Merge commit**
- Develop → Main: **Merge commit with tag**

### Push Strategy

- **Story complete**: Push feature branch
- **Epic complete**: PR to service branch
- **Service complete**: PR to develop

## Development Workflow

### Phase 1: Domain Analysis (Sequential)

1. Use Sequential Thinking MCP for domain analysis
2. Define service boundaries (Bounded Context)
3. Write API Contracts (OpenAPI)
4. Establish TDD strategy
5. Setup Git strategy

### Phase 2: Parallel Implementation

- Assign independent Agent per service
- Follow TDD Cycle: RED (commit) → GREEN (commit) → REFACTOR (commit)
- Story complete → Push → PR

### Phase 3: Integration & Validation

1. Contract Testing (Pact)
2. Integration Testing
3. E2E Testing (Playwright - requires approval)
4. Security Scan (Semgrep)
5. Performance Testing

### Phase 4: Deployment

1. Service documentation (README, API docs)
2. Overall documentation (Architecture diagrams, ADR)
3. CI/CD pipeline

## MCP Tool Usage Policy

### Auto-Execute (No Approval Required)

✅ **Sequential Thinking MCP**: Complex problem analysis, architecture design, complex algorithms
✅ **Ref MCP**: Technical documentation search, new library research, API usage verification
✅ **Vibe Check MCP**: Code validation and metacognition, before PR, after major features
✅ **Vitest MCP**: Test execution (TDD Cycle)
✅ **Linear MCP**: Issue updates
✅ **GitHub MCP**: PR creation

### Approval Required (High Cost)

⚠️ **Firecrawl MCP**: "Firecrawl 사용 예정 - 예상 페이지: X개, 토큰: ~YK. 진행? (y/n)"
⚠️ **Playwright MCP**: "Playwright E2E 테스트 - 시나리오: X개, 예상 시간: Y분. 진행? (y/n)"
⚠️ **Serena MCP**: "Serena 코드 분석 - 파일 수: X개, 예상 토큰: ~YK. 진행? (y/n)"

### Notify and Execute

💡 **Semgrep MCP**: "보안 스캔 시작 (배포 전 필수)"

## Architecture Decision Records (ADR)

**MANDATORY for all major technical decisions.**

### Required ADR Elements

- Decision date and decision makers
- Problem context
- Options considered
- Selected option with rationale
- Expected outcomes and side effects

**Location**: `docs/adr/YYYYMMDD-{decision-title}.md`

## Sub-Agent Roles

### Planning Phase

**Architect Agent**:
- MSA service separation
- API Contract writing
- Event Schema definition
- ADR creation
- MCP: Sequential Thinking, Ref
- Validation: Independent deployment possible, low service coupling

**Designer Agent**:
- UI/UX design
- Design system
- Usability validation
- Validation: 3-second intuitive understanding, WCAG 2.1 Level AA accessibility

### Implementation Phase (Parallel)

**Frontend Engineer Agent**:
- Client implementation (Vitest + React Testing Library)
- Deliverables: `*.test.tsx`, `*.tsx`, Storybook (optional)

**Backend Engineer Agent** (per service):
- Service logic implementation (API tests first, 100% coverage)
- MCP: Vitest, Semgrep, Ref
- Deliverables: API tests, service implementation, auto-generated OpenAPI docs

**Database Engineer Agent** (per service):
- Independent DB design (Database per Service)
- Deliverables: ERD, migration scripts, indexing strategy, seed data
- Validation: Query performance < 100ms

### QA Phase

**Unit Tester Agent**:
- TDD Cycle enforcement
- Coverage management
- Mandatory rule: "테스트를 먼저 작성할까요?" question required
- Rejection authority: Reject PRs without tests
- MCP: Vitest

**Integration Tester Agent**:
- Service integration (Contract Testing - Pact, API Gateway tests)
- Deliverables: Integration test scenarios, service communication validation reports

**Debugger Agent**:
- Bug fixes (bug reproduction test first)
- Code review
- MCP: Vibe Check, Serena

### Support

**Teacher Agent**:
- Progress explanation
- TDD phase guidance
- Code review
- Output: Current TDD phase (RED/GREEN/REFACTOR), service call flow diagram, code improvement suggestions

**Writer Agent**:
- Documentation
- Deliverables: README.md (per service), API documentation (OpenAPI), ADR, MSA architecture diagrams

## Execution Checklists

### Before Starting Project

- [ ] Verify latest tech stack docs with Ref MCP
- [ ] Analyze domain with Sequential Thinking
- [ ] Define service boundaries and write API Contracts
- [ ] Establish TDD strategy
- [ ] Setup Git strategy
- [ ] Create MSA project structure
- [ ] Initialize Git repository

### Before Starting Task

- [ ] Create Task in Linear (or issue tracker)
- [ ] Create feature branch (`feature/{task-id}-{description}`)
- [ ] Verify branch naming convention
- [ ] Pull latest code (`git pull origin service/{service-name}`)

### During Each Task Development

- [ ] Ask "테스트를 먼저 작성할까요?"
- [ ] 🔴 RED: Write test and verify failure → commit
- [ ] 🟢 GREEN: Minimal implementation and verify pass → commit
- [ ] 🔵 REFACTOR: Code improvement (Vibe Check) → commit
- [ ] 🟢 GREEN: Re-verify

### Story Completion

- [ ] All TDD Cycle commits complete
- [ ] All tests pass (npm test)
- [ ] Coverage ≥80%
- [ ] Vibe Check pass
- [ ] Semgrep scan pass (0 critical issues)
- [ ] Documentation updated
- [ ] Push → Create PR → Update Linear issue

### Epic Completion

- [ ] All Stories merged
- [ ] Service branch integration tests pass
- [ ] Create PR (service → develop)
- [ ] Write Epic-level PR (list completed features)
- [ ] Architect Agent final approval
- [ ] Complete Linear Epic

### Integration Testing

- [ ] Contract Testing pass (Pact)
- [ ] Integration Testing pass (inter-service communication)
- [ ] E2E Testing pass (Playwright - after approval)
- [ ] Semgrep security scan pass
- [ ] Performance goals achieved (API response < 3s)
- [ ] Test coverage ≥80% (overall)

### Before Deployment

- [ ] Merge develop → main
- [ ] Create tag (v1.0.0)
- [ ] All service tests pass
- [ ] CI/CD pipeline success
- [ ] API documentation updated
- [ ] ADR written
- [ ] Deployment guide written
- [ ] Rollback plan established

## Forbidden Practices - IMMEDIATE REJECTION

1. ❌ Writing implementation code without tests
2. ❌ Skipping TDD Cycle (RED → GREEN → REFACTOR)
3. ❌ Direct database access between services
4. ❌ Using shared databases (MSA violation)
5. ❌ Service communication without API Contract
6. ❌ Proceeding to next step with failing tests
7. ❌ Waiting for dependent service completion without Mocks
8. ❌ Deploying with <80% code coverage
9. ❌ Deploying without security scan
10. ❌ Major technical decisions without ADR
11. ❌ Git commit/push without tests
12. ❌ Direct commit to main branch (without PR)
13. ❌ Force push to shared branches
14. ❌ Committing sensitive information (.env, API keys, etc.)
15. ❌ Not following commit message convention
16. ❌ Adding direct code dependencies between services

## Success Criteria

### Technical Success

- ✅ All services independently deployable
- ✅ Test coverage ≥80% (core logic 100%)
- ✅ API response <3 seconds
- ✅ Security scan: 0 critical issues
- ✅ Contract Testing: 100% pass

### Process Success

- ✅ 100% TDD development (tests first)
- ✅ 50% time reduction through parallel development
- ✅ Risk reduction through independent service deployment
- ✅ Faster onboarding through clear documentation
- ✅ Complete traceability through Git history

### Team Success

- ✅ Each Agent performs clear role
- ✅ Smooth collaboration between Agents
- ✅ Fast escalation
- ✅ Continuous improvement (retrospective and ADR)

## Quality Standards

### Readability

- Self-explanatory code (express intent through variable/function names)
- Minimize comments (only for complex business logic)
- Follow Prettier/ESLint configuration

### Performance

- API response within 3 seconds
- Minimize bundle size
- Regular package.json review

### Security

- Semgrep scan REQUIRED before deployment
- Weekly npm audit execution
- NO hardcoded sensitive information

### Testing

- Minimum 80% coverage (100% for core logic)
- Priority: Unit > Integration > E2E
- TDD compliance (tests first)

## GitHub + Linear Integration Workflow

### Automated Workflow

1. Create Task in Linear (e.g., US-101)
2. Create Git branch (`feature/US-101-user-registration`)
3. Develop with TDD Cycle (🔴 → 🟢 → 🔵 commits)
4. Push on Story completion
5. **GitHub MCP**: Auto-create PR (feature → service)
6. **Linear MCP**: Update issue status ('In Review')
7. Complete PR merge
8. **Linear MCP**: Complete issue ('Done')

## Agent Collaboration Rules

### Clear Interfaces

- Pre-define input/output formats between Agents
- API Contract-based communication
- Immediately share all changes with entire team

### TDD Enforcement

- Unit Tester has authority to reject code without tests
- All PRs MUST have test coverage
- Cannot skip "테스트를 먼저 작성할까요?" question

### MSA Principles

- Direct DB access between services FORBIDDEN
- Only API Gateway communication allowed
- Must be independently deployable

### Git Collaboration

- Prevent conflicts with independent branches per service
- Architect approval REQUIRED for shared/ modifications
- TDD Cycle commits MANDATORY per phase
- Push on Story completion, PR on Epic completion

### Shared Code Management

- Manage shared/ directory modifications with separate PR
- Architect Agent review REQUIRED
- Verify impact on other services before merge
- Specify version (e.g., `version: '1.0.0'`)

## Governance

### Amendment Procedure

1. Written proposal (Why, What, How)
2. Architect Agent review
3. ADR documentation
4. Version bump (Semantic Versioning)
5. Template sync
6. Agent notification

### Compliance Review

- All PRs verify constitution compliance
- ADR required for deviations
- Agent performance evaluated on adherence

### Constitution Supremacy

- Constitution supersedes all other practices
- Architect resolves interpretation disputes
- ADR documents resolutions

---

**Version**: Based on constitution.md | **Last Updated**: 2025-10-21

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
