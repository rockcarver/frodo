import util from 'util';
import { generateAmApi } from './BaseApi.js';
import {
  getCurrentRealmPath,
  applyNameCollisionPolicy,
} from './utils/ApiUtils.js';
import storage from '../storage/SessionStorage.js';
import { printMessage } from './utils/Console.js';

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

export async function listScripts() {
  try {
    const urlString = util.format(
      scriptListURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath()
    );
    const response = await generateAmApi(getApiConfig()).get(urlString, {
      withCredentials: true,
    });
    if (response.status < 200 || response.status > 399) {
      printMessage(
        `listScripts ERROR: list scripts structure call returned ${response.status}, possible cause: scripts not found`,
        'error'
      );
      return null;
    }
    return response.data.result;
  } catch (e) {
    printMessage(
      `listScripts ERROR: list script structure error - ${e}`,
      'error'
    );
    return null;
  }
}

export async function getScriptByName(name) {
  try {
    const urlString = util.format(
      scriptQueryURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath(),
      name
    );
    const response = await generateAmApi(getApiConfig()).get(urlString, {
      withCredentials: true,
    });
    if (response.status < 200 || response.status > 399) {
      printMessage(
        `getScriptByName ERROR: get script structure call returned ${response.status}, possible cause: script not found`,
        'error'
      );
      return null;
    }
    return response.data.result;
  } catch (e) {
    printMessage(
      `getScriptByName ERROR: get script structure error - ${e.message}`,
      'error'
    );
    return null;
  }
}

export async function getScript(id) {
  // eslint-disable-next-line eqeqeq
  if (typeof id == 'undefined' || id == '[Empty]') {
    return null;
  }
  try {
    const urlString = util.format(
      scriptURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath(),
      id
    );
    const response = await generateAmApi(getApiConfig()).get(urlString, {
      withCredentials: true,
    });
    if (response.status < 200 || response.status > 399) {
      printMessage(
        `getScript ERROR: get script structure call returned ${response.status}, possible cause: script ${id} not found`,
        'error'
      );
      return null;
    }
    return response.data;
  } catch (e) {
    printMessage(
      `getScript ERROR: get script structure (_id=${id}) error - ${e.message}`,
      'error'
    );
    return null;
  }
}

export async function putScript(id, data) {
  try {
    const urlString = util.format(
      scriptURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath(storage.session.getRealm()),
      id
    );
    const response = await generateAmApi(getApiConfig()).put(urlString, data, {
      withCredentials: true,
    });
    if (response.status < 200 || response.status > 399) {
      printMessage(
        `putScript ERROR: put script call returned ${response.status}, details: ${response}`,
        'error'
      );
      return { error: true, name: data.name };
    }
    if (response.data._id !== id) {
      printMessage(
        `putScript ERROR: generic error importing script ${id}`,
        'error'
      );
      return { error: true, name: data.name };
    }
    return { error: false, name: data.name };
  } catch (e) {
    if (e.response.status === 409) {
      printMessage(
        `putScript WARNING: script with name ${data.name} already exists, using renaming policy... <name> => <name - imported (n)>`,
        'warn'
      );
      const newName = applyNameCollisionPolicy(data.name);
      // console.log(newName);
      printMessage(`Trying to save script as ${newName}`, 'warn');
      // eslint-disable-next-line no-param-reassign
      data.name = newName;
      putScript(id, data);
      return { error: false, name: data.name };
    }
    printMessage(
      `putScript ERROR: put script error, script ${id} - ${e.message}`,
      'error'
    );
    return { error: true, name: data.name };
  }
}
