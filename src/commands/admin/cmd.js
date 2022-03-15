import { Command, Option } from 'commander';
import { v4 as uuidv4 } from 'uuid';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import {
  listOAuth2CustomClients,
  listOAuth2AdminClients,
  createOAuth2ClientWithAdminPrivileges,
  grantOAuth2ClientAdminPrivileges,
  revokeOAuth2ClientAdminPrivileges,
  hideGenericExtensionAttributes,
  showGenericExtensionAttributes,
  repairOrgModel,
} from '../../api/AdminApi.js';
import storage from '../../storage/SessionStorage.js';

export default function setup() {
  const journey = new Command('admin')
    .helpOption('-h, --help', 'Help')
    .description('Platform admin tasks.');

  journey
    .command('create-oauth2-client-with-admin-privileges')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(new Option('--client-id [id]', 'Client id.'))
    .addOption(new Option('--client-secret [secret]', 'Client secret.'))
    .description('Create an oauth2 client with admin privileges.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        console.log(
          `Creating oauth2 client with admin privileges in realm "${storage.session.getRealm()}"...`
        );
        let clientId = uuidv4();
        let clientSecret = uuidv4();
        if (options.clientId) {
          clientId = options.clientId;
        }
        if (options.clientSecret) {
          clientSecret = options.clientSecret;
        }
        await createOAuth2ClientWithAdminPrivileges(clientId, clientSecret);
        console.log(`Client ID: ${clientId}`);
        console.log(`Client Secret: ${clientSecret}`);
      }
    });

  journey
    .command('list-oauth2-clients-with-admin-privileges')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .description('List oauth2 clients with admin privileges.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        console.log(
          `Listing oauth2 clients with admin privileges in realm "${storage.session.getRealm()}"...`
        );
        const adminClients = await listOAuth2AdminClients();
        adminClients.sort((a, b) => a.localeCompare(b));
        adminClients.forEach((item) => {
          console.log(`${item}`);
        });
      }
    });

  journey
    .command('grant-oauth2-client-admin-privileges')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(
      new Option(
        '-t, --target <target name or id>',
        'Name of the oauth2 client.'
      )
    )
    .description('Grant an oauth2 client admin privileges.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        console.log(
          `Granting oauth2 client "${
            options.target
          }" in realm "${storage.session.getRealm()}" admin privileges...`
        );
        await grantOAuth2ClientAdminPrivileges(options.target);
        console.log('Done.');
      }
    });

  journey
    .command('revoke-oauth2-client-admin-privileges')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(
      new Option(
        '-t, --target <target name or id>',
        'Name of the oauth2 client.'
      )
    )
    .description('Revoke admin privileges from an oauth2 client.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        console.log(
          `Revoking admin privileges from oauth2 client "${
            options.target
          }" in realm "${storage.session.getRealm()}"...`
        );
        await revokeOAuth2ClientAdminPrivileges(options.target);
        console.log('Done.');
      }
    });

  journey
    .command('list-oauth2-clients-with-custom-privileges')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .description('List oauth2 clients with custom privileges.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        console.log(
          `Listing oauth2 clients with custom privileges in realm "${storage.session.getRealm()}"...`
        );
        const adminClients = await listOAuth2CustomClients();
        adminClients.sort((a, b) => a.localeCompare(b));
        adminClients.forEach((item) => {
          console.log(`${item}`);
        });
      }
    });

  journey
    .command('hide-generic-extension-attributes')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
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
    .description('Hide generic extension attributes.')
    .action(async (host, realm, user, password, options) => {
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
    });

  journey
    .command('show-generic-extension-attributes')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
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
    .description('Show generic extension attributes.')
    .action(async (host, realm, user, password, options) => {
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
    });

  journey
    .command('repair-org-model')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(
      new Option(
        '--extend-permissions',
        'Extend permissions to include custom attributes.'
      ).default(false, 'false')
    )
    .addOption(
      new Option('--dry-run', 'Dry-run only, do not perform changes.').default(
        false,
        'false'
      )
    )
    .description('Repair org model.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        console.log(
          `Repairing org model in realm "${storage.session.getRealm()}"...`
        );
        await repairOrgModel(options.extendPermissions, options.dryRun);
        console.log('Done.');
      }
    });

  journey.showHelpAfterError();
  return journey;
}
