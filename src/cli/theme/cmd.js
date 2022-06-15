import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import { getThemes } from '../../api/ThemeApi.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../ops/utils/Console.js';
import {
  exportThemeById,
  exportThemeByName,
  exportThemesToFile,
  exportThemesToFiles,
  importFirstThemeFromFile,
  importThemeById,
  importThemeByName,
  importThemesFromFile,
  importThemesFromFiles,
} from '../../ops/ThemeOps.js';

export default function setup() {
  const themeCmd = new Command('theme')
    .helpOption('-h, --help', 'Help')
    .description('Manage themes.');

  themeCmd
    .command('list')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .description('List all the themes in a realm.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage(
          `Listing themes in realm "${storage.session.getRealm()}"...`
        );
        const themeList = await getThemes();
        themeList.sort((a, b) => a.name.localeCompare(b.name));
        themeList.forEach((item) => {
          printMessage(
            `${item.name}${item.isDefault ? ' [default]' : ''}`,
            'data'
          );
        });
      }
    });

  themeCmd
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
        '-t, --theme <theme>',
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
        '-f, --file [file]',
        'Name of the file to write the exported theme(s) to. Ignored with -A.'
      )
    )
    .addOption(
      new Option(
        '-a, --all',
        'Export all the themes in a realm to a single file. Ignored with -t and -i.'
      )
    )
    .addOption(
      new Option(
        '-A, --all-separate',
        'Export all the themes in a realm as separate files <theme name>.theme.json. Ignored with -t, -i, and -a.'
      )
    )
    .description('Export themes.')
    // eslint-disable-next-line consistent-return
    .action(async (host, realm, user, password, options, command) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      // let themeData = null;
      if (await getTokens()) {
        // export by name
        if (options.theme) {
          printMessage(
            `Exporting theme "${
              options.theme
            }" from realm "${storage.session.getRealm()}"...`
          );
          exportThemeByName(options.theme, options.file);
        }
        // export by id
        else if (options.themeId) {
          printMessage(
            `Exporting theme "${
              options.themeId
            }" from realm "${storage.session.getRealm()}"...`
          );
          exportThemeById(options.themeId, options.file);
        }
        // --all -a
        else if (options.all) {
          printMessage('Exporting all themes to a single file...');
          exportThemesToFile(options.file);
        }
        // --all-separate -A
        else if (options.allSeparate) {
          printMessage('Exporting all themes to separate files...');
          exportThemesToFiles();
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

  themeCmd
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
        '-t, --theme <theme>',
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
        'Import all the themes from single file. Ignored with -t or -i.'
      )
    )
    .addOption(
      new Option(
        '-A, --all-separate',
        'Import all the themes from separate files (*.json) in the current directory. Ignored with -t or -i or -a.'
      )
    )
    .description('Import theme.')
    .action(async (host, realm, user, password, options, command) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        // import by name
        if (options.file && options.theme) {
          printMessage(
            `Importing theme with name "${
              options.theme
            }" into realm "${storage.session.getRealm()}"...`
          );
          importThemeByName(options.theme, options.file);
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
          command.help();
        }
      }
    });

  themeCmd.showHelpAfterError();
  return themeCmd;
}
