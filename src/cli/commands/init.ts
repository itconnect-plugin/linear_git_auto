import { Command } from 'commander';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../lib/logger';

/**
 * Parse .env file content into key-value pairs
 */
export function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = trimmed.substring(0, equalsIndex).trim();
    const value = trimmed.substring(equalsIndex + 1).trim();

    if (key) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Read existing .env file if it exists
 */
export function readExistingEnv(envPath: string): Record<string, string> {
  if (!fs.existsSync(envPath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(envPath, 'utf-8');
    return parseEnvFile(content);
  } catch (error) {
    logger.warn(`Could not read existing .env file: ${error}`);
    return {};
  }
}

/**
 * Update .env file while preserving existing values
 */
export function updateEnvFile(
  envPath: string,
  updates: Record<string, string>
): void {
  // Read existing env vars
  const existingEnv = readExistingEnv(envPath);

  // Merge updates
  const mergedEnv = { ...existingEnv, ...updates };

  // Write back to file
  const envContent = Object.entries(mergedEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n') + '\n';

  fs.writeFileSync(envPath, envContent);
}

export function initCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize Linear-GitHub sync configuration')
    .action(async () => {
      logger.info('Starting initialization');

      // Read existing .env file
      const envPath = path.join(process.cwd(), '.env');
      const existingEnv = readExistingEnv(envPath);

      // Prompt with existing values as defaults
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'linearApiKey',
          message: 'Enter your Linear API key:',
          default: existingEnv.LINEAR_API_KEY || '',
          validate: (input) => (input ? true : 'API key is required'),
        },
        {
          type: 'input',
          name: 'linearTeamId',
          message: 'Enter your Linear Team ID:',
          default: existingEnv.LINEAR_TEAM_ID || '',
          validate: (input) => (input ? true : 'Team ID is required'),
        },
      ]);

      // Update .env file (preserving other variables)
      updateEnvFile(envPath, {
        LINEAR_API_KEY: answers.linearApiKey,
        LINEAR_TEAM_ID: answers.linearTeamId,
      });

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
