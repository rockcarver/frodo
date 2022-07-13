import util from 'util';
import qs from 'qs';
import { generateOauth2Api } from './BaseApi.js';
import { getCurrentRealmPath } from './utils/ApiUtils.js';
import storage from '../storage/SessionStorage.js';
import { encode } from './utils/Base64.js';
import { printMessage } from '../ops/utils/Console.js';

const authorizeUrlTemplate = '%s/oauth2%s/authorize';
const accessTokenUrlTemplate = '%s/oauth2%s/access_token';
const apiVersion = 'protocol=2.1,resource=1.0';
const getApiConfig = () => ({
  apiVersion,
});

export async function authorize(data, config = {}) {
  const authorizeURL = util.format(
    authorizeUrlTemplate,
    storage.session.getTenant(),
    ''
  );
  return generateOauth2Api(getApiConfig()).post(authorizeURL, data, config);
}

export async function accessToken(data, config = {}) {
  const accessTokenURL = util.format(
    accessTokenUrlTemplate,
    storage.session.getTenant(),
    ''
  );
  return generateOauth2Api(getApiConfig()).post(accessTokenURL, data, config);
}

export async function clientCredentialsGrant(clientId, clientSecret, scope) {
  const urlString = util.format(
    accessTokenUrlTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath()
  );
  const requestOverride = {
    headers: {
      Authorization: `Basic ${encode(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  const requestBody = {
    grant_type: 'client_credentials',
    scope,
  };
  const response = await generateOauth2Api(getApiConfig(), requestOverride)
    .post(urlString, qs.stringify(requestBody), { withCredentials: true })
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
