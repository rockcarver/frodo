import { Command, Option } from 'commander';
import { v4 as uuidv4 } from 'uuid';
import Table from 'cli-table3';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import { clientCredentialsGrant } from '../../api/OAuth2OIDCApi.js';
import {
  addAutoIdStaticUserMapping,
  listNonOAuth2AdminStaticUserMappings,
  removeStaticUserMapping,
  listOAuth2CustomClients,
  listOAuth2AdminClients,
  createOAuth2ClientWithAdminPrivileges,
  createLongLivedToken,
  grantOAuth2ClientAdminPrivileges,
  revokeOAuth2ClientAdminPrivileges,
  hideGenericExtensionAttributes,
  showGenericExtensionAttributes,
  repairOrgModel,
} from '../../api/AdminApi.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../api/utils/Console.js';

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
    .addOption(
      new Option(
        '--llt',
        'Create a long-lived token and store it in a secret. The default secret name is esv-admin-token and the default token lifetime is 315,360,000 seconds (10 years). Both can be overwritten with the --llt-esv and --llt-ttl options.'
      ).default(false, 'false')
    )
    .addOption(
      new Option(
        '--llt-scope [scope]',
        'Request the following scope(s). This option only applies if used with the --llt option.'
      ).default('fr:idm:*', 'fr:idm:*')
    )
    .addOption(
      new Option(
        '--llt-esv [esv]',
        'Name of the secret to store the token in. This option only applies if used with the --llt option.'
      ).default('esv-admin-token', 'esv-admin-token')
    )
    .addOption(
      new Option(
        '--llt-ttl [ttl]',
        'Token lifetime (seconds). This option only applies if used with the --llt option.'
      ).default(315360000, '315,360,000 seconds (10 years)')
    )
    .description('Create an oauth2 client with admin privileges.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage(
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
        const table = new Table({
          chars: {
            top: '',
            'top-mid': '',
            'top-left': '',
            'top-right': '',
            bottom: '',
            'bottom-mid': '',
            'bottom-left': '',
            'bottom-right': '',
            left: '',
            'left-mid': '',
            mid: '',
            'mid-mid': '',
            right: '',
            'right-mid': '',
          },
          style: { 'padding-left': 0, 'padding-right': 0 },
          wordWrap: true,
        });
        if (options.llt) {
          const response = await createLongLivedToken(
            clientId,
            clientSecret,
            options.scope,
            options.lltEsv,
            options.lltTtl
          );
          table.push(['Secret Name'.brightCyan, options.lltEsv]);
          table.push(['Scope'.brightCyan, response.scope]);
          // table.push(['Token Lifetime'.brightCyan, response.expires_in]);
          table.push(['Expires'.brightCyan, response.expires_on]);
        }
        table.push(['Client ID'.brightCyan, clientId]);
        table.push(['Client Secret'.brightCyan, clientSecret]);
        printMessage(table.toString());
      }
    });

  journey
    .command('get-access-token')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(
      new Option('--client-id [id]', 'Client id.').makeOptionMandatory()
    )
    .addOption(
      new Option(
        '--client-secret [secret]',
        'Client secret.'
      ).makeOptionMandatory()
    )
    .addOption(
      new Option('--scope [scope]', 'Request the following scope(s).').default(
        'fr:idm:*',
        'fr:idm:*'
      )
    )
    .description('Get an access token using client credentials grant type.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage(
          `Getting an access token using client "${options.clientId}"...`
        );
        const response = await clientCredentialsGrant(
          options.clientId,
          options.clientSecret,
          options.scope
        );
        printMessage(`Token: ${response.access_token}`);
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
        printMessage(
          `Listing oauth2 clients with admin privileges in realm "${storage.session.getRealm()}"...`
        );
        const adminClients = await listOAuth2AdminClients();
        adminClients.sort((a, b) => a.localeCompare(b));
        adminClients.forEach((item) => {
          printMessage(`${item}`);
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
        printMessage(
          `Granting oauth2 client "${
            options.target
          }" in realm "${storage.session.getRealm()}" admin privileges...`
        );
        await grantOAuth2ClientAdminPrivileges(options.target);
        printMessage('Done.');
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
        printMessage(
          `Revoking admin privileges from oauth2 client "${
            options.target
          }" in realm "${storage.session.getRealm()}"...`
        );
        await revokeOAuth2ClientAdminPrivileges(options.target);
        printMessage('Done.');
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
        printMessage(
          `Listing oauth2 clients with custom privileges in realm "${storage.session.getRealm()}"...`
        );
        const adminClients = await listOAuth2CustomClients();
        adminClients.sort((a, b) => a.localeCompare(b));
        adminClients.forEach((item) => {
          printMessage(`${item}`);
        });
      }
    });

  journey
    .command('list-static-user-mappings')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(
      new Option(
        '--show-protected',
        'Show protected (system) subjects.'
      ).default(false, 'false')
    )
    .description(
      'List all subjects of static user mappings that are not oauth2 clients.'
    )
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage(
          'Listing all non-oauth2 client subjects of static user mappings...'
        );
        const subjects = await listNonOAuth2AdminStaticUserMappings(
          options.showProtected
        );
        subjects.sort((a, b) => a.localeCompare(b));
        subjects.forEach((item) => {
            printMessage(`${item}`);
        });
      }
    });

  journey
    .command('remove-static-user-mapping')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(
      new Option(
        '--subject <subject>',
        "Subject who's mapping is to be removed."
      )
    )
    .description("Remove a subject's static user mapping.")
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage("Removing a subject's static user mapping...");
        await removeStaticUserMapping(options.subject);
        printMessage('Done.');
      }
    });

  journey
    .command('add-autoid-static-user-mapping')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .description(
      'Add AutoId static user mapping to enable dashboards and other AutoId-based functionality.'
    )
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage(`Adding AutoId static user mapping...`);
        await addAutoIdStaticUserMapping();
        printMessage('Done.');
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
        printMessage(
          `Hiding generic extension attributes in realm "${storage.session.getRealm()}"...`
        );
        await hideGenericExtensionAttributes(
          options.includeCustomized,
          options.dryRun
        );
        printMessage('Done.');
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
        printMessage(
          `Showing generic extension attributes in realm "${storage.session.getRealm()}"...`
        );
        await showGenericExtensionAttributes(
          options.includeCustomized,
          options.dryRun
        );
        printMessage('Done.');
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
        printMessage(
          `Repairing org model in realm "${storage.session.getRealm()}"...`
        );
        await repairOrgModel(options.extendPermissions, options.dryRun);
        printMessage('Done.');
      }
    });

  journey.showHelpAfterError();
  return journey;
}
