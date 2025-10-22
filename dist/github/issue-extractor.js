"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractIssueIdFromBranch = extractIssueIdFromBranch;
exports.extractIssueIdFromCommit = extractIssueIdFromCommit;
function extractIssueIdFromBranch(branchName) {
    const match = branchName.match(/[A-Z]+-[0-9]+/);
    return match ? match[0] : null;
}
function extractIssueIdFromCommit(commitMessage) {
    const match = commitMessage.match(/^([A-Z]+-[0-9]+):/);
    return match ? match[1] : null;
}
//# sourceMappingURL=issue-extractor.js.map