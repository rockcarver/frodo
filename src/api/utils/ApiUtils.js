import util from 'util';
import storage from '../../storage/SessionStorage.js';

const realmPathTemplate = '/realms/%s';

/**
 * Get current realm path
 * @returns {String} a CREST-compliant realm path, e.g. /realms/root/realms/alpha
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
 * @returns {String} name of the current realm. /alpha -> alpha
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
 * Get current realm name
 * @param {String} realm realm
 * @returns {String} name of the realm. /alpha -> alpha
 */
export function getRealmName(realm) {
  const components = realm.split('/');
  let realmName = '/';
  if (components.length > 0) {
    realmName = components[components.length - 1];
  }
  return realmName;
}

/**
 * Get tenant base URL
 * @param {String} tenant tenant URL with path and query params
 * @returns {String} tenant base URL without path and query params
 */
export function getTenantURL(tenant) {
  const parsedUrl = new URL(tenant);
  return `${parsedUrl.protocol}//${parsedUrl.host}`;
}
