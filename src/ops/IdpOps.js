import fs from 'fs';
import {
  getProviders,
  getProviderById,
  putProviderByTypeAndId,
} from '../api/SocialIdentityProvidersApi.js';
import { getScript, putScript } from '../api/ScriptApi.js';
import {
  convertBase64TextToArray,
  convertTextArrayToBase64,
  getRealmString,
  getTypedFilename,
  saveJsonToFile,
  validateImport,
} from '../api/utils/ExportImportUtils.js';
import {
  printMessage,
  createProgressBar,
  updateProgressBar,
  stopProgressBar,
} from '../api/utils/Console.js';

// use a function vs a template variable to avoid problems in loops
function getFileDataTemplate() {
  return {
    meta: {},
    script: {},
    idp: {},
  };
}

export async function listProviders() {
  const providerList = await getProviders();
  providerList.sort((a, b) => a._id.localeCompare(b._id));
  providerList.forEach((item) => {
    printMessage(`${item._id}`, 'data');
  });
}

export async function exportProvider(id, file = null) {
  let fileName = file;
  if (!fileName) {
    fileName = getTypedFilename(id, 'idp');
  }
  createProgressBar(1, `Exporting ${id}`);
  const idpData = await getProviderById(id);
  if (idpData.length === 0) {
    stopProgressBar(`Provider ${id} not found!`);
    printMessage(`Provider ${id} not found!`, 'error');
  } else {
    updateProgressBar(`Writing file ${fileName}`);
    const fileData = getFileDataTemplate();
    fileData.idp[idpData._id] = idpData;
    if (idpData.transform) {
      const scriptData = await getScript(idpData.transform);
      scriptData.script = convertBase64TextToArray(scriptData.script);
      fileData.script[idpData.transform] = scriptData;
    }
    saveJsonToFile(fileData, fileName);
    stopProgressBar(`Exported ${id.brightCyan} to ${fileName.brightCyan}.`);
  }
}

export async function exportProvidersToFile(file) {
  let fileName = file;
  if (!fileName) {
    fileName = getTypedFilename(`all${getRealmString()}Providers`, 'idp');
  }
  const fileData = getFileDataTemplate();
  const allIdpsData = await getProviders();
  createProgressBar(allIdpsData.length, 'Exporting providers');
  for (const idpData of allIdpsData) {
    updateProgressBar(`Exporting provider ${idpData._id}`);
    fileData.idp[idpData._id] = idpData;
    if (idpData.transform) {
      // eslint-disable-next-line no-await-in-loop
      const scriptData = await getScript(idpData.transform);
      scriptData.script = convertBase64TextToArray(scriptData.script);
      fileData.script[idpData.transform] = scriptData;
    }
  }
  saveJsonToFile(fileData, fileName);
  // saveToFile('idp', allProvidersData, '_id', fileName);
  stopProgressBar(`${allIdpsData.length} providers exported to ${fileName}.`);
}

export async function exportProvidersToFiles() {
  const allIdpsData = await getProviders();
  // printMessage(allIdpsData, 'data');
  createProgressBar(allIdpsData.length, 'Exporting providers');
  for (const idpData of allIdpsData) {
    updateProgressBar(`Writing provider ${idpData._id}`);
    const fileName = getTypedFilename(idpData._id, 'idp');
    const fileData = getFileDataTemplate();
    fileData.idp[idpData._id] = idpData;
    if (idpData.transform) {
      // eslint-disable-next-line no-await-in-loop
      const scriptData = await getScript(idpData.transform);
      scriptData.script = convertBase64TextToArray(scriptData.script);
      fileData.script[idpData.transform] = scriptData;
    }
    saveJsonToFile(fileData, fileName);
  }
  stopProgressBar(`${allIdpsData.length} providers exported.`);
}

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
              await putScript(
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
                stopProgressBar(`Successfully imported provider ${id}.`);
              }
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
            await putScript(
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
            await putScript(
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
