import fs from 'fs';
import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import {
  listEmailTemplates,
  getEmailTemplate,
  putEmailTemplate,
} from '../../api/EmailTemplateApi.js';
import {
  saveToFile,
  validateImport,
} from '../../api/utils/ExportImportUtils.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../api/utils/Console.js';

export default function setup() {
  const emailTemplate = new Command('email_templates')
    .helpOption('-h, --help', 'Help')
    .description('Manage email templates.');

  emailTemplate
    .command('list')
    .addArgument(common.hostArgumentM)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .description('List all the email templates in the system.')
    .action(async (host, user, password, options, command) => {
      storage.session.setTenant(host);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage(`Listing email templates ...`);
        const templateList = await listEmailTemplates();
        // console.log(templateList);
        templateList.sort((a, b) => a._id.localeCompare(b._id));
        templateList.forEach((item, index) => {
          printMessage(`- ${item._id.replaceAll('emailTemplate/', '')}`);
        });
      }
    });

  emailTemplate
    .command('export')
    .addArgument(common.hostArgumentM)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(
      new Option(
        '-t, --template <template>',
        'Name of email template. If specified, -a and -A are ignored.'
      )
    )
    .addOption(
      new Option(
        '-f, --file <file>',
        'Name of the file to write the exported email template(s) to. Ignored with -A.'
      )
    )
    .addOption(
      new Option(
        '-a, --all',
        'Export all the email templates in the system. Ignored with -t.'
      )
    )
    .addOption(
      new Option(
        '-A, --allSeparate',
        'Export all the email templates as separate files <template>.json. Ignored with -s or -a.'
      )
    )
    .description('Export email templates.')
    .action(async (host, user, password, options, command) => {
      storage.session.setTenant(host);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      let templateData = null;
      if (await getTokens()) {
        // export
        if (command.opts().template) {
          printMessage('Exporting template...');
          let fileName = `${command.opts().template}.json`;
          if (command.opts().file) {
            fileName = command.opts().file;
          }
          templateData = await getEmailTemplate(command.opts().template);
          // console.log(templateData);
          saveToFile('emailTemplate', [templateData], '_id', fileName);
        }
        // exportAll -a
        else if (command.opts().all) {
          printMessage('Exporting all email templates to a single file...');
          let fileName = 'allEmailTemplates.json';
          const templateList = await listEmailTemplates();
          const allTemplatesData = [];
          for (const item of templateList) {
            templateData = await getEmailTemplate(
              `${item._id.replaceAll('emailTemplate/', '')}`
            );
            allTemplatesData.push(item);
          }
          if (command.opts().file) {
            fileName = command.opts().file;
          }
          saveToFile('emailTemplate', allTemplatesData, '_id', fileName);
        }
        // exportAllSeparate -A
        else if (command.opts().allSeparate) {
          printMessage('Exporting all email templates to separate files...');
          const templateList = await listEmailTemplates();
          for (const item of templateList) {
            templateData = await getEmailTemplate(
              `${item._id.replaceAll('emailTemplate/', '')}`
            );
            const fileName = `./${item._id.replaceAll(
              'emailTemplate/',
              ''
            )}.json`;
            saveToFile('emailTemplate', [templateData], '_id', fileName);
          }
        }
        // unrecognized combination of options or no options
        else {
          printMessage('Unrecognized combination of options or no options...', 'error');
          command.help();
        }
      }
    });

  emailTemplate
    .command('import')
    .addArgument(common.hostArgumentM)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(common.fileOptionM)
    .description('Import email template.')
    .action(async (host, user, password, options, command) => {
      storage.session.setTenant(host);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage(`Importing email templates(s) ...`);
        fs.readFile(command.opts().file, 'utf8', (err, data) => {
          if (err) throw err;
          const templateData = JSON.parse(data);
          if (validateImport(templateData.meta)) {
            for (const id in templateData.emailTemplate) {
              if ({}.hasOwnProperty.call(templateData.emailTemplate, id)) {
                // console.log(id);
                // console.log(templateData.script[id]);
                putEmailTemplate(
                  id.replaceAll('emailTemplate/', ''),
                  id,
                  templateData.emailTemplate[id]
                ).then((result) => {
                  if (!result == null) printMessage(`Imported ${id}`);
                });
              }
            }
          } else {
            printMessage('Import validation failed...', 'error');
          }
        });
      }
    });

  emailTemplate.showHelpAfterError();
  return emailTemplate;
}
