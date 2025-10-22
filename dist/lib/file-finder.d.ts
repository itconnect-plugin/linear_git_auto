/**
 * 현재 디렉토리부터 상위로 탐색하며 파일 찾기
 *
 * @param filename - 찾을 파일명 (예: 'tasks.md')
 * @param startDir - 탐색 시작 디렉토리 (기본값: 현재 작업 디렉토리)
 * @returns 찾은 파일의 절대 경로, 못 찾으면 null
 */
export declare function findFileUpwards(filename: string, startDir?: string): string | null;
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
export declare function findTasksFile(startDir?: string): string | null;
/**
 * Git 저장소 루트 디렉토리 찾기
 *
 * .git 디렉토리가 있는 위치 반환
 *
 * @param startDir - 탐색 시작 디렉토리
 * @returns Git 루트 디렉토리 경로, 못 찾으면 null
 */
export declare function findGitRoot(startDir?: string): string | null;
//# sourceMappingURL=file-finder.d.ts.map