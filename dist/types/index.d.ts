export interface Task {
    id: string;
    title: string;
    description: string;
    phase: string;
    userStory?: string;
    isParallel: boolean;
    filePath?: string;
    dependencies?: string[];
}
export interface TaskMapping {
    taskId: string;
    taskTitle: string;
    linearIssueId: string;
    linearIssueUuid: string;
    linearIssueUrl: string;
    branchName: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface LinearIssue {
    id: string;
    identifier: string;
    title: string;
    description: string;
    url: string;
    state: {
        id: string;
        name: string;
        type: string;
    };
    labels?: LinearLabel[];
    createdAt: Date;
    updatedAt: Date;
}
export interface LinearLabel {
    id: string;
    name: string;
    color: string;
}
export interface PullRequest {
    number: number;
    title: string;
    body: string;
    state: 'open' | 'closed';
    merged: boolean;
    headRef: string;
    baseRef: string;
    url: string;
}
export interface LinearProject {
    id: string;
    name: string;
    description?: string;
    state: string;
    url: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface SyncEvent {
    type: 'create' | 'update' | 'skip';
    taskId: string;
    linearIssueId?: string;
    timestamp: Date;
    success: boolean;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map