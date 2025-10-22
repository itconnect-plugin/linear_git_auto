import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';

/**
 * 프로젝트 루트에서 특정 파일을 찾는 유틸리티
 * 
 * 현재 디렉토리부터 상위 디렉토리로 탐색하며
 * 지정된 파일을 찾음
 */

const MAX_DEPTH = 10; // 최대 탐색 깊이 (무한 루프 방지)

/**
 * 현재 디렉토리부터 상위로 탐색하며 파일 찾기
 * 
 * @param filename - 찾을 파일명 (예: 'tasks.md')
 * @param startDir - 탐색 시작 디렉토리 (기본값: 현재 작업 디렉토리)
 * @returns 찾은 파일의 절대 경로, 못 찾으면 null
 */
export function findFileUpwards(
  filename: string,
  startDir: string = process.cwd()
): string | null {
  let currentDir = path.resolve(startDir);
  let depth = 0;

  while (depth < MAX_DEPTH) {
    const candidatePath = path.join(currentDir, filename);

    if (fs.existsSync(candidatePath)) {
      logger.info({ path: candidatePath }, `Found ${filename}`);
      return candidatePath;
    }

    // 부모 디렉토리로 이동
    const parentDir = path.dirname(currentDir);

    // 루트 디렉토리에 도달한 경우 중단
    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
    depth++;
  }

  logger.info({ filename, startDir }, `File not found after searching ${depth} levels`);
  return null;
}

/**
 * tasks.md 파일 자동 탐지
 * 
 * 1. 현재 디렉토리에서 tasks.md 확인
 * 2. 상위 디렉토리로 탐색
 * 3. specs/ 디렉토리 내부도 확인
 * 
 * @param startDir - 탐색 시작 디렉토리 (기본값: 현재 작업 디렉토리)
 * @returns 찾은 tasks.md의 절대 경로, 못 찾으면 null
 */
export function findTasksFile(startDir: string = process.cwd()): string | null {
  // 1. 기본 탐색: 현재 디렉토리부터 상위로
  const basicSearch = findFileUpwards('tasks.md', startDir);
  if (basicSearch) {
    return basicSearch;
  }

  // 2. specs 디렉토리 탐색
  const specsSearch = findInSpecsDirectory(startDir);
  if (specsSearch) {
    return specsSearch;
  }

  return null;
}

/**
 * specs/ 디렉토리 내부에서 tasks.md 탐색
 * 
 * specs/001-linear-github-sync/tasks.md 같은 경로 지원
 * 
 * @param startDir - 탐색 시작 디렉토리
 * @returns 찾은 tasks.md 경로, 못 찾으면 null
 */
function findInSpecsDirectory(startDir: string): string | null {
  let currentDir = path.resolve(startDir);
  let depth = 0;

  while (depth < MAX_DEPTH) {
    const specsDir = path.join(currentDir, 'specs');

    if (fs.existsSync(specsDir)) {
      // specs 디렉토리 내부를 재귀적으로 탐색
      const tasksFile = findTasksInDirectory(specsDir);
      if (tasksFile) {
        return tasksFile;
      }
    }

    // 부모 디렉토리로 이동
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
    depth++;
  }

  return null;
}

/**
 * 디렉토리 내부를 재귀적으로 탐색하여 tasks.md 찾기
 * 
 * @param dir - 탐색할 디렉토리
 * @param maxDepth - 최대 재귀 깊이 (기본값: 3)
 * @returns 찾은 tasks.md 경로, 못 찾으면 null
 */
function findTasksInDirectory(
  dir: string,
  maxDepth: number = 3,
  currentDepth: number = 0
): string | null {
  if (currentDepth >= maxDepth) {
    return null;
  }

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    // 먼저 현재 디렉토리에서 tasks.md 찾기
    for (const entry of entries) {
      if (entry.isFile() && entry.name === 'tasks.md') {
        return path.join(dir, entry.name);
      }
    }

    // 하위 디렉토리 탐색
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDir = path.join(dir, entry.name);
        const result = findTasksInDirectory(subDir, maxDepth, currentDepth + 1);
        if (result) {
          return result;
        }
      }
    }
  } catch (error) {
    // 권한 오류 등은 무시하고 계속 진행
    logger.debug({ dir, error }, 'Error reading directory');
  }

  return null;
}

/**
 * Git 저장소 루트 디렉토리 찾기
 * 
 * .git 디렉토리가 있는 위치 반환
 * 
 * @param startDir - 탐색 시작 디렉토리
 * @returns Git 루트 디렉토리 경로, 못 찾으면 null
 */
export function findGitRoot(startDir: string = process.cwd()): string | null {
  let currentDir = path.resolve(startDir);
  let depth = 0;

  while (depth < MAX_DEPTH) {
    const gitDir = path.join(currentDir, '.git');

    if (fs.existsSync(gitDir)) {
      logger.info({ path: currentDir }, 'Found git root');
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
    depth++;
  }

  return null;
}

