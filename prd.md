# 아래 내용과 같이 Linear, Github, Speckit 자동화 프로그램을 만들거야

1️⃣ Linear 이슈 ID를 저장하는 매핑 파일 생성
typescript// sync-to-linear.ts (개선 버전)
import { LinearClient } from '@linear/sdk';
import * as fs from 'fs';
import * as path from 'path';

interface TaskMapping {
  taskTitle: string;
  linearIssueId: string;      // ABC-123
  linearIssueUrl: string;
  branchName: string;
}

async function sync() {
  const client = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });
  const content = fs.readFileSync('.specify/specs/[feature]/tasks.md', 'utf-8');
  const tasks = parseTasksFromMarkdown(content);
  
  const teams = await client.teams();
  const teamId = teams.nodes[0].id;
  
  const mappings: TaskMapping[] = [];
  
  for (const task of tasks) {
    const issuePayload = await client.issueCreate({
      teamId,
      title: task.title,
      description: task.description
    });
    
    if (issuePayload.success && issuePayload.issue) {
      const issue = issuePayload.issue;
      
      // ✨ 매핑 정보 저장
      mappings.push({
        taskTitle: task.title,
        linearIssueId: issue.identifier,  // ABC-123
        linearIssueUrl: issue.url,
        branchName: `${issue.identifier}-${slugify(task.title)}`
      });
      
      console.log(`✅ Created: ${issue.identifier} - ${task.title}`);
    }
  }
  
  // 매핑 파일 저장
  fs.writeFileSync(
    '.specify/linear-mapping.json',
    JSON.stringify(mappings, null, 2)
  );
  
  console.log('\n📝 Mapping saved to .specify/linear-mapping.json');
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}
생성되는 파일 예시:
json// .specify/linear-mapping.json
[
  {
    "taskTitle": "Implement user authentication API",
    "linearIssueId": "ABC-123",
    "linearIssueUrl": "https://linear.app/team/issue/ABC-123",
    "branchName": "ABC-123-implement-user-authentication-api"
  },
  {
    "taskTitle": "Add login endpoint",
    "linearIssueId": "ABC-124",
    "linearIssueUrl": "https://linear.app/team/issue/ABC-124",
    "branchName": "ABC-124-add-login-endpoint"
  }
]

2️⃣ Git Commit Template 설정
bash# .specify/scripts/bash/setup-git-template.sh
#!/bin/bash

# Git commit template 생성
cat > .git/.gitmessage << 'EOF'
# Linear Issue ID will be auto-inserted here

# Please enter the commit message for your changes.
# Lines starting with '#' will be ignored.
EOF

git config commit.template .git/.gitmessage
echo "✅ Git commit template configured"

3️⃣ Git Prepare-Commit-Msg Hook (핵심!)
bash# .git/hooks/prepare-commit-msg
#!/bin/bash

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

# Merge commit이나 기타 자동 커밋은 스킵
if [ "$COMMIT_SOURCE" = "merge" ] || [ "$COMMIT_SOURCE" = "squash" ]; then
  exit 0
fi

# 현재 브랜치명 가져오기
BRANCH_NAME=$(git symbolic-ref --short HEAD 2>/dev/null)

# 브랜치명에서 Linear 이슈 ID 추출 (ABC-123 패턴)
ISSUE_ID=$(echo "$BRANCH_NAME" | grep -oE '[A-Z]+-[0-9]+' | head -1)

if [ -n "$ISSUE_ID" ]; then
  # 기존 커밋 메시지 읽기
  ORIGINAL_MSG=$(cat "$COMMIT_MSG_FILE")
  
  # 이미 이슈 ID가 포함되어 있지 않다면 추가
  if ! echo "$ORIGINAL_MSG" | grep -q "$ISSUE_ID"; then
    # 커밋 메시지 앞에 이슈 ID 추가
    echo "$ISSUE_ID: $ORIGINAL_MSG" > "$COMMIT_MSG_FILE"
  fi
fi
bash# Hook 실행 권한 부여
chmod +x .git/hooks/prepare-commit-msg

4️⃣ Claude Code 커스텀 명령어 (완전 자동화)
markdown<!-- .claude/commands/start-task.md -->
# Start Task

현재 작업할 Linear task를 선택하고 자동으로 브랜치를 생성합니다.

## 실행 과정:
1. `.specify/linear-mapping.json`에서 작업 목록 표시
2. 사용자가 작업 선택
3. 해당 이슈 ID로 브랜치 자동 생성
4. 브랜치 체크아웃
bash# .specify/scripts/bash/start-task.sh
#!/bin/bash

# 매핑 파일 확인
MAPPING_FILE=".specify/linear-mapping.json"

