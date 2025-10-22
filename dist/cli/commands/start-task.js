"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTaskCommand = startTaskCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const child_process_1 = require("child_process");
const manager_1 = require("../../mapping/manager");
const logger_1 = require("../../lib/logger");
function startTaskCommand(program) {
    program
        .command('start-task')
        .description('Start working on a task (creates branch)')
        .action(async () => {
        const mappings = (0, manager_1.loadMappings)();
        if (mappings.length === 0) {
            console.log('No tasks found. Run "linear-sync run" first.');
            return;
        }
        const choices = mappings.map((m) => ({
            name: `${m.linearIssueId}: ${m.taskTitle}`,
            value: m,
        }));
        const { selectedMapping } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'selectedMapping',
                message: 'Select a task to work on:',
                choices,
            },
        ]);
        try {
            (0, child_process_1.execSync)(`git checkout -b ${selectedMapping.branchName}`, { stdio: 'inherit' });
            console.log(`\n✅ Created and switched to branch: ${selectedMapping.branchName}`);
            console.log(`📌 Linear Issue: ${selectedMapping.linearIssueId}`);
            console.log(`🔗 ${selectedMapping.linearIssueUrl}\n`);
            console.log('Commits will automatically include the issue ID!\n');
            logger_1.logger.info({ branch: selectedMapping.branchName }, 'Started task');
        }
        catch (error) {
            logger_1.logger.error({ error }, 'Failed to create branch');
            console.error('Failed to create branch. It may already exist.');
        }
    });
}
//# sourceMappingURL=start-task.js.map