import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, VariablesOps } from '@rockcarver/frodo-lib';
import storage from '../../storage/SessionStorage.js';

const { getTokens } = AuthenticateOps;
const { setDescriptionOfVariable, updateVariable } = VariablesOps;

const program = new Command('frodo esv secret set');

program
  .description('Create secrets.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .requiredOption('-i, --variable-id <variable-id>', 'Variable id.')
  .option('--value [value]', 'Secret value.')
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
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        if (options.variableId && options.value && options.description) {
          console.log('Updating variable...');
          updateVariable(
            options.variableId,
            options.value,
            options.description
          );
        } else if (options.variableId && options.description) {
          console.log('Updating variable...');
          setDescriptionOfVariable(options.variableId, options.description);
        }
        // unrecognized combination of options or no options
        else {
          console.log(
            'Provide --variable-id and either one or both of --value and --description.'
          );
          program.help();
        }
      }
    }
    // end command logic inside action handler
  );

program.parse();
