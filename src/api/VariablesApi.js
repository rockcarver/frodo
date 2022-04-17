import util from 'util';
import { encode } from './utils/Base64.js';
import { getTenantURL, getCurrentRealmPath } from './utils/ApiUtils.js';
import { generateESVApi } from './BaseApi.js';
import storage from '../storage/SessionStorage.js';

const variablesListURLTemplate = '%s/environment/variables';
const variableURLTemplate = '%s/environment/variables/%s';
const variableSetDescriptionURLTemplate = `${variableURLTemplate}?_action=setDescription`;

const apiVersion = 'protocol=1.0,resource=1.0';
const getApiConfig = () => {
  const configPath = getCurrentRealmPath();
  return {
    path: `${configPath}/environment/secrets`,
    apiVersion,
  };
};

export async function listVariables() {
  const urlString = util.format(
    variablesListURLTemplate,
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

export async function getVariable(id) {
  const urlString = util.format(
    variableURLTemplate,
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

export async function createVariable(id, value, description) {
  const data = {
    valueBase64: encode(value),
    description,
    encoding: 'generic',
    useInPlaceholders: true,
  };
  const urlString = util.format(
    variableURLTemplate,
    getTenantURL(storage.session.getTenant()),
    id
  );
  const response = await generateESVApi(getApiConfig())
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

export async function updateVariable(id, value, description) {
  return createVariable(id, value, description);
}

export async function setVariableDescription(id, description) {
  const urlString = util.format(
    variableSetDescriptionURLTemplate,
    getTenantURL(storage.session.getTenant()),
    id
  );
  await generateESVApi(getApiConfig())
    .post(urlString, { description }, { withCredentials: true })
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
  return '';
}

export async function deleteVariable(id) {
  const urlString = util.format(
    variableURLTemplate,
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
