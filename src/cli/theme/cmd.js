import fs from 'fs';
import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import {
  getThemes,
  getTheme,
  getThemeByName,
  putTheme,
  putThemeByName,
  putThemes,
} from '../../ops/ThemeOps.js';
import {
  getRealmString,
  getTypedFilename,
  saveToFile,
  validateImport,
} from '../../ops/utils/ExportImportUtils.js';
import storage from '../../storage/SessionStorage.js';
import {
  printMessage,
  createProgressBar,
  updateProgressBar,
  stopProgressBar,
} from '../../ops/utils/Console.js';

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
        if (command.opts().theme) {
          printMessage(
            `Exporting theme "${
              command.opts().theme
            }" from realm "${storage.session.getRealm()}"...`
          );
          let fileName = getTypedFilename(command.opts().theme, 'theme');
          if (command.opts().file) {
            fileName = command.opts().file;
          }
          createProgressBar(1, `Exporting ${command.opts().theme}`);
          const themeData = await getThemeByName(command.opts().theme);
          if (themeData.length === 0) {
            stopProgressBar(`Theme ${command.opts().theme} not found!`);
            printMessage(`Theme ${command.opts().theme} not found!`, 'error');
          } else {
            updateProgressBar(`Writing file ${fileName}`);
            saveToFile('theme', themeData, '_id', fileName);
            stopProgressBar(
              `Successfully exported theme ${command.opts().theme}.`
            );
          }
        }
        // export by id
        else if (command.opts().themeId) {
          printMessage(
            `Exporting theme "${
              command.opts().themeId
            }" from realm "${storage.session.getRealm()}"...`
          );
          let fileName = getTypedFilename(command.opts().themeId, 'theme');
          if (command.opts().file) {
            fileName = command.opts().file;
          }
          createProgressBar(1, `Exporting ${command.opts().themeId}`);
          const themeData = await getTheme(command.opts().themeId);
          if (themeData.length === 0) {
            stopProgressBar(`Theme ${command.opts().themeId} not found!`);
            printMessage(`Theme ${command.opts().themeId} not found!`, 'error');
          } else {
            updateProgressBar(`Writing file ${fileName}`);
            saveToFile('theme', themeData, '_id', fileName);
            stopProgressBar(
              `Successfully exported theme ${command.opts().themeId}.`
            );
          }
        }
        // --all -a
        else if (command.opts().all) {
          printMessage('Exporting all themes to a single file...');
          let fileName = getTypedFilename(
            `all${getRealmString()}Themes`,
            'theme'
          );
          if (command.opts().file) {
            fileName = command.opts().file;
          }
          const allThemesData = await getThemes();
          createProgressBar(allThemesData.length, 'Exporting themes');
          for (const themeData of allThemesData) {
            updateProgressBar(`Exporting theme ${themeData.name}`);
          }
          saveToFile('theme', allThemesData, '_id', fileName);
          stopProgressBar(
            `${allThemesData.length} themes exported to ${fileName}.`
          );
        }
        // --all-separate -A
        else if (command.opts().allSeparate) {
          printMessage('Exporting all themes to separate files...');
          const allThemesData = await getThemes();
          createProgressBar(allThemesData.length, 'Exporting themes');
          for (const themeData of allThemesData) {
            updateProgressBar(`Writing theme ${themeData.name}`);
            const fileName = getTypedFilename(themeData.name, 'theme');
            saveToFile('theme', themeData, '_id', fileName);
          }
          stopProgressBar(`${allThemesData.length} themes exported.`);
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
        if (command.opts().file && command.opts().theme) {
          printMessage(
            `Importing theme with name "${
              command.opts().theme
            }" into realm "${storage.session.getRealm()}"...`
          );
          fs.readFile(command.opts().file, 'utf8', (err, data) => {
            if (err) throw err;
            const themeData = JSON.parse(data);
            if (validateImport(themeData.meta)) {
              createProgressBar(1, 'Importing theme...');
              let found = false;
              for (const id in themeData.theme) {
                if ({}.hasOwnProperty.call(themeData.theme, id)) {
                  if (themeData.theme[id].name === command.opts().theme) {
                    found = true;
                    updateProgressBar(`Importing ${themeData.theme[id].name}`);
                    putThemeByName(
                      command.opts().theme,
                      themeData.theme[id]
                    ).then((result) => {
                      if (result == null) {
                        stopProgressBar(
                          `Error importing theme ${themeData.theme[id].name}`
                        );
                        printMessage(
                          `Error importing theme ${themeData.theme[id].name}`,
                          'error'
                        );
                      } else {
                        stopProgressBar(
                          `Successfully imported theme ${command.opts().theme}.`
                        );
                      }
                    });
                    break;
                  }
                }
              }
              if (!found) {
                stopProgressBar(`Theme ${command.opts().theme} not found!`);
              }
            } else {
              printMessage('Import validation failed...', 'error');
            }
          });
        }
        // import by id
        else if (command.opts().file && command.opts().themeId) {
          printMessage(
            `Importing theme with id "${
              command.opts().themeId
            }" into realm "${storage.session.getRealm()}"...`
          );
          fs.readFile(command.opts().file, 'utf8', (err, data) => {
            if (err) throw err;
            const themeData = JSON.parse(data);
            if (validateImport(themeData.meta)) {
              createProgressBar(1, 'Importing theme...');
              let found = false;
              for (const id in themeData.theme) {
                if ({}.hasOwnProperty.call(themeData.theme, id)) {
                  if (id === command.opts().themeId) {
                    found = true;
                    updateProgressBar(`Importing ${themeData.theme[id]._id}`);
                    putTheme(id, themeData.theme[id]).then((result) => {
                      if (result == null) {
                        stopProgressBar(
                          `Error importing theme ${themeData.theme[id]._id}`
                        );
                        printMessage(
                          `Error importing theme ${themeData.theme[id]._id}`,
                          'error'
                        );
                      } else {
                        stopProgressBar(
                          `Successfully imported theme ${
                            command.opts().themeId
                          }.`
                        );
                      }
                    });
                    break;
                  }
                }
              }
              if (!found) {
                stopProgressBar(`Theme ${command.opts().themeId} not found!`);
              }
            } else {
              printMessage('Import validation failed...', 'error');
            }
          });
        }
        // --all -a
        else if (command.opts().all && command.opts().file) {
          printMessage(
            `Importing all themes from a single file (${
              command.opts().file
            })...`
          );
          fs.readFile(command.opts().file, 'utf8', (err, data) => {
            if (err) throw err;
            const fileData = JSON.parse(data);
            if (validateImport(fileData.meta)) {
              createProgressBar(
                Object.keys(fileData.theme).length,
                'Importing themes...'
              );
              for (const id in fileData.theme) {
                if ({}.hasOwnProperty.call(fileData.theme, id)) {
                  updateProgressBar(`Importing ${fileData.theme[id].name}`);
                }
              }
              putThemes(fileData.theme).then((result) => {
                if (result == null) {
                  stopProgressBar(
                    `Error importing ${
                      Object.keys(fileData.theme).length
                    } themes!`
                  );
                  printMessage(
                    `Error importing ${
                      Object.keys(fileData.theme).length
                    } themes from ${command.opts().file}`,
                    'error'
                  );
                } else {
                  stopProgressBar(
                    `Successfully imported ${
                      Object.keys(fileData.theme).length
                    } themes.`
                  );
                }
              });
            } else {
              printMessage('Import validation failed...', 'error');
            }
          });
        }
        // --all-separate -A
        else if (command.opts().allSeparate && !command.opts().file) {
          printMessage(
            'Importing all themes from separate files in current directory...'
          );
          const names = fs.readdirSync('.');
          const jsonFiles = names.filter((name) =>
            name.toLowerCase().endsWith('.theme.json')
          );

          createProgressBar(jsonFiles.length, 'Importing themes...');
          let fileData = null;
          let count = 0;
          let total = 0;
          let files = 0;
          for (const file of jsonFiles) {
            const data = fs.readFileSync(file, 'utf8');
            fileData = JSON.parse(data);
            if (validateImport(fileData.meta)) {
              count = Object.keys(fileData.theme).length;
              // eslint-disable-next-line no-await-in-loop
              const result = await putThemes(fileData.theme);
              if (result == null) {
                printMessage(
                  `Error importing ${count} themes from ${file}`,
                  'error'
                );
              } else {
                files += 1;
                total += count;
                updateProgressBar(`Imported ${count} theme(s) from ${file}`);
              }
            } else {
              printMessage(`Validation of ${file} failed!`, 'error');
            }
          }
          stopProgressBar(
            `Finished importing ${total} theme(s) from ${files} file(s).`
          );
        }
        // import single theme from file
        else if (command.opts().file) {
          printMessage(
            `Importing first theme from file "${
              command.opts().file
            }" into realm "${storage.session.getRealm()}"...`
          );
          fs.readFile(command.opts().file, 'utf8', (err, data) => {
            if (err) throw err;
            const themeData = JSON.parse(data);
            if (validateImport(themeData.meta)) {
              createProgressBar(1, 'Importing theme...');
              for (const id in themeData.theme) {
                if ({}.hasOwnProperty.call(themeData.theme, id)) {
                  updateProgressBar(`Importing ${themeData.theme[id].name}`);
                  putTheme(id, themeData.theme[id]).then((result) => {
                    if (result == null) {
                      stopProgressBar(
                        `Error importing theme ${themeData.theme[id].name}`
                      );
                      printMessage(
                        `Error importing theme ${themeData.theme[id].name}`,
                        'error'
                      );
                    } else {
                      stopProgressBar(
                        `Successfully imported theme ${themeData.theme[id].name}`
                      );
                    }
                  });
                  break;
                }
              }
            } else {
              printMessage('Import validation failed...', 'error');
            }
          });
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
