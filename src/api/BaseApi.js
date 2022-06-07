import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as https from 'https';
import storage from '../storage/SessionStorage.js';
import { getTenantURL } from './utils/ApiUtils.js';

axiosRetry(axios, {
  retries: 3,
  shouldResetTimeout: true,
  // retryCondition: (_error) => true // retry no matter what
});

export const timeout = 30000;
export const amApiVersion = 'resource=1.0';

/**
 * Generates an AM Axios API instance
 * @param {object} resource Takes an object takes a resource object. example:
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either
 * add on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateAmApi(resource, requestOverride = {}) {
  let headers = {
    'Content-type': 'application/json',
    'accept-api-version': resource.apiVersion,
    Cookie: `${storage.session.raw.cookieName}=${storage.session.raw.cookieValue}`,
  };
  if (requestOverride.headers) {
    headers = {
      ...headers,
      ...requestOverride.headers,
    };
  }

  const requestDetails = {
    baseURL: `${storage.session.getTenant()}/json${resource.path}`,
    timeout,
    ...requestOverride,
    headers,
    httpsAgent: new https.Agent({
      rejectUnauthorized: !storage.session.getAllowInsecureConnection(),
    }),
  };

  const request = axios.create(requestDetails);

  return request;
}

/**
 * Generates an OAuth2 Axios API instance
 * @param {object} resource Takes an object takes a resource object. example:
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either
 * add on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateOauth2Api(resource, requestOverride = {}) {
  let headers = {
    'accept-api-version': resource.apiVersion,
    Cookie: `${storage.session.raw.cookieName}=${storage.session.raw.cookieValue}`,
  };
  if (requestOverride.headers) {
    headers = {
      ...headers,
      ...requestOverride.headers,
    };
  }

  const requestDetails = {
    baseURL: `${storage.session.getTenant()}/json${resource.path}`,
    timeout,
    ...requestOverride,
    headers,
    httpsAgent: new https.Agent({
      rejectUnauthorized: !storage.session.getAllowInsecureConnection(),
    }),
  };

  const request = axios.create(requestDetails);

  return request;
}

/**
 * Generates an IDM Axios API instance
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
 * on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateIdmApi(requestOverride = {}) {
  const requestDetails = {
    baseURL: getTenantURL(storage.session.getTenant()),
    timeout,
    headers: {},
    ...requestOverride,
    httpsAgent: new https.Agent({
      rejectUnauthorized: !storage.session.getAllowInsecureConnection(),
    }),
  };

  if (storage.session.getBearerToken()) {
    requestDetails.headers.Authorization = `Bearer ${storage.session.getBearerToken()}`;
  }

  const request = axios.create(requestDetails);

  return request;
}

/**
 * Generates a LogKeys API Axios instance
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
 * on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateLogKeysApi(requestOverride = {}) {
  const headers = {
    'Content-type': 'application/json',
  };
  const requestDetails = {
    baseURL: getTenantURL(storage.session.getTenant()),
    timeout,
    headers,
    ...requestOverride,
    httpsAgent: new https.Agent({
      rejectUnauthorized: !storage.session.getAllowInsecureConnection(),
    }),
  };

  if (storage.session.getBearerToken()) {
    requestDetails.headers.Authorization = `Bearer ${storage.session.getBearerToken()}`;
  }

  const request = axios.create(requestDetails);

  return request;
}

/**
 * Generates a Log API Axios instance
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
 * on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateLogApi(requestOverride = {}) {
  const headers = {
    'x-api-key': storage.session.getLogApiKey(),
    'x-api-secret': storage.session.getLogApiSecret(),
  };
  const requestDetails = {
    baseURL: getTenantURL(storage.session.getTenant()),
    timeout,
    headers,
    ...requestOverride,
    httpsAgent: new https.Agent({
      rejectUnauthorized: !storage.session.getAllowInsecureConnection(),
    }),
  };

  const request = axios.create(requestDetails);

  return request;
}

/**
 * Generates an ESV Axios API instance for Environment Secrets and Variables
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
 * on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateESVApi(resource, requestOverride = {}) {
  const headers = {
    'Content-type': 'application/json',
    'accept-api-version': resource.apiVersion,
  };
  const requestDetails = {
    baseURL: getTenantURL(storage.session.getTenant()),
    timeout,
    headers,
    ...requestOverride,
    httpsAgent: new https.Agent({
      rejectUnauthorized: !storage.session.getAllowInsecureConnection(),
    }),
  };

  if (storage.session.getBearerToken()) {
    requestDetails.headers.Authorization = `Bearer ${storage.session.getBearerToken()}`;
  }

  const request = axios.create(requestDetails);

  return request;
}
