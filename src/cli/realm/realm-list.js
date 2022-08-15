import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, RealmOps } from '@rockcarver/frodo-lib';
import storage from '../../storage/SessionStorage.js';

const { listRealms } = RealmOps;
const { getTokens } = AuthenticateOps;

const program = new Command('frodo realm list');

program
  .description('List realms.')
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
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        console.log('Listing all realms...');
        await listRealms(options.long);
      }
    }
    // end command logic inside action handler
  );

program.parse();
