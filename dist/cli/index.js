#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables from .env file
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const commander_1 = require("commander");
const init_1 = require("./commands/init");
const run_1 = require("./commands/run");
const status_1 = require("./commands/status");
const start_task_1 = require("./commands/start-task");
const quickstart_1 = require("./commands/quickstart");
const program = new commander_1.Command();
program
    .name('linear-sync')
    .description('CLI tool to sync Speckit tasks.md with Linear issues')
    .version('0.1.0');
// Quickstart command (recommended for first-time setup)
(0, quickstart_1.quickstartCommand)(program);
// Individual commands
(0, init_1.initCommand)(program);
(0, run_1.runCommand)(program);
(0, start_task_1.startTaskCommand)(program);
(0, status_1.statusCommand)(program);
program.parse();
//# sourceMappingURL=index.js.map