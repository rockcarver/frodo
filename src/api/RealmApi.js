import util from 'util';
import { getTenantURL, getCurrentRealmPath } from './utils/ApiUtils.js';
import { generateAmApi } from './BaseApi.js';
import storage from '../storage/SessionStorage.js';

const realmsListURLTemplate = '%s/json/global-config/realms/?_queryFilter=true';
const realmURLTemplate = '%s/json/global-config/realms/%s';

const apiVersion = 'protocol=2.0,resource=1.0';
const getApiConfig = () => {
  const configPath = getCurrentRealmPath();
  return {
    path: `${configPath}/am/json/global-config/realms`,
    apiVersion,
  };
};

export async function listRealms() {
  const urlString = util.format(
    realmsListURLTemplate,
    storage.session.getTenant()
  );
  const response = await generateAmApi(getApiConfig())
    .get(urlString, {
      withCredentials: true,
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(
          'Error! The request was made and the server responded with a status code!',
          error.message
        );
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(
          'Error! The request was made but no response was received!',
          error.message
        );
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error setting up request', error.message);
      }
      console.log(error.config);
      return [];
    });
  return response.data.result;
}

export async function getRealm(id) {
  const urlString = util.format(
    realmURLTemplate,
    storage.session.getTenant(),
    id
  );
  const response = await generateAmApi(getApiConfig())
    .get(urlString, {
      withCredentials: true,
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(
          'Error! The request was made and the server responded with a status code!',
          error.message
        );
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(
          'Error! The request was made but no response was received!',
          error.message
        );
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error setting up request', error.message);
      }
      console.log(error.config);
      return null;
    });
  return response.data;
}

export async function getRealmByName(name) {
  const realms = await listRealms();
  let realm = null;
  realms.forEach((realmConfig) => {
    if (name === realmConfig.name) {
      realm = realmConfig;
    }
  });
  return realm;
}

export async function createRealm(id, data) {
  const urlString = util.format(
    realmURLTemplate,
    storage.session.getTenant(),
    id
  );
  const response = await generateAmApi(getApiConfig())
    .put(urlString, data, { withCredentials: true })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(
          'Error! The request was made and the server responded with a status code!',
          error.message
        );
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(
          'Error! The request was made but no response was received!',
          error.message
        );
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error setting up request', error.message);
      }
      console.log(error.config);
      return null;
    });
  return response.data;
}

export async function updateRealm(id, data) {
  return createRealm(id, data);
}

export async function addCustomDomain(name, domain) {
  const realmConfig = await getRealmByName(name);
  if (realmConfig) {
    let exists = false;
    realmConfig.aliases.forEach((alias) => {
      if (domain.toLowerCase() === alias.toLowerCase()) {
        exists = true;
      }
    });
    if (!exists) {
      realmConfig.aliases.push(domain.toLowerCase());
      return updateRealm(realmConfig._id, realmConfig);
    }
    return realmConfig;
  }
  return null;
}

export async function removeCustomDomain(name, domain) {
  const realmConfig = await getRealmByName(name);
  if (realmConfig) {
    const aliases = realmConfig.aliases.filter(
      (alias) => domain.toLowerCase() !== alias.toLowerCase()
    );
    if (aliases.length < realmConfig.aliases.length) {
      realmConfig.aliases = aliases;
      return updateRealm(realmConfig._id, realmConfig);
    }
    return realmConfig;
  }
  return null;
}

export async function deleteRealm(id) {
  const urlString = util.format(
    realmURLTemplate,
    getTenantURL(storage.session.getTenant()),
    id
  );
  const response = await generateAmApi(getApiConfig())
    .delete(urlString, {
      withCredentials: true,
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(
          'Error! The request was made and the server responded with a status code!',
          error.message
        );
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(
          'Error! The request was made but no response was received!',
          error.message
        );
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error setting up request', error.message);
      }
      console.log(error.config);
      return null;
    });
  return response.data;
}
