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
import {
  printMessage,
  showSpinner,
  stopSpinner,
} from '../../api/utils/Console.js';

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
      printMessage('Listing all IDM configuration objects...');
      if (await getTokens()) {
        const configEntities = await getAllConfigEntities();
        if ('configurations' in configEntities) {
          configEntities.configurations.forEach((x) => {
            printMessage(`- ${x._id}`, 'info');
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
      printMessage('Exporting an IDM configuration object...');
      if (await getTokens()) {
        const configEntity = await getConfigEntity(command.opts().name);
        if (command.opts().file) {
          fs.writeFile(
            command.opts().file,
            JSON.stringify(configEntity, null, 2),
            (err) => {
              if (err) {
                return printMessage(
                  `ERROR - can't save ${command.opts().name} export to file`,
                  'error'
                );
              }
              return '';
            }
          );
        } else {
          printMessage(JSON.stringify(configEntity, null, 2));
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
      printMessage(
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
          showSpinner('Exporting config objects...');
          const entityPromises = [];
          configEntities.configurations.forEach((x) => {
            // console.log(`- ${x._id}`);
            entityPromises.push(getConfigEntity(x._id));
          });
          Promise.all(entityPromises).then((result) => {
            // console.log(result);
            result.forEach((item) => {
              if (item != null) {
                fse.outputFile(
                  `${options.directory}/${item._id}.json`,
                  JSON.stringify(item, null, 2),
                  // eslint-disable-next-line consistent-return
                  (err) => {
                    if (err) {
                      return printMessage(
                        `ERROR - can't save config ${item._id} to file - ${err}`,
                        'error'
                      );
                    }
                  }
                );
              }
            });
            stopSpinner();
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
    .action(async (host, user, password, options) => {
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setTenant(host);
      storage.session.setAllowInsecureConnection(options.insecure);
      printMessage('Exporting all IDM configuration objects...');
      if (await getTokens()) {
        let entriesToExport = [];
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
            showSpinner('Exporting config objects...');
            const entityPromises = [];
            configEntities.configurations.forEach((x) => {
              if (entriesToExport.includes(x._id)) {
                // console.log(`- ${x._id}`);
                entityPromises.push(getConfigEntity(x._id));
              }
            });
            Promise.all(entityPromises).then((result) => {
              // console.log(result);
              result.forEach((item) => {
                if (item != null) {
                  let configEntityString = JSON.stringify(item, null, 2);
                  envParams.each((key, value) => {
                    configEntityString = replaceall(
                      value,
                      `\${${key}}`,
                      configEntityString
                    );
                  });
                  fse.outputFile(
                    `${options.directory}/${item._id}.json`,
                    JSON.stringify(item, null, 2),
                    // eslint-disable-next-line consistent-return
                    (error) => {
                      if (err) {
                        return printMessage(
                          `ERROR - can't save config ${item._id} to file - ${error}`,
                          'error'
                        );
                      }
                    }
                  );
                }
              });
              stopSpinner();
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
    .action(async (host, user, password, options) => {
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setTenant(host);
      storage.session.setAllowInsecureConnection(options.insecure);
      printMessage(`Counting managed ${options.name} objects...`);
      if (await getTokens()) {
        printMessage(
          `Total count of [${options.name}] objects : ${await getCount(
            options.name
          )}`
        );
      }
    });

  idm.showHelpAfterError();
  return idm;
}
