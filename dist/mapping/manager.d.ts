import { TaskMapping } from '../types';
export declare function loadMappings(): TaskMapping[];
export declare function saveMappings(mappings: TaskMapping[]): void;
export declare function addMapping(mapping: TaskMapping): void;
export declare function findMappingByTaskId(taskId: string): TaskMapping | undefined;
export declare function findMappingByLinearId(linearIssueId: string): TaskMapping | undefined;
//# sourceMappingURL=manager.d.ts.map