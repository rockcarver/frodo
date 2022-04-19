import {
  listOAuth2Clients,
  getOAuth2Client,
  putOAuth2Client,
} from './OAuth2ClientApi.js';
import { getConfigEntity, putConfigEntity } from './IdmConfigApi.js';
import { isEqualJson, getRealmManagedUser } from './utils/ApiUtils.js';
import { getRealmManagedOrganization } from './OrganizationApi.js';
import { getOAuth2Provider } from './AmServiceApi.js';
import { createSecret } from './SecretsApi.js';
import { clientCredentialsGrant } from './OAuth2OIDCApi.js';
import CLOUD_MANAGED_JSON from './templates/cloud/managed.json' assert { type: 'json' };
import OAUTH2_CLIENT from './templates/OAuth2ClientTemplate.json' assert { type: 'json' };
import ORG_MODEL_USER_ATTRIBUTES from './templates/OrgModelUserAttributesTemplate.json' assert { type: 'json' };
import GENERIC_EXTENSION_ATTRIBUTES from './templates/cloud/GenericExtensionAttributesTemplate.json' assert { type: 'json' };
import { printMessage } from './utils/Console.js';

const protectedClients = ['ui', 'idm-provisioning'];
const protectedSubjects = ['amadmin', 'autoid-resource-server'];

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
const adminDefaultScopes = ['fr:idm:*'];
const adminRoles = [
  'internal/role/openidm-authorized',
  'internal/role/openidm-admin',
];
const autoIdRoles = [
  'internal/role/platform-provisioning',
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

/*
 * List all static user mappings that are not oauth2 clients in authentication.json
 * and are assigned admin privileges:
  {
    "_id": "authentication",
    "rsFilter": {
      ...
        "staticUserMapping": [
            {
                "subject": "amadmin",
                "localUser": "internal/user/openidm-admin",
                "userRoles": "authzRoles/*",
                "roles": [
                    "internal/role/openidm-authorized",
                    "internal/role/openidm-admin"
                ]
            },
            {
                "subject": "idm-provisioning",
                "localUser": "internal/user/idm-provisioning",
                "roles": [
                    "internal/role/platform-provisioning"
                ]
            },
            {
                "subject": "RCSClient",
                "localUser": "internal/user/idm-provisioning"
            },
            {
                "subject": "autoid-resource-server",
                "localUser": "internal/user/idm-provisioning",
                "roles": [
                    "internal/role/platform-provisioning",
                    "internal/role/openidm-authorized",
                    "internal/role/openidm-admin"
                ]
            }
        ]
    }
  }
 */
export async function listNonOAuth2AdminStaticUserMappings(showProtected) {
  let clients = await listOAuth2Clients();
  clients = clients
    .map((client) => client._id)
    .filter((client) => !protectedClients.includes(client));
  const authentication = await getConfigEntity('authentication');
  let subjects = authentication.rsFilter.staticUserMapping
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
    .map((mapping) => mapping.subject);
  if (!showProtected) {
    subjects = subjects.filter(
      (subject) => !protectedSubjects.includes(subject)
    );
  }
  const adminSubjects = subjects.filter(
    (subject) => !clients.includes(subject)
  );
  return adminSubjects;
}

async function getDynamicClientRegistrationScope() {
  const provider = await getOAuth2Provider();
  return provider.clientDynamicRegistrationConfig
    .dynamicClientRegistrationScope;
}

async function addAdminScopes(clientId, client) {
  const modClient = client;
  const allAdminScopes = adminScopes.concat([
    await getDynamicClientRegistrationScope(),
  ]);
  let addScopes = [];
  if (
    modClient.coreOAuth2ClientConfig.scopes &&
    modClient.coreOAuth2ClientConfig.scopes.value
  ) {
    addScopes = allAdminScopes.filter((scope) => {
      let add = false;
      if (!modClient.coreOAuth2ClientConfig.scopes.value.includes(scope)) {
        add = true;
      }
      return add;
    });
    modClient.coreOAuth2ClientConfig.scopes.value =
      modClient.coreOAuth2ClientConfig.scopes.value.concat(addScopes);
  } else {
    modClient.coreOAuth2ClientConfig.scopes.value = allAdminScopes;
  }
  let addDefaultScope = false;
  if (
    modClient.coreOAuth2ClientConfig.defaultScopes &&
    modClient.coreOAuth2ClientConfig.defaultScopes.value
  ) {
    if (modClient.coreOAuth2ClientConfig.defaultScopes.value.length === 0) {
      addDefaultScope = true;
      modClient.coreOAuth2ClientConfig.defaultScopes.value = adminDefaultScopes;
    } else {
        printMessage(
        `Client "${clientId}" already has default scopes configured, not adding admin default scope.`
      );
    }
  }
  if (addScopes.length > 0 || addDefaultScope) {
    printMessage(`Adding admin scopes to client "${clientId}"...`);
  } else {
    printMessage(`Client "${clientId}" already has admin scopes.`);
  }
  return modClient;
}

function addClientCredentialsGrantType(clientId, client) {
  const modClient = client;
  let modified = false;
  if (
    modClient.advancedOAuth2ClientConfig.grantTypes &&
    modClient.advancedOAuth2ClientConfig.grantTypes.value
  ) {
    if (
      !modClient.advancedOAuth2ClientConfig.grantTypes.value.includes(
        'client_credentials'
      )
    ) {
      modified = true;
      modClient.advancedOAuth2ClientConfig.grantTypes.value.push(
        'client_credentials'
      );
    }
  } else {
    modClient.advancedOAuth2ClientConfig.grantTypes.value = [
      'client_credentials',
    ];
  }
  modClient.advancedOAuth2ClientConfig.grantTypes.inherited = false;
  if (modified) {
    printMessage(
      `Adding client credentials grant type to client "${clientId}"...`
    );
  } else {
    printMessage(
      `Client "${clientId}" already has client credentials grant type.`
    );
  }
  return modClient;
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
    printMessage(`Creating static user mapping for client "${name}"...`);
    mappings.push({
      subject: name,
      localUser: 'internal/user/openidm-admin',
      userRoles: 'authzRoles/*',
      roles: adminRoles,
    });
  }
  authentication.rsFilter.staticUserMapping = mappings;
  if (addRoles.length > 0 || needsAdminMapping) {
    printMessage(
      `Adding admin roles to static user mapping for client "${name}"...`
    );
    await putConfigEntity('authentication', authentication);
  } else {
    printMessage(
      `Static user mapping for client "${name}" already has admin roles.`
    );
  }
}

