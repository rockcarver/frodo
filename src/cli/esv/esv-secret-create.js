import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../ops/AuthenticateOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';
import { createSecret } from '../../ops/SecretsOps.js';

const program = new Command('frodo esv secret create');

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
  .requiredOption('-i, --secret-id <secret-id>', 'Secret id.')
  .requiredOption('--value <value>', 'Secret value.')
  .option('--description [description]', 'Secret description.')
  .addOption(
    new Option(
      '--encoding [encoding]',
      'Secret encoding. Must be one of "generic", "pem", "base64hmac"'
    ).default('generic', 'generic')
  )
  .addOption(
    new Option(
      '--no-use-in-placeholders',
      'Secret cannot be used in placeholders.'
    )
  )
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
        printMessage('Creating secret...');
        createSecret(
          options.secretId,
          options.value,
          options.description,
          options.encoding,
          options.useInPlaceholders
        );
      }
    }
    // end command logic inside action handler
  );

program.parse();
