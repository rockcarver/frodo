import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, SecretsOps } from '@rockcarver/frodo-lib';
import storage from '../../storage/SessionStorage.js';

const { getTokens } = AuthenticateOps;
const { setDescriptionOfSecret } = SecretsOps;

const program = new Command('frodo esv secret set');

program
  .description('Create secrets.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(new Option('-i, --secret-id <secret-id>', 'Secret id.'))
  .addOption(new Option('--description <description>', 'Secret description.'))
  .addOption(
    new Option(
      '--verbose',
      'Verbose output during command execution. If specified, may or may not produce additional output.'
    ).default(false, 'off')
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
        console.log('Setting secret description...');
        setDescriptionOfSecret(options.secretId, options.description);
      }
    }
    // end command logic inside action handler
  );

program.parse();
