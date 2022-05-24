import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import { listJourneys } from '../../api/TreeApi.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../api/utils/Console.js';

const program = new Command('frodo journey list');

program
  .description('List journeys/trees.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(new Option('-a, --analyze', 'Analyze journeys for custom nodes.'))
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
        printMessage(
          `Listing journeys in realm "${storage.session.getRealm()}"...`
        );
        const journeyList = await listJourneys(options.analyze);
        journeyList.sort((a, b) => a.name.localeCompare(b.name));
        if (options.analyze) {
          journeyList.forEach((item) => {
            printMessage(`${item.name} ${item.custom ? '(*)' : ''}`);
          });
          printMessage('(*) Tree contains custom node(s).');
        } else {
          journeyList.forEach((item) => {
            printMessage(`${item.name}`, 'info');
          });
        }
      }
    }
    // end command logic inside action handler
  );

program.parse();
