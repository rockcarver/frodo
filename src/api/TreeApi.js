import { getCurrentRealmPath } from './utils/ApiUtils.js';
import { generateAmApi } from './BaseApi.js';
import storage from '../storage/SessionStorage.js';

const nodeURLTemplate = ({ tenant, realm, nodeType, id }) =>
  `${tenant}/json${realm}/realm-config/authentication/authenticationtrees/nodes/${nodeType}/${id}`;
const queryAllNodesByTypeURLTemplate = ({ tenant, realm, nodeType }) =>
  `${tenant}/json${realm}/realm-config/authentication/authenticationtrees/nodes/${nodeType}?_queryFilter=true`;
const queryAllNodesURLTemplate = ({ tenant, realm }) =>
  `${tenant}/json${realm}/realm-config/authentication/authenticationtrees/nodes?_action=nextdescendents`;
const queryAllNodeTypesURLTemplate = ({ tenant, realm }) =>
  `${tenant}/json${realm}/realm-config/authentication/authenticationtrees/nodes?_action=getAllTypes`;
const treeByIdURLTemplate = ({ tenant, realm, id }) =>
  `${tenant}/json${realm}/realm-config/authentication/authenticationtrees/trees/${id}`;
const queryAllTreesURLTemplate = ({ tenant, realm }) =>
  `${tenant}/json${realm}/realm-config/authentication/authenticationtrees/trees?_queryFilter=true`;

const apiVersion = 'protocol=2.1,resource=1.0';
const getTreeApiConfig = () => {
  const configPath = getCurrentRealmPath();
  return {
    path: `${configPath}/authentication/authenticationtrees`,
    apiVersion,
  };
};

export async function getNodeTypes() {
  const urlString = queryAllNodeTypesURLTemplate({
    tenant: storage.session.getTenant(),
    realm: getCurrentRealmPath(),
  });
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
  const urlString = queryAllNodesURLTemplate({
    tenant: storage.session.getTenant(),
    realm: getCurrentRealmPath(),
  });
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
  const urlString = queryAllNodesByTypeURLTemplate({
    tenant: storage.session.getTenant(),
    realm: getCurrentRealmPath(),
    type: nodeType,
  });
  return generateAmApi(getTreeApiConfig()).get(urlString, {
    withCredentials: true,
  });
}

/**
 * Get node by uuid and type
 * @param {string} id node uuid
 * @param {string} nodeType node type
 * @returns {Promise} a promise that resolves to an object containing a node object
 */
export async function getNode(id, nodeType) {
  const urlString = nodeURLTemplate({
    tenant: storage.session.getTenant(),
    nodeType,
    realm: getCurrentRealmPath(storage.session.getRealm()),
    id,
  });

  return generateAmApi(getTreeApiConfig()).get(urlString, {
    withCredentials: true,
  });
}

/**
 * Put node by uuid and type
 * @param {string} id node uuid
 * @param {string} nodeType node type
 * @param {Object} data node object
 * @returns {Promise} a promise that resolves to an object containing a node object
 */
export async function putNode(id, nodeType, data) {
  const urlString = nodeURLTemplate({
    tenant: storage.session.getTenant(),
    nodeType,
    realm: getCurrentRealmPath(storage.session.getRealm()),
    id,
  });
  return generateAmApi(getTreeApiConfig()).put(urlString, data, {
    withCredentials: true,
  });
}

/**
 * Delete node by uuid and type
 * @param {string} id node uuid
 * @param {string} nodeType node type
 * @returns {Promise} a promise that resolves to an object containing a node object
 */
export async function deleteNode(id, nodeType) {
  const urlString = nodeURLTemplate({
    tenant: storage.session.getTenant(),
    nodeType,
    realm: getCurrentRealmPath(storage.session.getRealm()),
    id,
  });
  return generateAmApi(getTreeApiConfig()).delete(urlString, {
    withCredentials: true,
  });
}

/**
 * Get all trees
 * @returns {Promise} a promise that resolves to an object containing an array of tree objects
 */
export async function getTrees() {
  const urlString = queryAllTreesURLTemplate({
    tenant: storage.session.getTenant(),
    realm: getCurrentRealmPath(),
  });
  return generateAmApi(getTreeApiConfig()).get(urlString, {
    withCredentials: true,
  });
}

/**
 * Get tree by id/name
 * @param {string} id tree id/name
 * @returns {Promise} a promise that resolves to an object containing a tree object
 */
export async function getTree(id) {
  const urlString = treeByIdURLTemplate({
    realm: getCurrentRealmPath(),
    tenant: storage.session.getTenant(),
    id,
  });
  return generateAmApi(getTreeApiConfig()).get(urlString, {
    withCredentials: true,
  });
}

/**
 * Put tree by id/name
 * @param {string} id tree id/name
 * @param {Object} data tree object
 * @returns {Promise} a promise that resolves to an object containing a tree object
 */
export async function putTree(id, data) {
  const urlString = treeByIdURLTemplate({
    realm: getCurrentRealmPath(storage.session.getRealm()),
    tenant: storage.session.getTenant(),
    id,
  });
  return generateAmApi(getTreeApiConfig()).put(urlString, data, {
    withCredentials: true,
  });
}

/**
 * Delete tree by id/name
 * @param {string} id tree id/name
 * @returns {Promise} a promise that resolves to an object containing a tree object
 */
export async function deleteTree(id) {
  const urlString = treeByIdURLTemplate({
    realm: getCurrentRealmPath(),
    tenant: storage.session.getTenant(),
    id,
  });
  return generateAmApi(getTreeApiConfig()).delete(urlString, {
    withCredentials: true,
  });
}
