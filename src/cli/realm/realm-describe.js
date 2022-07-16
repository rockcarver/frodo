import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../ops/AuthenticateOps.js';
import storage from '../../storage/SessionStorage.js';
import { createKeyValueTable, printMessage } from '../../ops/utils/Console.js';
import { getRealmByName } from '../../api/RealmApi.js';

const program = new Command('frodo realm describe');

program
  .description('Describe realms.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(new Option('-i, --cmd-id <cmd-id>', 'Cmd id.'))
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
        printMessage(
          `Retrieving details of realm ${storage.session.getRealm()}...`
        );
        const realmConfig = await getRealmByName(storage.session.getRealm());
        if (realmConfig != null) {
          const table = createKeyValueTable();
          table.push(['Name'.brightCyan, realmConfig.name]);
          table.push([
            'Status'.brightCyan,
            realmConfig.active ? 'active'.brightGreen : 'inactive'.brightRed,
          ]);
          table.push([
            'Custom Domains'.brightCyan,
            realmConfig.aliases.join('\n'),
          ]);
          table.push(['Parent'.brightCyan, realmConfig.parentPath]);
          table.push(['Id'.brightCyan, realmConfig._id]);
          printMessage(table.toString());
        } else {
          printMessage(`No realm found with name ${options.target}`, 'warn');
        }
      }
    }
    // end command logic inside action handler
  );

program.parse();
