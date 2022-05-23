#!/usr/bin/env -S node --experimental-json-modules --no-warnings --enable-source-maps

import { Command } from 'commander';
import { initConnections } from './api/AuthApi.js';
import storage from './storage/SessionStorage.js';
import pkg from '../package.json' assert { type: 'json' };
import { printMessage } from './api/utils/Console.js';

// commands
import admin from './cli/admin/cmd.js';
import application from './cli/application/cmd.js';
import connections from './cli/connections/cmd.js';
import emailTemplate from './cli/email_templates/cmd.js';
import idm from './cli/idm/cmd.js';
import idp from './cli/idp/cmd.js';
import info from './cli/info/cmd.js';
import journey from './cli/journey/cmd.js';
import logging from './cli/logging/cmd.js';
import realm from './cli/realm/cmd.js';
import saml from './cli/saml/saml.js';
import script from './cli/script/cmd.js';
import secret from './cli/secret/cmd.js';
import theme from './cli/theme/cmd.js';

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
    program.addCommand(idp());
    program.addCommand(info());
    program.addCommand(journey());
    program.addCommand(logging());
    program.addCommand(realm());
    program.addCommand(saml());
    program.addCommand(script());
    program.addCommand(secret());
    program.addCommand(theme());

    program.showHelpAfterError();
    program.parse();
  } catch (e) {
    printMessage(`ERROR: exception running frodo - ${e}`, 'error');
  }
})();
