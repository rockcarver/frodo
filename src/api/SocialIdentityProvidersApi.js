import util from 'util';
import { generateAmApi } from './BaseApi.js';
import { getCurrentRealmPath } from './utils/ApiUtils.js';
import storage from '../storage/SessionStorage.js';
import { printMessage } from './utils/Console.js';

const getAllProviderTypesURLTemplate =
  '%s/json%s/realm-config/services/SocialIdentityProviders?_action=getAllTypes';
const providerByTypeAndIdURLTemplate =
  '%s/json%s/realm-config/services/SocialIdentityProviders/%s/%s';
const getAllProvidersURLTemplate =
  '%s/json%s/realm-config/services/SocialIdentityProviders?_action=nextdescendents';
const getProvidersByTypeURLTemplate =
  '%s/json%s/realm-config/services/SocialIdentityProviders/%s?_queryFilter=true';
const apiVersion = 'protocol=2.1,resource=1.0';
const getApiConfig = () => {
  const configPath = getCurrentRealmPath();
  return {
    path: `${configPath}/realm-config/services/SocialIdentityProviders`,
    apiVersion,
  };
};

export async function getProviderTypes() {
  try {
    const urlString = util.format(
      getAllProviderTypesURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath()
    );
    const response = await generateAmApi(getApiConfig()).get(urlString, {
      withCredentials: true,
    });
    if (response.status < 200 || response.status > 399) {
      printMessage(`getProviderTypes ERROR: ${response.status}`, 'error');
      return [];
    }
    return response.data.result;
  } catch (e) {
    printMessage(`getProviderTypes ERROR: ${e}`, 'error');
    return [];
  }
}

export async function getProvidersByType(type) {
  try {
    const urlString = util.format(
      getProvidersByTypeURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath(),
      type
    );
    const response = await generateAmApi(getApiConfig()).get(urlString, {
      withCredentials: true,
    });
    if (response.status < 200 || response.status > 399) {
      printMessage(`getProvidersByType ERROR: ${response.status}`, 'error');
      return [];
    }
    return response.data.result;
  } catch (e) {
    printMessage(`getProvidersByType ERROR: ${e}`, 'error');
    return [];
  }
}

export async function getProviders() {
  try {
    const urlString = util.format(
      getAllProvidersURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath()
    );
    const response = await generateAmApi(getApiConfig()).post(
      urlString,
      {},
      {
        withCredentials: true,
      }
    );
    if (response.status < 200 || response.status > 399) {
      printMessage(`getProviders ERROR: ${response.status}`, 'error');
      printMessage(response, 'data');
      return [];
    }
    return response.data.result;
  } catch (error) {
    printMessage(`getProviders ERROR: ${error}`, 'error');
    printMessage(error, 'data');
    return [];
  }
}

export async function getProviderById(id) {
  const providers = await getProviders();
  const foundProviders = providers.filter((provider) => provider._id === id);
  if (foundProviders.length === 1) {
    return foundProviders[0];
  }
  return [];
}

export async function getProviderByTypeAndId(type, id) {
  try {
    const urlString = util.format(
      providerByTypeAndIdURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath(),
      type,
      id
    );
    const response = await generateAmApi(getApiConfig()).get(urlString, {
      withCredentials: true,
    });
    if (response.status < 200 || response.status > 399) {
      printMessage(`getProviderByTypeAndId ERROR!`, 'error');
      printMessage(response.status, 'data');
      printMessage(response, 'data');
      return null;
    }
    return response.data;
  } catch (e) {
    printMessage(`getProviderByTypeAndId ERROR: ${e.message}`, 'error');
    return null;
  }
}

export async function putProviderByTypeAndId(type, id, data) {
  const providerData = data;
  // delete providerData._provider;
  // delete providerData._rev;
  try {
    const urlString = util.format(
      providerByTypeAndIdURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath(storage.session.getRealm()),
      type,
      id
    );
    const response = await generateAmApi(getApiConfig()).put(
      urlString,
      providerData,
      {
        withCredentials: true,
      }
    );
    if (response.status < 200 || response.status > 399) {
      printMessage(
        `putProviderByTypeAndId ERROR: ${id} [${type}] - ${response.status}, details: ${response}`,
        'error'
      );
      printMessage(response.status, 'data');
      printMessage(response, 'data');
      return null;
    }
    if (response.data._id !== id) {
      printMessage(`putProviderByTypeAndId ERROR: ${id} [${type}]`, 'error');
      return null;
    }
    return '';
  } catch (error) {
    printMessage(
      `putProviderByTypeAndId ERROR: ${id} [${type}] - ${error.message}`,
      'error'
    );
    printMessage(error.response, 'data');
    return null;
  }
}
