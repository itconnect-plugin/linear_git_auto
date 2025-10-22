import { Command } from 'commander';
/**
 * Parse .env file content into key-value pairs.
 *
 * Handles:
 * - Empty lines (skipped)
 * - Comment lines starting with # (skipped)
 * - Malformed lines without = (skipped)
 * - Valid KEY=VALUE pairs
 *
 * @param content - Raw .env file content
 * @returns Object mapping environment variable names to values
 */
export declare function parseEnvFile(content: string): Record<string, string>;
/**
 * Read existing .env file if it exists.
 *
 * Returns an empty object if:
 * - File does not exist
 * - File cannot be read (permission error, etc.)
 * - File content is malformed
 *
 * @param envPath - Absolute path to .env file
 * @returns Parsed environment variables or empty object
 */
export declare function readExistingEnv(envPath: string): Record<string, string>;
/**
 * Update .env file while preserving existing values.
 *
 * Process:
 * 1. Read existing environment variables (if file exists)
 * 2. Merge new values with existing ones (new values take precedence)
 * 3. Write merged configuration back to file
 *
 * Preserves all existing environment variables not included in updates.
 *
 * @param envPath - Absolute path to .env file
 * @param updates - New or updated environment variables
 * @throws Error if file cannot be written
 */
export declare function updateEnvFile(envPath: string, updates: Record<string, string>): void;
/**
 * Register the init command with the CLI program.
 *
 * The init command:
 * 1. Reads existing .env configuration (if present)
 * 2. Prompts for Linear API credentials (with existing values as defaults)
 * 3. Updates .env file while preserving other variables
 * 4. Installs git commit hooks
 *
 * @param program - Commander program instance
 */
export declare function initCommand(program: Command): void;
//# sourceMappingURL=init.d.ts.map