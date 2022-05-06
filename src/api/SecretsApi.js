import util from 'util';
import { encode } from './utils/Base64.js';
import { getTenantURL, getCurrentRealmPath } from './utils/ApiUtils.js';
import { generateESVApi } from './BaseApi.js';
import storage from '../storage/SessionStorage.js';
import { printMessage } from './utils/Console.js';

const secretsListURLTemplate = '%s/environment/secrets';
const secretListVersionsURLTemplate = '%s/environment/secrets/%s/versions';
const secretCreateNewVersionURLTemplate = `${secretListVersionsURLTemplate}?_action=create`;
const secretGetVersionURLTemplate = `${secretListVersionsURLTemplate}/%s`;
const secretVersionStatusURLTemplate = `${secretGetVersionURLTemplate}?_action=changestatus`;
const secretURLTemplate = '%s/environment/secrets/%s';
const secretSetDescriptionURLTemplate = `${secretURLTemplate}?_action=setDescription`;

const apiVersion = 'protocol=1.0,resource=1.0';
const getApiConfig = () => {
  const configPath = getCurrentRealmPath();
  return {
    path: `${configPath}/environment/secrets`,
    apiVersion,
  };
};

export async function listSecrets() {
  const urlString = util.format(
    secretsListURLTemplate,
    getTenantURL(storage.session.getTenant())
  );
  const response = await generateESVApi(getApiConfig())
    .get(urlString, {
      withCredentials: true,
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        printMessage(
          `Error! The request was made and the server responded with a status code! - ${error.message}`,
          'error'
        );
        printMessage(error.response.data, 'error');
        printMessage(error.response.status, 'error');
        printMessage(error.response.headers, 'error');
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        printMessage(
          `Error! The request was made but no response was received! - ${error.message}`,
          'error'
        );
        printMessage(error.request, 'error');
      } else {
        // Something happened in setting up the request that triggered an Error
        printMessage(`Error setting up request - ${error.message}`, 'error');
      }
      printMessage(error.config, 'error');
      return [];
    });
  return response.data.result;
}

export async function getSecret(id) {
  const urlString = util.format(
    secretURLTemplate,
    getTenantURL(storage.session.getTenant()),
    id
  );
  const response = await generateESVApi(getApiConfig())
    .get(urlString, {
      withCredentials: true,
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        printMessage(
          `Error! The request was made and the server responded with a status code! - ${error.message}`,
          'error'
        );
        printMessage(error.response.data, 'error');
        printMessage(error.response.status, 'error');
        printMessage(error.response.headers, 'error');
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        printMessage(
          `Error! The request was made but no response was received! - ${error.message}`,
          'error'
        );
        printMessage(error.request, 'error');
      } else {
        // Something happened in setting up the request that triggered an Error
        printMessage(`Error setting up request - ${error.message}`, 'error');
      }
      printMessage(error.config, 'error');
      return null;
    });
  return response.data;
}

export async function createSecret(id, value, description) {
  const data = {
    valueBase64: encode(value),
    description,
    encoding: 'generic',
    useInPlaceholders: true,
  };
  const urlString = util.format(
    secretURLTemplate,
    getTenantURL(storage.session.getTenant()),
    id
  );
  const response = await generateESVApi(getApiConfig())
    .put(urlString, data, { withCredentials: true })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        printMessage(
          `Error! The request was made and the server responded with a status code! - ${error.message}`,
          'error'
        );
        printMessage(error.response.data, 'error');
        printMessage(error.response.status, 'error');
        printMessage(error.response.headers, 'error');
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        printMessage(
          `Error! The request was made but no response was received! - ${error.message}`,
          'error'
        );
        printMessage(error.request, 'error');
      } else {
        // Something happened in setting up the request that triggered an Error
        printMessage(`Error setting up request - ${error.message}`, 'error');
      }
      printMessage(error.config, 'error');
      return null;
    });
  return response.data;
}

export async function setSecretDescription(id, description) {
  const urlString = util.format(
    secretSetDescriptionURLTemplate,
    getTenantURL(storage.session.getTenant()),
    id
  );
  await generateESVApi(getApiConfig())
    .post(urlString, { description }, { withCredentials: true })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        printMessage(
          `Error! The request was made and the server responded with a status code! - ${error.message}`,
          'error'
        );
        printMessage(error.response.data, 'error');
        printMessage(error.response.status, 'error');
        printMessage(error.response.headers, 'error');
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        printMessage(
          `Error! The request was made but no response was received! - ${error.message}`,
          'error'
        );
        printMessage(error.request, 'error');
      } else {
        // Something happened in setting up the request that triggered an Error
        printMessage(`Error setting up request - ${error.message}`, 'error');
      }
      printMessage(error.config, 'error');
      return null;
    });
  return '';
}

export async function deleteSecret(id) {
  const urlString = util.format(
    secretURLTemplate,
    getTenantURL(storage.session.getTenant()),
    id
  );
  const response = await generateESVApi(getApiConfig())
    .delete(urlString, {
      withCredentials: true,
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        printMessage(
          `Error! The request was made and the server responded with a status code! - ${error.message}`,
          'error'
        );
        printMessage(error.response.data, 'error');
        printMessage(error.response.status, 'error');
        printMessage(error.response.headers, 'error');
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        printMessage(
          `Error! The request was made but no response was received! - ${error.message}`,
          'error'
        );
        printMessage(error.request, 'error');
      } else {
        // Something happened in setting up the request that triggered an Error
        printMessage(`Error setting up request - ${error.message}`, 'error');
      }
      printMessage(error.config, 'error');
      return null;
    });
  return response.data;
}

