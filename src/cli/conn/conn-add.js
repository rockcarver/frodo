import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';

import {
  AuthenticateOps,
  ConnectionProfileOps,
  state,
} from '@rockcarver/frodo-lib';

const { getTokens } = AuthenticateOps;
const { saveConnectionProfile } = ConnectionProfileOps;

const program = new Command('frodo conn add');

program
  .description(
    'Add a new connection profiles. You have to specify a URL, username and password at a minimum.\nOptionally, for Identity Cloud, you can also add a log API key and secret.'
  )
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addArgument(common.apiKeyArgument)
  .addArgument(common.apiSecretArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(new Option('--no-validate', 'Do not validate connection.'))
  .action(
    // implement command logic inside action handler
    async (host, user, password, key, secret, options) => {
      state.session.setTenant(host);
      state.session.setUsername(user);
      state.session.setPassword(password);
      state.session.setLogApiKey(key);
      state.session.setLogApiSecret(secret);
      state.session.setDeploymentType(options.type);
      state.session.setAllowInsecureConnection(options.insecure);
      if ((options.validate && (await getTokens())) || !options.validate) {
        saveConnectionProfile();
      } else {
        process.exitCode = 1;
      }
    }
    // end command logic inside action handler
  );

program.parse();
