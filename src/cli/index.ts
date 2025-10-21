#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { runCommand } from './commands/run';
import { statusCommand } from './commands/status';
import { startTaskCommand } from './commands/start-task';

const program = new Command();

program
  .name('linear-sync')
  .description('CLI tool to sync Speckit tasks.md with Linear issues')
  .version('0.1.0');

initCommand(program);
runCommand(program);
startTaskCommand(program);
statusCommand(program);

program.parse();
