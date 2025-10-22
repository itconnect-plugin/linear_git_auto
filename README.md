# Linear-GitHub Sync

CLI tool to automatically sync Speckit tasks.md files with Linear issues and GitHub pull requests.

## Features

- **Automatic Task Registration**: Sync tasks.md to Linear issues automatically
- **Zero-Input PR Integration**: Branch names auto-include Linear issue IDs
- **Git Hook Automation**: Commits automatically prefixed with issue IDs
- **Deduplication**: Prevents creating duplicate Linear issues
- **One-Command Setup**: Global configuration for easy multi-project usage

## Installation

### From Private GitHub Repository (Recommended)

```bash
# Install globally from private repository
npm install -g git+ssh://git@github.com/your-org/linear-github-sync.git
```

**Requirements:**
- SSH key configured for GitHub access
- Repository access permissions

### From npm (Public Registry)

```bash
npm install -g linear-github-sync
```

## Quick Start (Recommended)

### One-Command Setup & Sync

```bash
# Navigate to your project
cd /path/to/your-project

# Run quickstart
linear-sync quickstart
```

**What it does:**
1. ✅ Prompts for Linear API credentials (first time only)
2. ✅ Saves configuration globally (~/.linear-sync/config.json)
3. ✅ Installs Git hooks automatically
4. ✅ Finds tasks.md in your project
5. ✅ Syncs all tasks to Linear

**Next time:** Just run `linear-sync quickstart` in any project - it reuses your saved credentials!

---

## Manual Setup (Alternative)

### 1. Initialize Configuration

```bash
linear-sync init
```

This will:
- Prompt for your Linear API key and Team ID
- Create `.env` file with configuration
- Install Git hooks for commit message automation

### 2. Sync Tasks to Linear

```bash
linear-sync run
```

Or specify a custom tasks file:

```bash
linear-sync run --file path/to/tasks.md
```

### 3. Start Working on a Task

```bash
linear-sync start-task
```

This will:
- Show interactive list of synced tasks
- Create a new branch with pattern `ABC-123-feature-name`
- Checkout the new branch

### 4. Commit with Auto-Prefixed Messages

```bash
git add .
git commit -m "Implement authentication"
# → Automatically becomes: "ABC-123: Implement authentication"
```

### 5. Check Sync Status

```bash
linear-sync status
```

## Configuration

### Global Configuration (Recommended)

After running `linear-sync quickstart`, your credentials are stored globally:

```
~/.linear-sync/config.json
```

This allows you to use the tool across multiple projects without re-entering credentials.

### Project-Specific Configuration (Alternative)

Create a `.env` file in your project:

```env
LINEAR_API_KEY=your_linear_api_key
LINEAR_TEAM_ID=your_team_id
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `linear-sync quickstart` | **One-command setup**: Configure and sync in one step |
| `linear-sync init` | Initialize configuration and Git hooks |
| `linear-sync run` | Sync tasks.md to Linear |
| `linear-sync start-task` | Interactively select and start a task |
| `linear-sync status` | Show sync status and configuration |

## Usage in Multiple Projects

**First Project:**
```bash
cd /path/to/project-a
linear-sync quickstart  # Enter credentials once
```

**Other Projects:**
```bash
cd /path/to/project-b
linear-sync quickstart  # Reuses saved credentials, no prompts!
```

## Updating to Latest Version

```bash
npm install -g git+ssh://git@github.com/your-org/linear-github-sync.git
```

The `prepare` script automatically rebuilds during installation.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev
```

## Architecture

- **TDD-Driven**: 🔴 RED → 🟢 GREEN → 🔵 REFACTOR cycle
- **MSA-Ready**: Modular architecture with clear separation
- **TypeScript**: Full type safety with strict mode
- **Global Config**: Credentials stored securely in user home directory

## Troubleshooting

### Permission Denied (SSH)

Make sure your SSH key is configured for GitHub:
```bash
ssh -T git@github.com
```

### Tasks.md Not Found

Specify the file path explicitly:
```bash
linear-sync run --file path/to/tasks.md
```

Or use quickstart with the file option:
```bash
linear-sync quickstart --file path/to/tasks.md
```

## License

MIT
