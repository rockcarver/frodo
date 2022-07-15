import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../ops/AuthenticateOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';
import { importScriptsFromFile } from '../../ops/ScriptOps.js';

const program = new Command('frodo script import');

program
  .description('Import scripts.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(new Option('-f, --file <file>', 'Name of the file to import.'))
  .addOption(
    new Option(
      '-n, --script-name <name>',
      'Name of the script. If specified, -a and -A are ignored.'
    )
  )
  .addOption(
    new Option(
      '--re-uuid',
      'Re-UUID. Create a new UUID for the script upon import. Use this to duplicate a script or create a new version of the same script. Note that you must also choose a new name using -n/--script-name to avoid import errors.'
    ).default(false, 'false')
  )
  // deprecated option
  .addOption(
    new Option(
      '-s, --script <script>',
      'DEPRECATED! Use -n/--script-name instead. Name of the script.'
    )
  )
  .action(
    // implement command logic inside action handler
    async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage(
          `Importing script(s) into realm "${storage.session.getRealm()}"...`
        );
        importScriptsFromFile(
          options.scriptName || options.script,
          options.file,
          options.reUuid
        );
      }
    }
    // end command logic inside action handler
  );

program.parse();
