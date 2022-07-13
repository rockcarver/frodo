import {
  createKeyValueTable,
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
  deleteVariable,
  getVariable,
  getVariables,
  putVariable,
  setVariableDescription,
} from '../api/VariablesApi.js';
import wordwrap from './utils/Wordwrap.js';
import { resolveUserName } from './ManagedObjectOps.js';
import { decode } from '../api/utils/Base64.js';

/**
 * List variables
 * @param {boolean} long Long version, all the fields
 */
export async function listVariables(long) {
  let variables = [];
  try {
    variables = (await getVariables()).data.result;
  } catch (error) {
    printMessage(`${error.message}`, 'error');
    printMessage(error.response.data, 'error');
  }
  if (long) {
    const table = createTable([
      'Id'.brightCyan,
      'Value'.brightCyan,
      'Status'.brightCyan,
      'Description'.brightCyan,
      'Modifier'.brightCyan,
      'Modified'.brightCyan,
    ]);
    variables.sort((a, b) => a._id.localeCompare(b._id));
    for (const variable of variables) {
      table.push([
        variable._id,
        wordwrap(decode(variable.valueBase64), 40),
        variable.loaded ? 'loaded'.brightGreen : 'unloaded'.brightRed,
        wordwrap(variable.description, 40),
        // eslint-disable-next-line no-await-in-loop
        await resolveUserName('teammember', variable.lastChangedBy),
        new Date(variable.lastChangeDate).toLocaleString(),
      ]);
    }
    printMessage(table.toString());
  } else {
    variables.forEach((secret) => {
      printMessage(secret._id);
    });
  }
}

/**
 * Create variable
 * @param {string} variableId variable id
 * @param {string} value variable value
 * @param {string} description variable description
 */
export async function createVariable(variableId, value, description) {
  showSpinner(`Creating variable ${variableId}...`);
  try {
    await putVariable(variableId, value, description);
    succeedSpinner(`Created variable ${variableId}`);
  } catch (error) {
    failSpinner(
      `Error: ${error.response.data.code} - ${error.response.data.message}`
    );
  }
}

/**
 * Update variable
 * @param {string} variableId variable id
 * @param {string} value variable value
 * @param {string} description variable description
 */
export async function updateVariable(variableId, value, description) {
  showSpinner(`Updating variable ${variableId}...`);
  try {
    await putVariable(variableId, value, description);
    succeedSpinner(`Updated variable ${variableId}`);
  } catch (error) {
    failSpinner(
      `Error: ${error.response.data.code} - ${error.response.data.message}`
    );
  }
}

/**
 * Set description of variable
 * @param {string} variableId variable id
 * @param {string} description variable description
 */
export async function setDescriptionOfVariable(variableId, description) {
  showSpinner(`Setting description of variable ${variableId}...`);
  try {
    await setVariableDescription(variableId, description);
    succeedSpinner(`Set description of variable ${variableId}`);
  } catch (error) {
    failSpinner(
      `Error: ${error.response.data.code} - ${error.response.data.message}`
    );
  }
}

/**
 * Delete a variable
 * @param {string} variableId variable id
 */
export async function deleteVariableCmd(variableId) {
  showSpinner(`Deleting variable ${variableId}...`);
  try {
    await deleteVariable(variableId);
    succeedSpinner(`Deleted variable ${variableId}`);
  } catch (error) {
    failSpinner(
      `Error: ${error.response.data.code} - ${error.response.data.message}`
    );
  }
}

/**
 * Delete all variables
 */
export async function deleteVariablesCmd() {
  try {
    const variables = (await getVariables()).data.result;
    createProgressBar(variables.length, `Deleting variable...`);
    for (const variable of variables) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await deleteVariable(variable._id);
        updateProgressBar(`Deleted variable ${variable._id}`);
      } catch (error) {
        printMessage(
          `Error: ${error.response.data.code} - ${error.response.data.message}`,
          'error'
        );
      }
    }
    stopProgressBar(`Variables deleted.`);
  } catch (error) {
    printMessage(
      `Error: ${error.response.data.code} - ${error.response.data.message}`,
      'error'
    );
  }
}

/**
 * Describe a variable
 * @param {string} variableId variable id
 */
export async function describeVariable(variableId) {
  const variable = (await getVariable(variableId)).data;
  const table = createKeyValueTable();
  table.push(['Name'.brightCyan, variable._id]);
  table.push(['Value'.brightCyan, wordwrap(decode(variable.valueBase64), 40)]);
  table.push([
    'Status'.brightCyan,
    variable.loaded ? 'loaded'.brightGreen : 'unloaded'.brightRed,
  ]);
  table.push(['Description'.brightCyan, wordwrap(variable.description, 60)]);
  table.push([
    'Modified'.brightCyan,
    new Date(variable.lastChangeDate).toLocaleString(),
  ]);
  table.push([
    'Modifier'.brightCyan,
    await resolveUserName('teammember', variable.lastChangedBy),
  ]);
  table.push(['Modifier UUID'.brightCyan, variable.lastChangedBy]);
  printMessage(table.toString());
}
