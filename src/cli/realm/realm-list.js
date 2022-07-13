import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../ops/AuthenticateOps.js';
import storage from '../../storage/SessionStorage.js';
import { createTable, printMessage } from '../../ops/utils/Console.js';
import { listRealms } from '../../api/RealmApi.js';

const program = new Command('frodo realm list');

program
  .description('List realms.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(
    new Option('-l, --long', 'Long with all fields.').default(false, 'false')
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
        printMessage('Listing all realms...');
        const realms = await listRealms();
        if (options.long) {
          const table = createTable([
            'Name'.brightCyan,
            'Status'.brightCyan,
            'Custom Domains'.brightCyan,
            'Parent'.brightCyan,
          ]);
          realms.forEach((realmConfig) => {
            table.push([
              realmConfig.name,
              realmConfig.active ? 'active'.brightGreen : 'inactive'.brightRed,
              realmConfig.aliases.join('\n'),
              realmConfig.parentPath,
            ]);
          });
          printMessage(table.toString());
        } else {
          realms.forEach((realmConfig) => {
            printMessage(realmConfig.name, 'info');
          });
        }
      }
    }
    // end command logic inside action handler
  );

program.parse();
