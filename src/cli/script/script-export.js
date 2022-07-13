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
  convertBase64TextToArray,
  getTypedFilename,
  saveToFile,
} from '../../ops/utils/ExportImportUtils.js';
import { getScriptByName, listScripts } from '../../api/ScriptApi.js';

const program = new Command('frodo script export');

program
  .description('Export scripts.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(
    new Option(
      '-n, --script-name <name>',
      'Name of the script. If specified, -a and -A are ignored.'
    )
  )
  // .addOption(
  //   new Option(
  //     '-i, --script-id <uuid>',
  //     'Uuid of the script. If specified, -a and -A are ignored.'
  //   )
  // )
  .addOption(new Option('-f, --file <file>', 'Name of the export file.'))
  .addOption(
    new Option(
      '-a, --all',
      'Export all cmds to a single file. Ignored with -i.'
    )
  )
  .addOption(
    new Option(
      '-A, --all-separate',
      'Export all cmds to separate files (*.cmd.json) in the current directory. Ignored with -i or -a.'
    )
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
        // export
        if (options.scriptName || options.script) {
          printMessage('Exporting script...');
          let fileName = getTypedFilename(
            options.scriptName || options.script,
            'script'
          );
          if (options.file) {
            fileName = options.file;
          }
          const scriptData = await getScriptByName(
            options.scriptName || options.script
          );
          if (scriptData.length > 1) {
            printMessage(
              `Multiple scripts with name ${
                options.scriptName || options.script
              } found...`,
              'error'
            );
          }
          scriptData.forEach((element) => {
            const scriptTextArray = convertBase64TextToArray(element.script);
            // eslint-disable-next-line no-param-reassign
            element.script = scriptTextArray;
          });
          saveToFile('script', scriptData, '_id', fileName);
        }
        // -a / --all
        else if (options.all) {
          printMessage('Exporting all scripts to a single file...');
          let fileName = getTypedFilename(
            `all${storage.session.getRealm()}Scripts`,
            'script'
          );
          const scriptList = await listScripts();
          const allScriptsData = [];
          createProgressBar(scriptList.length, 'Exporting script');
          for (const item of scriptList) {
            updateProgressBar(`Reading script ${item.name}`);
            // eslint-disable-next-line no-await-in-loop
            const scriptData = await getScriptByName(item.name);
            scriptData.forEach((element) => {
              const scriptTextArray = convertBase64TextToArray(element.script);
              // eslint-disable-next-line no-param-reassign
              element.script = scriptTextArray;
              allScriptsData.push(element);
            });
          }
          if (options.file) {
            fileName = options.file;
          }
          stopProgressBar('Done');
          saveToFile('script', allScriptsData, '_id', fileName);
        }
        // -A / --all-separate
        else if (options.allSeparate) {
          printMessage('Exporting all scripts to separate files...');
          const scriptList = await listScripts();
          createProgressBar(scriptList.length, 'Exporting script');
          for (const item of scriptList) {
            updateProgressBar(`Reading script ${item.name}`);
            // eslint-disable-next-line no-await-in-loop
            const scriptData = await getScriptByName(item.name);
            scriptData.forEach((element) => {
              const scriptTextArray = convertBase64TextToArray(element.script);
              // eslint-disable-next-line no-param-reassign
              element.script = scriptTextArray;
            });
            const fileName = getTypedFilename(item.name, 'script');
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
          program.help();
        }
      }
    }
    // end command logic inside action handler
  );

program.parse();
