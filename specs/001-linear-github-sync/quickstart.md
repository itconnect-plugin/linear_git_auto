# Quick Start: Linear-GitHub Automation

**Feature**: 001-linear-github-sync
**Last Updated**: 2025-10-21
**Target Audience**: Developers using Speckit for feature specifications

---

## Overview

This tool automates the workflow between Speckit task files, Linear issues, and GitHub pull requests:

1. **tasks.md → Linear**: Automatically creates Linear issues from your task breakdown
2. **Branch → Commits**: Git hooks auto-add Linear issue IDs to commit messages
3. **PR → Linear**: Linear's GitHub integration auto-links PRs and updates issue status

**Phase 0 Scope**: CLI tool with Git hooks (no server required)

---

## Prerequisites

### Required

- **Node.js**: Version 20 LTS or higher
- **Git**: Version 2.30 or higher
- **Linear Account**: With API access
- **GitHub Repository**: Connected to Linear (see [Linear GitHub Integration Setup](#linear-github-integration-setup))

### Linear API Key

1. Go to Linear Settings → API → Personal API Keys
2. Click "Create new key"
3. Name: "Linear-GitHub Automation"
4. Copy the generated key (starts with `lin_api_`)

### GitHub Token (Optional for Phase 0)

Not required for Phase 0. Will be needed in Phase 2 for advanced features.

---

## Installation

### Global Installation (Recommended)

```bash
npm install -g linear-github-sync
```

### Local Installation (Per-Project)

```bash
npm install --save-dev linear-github-sync
```

---

## Initial Setup

### 1. Initialize Configuration

Run this command in your project root (where `.specify/` directory exists):

```bash
linear-sync init
```

**Interactive Prompts**:

```
? Enter your Linear API key: lin_api_***************************
? Enter your Linear team ID or key (e.g., "ABC" or team UUID): DEV
? Repository name (for config): myproject
✅ Configuration saved to .env
✅ Git hook installed: .git/hooks/prepare-commit-msg
```

**What Happens**:
- Creates `.env` file with credentials (add to `.gitignore`!)
- Installs `prepare-commit-msg` Git hook
- Validates Linear API key and team access

**Environment Variables Created**:

```bash
# .env (DO NOT COMMIT!)
LINEAR_API_KEY=lin_api_***************************
LINEAR_TEAM_ID=DEV
REPO_NAME=myproject
```

**Add to `.gitignore`**:

```bash
echo ".env" >> .gitignore
```

---

### 2. Configure Linear GitHub Integration

**Important**: This step enables automatic PR → Linear sync without running a webhook server.

#### In Linear

1. Go to **Settings → Integrations → GitHub**
2. Click **"Add GitHub Integration"**
3. Authorize Linear to access your GitHub account
4. Select repositories to connect
5. **Enable**:
   - ✅ Auto-link pull requests (detects issue IDs in branch names)
   - ✅ Auto-close issues on PR merge
   - ❌ Sync comments (Phase 2 feature)

#### Verify Integration

```bash
# 1. Create test branch
git checkout -b DEV-999-test-integration

# 2. Make a commit
echo "test" > test.txt
git add test.txt
git commit -m "test integration"
# Hook auto-changes to: "DEV-999: test integration"

# 3. Push and create PR (via GitHub UI or gh cli)
git push -u origin DEV-999-test-integration

# 4. Check Linear issue DEV-999
# → Should show "Pull Request" section with link to your PR
```

---

## First Sync: tasks.md → Linear

### 1. Generate tasks.md (if not done)

```bash
# Using Speckit
/speckit.tasks
```

**Example tasks.md**:
```markdown
# Tasks

## Phase 1: Foundation

### T001: Setup project structure
[P] [US1]
**Dependencies**: None
- [ ] Create directory structure
- [ ] Initialize package.json

### T002: Implement authentication
[US1]
**Dependencies**: T001
- [ ] Add auth middleware
- [ ] Create login endpoint
```

---

### 2. Sync to Linear

```bash
linear-sync run
```

**Output**:

```
🔍 Reading tasks from .specify/specs/001-feature/tasks.md
📊 Found 12 tasks

🔄 Syncing tasks to Linear...
✅ Created: DEV-123 - Setup project structure
✅ Created: DEV-124 - Implement authentication
✅ Created: DEV-125 - Create user model
...

📝 Mapping file updated: .specify/linear-mapping.json
✨ Sync complete: 12 tasks synced, 0 skipped (already exist)
```

**What Happens**:
- Parses tasks.md file
- Creates Linear issues for each task
- Saves mapping to `.specify/linear-mapping.json`
- Applies labels: `User Story 1`, `Parallel`, `Phase 1`, etc.
- Sets dependencies (via issue relationships in Linear)

**Duplicate Prevention**:
- Re-running `linear-sync run` won't create duplicates
- Uses task title as unique key
- Updates existing issues if task details changed

---

### 3. Verify in Linear

1. Open Linear workspace
2. Go to your team (e.g., "DEV")
3. Verify issues created with:
   - ✅ Correct titles
   - ✅ Labels: `User Story 1`, `Phase 1`, `Parallel`
   - ✅ Descriptions include task metadata

**Example Linear Issue**:

```
Title: Setup project structure
Description:
**Task ID**: T001
**User Story**: US1
**Phase**: Phase 1: Foundation
**Can run in parallel**: Yes

**Dependencies**: None

---
_Synced from tasks.md by Linear-GitHub Automation_
```

---

## Developer Workflow

### 1. Start Working on a Task

```bash
linear-sync start-task
```

**Interactive Selector**:

```
? Select a task to work on: (Use arrow keys)
❯ DEV-123: Setup project structure
  DEV-124: Implement authentication
  DEV-125: Create user model
  DEV-126: Add login endpoint
  (Move up and down to reveal more choices)

✅ Created branch: DEV-123-setup-project-structure
📌 Linear Issue: https://linear.app/myteam/issue/DEV-123

💡 Your commits will automatically include "DEV-123" prefix
```

**What Happens**:
- Shows all synced tasks from mapping file
- Creates git branch with pattern: `{ISSUE_ID}-{slug}`
- Branch name ensures Linear auto-links PRs

---

### 2. Make Commits (Auto-Linked)

```bash
# Work on your feature
echo "feature code" > feature.ts
git add feature.ts

# Commit normally (NO NEED to type issue ID)
git commit -m "Add authentication middleware"

# Hook automatically changes message to:
# "DEV-123: Add authentication middleware"
```

**Git Log Shows**:

```
$ git log --oneline
a1b2c3d DEV-123: Add authentication middleware
d4e5f6g DEV-123: Implement JWT token generation
h7i8j9k DEV-123: Add unit tests
```

---

### 3. Create Pull Request

#### Option A: GitHub CLI

```bash
gh pr create --title "DEV-123: Setup project structure" --body "Implements authentication system with JWT tokens"
```

#### Option B: GitHub UI

1. Push branch: `git push -u origin DEV-123-setup-project-structure`
2. Go to GitHub repository
3. Click "Compare & pull request"
4. Title auto-fills: `DEV-123-setup-project-structure`
5. Add description (Linear will auto-detect issue ID)

**Linear Auto-Links PR**:
- Detects `DEV-123` in branch name
- Adds "Pull Request" section to Linear issue
- Shows PR status (open, merged, closed)

---

### 4. Merge Pull Request

```bash
# Merge PR (via GitHub UI or CLI)
gh pr merge 42 --squash
```

**Linear Auto-Updates**:
- ✅ Detects PR merge via GitHub integration
- ✅ Automatically moves `DEV-123` to "Done" status
- ✅ Records merge timestamp

**No manual Linear updates needed!**

---

## CLI Command Reference

### `linear-sync init`

**Purpose**: Initial setup (run once per repository)

**Actions**:
- Creates `.env` file with Linear credentials
- Installs Git hook: `prepare-commit-msg`
- Validates Linear API access

**Example**:
```bash
linear-sync init
```

---

### `linear-sync run`

**Purpose**: Sync tasks.md to Linear issues

**Actions**:
- Parses `.specify/specs/*/tasks.md`
- Creates Linear issues (skips duplicates)
- Updates `.specify/linear-mapping.json`

**Options**:
```bash
linear-sync run                        # Sync current feature
linear-sync run --feature 001-auth     # Sync specific feature
linear-sync run --dry-run              # Preview changes without creating issues
```

**Example Output**:
```
🔄 Syncing tasks to Linear...
✅ Created: DEV-123 - Setup project structure
⏭️  Skipped: DEV-124 - Implement auth (already exists)
✅ Updated: DEV-125 - Create user model (description changed)

📝 Summary: 10 created, 2 updated, 5 skipped
```

---

### `linear-sync start-task`

**Purpose**: Interactive task selector + branch creation

**Actions**:
- Displays all synced tasks
- Creates git branch with Linear issue ID
- Switches to new branch

**Example**:
```bash
linear-sync start-task

# Select task interactively
✅ Created branch: DEV-126-add-login-endpoint
```

**Advanced**:
```bash
# Create branch without interactive selector
linear-sync start-task --issue DEV-126
```

---

### `linear-sync status`

**Purpose**: Show sync statistics and health

**Output**:
```bash
linear-sync status

📊 Linear-GitHub Sync Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Linear API: Connected (Team: DEV)
✅ Git Hooks: Installed
✅ Mapping File: 24 tasks synced

📈 Statistics:
  Total tasks: 24
  Linear issues created: 24
  Last sync: 2025-10-21 10:30:00

🔧 Configuration:
  Linear Team: DEV
  Mapping file: .specify/linear-mapping.json
  Features tracked: 3
```

---

## Troubleshooting

### Issue: "Linear API key invalid"

**Cause**: Invalid or expired API key

**Fix**:
```bash
# 1. Generate new API key in Linear Settings → API
# 2. Update .env file
LINEAR_API_KEY=lin_api_new_key_here

# 3. Test connection
linear-sync status
```

---

### Issue: "Git hook not working"

**Symptoms**: Commit messages don't include issue ID

**Fix**:
```bash
# 1. Check if hook exists
ls -la .git/hooks/prepare-commit-msg

# 2. Reinstall hook
linear-sync init

# 3. Verify hook is executable
chmod +x .git/hooks/prepare-commit-msg

# 4. Test
git commit -m "test" --allow-empty
git log -1  # Should show "DEV-123: test"
```

---

### Issue: "Linear doesn't auto-link PR"

**Cause**: Linear GitHub Integration not configured

**Fix**:
1. Verify integration in Linear Settings → Integrations → GitHub
2. Check repository is in authorized list
3. Verify branch name matches pattern: `DEV-123-feature-name`
4. Re-authorize integration if needed

---

### Issue: "Duplicate issues created"

**Cause**: Mapping file out of sync or deleted

**Fix**:
```bash
# 1. Check mapping file exists
cat .specify/linear-mapping.json

# 2. If missing, regenerate from Linear
linear-sync pull  # (Future feature)

# 3. Manual fix: Delete duplicate issues in Linear, re-sync
linear-sync run --skip-existing
```

---

### Issue: "Task not showing in start-task selector"

**Cause**: Task not synced to Linear yet

**Fix**:
```bash
# 1. Sync tasks first
linear-sync run

# 2. Verify mapping file
cat .specify/linear-mapping.json | jq '.[] | .taskTitle'

# 3. Try again
linear-sync start-task
```

---

## File Structure

```
your-project/
├── .specify/
│   ├── linear-mapping.json      # Task ↔ Linear issue mapping (permanent)
│   ├── memory/
│   │   └── constitution.md
│   └── specs/
│       └── 001-feature/
│           ├── spec.md
│           ├── plan.md
│           └── tasks.md          # Source of truth for tasks
│
├── .git/hooks/
│   └── prepare-commit-msg        # Auto-installed by linear-sync init
│
├── .env                          # Credentials (DO NOT COMMIT!)
└── .gitignore                    # Must include .env
```

---

## Best Practices

### 1. Run Sync After Task Changes

```bash
# After updating tasks.md
linear-sync run
```

**Why**: Keeps Linear issues in sync with latest task details.

---

### 2. Always Use start-task for Branches

```bash
# ✅ Good
linear-sync start-task

# ❌ Avoid
git checkout -b feature-branch  # No Linear ID → No auto-linking
```

**Why**: Ensures branch names follow Linear pattern for auto-linking.

---

### 3. Keep Mapping File in Git

```bash
git add .specify/linear-mapping.json
git commit -m "Update Linear mappings"
```

**Why**: Permanent mapping data, shared across team.

---

### 4. Don't Edit Mapping File Manually

**Why**: CLI manages this file. Manual edits may cause sync errors.

---

### 5. Use Conventional Commits

```bash
# ✅ Good (hook will add DEV-123 prefix)
git commit -m "feat: add authentication middleware"
# Becomes: "DEV-123: feat: add authentication middleware"

# ✅ Also good
git commit -m "fix: handle null user in login"
# Becomes: "DEV-123: fix: handle null user in login"
```

**Why**: Better changelog generation, clearer commit history.

---

## Next Steps

1. **Phase 0 Implementation**: Start building the CLI tool based on this guide
2. **Testing**: Validate with real Linear workspace and GitHub repository
3. **Phase 2 Planning**: Add webhook server for real-time bidirectional sync

---

## Support

- **Documentation**: See `specs/001-linear-github-sync/plan.md`
- **API Contracts**: See `specs/001-linear-github-sync/contracts/`
- **Issues**: Create GitHub issue with logs from `linear-sync status`

---

**Last Updated**: 2025-10-21 | **Version**: Phase 0 (CLI + Git Hooks)
