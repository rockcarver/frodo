import util from 'util';
import storage from '../../storage/SessionStorage.js';

const realmPathTemplate = '/realms/%s';

/**
 * Get current realm path
 * @returns {string} a CREST-compliant realm path, e.g. /realms/root/realms/alpha
 */
export function getCurrentRealmPath() {
  let realm = storage.session.getRealm();
  if (realm.startsWith('/') && realm.length > 1) {
    realm = realm.substring(1);
  }
  let realmPath = util.format(realmPathTemplate, 'root');
  if (realm !== '/') {
    realmPath += util.format(realmPathTemplate, realm);
  }
  return realmPath;
}

/**
 * Get current realm name
 * @returns {string} name of the current name. /alpha -> alpha
 */
export function getCurrentRealmName() {
  const realm = storage.session.getRealm();
  const components = realm.split('/');
  let realmName = '/';
  if (components.length > 0) {
    realmName = components[components.length - 1];
  }
  return realmName;
}

/**
 * Get tenant base URL
 * @param {string} tenant tenant URL with path and query params
 * @returns {string} tenant base URL without path and query params
 */
export function getTenantURL(tenant) {
  const parsedUrl = new URL(tenant);
  return `${parsedUrl.protocol}//${parsedUrl.host}`;
}
