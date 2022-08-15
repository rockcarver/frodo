import { Command } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, RealmOps } from '@rockcarver/frodo-lib';
import storage from '../../storage/SessionStorage.js';
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
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        console.log(
          `Retrieving details of realm ${storage.session.getRealm()}...`
        );
        describe(getRealmName(storage.session.getRealm()));
      }
    }
    // end command logic inside action handler
  );

program.parse();
