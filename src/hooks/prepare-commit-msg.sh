#!/bin/bash

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

# Skip merge commits
if [ "$COMMIT_SOURCE" = "merge" ] || [ "$COMMIT_SOURCE" = "squash" ]; then
  exit 0
fi

# Get current branch name
BRANCH_NAME=$(git symbolic-ref --short HEAD 2>/dev/null)

# Extract Linear issue ID (ABC-123 pattern)
ISSUE_ID=$(echo "$BRANCH_NAME" | grep -oE '[A-Z]+-[0-9]+' | head -1)

if [ -n "$ISSUE_ID" ]; then
  # Read existing commit message
  ORIGINAL_MSG=$(cat "$COMMIT_MSG_FILE")

  # Add issue ID if not already present
  if ! echo "$ORIGINAL_MSG" | grep -q "$ISSUE_ID"; then
    echo "$ISSUE_ID: $ORIGINAL_MSG" > "$COMMIT_MSG_FILE"
  fi
fi
