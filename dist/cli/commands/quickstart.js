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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quickstartCommand = quickstartCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../../lib/logger");
const global_config_1 = require("../../config/global-config");
const file_finder_1 = require("../../lib/file-finder");
const client_1 = require("../../linear/client");
const orchestrator_1 = require("../../sync/orchestrator");
/**
 * Quickstart 명령어
 *
 * 한 번의 명령으로 다음을 모두 처리:
 * 1. 전역 설정 확인/생성 (Linear API key, Team ID)
 * 2. Git hooks 설치
 * 3. tasks.md 자동 탐지
 * 4. Linear 동기화 실행
 */
const PROMPTS = {
    LINEAR_API_KEY: 'Enter your Linear API key:',
    LINEAR_TEAM_ID: 'Enter your Linear Team ID:',
};
const VALIDATION_MESSAGES = {
    API_KEY_REQUIRED: 'API key is required',
    TEAM_ID_REQUIRED: 'Team ID is required',
};
function quickstartCommand(program) {
    program
        .command('quickstart')
        .description('Quick setup: configure and sync in one command')
        .option('-f, --file <path>', 'Path to tasks.md file (auto-detected if not provided)')
        .option('--skip-sync', 'Skip automatic sync after setup')
        .action(async (options) => {
        try {
            await runQuickstart(options);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger_1.logger.error(`Quickstart failed: ${errorMessage}`);
            console.error('\n❌ Quickstart failed:', errorMessage);
            process.exit(1);
        }
    });
}
/**
 * Quickstart 워크플로우 실행
 */
async function runQuickstart(options) {
    console.log('🚀 Linear-GitHub Sync Quickstart\n');
    // Step 1: 전역 설정 확인/생성
    const config = await ensureGlobalConfig();
    console.log('✅ Configuration ready\n');
    // Step 2: Git hooks 설치
    installGitHooks();
    console.log('✅ Git hooks installed\n');
    // Skip sync if requested
    if (options.skipSync) {
        console.log('⏭️  Skipping sync as requested\n');
        printNextSteps();
        return;
    }
    // Step 3: tasks.md 탐지
    const tasksFile = options.file || (0, file_finder_1.findTasksFile)();
    if (!tasksFile) {
        console.log('⚠️  tasks.md not found in current or parent directories');
        console.log('   You can run sync manually: linear-sync run --file <path>');
        printNextSteps();
        return;
    }
    console.log(`📄 Found tasks.md: ${tasksFile}\n`);
    // Step 4: 동기화 실행
    await runSync(config, tasksFile);
    // 완료 메시지
    printNextSteps();
}
/**
 * 전역 설정 확인 및 필요시 생성
 *
 * @returns 사용 가능한 전역 설정
 */
async function ensureGlobalConfig() {
    // 기존 설정이 있으면 재사용
    if ((0, global_config_1.hasGlobalConfig)()) {
        const config = (0, global_config_1.readGlobalConfig)();
        console.log('📋 Using existing global configuration');
        console.log(`   Team ID: ${config.linearTeamId}`);
        console.log(`   API Key: ${maskApiKey(config.linearApiKey)}\n`);
        return config;
    }
    // 새로운 설정 생성
    console.log('🔧 No global configuration found. Let\'s set it up!\n');
    const config = await promptForCredentials();
    (0, global_config_1.writeGlobalConfig)(config);
    console.log('💾 Configuration saved globally (~/.linear-sync/config.json)');
    console.log('   This will be reused across all your projects.\n');
    return config;
}
/**
 * Linear 자격 증명 입력 받기
 */
async function promptForCredentials() {
    const answers = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'linearApiKey',
            message: PROMPTS.LINEAR_API_KEY,
            validate: (input) => input ? true : VALIDATION_MESSAGES.API_KEY_REQUIRED,
        },
        {
            type: 'input',
            name: 'linearTeamId',
            message: PROMPTS.LINEAR_TEAM_ID,
            validate: (input) => input ? true : VALIDATION_MESSAGES.TEAM_ID_REQUIRED,
        },
    ]);
    return {
        linearApiKey: answers.linearApiKey,
        linearTeamId: answers.linearTeamId,
    };
}
/**
 * Git hooks 설치
 */
function installGitHooks() {
    const gitRoot = (0, file_finder_1.findGitRoot)();
    if (!gitRoot) {
        console.log('⚠️  Git repository not found. Skipping git hooks installation.');
        return;
    }
    const hooksDir = path.join(gitRoot, '.git', 'hooks');
    const hookSource = path.join(__dirname, '../../hooks/prepare-commit-msg.sh');
    const hookDest = path.join(hooksDir, 'prepare-commit-msg');
    if (!fs.existsSync(hookSource)) {
        logger_1.logger.warn('Git hook source file not found');
        return;
    }
    try {
        fs.copyFileSync(hookSource, hookDest);
        fs.chmodSync(hookDest, '755');
        console.log('🪝 Git commit hook installed');
        console.log('   Commits will be auto-prefixed with Linear issue IDs');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger_1.logger.warn(`Failed to install git hook: ${errorMessage}`);
        console.log('⚠️  Could not install git hooks (non-critical)');
    }
}
/**
 * Linear 동기화 실행
 */
async function runSync(config, tasksFile) {
    console.log('🔄 Starting sync to Linear...\n');
    const client = new client_1.LinearClient(config.linearApiKey);
    const orchestrator = new orchestrator_1.SyncOrchestrator(client, config.linearTeamId);
    try {
        await orchestrator.syncTasksFile(tasksFile);
        console.log('\n✅ Sync completed successfully!\n');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger_1.logger.error({ error: errorMessage }, 'Sync failed');
        throw new Error(`Sync failed: ${errorMessage}`);
    }
}
/**
 * 다음 단계 안내
 */
function printNextSteps() {
    console.log('━'.repeat(60));
    console.log('\n📚 Next Steps:\n');
    console.log('  1. Start working on a task:');
    console.log('     $ linear-sync start-task\n');
    console.log('  2. Sync tasks anytime:');
    console.log('     $ linear-sync run\n');
    console.log('  3. Check status:');
    console.log('     $ linear-sync status\n');
    console.log('━'.repeat(60));
    console.log();
}
/**
 * API key 마스킹 (보안)
 */
function maskApiKey(apiKey) {
    if (apiKey.length <= 8) {
        return '***';
    }
    return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}
//# sourceMappingURL=quickstart.js.map