import { Command } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, state } from '@rockcarver/frodo-lib';
const { getTokens } = AuthenticateOps;

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
      state.session.setTenant(host);
      state.session.setUsername(user);
      state.session.setPassword(password);
      state.session.setDeploymentType(options.type);
      state.session.setAllowInsecureConnection(options.insecure);
      state.session.setItem('scriptFriendly', options.scriptFriendly);
      if (!options.scriptFriendly) {
        console.log('Printing versions and tokens...');
        if (await getTokens()) {
          console.log(`Cookie name: ${state.session.getCookieName()}`);
          console.log(`Session token: ${state.session.getCookieValue()}`);
          if (state.session.getBearerToken()) {
            console.log(`Bearer token: ${state.session.getBearerToken()}`);
          }
        } else {
          process.exitCode = 1;
        }
      } else if (await getTokens()) {
        const output = {
          cookieName: state.session.getCookieName(),
          sessionToken: state.session.getCookieValue(),
        };
        if (state.session.getBearerToken()) {
          output.bearerToken = state.session.getBearerToken();
        }
        console.log(JSON.stringify(output, null, 2), 'data');
      } else {
        process.exitCode = 1;
      }
    });
  info.showHelpAfterError();
  return info;
}
