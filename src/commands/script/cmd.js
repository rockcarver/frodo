import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import {
  putScript,
  listScripts,
  getScriptByName,
} from '../../api/ScriptApi.js';
import {
  saveToFile,
  convertBase64ScriptToArray,
  convertArrayToBase64Script,
  validateImport,
} from '../../api/utils/ExportImportUtils.js';
import storage from '../../storage/SessionStorage.js';
import {
  printMessage,
  createProgressBar,
  updateProgressBar,
  stopProgressBar,
} from '../../api/utils/Console.js';

export default function setup() {
  const script = new Command('script')
    .helpOption('-h, --help', 'Help')
    .description('Manage scripts.');

  script
    .command('list')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .description('List all the scripts in a realm.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage(
          `Listing scripts in realm "${storage.session.getRealm()}"...`
        );
        const scriptList = await listScripts();
        // console.log(scriptList);
        scriptList.sort((a, b) => a.name.localeCompare(b.name));
        scriptList.forEach((item) => {
          printMessage(`- ${item.name}`, 'info');
        });
      }
    });

  script
    .command('export')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(
      new Option(
        '-s, --script <script>',
        'Name of a script. If specified, -a and -A are ignored.'
      )
    )
    .addOption(
      new Option(
        '-f, --file <file>',
        'Name of the file to write the exported script(s) to. Ignored with -A.'
      )
    )
    .addOption(
      new Option(
        '-a, --all',
        'Export all the scripts in a realm. Ignored with -t.'
      )
    )
    .addOption(
      new Option(
        '-A, --allSeparate',
        'Export all the scripts in a realm as separate files <script>.json. Ignored with -s or -a.'
      )
    )
    .description('Export scripts.')
    // eslint-disable-next-line consistent-return
    .action(async (host, realm, user, password, options, command) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      let scriptData = null;
      if (await getTokens()) {
        // export
        if (command.opts().script) {
          printMessage('Exporting script...');
          let fileName = `${command.opts().script}.json`;
          if (command.opts().file) {
            fileName = command.opts().file;
          }
          scriptData = await getScriptByName(command.opts().script);
          if (scriptData.length > 1) {
            return printMessage(
              `Multiple scripts with name ${command.opts().script} found...`,
              'error'
            );
          }
          scriptData.forEach((element) => {
            const scriptTextArray = convertBase64ScriptToArray(element.script);
            // eslint-disable-next-line no-param-reassign
            element.script = scriptTextArray;
          });
          saveToFile('script', scriptData, '_id', fileName);
        }
        // exportAll -a
        else if (command.opts().all) {
          printMessage('Exporting all scripts to a single file...');
          let fileName = 'allScripts.json';
          const scriptList = await listScripts();
          const allScriptsData = [];
          createProgressBar(scriptList.length, 'Exporting script');
          for (const item of scriptList) {
            updateProgressBar(`Reading script ${item.name}`);
            // eslint-disable-next-line no-await-in-loop
            scriptData = await getScriptByName(item.name);
            scriptData.forEach((element) => {
              const scriptTextArray = convertBase64ScriptToArray(
                element.script
              );
              // eslint-disable-next-line no-param-reassign
              element.script = scriptTextArray;
              allScriptsData.push(element);
            });
          }
          if (command.opts().file) {
            fileName = command.opts().file;
          }
          stopProgressBar('Done');
          saveToFile('script', allScriptsData, '_id', fileName);
        }
        // exportAllSeparate -A
        else if (command.opts().allSeparate) {
          printMessage('Exporting all scripts to separate files...');
          const scriptList = await listScripts();
          createProgressBar(scriptList.length, 'Exporting script');
          for (const item of scriptList) {
            updateProgressBar(`Reading script ${item.name}`);
            // eslint-disable-next-line no-await-in-loop
            scriptData = await getScriptByName(item.name);
            scriptData.forEach((element) => {
              const scriptTextArray = convertBase64ScriptToArray(
                element.script
              );
              // eslint-disable-next-line no-param-reassign
              element.script = scriptTextArray;
            });
            const fileName = `./${item.name}.json`;
            saveToFile('script', scriptData, '_id', fileName);
          }
          stopProgressBar('Done');
        }
        // unrecognized combination of options or no options
        else {
          printMessage(
            'Unrecognized combination of options or no options...',
            'error'
          );
          command.help();
        }
      }
    });

  script
    .command('import')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(
      new Option(
        '-f, --file <file>',
        'Name of the file to import the script(s) from.'
      )
    )
    .addOption(
      new Option(
        '-s, --script [script]',
        'Name of a script. If specified, -a and -A are ignored and only the first script is imported and given the name as indicated this parameter.'
      )
    )
    .addOption(
      new Option(
        '--re-uuid',
        'Re-UUID. Create a new unique UUID for the script upon import. Use this to duplicate a script or create a new version of the same script. Note that you must also choose a different name using the -s [name] than any existing scripts.'
      ).default(false, 'false')
    )
    .description('Import script.')
    .action(async (host, realm, user, password, options, command) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      let encodedScript = null;
      if (await getTokens()) {
        printMessage(
          `Importing script(s) into realm "${storage.session.getRealm()}"...`
        );
        fs.readFile(command.opts().file, 'utf8', (err, data) => {
          if (err) throw err;
          const scriptData = JSON.parse(data);
          if (validateImport(scriptData.meta)) {
            createProgressBar(Object.keys(scriptData.script).length, '');
            for (const existingId in scriptData.script) {
              if ({}.hasOwnProperty.call(scriptData.script, existingId)) {
                let newId = existingId;
                // console.log(id);
                encodedScript = convertArrayToBase64Script(
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
    });

  script.showHelpAfterError();
  return script;
}
