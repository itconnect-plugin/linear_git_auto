## Core Principles

### I. TDD (Test-Driven Development) - NON-NEGOTIABLE

**Required TDD Cycle:**
1. 🔴 **RED**: Write test first → Run tests (must fail)
2. 🟢 **GREEN**: Write minimal code → Run tests (must pass)
3. 🔵 **REFACTOR**: Improve code quality → Re-run tests (still pass)

**Enforcement:**
- REQUIRED: Ask "테스트를 먼저 작성할까요?" when receiving feature requests
- REQUIRED: Write tests in `tests/` directory before any implementation
- REQUIRED: Confirm test failure before writing implementation
- REQUIRED: 80%+ test coverage (핵심 로직 100%)
- FORBIDDEN: Writing implementation before tests
- FORBIDDEN: Skipping test execution between steps

**Git Integration:**
- Each TDD phase MUST have its own commit:
  - 🔴 RED: `git commit -m "🔴 RED: Add {feature} tests ({task-id})"`
  - 🟢 GREEN: `git commit -m "🟢 GREEN: Implement {feature} ({task-id})"`
  - 🔵 REFACTOR: `git commit -m "🔵 REFACTOR: Improve {aspect} ({task-id})"`

---

### II. Context Engineering

**Required Documentation Elements:**
- **Why**: 왜 이 결정을 했는가?
- **What**: 무엇을 만드는가?
- **How**: 어떻게 구현하는가?
- **Trade-offs**: 어떤 선택지가 있었고, 왜 이것을 선택했는가?

**ADR (Architecture Decision Record) Mandatory:**
- 결정 날짜, 의사결정자, 문제 상황
- 고려한 옵션들, 선택한 옵션 및 근거
- 예상되는 결과 및 부작용

---

### III. MSA Service Separation

**Service Separation Checklist:**
- [ ] 단일 비즈니스 도메인만 담당하는가?
- [ ] 독립적으로 테스트 가능한가?
- [ ] 장애가 다른 서비스에 영향 주지 않는가?
- [ ] 독립적으로 개발/배포 가능한가?

**Communication Rules:**
- 서비스 간 직접 DB 접근 금지
- API Gateway를 통한 단일 진입점
- Circuit Breaker 패턴 적용
- Database per Service (공유 DB 절대 금지)

**Synchronous Communication:**
- REST API (HTTP/HTTPS)
- gRPC (고성능 필요시)
- API Contract 필수 (OpenAPI)

**Asynchronous Communication:**
- Message Queue (RabbitMQ, Kafka)
- Event-Driven Architecture
- Eventual Consistency 허용

---

### IV. MSA Parallel Development

**Phase 1: Service Definition (Sequential)**
1. 도메인 분석 및 서비스 경계 정의
2. API Contract 작성 (OpenAPI)
3. Event Schema 정의 (비동기 통신용)
4. 공통 Data Model (DTO/VO)
5. 서비스 간 의존성 그래프

**Phase 2: Parallel Implementation**
- 각 서비스별 독립 Agent 배정
- Mock 사용으로 의존성 대기 없이 개발
- API Contract 기반 통신

**Phase 3: Integration**
- Contract Testing (Pact)
- Integration Testing
- E2E Testing
- Performance Testing

---

### V. MCP Tool Usage Policy

**Auto-Execute (No Approval):**
- **Sequential Thinking MCP**: 복잡한 문제 분석, 아키텍처 설계, 복잡한 알고리즘
- **Ref MCP**: 기술 문서 검색 (공식 문서 우선), 새로운 라이브러리 도입 전, API 사용법 확인
- **Vibe Check MCP**: 코드 검증 및 메타인지, PR 전, 주요 기능 완료 후

**Approval Required (High Cost):**
- Firecrawl MCP: "Firecrawl 사용 예정 - 예상 페이지: X개, 토큰: ~YK. 진행? (y/n)"
- Playwright MCP: "Playwright E2E 테스트 - 시나리오: X개, 예상 시간: Y분. 진행? (y/n)"
- Serena MCP: "Serena 코드 분석 - 파일 수: X개, 예상 토큰: ~YK. 진행? (y/n)"

