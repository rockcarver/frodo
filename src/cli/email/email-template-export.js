import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../ops/AuthenticateOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';
import {
  exportEmailTemplatesToFile,
  exportEmailTemplatesToFiles,
  exportEmailTemplateToFile,
} from '../../ops/EmailTemplateOps.js';

const program = new Command('frodo email template export');

program
  .description('Export email templates.')
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
      '-i, --template-id <template-id>',
      'Email template id/name. If specified, -a and -A are ignored.'
    )
  )
  .addOption(
    new Option(
      '-f, --file [file]',
      'Name of the export file. Ignored with -A. Defaults to <template-id>.template.email.json.'
    )
  )
  .addOption(
    new Option(
      '-a, --all',
      'Export all email templates to a single file. Ignored with -i.'
    )
  )
  .addOption(
    new Option(
      '-A, --all-separate',
      'Export all email templates as separate files <template-id>.template.email.json. Ignored with -i, and -a.'
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
        if (options.templateId) {
          printMessage(
            `Exporting email template "${
              options.templateId
            }" from realm "${storage.session.getRealm()}"...`
          );
          exportEmailTemplateToFile(options.templateId, options.file);
        }
        // --all -a
        else if (options.all) {
          printMessage('Exporting all email templates to a single file...');
          exportEmailTemplatesToFile(options.file);
        }
        // --all-separate -A
        else if (options.allSeparate) {
          printMessage('Exporting all email templates to separate files...');
          exportEmailTemplatesToFiles();
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
