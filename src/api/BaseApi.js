import axios from 'axios';
import axiosRetry from 'axios-retry';
import storage from '../storage/SessionStorage.js';
import { getTenantURL } from './utils/ApiUtils.js';
axiosRetry(axios, {
    retries: 3,
    shouldResetTimeout: true,
    //retryCondition: (_error) => true // retry no matter what
});

export const timeout = 20000;
export const amApiVersion = "resource=1.0";

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
        "Cookie": `${storage.session.raw.cookieName}=${storage.session.raw.cookieValue}`
    };
    if (requestOverride.headers) {
        headers = {
            ...headers,
            ...requestOverride.headers,
        };
    }

    const requestDetails = {
        baseURL: `${storage.session.getTenant()}/json${resource.path}`,
        timeout: timeout,
        ...requestOverride,
        headers,
    };

    const request = axios.create(requestDetails);

    // console.log("generateAmApi: " + requestDetails.baseURL);

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
        timeout: timeout,
        headers: {},
        ...requestOverride,
    };

    if (storage.session.getBearerToken()) {
        requestDetails.headers.Authorization = `Bearer ${storage.session.getBearerToken()}`;
    }

    const request = axios.create(requestDetails);

    // console.log("generateIdmApi: " + requestDetails.baseURL);

    return request;
}