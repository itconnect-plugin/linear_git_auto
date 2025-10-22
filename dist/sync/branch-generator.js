"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBranchName = generateBranchName;
function generateBranchName(linearId, taskTitle) {
    const slug = taskTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
    return `${linearId}-${slug}`;
}
//# sourceMappingURL=branch-generator.js.map