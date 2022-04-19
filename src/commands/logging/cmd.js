import { Command } from 'commander';
import { getConnection, saveConnection } from '../../api/AuthApi.js';
import * as common from '../cmd_common.js';
import { getSources, tailLogs } from '../../api/LogApi.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../api/utils/Console.js';

export default function setup() {
  const logs = new Command('logs');
  logs
    .addArgument(common.hostArgumentM)
    .helpOption('-h, --help', 'Help')
    .description('View Identity Cloud logs.');

  logs
    .command('list')
    .addArgument(common.hostArgumentM)
    .addArgument(common.apiKeyArgument)
    .addArgument(common.apiSecretArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.insecureOption)
    .description('List available ID Cloud log sources.')
    .action(async (host, key, secret, options) => {
      let credsFromParameters = true;
      storage.session.setTenant(host);
      storage.session.setLogApiKey(key);
      storage.session.setLogApiSecret(secret);
      storage.session.setAllowInsecureConnection(options.insecure);
      printMessage('Listing available ID Cloud log sources...');
      const conn = await getConnection();
      storage.session.setTenant(conn.tenant);
      if (
        !storage.session.getLogApiKey() &&
        !storage.session.getLogApiSecret()
      ) {
        credsFromParameters = false;
        if (conn.key == null && conn.secret == null) {
          printMessage(
            'API key and secret not specified as parameters and no saved values found!',
            'warn'
          );
          return;
        }
        storage.session.setLogApiKey(conn.key);
        storage.session.setLogApiSecret(conn.secret);
      }
      const sources = await getSources();
      if (!sources) {
        printMessage(
          "Can't get sources, possible cause - wrong API key or secret",
          'error'
        );
      } else {
        if (credsFromParameters) await saveConnection(); // save new values if they were specified on CLI
        printMessage('Available log sources:');
        sources.result.forEach((source) => {
          printMessage(`${source}`);
        });
        printMessage('You can use any combination of comma separated sources.');
      }
    });

  logs
    .command('tail')
    .addArgument(common.hostArgumentM)
    .addArgument(common.apiKeyArgument)
    .addArgument(common.apiSecretArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.insecureOption)
    .addOption(common.sourcesOptionM)
    .description('Tail Identity Cloud logs.')
    .action(async (host, key, secret, options, command) => {
      storage.session.setTenant(host);
      storage.session.setLogApiKey(key);
      storage.session.setLogApiSecret(secret);
      storage.session.setAllowInsecureConnection(options.insecure);
      const conn = await getConnection();
      if(conn) {
        printMessage(
            `Tailing ID Cloud logs from the following sources: ${
              command.opts().sources
            }...`
          );
        storage.session.setTenant(conn.tenant);
        if (
          !storage.session.getLogApiKey() &&
          !storage.session.getLogApiSecret()
        ) {
          if (conn.key == null && conn.secret == null) {
            printMessage(
              'API key and secret not specified as parameters and no saved values found!',
              'error'
            );
            return;
          }
          storage.session.setLogApiKey(conn.key);
          storage.session.setLogApiSecret(conn.secret);
        }
        await tailLogs(command.opts().sources, null);          
      }
    });

  // logs
  //     .command("get")
  //     .helpOption("-l, --help", "Help")
  //     .addOption(common.dirOptionM)
  //     .description("Get ID Cloud logs for a give time period (max age 30 days)")
  //     .action(async (options, command) => {
  //         // implement
  //     });

  logs.showHelpAfterError();
  return logs;
}
