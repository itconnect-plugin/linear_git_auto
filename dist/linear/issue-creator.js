"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueCreator = void 0;
class IssueCreator {
    client;
    constructor(client) {
        this.client = client;
    }
    async createIssue(teamId, task, projectId) {
        const sdk = this.client.getClient();
        const issuePayload = await sdk.createIssue({
            teamId,
            title: task.title,
            description: this.formatDescription(task),
            projectId, // Add issue to project if provided
        });
        const issue = await issuePayload.issue;
        if (!issue)
            throw new Error('Failed to create issue');
        const state = await issue.state;
        return {
            id: issue.id,
            identifier: issue.identifier,
            title: issue.title,
            description: issue.description || '',
            url: issue.url,
            state: {
                id: state?.id || '',
                name: state?.name || '',
                type: state?.type || '',
            },
            createdAt: issue.createdAt,
            updatedAt: issue.updatedAt,
        };
    }
    formatDescription(task) {
        let desc = `**Task ID**: ${task.id}\n`;
        if (task.userStory)
            desc += `**User Story**: ${task.userStory}\n`;
        if (task.phase)
            desc += `**Phase**: ${task.phase}\n`;
        desc += `\n${task.description}\n`;
        if (task.filePath)
            desc += `\n**File**: \`${task.filePath}\`\n`;
        desc += `\n---\n_Synced from tasks.md_`;
        return desc;
    }
}
exports.IssueCreator = IssueCreator;
//# sourceMappingURL=issue-creator.js.map