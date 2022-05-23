import util from 'util';
import { generateAmApi } from './BaseApi.js';
import { getCurrentRealmPath } from './utils/ApiUtils.js';
import storage from '../storage/SessionStorage.js';
import { printMessage } from './utils/Console.js';

const providerByLocationAndIdURLTemplate = '%s/json%s/realm-config/saml2/%s/%s';
const queryAllProvidersURLTemplate =
  '%s/json%s/realm-config/saml2?_queryFilter=true';
const queryProvidersByEntityIdURLTemplate =
  '%s/json%s/realm-config/saml2?_queryFilter=%s&_fields=%s';
const apiVersion = 'protocol=2.1,resource=1.0';
const getApiConfig = () => {
  const configPath = getCurrentRealmPath();
  return {
    path: `${configPath}/realm-config/saml2`,
    apiVersion,
  };
};

export async function getProviders() {
  try {
    const urlString = util.format(
      queryAllProvidersURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath()
    );
    const response = await generateAmApi(getApiConfig()).get(urlString, {
      withCredentials: true,
    });
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

async function findProviders(filter, fields) {
  try {
    const urlString = util.format(
      queryProvidersByEntityIdURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath(),
      filter,
      fields
    );
    const response = await generateAmApi(getApiConfig()).get(urlString, {
      withCredentials: true,
    });
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

export async function getProvider(entityId) {
  const providers = await getProviders();
  const foundProviders = providers.filter(
    (provider) => provider._id === entityId
  );
  if (foundProviders.length === 1) {
    return foundProviders[0];
  }
  return [];
}

export async function getProviderByLocationAndId(location, id) {
  try {
    const urlString = util.format(
      providerByLocationAndIdURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath(),
      location,
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
      providerByLocationAndIdURLTemplate,
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
