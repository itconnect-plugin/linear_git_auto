import { Command } from 'commander';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../lib/logger';
import {
  hasGlobalConfig,
  readGlobalConfig,
  writeGlobalConfig,
  GlobalConfig,
} from '../../config/global-config';
import { findTasksFile, findGitRoot } from '../../lib/file-finder';
import { LinearClient } from '../../linear/client';
import { SyncOrchestrator } from '../../sync/orchestrator';

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
} as const;

const VALIDATION_MESSAGES = {
  API_KEY_REQUIRED: 'API key is required',
  TEAM_ID_REQUIRED: 'Team ID is required',
} as const;

export function quickstartCommand(program: Command): void {
  program
    .command('quickstart')
    .description('Quick setup: configure and sync in one command')
    .option('-f, --file <path>', 'Path to tasks.md file (auto-detected if not provided)')
    .option('--skip-sync', 'Skip automatic sync after setup')
    .action(async (options) => {
      try {
        await runQuickstart(options);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Quickstart failed: ${errorMessage}`);
        console.error('\n❌ Quickstart failed:', errorMessage);
        process.exit(1);
      }
    });
}

/**
 * Quickstart 워크플로우 실행
 */
async function runQuickstart(options: {
  file?: string;
  skipSync?: boolean;
}): Promise<void> {
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
  const tasksFile = options.file || findTasksFile();
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
async function ensureGlobalConfig(): Promise<GlobalConfig> {
  // 기존 설정이 있으면 재사용
  if (hasGlobalConfig()) {
    const config = readGlobalConfig();
    console.log('📋 Using existing global configuration');
    console.log(`   Team ID: ${config.linearTeamId}`);
    console.log(`   API Key: ${maskApiKey(config.linearApiKey)}\n`);
    return config;
  }

  // 새로운 설정 생성
  console.log('🔧 No global configuration found. Let\'s set it up!\n');
  const config = await promptForCredentials();
  writeGlobalConfig(config);
  console.log('💾 Configuration saved globally (~/.linear-sync/config.json)');
  console.log('   This will be reused across all your projects.\n');
  return config;
}

/**
 * Linear 자격 증명 입력 받기
 */
async function promptForCredentials(): Promise<GlobalConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'linearApiKey',
      message: PROMPTS.LINEAR_API_KEY,
      validate: (input: string) =>
        input ? true : VALIDATION_MESSAGES.API_KEY_REQUIRED,
    },
    {
      type: 'input',
      name: 'linearTeamId',
      message: PROMPTS.LINEAR_TEAM_ID,
      validate: (input: string) =>
        input ? true : VALIDATION_MESSAGES.TEAM_ID_REQUIRED,
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
function installGitHooks(): void {
  const gitRoot = findGitRoot();

  if (!gitRoot) {
    console.log('⚠️  Git repository not found. Skipping git hooks installation.');
    return;
  }

  const hooksDir = path.join(gitRoot, '.git', 'hooks');
  const hookSource = path.join(__dirname, '../../hooks/prepare-commit-msg.sh');
  const hookDest = path.join(hooksDir, 'prepare-commit-msg');

  if (!fs.existsSync(hookSource)) {
    logger.warn('Git hook source file not found');
    return;
  }

  try {
    fs.copyFileSync(hookSource, hookDest);
    fs.chmodSync(hookDest, '755');
    console.log('🪝 Git commit hook installed');
    console.log('   Commits will be auto-prefixed with Linear issue IDs');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn(`Failed to install git hook: ${errorMessage}`);
    console.log('⚠️  Could not install git hooks (non-critical)');
  }
}

/**
 * Linear 동기화 실행
 */
async function runSync(config: GlobalConfig, tasksFile: string): Promise<void> {
  console.log('🔄 Starting sync to Linear...\n');

  const client = new LinearClient(config.linearApiKey);
  const orchestrator = new SyncOrchestrator(client, config.linearTeamId);

  try {
    await orchestrator.syncTasksFile(tasksFile);
    console.log('\n✅ Sync completed successfully!\n');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ error: errorMessage }, 'Sync failed');
    throw new Error(`Sync failed: ${errorMessage}`);
  }
}

/**
 * 다음 단계 안내
 */
function printNextSteps(): void {
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
function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) {
    return '***';
  }
  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}

