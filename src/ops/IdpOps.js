import fs from 'fs';
import {
  getSocialIdentityProviders,
  putProviderByTypeAndId,
} from '../api/SocialIdentityProvidersApi.js';
import { getScript } from '../api/ScriptApi.js';
import { createOrUpdateScript } from './ScriptOps.js';
import {
  convertBase64TextToArray,
  convertTextArrayToBase64,
  getRealmString,
  getTypedFilename,
  saveJsonToFile,
  validateImport,
} from './utils/ExportImportUtils.js';
import {
  printMessage,
  createProgressBar,
  updateProgressBar,
  stopProgressBar,
} from './utils/Console.js';

// use a function vs a template variable to avoid problems in loops
function getFileDataTemplate() {
  return {
    meta: {},
    script: {},
    idp: {},
  };
}

/**
 * List providers
 */
export async function listProviders() {
  getSocialIdentityProviders()
    .then((response) => {
      response.data.result.sort((a, b) => a._id.localeCompare(b._id));
      response.data.result.forEach((socialIdentityProvider) => {
        printMessage(`${socialIdentityProvider._id}`, 'data');
      });
    })
    .catch((err) => {
      printMessage(`listProviders ERROR: ${err.message}`, 'error');
      printMessage(err, 'error');
    });
}

/**
 * Get social identity provider by id
 * @param {string} id social identity provider id/name
 * @returns {Promise} a promise that resolves a social identity provider object
 */
export async function getSocialIdentityProviderById(id) {
  return getSocialIdentityProviders().then((response) => {
    const foundProviders = response.data.result.filter(
      (provider) => provider._id === id
    );
    switch (foundProviders.length) {
      case 1:
        return foundProviders[0];
      case 0:
        throw new Error(`Provider '${id}' not found`);
      default:
        throw new Error(`${foundProviders.length} providers '${id}' found`);
    }
  });
}

/**
 * Export provider by id
 * @param {string} id provider id/name
 * @param {string} file optional export file name
 */
export async function exportProvider(id, file = null) {
  let fileName = file;
  if (!fileName) {
    fileName = getTypedFilename(id, 'idp');
  }
  createProgressBar(1, `Exporting ${id}`);
  try {
    const idpData = await getSocialIdentityProviderById(id);
    updateProgressBar(`Writing file ${fileName}`);
    const fileData = getFileDataTemplate();
    fileData.idp[idpData._id] = idpData;
    if (idpData.transform) {
      const scriptData = (await getScript(idpData.transform)).data;
      scriptData.script = convertBase64TextToArray(scriptData.script);
      fileData.script[idpData.transform] = scriptData;
    }
    saveJsonToFile(fileData, fileName);
    stopProgressBar(`Exported ${id.brightCyan} to ${fileName.brightCyan}.`);
  } catch (err) {
    stopProgressBar(`${err}`);
    printMessage(`${err}`, 'error');
  }
}

/**
 * Export all providers
 * @param {string} file optional export file name
 */
export async function exportProvidersToFile(file) {
  let fileName = file;
  if (!fileName) {
    fileName = getTypedFilename(`all${getRealmString()}Providers`, 'idp');
  }
  const fileData = getFileDataTemplate();
  const allIdpsData = (await getSocialIdentityProviders()).data.result;
  createProgressBar(allIdpsData.length, 'Exporting providers');
  for (const idpData of allIdpsData) {
    updateProgressBar(`Exporting provider ${idpData._id}`);
    fileData.idp[idpData._id] = idpData;
    if (idpData.transform) {
      // eslint-disable-next-line no-await-in-loop
      const scriptData = (await getScript(idpData.transform)).data;
      scriptData.script = convertBase64TextToArray(scriptData.script);
      fileData.script[idpData.transform] = scriptData;
    }
  }
  saveJsonToFile(fileData, fileName);
  stopProgressBar(`${allIdpsData.length} providers exported to ${fileName}.`);
}

/**
 * Export all providers to individual files
 */
export async function exportProvidersToFiles() {
  const allIdpsData = await (await getSocialIdentityProviders()).data.result;
  // printMessage(allIdpsData, 'data');
  createProgressBar(allIdpsData.length, 'Exporting providers');
  for (const idpData of allIdpsData) {
    updateProgressBar(`Writing provider ${idpData._id}`);
    const fileName = getTypedFilename(idpData._id, 'idp');
    const fileData = getFileDataTemplate();
    fileData.idp[idpData._id] = idpData;
    if (idpData.transform) {
      // eslint-disable-next-line no-await-in-loop
      const scriptData = (await getScript(idpData.transform)).data;
      scriptData.script = convertBase64TextToArray(scriptData.script);
      fileData.script[idpData.transform] = scriptData;
    }
    saveJsonToFile(fileData, fileName);
  }
  stopProgressBar(`${allIdpsData.length} providers exported.`);
}

/**
 * Import provider by id/name
 * @param {string} id provider id/name
 * @param {string} file import file name
 */
