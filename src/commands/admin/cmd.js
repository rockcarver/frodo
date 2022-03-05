import { Command } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import { listOAuth2CustomClients } from '../../api/AdminApi.js';
import storage from '../../storage/SessionStorage.js';

export default function setup() {
  const journey = new Command('admin')
    .helpOption('-h, --help', 'Help')
    .description('Platform admin tasks.');

  journey
    .command('list-oauth2-clients-with-custom-privileges')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .description('List oauth2 clients with custom privileges.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        console.log(
          `Listing oauth2 clients with custom privileges in realm "${storage.session.getRealm()}"...`
        );
        const adminClients = await listOAuth2CustomClients();
        adminClients.sort((a, b) => a.localeCompare(b));
        adminClients.forEach((item) => {
          console.log(`${item}`);
        });
      }
    });

  journey.showHelpAfterError();
  return journey;
}
