import { Command } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';
import {
  countManagedObjects,
  exportAllConfigEntities,
  exportAllRawConfigEntities,
  exportConfigEntity,
  listAllConfigEntities,
} from '../../ops/IdmOps.js';

export default function setup() {
  const idm = new Command('idm');
  idm.helpOption('-h, --help', 'Help').description('Manage IDM configuration.');

  idm
    .command('list')
    .addArgument(common.hostArgumentM)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.insecureOption)
    .description('List all IDM configuration objects.')
    .action(async (host, user, password, options) => {
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setTenant(host);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage('Listing all IDM configuration objects...');
        listAllConfigEntities();
      }
    });

  idm
    .command('export')
    .addArgument(common.hostArgumentM)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.nameOptionM)
    .addOption(common.fileOption)
    .addOption(common.insecureOption)
    .description('Export an IDM configuration object.')
    .action(async (host, user, password, options) => {
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setTenant(host);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage('Exporting an IDM configuration object...');
        exportConfigEntity(options.name, options.file);
      }
    });

  idm
    .command('exportAllRaw')
    .addArgument(common.hostArgumentM)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.dirOptionM)
    .addOption(common.insecureOption)
    .description(
      'Export all IDM configuration objects into separate JSON files in a directory specified by <directory>'
    )
    .action(async (host, user, password, options) => {
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setTenant(host);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage(
          `Exporting all IDM configuration objects into separate JSON files in ${options.directory}...`
        );
        exportAllRawConfigEntities(options.directory);
      }
    });

  idm
    .command('exportAll')
    .addArgument(common.hostArgumentM)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.dirOptionM)
    .addOption(common.entitiesFileOptionM)
    .addOption(common.envFileOptionM)
    .addOption(common.insecureOption)
    .description('Export all IDM configuration objects.')
    .action(async (host, user, password, options) => {
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setTenant(host);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage('Exporting all IDM configuration objects...');
        exportAllConfigEntities(
          options.directory,
          options.entitiesFile,
          options.envFile
        );
      }
    });

  // idm
  //     .command("import")
  //     .addArgument(common.hostArgumentM)
  //     .addArgument(common.userArgument)
  //     .addArgument(common.passwordArgument)
  //     .helpOption("-h, --help", "Help")
  //     .addOption(common.insecureOption)
  //     .description("Import an IDM configuration object.")
  //     .action(async (host, user, password, options, command) => {
  //         storage.session.setUsername(user);
  //         storage.session.setPassword(password);
  //         storage.session.setTenant(host);
  //         storage.session.setAllowInsecureConnection(options.insecure);
  //         console.log("Importing an IDM configuration object...");
  //         if(await getTokens()) {
  //             // implement
  //         }
  //     });

  // idm
  //     .command("importAll")
  //     .addArgument(common.hostArgumentM)
  //     .addArgument(common.userArgument)
  //     .addArgument(common.passwordArgument)
  //     .helpOption("-h, --help", "Help")
  //     .addOption(common.insecureOption)
  //     .description("Import all IDM configuration objects.")
  //     .action(async (host, user, password, options, command) => {
  //         storage.session.setUsername(user);
  //         storage.session.setPassword(password);
  //         storage.session.setTenant(host);
  //         storage.session.setAllowInsecureConnection(options.insecure);
  //         console.log("Importing all IDM configuration objects...");
  //         if(await getTokens()) {
  //             // implement
  //         }
  //     });

  idm
    .command('count')
    .addArgument(common.hostArgumentM)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.managedNameOptionM)
    .addOption(common.insecureOption)
    .description('Count number of managed objects of a given type.')
    .action(async (host, user, password, options) => {
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setTenant(host);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage(`Counting managed ${options.name} objects...`);
        countManagedObjects(options.name);
      }
    });

  idm.showHelpAfterError();
  return idm;
}
