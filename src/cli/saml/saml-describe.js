import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, SamlOps, state } from '@rockcarver/frodo-lib';

const { getTokens } = AuthenticateOps;
const { describeProvider } = SamlOps;

const program = new Command('frodo saml describe');

program
  .description('Describe the configuration of an entity provider.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(new Option('-i, --entity-id <entity-id>', 'Entity id.'))
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
        console.log(
          `Describing SAML entity provider ${
            options.entityId
          } in realm "${state.session.getRealm()}"...`
        );
        describeProvider(options.entityId);
      }
    }
    // end command logic inside action handler
  );

program.parse();
