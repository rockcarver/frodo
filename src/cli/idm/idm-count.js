import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, IdmOps, state } from '@rockcarver/frodo-lib';

const { getTokens } = AuthenticateOps;
const { countManagedObjects } = IdmOps;

const program = new Command('frodo idm count');

program
  .description('Count managed objects.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.insecureOption)
  .addOption(
    new Option(
      '-m, --managed-object <type>',
      'Type of managed object to count. E.g. "alpha_user", "alpha_role", "user", "role".'
    )
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
        console.log(`Counting managed ${options.managedObject} objects...`);
        countManagedObjects(options.managedObject);
      }
    }
    // end command logic inside action handler
  );

program.parse();
