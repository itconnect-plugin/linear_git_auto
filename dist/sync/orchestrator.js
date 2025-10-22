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
exports.SyncOrchestrator = void 0;
const tasks_parser_1 = require("../parsers/tasks-parser");
const issue_creator_1 = require("../linear/issue-creator");
const project_manager_1 = require("../linear/project-manager");
const manager_1 = require("../mapping/manager");
const logger_1 = require("../lib/logger");
const fs = __importStar(require("fs"));
// Default project name for tasks.md sync
const DEFAULT_PROJECT_NAME = 'Linear-GitHub Automation';
class SyncOrchestrator {
    linearClient;
    teamId;
    issueCreator;
    projectManager;
    constructor(linearClient, teamId) {
        this.linearClient = linearClient;
        this.teamId = teamId;
        this.issueCreator = new issue_creator_1.IssueCreator(linearClient);
        this.projectManager = new project_manager_1.ProjectManager(linearClient);
    }
    async syncTasksFile(tasksFilePath) {
        logger_1.logger.info({ tasksFilePath }, 'Starting sync');
        const content = fs.readFileSync(tasksFilePath, 'utf-8');
        const tasks = (0, tasks_parser_1.parseTasksFile)(content);
        logger_1.logger.info({ taskCount: tasks.length }, 'Parsed tasks');
        // Extract project name from tasks.md or use default
        const projectName = this.extractProjectName(content) || DEFAULT_PROJECT_NAME;
        // Find or create project
        logger_1.logger.info({ projectName }, 'Finding or creating project');
        const project = await this.projectManager.findOrCreateProject(this.teamId, projectName, `Automated project created from ${tasksFilePath}`);
        logger_1.logger.info({ projectId: project.id, projectName: project.name }, 'Using project');
        for (const task of tasks) {
            const existing = (0, manager_1.findMappingByTaskId)(task.id);
            if (existing) {
                logger_1.logger.info({ taskId: task.id }, 'Task already synced, skipping');
                continue;
            }
            try {
                const issue = await this.issueCreator.createIssue(this.teamId, task, project.id // Add issue to project
                );
                (0, manager_1.addMapping)({
                    taskId: task.id,
                    taskTitle: task.title,
                    linearIssueId: issue.identifier,
                    linearIssueUuid: issue.id,
                    linearIssueUrl: issue.url,
                    branchName: `${issue.identifier}-${this.slugify(task.title)}`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                logger_1.logger.info({ taskId: task.id, linearId: issue.identifier, projectId: project.id }, 'Created Linear issue in project');
            }
            catch (error) {
                logger_1.logger.error({ taskId: task.id, error }, 'Failed to create issue');
            }
        }
        logger_1.logger.info('Sync completed');
    }
    /**
     * Extract project name from first # header in tasks.md
     * Example: "# Tasks: Linear-GitHub Automation" → "Linear-GitHub Automation"
     */
    extractProjectName(content) {
        const match = content.match(/^#\s+Tasks:\s*(.+)$/m);
        return match ? match[1].trim() : null;
    }
    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 50);
    }
}
exports.SyncOrchestrator = SyncOrchestrator;
//# sourceMappingURL=orchestrator.js.map