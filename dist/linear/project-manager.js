"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectManager = void 0;
const logger_1 = require("../lib/logger");
/**
 * Manages Linear Projects - creation and retrieval
 */
class ProjectManager {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * Find a project by name in the specified team.
     *
     * @param teamId - Linear team ID
     * @param projectName - Project name to search for
     * @returns Project if found, null otherwise
     */
    async findProjectByName(teamId, projectName) {
        const sdk = this.client.getClient();
        try {
            // Get team's projects and filter by name
            const team = await sdk.team(teamId);
            const projects = await team.projects();
            for (const projectNode of projects.nodes) {
                const project = await projectNode;
                if (project.name === projectName) {
                    return this.mapToLinearProject(project);
                }
            }
            return null;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger_1.logger.error({ teamId, projectName, error: errorMessage }, 'Failed to find project');
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
    async createProject(teamId, name, description) {
        const sdk = this.client.getClient();
        try {
            const projectPayload = await sdk.createProject({
                teamIds: [teamId],
                name,
                description: description || 'Automated project created from tasks.md sync',
            });
            const project = await projectPayload.project;
            if (!project) {
                throw new Error('Failed to create project - no project returned');
            }
            logger_1.logger.info({ projectId: project.id, name }, 'Created Linear project');
            return this.mapToLinearProject(project);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger_1.logger.error({ teamId, name, error: errorMessage }, 'Failed to create project');
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
    async findOrCreateProject(teamId, projectName, description) {
        // Try to find existing project
        const existing = await this.findProjectByName(teamId, projectName);
        if (existing) {
            logger_1.logger.info({ projectId: existing.id, name: projectName }, 'Found existing project');
            return existing;
        }
        // Create new project if not found
        return this.createProject(teamId, projectName, description);
    }
    /**
     * Maps a Linear SDK Project object to our LinearProject interface.
     *
     * @param project - Linear SDK Project object
     * @returns LinearProject interface object
     */
    mapToLinearProject(project) {
        return {
            id: project.id,
            name: project.name,
            description: project.description || undefined,
            state: project.state,
            url: project.url,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        };
    }
}
exports.ProjectManager = ProjectManager;
//# sourceMappingURL=project-manager.js.map