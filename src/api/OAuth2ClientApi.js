import util from 'util';
import { generateAmApi } from './BaseApi.js';
import { getCurrentRealmPath } from './utils/ApiUtils.js';
import storage from '../storage/SessionStorage.js';

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
      console.error(
        'listOAuth2Clients ERROR: list OAuth2Clients structure call returned %d',
        response.status
      );
      return [];
    }
    return response.data.result;
  } catch (e) {
    console.error(
      'listOAuth2Clients ERROR: list OAuth2Clients structure error - ',
      e
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
      console.error(
        'getOAuth2ClientByName ERROR: structure call returned %d, possible cause: OAuth2 Client not found',
        response.status
      );
      return null;
    }
    return response.data.result;
  } catch (e) {
    console.error('getOAuth2ClientByName ERROR: structure error - ', e.message);
    return null;
  }
}

export async function getOAuth2Client(id) {
  try {
    const urlString = util.format(
      oauth2ClientURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath(),
      id
    );
    const response = await generateAmApi(getApiConfig()).get(urlString, {
      withCredentials: true,
    });
    if (response.status < 200 || response.status > 399) {
      console.error(
        'getOAuth2Client ERROR: get structure call returned %d, possible cause: OAuth2 Client not found',
        response.status
      );
      return null;
    }
    return response.data;
  } catch (e) {
    console.error('getOAuth2Client ERROR: structure error - ', e.message);
    return null;
  }
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
      console.error(
        `putOAuth2Client ERROR: ${response.status}, details: ${response}`
      );
      return null;
    }
    if (response.data._id !== id) {
      console.error(
        `putOAuth2Client ERROR: generic error importing OAuth2 Client ${id}`
      );
      return null;
    }
    return '';
  } catch (e) {
    console.error(
      `putOAuth2Client ERROR: OAuth2 Client: ${id} - ${e.message}`,
      e.response
    );
    return null;
  }
}
