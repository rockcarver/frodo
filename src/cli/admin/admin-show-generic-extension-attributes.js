import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, AdminOps } from '@rockcarver/frodo-lib';
import storage from '../../storage/SessionStorage.js';

const { showGenericExtensionAttributes } = AdminOps;
const { getTokens } = AuthenticateOps;

const program = new Command('frodo admin show-generic-extension-attributes');

program
  .description('Show generic extension attributes.')
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
      '--include-customized',
      'Include customized attributes.'
    ).default(false, 'false')
  )
  .addOption(
    new Option('--dry-run', 'Dry-run only, do not perform changes.').default(
      false,
      'false'
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
        console.log(
          `Showing generic extension attributes in realm "${storage.session.getRealm()}"...`
        );
        await showGenericExtensionAttributes(
          options.includeCustomized,
          options.dryRun
        );
        console.log('Done.');
      }
    }
    // end command logic inside action handler
  );

program.parse();
