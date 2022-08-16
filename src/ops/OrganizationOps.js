import { queryAllManagedObjectsByType } from '../api/IdmConfigApi.js';
import storage from '../storage/SessionStorage.js';
import { printMessage } from './utils/Console.js';

/**
 * Get organization managed object type
 * @returns {string} organization managed object type in this realm
 */
export function getRealmManagedOrganization() {
  let realmManagedOrg = 'organization';
  if (
    storage.session.getDeploymentType() === global.CLOUD_DEPLOYMENT_TYPE_KEY
  ) {
    realmManagedOrg = `${storage.session.getRealm()}_organization`;
  }
  return realmManagedOrg;
}

/**
 * Get organizations
 * @returns {Promise} promise resolving to an object containing an array of organization objects
 */
export async function getOrganizations() {
  const orgs = [];
  let result = {
    result: [],
    resultCount: 0,
    pagedResultsCookie: null,
    totalPagedResultsPolicy: 'NONE',
    totalPagedResults: -1,
    remainingPagedResults: -1,
  };
  try {
    do {
      // eslint-disable-next-line no-await-in-loop
      result = await queryAllManagedObjectsByType(
        getRealmManagedOrganization(),
        ['name', 'parent/*/name', 'children/*/name'],
        result.pagedResultsCookie
      ).catch((queryAllManagedObjectsByTypeError) => {
        printMessage(queryAllManagedObjectsByTypeError, 'error');
        printMessage(
          `Error querying ${getRealmManagedOrganization()} objects: ${queryAllManagedObjectsByTypeError}`,
          'error'
        );
      });
      orgs.concat(result.result);
      printMessage('.', 'text', false);
    } while (result.pagedResultsCookie);
  } catch (error) {
    printMessage(error.response.data, 'error');
    printMessage(`Error retrieving all organizations: ${error}`, 'error');
  }
  return orgs;
}

// unfinished work
export async function listOrganizationsTopDown() {
  const orgs = [];
  let result = {
    result: [],
    resultCount: 0,
    pagedResultsCookie: null,
    totalPagedResultsPolicy: 'NONE',
    totalPagedResults: -1,
    remainingPagedResults: -1,
  };
  do {
    // eslint-disable-next-line no-await-in-loop
    result = await queryAllManagedObjectsByType(
      getRealmManagedOrganization(),
      ['name', 'parent/*/name', 'children/*/name'],
      result.pagedResultsCookie
    ).catch((queryAllManagedObjectsByTypeError) => {
      printMessage(queryAllManagedObjectsByTypeError, 'error');
      printMessage(
        `Error querying ${getRealmManagedOrganization()} objects: ${queryAllManagedObjectsByTypeError}`,
        'error'
      );
    });
    orgs.concat(result.result);
    printMessage('.', 'text', false);
  } while (result.pagedResultsCookie);
  return orgs;
}