**Notify and Execute:**
- Vitest MCP: "테스트 실행 중... (TDD Cycle)"
- Semgrep MCP: "보안 스캔 시작 (배포 전 필수)"
- Linear MCP: "이슈 업데이트 중..."
- GitHub MCP: "PR 생성 중..."

---

### VI. Code Quality Standards

**Readability:**
- 자체 설명적 코드 (변수/함수명으로 의도 표현)
- 주석 최소화 (복잡한 비즈니스 로직만)
- Prettier/ESLint 설정 준수

**Performance:**
- API 응답 3초 이내
- Bundle size 최소화
- package.json 정기 리뷰

**Security:**
- Semgrep 스캔 배포 전 필수
- npm audit 주간 실행
- 민감 정보 하드코딩 금지

**Testing:**
- 커버리지 최소 80% (핵심 로직 100%)
- Unit > Integration > E2E
- TDD 준수 (테스트 먼저)

---

### VII. Git Workflow Strategy

**Branch Structure:**
```
main (production)
├─ develop (integration)
│  ├─ service/user-service
│  │  ├─ feature/US-101-user-registration
│  │  └─ bugfix/US-103-email-validation
│  ├─ service/order-service
│  └─ service/payment-service
```

**Branch Naming:**
- Service: `service/{service-name}`
- Feature: `feature/{task-id}-{short-description}`
- Bugfix: `bugfix/{task-id}-{short-description}`
- Hotfix: `hotfix/{task-id}-{short-description}`

**Commit Convention:**
```
{emoji} {type}: {subject} ({task-id})
```
- 🔴 RED: 테스트 작성 (실패 상태)
- 🟢 GREEN: 구현 완료 (테스트 통과)
- 🔵 REFACTOR: 리팩토링
- 🐛 BUGFIX: 버그 수정
- 📝 DOCS: 문서 업데이트
- 🔧 CONFIG: 설정 변경
- 🚀 DEPLOY: 배포 관련

**Push Strategy:**
- Story 완료 시: Push feature branch
- Epic 완료 시: PR to service branch
- Service 완료 시: PR to develop

**Merge Strategy:**
- Feature → Service: Squash and merge
- Service → Develop: Merge commit
- Develop → Main: Merge commit with tag

---

### VIII. Sub-Agent Roles

**Planning Phase:**
- **Architect**: MSA 서비스 분리, API Contract, Event Schema, ADR 작성
  - 사용 MCP: Sequential Thinking, Ref
  - 검증: 각 서비스 독립 배포 가능, 서비스 간 결합도 낮음
  
- **Designer**: UI/UX 설계, 디자인 시스템, 사용성 검증
  - 검증: 3초 이내 직관적 이해, 접근성(a11y) WCAG 2.1 Level AA

**Implementation Phase (Parallel):**
- **Frontend Engineer**: 클라이언트 구현 (Vitest + React Testing Library)
  - 산출물: `*.test.tsx`, `*.tsx`, Storybook (선택)
  
- **Backend Engineer** (per service): 서비스 로직 구현 (API 테스트 먼저, 100% coverage)
  - 사용 MCP: Vitest, Semgrep, Ref
  - 산출물: API 테스트, 서비스 구현, OpenAPI 문서 자동 생성
  
- **Database Engineer** (per service): 독립 DB 설계 (Database per Service)
  - 산출물: ERD, Migration 스크립트, 인덱싱 전략, Seed 데이터
  - 검증: 쿼리 성능 < 100ms

**QA Phase:**
- **Unit Tester**: TDD Cycle 강제, 커버리지 관리
  - 강제 규칙: "테스트를 먼저 작성할까요?" 질문 의무화
  - 거부 권한: 테스트 없는 PR 거부
  - 사용 MCP: Vitest
  
- **Integration Tester**: 서비스 간 통합 (Contract Testing - Pact, API Gateway 테스트)
  - 산출물: 통합 테스트 시나리오, 서비스 간 통신 검증 리포트
  
- **Debugger**: 버그 수정 (버그 재현 테스트 먼저), 코드 리뷰
  - 사용 MCP: Vibe Check, Serena

**Support:**
- **Teacher**: 진행 상황 설명, TDD 단계 안내, 코드 리뷰
  - 출력: 현재 TDD 단계 (RED/GREEN/REFACTOR), 서비스 호출 흐름도, 코드 개선 제안
  
