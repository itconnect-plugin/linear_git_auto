import { describe, it, expect } from 'vitest';
import { parseTasksFile } from '../../../src/parsers/tasks-parser';

const sampleTasksMd = `
# Tasks: Test Feature

## Phase 1: Setup

- [ ] T001 Create project structure
- [X] T002 Configure TypeScript

## Phase 2: Implementation

- [ ] T003 [P] [US1] Implement parser in src/parser.ts
- [ ] T004 [US1] Add validation

`;

describe('Tasks Parser', () => {
  it('should parse tasks from markdown', () => {
    const tasks = parseTasksFile(sampleTasksMd);

    expect(tasks).toHaveLength(4);
  });

  it('should extract task ID', () => {
    const tasks = parseTasksFile(sampleTasksMd);

    expect(tasks[0].id).toBe('T001');
    expect(tasks[1].id).toBe('T002');
    expect(tasks[2].id).toBe('T003');
  });

  it('should extract task title', () => {
    const tasks = parseTasksFile(sampleTasksMd);

    expect(tasks[0].title).toContain('Create project structure');
    expect(tasks[2].title).toContain('Implement parser');
  });

  it('should detect parallel marker [P]', () => {
    const tasks = parseTasksFile(sampleTasksMd);

    expect(tasks[0].isParallel).toBe(false);
    expect(tasks[2].isParallel).toBe(true);
  });

  it('should extract user story tag [US1]', () => {
    const tasks = parseTasksFile(sampleTasksMd);

    expect(tasks[0].userStory).toBeUndefined();
    expect(tasks[2].userStory).toBe('US1');
    expect(tasks[3].userStory).toBe('US1');
  });

  it('should extract file path from description', () => {
    const tasks = parseTasksFile(sampleTasksMd);

    expect(tasks[2].filePath).toBe('src/parser.ts');
  });

  it('should identify phase from context', () => {
    const tasks = parseTasksFile(sampleTasksMd);

    expect(tasks[0].phase).toContain('Phase 1');
    expect(tasks[2].phase).toContain('Phase 2');
  });
});
