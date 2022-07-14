#!/usr/bin/env -S node --experimental-json-modules --no-warnings --enable-source-maps

import { Command } from 'commander';
import { initConnections } from './api/AuthApi.js';
import pkg from '../package.json' assert { type: 'json' };
import { printMessage } from './ops/utils/Console.js';

// commands
import admin from './cli/admin/cmd.js';
import application from './cli/application/cmd.js';
import connections from './cli/connections/cmd.js';
import email from './cli/email/email.js';
import idm from './cli/idm/idm.js';
import idp from './cli/idp/idp.js';
import info from './cli/info/cmd.js';
import journey from './cli/journey/journey.js';
import logging from './cli/logging/logs.js';
import realm from './cli/realm/cmd.js';
import saml from './cli/saml/saml.js';
import script from './cli/script/cmd.js';
import secret from './cli/secret/cmd.js';
import theme from './cli/theme/cmd.js';

const program = new Command(pkg.name).version(
  `v${pkg.version} [${process.version}]`,
  '-v, --version'
);

(async () => {
  try {
    initConnections();

    program.addCommand(admin());
    program.addCommand(application());
    program.addCommand(connections());
    program.addCommand(email());
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
