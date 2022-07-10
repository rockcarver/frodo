import fs from 'fs';
import { Command } from 'commander';
import {
  listConnectionProfiles,
  saveConnectionProfile,
  getConnectionProfilesFileName,
} from '../../ops/ConnectionProfileOps.js';
import * as common from '../cmd_common.js';
import { printMessage } from '../../ops/utils/Console.js';
import storage from '../../storage/SessionStorage.js';

export default function setup() {
  const connections = new Command('connections');
  connections
    .helpOption('-h, --help', 'Help')
    .description('Manage connection profiles.');

  connections
    .command('list')
    .showHelpAfterError()
    .helpOption('-h, --help', 'Help')
    .description('List connection profiles.')
    .action(async () => {
      // console.log('list command called');
      listConnectionProfiles();
    });

  connections
    .command('add')
    .addArgument(common.hostArgumentM)
    .addArgument(common.userArgumentM)
    .addArgument(common.passwordArgumentM)
    .addArgument(common.apiKeyArgument)
    .addArgument(common.apiSecretArgument)
    .showHelpAfterError()
    .helpOption('-h, --help', 'Help')
    .description(
      'Add a new connection profile. You have to specify a URL, username and password at a minimum.\n' +
        'Optionally, for Identity Cloud, you can also add a log API key and secret.'
    )
    .action(async (host, user, password, key, secret) => {
      // console.log('list command called');
      storage.session.setTenant(host);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setLogApiKey(key);
      storage.session.setLogApiSecret(secret);
      saveConnectionProfile();
    });

  connections
    .command('delete')
    .addArgument(common.hostArgumentM)
    .showHelpAfterError()
    .helpOption('-h, --help', 'Help')
    .description('Delete connection profiles.')
    .action(async (host) => {
      // console.log('list command called');
      const filename = getConnectionProfilesFileName();
      let connectionsData = {};
      fs.stat(filename, (err) => {
        if (err == null) {
          const data = fs.readFileSync(filename, 'utf8');
          connectionsData = JSON.parse(data);
          if (connectionsData[host])
            printMessage(`Deleting existing connection profile ${host}`);
          else printMessage(`Connection profile ${host} not found`);
        } else if (err.code === 'ENOENT') {
          printMessage(`Connection profile file ${filename} not found`);
        } else {
          printMessage(
            `Error in deleting connection profile: ${err.code}`,
            'error'
          );
          return;
        }
        delete connectionsData[host];
        fs.writeFileSync(filename, JSON.stringify(connectionsData, null, 2));
        printMessage('done.');
      });
    });
  connections.showHelpAfterError();
  return connections;
}
