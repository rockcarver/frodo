import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps } from '@rockcarver/frodo-lib';
const { getTokens } = AuthenticateOps;
import storage from '../../storage/SessionStorage.js';
import { ConnectionProfileOps } from '@rockcarver/frodo-lib';

const { listConnectionProfiles } = ConnectionProfileOps;

const program = new Command('frodo conn list');

program
  .description('List connection profiles.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addOption(
    new Option('-l, --long', 'Long with all fields.').default(false, 'false')
  )
  .action(
    // implement command logic inside action handler
    async (options) => {
      listConnectionProfiles(options.long);
    }
    // end command logic inside action handler
  );

program.parse();
