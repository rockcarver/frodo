import {
  listOAuth2Clients,
  getOAuth2Client,
  putOAuth2Client,
} from './OAuth2ClientApi.js';
import { getConfigEntity, putConfigEntity } from './IdmConfigApi.js';
import { isEqualJson, getRealmManagedUser } from './utils/ApiUtils.js';
import { getRealmManagedOrganization } from './OrganizationApi.js';
import { getOAuth2Provider } from './AmServiceApi.js';
import CLOUD_MANAGED_JSON from './templates/cloud/managed.json' assert { type: 'json' };
import OAUTH2_CLIENT from './templates/OAuth2ClientTemplate.json' assert { type: 'json' };
import ORG_MODEL_USER_ATTRIBUTES from './templates/OrgModelUserAttributesTemplate.json' assert { type: 'json' };
import GENERIC_EXTENSION_ATTRIBUTES from './templates/cloud/GenericExtensionAttributesTemplate.json' assert { type: 'json' };

const protectedClients = ['ui', 'idm-provisioning'];
const protectedSubjects = ['amadmin'];

const privilegedScopes = [
  'am-introspect-all-tokens',
  'fr:idm:*',
  'fr:idc:esv:*',
];
// const privilegedUsers = ['openidm-admin'];
const privilegedRoles = [
  'internal/role/openidm-authorized',
  'internal/role/openidm-admin',
];

const adminScopes = ['fr:idm:*', 'fr:idc:esv:*'];
const adminRoles = [
  'internal/role/openidm-authorized',
  'internal/role/openidm-admin',
];

/*
 * List all oauth2 clients, which have a corresponding staticUserMapping
 * in the IDM authentication.json:
  {
    "_id": "authentication",
    "rsFilter": {
      ...
      "staticUserMapping": [
        {
          "subject": "someOauth2ClientID",
          "localUser": "internal/user/openidm-admin",
          "userRoles": "authzRoles/*",
          "roles": [
            "internal/role/openidm-authorized",
            "internal/role/openidm-admin"
          ]
        },
        {
          "subject": "RCSClient",
          "localUser": "internal/user/idm-provisioning"
        }
      ]
    }
  }
 */
export async function listOAuth2CustomClients() {
  let clients = await listOAuth2Clients();
  clients = clients
    .map((client) => client._id)
    .filter((client) => !protectedClients.includes(client));
  const authentication = await getConfigEntity('authentication');
  const subjects = authentication.rsFilter.staticUserMapping
    .map((mapping) => mapping.subject)
    .filter((subject) => !protectedSubjects.includes(subject));
  const adminClients = subjects.filter((subject) => clients.includes(subject));
  return adminClients;
}

/*
 * List all oauth2 clients, which have the fr:idm:* scope and a 
 * corresponding staticUserMapping in the IDM authentication.json
 * and are assigned admin privileges:
  {
    "_id": "authentication",
    "rsFilter": {
      ...
      "staticUserMapping": [
        {
          "subject": "someOauth2ClientID",
          "localUser": "internal/user/openidm-admin",
          "userRoles": "authzRoles/*",
          "roles": [
            "internal/role/openidm-authorized",
            "internal/role/openidm-admin"
          ]
        }
      ]
    }
  }
 */
export async function listOAuth2AdminClients() {
  let clients = await listOAuth2Clients();
  clients = clients
    .filter((client) => {
      let isPrivileged = false;
      if (client.coreOAuth2ClientConfig.scopes) {
        client.coreOAuth2ClientConfig.scopes.forEach((scope) => {
          if (privilegedScopes.includes(scope)) {
            isPrivileged = true;
          }
        });
      }
      return isPrivileged;
    })
    .map((client) => client._id)
    .filter((client) => !protectedClients.includes(client));
  const authentication = await getConfigEntity('authentication');
  const subjects = authentication.rsFilter.staticUserMapping
    .filter((mapping) => {
      let isPrivileged = false;
      if (mapping.roles) {
        mapping.roles.forEach((role) => {
          if (privilegedRoles.includes(role)) {
            isPrivileged = true;
          }
        });
      }
      return isPrivileged;
    })
    .map((mapping) => mapping.subject)
    .filter((subject) => !protectedSubjects.includes(subject));
  const adminClients = subjects.filter((subject) => clients.includes(subject));
  return adminClients;
}

