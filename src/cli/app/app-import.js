import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../ops/AuthenticateOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';
import { importOAuth2ClientsFromFile } from '../../ops/OAuth2ClientOps.js';

const program = new Command('frodo app import');

program
  .description('Import OAuth2 applications.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  // .addOption(
  //   new Option(
  //     '-i, --cmd-id <cmd-id>',
  //     'Cmd id. If specified, only one cmd is imported and the options -a and -A are ignored.'
  //   )
  // )
  .addOption(new Option('-f, --file <file>', 'Name of the file to import.'))
  // .addOption(
  //   new Option(
  //     '-a, --all',
  //     'Import all cmds from single file. Ignored with -i.'
  //   )
  // )
  // .addOption(
  //   new Option(
  //     '-A, --all-separate',
  //     'Import all cmds from separate files (*.cmd.json) in the current directory. Ignored with -i or -a.'
  //   )
  // )
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
        printMessage(`Importing OAuth2 application(s) ...`);
        importOAuth2ClientsFromFile(options.file);
      }
    }
    // end command logic inside action handler
  );

program.parse();
