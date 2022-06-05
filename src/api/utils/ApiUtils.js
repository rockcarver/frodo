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
 * Get tenant base URL
 * @param {String} tenant tenant URL with path and query params
 * @returns {String} tenant base URL without path and query params
 */
export function getTenantURL(tenant) {
  const parsedUrl = new URL(tenant);
  return `${parsedUrl.protocol}//${parsedUrl.host}`;
}
