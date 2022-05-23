import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import {
  importProviderById,
  importFirstProvider,
  importProvidersFromFile,
  importProvidersFromFiles,
} from '../../ops/IdpOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../api/utils/Console.js';

const program = new Command('frodo idp import');

program
  .description('Import (social) identity providers.')
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
      '-i, --idp-id <id>',
      'Provider id. If specified, -a and -A are ignored.'
    )
  )
  .addOption(
    new Option(
      '-f, --file <file>',
      'Name of the file to import the provider(s) from.'
    )
  )
  .addOption(
    new Option(
      '-a, --all',
      'Import all the providers from single file. Ignored with -t or -i.'
    )
  )
  .addOption(
    new Option(
      '-A, --all-separate',
      'Import all the providers from separate files (*.json) in the current directory. Ignored with -t or -i or -a.'
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
        // import by id
        if (options.file && options.idpId) {
          printMessage(
            `Importing provider "${
              options.idpId
            }" into realm "${storage.session.getRealm()}"...`
          );
          importProviderById(options.idpId, options.file);
        }
        // --all -a
        else if (options.all && options.file) {
          printMessage(
            `Importing all providers from a single file (${options.file})...`
          );
          importProvidersFromFile(options.file);
        }
        // --all-separate -A
        else if (options.allSeparate && !options.file) {
          printMessage(
            'Importing all providers from separate files in current directory...'
          );
          importProvidersFromFiles();
        }
        // import first provider from file
        else if (options.file) {
          printMessage(
            `Importing first provider from file "${
              options.file
            }" into realm "${storage.session.getRealm()}"...`
          );
          importFirstProvider(options.file);
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
