import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectManager } from '../../../src/linear/project-manager';
import { LinearClient } from '../../../src/linear/client';

// Mock LinearClient
vi.mock('../../../src/linear/client');

describe('ProjectManager', () => {
  let projectManager: ProjectManager;
  let mockLinearClient: any;
  let mockSdk: any;

  beforeEach(() => {
    // Create SDK mock with methods
    mockSdk = {
      team: vi.fn(),
      createProject: vi.fn(),
    };

    // Create Linear client mock that returns the SDK
    mockLinearClient = {
      getClient: vi.fn(() => mockSdk),
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

      const mockTeam = {
        projects: vi.fn().mockResolvedValue({
          nodes: [mockProject],
        }),
      };

      mockSdk.team.mockResolvedValue(mockTeam);

      const result = await projectManager.findProjectByName(
        'team-123',
        'Linear-GitHub Automation'
      );

      expect(result).toEqual(mockProject);
      expect(mockSdk.team).toHaveBeenCalledWith('team-123');
      expect(mockTeam.projects).toHaveBeenCalled();
    });

    it('should return null if project not found', async () => {
      const mockTeam = {
        projects: vi.fn().mockResolvedValue({
          nodes: [],
        }),
      };

      mockSdk.team.mockResolvedValue(mockTeam);

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

      mockSdk.createProject.mockResolvedValue(mockProjectPayload);

      const result = await projectManager.createProject('team-123', 'New Project');

      expect(result).toEqual(mockProjectPayload.project);
      expect(mockSdk.createProject).toHaveBeenCalledWith({
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

      mockSdk.createProject.mockResolvedValue(mockProjectPayload);

      const result = await projectManager.createProject(
        'team-123',
        'Custom Project',
        'Custom description'
      );

      expect(result).toEqual(mockProjectPayload.project);
      expect(mockSdk.createProject).toHaveBeenCalledWith({
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

      const mockTeam = {
        projects: vi.fn().mockResolvedValue({
          nodes: [existingProject],
        }),
      };

      mockSdk.team.mockResolvedValue(mockTeam);

      const result = await projectManager.findOrCreateProject(
        'team-123',
        'Existing Project'
      );

      expect(result).toEqual(existingProject);
      expect(mockSdk.createProject).not.toHaveBeenCalled();
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

      // First call: search returns empty
      const mockTeam = {
        projects: vi.fn().mockResolvedValue({
          nodes: [],
        }),
      };

      mockSdk.team.mockResolvedValue(mockTeam);

      // Second call: create project
      mockSdk.createProject.mockResolvedValue({
        project: newProject,
      });

      const result = await projectManager.findOrCreateProject(
        'team-123',
        'New Project'
      );

      expect(result).toEqual(newProject);
      expect(mockSdk.team).toHaveBeenCalledWith('team-123');
      expect(mockTeam.projects).toHaveBeenCalled();
      expect(mockSdk.createProject).toHaveBeenCalled();
    });
  });
});
