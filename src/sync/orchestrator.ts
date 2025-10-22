import { parseTasksFile } from '../parsers/tasks-parser';
import { LinearClient } from '../linear/client';
import { IssueCreator } from '../linear/issue-creator';
import { ProjectManager } from '../linear/project-manager';
import { addMapping, findMappingByTaskId } from '../mapping/manager';
import { logger } from '../lib/logger';
import * as fs from 'fs';

// Default project name for tasks.md sync
const DEFAULT_PROJECT_NAME = 'Linear-GitHub Automation';

export class SyncOrchestrator {
  private issueCreator: IssueCreator;
  private projectManager: ProjectManager;

  constructor(private linearClient: LinearClient, private teamId: string) {
    this.issueCreator = new IssueCreator(linearClient);
    this.projectManager = new ProjectManager(linearClient);
  }

  async syncTasksFile(tasksFilePath: string): Promise<void> {
    logger.info({ tasksFilePath }, 'Starting sync');

    const content = fs.readFileSync(tasksFilePath, 'utf-8');
    const tasks = parseTasksFile(content);

    logger.info({ taskCount: tasks.length }, 'Parsed tasks');

    // Extract project name from tasks.md or use default
    const projectName = this.extractProjectName(content) || DEFAULT_PROJECT_NAME;

    // Find or create project
    logger.info({ projectName }, 'Finding or creating project');
    const project = await this.projectManager.findOrCreateProject(
      this.teamId,
      projectName,
      `Automated project created from ${tasksFilePath}`
    );
    logger.info({ projectId: project.id, projectName: project.name }, 'Using project');

    for (const task of tasks) {
      const existing = findMappingByTaskId(task.id);
      if (existing) {
        logger.info({ taskId: task.id }, 'Task already synced, skipping');
        continue;
      }

      try {
        const issue = await this.issueCreator.createIssue(
          this.teamId,
          task,
          project.id // Add issue to project
        );

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

        logger.info(
          { taskId: task.id, linearId: issue.identifier, projectId: project.id },
          'Created Linear issue in project'
        );
      } catch (error) {
        logger.error({ taskId: task.id, error }, 'Failed to create issue');
      }
    }

    logger.info('Sync completed');
  }

  /**
   * Extract project name from first # header in tasks.md
   * Example: "# Tasks: Linear-GitHub Automation" → "Linear-GitHub Automation"
   */
  private extractProjectName(content: string): string | null {
    const match = content.match(/^#\s+Tasks:\s*(.+)$/m);
    return match ? match[1].trim() : null;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }
}
