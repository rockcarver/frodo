import fs from 'fs';
import os from 'os';
import storage from '../storage/SessionStorage.js';
import DataProtection from './utils/DataProtection.js';
import {
  createObjectTable,
  createTable,
  printMessage,
} from './utils/Console.js';

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
 * @param {String} host tenant host url or unique substring
 * @returns {Object} connection profile object or null
 */
function findConnectionProfile(connectionProfiles, host) {
  for (const tenant in connectionProfiles) {
    if (tenant.includes(host)) {
      const profile = connectionProfiles[tenant];
      profile.tenant = tenant;
      return profile;
    }
  }
  return null;
}

/**
 * List connection profiles
 * @param {boolean} long Long list format with details
 */
export function listConnectionProfiles(long = false) {
  const filename = getConnectionProfilesFileName();
  try {
    const data = fs.readFileSync(filename, 'utf8');
    const connectionsData = JSON.parse(data);
    if (long) {
      const table = createTable(['Host', 'Username', 'Log API Key']);
      Object.keys(connectionsData).forEach((c) => {
        table.push([
          c,
          connectionsData[c].username,
          connectionsData[c].logApiKey,
        ]);
      });
      printMessage(table.toString(), 'data');
    } else {
      Object.keys(connectionsData).forEach((c) => {
        printMessage(`${c}`, 'data');
      });
    }
    printMessage(
      'Any unique substring of a saved host can be used as the value for host parameter in all commands',
      'info'
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
 * Get connection profile by host
 * @param {String} host host tenant host url or unique substring
 * @returns {Object} connection profile or null
 */
export async function getConnectionProfileByHost(host) {
  try {
    const filename = getConnectionProfilesFileName();
    const connectionsData = JSON.parse(
      fs.readFileSync(filename, fileOptions.options)
    );
    const profile = findConnectionProfile(connectionsData, host);
    if (!profile) {
      printMessage(
        `Profile for ${host} not found. Please specify credentials on command line`,
        'error'
      );
      return null;
    }
    return {
      tenant: profile.tenant,
      username: profile.username ? profile.username : null,
      password: profile.encodedPassword
        ? await dataProtection.decrypt(profile.encodedPassword)
        : null,
      key: profile.logApiKey ? profile.logApiKey : null,
      secret: profile.logApiSecret ? profile.logApiSecret : null,
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
 * Get connection profile
 * @returns {Object} connection profile or null
 */
export async function getConnectionProfile() {
  return getConnectionProfileByHost(storage.session.getTenant());
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
}

/**
 * Delete connection profile
 * @param {String} host host tenant host url or unique substring
 */
export function deleteConnectionProfile(host) {
  const filename = getConnectionProfilesFileName();
  let connectionsData = {};
  fs.stat(filename, (err) => {
    if (err == null) {
      const data = fs.readFileSync(filename, 'utf8');
      connectionsData = JSON.parse(data);
      const profile = findConnectionProfile(connectionsData, host);
      if (profile) {
        printMessage(`Deleting connection profile ${profile.tenant}`);
        delete connectionsData[profile.tenant];
        fs.writeFileSync(filename, JSON.stringify(connectionsData, null, 2));
      } else {
        printMessage(`No connection profile ${host} found`);
      }
    } else if (err.code === 'ENOENT') {
      printMessage(`Connection profile file ${filename} not found`);
    } else {
      printMessage(
        `Error in deleting connection profile: ${err.code}`,
        'error'
      );
    }
  });
}

export async function describeConnectionProfile(host, showSecrets) {
  const profile = await getConnectionProfileByHost(host);
  if (profile) {
    if (!showSecrets) {
      delete profile.password;
      delete profile.secret;
    }
    if (!profile.key) {
      delete profile.key;
      delete profile.secret;
    }
    const keyMap = {
      tenant: 'Host',
      username: 'Username',
      password: 'Password',
      key: 'Log API Key',
      secret: 'Log API Secret',
    };
    const table = createObjectTable(profile, keyMap);
    printMessage(table.toString(), 'data');
  } else {
    printMessage(`No connection profile ${host} found`);
  }
}
