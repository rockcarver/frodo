import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, SecretsOps } from '@rockcarver/frodo-lib';
import storage from '../../storage/SessionStorage.js';

const { getTokens, SecretsOps } = AuthenticateOps;
const { listSecrets, listSecretVersionsCmd } = SecretsOps;

const program = new Command('frodo esv secret version list');

program
  .description('List versions of secret.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(new Option('-i, --secret-id <secret-id>', 'Secret id.'))
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
        console.log('Listing versions...');
        listSecretVersionsCmd(options.secretId);
      }
    }
    // end command logic inside action handler
  );

program.parse();
