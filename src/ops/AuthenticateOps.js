/* eslint-disable import/prefer-default-export */
import url from 'url';
import { createHash, randomBytes } from 'crypto';
import readlineSync from 'readline-sync';
import { encodeBase64Url } from '../api/utils/Base64.js';
import storage from '../storage/SessionStorage.js';
import * as global from '../storage/StaticStorage.js';
import { printMessage } from './utils/Console.js';
import { getServerInfo, getServerVersionInfo } from '../api/ServerInfoApi.js';
import { step } from '../api/AuthenticateApi.js';
import { accessToken, authorize } from '../api/OAuth2OIDCApi.js';
import {
  getConnectionProfile,
  saveConnectionProfile,
} from './ConnectionProfileOps.js';

const adminClientPassword = 'doesnotmatter';
const redirectUrlTemplate = '/platform/appAuthHelperRedirect.html';

const idmAdminScope = 'fr:idm:* openid';

let adminClientId = 'idmAdminClient';

/**
 * Helper function to get cookie name
 * @returns {String} cookie name
 */
async function getCookieName() {
  try {
    return (await getServerInfo()).data.cookieName;
  } catch (error) {
    printMessage(`Error getting cookie name: ${error}`, 'error');
    return null;
  }
}

/**
 * Helper function to determine if this is a setup mfa prompt in the ID Cloud tenant admin login journey
 * @param {Object} payload response from the previous authentication journey step
 * @returns {Object} an object indicating if 2fa is required and the original payload
 */
function checkAndHandle2FA(payload) {
  // let skippable = false;
  if ('callbacks' in payload) {
    for (const element of payload.callbacks) {
      if (element.type === 'HiddenValueCallback') {
        if (element.input[0].value.includes('skip')) {
          // skippable = true;
          element.input[0].value = 'Skip';
          return {
            need2fa: true,
            payload,
          };
        }
      }
      if (element.type === 'NameCallback') {
        if (element.output[0].value.includes('code')) {
          // skippable = false;
          printMessage('2FA is enabled and required for this user...');
          const code = readlineSync.question(`${element.output[0].value}: `);
          element.input[0].value = code;
          return {
            need2fa: true,
            payload,
          };
        }
      }
    }
    // console.info("NO2FA");
    return {
      need2fa: false,
      payload,
    };
  }
  // console.info("NO2FA");
  return {
    need2fa: false,
    payload,
  };
}

/**
 * Helper function to set the default realm by deployment type
 * @param {String} deploymentType deployment type
 */
function determineDefaultRealm(deploymentType) {
  if (storage.session.getRealm() === global.DEFAULT_REALM_KEY) {
    storage.session.setRealm(global.DEPLOYMENT_TYPE_REALM_MAP[deploymentType]);
  }
}

/**
 * Helper function to determine the deployment type
 * @returns {String} deployment type
 */
async function determineDeploymentType() {
  const fidcClientId = 'idmAdminClient';
  const forgeopsClientId = 'idm-admin-ui';
  let response = {};

  const verifier = encodeBase64Url(randomBytes(32));
  const challenge = encodeBase64Url(
    createHash('sha256').update(verifier).digest()
  );
  const challengeMethod = 'S256';
  const redirectURL = url.resolve(
    storage.session.getTenant(),
    redirectUrlTemplate
  );

  const config = {
    maxRedirects: 0,
  };
  let bodyFormData = `redirect_uri=${redirectURL}&scope=${idmAdminScope}&response_type=code&client_id=${fidcClientId}&csrf=${storage.session.getCookieValue()}&decision=allow&code_challenge=${challenge}&code_challenge_method=${challengeMethod}`;

  let deploymentType = global.CLASSIC_DEPLOYMENT_TYPE_KEY;
  try {
    response = await authorize(bodyFormData, config);
  } catch (e) {
    if (e.response && e.response.status === 302) {
      printMessage('ForgeRock Identity Cloud ', 'info', false);
      deploymentType = global.CLOUD_DEPLOYMENT_TYPE_KEY;
    } else {
      try {
        bodyFormData = `redirect_uri=${redirectURL}&scope=${idmAdminScope}&response_type=code&client_id=${forgeopsClientId}&csrf=${storage.session.getCookieValue()}&decision=allow&code_challenge=${challenge}&code_challenge_method=${challengeMethod}`;
        // eslint-disable-next-line no-unused-vars
        response = await authorize(bodyFormData, config);
      } catch (ex) {
        if (ex.response.status === 302) {
          adminClientId = forgeopsClientId;
          printMessage('ForgeOps deployment ', 'info', false);
          deploymentType = global.FORGEOPS_DEPLOYMENT_TYPE_KEY;
        } else {
          printMessage('Classic deployment ', 'info', false);
        }
      }
    }
    printMessage('detected.');
  }
  determineDefaultRealm(deploymentType);
  return deploymentType;
}

/**
 * Helper function to extract the semantic version string from a version info object
 * @param {Object} versionInfo version info object
 * @returns {String} semantic version
 */
async function getSemanticVersion(versionInfo) {
  if ('version' in versionInfo) {
    const versionString = versionInfo.version;
    const rx = /([\d]\.[\d]\.[\d](\.[\d])*)/g;
    const version = versionString.match(rx);
    return version[0];
  }
  throw new Error('Cannot extract semantic version from version info object.');
}

/**
 * Helper function to authenticate and obtain and store session cookie
 * @returns {String} empty string or null
 */
