// Task from tasks.md
export interface Task {
  id: string; // T001, T002, etc.
  title: string;
  description: string;
  phase: string;
  userStory?: string; // US1, US2, etc.
  isParallel: boolean; // [P] marker
  filePath?: string;
  dependencies?: string[];
}

// Task mapping (tasks.md → Linear)
export interface TaskMapping {
  taskId: string; // From tasks.md
  taskTitle: string;
  linearIssueId: string; // ABC-123
  linearIssueUuid: string; // Internal UUID
  linearIssueUrl: string;
  branchName: string; // ABC-123-feature-slug
  createdAt: Date;
  updatedAt: Date;
}

// Linear issue
export interface LinearIssue {
  id: string; // UUID
  identifier: string; // ABC-123
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

// Pull Request
export interface PullRequest {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  merged: boolean;
  headRef: string; // Branch name
  baseRef: string;
  url: string;
}

// Sync event for logging
export interface SyncEvent {
  type: 'create' | 'update' | 'skip';
  taskId: string;
  linearIssueId?: string;
  timestamp: Date;
  success: boolean;
  error?: string;
}