export async function listSecretVersions(id) {
  const urlString = util.format(
    secretListVersionsURLTemplate,
    getTenantURL(storage.session.getTenant()),
    id
  );
  const response = await generateESVApi(getApiConfig())
    .get(urlString, {
      withCredentials: true,
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        printMessage(
          `Error! The request was made and the server responded with a status code! - ${error.message}`,
          'error'
        );
        printMessage(error.response.data, 'error');
        printMessage(error.response.status, 'error');
        printMessage(error.response.headers, 'error');
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        printMessage(
          `Error! The request was made but no response was received! - ${error.message}`,
          'error'
        );
        printMessage(error.request, 'error');
      } else {
        // Something happened in setting up the request that triggered an Error
        printMessage(`Error setting up request - ${error.message}`, 'error');
      }
      printMessage(error.config, 'error');
      return [];
    });
  return response.data;
}

export async function createNewVersionOfSecret(id, value) {
  const urlString = util.format(
    secretCreateNewVersionURLTemplate,
    getTenantURL(storage.session.getTenant()),
    id
  );
  const response = await generateESVApi(getApiConfig())
    .post(urlString, { valueBase64: encode(value) }, { withCredentials: true })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        printMessage(
          `Error! The request was made and the server responded with a status code! - ${error.message}`,
          'error'
        );
        printMessage(error.response.data, 'error');
        printMessage(error.response.status, 'error');
        printMessage(error.response.headers, 'error');
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        printMessage(
          `Error! The request was made but no response was received! - ${error.message}`,
          'error'
        );
        printMessage(error.request, 'error');
      } else {
        // Something happened in setting up the request that triggered an Error
        printMessage(`Error setting up request - ${error.message}`, 'error');
      }
      printMessage(error.config, 'error');
      return null;
    });
  return response.data;
}

export async function getVersionOfSecret(id, version) {
  const urlString = util.format(
    secretGetVersionURLTemplate,
    getTenantURL(storage.session.getTenant()),
    id,
    version
  );
  const response = await generateESVApi(getApiConfig())
    .get(urlString, {
      withCredentials: true,
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        printMessage(
          `Error! The request was made and the server responded with a status code! - ${error.message}`,
          'error'
        );
        printMessage(error.response.data, 'error');
        printMessage(error.response.status, 'error');
        printMessage(error.response.headers, 'error');
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        printMessage(
          `Error! The request was made but no response was received! - ${error.message}`,
          'error'
        );
        printMessage(error.request, 'error');
      } else {
        // Something happened in setting up the request that triggered an Error
        printMessage(`Error setting up request - ${error.message}`, 'error');
      }
      printMessage(error.config, 'error');
      return null;
    });
  return response.data;
}

export async function setStatusOfVersionOfSecret(id, version, status) {
  const urlString = util.format(
    secretVersionStatusURLTemplate,
    getTenantURL(storage.session.getTenant()),
    id,
    version
  );
  const response = await generateESVApi(getApiConfig())
    .post(urlString, { status }, { withCredentials: true })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        printMessage(
          `Error! The request was made and the server responded with a status code! - ${error.message}`,
          'error'
        );
        printMessage(error.response.data, 'error');
        printMessage(error.response.status, 'error');
        printMessage(error.response.headers, 'error');
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        printMessage(
          `Error! The request was made but no response was received! - ${error.message}`,
          'error'
        );
        printMessage(error.request, 'error');
      } else {
        // Something happened in setting up the request that triggered an Error
        printMessage(`Error setting up request - ${error.message}`, 'error');
      }
      printMessage(error.config, 'error');
      return null;
    });
  return response.data;
}

export async function enableVersionOfSecret(id, version) {
  return setStatusOfVersionOfSecret(id, version, 'ENABLED');
}

export async function disableVersionOfSecret(id, version) {
  return setStatusOfVersionOfSecret(id, version, 'DISABLED');
}

export async function deleteVersionOfSecret(id, version) {
  const urlString = util.format(
    secretGetVersionURLTemplate,
    getTenantURL(storage.session.getTenant()),
    id,
    version
  );
  const response = await generateESVApi(getApiConfig())
    .delete(urlString, {
      withCredentials: true,
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        printMessage(
          `Error! The request was made and the server responded with a status code! - ${error.message}`,
          'error'
        );
        printMessage(error.response.data, 'error');
        printMessage(error.response.status, 'error');
        printMessage(error.response.headers, 'error');
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        printMessage(
          `Error! The request was made but no response was received! - ${error.message}`,
          'error'
        );
        printMessage(error.request, 'error');
      } else {
        // Something happened in setting up the request that triggered an Error
        printMessage(`Error setting up request - ${error.message}`, 'error');
      }
      printMessage(error.config, 'error');
      return null;
    });
  return response.data;
}
