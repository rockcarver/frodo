import { Command } from 'commander';
import { getConnection, saveConnection, getTokens } from '../../api/AuthApi.js';
import * as common from '../cmd_common.js';
import { provisionCreds, getLogSources } from '../../ops/LogOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';

const program = new Command('frodo journey list');
program
  .description('List available ID Cloud log sources.')
  .helpOption('-h, --help', 'Help')
  .addArgument(common.hostArgumentM)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.insecureOption)
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
      credsFromParameters = false;
      storage.session.setLogApiKey(conn.key);
      storage.session.setLogApiSecret(conn.secret);
    } else {
      if (conn.username == null && conn.password == null) {
        if (!storage.session.getUsername() && !storage.session.getPassword()) {
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
        const creds = await provisionCreds();
        storage.session.setLogApiKey(creds.api_key_id);
        storage.session.setLogApiSecret(creds.api_key_secret);
      }
    }

    const sources = await getLogSources();
    if (sources.length === 0) {
      printMessage(
        "Can't get sources, possible cause - wrong API key or secret",
        'error'
      );
    } else {
      if (credsFromParameters) await saveConnection(); // save new values if they were specified on CLI
      printMessage('Available log sources:');
      sources.forEach((source) => {
        printMessage(`${source}`, 'info');
      });
      printMessage('You can use any combination of comma separated sources.');
      printMessage('For example:');
      printMessage(`$ frodo logs tail -c am-core,idm-core ${host}`, 'info');
    }
  });

program.parse();
