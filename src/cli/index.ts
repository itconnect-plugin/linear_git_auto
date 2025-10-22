#!/usr/bin/env node

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { runCommand } from './commands/run';
import { statusCommand } from './commands/status';
import { startTaskCommand } from './commands/start-task';
import { quickstartCommand } from './commands/quickstart';

const program = new Command();

program
  .name('linear-sync')
  .description('CLI tool to sync Speckit tasks.md with Linear issues')
  .version('0.1.0');

// Quickstart command (recommended for first-time setup)
quickstartCommand(program);

// Individual commands
initCommand(program);
runCommand(program);
startTaskCommand(program);
statusCommand(program);

program.parse();
