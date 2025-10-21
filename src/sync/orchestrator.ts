import { parseTasksFile } from '../parsers/tasks-parser';
import { LinearClient } from '../linear/client';
import { IssueCreator } from '../linear/issue-creator';
import { addMapping, findMappingByTaskId } from '../mapping/manager';
import { logger } from '../lib/logger';
import * as fs from 'fs';

export class SyncOrchestrator {
  private issueCreator: IssueCreator;

  constructor(private linearClient: LinearClient, private teamId: string) {
    this.issueCreator = new IssueCreator(linearClient);
  }

  async syncTasksFile(tasksFilePath: string): Promise<void> {
    logger.info({ tasksFilePath }, 'Starting sync');

    const content = fs.readFileSync(tasksFilePath, 'utf-8');
    const tasks = parseTasksFile(content);

    logger.info({ taskCount: tasks.length }, 'Parsed tasks');

    for (const task of tasks) {
      const existing = findMappingByTaskId(task.id);
      if (existing) {
        logger.info({ taskId: task.id }, 'Task already synced, skipping');
        continue;
      }

      try {
        const issue = await this.issueCreator.createIssue(this.teamId, task);

        addMapping({
          taskId: task.id,
          taskTitle: task.title,
          linearIssueId: issue.identifier,
          linearIssueUuid: issue.id,
          linearIssueUrl: issue.url,
          branchName: `${issue.identifier}-${this.slugify(task.title)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        logger.info({ taskId: task.id, linearId: issue.identifier }, 'Created Linear issue');
      } catch (error) {
        logger.error({ taskId: task.id, error }, 'Failed to create issue');
      }
    }

    logger.info('Sync completed');
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }
}