- **Writer**: 문서화
  - 산출물: README.md (각 서비스별), API 문서 (OpenAPI), ADR, MSA 아키텍처 다이어그램

---

### IX. Development Workflow

**Phase 1: Domain Analysis (Sequential)**
1. Sequential Thinking MCP로 도메인 분석
2. 서비스 경계 정의 (Bounded Context)
3. API Contract 작성 (OpenAPI)
4. TDD 전략 수립
5. Git 전략 수립

**Phase 2: Parallel Implementation**
- 서비스별 독립 Agent 배정
- TDD Cycle: RED (commit) → GREEN (commit) → REFACTOR (commit)
- Story 완료 → Push → PR

**Phase 3: Integration & Validation**
1. Contract Testing (Pact)
2. Integration Testing
3. E2E Testing (Playwright - 승인 후)
4. Security Scan (Semgrep)
5. Performance Testing

**Phase 4: Deployment**
1. 서비스별 문서 (README, API 문서)
2. 전체 문서 (아키텍처 다이어그램, ADR)
3. CI/CD 파이프라인

---

### X. Execution Checklists

**프로젝트 시작 전:**
- [ ] Ref MCP로 기술 스택 최신 문서 확인
- [ ] Sequential Thinking으로 도메인 분석
- [ ] 서비스 경계 정의 및 API Contract 작성
- [ ] TDD 전략 수립
- [ ] Git 전략 수립
- [ ] MSA 프로젝트 구조 생성
- [ ] Git Repository 초기화

**Task 시작 전:**
- [ ] Linear에서 Task 생성 (또는 이슈 트래커)
- [ ] Feature 브랜치 생성 (`feature/{task-id}-{description}`)
- [ ] 브랜치명 컨벤션 준수 확인
- [ ] 최신 코드 pull 완료 (`git pull origin service/{service-name}`)

**각 Task 개발 시:**
- [ ] "테스트를 먼저 작성할까요?" 질문
- [ ] 🔴 RED: 테스트 작성 및 실패 확인 → commit
- [ ] 🟢 GREEN: 최소 구현 및 통과 확인 → commit
- [ ] 🔵 REFACTOR: 코드 개선 (Vibe Check) → commit
- [ ] 🟢 GREEN: 재검증

**Story 완료 시:**
- [ ] 모든 TDD Cycle 커밋 완료
- [ ] 모든 테스트 통과 (npm test)
- [ ] 커버리지 80% 이상
- [ ] Vibe Check 통과
- [ ] Semgrep 스캔 통과 (Critical 0건)
- [ ] 문서 업데이트 완료
- [ ] Push → PR 생성 → Linear 이슈 업데이트

**Epic 완료 시:**
- [ ] 모든 Story 머지 완료
- [ ] 서비스 브랜치 통합 테스트 통과
- [ ] PR 생성 (service → develop)
- [ ] Epic 단위 PR 작성 (완료 기능 목록 포함)
- [ ] Architect Agent 최종 승인
- [ ] Linear Epic 완료 처리

**통합 테스트 시:**
- [ ] Contract Testing 통과 (Pact)
- [ ] Integration Testing 통과 (서비스 간 통신)
- [ ] E2E Testing 통과 (Playwright - 승인 후)
- [ ] Semgrep 보안 스캔 통과
- [ ] 성능 목표 달성 (API 응답 < 3초)
- [ ] 테스트 커버리지 80% 이상 (전체)

**배포 전:**
- [ ] develop → main 머지
- [ ] Tag 생성 (v1.0.0)
- [ ] 모든 서비스 테스트 통과
- [ ] CI/CD 파이프라인 성공
- [ ] API 문서 업데이트
- [ ] ADR 작성
- [ ] 배포 가이드 작성
- [ ] 롤백 계획 수립

---

### XI. Forbidden Practices

**절대 금지 (Immediate Rejection):**
1. 테스트 없는 구현 코드 작성
2. TDD Cycle 생략 (RED → GREEN → REFACTOR)
3. 서비스 간 직접 데이터베이스 접근
4. 공유 데이터베이스 사용 (MSA 위반)
5. API Contract 없이 서비스 간 통신
6. 테스트 실패 상태에서 다음 단계 진행
7. Mock 없이 의존 서비스 완성 대기
8. 코드 커버리지 80% 미만 배포
9. 보안 스캔 없이 배포
10. ADR 없는 주요 기술 결정
11. 테스트 없이 Git Commit/Push
12. main 브랜치 직접 커밋 (PR 없이)
13. 공유 브랜치에 Force Push
14. 민감정보 Git 커밋 (.env, API Key 등)
15. Commit Message Convention 미준수
16. 서비스 간 직접 코드 의존성 추가

