import util from 'util';
import { generateAmApi } from './BaseApi.js';
import { getCurrentRealmPath } from './utils/ApiUtils.js';
import storage from '../storage/SessionStorage.js';

const scriptURLTemplate = '%s/json%s/scripts/%s';
const scriptListURLTemplate = '%s/json%s/scripts?_queryFilter=true';
const scriptQueryURLTemplate =
  '%s/json%s/scripts?_queryFilter=name+eq+%%22%s%%22';
const apiVersion = 'protocol=2.0,resource=1.0';
const getApiConfig = () => {
  const configPath = getCurrentRealmPath();
  return {
    path: `${configPath}/authentication/authenticationtrees`,
    apiVersion,
  };
};

/**
 * Get all scripts
 * @returns {Promise} a promise that resolves to an object containing an array of script objects
 */
export async function getScripts() {
  const urlString = util.format(
    scriptListURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath()
  );
  return generateAmApi(getApiConfig()).get(urlString, {
    withCredentials: true,
  });
}

/**
 * Get script by name
 * @param {string} name script name
 * @returns {Promise} a promise that resolves to an object containing a script object
 */
export async function getScriptByName(name) {
  const urlString = util.format(
    scriptQueryURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath(),
    name
  );
  return generateAmApi(getApiConfig()).get(urlString, {
    withCredentials: true,
  });
}

/**
 * Get script by id
 * @param {string} id script uuid/name
 * @returns {Promise} a promise that resolves to an object containing a script object
 */
export function getScript(id) {
  const urlString = util.format(
    scriptURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath(),
    id
  );
  return generateAmApi(getApiConfig()).get(urlString, {
    withCredentials: true,
  });
}

/**
 * Put script
 * @param {string} id script uuid
 * @param {Object} data script object
 * @returns {Promise} a promise that resolves to an object containing a script object
 */
export async function putScript(id, data) {
  const urlString = util.format(
    scriptURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath(storage.session.getRealm()),
    id
  );
  return generateAmApi(getApiConfig()).put(urlString, data, {
    withCredentials: true,
  });
}
