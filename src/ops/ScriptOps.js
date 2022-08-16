import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { applyNameCollisionPolicy } from './utils/OpsUtils.js';
import {
  createProgressBar,
  createTable,
  printMessage,
  stopProgressBar,
  updateProgressBar,
} from './utils/Console.js';
import { getScriptByName, getScripts, putScript } from '../api/ScriptApi.js';
import wordwrap from './utils/Wordwrap.js';
import {
  convertBase64TextToArray,
  convertTextArrayToBase64,
  getTypedFilename,
  saveToFile,
  titleCase,
  validateImport,
} from './utils/ExportImportUtils.js';
import storage from '../storage/SessionStorage.js';

/**
 * List scripts
 */
export async function listScripts(long = false) {
  try {
    const scripts = (await getScripts()).data.result;
    scripts.sort((a, b) => a.name.localeCompare(b.name));
    if (long) {
      const table = createTable([
        'Name',
        'UUID',
        'Language',
        'Context',
        'Description',
      ]);
      const langMap = { JAVASCRIPT: 'JS', GROOVY: 'Groovy' };
      scripts.forEach((script) => {
        table.push([
          wordwrap(script.name, 25, '  '),
          script._id,
          langMap[script.language],
          wordwrap(titleCase(script.context.split('_').join(' ')), 25),
          wordwrap(script.description, 30),
        ]);
      });
      printMessage(table.toString(), 'data');
    } else {
      scripts.forEach((script) => {
        printMessage(`${script.name}`, 'data');
      });
    }
  } catch (error) {
    printMessage(`Error listing scripts - ${error}`, 'error');
  }
}

/**
 * Export script to file
 * @param {string} name script name
 * @param {string} file file name
 */
export async function exportScriptByName(name, file) {
  let fileName = getTypedFilename(name, 'script');
  if (file) {
    fileName = file;
  }
  const scriptData = (await getScriptByName(name)).data.result;
  if (scriptData.length > 1) {
    printMessage(`Multiple scripts with name ${name} found...`, 'error');
  }
  scriptData.forEach((element) => {
    const scriptTextArray = convertBase64TextToArray(element.script);
    // eslint-disable-next-line no-param-reassign
    element.script = scriptTextArray;
  });
  saveToFile('script', scriptData, '_id', fileName);
}

/**
 * Export all scripts to single file
 * @param {string} file file name
 */
export async function exportScriptsToFile(file) {
  let fileName = getTypedFilename(
    `all${storage.session.getRealm()}Scripts`,
    'script'
  );
  if (file) {
    fileName = file;
  }
  const scriptList = (await getScripts()).data.result;
  const allScriptsData = [];
  createProgressBar(scriptList.length, 'Exporting script');
  for (const item of scriptList) {
    updateProgressBar(`Reading script ${item.name}`);
    // eslint-disable-next-line no-await-in-loop
    const scriptData = (await getScriptByName(item.name)).data.result;
    scriptData.forEach((element) => {
      const scriptTextArray = convertBase64TextToArray(element.script);
      // eslint-disable-next-line no-param-reassign
      element.script = scriptTextArray;
      allScriptsData.push(element);
    });
  }
  stopProgressBar('Done');
  saveToFile('script', allScriptsData, '_id', fileName);
}

/**
 * Export all scripts to individual files
 */
export async function exportScriptsToFiles() {
  const scriptList = (await getScripts()).data.result;
  createProgressBar(scriptList.length, 'Exporting script');
  for (const item of scriptList) {
    updateProgressBar(`Reading script ${item.name}`);
    // eslint-disable-next-line no-await-in-loop
    const scriptData = (await getScriptByName(item.name)).data.result;
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

/**
 * Import script
 * @param {string} id script uuid
 * @param {Object} data script object
 * @returns {Promise<Object>} a status object
 */
export async function createOrUpdateScript(id, data) {
  try {
    await putScript(id, data);
    return { error: false, name: data.name };
  } catch (e) {
    if (e.response.status === 409) {
      printMessage(
        `createOrUpdateScript WARNING: script with name ${data.name} already exists, using renaming policy... <name> => <name - imported (n)>`,
        'warn'
      );
      const newName = applyNameCollisionPolicy(data.name);
      // console.log(newName);
      printMessage(`Trying to save script as ${newName}`, 'warn');
      // eslint-disable-next-line no-param-reassign
      data.name = newName;
      await createOrUpdateScript(id, data);
      return { error: false, name: data.name };
    }
    printMessage(
      `createOrUpdateScript ERROR: put script error, script ${id} - ${e.message}`,
      'error'
    );
    return { error: true, name: data.name };
  }
}

export async function importScriptsFromFile(name, file, reUuid = false) {
  fs.readFile(file, 'utf8', (err, data) => {
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
          if (reUuid) {
            newId = uuidv4();
            // printMessage(
            //   `Re-uuid-ing script ${scriptData.script[existingId].name} ${existingId} => ${newId}...`
            // );
            scriptData.script[existingId]._id = newId;
          }
          if (name) {
            // printMessage(
            //   `Renaming script ${scriptData.script[existingId].name} => ${options.script}...`
            // );
            scriptData.script[existingId].name = name;
          }
          updateProgressBar(`Importing ${scriptData.script[existingId].name}`);
          // console.log(scriptData.script[id]);
          createOrUpdateScript(newId, scriptData.script[existingId]).then(
            (result) => {
              if (result == null)
                printMessage(
                  `Error importing ${scriptData.script[existingId].name}`,
                  'error'
                );
            }
          );
          if (name) break;
        }
      }
      stopProgressBar('Done');
      // printMessage('Done');
    } else {
      printMessage('Import validation failed...', 'error');
    }
  });
}
