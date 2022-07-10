import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../ops/AuthenticateOps.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';
import {
  importFirstThemeFromFile,
  importThemeById,
  importThemeByName,
  importThemesFromFile,
  importThemesFromFiles,
} from '../../ops/ThemeOps.js';

const program = new Command('frodo theme import');

program
  .description('Import themes.')
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
      '-n, --theme-name <theme>',
      'Name of a theme. If specified, -a and -A are ignored.'
    )
  )
  .addOption(
    new Option(
      '-i, --theme-id <theme>',
      'Id of a theme. If specified, -a and -A are ignored.'
    )
  )
  .addOption(
    new Option(
      '-f, --file <file>',
      'Name of the file to import the theme(s) from.'
    )
  )
  .addOption(
    new Option(
      '-a, --all',
      'Import all the themes from single file. Ignored with -n or -i.'
    )
  )
  .addOption(
    new Option(
      '-A, --all-separate',
      'Import all the themes from separate files (*.json) in the current directory. Ignored with -n or -i or -a.'
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
        // import by name
        if (options.file && options.themeName) {
          printMessage(
            `Importing theme with name "${
              options.themeName
            }" into realm "${storage.session.getRealm()}"...`
          );
          importThemeByName(options.themeName, options.file);
        }
        // import by id
        else if (options.file && options.themeId) {
          printMessage(
            `Importing theme with id "${
              options.themeId
            }" into realm "${storage.session.getRealm()}"...`
          );
          importThemeById(options.themeId, options.file);
        }
        // --all -a
        else if (options.all && options.file) {
          printMessage(
            `Importing all themes from a single file (${options.file})...`
          );
          importThemesFromFile(options.file);
        }
        // --all-separate -A
        else if (options.allSeparate && !options.file) {
          printMessage(
            'Importing all themes from separate files in current directory...'
          );
          importThemesFromFiles();
        }
        // import single theme from file
        else if (options.file) {
          printMessage(
            `Importing first theme from file "${
              options.file
            }" into realm "${storage.session.getRealm()}"...`
          );
          importFirstThemeFromFile(options.file);
        }
        // unrecognized combination of options or no options
        else {
          printMessage('Unrecognized combination of options or no options...');
          program.help();
        }
      }
    }
    // end command logic inside action handler
  );

program.parse();
