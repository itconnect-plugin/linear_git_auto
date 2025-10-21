import { Command } from 'commander';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../lib/logger';

export function initCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize Linear-GitHub sync configuration')
    .action(async () => {
      logger.info('Starting initialization');

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'linearApiKey',
          message: 'Enter your Linear API key:',
          validate: (input) => (input ? true : 'API key is required'),
        },
        {
          type: 'input',
          name: 'linearTeamId',
          message: 'Enter your Linear Team ID:',
          validate: (input) => (input ? true : 'Team ID is required'),
        },
      ]);

      // Save to .env file
      const envPath = path.join(process.cwd(), '.env');
      const envContent = `LINEAR_API_KEY=${answers.linearApiKey}\nLINEAR_TEAM_ID=${answers.linearTeamId}\n`;
      fs.writeFileSync(envPath, envContent);

      logger.info('Configuration saved to .env');

      // Install git hooks
      const hooksDir = path.join(process.cwd(), '.git', 'hooks');
      if (fs.existsSync(hooksDir)) {
        const hookSource = path.join(__dirname, '../../hooks/prepare-commit-msg.sh');
        const hookDest = path.join(hooksDir, 'prepare-commit-msg');

        if (fs.existsSync(hookSource)) {
          fs.copyFileSync(hookSource, hookDest);
          fs.chmodSync(hookDest, '755');
          logger.info('Git hook installed');
        }
      }

      logger.info('Initialization complete!');
    });
}
