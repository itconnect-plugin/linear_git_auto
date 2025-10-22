import { findMappingByTaskId } from '../mapping/manager';

export function checkDuplicate(taskId: string): boolean {
  return findMappingByTaskId(taskId) !== undefined;
}
