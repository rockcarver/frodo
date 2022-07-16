import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import {
  exportAllConfigEntities,
  exportAllRawConfigEntities,
  exportConfigEntity,
} from '../../ops/IdmOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';

const program = new Command('frodo idm export');

program
  .description('Export IDM configuration objects.')
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
      '-N, --name <name>',
      'Config entity name. E.g. "managed", "sync", "provisioner-<connector-name>", etc.'
    )
  )
  .addOption(
    new Option(
      '-f, --file [file]',
      'Name of the file to write the exported object to. Ignored with -A.'
    )
  )
  .addOption(
    new Option(
      '-E, --entities-file [entities-file]',
      'Name of the entity file. Ignored with -A.'
    )
  )
  .addOption(
    new Option(
      '-e, --env-file [envfile]',
      'Name of the env file. Ignored with -A.'
    )
  )
  .addOption(
    new Option(
      '-a, --all <directory> [file] [envFile]',
      'Export all the objects in a realm to a single file. Ignored with -N.'
    )
  )
  .addOption(
    new Option(
      '-A, --all-separate',
      'Export all IDM configuration objects into separate JSON files in directory -D. Ignored with -N, and -a.'
    )
  )
  .addOption(
    new Option(
      '-D, --directory <directory>',
      'Export directory. Required with and ignored without -A.'
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
        console.log(options);
        // export by id/name
        if (options.idmName) {
          printMessage(
            `Exporting object "${
              options.idmName
            }" from realm "${storage.session.getRealm()}"...`
          );
          exportConfigEntity(options.idmName, options.file);
        }
        // --all -a
        else if (options.all) {
          printMessage('Exporting all IDM configuration objects...');
          exportAllConfigEntities(
            options.all,
            options.entitiesFile,
            options.envFile
          );
        }
        // --all-separate -A
        else if (options.allSeparate && options.directory) {
          printMessage(
            `Exporting all IDM configuration objects into separate JSON files in ${options.directory}...`
          );
          exportAllRawConfigEntities(options.directory);
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
