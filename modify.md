# 현재 plan을 분석한 결과 아래와 같이 나왔어. 수정 계획을 세워줘.

✅ 일치하는 부분
1. 자동 Task → Linear 등록
FR-001: tasks.md 파싱
FR-002: Linear 이슈 자동 생성
FR-003: 매핑 파일 저장 (.specify/linear-mapping.json)
```
✅ **완벽히 일치** - 당신이 원하던 자동 등록 기능

### 2. **브랜치명 기반 자동 감지**
```
FR-004: 브랜치명에서 Linear 이슈 ID 감지 (패턴 [A-Z]+-[0-9]+)
```
✅ **완벽히 일치** - Claude Code가 브랜치에서 자동으로 ID 추출

### 3. **PR 자동 채우기**
```
FR-005: PR 설명에 Linear 이슈 참조 자동 포함
```
✅ **일치** - PR 생성 시 수동 입력 불필요

### 4. **PR Merge → Linear Done**
```
FR-009: GitHub PR merge → Linear "Done" 자동 전환
```
✅ **완벽히 일치** - 당신이 원하던 자동화

---

## ⚠️ 주의가 필요한 부분

### 1. **Claude Code 역할이 명확하지 않음**

**Plan에 없는 것:**
- Claude Code가 커밋 시 자동으로 이슈 ID를 포함하는 방법
- Git hooks 설정
- `start-task` 같은 CLI 명령어

**Plan에 있는 것:**
```
src/cli/  # CLI commands (sync, init, status)
```

**문제점:** 
- Plan은 "sync", "init", "status" 명령만 언급
- **"start-task" (브랜치 자동 생성) 명령이 빠짐**
- **Git hooks 설정이 빠짐**

---

### 2. **Webhook Server 구조**
```
Architecture: CLI tool + optional webhook server
src/webhooks/  # Webhook handlers
```

**당신의 의도:**
- 로컬에서 Claude Code와 함께 사용
- 복잡한 서버 없이 간단하게 작동

**Plan의 방향:**
- Webhook 서버 구축 (Express 사용)
- Docker 배포 고려

**갭:** 
이건 너무 복잡할 수 있습니다. 당신은 **로컬 CLI + Git hooks**만으로도 충분할 것 같은데, Plan은 서버 기반 아키텍처를 제안하고 있습니다.

---

### 3. **양방향 동기화가 과도함**
```
FR-010: Bidirectional comment sync (Linear ↔ GitHub)
FR-011: Conflict detection
FR-012: <60초 eventual consistency
당신이 원했던 것:

Speckit → Linear (단방향)
PR merge → Linear Done (단방향)

Plan이 제안하는 것:

Linear 댓글 ↔ GitHub PR 댓글 동기화
충돌 감지 및 해결
60초 이내 일관성 보장

문제: 이건 초기 버전에 과도한 복잡도입니다. 나중에 추가해도 됩니다.

🔧 수정 제안
Phase 0: 핵심 기능만 구현 (Simple CLI 접근)
diff+ CLI Commands:
+   - npm run sync:linear      # tasks.md → Linear 생성
+   - npm run start:task        # 작업 선택 → 브랜치 자동 생성
+   
+ Git Hooks:
+   - prepare-commit-msg        # 커밋 메시지에 이슈 ID 자동 추가
+   - prepare-commit-msg.d/     # Hook 스크립트
+   
+ Linear Integration:
+   - FR-001 ~ FR-005 유지
+   - FR-009 유지 (PR merge → Done)
+   
- Webhook Server (Phase 2로 연기)
- FR-010, FR-011, FR-012 (양방향 동기화 - Phase 2로 연기)

📋 체크리스트: Plan vs 당신의 요구사항
요구사항Plan 반영상태tasks.md → Linear 자동 생성✅ FR-001, FR-002완벽매핑 파일 저장✅ FR-003완벽브랜치명에서 이슈 ID 감지✅ FR-004완벽PR 설명 자동 채우기✅ FR-005완벽PR merge → Linear Done✅ FR-009완벽start-task CLI 명령❌ 없음추가 필요Git hooks (커밋 자동화)❌ 없음추가 필요Webhook 서버⚠️ 있음 (과도함)Phase 2로 연기 권장양방향 댓글 동기화⚠️ FR-010 (과도함)Phase 2로 연기 권장

🎯 최종 평가
✅ 좋은 점:

핵심 자동화 흐름은 잘 잡혀있음 (tasks → Linear → PR → Done)
매핑 파일 구조가 명확함
에러 처리 및 재시도 로직 포함

⚠️ 문제점:

Claude Code와의 통합 방법이 누락됨 (Git hooks, CLI 명령)
초기 버전치고 너무 복잡함 (Webhook 서버, 양방향 동기화)
단순한 로컬 도구보다 서버 중심 설계


💡 추천 수정안
markdown# plan.md에 추가할 내용

## Phase 0: Core Automation (CLI + Git Hooks)

### CLI Commands
- `sync:linear` - tasks.md를 Linear로 동기화
- `start:task` - 작업 선택 및 브랜치 자동 생성
- `init` - Git hooks 및 설정 초기화

### Git Hooks
- `prepare-commit-msg` - 브랜치명에서 Linear ID 추출하여 커밋 메시지에 자동 추가

### Linear Integration
- tasks.md 파싱 및 Linear 이슈 생성
- 매핑 파일 생성 (.specify/linear-mapping.json)
- 브랜치명 규칙: {LINEAR_ID}-{task-slug}

### GitHub Integration  
- Linear GitHub Integration 설정 (공식 통합 활용)
- PR merge → Linear Done (Linear 제공 기능 사용)

## Phase 1: Advanced Features (나중에)
- Webhook 서버
- 양방향 댓글 동기화
- 실시간 상태 업데이트
```

---

## 결론

**이 Plan은 당신이 원하는 기능의 70%를 커버하지만:**
- **30%는 누락** (Claude Code 통합, Git hooks, start-task)
- **30%는 과도함** (Webhook 서버, 양방향 동기화)

**추천:**
Claude Code에게 다음과 같이 요청하세요:
```
"plan.md를 수정해줘. Phase 0에 다음을 추가:
1. start-task CLI 명령 (브랜치 자동 생성)
2. Git hooks 설정 (prepare-commit-msg)
3. Webhook 서버는 Phase 2로 연기
4. 양방향 동기화(FR-010, FR-011, FR-012)도 Phase 2로 연기

초기 버전은 로컬 CLI + Git hooks로 단순하게 시작하자."