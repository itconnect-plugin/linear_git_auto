export interface GlobalConfig {
    linearApiKey: string;
    linearTeamId: string;
}
/**
 * 전역 설정 디렉토리 경로 반환
 *
 * @returns ~/.linear-sync 디렉토리의 절대 경로
 */
export declare function getGlobalConfigDir(): string;
/**
 * 전역 설정 파일 경로 반환
 *
 * @returns ~/.linear-sync/config.json 파일의 절대 경로
 */
export declare function getGlobalConfigPath(): string;
/**
 * 전역 설정이 존재하는지 확인
 *
 * @returns 설정 파일이 존재하고 유효하면 true
 */
export declare function hasGlobalConfig(): boolean;
/**
 * 전역 설정 읽기
 *
 * @returns 저장된 전역 설정
 * @throws Error 설정 파일이 없거나 읽을 수 없는 경우
 */
export declare function readGlobalConfig(): GlobalConfig;
/**
 * 전역 설정 저장
 *
 * ~/.linear-sync 디렉토리가 없으면 자동 생성
 *
 * @param config - 저장할 설정
 * @throws Error 설정을 저장할 수 없는 경우
 */
export declare function writeGlobalConfig(config: GlobalConfig): void;
/**
 * 전역 설정 삭제
 *
 * 테스트 또는 재설정 시 사용
 */
export declare function deleteGlobalConfig(): void;
//# sourceMappingURL=global-config.d.ts.map