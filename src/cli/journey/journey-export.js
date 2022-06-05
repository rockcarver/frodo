import fs from 'fs';
import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import { getTree } from '../../api/TreeApi.js';
import {
  exportJourney,
  exportJourneysToFile,
  listJourneys,
} from '../../ops/JourneyOps.js';
import storage from '../../storage/SessionStorage.js';
import {
  printMessage,
  createProgressBar,
  updateProgressBar,
  stopProgressBar,
} from '../../ops/utils/Console.js';

const program = new Command('frodo journey export');

program
  .description('Export journeys/trees.')
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
      '-t, --tree <tree>',
      'Name of a journey/tree. If specified, -a and -A are ignored.'
    )
  )
  .addOption(
    new Option(
      '-f, --file <file>',
      'Name of the file to write the exported journey(s) to. Ignored with -A.'
    )
  )
  .addOption(
    new Option(
      '-a, --all',
      'Export all the journeys/trees in a realm. Ignored with -t.'
    )
  )
  .addOption(
    new Option(
      '-A, --all-separate',
      'Export all the journeys/trees in a realm as separate files <journey/tree name>.json. Ignored with -t or -a.'
    )
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
        // export
        if (options.tree) {
          printMessage('Exporting journey...');
          exportJourney(options.tree, options.file);
        }
        // --all -a
        else if (options.all) {
          printMessage('Exporting all journeys to a single file...');
          exportJourneysToFile(options.file);
        }
        // --all-separate -A
        else if (options.allSeparate) {
          printMessage('Exporting all journeys to separate files...');
          const journeyList = await listJourneys(false);
          createProgressBar(journeyList.length, '');
          for (const item of journeyList) {
            updateProgressBar(`Exporting journey - ${item.name}`);
            // eslint-disable-next-line no-await-in-loop
            const journeyData = await getTree(item.name);
            const fileName = `./${item.name}.json`;
            fs.writeFile(
              fileName,
              JSON.stringify(journeyData, null, 2),
              (err) => {
                if (err) {
                  return printMessage(
                    `ERROR - can't save journey ${item.name} to file`,
                    'error'
                  );
                }
                return '';
              }
            );
          }
          stopProgressBar('Done');
        }
        // unrecognized combination of options or no options
        else {
          printMessage('Unrecognized combination of options or no options...');
          program.help();
        }
      }
    }
    // end command logic inside action handler
  );

program.parse();
