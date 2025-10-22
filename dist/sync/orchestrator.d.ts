import { LinearClient } from '../linear/client';
export declare class SyncOrchestrator {
    private linearClient;
    private teamId;
    private issueCreator;
    private projectManager;
    constructor(linearClient: LinearClient, teamId: string);
    syncTasksFile(tasksFilePath: string): Promise<void>;
    /**
     * Extract project name from first # header in tasks.md
     * Example: "# Tasks: Linear-GitHub Automation" → "Linear-GitHub Automation"
     */
    private extractProjectName;
    private slugify;
}
//# sourceMappingURL=orchestrator.d.ts.map