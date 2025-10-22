"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalConfigDir = getGlobalConfigDir;
exports.getGlobalConfigPath = getGlobalConfigPath;
exports.hasGlobalConfig = hasGlobalConfig;
exports.readGlobalConfig = readGlobalConfig;
exports.writeGlobalConfig = writeGlobalConfig;
exports.deleteGlobalConfig = deleteGlobalConfig;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const logger_1 = require("../lib/logger");
/**
 * 전역 설정 파일 경로 및 구조 관리
 *
 * Linear API key와 Team ID를 사용자 홈 디렉토리에 저장하여
 * 여러 프로젝트에서 재사용 가능하도록 함
 */
const CONFIG_DIR = '.linear-sync';
const CONFIG_FILE = 'config.json';
/**
 * 전역 설정 디렉토리 경로 반환
 *
 * @returns ~/.linear-sync 디렉토리의 절대 경로
 */
function getGlobalConfigDir() {
    return path.join(os.homedir(), CONFIG_DIR);
}
/**
 * 전역 설정 파일 경로 반환
 *
 * @returns ~/.linear-sync/config.json 파일의 절대 경로
 */
function getGlobalConfigPath() {
    return path.join(getGlobalConfigDir(), CONFIG_FILE);
}
/**
 * 전역 설정이 존재하는지 확인
 *
 * @returns 설정 파일이 존재하고 유효하면 true
 */
function hasGlobalConfig() {
    const configPath = getGlobalConfigPath();
    if (!fs.existsSync(configPath)) {
        return false;
    }
    try {
        const config = readGlobalConfig();
        return !!(config.linearApiKey && config.linearTeamId);
    }
    catch {
        return false;
    }
}
/**
 * 전역 설정 읽기
 *
 * @returns 저장된 전역 설정
 * @throws Error 설정 파일이 없거나 읽을 수 없는 경우
 */
function readGlobalConfig() {
    const configPath = getGlobalConfigPath();
    if (!fs.existsSync(configPath)) {
        throw new Error('Global configuration not found. Run with --setup to configure.');
    }
    try {
        const content = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(content);
        if (!config.linearApiKey || !config.linearTeamId) {
            throw new Error('Invalid global configuration. Missing required fields.');
        }
        return config;
    }
    catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error('Global configuration file is corrupted. Please reconfigure.');
        }
        throw error;
    }
}
/**
 * 전역 설정 저장
 *
 * ~/.linear-sync 디렉토리가 없으면 자동 생성
 *
 * @param config - 저장할 설정
 * @throws Error 설정을 저장할 수 없는 경우
 */
function writeGlobalConfig(config) {
    const configDir = getGlobalConfigDir();
    const configPath = getGlobalConfigPath();
    // 디렉토리 생성 (없는 경우)
    if (!fs.existsSync(configDir)) {
        try {
            fs.mkdirSync(configDir, { recursive: true, mode: 0o700 });
            logger_1.logger.info({ configDir }, 'Created global config directory');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to create config directory: ${errorMessage}`);
        }
    }
    // 설정 파일 저장
    try {
        const content = JSON.stringify(config, null, 2);
        fs.writeFileSync(configPath, content, { encoding: 'utf-8', mode: 0o600 });
        logger_1.logger.info({ configPath }, 'Global config saved');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to write config file: ${errorMessage}`);
    }
}
/**
 * 전역 설정 삭제
 *
 * 테스트 또는 재설정 시 사용
 */
function deleteGlobalConfig() {
    const configPath = getGlobalConfigPath();
    if (fs.existsSync(configPath)) {
        try {
            fs.unlinkSync(configPath);
            logger_1.logger.info('Global config deleted');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger_1.logger.warn(`Failed to delete global config: ${errorMessage}`);
        }
    }
}
//# sourceMappingURL=global-config.js.map