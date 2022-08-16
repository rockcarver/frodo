import util from 'util';
import { generateAmApi } from './BaseApi.js';
import { getCurrentRealmPath } from './utils/ApiUtils.js';
import storage from '../storage/SessionStorage.js';

const oauthProviderServiceURLTemplate =
  '%s/json%s/realm-config/services/oauth-oidc';

const apiVersion = 'protocol=2.1,resource=1.0';
const getApiConfig = () => {
  const configPath = getCurrentRealmPath();
  return {
    path: `${configPath}/authentication/authenticationtrees`,
    apiVersion,
  };
};

// eslint-disable-next-line import/prefer-default-export
export async function getOAuth2Provider() {
  try {
    const urlString = util.format(
      oauthProviderServiceURLTemplate,
      state.default.session.getTenant(),
      getCurrentRealmPath()
    );
    const response = await generateAmApi(getApiConfig()).get(urlString, {
      withCredentials: true,
    });
    if (response.status < 200 || response.status > 399) {
      console.log(
        `getOAuth2Provider ERROR: get OAuth2 provider call returned ${response.status}, possible cause: service not found`,
        'error'
      );
      return null;
    }
    return response.data;
  } catch (e) {
    console.log(
      `getOAuth2Provider ERROR: get Oauth2 provider error - ${e.message}`,
      'error'
    );
    return null;
  }
}
