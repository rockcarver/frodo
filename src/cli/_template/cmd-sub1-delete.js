import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps } from '@rockcarver/frodo-lib';
import storage from '../../storage/SessionStorage.js';

const { getTokens } = AuthenticateOps;

const program = new Command('frodo cmd sub1 delete');

program
  .description('Sub1 delete.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(
    new Option(
      '-i, --sub1-id <sub1-id>',
      'Sub1 id. If specified, -a and -A are ignored.'
    )
  )
  .addOption(
    new Option('-a, --all', 'Delete all sub1s in a realm. Ignored with -i.')
  )
  .addOption(
    new Option(
      '--no-deep',
      'No deep delete. This leaves orphaned configuration artifacts behind.'
    )
  )
  .addOption(
    new Option(
      '--verbose',
      'Verbose output during command execution. If specified, may or may not produce additional output.'
    ).default(false, 'off')
  )
  .action(
    // implement command logic inside action handler
    async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        // code goes here
      }
    }
    // end command logic inside action handler
  );

program.parse();