/*
 * Add AutoId static user mapping to authentication.json to enable dashboards and other AutoId-based functionality.
  {
    "_id": "authentication",
    "rsFilter": {
      ...
        "staticUserMapping": [
            ...
            {
                "subject": "autoid-resource-server",
                "localUser": "internal/user/idm-provisioning",
                "roles": [
                    "internal/role/platform-provisioning",
                    "internal/role/openidm-authorized",
                    "internal/role/openidm-admin"
                ]
            }
        ]
    }
  }
 */
export async function addAutoIdStaticUserMapping() {
  const name = 'autoid-resource-server';
  const authentication = await getConfigEntity('authentication');
  let needsAdminMapping = true;
  let addRoles = [];
  const mappings = authentication.rsFilter.staticUserMapping.map((mapping) => {
    // ignore mappings for other subjects
    if (mapping.subject !== name) {
      return mapping;
    }
    needsAdminMapping = false;
    addRoles = autoIdRoles.filter((role) => {
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
    printMessage(`Creating static user mapping for AutoId client "${name}"...`);
    mappings.push({
      subject: name,
      localUser: 'internal/user/idm-provisioning',
      userRoles: 'authzRoles/*',
      roles: autoIdRoles,
    });
  }
  authentication.rsFilter.staticUserMapping = mappings;
  if (addRoles.length > 0 || needsAdminMapping) {
    printMessage(
      `Adding required roles to static user mapping for AutoId client "${name}"...`
    );
    await putConfigEntity('authentication', authentication);
  } else {
    printMessage(
      `Static user mapping for AutoId client "${name}" already has all required roles.`
    );
  }
}

export async function grantOAuth2ClientAdminPrivileges(clientId) {
  let client = await getOAuth2Client(clientId);
  if (client.coreOAuth2ClientConfig.clientName.value.length === 0) {
    client.coreOAuth2ClientConfig.clientName.value = [clientId];
  }
  if (
    client.advancedOAuth2ClientConfig.descriptions.value.length === 0 ||
    client.advancedOAuth2ClientConfig.descriptions.value[0].startsWith(
      'Modified by Frodo'
    ) ||
    client.advancedOAuth2ClientConfig.descriptions.value[0].startsWith(
      'Created by Frodo'
    )
  ) {
    client.advancedOAuth2ClientConfig.descriptions.value = [
      `Modified by Frodo on ${new Date().toLocaleString()}`,
    ];
  }
  client = await addAdminScopes(clientId, client);
  client = addClientCredentialsGrantType(clientId, client);
  await putOAuth2Client(clientId, client);
  await addAdminStaticUserMapping(clientId);
}

async function removeAdminScopes(name, client) {
  const modClient = client;
  const allAdminScopes = adminScopes.concat([
    await getDynamicClientRegistrationScope(),
  ]);
  let finalScopes = [];
  if (
    modClient.coreOAuth2ClientConfig.scopes &&
    modClient.coreOAuth2ClientConfig.scopes.value
  ) {
    finalScopes = modClient.coreOAuth2ClientConfig.scopes.value.filter(
      (scope) => !allAdminScopes.includes(scope)
    );
  }
  if (
    modClient.coreOAuth2ClientConfig.scopes.value.length > finalScopes.length
  ) {
    printMessage(`Removing admin scopes from client "${name}"...`);
    modClient.coreOAuth2ClientConfig.scopes.value = finalScopes;
  } else {
    printMessage(`Client "${name}" has no admin scopes.`);
  }
  let finalDefaultScopes = [];
  if (
    modClient.coreOAuth2ClientConfig.defaultScopes &&
    modClient.coreOAuth2ClientConfig.defaultScopes.value
  ) {
    finalDefaultScopes =
      modClient.coreOAuth2ClientConfig.defaultScopes.value.filter(
        (scope) => !adminDefaultScopes.includes(scope)
      );
  }
  if (
    modClient.coreOAuth2ClientConfig.defaultScopes.value.length >
    finalDefaultScopes.length
  ) {
    printMessage(`Removing admin default scopes from client "${name}"...`);
    modClient.coreOAuth2ClientConfig.defaultScopes.value = finalDefaultScopes;
  } else {
    printMessage(`Client "${name}" has no admin default scopes.`);
  }
  return modClient;
}

function removeClientCredentialsGrantType(clientId, client) {
  const modClient = client;
  let modified = false;
  let finalGrantTypes = [];
  if (
    modClient.advancedOAuth2ClientConfig.grantTypes &&
    modClient.advancedOAuth2ClientConfig.grantTypes.value
  ) {
    finalGrantTypes =
      modClient.advancedOAuth2ClientConfig.grantTypes.value.filter(
        (grantType) => grantType !== 'client_credentials'
      );
    modified =
      modClient.advancedOAuth2ClientConfig.grantTypes.value.length >
      finalGrantTypes.length;
  }
  if (modified) {
    printMessage(
      `Removing client credentials grant type from client "${clientId}"...`
    );
    modClient.advancedOAuth2ClientConfig.grantTypes.value = finalGrantTypes;
  } else {
    printMessage(
      `Client "${clientId}" does not allow client credentials grant type.`
    );
  }
  return modClient;
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
        printMessage(`Removing static user mapping for client "${name}"...`);
    } else {
        printMessage(
        `Removing admin roles from static user mapping for client "${name}"...`
      );
    }
    await putConfigEntity('authentication', authentication);
  } else {
    printMessage(`Static user mapping for client "${name}" has no admin roles.`);
  }
}

export async function revokeOAuth2ClientAdminPrivileges(clientId) {
  let client = await getOAuth2Client(clientId);
  if (client.coreOAuth2ClientConfig.clientName.value.length === 0) {
    client.coreOAuth2ClientConfig.clientName.value = [clientId];
  }
  if (
    client.advancedOAuth2ClientConfig.descriptions.value.length === 0 ||
    client.advancedOAuth2ClientConfig.descriptions.value[0].startsWith(
      'Modified by Frodo'
    ) ||
    client.advancedOAuth2ClientConfig.descriptions.value[0].startsWith(
      'Created by Frodo'
    )
  ) {
    client.advancedOAuth2ClientConfig.descriptions.value = [
      `Modified by Frodo on ${new Date().toLocaleString()}`,
    ];
  }
  client = await removeAdminScopes(clientId, client);
  client = removeClientCredentialsGrantType(clientId, client);
  await putOAuth2Client(clientId, client);
  await removeAdminStaticUserMapping(clientId);
}

export async function createOAuth2ClientWithAdminPrivileges(
  clientId,
  clientSecret
) {
  let client = OAUTH2_CLIENT;
  client.userpassword = clientSecret;
  client.coreOAuth2ClientConfig.clientName.value = [clientId];
  client.advancedOAuth2ClientConfig.descriptions.value = [
    `Created by Frodo on ${new Date().toLocaleString()}`,
  ];
  client = await addAdminScopes(clientId, client);
  await putOAuth2Client(clientId, client);
  await addAdminStaticUserMapping(clientId);
}

export async function createLongLivedToken(
  clientId,
  clientSecret,
  scope,
  secret,
  lifetime
) {
  // get oauth2 client
  const client = await getOAuth2Client(clientId);
  client.userpassword = clientSecret;
  // remember current lifetime
  const rememberedLifetime =
    client.coreOAuth2ClientConfig.accessTokenLifetime.value || 3600;
  // set long token lifetime
  client.coreOAuth2ClientConfig.accessTokenLifetime.value = lifetime;
  await putOAuth2Client(clientId, client);
  const response = await clientCredentialsGrant(clientId, clientSecret, scope);
  response.expires_on = new Date(
    new Date().getTime() + 1000 * response.expires_in
  ).toLocaleString();
  // reset token lifetime
  client.coreOAuth2ClientConfig.accessTokenLifetime.value = rememberedLifetime;
  await putOAuth2Client(clientId, client);
  // create secret with token as value
  const description = 'Long-lived admin token';
  await createSecret(secret, response.access_token, description);
  delete response.access_token;
  return response;
}

export async function removeStaticUserMapping(subject) {
  const authentication = await getConfigEntity('authentication');
  let removeMapping = false;
  const mappings = authentication.rsFilter.staticUserMapping.filter(
    (mapping) => {
      // find the subject and flag it
      if (mapping.subject === subject) {
        removeMapping = true;
      }
      // ignore mappings for other subjects
      return mapping.subject !== subject;
    }
  );
  authentication.rsFilter.staticUserMapping = mappings;
  if (removeMapping) {
    printMessage(`Removing static user mapping for subject "${subject}"...`);
    await putConfigEntity('authentication', authentication);
  } else {
    printMessage(`No static user mapping for subject "${subject}" found.`);
  }
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
            printMessage(`${name}: hide`);
          // eslint-disable-next-line no-param-reassign
          object.schema.properties[name].viewable = false;
        } else {
            printMessage(`${name}: ignore (already hidden)`);
        }
      } else {
        printMessage(`${name}: skip (customized)`);
      }
    });
    return object;
  });
  managed.objects = updatedObjects;
  if (dryRun) {
    printMessage('Dry-run only. Changes are not saved.');
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
            printMessage(`${name}: show`);
          // eslint-disable-next-line no-param-reassign
          object.schema.properties[name].viewable = true;
        } else {
            printMessage(`${name}: ignore (already showing)`);
        }
      } else {
        printMessage(`${name}: skip (customized)`);
      }
    });
    return object;
  });
  managed.objects = updatedObjects;
  if (dryRun) {
    printMessage('Dry-run only. Changes are not saved.');
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
    printMessage(`${object.name}: checking...`);
    RDVPs.forEach((name) => {
      if (!object.schema.properties[name].queryConfig.flattenProperties) {
        printMessage(`- ${name}: repairing - needs flattening`, 'warn');
        // eslint-disable-next-line no-param-reassign
        object.schema.properties[name].queryConfig.flattenProperties = true;
        repairData = true;
      } else {
        printMessage(`- ${name}: OK`);
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
    printMessage(`${object.name}: checking...`);
    RDVPs.forEach((name) => {
      if (!object.schema.properties[name].queryConfig.flattenProperties) {
        printMessage(`- ${name}: repairing - needs flattening`, 'warn');
        // eslint-disable-next-line no-param-reassign
        object.schema.properties[name].queryConfig.flattenProperties = true;
        repairData = true;
      } else {
        printMessage(`- ${name}: OK`);
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
    printMessage('Dry-run only. Changes are not saved.', 'warn');
  }
}

// suggested by John K.
export async function removeRealmNameFromManagedObjectLabels() {}

export async function addRealmNameToManagedObjectLabels() {}

// suggested by John K.
export async function cleanUpPostmanArtifacts() {}

// suggested by John K.
export async function createSampleThemes() {}
