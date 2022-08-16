import { Command } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, RealmOps, state } from '@rockcarver/frodo-lib';

import { getRealmName } from '../../api/utils/ApiUtils.js';

const { getTokens } = AuthenticateOps;
const { describe } = RealmOps;

const program = new Command('frodo realm describe');

program
  .description('Describe realms.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
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
          `Retrieving details of realm ${state.session.getRealm()}...`
        );
        describe(getRealmName(state.session.getRealm()));
      }
    }
    // end command logic inside action handler
  );

program.parse();
