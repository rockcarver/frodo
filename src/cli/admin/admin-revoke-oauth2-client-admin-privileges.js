import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, state } from '@rockcarver/frodo-lib';

const { getTokens } = AuthenticateOps;
const { revokeOAuth2ClientAdminPrivileges } = AdminOps;

const program = new Command(
  'frodo admin revoke-oauth2-client-admin-privileges'
);

program
  .description('Revoke admin privileges from an oauth2 client.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(
    new Option('-t, --target <target name or id>', 'Name of the oauth2 client.')
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
        console.log(
          `Revoking admin privileges from oauth2 client "${
            options.target
          }" in realm "${state.session.getRealm()}"...`
        );
        await revokeOAuth2ClientAdminPrivileges(options.target);
        console.log('Done.');
      }
    }
    // end command logic inside action handler
  );

program.parse();
