import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, AdminOps } from '@rockcarver/frodo-lib';
import storage from '../../storage/SessionStorage.js';

const { getTokens } = AuthenticateOps;
const { hideGenericExtensionAttributes } = AdminOps;

const program = new Command('frodo admin hide-generic-extension-attributes');

program
  .description('Hide generic extension attributes.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(
    new Option('--include-customized', 'Include customized attributes.')
  )
  .addOption(new Option('--dry-run', 'Dry-run only, do not perform changes.'))
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
        console.log(
          `Hiding generic extension attributes in realm "${storage.session.getRealm()}"...`
        );
        await hideGenericExtensionAttributes(
          options.includeCustomized,
          options.dryRun
        );
        console.log('Done.');
      }
    }
    // end command logic inside action handler
  );

program.parse();
