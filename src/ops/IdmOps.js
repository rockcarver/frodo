import fs from 'fs';
import fse from 'fs-extra';
import replaceall from 'replaceall';
import propertiesReader from 'properties-reader';
import {
  getAllConfigEntities,
  getConfigEntity,
  queryAllManagedObjectsByType,
} from '../api/IdmConfigApi.js';
import { printMessage, showSpinner, succeedSpinner } from './utils/Console.js';
import { getTypedFilename } from './utils/ExportImportUtils.js';

/**
 * List all IDM configuration objects
 */
export async function listAllConfigEntities() {
  let configEntities = [];
  try {
    configEntities = (await getAllConfigEntities()).data;
  } catch (getAllConfigEntitiesError) {
    printMessage(getAllConfigEntitiesError, 'error');
    printMessage(
      `Error getting config entities: ${getAllConfigEntitiesError}`,
      'error'
    );
  }
  if ('configurations' in configEntities) {
    configEntities.configurations.forEach((configEntity) => {
      printMessage(`${configEntity._id}`, 'data');
    });
  }
}

/**
 * Export an IDM configuration object.
 * @param {String} id the desired configuration object
 * @param {String} file optional export file
 */
export async function exportConfigEntity(id, file) {
  let fileName = file;
  if (!fileName) {
    fileName = getTypedFilename(`${id}`, 'idm');
  }
  const configEntity = (await getConfigEntity(id)).data;
  fs.writeFile(fileName, JSON.stringify(configEntity, null, 2), (err) => {
    if (err) {
      return printMessage(`ERROR - can't save ${id} export to file`, 'error');
    }
    return '';
  });
}

/**
 * Export all IDM configuration objects into separate JSON files in a directory specified by <directory>
 * @param {String} directory export directory
 */
export async function exportAllRawConfigEntities(directory) {
  let configEntities = [];
  try {
    configEntities = (await getAllConfigEntities()).data;
  } catch (getAllConfigEntitiesError) {
    printMessage(getAllConfigEntitiesError, 'error');
    printMessage(
      `Error getting config entities: ${getAllConfigEntitiesError}`,
      'error'
    );
  }
  if ('configurations' in configEntities) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }
    showSpinner('Exporting config objects...');
    const entityPromises = [];
    configEntities.configurations.forEach((x) => {
      entityPromises.push(
        getConfigEntity(x._id)
          .then((response) => response.data)
          .catch((getConfigEntityError) => {
            if (
              !(
                getConfigEntityError.response.status === 403 &&
                getConfigEntityError.response.data.message ===
                  'This operation is not available in ForgeRock Identity Cloud.'
              )
            ) {
              printMessage(getConfigEntityError, 'error');
              printMessage(
                `Error getting config entity: ${getConfigEntityError}`,
                'error'
              );
            }
          })
      );
    });
    Promise.all(entityPromises).then((result) => {
      // console.log(result);
      result.forEach((item) => {
        if (item != null) {
          fse.outputFile(
            `${directory}/${item._id}.json`,
            JSON.stringify(item, null, 2),
            // eslint-disable-next-line consistent-return
            (err) => {
              if (err) {
                return printMessage(
                  `ERROR - can't save config ${item._id} to file - ${err}`,
                  'error'
                );
              }
            }
          );
        }
      });
      succeedSpinner();
    });
  }
}

/**
 * Export all IDM configuration objects
 * @param {String} directory export directory
 * @param {String} entitiesFile JSON file that specifies the config entities to export/import
 * @param {String} envFile File that defines environment specific variables for replacement during configuration export/import
 */
export async function exportAllConfigEntities(
  directory,
  entitiesFile,
  envFile
) {
  let entriesToExport = [];
  // read list of entities to export
  fs.readFile(entitiesFile, 'utf8', async (err, data) => {
    if (err) throw err;
    const entriesData = JSON.parse(data);
    entriesToExport = entriesData.idm;
    // console.log(`entriesToExport ${entriesToExport}`);

    // read list of configs to parameterize for environment specific values
    const envParams = propertiesReader(envFile);

    let configEntities = [];
    try {
      configEntities = (await getAllConfigEntities()).data;
    } catch (getAllConfigEntitiesError) {
      printMessage(getAllConfigEntitiesError, 'error');
      printMessage(
        `Error getting config entities: ${getAllConfigEntitiesError}`,
        'error'
      );
    }
    if ('configurations' in configEntities) {
      // create export directory if not exist
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
      }
      showSpinner('Exporting config objects...');
      const entityPromises = [];
      configEntities.configurations.forEach((x) => {
        if (entriesToExport.includes(x._id)) {
          // console.log(`- ${x._id}`);
          entityPromises.push(
            getConfigEntity(x._id).then((response) => response.data)
          );
        }
      });
      Promise.all(entityPromises).then((result) => {
        // console.log(result);
        result.forEach((item) => {
          if (item != null) {
            let configEntityString = JSON.stringify(item, null, 2);
            envParams.each((key, value) => {
              configEntityString = replaceall(
                value,
                `\${${key}}`,
                configEntityString
              );
            });
            fse.outputFile(
              `${directory}/${item._id}.json`,
              JSON.stringify(item, null, 2),
              // eslint-disable-next-line consistent-return
              (error) => {
                if (err) {
                  return printMessage(
                    `ERROR - can't save config ${item._id} to file - ${error}`,
                    'error'
                  );
                }
              }
            );
          }
        });
        succeedSpinner();
      });
    }
  });
}

/**
 * Count number of managed objects of a given type
 * @param {String} type managed object type, e.g. alpha_user
 */
export async function countManagedObjects(type) {
  let count = 0;
  let result = {
    result: [],
    resultCount: 0,
    pagedResultsCookie: null,
    totalPagedResultsPolicy: 'NONE',
    totalPagedResults: -1,
    remainingPagedResults: -1,
  };
  try {
    do {
      // eslint-disable-next-line no-await-in-loop
      result = (
        await queryAllManagedObjectsByType(type, [], result.pagedResultsCookie)
      ).data;
      count += result.resultCount;
      // printMessage(result);
    } while (result.pagedResultsCookie);
    printMessage(`${type}: ${count}`);
  } catch (error) {
    printMessage(error.response.data, 'error');
    printMessage(`Error querying managed objects by type: ${error}`, 'error');
  }
}
