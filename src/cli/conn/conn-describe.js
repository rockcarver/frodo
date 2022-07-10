import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { describeConnectionProfile } from '../../ops/ConnectionProfileOps.js';

const program = new Command('frodo conn describe');

program
  .description('Describe connection profile.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addOption(new Option('--show-secrets', 'Show passwords and secrets.'))
  .action(
    // implement command logic inside action handler
    async (host, options) => {
      describeConnectionProfile(host, options.showSecrets);
    }
    // end command logic inside action handler
  );

program.parse();
