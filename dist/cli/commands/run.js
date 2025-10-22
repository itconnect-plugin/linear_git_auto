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
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = runCommand;
const client_1 = require("../../linear/client");
const orchestrator_1 = require("../../sync/orchestrator");
const config_1 = require("../../config");
const logger_1 = require("../../lib/logger");
const path = __importStar(require("path"));
function runCommand(program) {
    program
        .command('run')
        .description('Sync tasks.md to Linear')
        .option('-f, --file <path>', 'Path to tasks.md file')
        .action(async (options) => {
        try {
            const config = (0, config_1.getConfig)();
            const client = new client_1.LinearClient(config.linearApiKey);
            const orchestrator = new orchestrator_1.SyncOrchestrator(client, config.linearTeamId);
            const tasksFile = options.file || path.join(process.cwd(), 'tasks.md');
            logger_1.logger.info({ tasksFile }, 'Starting sync');
            await orchestrator.syncTasksFile(tasksFile);
            logger_1.logger.info('Sync completed successfully');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            logger_1.logger.error({
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
//# sourceMappingURL=run.js.map