import { Command, Option } from 'commander';
import { getConnection, saveConnection, getTokens } from '../../api/AuthApi.js';
import * as common from '../cmd_common.js';
// import { createAPIKeyAndSecret, tailLogs } from '../../api/LogApi.js';
import { provisionCreds, tailLogs, resolveLevel } from '../../ops/LogOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';

const program = new Command('frodo journey tail');
program
  .description('Tail Identity Cloud logs.')
  .helpOption('-h, --help', 'Help')
  .addArgument(common.hostArgumentM)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.insecureOption)
  .addOption(common.sourcesOptionM)
  .addOption(
    new Option(
      '-l, --level <level>',
      'Set log level filter. You can specify the level as a number or a string. \
Following values are possible (values on the same line are equivalent): \
\n0, SEVERE, FATAL, or ERROR\n1, WARNING, WARN or CONFIG\
\n2, INFO or INFORMATION\n3, DEBUG, FINE, FINER or FINEST\
\n4 or ALL'
    ).default('ERROR', `${resolveLevel('ERROR')}`)
  )
  .addOption(
    new Option('-t, --transaction-id <txid>', 'Filter by transactionId')
  )
  .action(async (host, user, password, options, command) => {
    let credsFromParameters = true;
    storage.session.setTenant(host);
    storage.session.setUsername(user);
    storage.session.setPassword(password);
    storage.session.setAllowInsecureConnection(options.insecure);
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
    printMessage(
      `Tailing ID Cloud logs from the following sources: ${
        command.opts().sources
      } and levels [${resolveLevel(command.opts().level)}]...`
    );
    if (credsFromParameters) await saveConnection(); // save new values if they were specified on CLI
    await tailLogs(
      command.opts().sources,
      resolveLevel(command.opts().level),
      command.opts().transactionId,
      null
    );
  });

program.parse();
