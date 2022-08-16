import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, RealmOps, state } from '@rockcarver/frodo-lib';

const { getTokens } = AuthenticateOps;
const { addCustomDomain } = RealmOps;

const program = new Command('frodo realm add-custom-domain');

program
  .description('Add custom domain (realm DNS alias).')
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
          `Adding custom DNS domain ${
            options.domain
          } to realm ${state.session.getRealm()}...`
        );
        await addCustomDomain(state.session.getRealm(), options.domain);
      }
    }
    // end command logic inside action handler
  );

program.parse();