export async function importProviderById(id, file) {
  fs.readFile(file, 'utf8', async (err, data) => {
    if (err) throw err;
    const fileData = JSON.parse(data);
    if (validateImport(fileData.meta)) {
      createProgressBar(1, 'Importing provider...');
      let found = false;
      for (const idpId in fileData.idp) {
        if ({}.hasOwnProperty.call(fileData.idp, idpId)) {
          if (idpId === id) {
            found = true;
            updateProgressBar(`Importing ${fileData.idp[idpId]._id}`);
            const scriptId = fileData.idp[idpId].transform;
            const scriptData = fileData.script[scriptId];
            if (scriptId && scriptData) {
              scriptData.script = convertTextArrayToBase64(scriptData.script);
              // eslint-disable-next-line no-await-in-loop
              await createOrUpdateScript(
                fileData.idp[idpId].transform,
                fileData.script[fileData.idp[idpId].transform]
              );
            }
            putProviderByTypeAndId(
              fileData.idp[idpId]._type._id,
              idpId,
              fileData.idp[idpId]
            )
              .then(() => {
                stopProgressBar(`Successfully imported provider ${id}.`);
              })
              .catch((importProviderErr) => {
                stopProgressBar(
                  `Error importing provider ${fileData.idp[idpId]._id}`
                );
                printMessage(`\nError importing provider ${id}`, 'error');
                printMessage(importProviderErr.response.data, 'error');
              });
            break;
          }
        }
      }
      if (!found) {
        stopProgressBar(
          `Provider ${id.brightCyan} not found in ${file.brightCyan}!`
        );
      }
    } else {
      printMessage('Import validation failed...', 'error');
    }
  });
}

/**
 * Import first provider from file
 * @param {string} file import file name
 */
export async function importFirstProvider(file) {
  fs.readFile(file, 'utf8', async (err, data) => {
    if (err) throw err;
    const fileData = JSON.parse(data);
    if (validateImport(fileData.meta)) {
      createProgressBar(1, 'Importing provider...');
      for (const idpId in fileData.idp) {
        if ({}.hasOwnProperty.call(fileData.idp, idpId)) {
          updateProgressBar(`Importing ${fileData.idp[idpId]._id}`);
          const scriptId = fileData.idp[idpId].transform;
          const scriptData = fileData.script[scriptId];
          if (scriptId && scriptData) {
            scriptData.script = convertTextArrayToBase64(scriptData.script);
            // eslint-disable-next-line no-await-in-loop
            await createOrUpdateScript(
              fileData.idp[idpId].transform,
              fileData.script[fileData.idp[idpId].transform]
            );
          }
          putProviderByTypeAndId(
            fileData.idp[idpId]._type._id,
            idpId,
            fileData.idp[idpId]
          ).then((result) => {
            if (result == null) {
              stopProgressBar(
                `Error importing provider ${fileData.idp[idpId]._id}`
              );
              printMessage(
                `Error importing provider ${fileData.idp[idpId]._id}`,
                'error'
              );
            } else {
              stopProgressBar(
                `Successfully imported provider ${fileData.idp[idpId]._id}.`
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
 * Import all providers from file
 * @param {string} file import file name
 */
export async function importProvidersFromFile(file) {
  fs.readFile(file, 'utf8', async (err, data) => {
    if (err) throw err;
    const fileData = JSON.parse(data);
    if (validateImport(fileData.meta)) {
      createProgressBar(
        Object.keys(fileData.idp).length,
        'Importing providers...'
      );
      for (const idpId in fileData.idp) {
        if ({}.hasOwnProperty.call(fileData.idp, idpId)) {
          const scriptId = fileData.idp[idpId].transform;
          const scriptData = fileData.script[scriptId];
          if (scriptId && scriptData) {
            scriptData.script = convertTextArrayToBase64(scriptData.script);
            // eslint-disable-next-line no-await-in-loop
            await createOrUpdateScript(
              fileData.idp[idpId].transform,
              fileData.script[fileData.idp[idpId].transform]
            );
          }
          // eslint-disable-next-line no-await-in-loop
          const result = await putProviderByTypeAndId(
            fileData.idp[idpId]._type._id,
            idpId,
            fileData.idp[idpId]
          );
          if (!result) {
            updateProgressBar(
              `Successfully imported ${fileData.idp[idpId].name}`
            );
          }
        }
      }
      stopProgressBar(`Providers imported.`);
    } else {
      printMessage('Import validation failed...', 'error');
    }
  });
}

/**
 * Import providers from *.idp.json files in current working directory
 */
export async function importProvidersFromFiles() {
  const names = fs.readdirSync('.');
  const jsonFiles = names.filter((name) =>
    name.toLowerCase().endsWith('.idp.json')
  );

  createProgressBar(jsonFiles.length, 'Importing providers...');
  let total = 0;
  for (const file of jsonFiles) {
    const data = fs.readFileSync(file, 'utf8');
    const fileData = JSON.parse(data);
    if (validateImport(fileData.meta)) {
      const count = Object.keys(fileData.idp).length;
      total += count;
      for (const idpId in fileData.idp) {
        if ({}.hasOwnProperty.call(fileData.idp, idpId)) {
          // eslint-disable-next-line no-await-in-loop
          const result = await putProviderByTypeAndId(
            fileData.idp[idpId]._type._id,
            idpId,
            fileData.idp[idpId]
          );
          if (result == null) {
            printMessage(
              `Error importing ${count} providers from ${file}`,
              'error'
            );
          }
        }
      }
      updateProgressBar(`Imported ${count} provider(s) from ${file}`);
    } else {
      printMessage(`Validation of ${file} failed!`, 'error');
    }
  }
  stopProgressBar(
    `Finished importing ${total} provider(s) from ${jsonFiles.length} file(s).`
  );
}
