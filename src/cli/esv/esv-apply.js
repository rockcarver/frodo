import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../ops/AuthenticateOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';
import { applyUpdates, checkForUpdates } from '../../ops/StartupOps.js';

const program = new Command('frodo esv variable');

program
  .description('Manage variables.')
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
      '--check-only',
      "Check if updated need to be apply but don't apply them."
    ).default(false, 'false')
  )
  .addOption(
    new Option('--force', 'Force restart of services if no updates are found.')
  )
  .addOption(
    new Option('--no-wait', "Don't wait for the updates to finish applying.")
  )
  .addOption(
    new Option(
      '--verbose',
      'Verbose output during command execution. If specified, may or may not produce additional output.'
    ).default(false, 'off')
  )
  .addOption(new Option('-y, --yes', 'Answer y/yes to all prompts.'))
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
        // check for updates only
        if (options.checkOnly) {
          printMessage(`Checking for updates...`);
          await checkForUpdates();
        }
        // apply updates
        else {
          printMessage(`Applying updates...`);
          await applyUpdates(options.force, options.wait, options.yes);
        }
      }
    }
    // end command logic inside action handler
  );

program.parse();
