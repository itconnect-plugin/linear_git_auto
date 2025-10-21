import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectManager } from '../../../src/linear/project-manager';
import { LinearClient } from '../../../src/linear/client';

// Mock LinearClient
vi.mock('../../../src/linear/client');

describe('ProjectManager', () => {
  let projectManager: ProjectManager;
  let mockLinearClient: any;

  beforeEach(() => {
    mockLinearClient = {
      getClient: vi.fn(() => ({
        projects: vi.fn(),
        createProject: vi.fn(),
      })),
    };
    projectManager = new ProjectManager(mockLinearClient);
  });

  describe('findProjectByName', () => {
    it('should find existing project by name', async () => {
      const mockProject = {
        id: 'proj-123',
        name: 'Linear-GitHub Automation',
        description: 'Test project',
        state: 'started',
        url: 'https://linear.app/test/project/proj-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sdk = mockLinearClient.getClient();
      sdk.projects.mockResolvedValue({
        nodes: [mockProject],
      });

      const result = await projectManager.findProjectByName(
        'team-123',
        'Linear-GitHub Automation'
      );

      expect(result).toEqual(mockProject);
      expect(sdk.projects).toHaveBeenCalledWith({
        filter: {
          team: { id: { eq: 'team-123' } },
          name: { eq: 'Linear-GitHub Automation' },
        },
      });
    });

    it('should return null if project not found', async () => {
      const sdk = mockLinearClient.getClient();
      sdk.projects.mockResolvedValue({
        nodes: [],
      });

      const result = await projectManager.findProjectByName(
        'team-123',
        'Non-Existent Project'
      );

      expect(result).toBeNull();
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const mockProjectPayload = {
        project: {
          id: 'proj-456',
          name: 'New Project',
          description: 'Automated project from tasks.md',
          state: 'started',
          url: 'https://linear.app/test/project/proj-456',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const sdk = mockLinearClient.getClient();
      sdk.createProject.mockResolvedValue(mockProjectPayload);

      const result = await projectManager.createProject('team-123', 'New Project');

      expect(result).toEqual(mockProjectPayload.project);
      expect(sdk.createProject).toHaveBeenCalledWith({
        teamIds: ['team-123'],
        name: 'New Project',
        description: 'Automated project created from tasks.md sync',
      });
    });

    it('should handle project creation with custom description', async () => {
      const mockProjectPayload = {
        project: {
          id: 'proj-789',
          name: 'Custom Project',
          description: 'Custom description',
          state: 'started',
          url: 'https://linear.app/test/project/proj-789',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const sdk = mockLinearClient.getClient();
      sdk.createProject.mockResolvedValue(mockProjectPayload);

      const result = await projectManager.createProject(
        'team-123',
        'Custom Project',
        'Custom description'
      );

      expect(result).toEqual(mockProjectPayload.project);
      expect(sdk.createProject).toHaveBeenCalledWith({
        teamIds: ['team-123'],
        name: 'Custom Project',
        description: 'Custom description',
      });
    });
  });

  describe('findOrCreateProject', () => {
    it('should return existing project if found', async () => {
      const existingProject = {
        id: 'proj-existing',
        name: 'Existing Project',
        description: 'Already exists',
        state: 'started',
        url: 'https://linear.app/test/project/proj-existing',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sdk = mockLinearClient.getClient();
      sdk.projects.mockResolvedValue({
        nodes: [existingProject],
      });

      const result = await projectManager.findOrCreateProject(
        'team-123',
        'Existing Project'
      );

      expect(result).toEqual(existingProject);
      expect(sdk.createProject).not.toHaveBeenCalled();
    });

    it('should create new project if not found', async () => {
      const newProject = {
        id: 'proj-new',
        name: 'New Project',
        description: 'Automated project created from tasks.md sync',
        state: 'started',
        url: 'https://linear.app/test/project/proj-new',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sdk = mockLinearClient.getClient();

      // First call: search returns empty
      sdk.projects.mockResolvedValue({
        nodes: [],
      });

      // Second call: create project
      sdk.createProject.mockResolvedValue({
        project: newProject,
      });

      const result = await projectManager.findOrCreateProject(
        'team-123',
        'New Project'
      );

      expect(result).toEqual(newProject);
      expect(sdk.projects).toHaveBeenCalled();
      expect(sdk.createProject).toHaveBeenCalled();
    });
  });
});
