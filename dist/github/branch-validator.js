"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBranchName = validateBranchName;
exports.extractIssueId = extractIssueId;
/**
 * Validates branch name follows pattern: [A-Z]+-[0-9]+-[\w-]+
 * Example: ABC-123-implement-feature
 */
function validateBranchName(branchName) {
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
function extractIssueId(branchName) {
    const match = branchName.match(/[A-Z]+-[0-9]+/);
    return match ? match[0] : null;
}
//# sourceMappingURL=branch-validator.js.map