import util from 'util';
import { generateAmApi } from './BaseApi.js';
import { getCurrentRealmPath } from './utils/ApiUtils.js';
import storage from '../storage/SessionStorage.js';
import { printMessage } from '../ops/utils/Console.js';

const oauth2ClientURLTemplate = '%s/json%s/realm-config/agents/OAuth2Client/%s';
const oauth2ClientListURLTemplate =
  '%s/json%s/realm-config/agents/OAuth2Client?_queryFilter=true';
const oauth2ClientQueryURLTemplate =
  '%s/json%s/realm-config/agents/OAuth2Client?_queryFilter=name+eq+%%22%s%%22';
const apiVersion = 'protocol=2.1,resource=1.0';
const getApiConfig = () => {
  const configPath = getCurrentRealmPath();
  return {
    path: `${configPath}/realm-config/agents/OAuth2Client`,
    apiVersion,
  };
};

export async function listOAuth2Clients() {
  try {
    const urlString = util.format(
      oauth2ClientListURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath()
    );
    const response = await generateAmApi(getApiConfig()).get(urlString, {
      withCredentials: true,
    });
    if (response.status < 200 || response.status > 399) {
      printMessage(
        `listOAuth2Clients ERROR: list OAuth2Clients structure call returned ${response.status}`,
        'error'
      );
      return [];
    }
    return response.data.result;
  } catch (e) {
    printMessage(
      `listOAuth2Clients ERROR: list OAuth2Clients structure error - ${e}`,
      'error'
    );
    return [];
  }
}

export async function getOAuth2ClientByName(name) {
  try {
    const urlString = util.format(
      oauth2ClientQueryURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath(),
      name
    );
    const response = await generateAmApi(getApiConfig()).get(urlString, {
      withCredentials: true,
    });
    if (response.status < 200 || response.status > 399) {
      printMessage(
        `getOAuth2ClientByName ERROR: structure call returned ${response.status}, possible cause: OAuth2 Client not found`,
        'error'
      );
      return null;
    }
    return response.data.result;
  } catch (e) {
    printMessage(
      `getOAuth2ClientByName ERROR: structure error - ${e.message}`,
      'error'
    );
    return null;
  }
}

export async function getOAuth2Client(id) {
  const urlString = util.format(
    oauth2ClientURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath(),
    id
  );
  return generateAmApi(getApiConfig()).get(urlString, {
    withCredentials: true,
  });
}

export async function putOAuth2Client(id, data) {
  const client = data;
  delete client._provider;
  delete client._rev;
  try {
    const urlString = util.format(
      oauth2ClientURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath(storage.session.getRealm()),
      id
    );
    const response = await generateAmApi(getApiConfig()).put(
      urlString,
      client,
      {
        withCredentials: true,
      }
    );
    if (response.status < 200 || response.status > 399) {
      printMessage(
        `putOAuth2Client ERROR: ${response.status}, details: ${response}`,
        'error'
      );
      return null;
    }
    if (response.data._id !== id) {
      printMessage(
        `putOAuth2Client ERROR: generic error importing OAuth2 Client ${id}`,
        'error'
      );
      return null;
    }
    return '';
  } catch (e) {
    printMessage(
      `putOAuth2Client ERROR: OAuth2 Client: ${id} - ${e.message} - ${e.response}`,
      'error'
    );
    printMessage(e.response.data, 'error');
    return null;
  }
}
