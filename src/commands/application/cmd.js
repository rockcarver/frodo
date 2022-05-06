import fs from 'fs';
import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import { getOAuth2Provider } from '../../api/AmServiceApi.js';
import {
  listOAuth2Applications,
  getOAuth2Application,
  putApplication,
} from '../../api/ApplicationApi.js';
import {
  saveToFile,
  validateImport,
  checkTargetCompatibility,
} from '../../api/utils/ExportImportUtils.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../api/utils/Console.js';

export default function setup() {
  const application = new Command('application')
    .helpOption('-h, --help', 'Help')
    .description('Manage applications.');

  application
    .command('list')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .description('List all applications in a realm.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      if (await getTokens()) {
        printMessage(`OAuth2 applications ...`);
        const applicationList = await listOAuth2Applications();
        applicationList.sort((a, b) => a._id.localeCompare(b._id));
        applicationList.forEach((item) => {
          printMessage(`- ${item._id}`);
        });
        // console.log("\nSAML entities ...");
        // const entityList = await listSamlEntities();
        // // console.log(applicationList);
        // entityList.sort((a, b) => a.entityId.localeCompare(b.entityId));
        // entityList.forEach((item, index) => {
        //     console.log(`- ${item.entityId}`);
        // })
      }
    });

  application
    .command('export')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(
      new Option(
        '-i, --id <id>',
        'Id of application. If specified, -a and -A are ignored.'
      )
    )
    .addOption(
      new Option(
        '-f, --file <file>',
        'Name of the file to write the exported application(s) to. Ignored with -A.'
      )
    )
    .addOption(
      new Option(
        '-a, --all',
        'Export all applications in a realm. Ignored with -t.'
      )
    )
    .addOption(
      new Option(
        '-A, --allSeparate',
        'Export all applications in a realm as separate files <id>.json. Ignored with -s or -a.'
      )
    )
    .description('Export applications.')
    .action(async (host, realm, user, password, options, command) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      let applicationData = null;
      let oauthServiceData = null;
      if (await getTokens()) {
        oauthServiceData = await getOAuth2Provider();
        // export
        if (command.opts().id) {
          printMessage('Exporting application...');
          let fileName = `${command.opts().id}.json`;
          if (command.opts().file) {
            fileName = command.opts().file;
          }
          applicationData = await getOAuth2Application(command.opts().id);
          // console.log(applicationData);
          applicationData._provider = oauthServiceData;
          saveToFile('application', [applicationData], '_id', fileName);
        }
        // exportAll -a
        else if (command.opts().all) {
          printMessage('Exporting all applications to a single file...');
          let fileName = 'allApplications.json';
          const applicationList = await listOAuth2Applications();
          const allApplicationsData = [];
          for (const item of applicationList) {
            applicationData = await getOAuth2Application(item._id);
            applicationData._provider = oauthServiceData;
            allApplicationsData.push(applicationData);
          }
          if (command.opts().file) {
            fileName = command.opts().file;
          }
          saveToFile('application', allApplicationsData, '_id', fileName);
        }
        // exportAllSeparate -A
        else if (command.opts().allSeparate) {
          printMessage('Exporting all applications to separate files...');
          const applicationList = await listOAuth2Applications();
          for (const item of applicationList) {
            applicationData = await getOAuth2Application(item._id);
            applicationData._provider = oauthServiceData;
            const fileName = `./${item._id}.json`;
            saveToFile('application', [applicationData], '_id', fileName);
          }
        }
        // unrecognized combination of options or no options
        else {
          printMessage('Unrecognized combination of options or no options...');
          command.help();
        }
      }
    });

  application
    .command('import')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.fileOptionM)
    .description('Import application.')
    .action(async (host, realm, user, password, options, command) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      if (await getTokens()) {
        printMessage(`Importing application(s) ...`);
        const targetOauthServiceData = await getOAuth2Provider();
        fs.readFile(command.opts().file, 'utf8', (err, data) => {
          if (err) throw err;
          const applicationData = JSON.parse(data);
          if (validateImport(applicationData.meta)) {
            // eslint-disable-next-line guard-for-in
            for (const id in applicationData.application) {
              if (
                storage.session.getItem('tenant') !==
                applicationData.meta.origin
              ) {
                checkTargetCompatibility(
                  'oauth2Provider',
                  applicationData.application[id]._provider,
                  targetOauthServiceData
                );
              }
              // remove the "_provider" data before PUT
              delete applicationData.application[id]._provider;
              delete applicationData.application[id]._rev;
              putApplication(id, applicationData.application[id]).then(
                (result) => {
                  if (!result == null) printMessage(`Imported ${id}`);
                }
              );
            }
          } else {
            printMessage('Import validation failed...', 'error');
          }
        });
      }
    });

  application.showHelpAfterError();
  return application;
}
