import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../ops/AuthenticateOps.js';
import storage from '../../storage/SessionStorage.js';
import { getOAuth2Provider } from '../../api/AmServiceApi.js';
import { printMessage } from '../../ops/utils/Console.js';
import {
  getOAuth2Application,
  listOAuth2Applications,
} from '../../api/ApplicationApi.js';
import { saveToFile } from '../../ops/utils/ExportImportUtils.js';

const program = new Command('frodo app export');

program
  .description('Export OAuth2 applications.')
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
      '-i, --app-id <app-id>',
      'App id. If specified, -a and -A are ignored.'
    )
  )
  .addOption(new Option('-f, --file <file>', 'Name of the export file.'))
  .addOption(
    new Option(
      '-a, --all',
      'Export all OAuth2 apps to a single file. Ignored with -i.'
    )
  )
  .addOption(
    new Option(
      '-A, --all-separate',
      'Export all OAuth2 apps to separate files (*.oauth2.app.json) in the current directory. Ignored with -i or -a.'
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
      let applicationData = null;
      let oauthServiceData = null;
      if (await getTokens()) {
        oauthServiceData = await getOAuth2Provider();
        // export
        if (options.appId) {
          printMessage('Exporting OAuth2 application...');
          let fileName = `${options.appId}.oauth2.app.json`;
          if (options.file) {
            fileName = options.file;
          }
          applicationData = await getOAuth2Application(options.appId);
          // console.log(applicationData);
          applicationData._provider = oauthServiceData;
          saveToFile('application', [applicationData], '_id', fileName);
        }
        // -a/--all
        else if (options.all) {
          printMessage('Exporting all applications to a single file...');
          let fileName = 'allApplications.json';
          const applicationList = await listOAuth2Applications();
          const allApplicationsData = [];
          for (const item of applicationList) {
            // eslint-disable-next-line no-await-in-loop
            applicationData = await getOAuth2Application(item._id);
            applicationData._provider = oauthServiceData;
            allApplicationsData.push(applicationData);
          }
          if (options.file) {
            fileName = options.file;
          }
          saveToFile('application', allApplicationsData, '_id', fileName);
        }
        // -A/--all-separate
        else if (options.allSeparate) {
          printMessage('Exporting all applications to separate files...');
          const applicationList = await listOAuth2Applications();
          for (const item of applicationList) {
            // eslint-disable-next-line no-await-in-loop
            applicationData = await getOAuth2Application(item._id);
            applicationData._provider = oauthServiceData;
            const fileName = `./${item._id}.oauth2.app.json`;
            saveToFile('application', [applicationData], '_id', fileName);
          }
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
