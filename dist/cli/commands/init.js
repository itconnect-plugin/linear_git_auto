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
exports.parseEnvFile = parseEnvFile;
exports.readExistingEnv = readExistingEnv;
exports.updateEnvFile = updateEnvFile;
exports.initCommand = initCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../../lib/logger");
// Constants
const ENV_FILE_NAME = '.env';
const ENV_FILE_ENCODING = 'utf-8';
const COMMENT_PREFIX = '#';
const KEY_VALUE_SEPARATOR = '=';
const ENV_KEYS = {
    LINEAR_API_KEY: 'LINEAR_API_KEY',
    LINEAR_TEAM_ID: 'LINEAR_TEAM_ID',
};
const PROMPTS = {
    LINEAR_API_KEY: 'Enter your Linear API key:',
    LINEAR_TEAM_ID: 'Enter your Linear Team ID:',
};
const VALIDATION_MESSAGES = {
    API_KEY_REQUIRED: 'API key is required',
    TEAM_ID_REQUIRED: 'Team ID is required',
};
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
function parseEnvFile(content) {
    const result = {};
    const lines = content.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith(COMMENT_PREFIX)) {
            continue;
        }
        const separatorIndex = trimmed.indexOf(KEY_VALUE_SEPARATOR);
        if (separatorIndex === -1) {
            // Skip malformed lines without separator
            continue;
        }
        const key = trimmed.substring(0, separatorIndex).trim();
        const value = trimmed.substring(separatorIndex + 1).trim();
        if (key) {
            result[key] = value;
        }
    }
    return result;
}
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
function readExistingEnv(envPath) {
    if (!fs.existsSync(envPath)) {
        logger_1.logger.info(`No existing ${ENV_FILE_NAME} file found`);
        return {};
    }
    try {
        const content = fs.readFileSync(envPath, ENV_FILE_ENCODING);
        return parseEnvFile(content);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger_1.logger.warn(`Could not read existing ${ENV_FILE_NAME} file: ${errorMessage}. Starting with empty configuration.`);
        return {};
    }
}
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
function updateEnvFile(envPath, updates) {
    // Read existing env vars (empty object if file doesn't exist)
    const existingEnv = readExistingEnv(envPath);
    // Merge updates (updates override existing values)
    const mergedEnv = { ...existingEnv, ...updates };
    // Serialize to .env format
    const envContent = serializeEnvVars(mergedEnv);
    // Write to file
    try {
        fs.writeFileSync(envPath, envContent, ENV_FILE_ENCODING);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to write ${ENV_FILE_NAME}: ${errorMessage}`);
    }
}
/**
 * Serialize environment variables to .env file format.
 *
 * @param envVars - Environment variables to serialize
 * @returns Formatted .env file content
 */
function serializeEnvVars(envVars) {
    return (Object.entries(envVars)
        .map(([key, value]) => `${key}${KEY_VALUE_SEPARATOR}${value}`)
        .join('\n') + '\n');
}
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
function initCommand(program) {
    program
        .command('init')
        .description('Initialize Linear-GitHub sync configuration')
        .action(async () => {
        try {
            await runInitialization();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger_1.logger.error(`Initialization failed: ${errorMessage}`);
            process.exit(1);
        }
    });
}
/**
 * Execute the initialization workflow.
 */
async function runInitialization() {
    logger_1.logger.info('Starting initialization');
    // Get path to .env file in current working directory
    const envPath = getEnvFilePath();
    // Read existing configuration
    const existingEnv = readExistingEnv(envPath);
    // Prompt user for credentials
    const credentials = await promptForCredentials(existingEnv);
    // Save configuration
    updateEnvFile(envPath, credentials);
    logger_1.logger.info(`Configuration saved to ${ENV_FILE_NAME}`);
    // Install git hooks
    installGitHooks();
    logger_1.logger.info('Initialization complete!');
}
/**
 * Get the absolute path to the .env file in the current working directory.
 *
 * @returns Absolute path to .env file
 */
function getEnvFilePath() {
    return path.join(process.cwd(), ENV_FILE_NAME);
}
/**
 * Prompt user for Linear API credentials.
 *
 * Uses existing values as defaults if available.
 *
 * @param existingEnv - Existing environment variables
 * @returns User-provided credentials
 */
async function promptForCredentials(existingEnv) {
    const answers = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'linearApiKey',
            message: PROMPTS.LINEAR_API_KEY,
            default: existingEnv[ENV_KEYS.LINEAR_API_KEY] || '',
            validate: (input) => (input ? true : VALIDATION_MESSAGES.API_KEY_REQUIRED),
        },
        {
            type: 'input',
            name: 'linearTeamId',
            message: PROMPTS.LINEAR_TEAM_ID,
            default: existingEnv[ENV_KEYS.LINEAR_TEAM_ID] || '',
            validate: (input) => (input ? true : VALIDATION_MESSAGES.TEAM_ID_REQUIRED),
        },
    ]);
    return {
        [ENV_KEYS.LINEAR_API_KEY]: answers.linearApiKey,
        [ENV_KEYS.LINEAR_TEAM_ID]: answers.linearTeamId,
    };
}
/**
 * Install git commit hooks if .git directory exists.
 *
 * Copies prepare-commit-msg hook to .git/hooks and makes it executable.
 */
function installGitHooks() {
    const hooksDir = path.join(process.cwd(), '.git', 'hooks');
    if (!fs.existsSync(hooksDir)) {
        logger_1.logger.warn('Git repository not found. Skipping git hooks installation.');
        return;
    }
    const hookSource = path.join(__dirname, '../../hooks/prepare-commit-msg.sh');
    const hookDest = path.join(hooksDir, 'prepare-commit-msg');
    if (!fs.existsSync(hookSource)) {
        logger_1.logger.warn('Git hook source file not found. Skipping installation.');
        return;
    }
    try {
        fs.copyFileSync(hookSource, hookDest);
        fs.chmodSync(hookDest, '755');
        logger_1.logger.info('Git hook installed successfully');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger_1.logger.warn(`Failed to install git hook: ${errorMessage}`);
    }
}
//# sourceMappingURL=init.js.map