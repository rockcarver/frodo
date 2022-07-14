import { Command } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import { countManagedObjects } from '../../ops/IdmOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';

const program = new Command('frodo idm count');

program
  .description('Count number of managed objects of a given type.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.managedNameOptionM)
  .addOption(common.insecureOption)
  // .addOption(
  //   new Option('-l, --long', 'Long with all fields.').default(false, 'false')
  // )
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
        printMessage(`Counting managed ${options.name} objects...`);
        countManagedObjects(options.name);
      }
    }
    // end command logic inside action handler
  );

program.parse();
