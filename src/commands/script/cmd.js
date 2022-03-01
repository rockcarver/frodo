import fs from 'fs';
import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import {
  getScript,
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
        console.log(
          `Listing scripts in realm "${storage.session.getRealm()}"...`
        );
        const scriptList = await listScripts();
        // console.log(scriptList);
        scriptList.sort((a, b) => a.name.localeCompare(b.name));
        scriptList.forEach((item, index) => {
          console.log(`- ${item.name}`);
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
          console.log('Exporting script...');
          let fileName = `${command.opts().script}.json`;
          if (command.opts().file) {
            fileName = command.opts().file;
          }
          scriptData = await getScriptByName(command.opts().script);
          if (scriptData.length > 1) {
            return console.error(
              `Multiple scripts with name ${command.opts().script} found...`
            );
          }
          scriptData.forEach((element) => {
            const scriptTextArray = convertBase64ScriptToArray(element.script);
            element.script = scriptTextArray;
          });
          saveToFile('script', scriptData, '_id', fileName);
          // fs.writeFile(fileName, JSON.stringify(scriptData[0], null, 2), function (err, data) {
          //     if (err) {
          //         return console.error("ERROR - can't save script to file");
          //     }
          // });
        }
        // exportAll -a
        else if (command.opts().all) {
          console.log('Exporting all scripts to a single file...');
          let fileName = 'allScripts.json';
          const scriptList = await listScripts();
          const allScriptsData = [];
          for (const item of scriptList) {
            scriptData = await getScriptByName(item.name);
            scriptData.forEach((element) => {
              const scriptTextArray = convertBase64ScriptToArray(
                element.script
              );
              element.script = scriptTextArray;
              allScriptsData.push(element);
            });
          }
          if (command.opts().file) {
            fileName = command.opts().file;
          }
          saveToFile('script', allScriptsData, '_id', fileName);
        }
        // exportAllSeparate -A
        else if (command.opts().allSeparate) {
          console.log('Exporting all scripts to separate files...');
          const scriptList = await listScripts();
          for (const item of scriptList) {
            scriptData = await getScriptByName(item.name);
            scriptData.forEach((element) => {
              const scriptTextArray = convertBase64ScriptToArray(
                element.script
              );
              element.script = scriptTextArray;
              // allScriptsData.push(element);
            });
            const fileName = `./${item.name}.json`;
            saveToFile('script', scriptData, '_id', fileName);
          }
        }
        // unrecognized combination of options or no options
        else {
          console.log('Unrecognized combination of options or no options...');
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
    .addOption(common.fileOptionM)
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
        console.log(
          `Importing script(s) into realm "${storage.session.getRealm()}"...`
        );
        fs.readFile(command.opts().file, 'utf8', (err, data) => {
          if (err) throw err;
          const scriptData = JSON.parse(data);
          if (validateImport(scriptData.meta)) {
            for (const id in scriptData.script) {
              if ({}.hasOwnProperty.call(scriptData.script, id)) {
                // console.log(id);
                encodedScript = convertArrayToBase64Script(
                  scriptData.script[id].script
                );
                scriptData.script[id].script = encodedScript;
                // console.log(scriptData.script[id]);
                putScript(id, scriptData.script[id]).then((result) => {
                  if (!result == null) console.log(`Imported ${id}`);
                });
              }
            }
          } else {
            console.error('Import validation failed...');
          }
        });
      }
    });

  script.showHelpAfterError();
  return script;
}
