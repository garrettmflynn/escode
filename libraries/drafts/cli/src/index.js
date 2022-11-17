#! /usr/bin/env node

import { Command, Option } from 'commander'
import conf from 'conf'
export const cliConfig = new conf({
    projectName: 'escode-cli'
});

import watch from './commands/watch/index.js';
import convert from './commands/convert/index.js';

const cli = new Command();
cli.version('0.0.0');
cli.description("The Command Line Interface for ESCode");
cli.name("escode");
cli.usage("<command>");
cli.addHelpCommand(true);
cli.helpOption(true);

//  ---------------- Base CLI Options ----------------
cli.option('-d,--debug', 'output extra debugging')

//  ---------------- CLI Commands ----------------

cli
.command('watch [files...]')
.description('watch a set of files')
.action(watch)

cli
.command('convert [files...]')
.description('convert one file to the other')
.action(convert)


cli.parse(process.argv)