import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../ops/AuthenticateOps.js';
import storage from '../../storage/SessionStorage.js';
import { createKeyValueTable, printMessage } from '../../ops/utils/Console.js';
import { addCustomDomain } from '../../ops/RealmOps.js';

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
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage(
          `Adding custom DNS domain ${
            options.domain
          } to realm ${storage.session.getRealm()}...`
        );
        await addCustomDomain(storage.session.getRealm(), options.domain);
      }
    }
    // end command logic inside action handler
  );

program.parse();
