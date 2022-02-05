import { Command } from 'commander';
import { initConnections } from './api/AuthApi.js';
import * as connections from './modules/connections/cmd.js';
import * as idm from './modules/idm/cmd.js';
import * as info from './modules/info/cmd.js';
import * as journey from './modules/journey/cmd.js';
import * as logging from './modules/logging/cmd.js';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const program = new Command(pkg.name)
    .version(`v${pkg.version} [${process.version}]`, '-v, --version');

(async () => {
    try {
        initConnections();

        program.addCommand(connections.setup());
        program.addCommand(idm.setup());
        program.addCommand(info.setup());
        program.addCommand(journey.setup());
        program.addCommand(logging.setup());
        
        program.showHelpAfterError();
        program.parse();
    } catch (e) {
        console.error("ERROR: exception running frodo - ", e);
    }
})()