if [ ! -f "$MAPPING_FILE" ]; then
  echo "❌ No mapping file found. Run 'npm run sync:linear' first"
  exit 1
fi

# 작업 목록 표시
echo "📋 Available tasks:"
cat "$MAPPING_FILE" | jq -r '.[] | "\(.linearIssueId): \(.taskTitle)"' | nl

# 사용자 선택 (또는 Claude Code가 자동 선택)
echo ""
read -p "Select task number: " TASK_NUM

# 선택한 작업의 브랜치명 가져오기
BRANCH_NAME=$(cat "$MAPPING_FILE" | jq -r ".[$((TASK_NUM-1))].branchName")
ISSUE_ID=$(cat "$MAPPING_FILE" | jq -r ".[$((TASK_NUM-1))].linearIssueId")

# 브랜치 생성 및 체크아웃
git checkout -b "$BRANCH_NAME"

echo "✅ Created and switched to branch: $BRANCH_NAME"
echo "📌 Linear Issue: $ISSUE_ID"
echo ""
echo "Now you can start working. Commits will automatically include the issue ID!"

5️⃣ Claude Code 지시사항 추가
markdown<!-- .claude/instructions.md -->
# Claude Code Instructions

## Git Commit 규칙

커밋할 때는 다음 규칙을 따릅니다:

1. **항상 현재 브랜치의 Linear 이슈 ID를 자동으로 포함**
2. 커밋 메시지 형식: `{ISSUE_ID}: {간단한 설명}`
3. 예시: `ABC-123: Implement user authentication`

## 자동화된 워크플로우
```bash
# 1. Linear 동기화 (최초 1회)
npm run sync:linear

# 2. 작업 시작 (브랜치 자동 생성)
npm run start:task

# 3. 작업 및 커밋 (이슈 ID 자동 포함)
git add .
git commit -m "Implement login endpoint"
# → 자동으로 "ABC-123: Implement login endpoint"로 변환됨

# 4. Push 및 PR 생성
git push origin HEAD
gh pr create --fill
```

**중요**: 모든 커밋은 반드시 Linear 이슈가 연결된 브랜치에서 작업해야 합니다.

6️⃣ Package.json 스크립트 추가
json{
  "scripts": {
    "sync:linear": "npx ts-node sync-to-linear.ts",
    "start:task": ".specify/scripts/bash/start-task.sh",
    "commit": "git add . && git commit",
    "pr": "git push origin HEAD && gh pr create --fill"
  }
}
```

---

## 🎯 **완전 자동화된 워크플로우**

### **Claude Code에게 다음과 같이 지시:**
```
# 초기 설정 (최초 1회만)
1. Linear API key를 .env에 저장
2. npm run sync:linear 실행
3. Git hooks 설정

# 매 작업마다
1. "새로운 task를 시작하고 싶어. start:task 실행해줘"
   → Claude Code가 작업 목록을 보여주고 브랜치 자동 생성
   
2. "로그인 엔드포인트를 구현해줘"
   → Claude Code가 코드 작성
   
3. "커밋해줘"
   → Claude Code가 git commit 실행
   → prepare-commit-msg hook이 자동으로 "ABC-123:"을 앞에 추가
   
4. "PR 생성해줘"
   → Claude Code가 push하고 PR 생성
   → PR 제목에도 브랜치명에서 이슈 ID 자동 포함
   
5. PR Merge → Linear 자동으로 Done ✨

📋 설치 체크리스트
bash# 1. 의존성 설치
npm install @linear/sdk

# 2. 스크립트 파일 생성
# - sync-to-linear.ts
# - .specify/scripts/bash/start-task.sh
# - .specify/scripts/bash/setup-git-template.sh

# 3. Git hooks 설정
cp .specify/hooks/prepare-commit-msg .git/hooks/
chmod +x .git/hooks/prepare-commit-msg

# 4. Claude Code 명령어 추가
# - .claude/commands/start-task.md
# - .claude/instructions.md

# 5. 환경변수 설정
echo "LINEAR_API_KEY=your_key_here" > .env
```

---

## ✨ **이제 Claude Code가 할 일**
```
User: "ABC-123 작업 시작해줘"
Claude: ✅ 브랜치 생성 완료: ABC-123-implement-user-auth

User: "로그인 API 구현해줘"
Claude: ✅ 코드 작성 완료

User: "커밋해줘"
Claude: ✅ git commit -m "Implement login API"
        → 자동 변환: "ABC-123: Implement login API"

User: "PR 만들어줘"
Claude: ✅ PR 생성: "ABC-123: Implement user authentication"
        → Linear에 자동 링크됨