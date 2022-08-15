import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, AdminOps } from '@rockcarver/frodo-lib';
import storage from '../../storage/SessionStorage.js';

const { getTokens } = AuthenticateOps;
const { grantOAuth2ClientAdminPrivileges } = AdminOps;

const program = new Command('frodo admin grant-oauth2-client-admin-privileges');

program
  .description('Grant an oauth2 client admin privileges.')
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
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        console.log(
          `Granting oauth2 client "${
            options.target
          }" in realm "${storage.session.getRealm()}" admin privileges...`
        );
        await grantOAuth2ClientAdminPrivileges(options.target);
        console.log('Done.');
      }
    }
    // end command logic inside action handler
  );

program.parse();
