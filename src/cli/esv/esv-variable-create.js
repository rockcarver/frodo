import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, VariablesOps, state } from '@rockcarver/frodo-lib';

const { getTokens } = AuthenticateOps;
const { createVariable } = VariablesOps;

const program = new Command('frodo esv variable create');

program
  .description('Create variables.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .requiredOption('-i, --variable-id <variable-id>', 'Variable id.')
  .requiredOption('--value <value>', 'Secret value.')
  .option('--description [description]', 'Secret description.')
  .addOption(
    new Option(
      '--verbose',
      'Verbose output during command execution. If specified, may or may not produce additional output.'
    ).default(false, 'off')
  )
  .action(
    // implement command logic inside action handler
    async (host, realm, user, password, options) => {
      state.session.setTenant(host);
      state.session.setRealm(realm);
      state.session.setUsername(user);
      state.session.setPassword(password);
      state.session.setDeploymentType(options.type);
      state.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        console.log('Creating variable...');
        createVariable(options.variableId, options.value, options.description);
      }
    }
    // end command logic inside action handler
  );

program.parse();
