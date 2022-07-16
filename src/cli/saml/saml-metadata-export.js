import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../ops/AuthenticateOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';
import {
  exportCircleOfTrust,
  exportCirclesOfTrustToFile,
  exportCirclesOfTrustToFiles,
} from '../../ops/CirclesOfTrustOps.js';
import { exportMetadata } from '../../ops/SamlOps.js';

const program = new Command('frodo saml metadata export');

program
  .description('Export SAML metadata.')
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
      '-i, --entity-id <entity-id>',
      'Entity id. If specified, -a and -A are ignored.'
    )
  )
  .addOption(
    new Option(
      '-f, --file [file]',
      'Name of the file to write the exported metadata to. Ignored with -A. If not specified, the export file is named <entity-id>.metadata.xml.'
    )
  )
  .addOption(
    new Option(
      '-A, --all-separate',
      'Export all the providers in a realm as separate files <provider name>.saml.json. Ignored with -t, -i, and -a.'
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
        if (options.entityId) {
          printMessage(
            `Exporting metadata for provider "${
              options.entityId
            }" from realm "${storage.session.getRealm()}"...`
          );
          exportMetadata(options.entityId, options.file);
        }
        // // --all-separate -A
        // else if (options.allSeparate) {
        //   printMessage('Exporting all providers to separate files...');
        //   exportProvidersToFiles();
        // }
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
