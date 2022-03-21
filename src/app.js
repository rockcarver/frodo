#!/usr/bin/env -S node --experimental-json-modules --no-warnings --enable-source-maps

import { Command } from 'commander';
import { initConnections } from './api/AuthApi.js';
import admin from './commands/admin/cmd.js';
import connections from './commands/connections/cmd.js';
import idm from './commands/idm/cmd.js';
import info from './commands/info/cmd.js';
import journey from './commands/journey/cmd.js';
import logging from './commands/logging/cmd.js';
import script from './commands/script/cmd.js';
import emailTemplate from './commands/email_templates/cmd.js';
import storage from './storage/SessionStorage.js';
import application from './commands/application/cmd.js';
import pkg from '../package.json' assert { type: 'json' };

const program = new Command(pkg.name).version(
  `v${pkg.version} [${process.version}]`,
  '-v, --version'
);

storage.session.setFrodoVersion(`v${pkg.version} [${process.version}]`);

(async () => {
  try {
    initConnections();

    program.addCommand(admin());
    program.addCommand(application());
    program.addCommand(connections());
    program.addCommand(emailTemplate());
    program.addCommand(idm());
    program.addCommand(info());
    program.addCommand(journey());
    program.addCommand(logging());
    program.addCommand(script());

    program.showHelpAfterError();
    program.parse();
  } catch (e) {
    console.error('ERROR: exception running frodo - ', e);
  }
})();
