/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import wordwrap from '../../api/utils/Wordwrap.js';
import { listSecrets, getSecret } from '../../api/SecretsApi.js';
import storage from '../../storage/SessionStorage.js';
import {
  printMessage,
  createTable,
  createKeyValueTable,
} from '../../api/utils/Console.js';

export default function setup() {
  const journey = new Command('secret')
    .helpOption('-h, --help', 'Help')
    .description('Manage Identity Cloud secrets.');

  journey
    .command('list')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(
      new Option('-l, --long', 'Long with all fields.').default(false, 'false')
    )
    .description('List all secrets.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage('Listing all secrets...');
        const secrets = await listSecrets();
        if (options.long) {
          const table = createTable();

          secrets.forEach((secret) => {
            table.push([
              secret._id,
              secret.activeVersion,
              secret.loadedVersion,
              secret.loaded ? 'loaded'.brightGreen : 'unloaded'.brightRed,
              wordwrap(secret.description, 40),
              secret.lastChangeDate,
            ]);
          });
          printMessage(table.toString());
        } else {
          secrets.forEach((secret) => {
            printMessage(secret._id);
          });
        }
      }
    });

  journey
    .command('details')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(new Option('-t, --target <name>', 'Name of the secret.'))
    .description('Show details of a secret.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage(`Retrieving details of secret ${options.target}...`);
        const secret = await getSecret(options.target);
        const table = createKeyValueTable();
        table.push(['Name'.brightCyan, secret._id]);
        table.push(['Active Version'.brightCyan, secret.activeVersion]);
        table.push(['Loaded Version'.brightCyan, secret.loadedVersion]);
        table.push([
          'Status'.brightCyan,
          secret.loaded ? 'loaded'.brightGreen : 'unloaded'.brightRed,
        ]);
        table.push([
          'Description'.brightCyan,
          wordwrap(secret.description, 60),
        ]);
        table.push(['Modified'.brightCyan, secret.lastChangeDate]);
        table.push(['Modifier'.brightCyan, secret.lastChangedBy]);
        table.push(['Encoding'.brightCyan, secret.encoding]);
        table.push([
          'Use In Placeholders'.brightCyan,
          secret.useInPlaceholders,
        ]);
        printMessage(table.toString());
      }
    });

  journey.showHelpAfterError();
  return journey;
}
