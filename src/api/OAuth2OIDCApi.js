import util from 'util';
import qs from 'qs';
import { generateOauth2Api } from './BaseApi.js';
import { getCurrentRealmPath } from './utils/ApiUtils.js';
import storage from '../storage/SessionStorage.js';
import { encode } from './utils/Base64.js';

const oauth2AccessTokenURLTemplate = '%s/oauth2%s/access_token';
const apiVersion = 'protocol=2.1,resource=1.0';
const getApiConfig = () => {
  const configPath = getCurrentRealmPath();
  return {
    path: `${configPath}/realm-config/agents/OAuth2Client`,
    apiVersion,
  };
};

// eslint-disable-next-line import/prefer-default-export
export async function clientCredentialsGrant(clientId, clientSecret, scope) {
  const urlString = util.format(
    oauth2AccessTokenURLTemplate,
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
  return response.data;
}
