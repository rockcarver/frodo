#!/usr/bin/env -S node --no-warnings --enable-source-maps

import { Command } from 'commander';
import { initConnectionProfiles } from './ops/ConnectionProfileOps.js';
import pkg from '../package.json' assert { type: 'json' };
import { printMessage } from './ops/utils/Console.js';

// commands
import admin from './cli/admin/admin.js';
import app from './cli/app/app.js';
import conn from './cli/conn/conn.js';
import email from './cli/email/email.js';
import esv from './cli/esv/esv.js';
import idm from './cli/idm/idm.js';
import idp from './cli/idp/idp.js';
import info from './cli/info/info.js';
import journey from './cli/journey/journey.js';
import logging from './cli/logging/logs.js';
import realm from './cli/realm/realm.js';
import saml from './cli/saml/saml.js';
import script from './cli/script/script.js';
import theme from './cli/theme/theme.js';

const program = new Command(pkg.name).version(
  `v${pkg.version} [${process.version}]`,
  '-v, --version'
);

(async () => {
  try {
    initConnectionProfiles();

    program.addCommand(admin());
    program.addCommand(app());
    program.addCommand(conn());
    program.addCommand(email());
    program.addCommand(esv());
    program.addCommand(idm());
    program.addCommand(idp());
    program.addCommand(info());
    program.addCommand(journey());
    program.addCommand(logging());
    program.addCommand(realm());
    program.addCommand(saml());
    program.addCommand(script());
    program.addCommand(theme());

    program.showHelpAfterError();
    program.enablePositionalOptions();
    program.parse();
  } catch (e) {
    printMessage(`ERROR: exception running frodo - ${e}`, 'error');
  }
})();