async function authenticate() {
  storage.session.setCookieName(await getCookieName());
  try {
    const config = {
      headers: {
        'X-OpenAM-Username': storage.session.getUsername(),
        'X-OpenAM-Password': storage.session.getPassword(),
      },
    };
    const response1 = (await step({}, config)).data;
    const skip2FA = checkAndHandle2FA(response1);
    let response2 = {};
    if (skip2FA.need2fa) {
      response2 = (await step(skip2FA.payload)).data;
    } else {
      response2 = skip2FA.payload;
    }
    if ('tokenId' in response2) {
      storage.session.setCookieValue(response2.tokenId);
      if (!storage.session.getDeploymentType()) {
        storage.session.setDeploymentType(await determineDeploymentType());
      } else {
        determineDefaultRealm(storage.session.getDeploymentType());
      }
      const versionInfo = (await getServerVersionInfo()).data;
      printMessage(`Connected to ${versionInfo.fullVersion}`);
      const version = getSemanticVersion(versionInfo);
      storage.session.setAmVersion(version);
      return '';
    }
    printMessage(`error authenticating`, 'error');
    printMessage('+++ likely cause, bad credentials!!! +++', 'error');
    return null;
  } catch (e) {
    if (e.response && e.response.status === 401) {
      printMessage(`error authenticating - ${e.message}`, 'error');
      printMessage('+++ likely cause, bad credentials +++', 'error');
    }
    if (e.message && e.message === 'self signed certificate') {
      printMessage(`error authenticating - ${e.message}`, 'error');
      printMessage('+++ use -k, --insecure option to allow +++', 'error');
    } else {
      printMessage(`error authenticating - ${e.message}`, 'error');
    }
    return null;
  }
}

/**
 * Helper function to obtain an oauth2 authorization code
 * @param {String} redirectURL oauth2 redirect uri
 * @param {String} codeChallenge PKCE code challenge
 * @param {String} codeChallengeMethod PKCE code challenge method
 * @returns {String} oauth2 authorization code or null
 */
async function getAuthCode(redirectURL, codeChallenge, codeChallengeMethod) {
  try {
    const bodyFormData = `redirect_uri=${redirectURL}&scope=${idmAdminScope}&response_type=code&client_id=${adminClientId}&csrf=${storage.session.getCookieValue()}&decision=allow&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}`;
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    const response = await authorize(bodyFormData, config);
    if (response.status < 200 || response.status > 399) {
      printMessage('error getting auth code', 'error');
      printMessage(
        'likely cause: mismatched parameters with OAuth client config',
        'error'
      );
      return null;
    }
    const redirectLocationURL = response.request.res.responseUrl;
    const queryObject = url.parse(redirectLocationURL, true).query;
    if ('code' in queryObject) {
      return queryObject.code;
    }
    printMessage('auth code not found', 'error');
    return null;
  } catch (error) {
    printMessage(`error getting auth code - ${error.message}`, 'error');
    printMessage(error.response.data, 'error');
    return null;
  }
}

/**
 * Helper function to obtain oauth2 access token
 * @returns {String} empty string or null
 */
async function getAccessToken() {
  try {
    const verifier = encodeBase64Url(randomBytes(32));
    const challenge = encodeBase64Url(
      createHash('sha256').update(verifier).digest()
    );
    const challengeMethod = 'S256';
    const redirectURL = url.resolve(
      storage.session.getTenant(),
      redirectUrlTemplate
    );
    const authCode = await getAuthCode(redirectURL, challenge, challengeMethod);
    if (authCode == null) {
      printMessage('error getting auth code', 'error');
      return null;
    }
    let response = null;
    if (
      storage.session.getDeploymentType() === global.CLOUD_DEPLOYMENT_TYPE_KEY
    ) {
      const config = {
        auth: {
          username: adminClientId,
          password: adminClientPassword,
        },
      };
      const bodyFormData = `redirect_uri=${redirectURL}&grant_type=authorization_code&code=${authCode}&code_verifier=${verifier}`;
      response = await accessToken(bodyFormData, config);
    } else {
      const bodyFormData = `client_id=${adminClientId}&redirect_uri=${redirectURL}&grant_type=authorization_code&code=${authCode}&code_verifier=${verifier}`;
      response = await accessToken(bodyFormData);
    }
    if (response.status < 200 || response.status > 399) {
      printMessage(`access token call returned ${response.status}`, 'error');
      return null;
    }
    if ('access_token' in response.data) {
      storage.session.setBearerToken(response.data.access_token);
      return '';
    }
    printMessage("can't get access token", 'error');
    return null;
  } catch (e) {
    printMessage('error getting access token - ', 'error');
    return null;
  }
}

/**
 * Get tokens
 * @param {boolean} save true to save a connection profile upon successful authentication, false otherwise
 * @returns {boolean} true if tokens were successfully obtained, false otherwise
 */
export async function getTokens(save = false) {
  let credsFromParameters = true;
  // if username/password on cli are empty, try to read from connections.json
  if (
    storage.session.getUsername() == null &&
    storage.session.getPassword() == null
  ) {
    credsFromParameters = false;
    const conn = await getConnectionProfile();
    storage.session.setTenant(conn.tenant);
    storage.session.setUsername(conn.username);
    storage.session.setPassword(conn.password);
  }
  await authenticate();
  if (
    storage.session.getCookieValue() &&
    !storage.session.getBearerToken() &&
    (storage.session.getDeploymentType() === global.CLOUD_DEPLOYMENT_TYPE_KEY ||
      storage.session.getDeploymentType() ===
        global.FORGEOPS_DEPLOYMENT_TYPE_KEY)
  ) {
    await getAccessToken();
  }
  if (save && storage.session.getCookieValue() && credsFromParameters) {
    // valid cookie, which means valid username/password combo. Save it in connections.json
    saveConnectionProfile();
    return true;
  }
  if (!storage.session.getCookieValue()) {
    return false;
  }
  return true;
}
