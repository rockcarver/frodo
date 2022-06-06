import { Command } from 'commander';
import { getConnection, saveConnection, getTokens } from '../../api/AuthApi.js';
import * as common from '../cmd_common.js';
import {
  createAPIKeyAndSecret,
  getSources,
  tailLogs,
} from '../../api/LogApi.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';

export default function setup() {
  const logs = new Command('logs');
  logs
    .addArgument(common.hostArgumentM)
    .helpOption('-h, --help', 'Help')
    .description(
      `View Identity Cloud logs. If valid tenant admin credentials are specified, a log API key and secret are automatically created for that admin user.`
    );

  logs
    .command('list')
    .addArgument(common.hostArgumentM)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.insecureOption)
    .description('List available ID Cloud log sources.')
    .action(async (host, user, password, options) => {
      let credsFromParameters = true;
      storage.session.setTenant(host);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setAllowInsecureConnection(options.insecure);
      printMessage('Listing available ID Cloud log sources...');
      const conn = await getConnection();
      storage.session.setTenant(conn.tenant);
      if (conn.key != null && conn.secret != null) {
        storage.session.setLogApiKey(conn.key);
        storage.session.setLogApiSecret(conn.secret);
      } else {
        if (conn.username == null && conn.password == null) {
          if (
            !storage.session.getUsername() &&
            !storage.session.getPassword()
          ) {
            credsFromParameters = false;
            printMessage(
              'User credentials not specified as parameters and no saved API key and secret found!',
              'warn'
            );
            return;
          }
        } else {
          storage.session.setUsername(conn.username);
          storage.session.setPassword(conn.password);
        }
        if (await getTokens()) {
          const creds = await createAPIKeyAndSecret();
          storage.session.setLogApiKey(creds.api_key_id);
          storage.session.setLogApiSecret(creds.api_key_secret);
        }
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
          printMessage(`${source}`, 'info');
        });
        printMessage('You can use any combination of comma separated sources.');
      }
    });

  logs
    .command('tail')
    .addArgument(common.hostArgumentM)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.insecureOption)
    .addOption(common.sourcesOptionM)
    .description('Tail Identity Cloud logs.')
    .action(async (host, user, password, options, command) => {
      let credsFromParameters = true;
      storage.session.setTenant(host);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setAllowInsecureConnection(options.insecure);
      const conn = await getConnection();
      storage.session.setTenant(conn.tenant);
      if (conn.key != null && conn.secret != null) {
        storage.session.setLogApiKey(conn.key);
        storage.session.setLogApiSecret(conn.secret);
      } else {
        if (conn.username == null && conn.password == null) {
          if (
            !storage.session.getUsername() &&
            !storage.session.getPassword()
          ) {
            credsFromParameters = false;
            printMessage(
              'User credentials not specified as parameters and no saved API key and secret found!',
              'warn'
            );
            return;
          }
        } else {
          storage.session.setUsername(conn.username);
          storage.session.setPassword(conn.password);
        }
        if (await getTokens()) {
          const creds = await createAPIKeyAndSecret();
          storage.session.setLogApiKey(creds.api_key_id);
          storage.session.setLogApiSecret(creds.api_key_secret);
        }
      }
      printMessage(
        `Tailing ID Cloud logs from the following sources: ${
          command.opts().sources
        }...`
      );
      if (credsFromParameters) await saveConnection(); // save new values if they were specified on CLI
      await tailLogs(command.opts().sources, null);
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
