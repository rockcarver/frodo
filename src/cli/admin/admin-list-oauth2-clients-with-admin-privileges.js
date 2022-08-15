import { Command } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, AdminOps } from '@rockcarver/frodo-lib';
import storage from '../../storage/SessionStorage.js';

const { listOAuth2AdminClients } = AdminOps;
const { getTokens } = AuthenticateOps;

const program = new Command(
  'frodo admin list-oauth2-clients-with-admin-privileges'
);

program
  .description('List oauth2 clients with admin privileges.')
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
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        console.log(
          `Listing oauth2 clients with admin privileges in realm "${storage.session.getRealm()}"...`
        );
        const adminClients = await listOAuth2AdminClients();
        adminClients.sort((a, b) => a.localeCompare(b));
        adminClients.forEach((item) => {
          console.log(`${item}`);
        });
      }
    }
    // end command logic inside action handler
  );

program.parse();
