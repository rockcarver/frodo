import util from 'util';
import { getCurrentRealmPath } from './utils/ApiUtils.js';
import { generateAmApi } from './BaseApi.js';
import storage from '../storage/SessionStorage.js';

const nodeURLTemplate =
  '%s/json%s/realm-config/authentication/authenticationtrees/nodes/%s/%s';
const queryAllNodesByTypeURLTemplate =
  '%s/json%s/realm-config/authentication/authenticationtrees/nodes/%s?_queryFilter=true';
const queryAllNodesURLTemplate =
  '%s/json%s/realm-config/authentication/authenticationtrees/nodes?_action=nextdescendents';
const queryAllNodeTypesURLTemplate =
  '%s/json%s/realm-config/authentication/authenticationtrees/nodes?_action=getAllTypes';
const treeByIdURLTemplate =
  '%s/json%s/realm-config/authentication/authenticationtrees/trees/%s';
const queryAllTreesURLTemplate =
  '%s/json%s/realm-config/authentication/authenticationtrees/trees?_queryFilter=true';

const apiVersion = 'protocol=2.1,resource=1.0';
const getTreeApiConfig = () => {
  const configPath = getCurrentRealmPath();
  return {
    path: `${configPath}/authentication/authenticationtrees`,
    apiVersion,
  };
};

export async function getNodeTypes() {
  const urlString = util.format(
    queryAllNodeTypesURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath()
  );
  return generateAmApi(getTreeApiConfig()).post(
    urlString,
    {},
    {
      withCredentials: true,
      headers: { 'Accept-Encoding': 'gzip, deflate, br' },
    }
  );
}

/**
 * Get all nodes
 * @returns {Promise} a promise that resolves to an object containing an array of all node objects
 */
export async function getNodes() {
  const urlString = util.format(
    queryAllNodesURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath()
  );
  return generateAmApi(getTreeApiConfig()).post(
    urlString,
    {},
    {
      withCredentials: true,
      headers: { 'Accept-Encoding': 'gzip, deflate, br' },
    }
  );
}

/**
 * Get all nodes by type
 * @param {*} type node type
 * @returns {Promise} a promise that resolves to an object containing an array of node objects of the requested type
 */
export async function getNodesByType(type) {
  const urlString = util.format(
    queryAllNodesByTypeURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath(),
    type
  );
  return generateAmApi(getTreeApiConfig()).get(urlString, {
    withCredentials: true,
  });
}

/**
 * Get node by uuid and type
 * @param {String} id node uuid
 * @param {String} nodeType node type
 * @returns {Promise} a promise that resolves to an object containing a node object
 */
export async function getNode(id, nodeType) {
  const urlString = util.format(
    nodeURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath(storage.session.getRealm()),
    nodeType,
    id
  );
  return generateAmApi(getTreeApiConfig()).get(urlString, {
    withCredentials: true,
  });
}

/**
 * Put node by uuid and type
 * @param {String} id node uuid
 * @param {String} nodeType node type
 * @param {Object} data node object
 * @returns {Promise} a promise that resolves to an object containing a node object
 */
export async function putNode(id, nodeType, data) {
  const urlString = util.format(
    nodeURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath(storage.session.getRealm()),
    nodeType,
    id
  );
  return generateAmApi(getTreeApiConfig()).put(urlString, data, {
    withCredentials: true,
  });
}

/**
 * Delete node by uuid and type
 * @param {String} id node uuid
 * @param {String} nodeType node type
 * @returns {Promise} a promise that resolves to an object containing a node object
 */
export async function deleteNode(id, nodeType) {
  const urlString = util.format(
    nodeURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath(),
    nodeType,
    id
  );
  return generateAmApi(getTreeApiConfig()).delete(urlString, {
    withCredentials: true,
  });
}

/**
 * Get all trees
 * @returns {Promise} a promise that resolves to an object containing an array of tree objects
 */
export async function getTrees() {
  const urlString = util.format(
    queryAllTreesURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath()
  );
  return generateAmApi(getTreeApiConfig()).get(urlString, {
    withCredentials: true,
  });
}

// export async function getAllJourneyData() {
//   const urlString = util.format(
//     queryAllTreesURLTemplate,
//     storage.session.getTenant(),
//     getCurrentRealmPath()
//   );
//   const response = await generateAmApi(getTreeApiConfig())
//     .get(urlString, {
//       withCredentials: true,
//     })
//     .catch((error) => {
//       if (error.response) {
//         // The request was made and the server responded with a status code
//         // that falls out of the range of 2xx
//         printMessage(
//           `Error! The request was made and the server responded with a status code! - ${error.message}`,
//           'error'
//         );
//         printMessage(error.response.data, 'error');
//         printMessage(error.response.status, 'error');
//         printMessage(error.response.headers, 'error');
//       } else if (error.request) {
//         // The request was made but no response was received
//         // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
//         // http.ClientRequest in node.js
//         printMessage(
//           `Error! The request was made but no response was received! - ${error.message}`,
//           'error'
//         );
//         printMessage(error.request, 'error');
//       } else {
//         // Something happened in setting up the request that triggered an Error
//         printMessage(`Error setting up request - ${error.message}`, 'error');
//       }
//       printMessage(error.config, 'error');
//       return [];
//     });
//   return response.data.result;
// }

/**
 * Get tree by id/name
 * @param {String} id tree id/name
 * @returns {Promise} a promise that resolves to an object containing a tree object
 */
export async function getTree(id) {
  const urlString = util.format(
    treeByIdURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath(),
    id
  );
  return generateAmApi(getTreeApiConfig()).get(urlString, {
    withCredentials: true,
  });
}

/**
 * Put tree by id/name
 * @param {String} id tree id/name
 * @param {Object} data tree object
 * @returns {Promise} a promise that resolves to an object containing a tree object
 */
export async function putTree(id, data) {
  const urlString = util.format(
    treeByIdURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath(storage.session.getRealm()),
    id
  );
  return generateAmApi(getTreeApiConfig()).put(urlString, data, {
    withCredentials: true,
  });
}
