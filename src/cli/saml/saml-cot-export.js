import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';
import {
  exportCircleOfTrust,
  exportCirclesOfTrustToFile,
  exportCirclesOfTrustToFiles,
} from '../../ops/CirclesOfTrustOps.js';

const program = new Command('frodo saml cot export');

program
  .description('Export SAML circles of trust.')
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
      '-i, --cot-id <cot-id>',
      'Circle of trust id/name. If specified, -a and -A are ignored.'
    )
  )
  .addOption(
    new Option(
      '-f, --file [file]',
      'Name of the export file. Ignored with -A. Defaults to <cot-id>.cot.saml.json.'
    )
  )
  .addOption(
    new Option(
      '-a, --all',
      'Export all the circles of trust in a realm to a single file. Ignored with -i.'
    )
  )
  .addOption(
    new Option(
      '-A, --all-separate',
      'Export all the circles of trust in a realm as separate files <cot-id>.cot.saml.json. Ignored with -i, and -a.'
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
        // export by id/name
        if (options.cotId) {
          printMessage(
            `Exporting circle of trust "${
              options.cotId
            }" from realm "${storage.session.getRealm()}"...`
          );
          exportCircleOfTrust(options.cotId, options.file);
        }
        // --all -a
        else if (options.all) {
          printMessage('Exporting all circles of trust to a single file...');
          exportCirclesOfTrustToFile(options.file);
        }
        // --all-separate -A
        else if (options.allSeparate) {
          printMessage('Exporting all circles of trust to separate files...');
          exportCirclesOfTrustToFiles();
        }
        // unrecognized combination of options or no options
        else {
          printMessage(
            'Unrecognized combination of options or no options...',
            'error'
          );
          program.help();
        }
      }
    }
    // end command logic inside action handler
  );

program.parse();
