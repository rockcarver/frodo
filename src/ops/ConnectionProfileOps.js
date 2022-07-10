import fs from 'fs';
import os from 'os';
import storage from '../storage/SessionStorage.js';
import DataProtection from './utils/DataProtection.js';
import { printMessage } from './utils/Console.js';

const dataProtection = new DataProtection();

const fileOptions = {
  options: 'utf8',
  indentation: 4,
};

const getConnectionProfilesFolder = () => `${os.homedir()}/.frodo`;

/**
 * Get connection profiles file name
 * @returns {String} connection profiles file name
 */
export function getConnectionProfilesFileName() {
  return `${os.homedir()}/.frodo/.frodorc`;
}

/**
 * Find connection profile
 * @param {Object} connectionProfiles connection profile object
 * @param {String} tenant tenant name or unique substring
 * @returns {Object} connection profile object or null
 */
function findConnectionProfile(connectionProfiles, tenant) {
  for (const savedTenant in connectionProfiles) {
    if (savedTenant.includes(tenant)) {
      const ret = connectionProfiles[savedTenant];
      ret.tenant = savedTenant;
      return ret;
    }
  }
  return null;
}

/**
 * List connection profiles
 */
export function listConnectionProfiles() {
  const filename = getConnectionProfilesFileName();
  try {
    const data = fs.readFileSync(filename, 'utf8');
    const connectionsData = JSON.parse(data);
    printMessage(`[Host] : [Username]`);
    Object.keys(connectionsData).forEach((c) => {
      printMessage(
        `- [${c}] : [${connectionsData[c].username}]${
          connectionsData[c].logApiKey ? ' [Log API key present]' : ''
        }`,
        'info'
      );
    });
    printMessage(
      'Any unique substring of a saved host can be used as the value for host parameter in all commands'
    );
  } catch (e) {
    printMessage(`No connections found in ${filename} (${e.message})`, 'error');
  }
}

/**
 * Initialize connection profiles
 */
export function initConnectionProfiles() {
  // create connections.json file if it doesn't exist
  const folderName = getConnectionProfilesFolder();
  const filename = getConnectionProfilesFileName();
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName, { recursive: true });
    if (!fs.existsSync(filename)) {
      fs.writeFileSync(
        filename,
        JSON.stringify({}, null, fileOptions.indentation)
      );
    }
  }
  // encrypt the password from clear text to aes-256-GCM
  else {
    const data = fs.readFileSync(filename, fileOptions.options);
    const connectionsData = JSON.parse(data);
    let convert = false;
    Object.keys(connectionsData).forEach(async (conn) => {
      if (connectionsData[conn].password) {
        convert = true;
        connectionsData[conn].encodedPassword = await dataProtection.encrypt(
          connectionsData[conn].password
        ); // Buffer.from(connectionsData[conn].password).toString('base64');
        delete connectionsData[conn].password;
      }
    });
    if (convert) {
      fs.writeFileSync(
        filename,
        JSON.stringify(connectionsData, null, fileOptions.indentation)
      );
    }
  }
}

/**
 * Get connection profile
 * @returns {Object} connection profile or null
 */
export async function getConnectionProfile() {
  try {
    const filename = getConnectionProfilesFileName();
    const connectionsData = JSON.parse(
      fs.readFileSync(filename, fileOptions.options)
    );
    const tenantData = findConnectionProfile(
      connectionsData,
      storage.session.getTenant()
    );
    if (!tenantData) {
      printMessage(
        `No saved credentials for tenant ${storage.session.getTenant()}. Please specify credentials on command line`,
        'error'
      );
      return null;
    }
    return {
      tenant: tenantData.tenant,
      username: tenantData.username ? tenantData.username : null,
      password: tenantData.encodedPassword
        ? await dataProtection.decrypt(tenantData.encodedPassword)
        : null,
      key: tenantData.logApiKey ? tenantData.logApiKey : null,
      secret: tenantData.logApiSecret ? tenantData.logApiSecret : null,
    };
  } catch (e) {
    printMessage(
      `Can not read saved connection info, please specify credentials on command line: ${e}`,
      'error'
    );
    return null;
  }
}

/**
 * Save connection profile
 */
export async function saveConnectionProfile() {
  const filename = getConnectionProfilesFileName();
  printMessage(`Saving creds in ${filename}...`);
  let connectionsData = {};
  let existingData = {};
  try {
    fs.statSync(filename);
    const data = fs.readFileSync(filename, 'utf8');
    connectionsData = JSON.parse(data);
    if (connectionsData[storage.session.getTenant()]) {
      existingData = connectionsData[storage.session.getTenant()];
      printMessage(
        `Updating existing connection profile ${storage.session.getTenant()}`
      );
    } else
      printMessage(`Adding connection profile ${storage.session.getTenant()}`);
  } catch (e) {
    printMessage(
      `Creating connection profile file ${filename} with ${storage.session.getTenant()}`
    );
  }
  if (storage.session.getUsername())
    existingData.username = storage.session.getUsername();
  if (storage.session.getPassword())
    existingData.encodedPassword = await dataProtection.encrypt(
      storage.session.getPassword()
    ); // Buffer.from(storage.session.getPassword()).toString('base64');
  if (storage.session.getLogApiKey())
    existingData.logApiKey = storage.session.getLogApiKey();
  if (storage.session.getLogApiSecret())
    existingData.logApiSecret = storage.session.getLogApiSecret();
  connectionsData[storage.session.getTenant()] = existingData;

  fs.writeFileSync(filename, JSON.stringify(connectionsData, null, 2));
  printMessage('done.');
}
