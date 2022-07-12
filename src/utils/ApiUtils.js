import util from 'util';
import storage from '../../storage/SessionStorage.js';
import * as global from '../../storage/StaticStorage.js';

const realmPathTemplate = '/realms/%s';

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

export function getTenantURL(tenant) {
  const parsedUrl = new URL(tenant);
  return `${parsedUrl.protocol}//${parsedUrl.host}`;
}

export function applyNameCollisionPolicy(name) {
  const capturingRegex = /(.* - imported) \(([0-9]+)\)/;
  const found = name.match(capturingRegex);
  if (found && found.length > 0 && found.length === 3) {
    // already renamed one or more times
    // return the next number
    return `${found[1]} (${parseInt(found[2], 10) + 1})`;
  }
  // first time
  return `${name} - imported (1)`;
}

export function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

export function getRealmManagedUser() {
  let realmManagedUser = 'user';
  if (
    storage.session.getDeploymentType() === global.CLOUD_DEPLOYMENT_TYPE_KEY
  ) {
    realmManagedUser = `${storage.session.getRealm()}_user`;
  }
  return realmManagedUser;
}

// return true if the two json objects have the same length and all the properties have the same value
export function isEqualJson(obj1, obj2, ignoreKeys = []) {
  const obj1Keys = Object.keys(obj1).filter((key) => !ignoreKeys.includes(key));
  const obj2Keys = Object.keys(obj2).filter((key) => !ignoreKeys.includes(key));

  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }

  for (const objKey of obj1Keys) {
    if (obj1[objKey] !== obj2[objKey]) {
      if (
        typeof obj1[objKey] === 'object' &&
        typeof obj2[objKey] === 'object'
      ) {
        if (!isEqualJson(obj1[objKey], obj2[objKey], ignoreKeys)) {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  return true;
}
