import { Command } from 'commander';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { loadMappings } from '../../mapping/manager';
import { logger } from '../../lib/logger';

export function startTaskCommand(program: Command): void {
  program
    .command('start-task')
    .description('Start working on a task (creates branch)')
    .action(async () => {
      const mappings = loadMappings();

      if (mappings.length === 0) {
        console.log('No tasks found. Run "linear-sync run" first.');
        return;
      }

      const choices = mappings.map((m) => ({
        name: `${m.linearIssueId}: ${m.taskTitle}`,
        value: m,
      }));

      const { selectedMapping } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedMapping',
          message: 'Select a task to work on:',
          choices,
        },
      ]);

      try {
        execSync(`git checkout -b ${selectedMapping.branchName}`, { stdio: 'inherit' });

        console.log(`\n✅ Created and switched to branch: ${selectedMapping.branchName}`);
        console.log(`📌 Linear Issue: ${selectedMapping.linearIssueId}`);
        console.log(`🔗 ${selectedMapping.linearIssueUrl}\n`);
        console.log('Commits will automatically include the issue ID!\n');

        logger.info({ branch: selectedMapping.branchName }, 'Started task');
      } catch (error) {
        logger.error({ error }, 'Failed to create branch');
        console.error('Failed to create branch. It may already exist.');
      }
    });
}
