import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import {
  AuthenticateOps,
  removeCustomDomain,
  state,
} from '@rockcarver/frodo-lib';

const { getTokens } = AuthenticateOps;
const { removeCustomDomain } = RealmOps;

const program = new Command('frodo realm remove-custom-domain');

program
  .description('Remove custom domain (realm DNS alias).')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(
    new Option(
      '-d, --domain <name>',
      'Custom DNS domain name.'
    ).makeOptionMandatory()
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
        console.log(
          `Removing custom DNS domain ${
            options.domain
          } from realm ${state.session.getRealm()}...`
        );
        await removeCustomDomain(state.session.getRealm(), options.domain);
      }
    }
    // end command logic inside action handler
  );

program.parse();
