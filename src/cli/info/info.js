import { Command } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps } from '@rockcarver/frodo-lib';
const { getTokens } = AuthenticateOps;
import storage from '../../storage/SessionStorage.js';

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
        console.log('Printing versions and tokens...');
        if (await getTokens()) {
          console.log(`Cookie name: ${storage.session.getCookieName()}`);
          console.log(`Session token: ${storage.session.getCookieValue()}`);
          if (storage.session.getBearerToken()) {
            console.log(`Bearer token: ${storage.session.getBearerToken()}`);
          }
        } else {
          process.exitCode = 1;
        }
      } else if (await getTokens()) {
        const output = {
          cookieName: storage.session.getCookieName(),
          sessionToken: storage.session.getCookieValue(),
        };
        if (storage.session.getBearerToken()) {
          output.bearerToken = storage.session.getBearerToken();
        }
        console.log(JSON.stringify(output, null, 2), 'data');
      } else {
        process.exitCode = 1;
      }
    });
  info.showHelpAfterError();
  return info;
}
