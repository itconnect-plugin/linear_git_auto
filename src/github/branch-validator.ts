export interface BranchValidationResult {
  valid: boolean;
  issueId?: string;
  slug?: string;
  error?: string;
}

/**
 * Validates branch name follows pattern: [A-Z]+-[0-9]+-[\w-]+
 * Example: ABC-123-implement-feature
 */
export function validateBranchName(branchName: string): BranchValidationResult {
  const pattern = /^([A-Z]+-[0-9]+)-([\w-]+)$/;
  const match = branchName.match(pattern);

  if (!match) {
    return {
      valid: false,
      error: 'Branch name must follow pattern: ABC-123-feature-name',
    };
  }

  return {
    valid: true,
    issueId: match[1], // ABC-123
    slug: match[2], // feature-name
  };
}

/**
 * Extracts Linear issue ID from branch name
 * Returns null if no valid issue ID found
 */
export function extractIssueId(branchName: string): string | null {
  const match = branchName.match(/[A-Z]+-[0-9]+/);
  return match ? match[0] : null;
}
