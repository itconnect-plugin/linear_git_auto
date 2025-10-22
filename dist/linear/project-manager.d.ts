import { LinearClient } from './client';
import { LinearProject } from '../types';
/**
 * Manages Linear Projects - creation and retrieval
 */
export declare class ProjectManager {
    private client;
    constructor(client: LinearClient);
    /**
     * Find a project by name in the specified team.
     *
     * @param teamId - Linear team ID
     * @param projectName - Project name to search for
     * @returns Project if found, null otherwise
     */
    findProjectByName(teamId: string, projectName: string): Promise<LinearProject | null>;
    /**
     * Create a new Linear project.
     *
     * @param teamId - Linear team ID
     * @param name - Project name
     * @param description - Optional project description
     * @returns Created project
     */
    createProject(teamId: string, name: string, description?: string): Promise<LinearProject>;
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
    findOrCreateProject(teamId: string, projectName: string, description?: string): Promise<LinearProject>;
    /**
     * Maps a Linear SDK Project object to our LinearProject interface.
     *
     * @param project - Linear SDK Project object
     * @returns LinearProject interface object
     */
    private mapToLinearProject;
}
//# sourceMappingURL=project-manager.d.ts.map