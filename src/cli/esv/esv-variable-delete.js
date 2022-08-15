import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, VariablesOps } from '@rockcarver/frodo-lib';
import storage from '../../storage/SessionStorage.js';

const { getTokens } = AuthenticateOps;
const { deleteVariableCmd, deleteVariablesCmd } = VariablesOps;

const program = new Command('frodo cmd sub2 delete');

program
  .description('Delete variables.')
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
      '-i, --variable-id <variable-id>',
      'Variable id. If specified, -a is ignored.'
    )
  )
  .addOption(
    new Option('-a, --all', 'Delete all variable in a realm. Ignored with -i.')
  )
  .addOption(
    new Option(
      '--no-deep',
      'No deep delete. This leaves orphaned configuration artifacts behind.'
    )
  )
  .addOption(
    new Option(
      '--verbose',
      'Verbose output during command execution. If specified, may or may not produce additional output.'
    ).default(false, 'off')
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
        // delete by id
        if (options.variableId) {
          console.log('Deleting variable...');
          deleteVariableCmd(options.variableId);
        }
        // --all -a
        else if (options.all) {
          console.log('Deleting all variables...');
          deleteVariablesCmd();
        }
        // unrecognized combination of options or no options
        else {
          console.log('Unrecognized combination of options or no options...');
          program.help();
        }
      }
    }
    // end command logic inside action handler
  );

program.parse();
