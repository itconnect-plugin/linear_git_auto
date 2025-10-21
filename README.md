# Linear-GitHub Sync

CLI tool to automatically sync Speckit tasks.md files with Linear issues and GitHub pull requests.

## Features

- **Automatic Task Registration**: Sync tasks.md to Linear issues automatically
- **Zero-Input PR Integration**: Branch names auto-include Linear issue IDs
- **Git Hook Automation**: Commits automatically prefixed with issue IDs
- **Deduplication**: Prevents creating duplicate Linear issues

## Installation

```bash
npm install -g linear-github-sync
```

## Quick Start

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

Create a `.env` file:

```env
LINEAR_API_KEY=your_linear_api_key
LINEAR_TEAM_ID=your_team_id
```

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

## License

MIT
