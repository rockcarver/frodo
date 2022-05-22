import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import {
  listProviders,
  exportProvider,
  exportProvidersToFile,
  exportProvidersToFiles,
  importProviderById,
  importFirstProvider,
  importProvidersFromFile,
  importProvidersFromFiles,
} from '../../ops/IdpOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../api/utils/Console.js';

export default function setup() {
  const idpCmd = new Command('idp')
    .helpOption('-h, --help', 'Help')
    .description('Manage (social) identity providers.');

  idpCmd
    .command('list')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .description('List all the providers in a realm.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage(
          `Listing providers in realm "${storage.session.getRealm()}"...`
        );
        listProviders();
      }
    });

  idpCmd
    .command('export')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(
      new Option(
        '-i, --idp-id <idp-id>',
        'Id/name of a provider. If specified, -a and -A are ignored.'
      )
    )
    .addOption(
      new Option(
        '-f, --file [file]',
        'Name of the file to write the exported provider(s) to. Ignored with -A.'
      )
    )
    .addOption(
      new Option(
        '-a, --all',
        'Export all the providers in a realm to a single file. Ignored with -t and -i.'
      )
    )
    .addOption(
      new Option(
        '-A, --all-separate',
        'Export all the providers in a realm as separate files <provider name>.idp.json. Ignored with -t, -i, and -a.'
      )
    )
    .description('Export (social) identity providers.')
    // eslint-disable-next-line consistent-return
    .action(async (host, realm, user, password, options, command) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        // export by id/name
        if (command.opts().idpId) {
          printMessage(
            `Exporting provider "${
              command.opts().idpId
            }" from realm "${storage.session.getRealm()}"...`
          );
          exportProvider(command.opts().idpId, command.opts().file);
        }
        // --all -a
        else if (command.opts().all) {
          printMessage('Exporting all providers to a single file...');
          exportProvidersToFile(command.opts().file);
        }
        // --all-separate -A
        else if (command.opts().allSeparate) {
          printMessage('Exporting all providers to separate files...');
          exportProvidersToFiles();
        }
        // unrecognized combination of options or no options
        else {
          printMessage(
            'Unrecognized combination of options or no options...',
            'error'
          );
          command.help();
        }
      }
    });

  idpCmd
    .command('import')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
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
    .description('Import (social) identity providers.')
    .action(async (host, realm, user, password, options, command) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        // import by id
        if (command.opts().file && command.opts().idpId) {
          printMessage(
            `Importing provider "${
              command.opts().idpId
            }" into realm "${storage.session.getRealm()}"...`
          );
          importProviderById(command.opts().idpId, command.opts().file);
        }
        // --all -a
        else if (command.opts().all && command.opts().file) {
          printMessage(
            `Importing all providers from a single file (${
              command.opts().file
            })...`
          );
          importProvidersFromFile(command.opts().file);
        }
        // --all-separate -A
        else if (command.opts().allSeparate && !command.opts().file) {
          printMessage(
            'Importing all providers from separate files in current directory...'
          );
          importProvidersFromFiles();
        }
        // import first provider from file
        else if (command.opts().file) {
          printMessage(
            `Importing first provider from file "${
              command.opts().file
            }" into realm "${storage.session.getRealm()}"...`
          );
          importFirstProvider(command.opts().file);
        }
        // unrecognized combination of options or no options
        else {
          printMessage('Unrecognized combination of options or no options...');
          command.help();
        }
      }
    });

  idpCmd.showHelpAfterError();
  return idpCmd;
}
