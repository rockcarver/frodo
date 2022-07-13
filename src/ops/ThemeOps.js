import fs from 'fs';
import {
  deleteTheme,
  deleteThemeByName,
  deleteThemes,
  getTheme,
  getThemeByName,
  getThemes,
  putTheme,
  putThemeByName,
  putThemes,
} from '../api/ThemeApi.js';
import {
  createProgressBar,
  createTable,
  failSpinner,
  printMessage,
  showSpinner,
  stopProgressBar,
  succeedSpinner,
  updateProgressBar,
} from './utils/Console.js';
import {
  getRealmString,
  getTypedFilename,
  saveToFile,
  validateImport,
} from './utils/ExportImportUtils.js';

/**
 * List all the themes
 * @param {boolean} long Long version, more fields
 */
export async function listThemes(long = false) {
  const themeList = await getThemes();
  themeList.sort((a, b) => a.name.localeCompare(b.name));
  if (!long) {
    themeList.forEach((theme) => {
      printMessage(
        `${theme.isDefault ? theme.name.brightCyan : theme.name}`,
        'data'
      );
    });
  } else {
    const table = createTable([
      'Name'.brightCyan,
      'Id'.brightCyan,
      'Default'.brightCyan,
    ]);
    themeList.forEach((theme) => {
      table.push([
        `${theme.name}`,
        `${theme._id}`,
        `${theme.isDefault ? 'Yes'.brightGreen : ''}`,
      ]);
    });
    printMessage(table.toString(), 'data');
  }
}

/**
 * Export theme by name to file
 * @param {string} name theme name
 * @param {string} file optional export file name
 */
export async function exportThemeByName(name, file) {
  let fileName = getTypedFilename(name, 'theme');
  if (file) {
    fileName = file;
  }
  createProgressBar(1, `Exporting ${name}`);
  const themeData = await getThemeByName(name);
  if (themeData.length === 0) {
    stopProgressBar(`Theme ${name} not found!`);
    printMessage(`Theme ${name} not found!`, 'error');
  } else {
    updateProgressBar(`Writing file ${fileName}`);
    saveToFile('theme', themeData, '_id', fileName);
    stopProgressBar(`Successfully exported theme ${name}.`);
  }
}

/**
 * Export theme by uuid to file
 * @param {string} id theme uuid
 * @param {string} file optional export file name
 */
export async function exportThemeById(id, file) {
  let fileName = getTypedFilename(id, 'theme');
  if (file) {
    fileName = file;
  }
  createProgressBar(1, `Exporting ${id}`);
  const themeData = await getTheme(id);
  if (themeData.length === 0) {
    stopProgressBar(`Theme ${id} not found!`);
    printMessage(`Theme ${id} not found!`, 'error');
  } else {
    updateProgressBar(`Writing file ${fileName}`);
    saveToFile('theme', themeData, '_id', fileName);
    stopProgressBar(`Successfully exported theme ${id}.`);
  }
}

/**
 * Export all themes to file
 * @param {string} file optional export file name
 */
export async function exportThemesToFile(file) {
  let fileName = getTypedFilename(`all${getRealmString()}Themes`, 'theme');
  if (file) {
    fileName = file;
  }
  const allThemesData = await getThemes();
  createProgressBar(allThemesData.length, 'Exporting themes');
  for (const themeData of allThemesData) {
    updateProgressBar(`Exporting theme ${themeData.name}`);
  }
  saveToFile('theme', allThemesData, '_id', fileName);
  stopProgressBar(`${allThemesData.length} themes exported to ${fileName}.`);
}

/**
 * Export all themes to separate files
 */
export async function exportThemesToFiles() {
  const allThemesData = await getThemes();
  createProgressBar(allThemesData.length, 'Exporting themes');
  for (const themeData of allThemesData) {
    updateProgressBar(`Writing theme ${themeData.name}`);
    const fileName = getTypedFilename(themeData.name, 'theme');
    saveToFile('theme', themeData, '_id', fileName);
  }
  stopProgressBar(`${allThemesData.length} themes exported.`);
}

