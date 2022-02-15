#!/usr/bin/env node --experimental-json-modules --no-warnings --enable-source-maps

import { Command } from 'commander';
import { initConnections } from './api/AuthApi.js';
import * as connections from './commands/connections/cmd.js';
import * as idm from './commands/idm/cmd.js';
import * as info from './commands/info/cmd.js';
import * as journey from './commands/journey/cmd.js';
import * as logging from './commands/logging/cmd.js';
import * as script from './commands/script/cmd.js';
import storage from './storage/SessionStorage.js';
import pkg from '../package.json';

// import fs from 'fs';
// const pkg = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

const program = new Command(pkg.name)
    .version(`v${pkg.version} [${process.version}]`, '-v, --version');

storage.session.setItem("version", `v${pkg.version} [${process.version}]`);

(async () => {
    try {
        initConnections();

        program.addCommand(connections.setup());
        program.addCommand(info.setup());
        program.addCommand(journey.setup());
        program.addCommand(script.setup());
        program.addCommand(idm.setup());
        program.addCommand(logging.setup());
        
        program.showHelpAfterError();
        program.parse();
    } catch (e) {
        console.error("ERROR: exception running frodo - ", e);
    }
})()
