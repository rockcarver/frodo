import util from 'util';
import { generateIdmApi } from './BaseApi.js';
import { getTenantURL } from './utils/ApiUtils.js';
import { queryManagedObjects } from './IdmConfigApi.js';
import storage from '../storage/SessionStorage.js';

const organizationURLTemplate = '%s/openidm/managed/%s/%s';
const organizationQueryTemplate = '%s/openidm/managed/%s?_queryId=query-all';
const organizationHierarchyQueryTemplate =
  '%s/openidm/managed/%s?_queryId=query-all&_fields=name,parent/*/name,children/*/name';
// const organizationRootsQueryTemplate =
// '%s/openidm/managed/%s?_queryFilter=!(parent/*/_ref+pr)&_fields=name,children/*/name';

export function getRealmManagedOrganization() {
  let realmManagedOrg = 'organization';
  if (
    storage.session.getDeploymentType() === global.CLOUD_DEPLOYMENT_TYPE_KEY
  ) {
    realmManagedOrg = `${storage.session.getRealm()}_organization`;
  }
  return realmManagedOrg;
}

export async function listOrganizations() {
  try {
    const urlString = util.format(
      organizationQueryTemplate,
      getTenantURL(storage.session.getTenant()),
      getRealmManagedOrganization()
    );
    const response = await generateIdmApi().get(urlString);
    if (response.status < 200 || response.status > 399) {
      console.error(
        'listOrganizations ERROR: list organizations data call returned %d',
        response.status
      );
      return [];
    }
    return response.data.result;
  } catch (e) {
    console.error(
      'listOrganizations ERROR: list organizations data error - ',
      e.message
    );
    return [];
  }
}

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
    result = await queryManagedObjects(
      getRealmManagedOrganization(),
      ['name', 'parent/*/name', 'children/*/name'],
      result.pagedResultsCookie
    );
    orgs.concat(result.result);
    process.stdout.write('.');
  } while (result.pagedResultsCookie);
  return orgs;
}

export async function getOrganization(id) {
  try {
    const urlString = util.format(
      organizationURLTemplate,
      getTenantURL(storage.session.getTenant()),
      getRealmManagedOrganization(),
      id
    );
    const response = await generateIdmApi().get(urlString);
    if (response.status < 200 || response.status > 399) {
      console.error(
        'getOrganization ERROR: get organization data call returned %d',
        response.status
      );
      return [];
    }
    return response.data;
  } catch (e) {
    console.error(
      'getOrganization ERROR: get organization data error - ',
      e.message
    );
    return [];
  }
}

export async function putOrganization(id, data) {
  try {
    const urlString = util.format(
      organizationURLTemplate,
      getTenantURL(storage.session.getTenant()),
      getRealmManagedOrganization(),
      id
    );
    const response = await generateIdmApi().put(urlString, data);
    if (response.status < 200 || response.status > 399) {
      console.error(
        `putOrganization ERROR: put organization call returned ${response.status}, details: ${response}`
      );
      return null;
    }
    return response.data;
  } catch (e) {
    console.error(`putOrganization ERROR: organization ${id} - ${e.message}`);
    return null;
  }
}
