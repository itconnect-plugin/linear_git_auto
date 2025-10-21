import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  loadMappings,
  saveMappings,
  addMapping,
  findMappingByTaskId,
  findMappingByLinearId,
} from '../../../src/mapping/manager';
import { TaskMapping } from '../../../src/types';

describe('Mapping File Manager', () => {
  const testMappingPath = path.join(__dirname, 'test-mapping.json');
  const originalMappingPath = process.env.MAPPING_FILE_PATH;

  beforeEach(() => {
    process.env.MAPPING_FILE_PATH = testMappingPath;
    if (fs.existsSync(testMappingPath)) {
      fs.unlinkSync(testMappingPath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testMappingPath)) {
      fs.unlinkSync(testMappingPath);
    }
    if (originalMappingPath) {
      process.env.MAPPING_FILE_PATH = originalMappingPath;
    }
  });

  describe('loadMappings', () => {
    it('should return empty array if file does not exist', () => {
      const mappings = loadMappings();
      expect(mappings).toEqual([]);
    });

    it('should load mappings from file', () => {
      const testMappings: TaskMapping[] = [
        {
          taskId: 'T001',
          taskTitle: 'Test task',
          linearIssueId: 'ABC-123',
          linearIssueUuid: 'uuid-1',
          linearIssueUrl: 'https://linear.app/test/ABC-123',
          branchName: 'ABC-123-test-task',
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
        },
      ];

      fs.writeFileSync(testMappingPath, JSON.stringify(testMappings, null, 2));

      const loadedMappings = loadMappings();
      expect(loadedMappings).toHaveLength(1);
      expect(loadedMappings[0].taskId).toBe('T001');
      expect(loadedMappings[0].linearIssueId).toBe('ABC-123');
    });
  });

  describe('saveMappings', () => {
    it('should create mapping file if it does not exist', () => {
      const mappings: TaskMapping[] = [
        {
          taskId: 'T002',
          taskTitle: 'New task',
          linearIssueId: 'XYZ-456',
          linearIssueUuid: 'uuid-2',
          linearIssueUrl: 'https://linear.app/test/XYZ-456',
          branchName: 'XYZ-456-new-task',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      saveMappings(mappings);

      expect(fs.existsSync(testMappingPath)).toBe(true);
      const content = JSON.parse(fs.readFileSync(testMappingPath, 'utf-8'));
      expect(content).toHaveLength(1);
      expect(content[0].taskId).toBe('T002');
    });

    it('should overwrite existing mapping file', () => {
      fs.writeFileSync(testMappingPath, JSON.stringify([], null, 2));

      const newMappings: TaskMapping[] = [
        {
          taskId: 'T003',
          taskTitle: 'Updated task',
          linearIssueId: 'DEV-789',
          linearIssueUuid: 'uuid-3',
          linearIssueUrl: 'https://linear.app/test/DEV-789',
          branchName: 'DEV-789-updated-task',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      saveMappings(newMappings);

      const content = JSON.parse(fs.readFileSync(testMappingPath, 'utf-8'));
      expect(content).toHaveLength(1);
      expect(content[0].taskId).toBe('T003');
    });
  });

  describe('addMapping', () => {
    it('should add new mapping to empty list', () => {
      const mapping: TaskMapping = {
        taskId: 'T004',
        taskTitle: 'Add test',
        linearIssueId: 'ABC-100',
        linearIssueUuid: 'uuid-4',
        linearIssueUrl: 'https://linear.app/test/ABC-100',
        branchName: 'ABC-100-add-test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addMapping(mapping);

      const mappings = loadMappings();
      expect(mappings).toHaveLength(1);
      expect(mappings[0].taskId).toBe('T004');
    });

    it('should append mapping to existing list', () => {
      const existing: TaskMapping = {
        taskId: 'T005',
        taskTitle: 'Existing',
        linearIssueId: 'ABC-200',
        linearIssueUuid: 'uuid-5',
        linearIssueUrl: 'https://linear.app/test/ABC-200',
        branchName: 'ABC-200-existing',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      saveMappings([existing]);

      const newMapping: TaskMapping = {
        taskId: 'T006',
        taskTitle: 'New',
        linearIssueId: 'ABC-300',
        linearIssueUuid: 'uuid-6',
        linearIssueUrl: 'https://linear.app/test/ABC-300',
        branchName: 'ABC-300-new',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addMapping(newMapping);

      const mappings = loadMappings();
      expect(mappings).toHaveLength(2);
    });
  });

  describe('findMappingByTaskId', () => {
    it('should find mapping by task ID', () => {
      const mappings: TaskMapping[] = [
        {
          taskId: 'T007',
          taskTitle: 'Find test',
          linearIssueId: 'ABC-400',
          linearIssueUuid: 'uuid-7',
          linearIssueUrl: 'https://linear.app/test/ABC-400',
          branchName: 'ABC-400-find-test',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      saveMappings(mappings);

      const found = findMappingByTaskId('T007');
      expect(found).toBeDefined();
      expect(found?.linearIssueId).toBe('ABC-400');
    });

    it('should return undefined if not found', () => {
      const found = findMappingByTaskId('T999');
      expect(found).toBeUndefined();
    });
  });

  describe('findMappingByLinearId', () => {
    it('should find mapping by Linear issue ID', () => {
      const mappings: TaskMapping[] = [
        {
          taskId: 'T008',
          taskTitle: 'Linear find test',
          linearIssueId: 'ABC-500',
          linearIssueUuid: 'uuid-8',
          linearIssueUrl: 'https://linear.app/test/ABC-500',
          branchName: 'ABC-500-linear-find',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      saveMappings(mappings);

      const found = findMappingByLinearId('ABC-500');
      expect(found).toBeDefined();
      expect(found?.taskId).toBe('T008');
    });

    it('should return undefined if not found', () => {
      const found = findMappingByLinearId('XYZ-999');
      expect(found).toBeUndefined();
    });
  });
});