async function getDynamicClientRegistrationScope() {
  const provider = await getOAuth2Provider();
  return provider.clientDynamicRegistrationConfig
    .dynamicClientRegistrationScope;
}

async function addAdminScopes(name) {
  const allAdminScopes = adminScopes.concat([
    await getDynamicClientRegistrationScope(),
  ]);
  const client = await getOAuth2Client(name);
  if (!client) {
    return;
  }
  let addScopes = [];
  if (
    client.coreOAuth2ClientConfig.scopes &&
    client.coreOAuth2ClientConfig.scopes.value
  ) {
    addScopes = allAdminScopes.filter((scope) => {
      let add = false;
      if (!client.coreOAuth2ClientConfig.scopes.value.includes(scope)) {
        add = true;
      }
      return add;
    });
    client.coreOAuth2ClientConfig.scopes.value =
      client.coreOAuth2ClientConfig.scopes.value.concat(addScopes);
  } else {
    client.coreOAuth2ClientConfig.scopes.value = addScopes;
  }
  client.coreOAuth2ClientConfig.scopes.inherited = false;
  if (addScopes.length > 0) {
    console.log(`Adding admin scopes to client "${name}"...`);
    await putOAuth2Client(name, client);
  } else {
    console.log(`Client "${name}" already has admin scopes.`);
  }
}

async function addClientCredentialsGrantType(name) {
  const client = await getOAuth2Client(name);
  if (!client) {
    return;
  }
  let modified = false;
  if (
    client.advancedOAuth2ClientConfig.grantTypes &&
    client.advancedOAuth2ClientConfig.grantTypes.value
  ) {
    if (
      !client.advancedOAuth2ClientConfig.grantTypes.value.includes(
        'client_credentials'
      )
    ) {
      modified = true;
      client.advancedOAuth2ClientConfig.grantTypes.value.push(
        'client_credentials'
      );
    }
  } else {
    client.advancedOAuth2ClientConfig.grantTypes.value = ['client_credentials'];
  }
  client.advancedOAuth2ClientConfig.grantTypes.inherited = false;
  if (modified) {
    console.log(`Adding client credentials grant type to client "${name}"...`);
    await putOAuth2Client(name, client);
  } else {
    console.log(`Client "${name}" already has client credentials grant type.`);
  }
}

async function addAdminStaticUserMapping(name) {
  const authentication = await getConfigEntity('authentication');
  let needsAdminMapping = true;
  let addRoles = [];
  const mappings = authentication.rsFilter.staticUserMapping.map((mapping) => {
    // ignore mappings for other subjects
    if (mapping.subject !== name) {
      return mapping;
    }
    needsAdminMapping = false;
    addRoles = adminRoles.filter((role) => {
      let add = false;
      if (!mapping.roles.includes(role)) {
        add = true;
      }
      return add;
    });
    const newMapping = mapping;
    newMapping.roles = newMapping.roles.concat(addRoles);
    return newMapping;
  });
  if (needsAdminMapping) {
    console.log(`Creating static user mapping for client "${name}"...`);
    mappings.push({
      subject: name,
      localUser: 'internal/user/openidm-admin',
      userRoles: 'authzRoles/*',
      roles: [
        'internal/role/openidm-authorized',
        'internal/role/openidm-admin',
      ],
    });
  }
  authentication.rsFilter.staticUserMapping = mappings;
  if (addRoles.length > 0 || needsAdminMapping) {
    console.log(
      `Adding admin roles to static user mapping for client "${name}"...`
    );
    await putConfigEntity('authentication', authentication);
  } else {
    console.log(
      `Static user mapping for client "${name}" already has admin roles.`
    );
  }
}

export async function grantOAuth2ClientAdminPrivileges(name) {
  await addAdminScopes(name);
  await addClientCredentialsGrantType(name);
  await addAdminStaticUserMapping(name);
}

