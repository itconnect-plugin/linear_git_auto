export function extractIssueIdFromBranch(branchName: string): string | null {
  const match = branchName.match(/[A-Z]+-[0-9]+/);
  return match ? match[0] : null;
}

export function extractIssueIdFromCommit(commitMessage: string): string | null {
  const match = commitMessage.match(/^([A-Z]+-[0-9]+):/);
  return match ? match[1] : null;
}
