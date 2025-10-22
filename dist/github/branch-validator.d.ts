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
export declare function validateBranchName(branchName: string): BranchValidationResult;
/**
 * Extracts Linear issue ID from branch name
 * Returns null if no valid issue ID found
 */
export declare function extractIssueId(branchName: string): string | null;
//# sourceMappingURL=branch-validator.d.ts.map