---

### XII. Success Criteria

**Technical Success:**
- ✅ 모든 서비스 독립 배포 가능
- ✅ 테스트 커버리지 ≥80% (핵심 로직 100%)
- ✅ API 응답 <3초
- ✅ 보안 스캔 Critical 0건
- ✅ Contract Testing 100% 통과

**Process Success:**
- ✅ 100% TDD 개발 (테스트 먼저)
- ✅ 병렬 개발로 50% 시간 단축
- ✅ 서비스별 독립 배포로 리스크 감소
- ✅ 명확한 문서화로 온보딩 단축
- ✅ Git History로 완전한 추적 가능

**Team Success:**
- ✅ 각 Agent 명확한 역할 수행
- ✅ Agent 간 원활한 협업
- ✅ 빠른 에스컬레이션
- ✅ 지속적 개선 (회고 및 ADR)

---

## Agent Collaboration Rules

**Clear Interfaces:**
- Agent 간 입출력 형식 사전 정의
- API Contract 기반 통신
- 변경 사항 즉시 전체 공유

**TDD Enforcement:**
- Unit Tester는 테스트 없는 코드 거부 권한
- 모든 PR은 테스트 커버리지 필수
- "테스트를 먼저 작성할까요?" 질문 생략 불가

**MSA Principles:**
- 서비스 간 직접 DB 접근 금지
- API Gateway 통신만 허용
- 독립 배포 가능해야 함

**Git Collaboration:**
- 서비스별 독립 브랜치로 충돌 방지
- shared/ 수정 시 Architect 승인 필수
- TDD Cycle 단계별 커밋 의무화
- Story 완료 시 Push, Epic 완료 시 PR

**Shared Code Management:**
- shared/ 디렉토리 수정은 별도 PR로 관리
- Architect Agent 검토 필수
- 다른 서비스 영향도 확인 후 머지
- 버전 명시 (예: `version: '1.0.0'`)

**MSA Directory Isolation (Conflict Prevention):**
```
services/
├─ user-service/      # Agent A 전담
├─ order-service/     # Agent B 전담
├─ payment-service/   # Agent C 전담
shared/               # Architect 승인 필수
docs/                 # Writer Agent 전담
```

**Progress Sharing:**
- Teacher가 모든 단계 설명
- 일일 통합 시점 전체 동기화
- 문제 발생 시 Architect에게 즉시 에스컬레이션

**Documentation First:**
- 문서화된 산출물 우선
- 코드 변경 시 문서 동시 업데이트
- ADR로 의사결정 기록
- Git Commit으로 히스토리 기록

---

## GitHub + Linear Integration Workflow

**Automated Workflow:**
1. Linear에서 Task 생성 (예: US-101)
2. Git 브랜치 생성 (`feature/US-101-user-registration`)
3. TDD Cycle로 개발 (🔴 → 🟢 → 🔵 커밋)
4. Story 완료 시 Git Push
5. **GitHub MCP**: PR 자동 생성 (feature → service)
6. **Linear MCP**: 이슈 상태 업데이트 ('In Review')
7. PR 머지 완료
8. **Linear MCP**: 이슈 완료 처리 ('Done')

**MCP Usage:**
- GitHub MCP: "PR 생성 중... (feature/US-101 → service/user-service)"
- Linear MCP: "이슈 US-101 상태를  'In Review'로 변경"
- Linear MCP: "이슈 US-101 완료 처리 ('Done')"

---

## Governance

**Amendment Procedure:**
1. Written proposal (Why, What, How)
2. Architect Agent review
3. ADR documentation
4. Version bump (Semantic Versioning)
5. Template sync
6. Agent notification

**Compliance Review:**
- All PRs verify constitution compliance
- ADR required for deviations
- Agent performance evaluated on adherence

**Constitution Supremacy:**
- Constitution supersedes all other practices
- Architect resolves interpretation disputes
- ADR documents resolutions