import fs from 'fs';
import { FRODO_METADATA_ID } from '../../storage/constants.js';

// TODO: refactor types to use .d.ts files
/**
 * no description provided yet
 * @typedef {Object} Metadata
 * @property {string} Metadata.exportedBy username of the creator of this metadata
 * @property {string} Metadata.exportDate the date this metadata was created
 * @property {string} Metadata.exportTool The name of the export tool
 * @property {string} Metadata.exportToolVersion The version of the export tool
 */

/**
 * creates a formatted metadata object
 * @returns {Metadata}
 * @param {Object} config configObject
 * @param {Object} config.state configObject typically originates from global state
 * @param {string} config.state.host The host URL for the tenant
 * @param {string} config.state.username The username of the tenant
 * @param {string} config.state.frodoVersion The frodo version in use
 */
export const formatMetadata = ({
  state: { host, username, frodoVersion },
}) => ({
  origin: host,
  exportedBy: username,
  exportDate: new Date().toISOString(),
  exportTool: FRODO_METADATA_ID,
  exportToolVersion: frodoVersion,
});

/**
 * Takes an base64 string and outputs an array of decoded script lines
 * @param {string} b64text encoded script
 * @returns {Array<string>} script lines array
 */
export const convertBase64ScriptToArray = (b64text) => {
  return Buffer.from(b64text, 'base64')
    .toString()
    .replaceAll('\t', '    ')
    .split('\n');
};

/**
 * Takes an array of decoded script lines and converts to a single base64 string
 * @param {Array<string>} scriptArray script lines array
 * @returns {string} encoded script
 */
export const convertArrayToBase64Script = (scriptArray) => {
  return Buffer.from(scriptArray.join('\n')).toString('base64');
};

/**
 * TODO: no-op not implimented yet
 */
export const validateImport = (metadata) => true;

/**
 * no description provided yet
 * @param {Array<any>} data
 * @param { string } identifier
 * @param { string } filename
 * @param {Object.state} state configObject typically originates from global state
 * @param {string} state.type
 * @param {string} state.host
 * @param {string} state.username
 * @param {string} state.frodoVersion
 */
export const saveToFile = ({
  data,
  identifier,
  filename,
  state: { type, host, username, frodoVersion },
}) => {
  const exportData = {};
  exportData.meta = formatMetadata({ host, username, frodoVersion });
  exportData[type] = {};
  data.forEach((element) => {
    exportData[type][element[identifier]] = element;
  });
  fs.writeFile(filename, JSON.stringify(exportData, null, 2), (err, data) => {
    if (err) {
      return console.error(`ERROR - can't save ${type} to file`);
    }
  });
};
