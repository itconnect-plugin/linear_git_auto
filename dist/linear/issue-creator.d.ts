import { LinearClient } from './client';
import { Task, LinearIssue } from '../types';
export declare class IssueCreator {
    private client;
    constructor(client: LinearClient);
    createIssue(teamId: string, task: Task, projectId?: string): Promise<LinearIssue>;
    private formatDescription;
}
//# sourceMappingURL=issue-creator.d.ts.map