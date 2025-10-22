import { Command } from 'commander';
import { LinearClient } from '../../linear/client';
import { SyncOrchestrator } from '../../sync/orchestrator';
import { getConfig } from '../../config';
import { logger } from '../../lib/logger';
import * as path from 'path';

export function runCommand(program: Command): void {
  program
    .command('run')
    .description('Sync tasks.md to Linear')
    .option('-f, --file <path>', 'Path to tasks.md file')
    .action(async (options) => {
      try {
        const config = getConfig();
        const client = new LinearClient(config.linearApiKey);
        const orchestrator = new SyncOrchestrator(client, config.linearTeamId);

        const tasksFile = options.file || path.join(process.cwd(), 'tasks.md');

        logger.info({ tasksFile }, 'Starting sync');
        await orchestrator.syncTasksFile(tasksFile);
        logger.info('Sync completed successfully');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error({
          error: errorMessage,
          stack: errorStack,
          type: error?.constructor?.name
        }, 'Sync failed');
        console.error('\n❌ Sync failed:', errorMessage);
        if (errorStack) {
          console.error('\nStack trace:');
          console.error(errorStack);
        }
        process.exit(1);
      }
    });
}
