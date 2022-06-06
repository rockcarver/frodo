import { Command } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';

export default function setup() {
  const info = new Command('info');
  info
    .addArgument(common.hostArgumentM)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(common.scriptFriendlyOption)
    .description('Print versions and tokens.')
    .action(async (host, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      storage.session.setItem('scriptFriendly', options.scriptFriendly);
      if (!options.scriptFriendly) {
        printMessage('Printing versions and tokens...');
        if (await getTokens()) {
          printMessage(`Cookie name: ${storage.session.getCookieName()}`);
          printMessage(`Session token: ${storage.session.getCookieValue()}`);
          if (storage.session.getBearerToken()) {
            printMessage(`Bearer token: ${storage.session.getBearerToken()}`);
          }
        }
      } else if (await getTokens()) {
        const output = {
          cookieName: storage.session.getCookieName(),
          sessionToken: storage.session.getCookieValue(),
        };
        if (storage.session.getBearerToken()) {
          output.bearerToken = storage.session.getBearerToken();
        }
        printMessage(output, 'data');
      }
    });
  info.showHelpAfterError();
  return info;
}
