import { Command } from 'commander';
import { loadMappings } from '../../mapping/manager';
import { logger } from '../../lib/logger';

export function statusCommand(program: Command): void {
  program
    .command('status')
    .description('Show sync status and mapping statistics')
    .action(() => {
      const mappings = loadMappings();

      console.log('\n=== Linear-GitHub Sync Status ===\n');
      console.log(`Total synced tasks: ${mappings.length}`);

      if (mappings.length > 0) {
        console.log('\nRecent mappings:');
        mappings.slice(-5).forEach((m) => {
          console.log(`  ${m.taskId} → ${m.linearIssueId} (${m.branchName})`);
        });
      }

      logger.info({ mappingCount: mappings.length }, 'Status displayed');
    });
}
