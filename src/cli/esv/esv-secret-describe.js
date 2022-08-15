import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps } from '@rockcarver/frodo-lib';
import storage from '../../storage/SessionStorage.js';

const { getTokens, SecretsOps } = AuthenticateOps;
const { describeSecret, listSecretVersionsCmd } = SecretsOps;

const program = new Command('frodo esv secret describe');

program
  .description('Describe secrets.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(new Option('-i, --secret-id <secret-id>', 'Secret id.'))
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
        console.log(`Describing secret ${options.secretId}...`);
        describeSecret(options.secretId);
      }
    }
    // end command logic inside action handler
  );

program.parse();
