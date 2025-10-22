import * as fs from 'fs';
import * as path from 'path';
import { TaskMapping } from '../types';

const DEFAULT_MAPPING_PATH = path.join(process.cwd(), '.specify', 'linear-mapping.json');

function getMappingPath(): string {
  return process.env.MAPPING_FILE_PATH || DEFAULT_MAPPING_PATH;
}

function ensureDirectoryExists(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadMappings(): TaskMapping[] {
  const mappingPath = getMappingPath();

  if (!fs.existsSync(mappingPath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(mappingPath, 'utf-8');
    const mappings = JSON.parse(content) as TaskMapping[];

    // Convert date strings back to Date objects
    return mappings.map((m) => ({
      ...m,
      createdAt: new Date(m.createdAt),
      updatedAt: new Date(m.updatedAt),
    }));
  } catch (error) {
    console.error('Failed to load mappings:', error);
    return [];
  }
}

export function saveMappings(mappings: TaskMapping[]): void {
  const mappingPath = getMappingPath();
  ensureDirectoryExists(mappingPath);

  const content = JSON.stringify(mappings, null, 2);
  fs.writeFileSync(mappingPath, content, 'utf-8');
}

export function addMapping(mapping: TaskMapping): void {
  const mappings = loadMappings();
  mappings.push(mapping);
  saveMappings(mappings);
}

export function findMappingByTaskId(taskId: string): TaskMapping | undefined {
  const mappings = loadMappings();
  return mappings.find((m) => m.taskId === taskId);
}

export function findMappingByLinearId(linearIssueId: string): TaskMapping | undefined {
  const mappings = loadMappings();
  return mappings.find((m) => m.linearIssueId === linearIssueId);
}