async function removeAdminScopes(name) {
  const allAdminScopes = adminScopes.concat([
    await getDynamicClientRegistrationScope(),
  ]);
  const client = await getOAuth2Client(name);
  if (!client) {
    return;
  }
  let finalScopes = [];
  if (
    client.coreOAuth2ClientConfig.scopes &&
    client.coreOAuth2ClientConfig.scopes.value
  ) {
    finalScopes = client.coreOAuth2ClientConfig.scopes.value.filter(
      (scope) => !allAdminScopes.includes(scope)
    );
  }
  if (client.coreOAuth2ClientConfig.scopes.value.length > finalScopes.length) {
    console.log(`Removing admin scopes from client "${name}"...`);
    client.coreOAuth2ClientConfig.scopes.value = finalScopes;
    await putOAuth2Client(name, client);
  } else {
    console.log(`Client "${name}" has no admin scopes.`);
  }
}

async function removeClientCredentialsGrantType(name) {
  const client = await getOAuth2Client(name);
  let modified = false;
  if (!client) {
    return;
  }
  let finalGrantTypes = [];
  if (
    client.advancedOAuth2ClientConfig.grantTypes &&
    client.advancedOAuth2ClientConfig.grantTypes.value
  ) {
    finalGrantTypes = client.advancedOAuth2ClientConfig.grantTypes.value.filter(
      (grantType) => grantType !== 'client_credentials'
    );
    modified =
      client.advancedOAuth2ClientConfig.grantTypes.value.length >
      finalGrantTypes.length;
  }
  if (modified) {
    console.log(
      `Removing client credentials grant type from client "${name}"...`
    );
    client.advancedOAuth2ClientConfig.grantTypes.value = finalGrantTypes;
    await putOAuth2Client(name, client);
  } else {
    console.log(
      `Client "${name}" does not allow client credentials grant type.`
    );
  }
}

async function removeAdminStaticUserMapping(name) {
  const authentication = await getConfigEntity('authentication');
  let finalRoles = [];
  let removeMapping = false;
  let modified = false;
  const mappings = authentication.rsFilter.staticUserMapping
    .map((mapping) => {
      // ignore mappings for other subjects
      if (mapping.subject !== name) {
        return mapping;
      }
      finalRoles = mapping.roles.filter((role) => !adminRoles.includes(role));
      const newMapping = mapping;
      removeMapping = finalRoles.length === 0; // if there are no more roles left on this mapping, flag it for removal
      modified = mapping.roles.length > finalRoles.length; // if there were roles removed, set modified flag
      newMapping.roles = finalRoles;
      return newMapping;
    })
    .filter((mapping) => mapping.subject !== name || !removeMapping);
  authentication.rsFilter.staticUserMapping = mappings;
  if (modified || removeMapping) {
    if (removeMapping) {
      console.log(`Removing static user mapping for client "${name}"...`);
    } else {
      console.log(
        `Removing admin roles from static user mapping for client "${name}"...`
      );
    }
    await putConfigEntity('authentication', authentication);
  } else {
    console.log(`Static user mapping for client "${name}" has no admin roles.`);
  }
}

export async function revokeOAuth2ClientAdminPrivileges(name) {
  await removeAdminScopes(name);
  await removeClientCredentialsGrantType(name);
  await removeAdminStaticUserMapping(name);
}

export async function createOAuth2ClientWithAdminPrivileges(name, password) {
  const client = OAUTH2_CLIENT;
  client.coreOAuth2ClientConfig.scopes = adminScopes;
  client.userpassword = password;
  await putOAuth2Client(name, client);
  await addAdminScopes(name);
  await addAdminStaticUserMapping(name);
}

export async function hideGenericExtensionAttributes(
  includeCustomized,
  dryRun
) {
  const managed = await getConfigEntity('managed');
  const propertyNames = Object.keys(GENERIC_EXTENSION_ATTRIBUTES);
  const updatedObjects = managed.objects.map((object) => {
    // ignore all other objects
    if (object.name !== getRealmManagedUser()) {
      return object;
    }
    propertyNames.forEach((name) => {
      if (
        isEqualJson(
          GENERIC_EXTENSION_ATTRIBUTES[name],
          object.schema.properties[name],
          ['viewable', 'usageDescription']
        ) ||
        includeCustomized
      ) {
        if (object.schema.properties[name].viewable) {
          console.log(`${name}: hide`);
          // eslint-disable-next-line no-param-reassign
          object.schema.properties[name].viewable = false;
        } else {
          console.log(`${name}: ignore (already hidden)`);
        }
      } else {
        console.log(`${name}: skip (customized)`);
      }
    });
    return object;
  });
  managed.objects = updatedObjects;
  if (dryRun) {
    console.log('Dry-run only. Changes are not saved.');
  } else {
    await putConfigEntity('managed', managed);
  }
}

