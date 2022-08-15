import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, IdmOps } from '@rockcarver/frodo-lib';

const { getTokens } = AuthenticateOps;
const {
  exportAllConfigEntities,
  exportAllRawConfigEntities,
  exportConfigEntity,
} = IdmOps;

import storage from '../../storage/SessionStorage.js';

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
  .addOption(new Option('-f, --file [file]', 'Export file. Ignored with -A.'))
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
      '-a, --all',
      'Export all IDM configuration objects into a single file in directory -D. Ignored with -N.'
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
      'Export directory. Required with and ignored without -a/-A.'
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
        if (options.idmName) {
          console.log(
            `Exporting object "${
              options.idmName
            }" from realm "${storage.session.getRealm()}"...`
          );
          exportConfigEntity(options.idmName, options.file);
        }
        // --all-separate -A
        else if (
          options.allSeparate &&
          options.directory &&
          options.entitiesFile &&
          options.envFile
        ) {
          console.log(
            `Exporting IDM configuration objects specified in ${options.entitiesFile} into separate files in ${options.directory} using ${options.envFile} for variable replacement...`
          );
          exportAllConfigEntities(
            options.directory,
            options.entitiesFile,
            options.envFile
          );
        }
        // --all-separate -A without variable replacement
        else if (options.allSeparate && options.directory) {
          console.log(
            `Exporting all IDM configuration objects into separate files in ${options.directory}...`
          );
          exportAllRawConfigEntities(options.directory);
        }
        // unrecognized combination of options or no options
        else {
          console.log(
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
