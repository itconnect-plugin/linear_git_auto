"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusCommand = statusCommand;
const manager_1 = require("../../mapping/manager");
const logger_1 = require("../../lib/logger");
function statusCommand(program) {
    program
        .command('status')
        .description('Show sync status and mapping statistics')
        .action(() => {
        const mappings = (0, manager_1.loadMappings)();
        console.log('\n=== Linear-GitHub Sync Status ===\n');
        console.log(`Total synced tasks: ${mappings.length}`);
        if (mappings.length > 0) {
            console.log('\nRecent mappings:');
            mappings.slice(-5).forEach((m) => {
                console.log(`  ${m.taskId} → ${m.linearIssueId} (${m.branchName})`);
            });
        }
        logger_1.logger.info({ mappingCount: mappings.length }, 'Status displayed');
    });
}
//# sourceMappingURL=status.js.map