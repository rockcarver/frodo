import * as global from '../../storage/constants.js';

/**
 * Resolve the relative path to a given realm, formatting the provided string
 * @param {{ state: { realm: string } }} config
 * @returns {string} formatted tenantURL
 * @example ```js
 * state.realm = 'openam-frodo.example.com/am/XUI/?realm=/alpha'
 * formatCurrentRealmPath({ state }); // https://openam-frodo.example.com
 * ```
 */
export const formatCurrentRealmPath = ({ state: { realm } }) => {
  /**
   * @param {string} realm
   */
  const realmPathTemplate = (realm) => `/realms/${realm}`;
  if (realm.startsWith('/') && realm.length > 1) {
    realm = realm.substring(1);
  }
  if (realm !== '/') {
    return realmPathTemplate(realm);
  }
  return realmPathTemplate('root');
};

/**
 * Given a tenant, the protocol will be appended removing any path
 * @param {{ state: { tenant: string } }} config
 * @returns {string} formatted tenantURL
 * @example ```js
 * state.tenant = 'openam-frodo.example.com/am
 * formatTenantURL({ state }); // https://openam-frodo.example.com
 * ```
 */
export const formatTenantURL = ({ state: { tenant } }) => {
  const parsedUrl = new URL(tenant);
  return `${parsedUrl.protocol}//${parsedUrl.tenant}`;
};

/**
 * Applies naming collision policy to prevent duplicates
 * @param {string} name A name to check
 * @returns {string} The reportable string
 */
export const applyNameCollisionPolicy = (name) => {
  const capturingRegex = /(.* - imported) \(([0-9]+)\)/;
  const found = name.match(capturingRegex);
  if (found && found.length > 0 && found.length === 3) {
    // already renamed one or more times
    // return the next number
    return `${found[1]} (${parseInt(found[2], 10) + 1})`;
  }
  // first time
  return `${name} - imported (1)`;
};

/**
 * Escape regex special chars for compatibility
 * @param {string} str A regex pattern string to escape
 * @returns {string} The escaped regex string
 */
export const escapeRegExp = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

/**
 * format the user object name by deployment type
 * @param {{ state: { deploymentType: string, realm: string } }} config
 * @returns {string} user object name
 */
export const getRealmManagedUser = ({ state: { deploymentType, realm } }) =>
  deploymentType === global.CLOUD_DEPLOYMENT_TYPE_KEY
    ? `${realm}_user`
    : 'user';
/**
 * check if the two JSON objects have the same length and all the properties have the same value
 * @param {Object | Array<any>} object1 compare
 * @param {Object | Array<any>} object2 compare
 * @param {Array<any>} ignoreKeys keys to discount when comparing
 * @returns {boolean} true if two objects are the same
 * @example ```js
 * isEqualJSON(); // false
 * isEqualJSON({}); // false
 * isEqualJSON({}, {}); // true
 * isEqualJSON({}, {}, ['']); // true
 * isEqualJSON({foo: 'bar'}, {foo: 'bar'}, ['']); //
 * isEqualJSON({foo: 'bar'}, {foo: 'bar'}, ['foo']); // true
 * isEqualJSON({foo: 'bar' baz: 'thunder'}, {foo: 'bar'}, ['foo']); // false
 * isEqualJSON({foo: 'bar' baz: 'thunder'}, {foo: 'bar'}, ['baz']); // true
 * ```
 */
export const isEqualJson = (
  object1 = false,
  object2 = true,
  ignoreKeys = []
) => {
  return (
    JSON.stringify(object1, (key, value) => {
      if (!ignoreKeys.includes(key)) {
        return value;
      }
    }) ===
    JSON.stringify(object2, (key, value) => {
      if (!ignoreKeys.includes(key)) {
        return value;
      }
    })
  );
};