export async function showGenericExtensionAttributes(
  includeCustomized,
  dryRun
) {
  const managed = await getConfigEntity('managed');
  const propertyNames = Object.keys(GENERIC_EXTENSION_ATTRIBUTES);
  const updatedObjects = managed.objects.map((object) => {
    // ignore all other objects
    if (object.name !== getRealmManagedUser()) {
      return object;
    }
    propertyNames.forEach((name) => {
      if (
        isEqualJson(
          GENERIC_EXTENSION_ATTRIBUTES[name],
          object.schema.properties[name],
          ['viewable', 'usageDescription']
        ) ||
        includeCustomized
      ) {
        if (!object.schema.properties[name].viewable) {
          console.log(`${name}: show`);
          // eslint-disable-next-line no-param-reassign
          object.schema.properties[name].viewable = true;
        } else {
          console.log(`${name}: ignore (already showing)`);
        }
      } else {
        console.log(`${name}: skip (customized)`);
      }
    });
    return object;
  });
  managed.objects = updatedObjects;
  if (dryRun) {
    console.log('Dry-run only. Changes are not saved.');
  } else {
    await putConfigEntity('managed', managed);
  }
}

async function repairOrgModelUser(dryRun) {
  const managed = await getConfigEntity('managed');
  const RDVPs = ['memberOfOrgIDs'];
  let repairData = false;
  const updatedObjects = managed.objects.map((object) => {
    // ignore all other objects
    if (object.name !== getRealmManagedUser()) {
      return object;
    }
    console.log(`${object.name}: checking...`);
    RDVPs.forEach((name) => {
      if (!object.schema.properties[name].queryConfig.flattenProperties) {
        console.log(`- ${name}: repairing - needs flattening`);
        // eslint-disable-next-line no-param-reassign
        object.schema.properties[name].queryConfig.flattenProperties = true;
        repairData = true;
      } else {
        console.log(`- ${name}: OK`);
      }
    });
    return object;
  });
  managed.objects = updatedObjects;
  if (!dryRun) {
    await putConfigEntity('managed', managed);
  }
  return repairData;
}

async function repairOrgModelOrg(dryRun) {
  const managed = await getConfigEntity('managed');
  const RDVPs = [
    'adminIDs',
    'ownerIDs',
    'parentAdminIDs',
    'parentOwnerIDs',
    'parentIDs',
  ];
  let repairData = false;
  const updatedObjects = managed.objects.map((object) => {
    // ignore all other objects
    if (object.name !== getRealmManagedOrganization()) {
      return object;
    }
    console.log(`${object.name}: checking...`);
    RDVPs.forEach((name) => {
      if (!object.schema.properties[name].queryConfig.flattenProperties) {
        console.log(`- ${name}: repairing - needs flattening`);
        // eslint-disable-next-line no-param-reassign
        object.schema.properties[name].queryConfig.flattenProperties = true;
        repairData = true;
      } else {
        console.log(`- ${name}: OK`);
      }
    });
    return object;
  });
  managed.objects = updatedObjects;
  if (!dryRun) {
    await putConfigEntity('managed', managed);
  }
  return repairData;
}

async function repairOrgModelData(dryRun) {
  const rootOrgs = await findRootOrganizations();
}

async function extendOrgModelPermissins(dryRun) {}

export async function repairOrgModel(
  excludeCustomized,
  extendPermissions,
  dryRun
) {
  let repairData = false;
  repairData = repairData || (await repairOrgModelUser(dryRun));
  repairData = repairData || (await repairOrgModelOrg(dryRun));
  if (repairData) {
    await repairOrgModelData(dryRun);
  }
  if (extendPermissions) {
    await extendOrgModelPermissins(dryRun);
  }
  if (dryRun) {
    console.log('Dry-run only. Changes are not saved.');
  }
}

// suggested by John K.
export async function removeRealmNameFromManagedObjectLabels() {}

export async function addRealmNameToManagedObjectLabels() {}

// suggested by John K.
export async function cleanUpPostmanArtifacts() {}

// suggested by John K.
export async function createSampleThemes() {}
