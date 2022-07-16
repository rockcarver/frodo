import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../ops/AuthenticateOps.js';
import {
  importJourneyFromFile,
  importJourneysFromFile,
  importJourneysFromFiles,
  importFirstJourneyFromFile,
} from '../../ops/JourneyOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';

const program = new Command('frodo command sub');

program
  .description('Import journey/tree.')
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
      '-i, --journey-id <journey>',
      'Name of a journey/tree. If specified, -a and -A are ignored.'
    )
  )
  .addOption(
    new Option(
      '-f, --file <file>',
      'Name of the file to import the journey(s) from. Ignored with -A.'
    )
  )
  .addOption(
    new Option(
      '-a, --all',
      'Import all the journeys/trees from single file. Ignored with -i.'
    )
  )
  .addOption(
    new Option(
      '-A, --all-separate',
      'Import all the journeys/trees from separate files (*.json) in the current directory. Ignored with -i or -a.'
    )
  )
  .addOption(
    new Option(
      '--re-uuid',
      'Generate new UUIDs for all nodes during import.'
    ).default(false, 'off')
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
        // import
        if (options.journeyId) {
          printMessage('Importing journey...');
          importJourneyFromFile(options.journeyId, options.file, {
            reUuid: options.reUuid,
            verbose: options.verbose,
          });
        }
        // --all -a
        else if (options.all && options.file) {
          printMessage(
            `Importing all journeys from a single file (${options.file})...`
          );
          importJourneysFromFile(options.file, {
            reUuid: options.reUuid,
            verbose: options.verbose,
          });
        }
        // --all-separate -A
        else if (options.allSeparate && !options.file) {
          printMessage(
            'Importing all journeys from separate files in current directory...'
          );
          importJourneysFromFiles({
            reUuid: options.reUuid,
            verbose: options.verbose,
          });
        }
        // import single journey in file
        else if (options.file) {
          printMessage('Importing journey...');
          importFirstJourneyFromFile(options.file, {
            reUuid: options.reUuid,
            verbose: options.verbose,
          });
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
