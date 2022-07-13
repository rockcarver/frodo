import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../ops/AuthenticateOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';
import { clientCredentialsGrant } from '../../api/OAuth2OIDCApi.js';

const program = new Command('frodo admin get-access-token');

program
  .description('Get an access token using client credentials grant type.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(new Option('--client-id [id]', 'Client id.').makeOptionMandatory())
  .addOption(
    new Option(
      '--client-secret [secret]',
      'Client secret.'
    ).makeOptionMandatory()
  )
  .addOption(
    new Option('--scope [scope]', 'Request the following scope(s).').default(
      'fr:idm:*',
      'fr:idm:*'
    )
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
        printMessage(
          `Getting an access token using client "${options.clientId}"...`
        );
        const response = await clientCredentialsGrant(
          options.clientId,
          options.clientSecret,
          options.scope
        );
        printMessage(`Token: ${response.access_token}`);
      }
    }
    // end command logic inside action handler
  );

program.parse();
