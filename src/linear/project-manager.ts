import { LinearClient } from './client';
import { LinearProject } from '../types';
import { logger } from '../lib/logger';

/**
 * Manages Linear Projects - creation and retrieval
 */
export class ProjectManager {
  constructor(private client: LinearClient) {}

  /**
   * Find a project by name in the specified team.
   *
   * @param teamId - Linear team ID
   * @param projectName - Project name to search for
   * @returns Project if found, null otherwise
   */
  async findProjectByName(
    teamId: string,
    projectName: string
  ): Promise<LinearProject | null> {
    const sdk = this.client.getClient();

    try {
      const projects = await sdk.projects({
        filter: {
          team: { id: { eq: teamId } },
          name: { eq: projectName },
        },
      });

      if (projects.nodes.length === 0) {
        return null;
      }

      const project = projects.nodes[0];
      return {
        id: project.id,
        name: project.name,
        description: project.description || undefined,
        state: project.state,
        url: project.url,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error({ teamId, projectName, error: errorMessage }, 'Failed to find project');
      throw new Error(`Failed to find project: ${errorMessage}`);
    }
  }

  /**
   * Create a new Linear project.
   *
   * @param teamId - Linear team ID
   * @param name - Project name
   * @param description - Optional project description
   * @returns Created project
   */
  async createProject(
    teamId: string,
    name: string,
    description?: string
  ): Promise<LinearProject> {
    const sdk = this.client.getClient();

    try {
      const projectPayload = await sdk.createProject({
        teamIds: [teamId],
        name,
        description: description || 'Automated project created from tasks.md sync',
      });

      const project = projectPayload.project;
      if (!project) {
        throw new Error('Failed to create project - no project returned');
      }

      logger.info({ projectId: project.id, name }, 'Created Linear project');

      return {
        id: project.id,
        name: project.name,
        description: project.description || undefined,
        state: project.state,
        url: project.url,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error({ teamId, name, error: errorMessage }, 'Failed to create project');
      throw new Error(`Failed to create project: ${errorMessage}`);
    }
  }

  /**
   * Find an existing project by name, or create it if it doesn't exist.
   *
   * This is the primary method to use for ensuring a project exists.
   *
   * @param teamId - Linear team ID
   * @param projectName - Project name
   * @param description - Optional description (used only if creating new project)
   * @returns Existing or newly created project
   */
  async findOrCreateProject(
    teamId: string,
    projectName: string,
    description?: string
  ): Promise<LinearProject> {
    // Try to find existing project
    const existing = await this.findProjectByName(teamId, projectName);

    if (existing) {
      logger.info({ projectId: existing.id, name: projectName }, 'Found existing project');
      return existing;
    }

    // Create new project if not found
    return this.createProject(teamId, projectName, description);
  }
}
