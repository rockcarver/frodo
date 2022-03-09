import replaceall from 'replaceall';
import fs from 'fs';
import fse from 'fs-extra';
import propertiesReader from 'properties-reader';
import { Command } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import {
  getAllConfigEntities,
  getConfigEntity,
  getCount,
} from '../../api/IdmConfigApi.js';
import storage from '../../storage/SessionStorage.js';

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
    .action(async (host, user, password, options, command) => {
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setTenant(host);
      storage.session.setAllowInsecureConnection(options.insecure);
      console.log('Listing all IDM configuration objects...');
      if (await getTokens()) {
        const configEntities = await getAllConfigEntities();
        if ('configurations' in configEntities) {
          configEntities.configurations.forEach((x) => {
            console.log(`- ${x._id}`);
          });
        }
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
    .action(async (host, user, password, options, command) => {
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setTenant(host);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      console.log('Exporting an IDM configuration object...');
      if (await getTokens()) {
        const configEntity = await getConfigEntity(command.opts().name);
        if (command.opts().file) {
          fs.writeFile(
            command.opts().file,
            JSON.stringify(configEntity, null, 2),
            (err, data) => {
              if (err) {
                return console.error(
                  `ERROR - can't save ${command.opts().name} export to file`
                );
              }
            }
          );
        } else {
          console.log(JSON.stringify(configEntity, null, 2));
        }
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
    .action(async (host, user, password, options, command) => {
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setTenant(host);
      storage.session.setAllowInsecureConnection(options.insecure);
      console.log(
        `Exporting all IDM configuration objects into separate JSON files in ${
          command.opts().directory
        }...`
      );
      if (await getTokens()) {
        const configEntities = await getAllConfigEntities();
        if ('configurations' in configEntities) {
          if (!fs.existsSync(options.directory)) {
            fs.mkdirSync(options.directory);
          }
          configEntities.configurations.forEach(async (x) => {
            // console.log(`- ${x._id}`);
            const configEntity = await getConfigEntity(x._id);
            fse.outputFile(
              `${options.directory}/${x._id}.json`,
              JSON.stringify(configEntity, null, 2),
              (err, data) => {
                if (err) {
                  return console.error(
                    `ERROR - can't save config ${x._id} to file`,
                    err
                  );
                }
              }
            );
          });
        }
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
    .action(async (host, user, password, options, command) => {
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setTenant(host);
      storage.session.setAllowInsecureConnection(options.insecure);
      console.log('Exporting all IDM configuration objects...');
      if (await getTokens()) {
        let entriesToExport = [];
        const envFileData = {};
        // read list of entities to export
        fs.readFile(options.entitiesFile, 'utf8', async (err, data) => {
          if (err) throw err;
          const entriesData = JSON.parse(data);
          entriesToExport = entriesData.idm;
          // console.log(`entriesToExport ${entriesToExport}`);

          // read list of configs to parameterize for environment specific values
          const envParams = propertiesReader(options.envFile);

          const configEntities = await getAllConfigEntities();
          if ('configurations' in configEntities) {
            // create export directory if not exist
            if (!fs.existsSync(options.directory)) {
              fs.mkdirSync(options.directory);
            }
            configEntities.configurations.forEach(async (x) => {
              // console(x)
              if (entriesToExport.includes(x._id)) {
                // if entity is in the list of entities to export
                const configEntity = await getConfigEntity(x._id);
                let configEntityString = JSON.stringify(configEntity, null, 2);
                envParams.each((key, value) => {
                  configEntityString = replaceall(
                    value,
                    `\${${key}}`,
                    configEntityString
                  );
                });
                fs.writeFile(
                  `${options.directory}/${x._id}.json`,
                  configEntityString,
                  (err, data) => {
                    if (err) {
                      return console.error(
                        `ERROR - can't save config ${x._id} to file`
                      );
                    }
                  }
                );
              }
            });
          }
        });
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
    .action(async (host, user, password, options, command) => {
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setTenant(host);
      storage.session.setAllowInsecureConnection(options.insecure);
      console.log(`Counting managed ${options.name} objects...`);
      if (await getTokens()) {
        console.log(
          `Total count of [${options.name}] objects : ${await getCount(
            options.name
          )}`
        );
      }
    });

  idm.showHelpAfterError();
  return idm;
}
