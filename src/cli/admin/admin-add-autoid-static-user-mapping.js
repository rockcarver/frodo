import { Command } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, AdminOps, state } from '@rockcarver/frodo-lib';

const { getTokens } = AuthenticateOps;
const { addAutoIdStaticUserMapping } = AdminOps;

const program = new Command('frodo admin add-autoid-static-user-mapping');

program
  .description(
    'Add AutoId static user mapping to enable dashboards and other AutoId-based functionality.'
  )
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
        console.log(`Adding AutoId static user mapping...`);
        await addAutoIdStaticUserMapping();
        console.log('Done.');
      }
    }
    // end command logic inside action handler
  );

program.parse();
