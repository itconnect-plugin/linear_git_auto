# 설치 및 사용 가이드

## 📦 설치 방법

### Private GitHub Repository에서 설치

```bash
npm install -g git+ssh://git@github.com/itconnect-plugin/linear_git_auto.git
```

**필수 조건:**
- GitHub SSH 키가 설정되어 있어야 함
- 저장소 접근 권한 필요

### SSH 키 확인
```bash
ssh -T git@github.com
# 출력: Hi username! You've successfully authenticated...
```

---

## 🚀 빠른 시작 (Quickstart)

### 1단계: 프로젝트로 이동

```bash
cd /path/to/your-project
```

### 2단계: Quickstart 실행

```bash
linear-sync quickstart
```

### 실행 과정:

1. **처음 실행 시:**
   ```
   🚀 Linear-GitHub Sync Quickstart
   
   🔧 No global configuration found. Let's set it up!
   
   ? Enter your Linear API key: [입력]
   ? Enter your Linear Team ID: [입력]
   
   💾 Configuration saved globally (~/.linear-sync/config.json)
   ✅ Configuration ready
   
   🪝 Git commit hook installed
   ✅ Git hooks installed
   
   📄 Found tasks.md: /path/to/tasks.md
   
   🔄 Starting sync to Linear...
   ✅ Sync completed successfully!
   ```

2. **두 번째 실행부터 (다른 프로젝트):**
   ```bash
   cd /path/to/another-project
   linear-sync quickstart
   ```
   
   ```
   🚀 Linear-GitHub Sync Quickstart
   
   📋 Using existing global configuration
      Team ID: TEAM123
      API Key: lin_...****
   ✅ Configuration ready
   
   🪝 Git commit hook installed
   ✅ Git hooks installed
   
   📄 Found tasks.md: /path/to/another-project/tasks.md
   
   🔄 Starting sync to Linear...
   ✅ Sync completed successfully!
   ```
   
   **자격 증명 재입력 없음!** 저장된 설정을 자동으로 재사용합니다.

---

## 📋 다음 단계

### 작업 시작하기

```bash
linear-sync start-task
```

대화형 메뉴에서 작업을 선택하면:
- 자동으로 `LINEAR-123-task-name` 형식의 브랜치 생성
- 브랜치로 자동 체크아웃

### 커밋하기

```bash
git add .
git commit -m "Add authentication feature"
```

자동으로 다음과 같이 변환됩니다:
```
LINEAR-123: Add authentication feature
```

### 상태 확인

```bash
linear-sync status
```

현재 동기화 상태와 설정을 확인합니다.

---

## 🔄 업데이트 방법

새 버전으로 업데이트:

```bash
npm install -g git+ssh://git@github.com/itconnect-plugin/linear_git_auto.git
```

`prepare` 스크립트가 자동으로 빌드를 실행합니다.

---

## 🛠️ 고급 사용법

### tasks.md 파일 경로 직접 지정

```bash
linear-sync quickstart --file specs/001-project/tasks.md
```

### 동기화 없이 설정만 하기

```bash
linear-sync quickstart --skip-sync
```

### 수동 동기화

```bash
linear-sync run --file path/to/tasks.md
```

---

## 📁 전역 설정 위치

자격 증명은 안전하게 저장됩니다:

```
~/.linear-sync/config.json
```

**구조:**
```json
{
  "linearApiKey": "lin_api_...",
  "linearTeamId": "TEAM-ID"
}
```

**권한:** `0600` (본인만 읽기/쓰기 가능)

---

## 🔍 트러블슈팅

### 1. SSH 권한 오류

**증상:**
```
Permission denied (publickey)
```

**해결:**
```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "your_email@example.com"

# SSH 에이전트에 추가
ssh-add ~/.ssh/id_ed25519

# GitHub에 공개 키 등록
cat ~/.ssh/id_ed25519.pub
# 내용 복사 후 GitHub Settings > SSH Keys에 추가
```

### 2. tasks.md를 찾을 수 없음

**증상:**
```
⚠️  tasks.md not found
```

**해결:**
```bash
# 파일 경로 직접 지정
linear-sync quickstart --file path/to/tasks.md

# 또는 tasks.md가 있는 디렉토리로 이동
cd /path/to/project
linear-sync quickstart
```

### 3. Linear API 오류

**증상:**
```
❌ Sync failed: Invalid API key
```

**해결:**
```bash
# 전역 설정 삭제 후 재설정
rm ~/.linear-sync/config.json
linear-sync quickstart
```

### 4. Git hooks 설치 실패

**증상:**
```
⚠️  Git repository not found
```

**해결:**
```bash
# Git 저장소인지 확인
git status

# Git 저장소가 아니면 초기화
git init
```

---

## 📊 여러 프로젝트에서 사용

### 프로젝트 A
```bash
cd ~/projects/project-a
linear-sync quickstart  # 최초 1회만 자격 증명 입력
```

### 프로젝트 B
```bash
cd ~/projects/project-b
linear-sync quickstart  # 저장된 자격 증명 재사용, 입력 불필요
```

### 프로젝트 C
```bash
cd ~/projects/project-c
linear-sync quickstart  # 역시 입력 불필요
```

**각 프로젝트마다 독립적인 .specify/linear-mapping.json 파일이 생성됩니다.**

---

## 🔐 보안

- API 키는 `~/.linear-sync/config.json`에 `0600` 권한으로 저장
- Git에 커밋되지 않음 (`.gitignore`에 포함)
- 로그에서 자동으로 redaction 처리
- 프로젝트별 `.env` 파일은 생성되지 않음

---

## 💡 팁

1. **첫 설정은 한 번만:** 전역 설정을 사용하므로 한 번만 자격 증명을 입력하면 됩니다.

2. **자동 탐지:** tasks.md가 현재 또는 상위 디렉토리에 있으면 자동으로 찾아줍니다.

3. **Git hooks:** 커밋 메시지에 자동으로 Linear 이슈 ID가 추가됩니다.

4. **빠른 업데이트:** `npm install -g git+ssh://...`로 언제든 최신 버전으로 업데이트 가능합니다.

---

## 📚 명령어 참조

| 명령어 | 설명 |
|--------|------|
| `linear-sync quickstart` | 설정 + 동기화 일괄 실행 |
| `linear-sync init` | 프로젝트별 .env 설정 (대체 방법) |
| `linear-sync run` | tasks.md → Linear 동기화 |
| `linear-sync start-task` | 작업 선택 및 브랜치 생성 |
| `linear-sync status` | 현재 상태 확인 |

---

## ❓ 문제가 있나요?

이슈를 등록해주세요: https://github.com/itconnect-plugin/linear_git_auto/issues

