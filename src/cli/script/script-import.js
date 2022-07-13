import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../ops/AuthenticateOps.js';
import storage from '../../storage/SessionStorage.js';
import {
  createProgressBar,
  printMessage,
  stopProgressBar,
  updateProgressBar,
} from '../../ops/utils/Console.js';
import {
  convertTextArrayToBase64,
  validateImport,
} from '../../ops/utils/ExportImportUtils.js';
import { putScript } from '../../api/ScriptApi.js';

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
        fs.readFile(options.file, 'utf8', (err, data) => {
          if (err) throw err;
          const scriptData = JSON.parse(data);
          if (validateImport(scriptData.meta)) {
            createProgressBar(Object.keys(scriptData.script).length, '');
            for (const existingId in scriptData.script) {
              if ({}.hasOwnProperty.call(scriptData.script, existingId)) {
                let newId = existingId;
                // console.log(id);
                const encodedScript = convertTextArrayToBase64(
                  scriptData.script[existingId].script
                );
                scriptData.script[existingId].script = encodedScript;
                if (options.reUuid) {
                  newId = uuidv4();
                  // printMessage(
                  //   `Re-uuid-ing script ${scriptData.script[existingId].name} ${existingId} => ${newId}...`
                  // );
                  scriptData.script[existingId]._id = newId;
                }
                if (options.script) {
                  // printMessage(
                  //   `Renaming script ${scriptData.script[existingId].name} => ${options.script}...`
                  // );
                  scriptData.script[existingId].name = options.script;
                }
                updateProgressBar(
                  `Importing ${scriptData.script[existingId].name}`
                );
                // console.log(scriptData.script[id]);
                putScript(newId, scriptData.script[existingId]).then(
                  (result) => {
                    if (result == null)
                      printMessage(
                        `Error importing ${scriptData.script[existingId].name}`,
                        'error'
                      );
                  }
                );
                if (options.script) break;
              }
            }
            stopProgressBar('Done');
            // printMessage('Done');
          } else {
            printMessage('Import validation failed...', 'error');
          }
        });
      }
    }
    // end command logic inside action handler
  );

program.parse();
