import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, OAuth2ClientOps, state } from '@rockcarver/frodo-lib';

const { getTokens } = AuthenticateOps;
const { listOAuth2Clients } = OAuth2ClientOps;

const program = new Command('frodo app list');

program
  .description('List OAuth2 applications.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(
    new Option('-l, --long', 'Long with all fields.').default(false, 'false')
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
        console.log(`Listing OAuth2 applications...`);
        listOAuth2Clients(options.long);
      }
    }
    // end command logic inside action handler
  );

program.parse();