/**
 * Import theme by name from file
 * @param {string} name theme name
 * @param {string} file import file name
 */
export async function importThemeByName(name, file) {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) throw err;
    const themeData = JSON.parse(data);
    if (validateImport(themeData.meta)) {
      createProgressBar(1, 'Importing theme...');
      let found = false;
      for (const id in themeData.theme) {
        if ({}.hasOwnProperty.call(themeData.theme, id)) {
          if (themeData.theme[id].name === name) {
            found = true;
            updateProgressBar(`Importing ${themeData.theme[id].name}`);
            putThemeByName(name, themeData.theme[id]).then((result) => {
              if (result == null) {
                stopProgressBar(
                  `Error importing theme ${themeData.theme[id].name}`
                );
                printMessage(
                  `Error importing theme ${themeData.theme[id].name}`,
                  'error'
                );
              } else {
                stopProgressBar(`Successfully imported theme ${name}.`);
              }
            });
            break;
          }
        }
      }
      if (!found) {
        stopProgressBar(`Theme ${name} not found!`);
      }
    } else {
      printMessage('Import validation failed...', 'error');
    }
  });
}

/**
 * Import theme by uuid from file
 * @param {string} id theme uuid
 * @param {string} file import file name
 */
export async function importThemeById(id, file) {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) throw err;
    const themeData = JSON.parse(data);
    if (validateImport(themeData.meta)) {
      createProgressBar(1, 'Importing theme...');
      let found = false;
      for (const themeId in themeData.theme) {
        if ({}.hasOwnProperty.call(themeData.theme, themeId)) {
          if (themeId === id) {
            found = true;
            updateProgressBar(`Importing ${themeData.theme[themeId]._id}`);
            putTheme(themeId, themeData.theme[themeId]).then((result) => {
              if (result == null) {
                stopProgressBar(
                  `Error importing theme ${themeData.theme[themeId]._id}`
                );
                printMessage(
                  `Error importing theme ${themeData.theme[themeId]._id}`,
                  'error'
                );
              } else {
                stopProgressBar(`Successfully imported theme ${id}.`);
              }
            });
            break;
          }
        }
      }
      if (!found) {
        stopProgressBar(`Theme ${id} not found!`);
      }
    } else {
      printMessage('Import validation failed...', 'error');
    }
  });
}

/**
 * Import all themes from single file
 * @param {string} file import file name
 */
export async function importThemesFromFile(file) {
  fs.readFile(file, 'utf8', (err, data) => {
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
            `Error importing ${Object.keys(fileData.theme).length} themes!`
          );
          printMessage(
            `Error importing ${
              Object.keys(fileData.theme).length
            } themes from ${file}`,
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

/**
 * Import themes from separate files
 */
export async function importThemesFromFiles() {
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
        printMessage(`Error importing ${count} themes from ${file}`, 'error');
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

/**
 * Import first theme from file
 * @param {string} file import file name
 */
export async function importFirstThemeFromFile(file) {
  fs.readFile(file, 'utf8', (err, data) => {
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

/**
 * Delete theme by id
 * @param {string} id theme id
 */
export async function deleteThemeCmd(id) {
  showSpinner(`Deleting ${id}...`);
  try {
    await deleteTheme(id);
    succeedSpinner(`Deleted ${id}.`);
  } catch (error) {
    failSpinner(`Error: ${error.message}`);
  }
}

/**
 * Delete theme by name
 * @param {string} name theme name
 */
export async function deleteThemeByNameCmd(name) {
  showSpinner(`Deleting ${name}...`);
  try {
    await deleteThemeByName(name);
    succeedSpinner(`Deleted ${name}.`);
  } catch (error) {
    failSpinner(`Error: ${error.message}`);
  }
}

/**
 * Delete all themes
 */
export async function deleteThemesCmd() {
  showSpinner(`Deleting all realm themes...`);
  try {
    await deleteThemes();
    succeedSpinner(`Deleted all realm themes.`);
  } catch (error) {
    failSpinner(`Error: ${error.message}`);
  }
}
