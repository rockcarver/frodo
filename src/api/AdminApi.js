import {
  listOAuth2Clients,
  getOAuth2Client,
  putOAuth2Client,
} from './OAuth2ClientApi.js';
import { getConfigEntity, putConfigEntity } from './IdmConfigApi.js';
import { isEqualJson, getRealmManagedUser } from './utils/ApiUtils.js';
import { getOAuth2Provider } from './AmServiceApi.js';
import CLOUD_MANAGED_JSON from './templates/cloud/managed.json' assert { type: 'json' };

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

const adminClientTemplate = {
  coreOAuth2ClientConfig: {
    userpassword: null,
    loopbackInterfaceRedirection: {
      inherited: false,
      value: false,
    },
    defaultScopes: {
      inherited: false,
      value: [],
    },
    refreshTokenLifetime: {
      inherited: false,
      value: 604800,
    },
    scopes: {
      inherited: false,
      value: adminScopes,
    },
    status: {
      inherited: false,
      value: 'Active',
    },
    accessTokenLifetime: {
      inherited: false,
      value: 3600,
    },
    redirectionUris: {
      inherited: false,
      value: [],
    },
    clientName: {
      inherited: false,
      value: [],
    },
    clientType: {
      inherited: false,
      value: 'Confidential',
    },
    authorizationCodeLifetime: {
      inherited: false,
      value: 120,
    },
  },
  overrideOAuth2ClientConfig: {
    issueRefreshToken: true,
    remoteConsentServiceId: null,
    tokenEncryptionEnabled: false,
    enableRemoteConsent: false,
    usePolicyEngineForScope: false,
    oidcMayActScript: '[Empty]',
    oidcClaimsScript: '36863ffb-40ec-48b9-94b1-9a99f71cc3b5',
    overrideableOIDCClaims: [],
    accessTokenMayActScript: '[Empty]',
    clientsCanSkipConsent: false,
    accessTokenModificationScript: 'd22f9a0c-426a-4466-b95e-d0f125b0d5fa',
    providerOverridesEnabled: false,
    issueRefreshTokenOnRefreshedToken: true,
    scopeImplementationClass:
      'org.forgerock.openam.oauth2.OpenAMScopeValidator',
    statelessTokensEnabled: false,
  },
  advancedOAuth2ClientConfig: {
    descriptions: {
      inherited: false,
      value: [],
    },
    requestUris: {
      inherited: false,
      value: [],
    },
    logoUri: {
      inherited: false,
      value: [],
    },
    subjectType: {
      inherited: false,
      value: 'Public',
    },
    clientUri: {
      inherited: false,
      value: [],
    },
    tokenExchangeAuthLevel: {
      inherited: false,
      value: 0,
    },
    name: {
      inherited: false,
      value: [],
    },
    contacts: {
      inherited: false,
      value: [],
    },
    responseTypes: {
      inherited: false,
      value: ['token'],
    },
    updateAccessToken: {
      inherited: false,
    },
    mixUpMitigation: {
      inherited: false,
      value: false,
    },
    customProperties: {
      inherited: false,
      value: [],
    },
    javascriptOrigins: {
      inherited: false,
      value: [],
    },
    policyUri: {
      inherited: false,
      value: [],
    },
    softwareVersion: {
      inherited: false,
    },
    tosURI: {
      inherited: false,
      value: [],
    },
    sectorIdentifierUri: {
      inherited: false,
    },
    tokenEndpointAuthMethod: {
      inherited: false,
      value: 'client_secret_basic',
    },
    isConsentImplied: {
      inherited: false,
      value: true,
    },
    softwareIdentity: {
      inherited: false,
    },
    grantTypes: {
      inherited: false,
      value: ['client_credentials'],
    },
  },
  signEncOAuth2ClientConfig: {
    tokenEndpointAuthSigningAlgorithm: {
      inherited: false,
      value: 'RS256',
    },
    idTokenEncryptionEnabled: {
      inherited: false,
      value: false,
    },
    tokenIntrospectionEncryptedResponseEncryptionAlgorithm: {
      inherited: false,
      value: 'A128CBC-HS256',
    },
    requestParameterSignedAlg: {
      inherited: false,
    },
    clientJwtPublicKey: {
      inherited: false,
    },
    idTokenPublicEncryptionKey: {
      inherited: false,
    },
    mTLSSubjectDN: {
      inherited: false,
    },
    userinfoResponseFormat: {
      inherited: false,
      value: 'JSON',
    },
    mTLSCertificateBoundAccessTokens: {
      inherited: false,
      value: false,
    },
    publicKeyLocation: {
      inherited: false,
      value: 'jwks_uri',
    },
    tokenIntrospectionResponseFormat: {
      inherited: false,
      value: 'JSON',
    },
    jwkStoreCacheMissCacheTime: {
      inherited: false,
      value: 60000,
    },
    requestParameterEncryptedEncryptionAlgorithm: {
      inherited: false,
      value: 'A128CBC-HS256',
    },
    userinfoSignedResponseAlg: {
      inherited: false,
    },
    idTokenEncryptionAlgorithm: {
      inherited: false,
      value: 'RSA-OAEP-256',
    },
    requestParameterEncryptedAlg: {
      inherited: false,
    },
    mTLSTrustedCert: {
      inherited: false,
    },
    jwkSet: {
      inherited: false,
    },
    idTokenEncryptionMethod: {
      inherited: false,
      value: 'A128CBC-HS256',
    },
    jwksCacheTimeout: {
      inherited: false,
      value: 3600000,
    },
    userinfoEncryptedResponseAlg: {
      inherited: false,
    },
    idTokenSignedResponseAlg: {
      inherited: false,
      value: 'RS256',
    },
    jwksUri: {
      inherited: false,
    },
    tokenIntrospectionSignedResponseAlg: {
      inherited: false,
      value: 'RS256',
    },
    userinfoEncryptedResponseEncryptionAlgorithm: {
      inherited: false,
      value: 'A128CBC-HS256',
    },
    tokenIntrospectionEncryptedResponseAlg: {
      inherited: false,
      value: 'RSA-OAEP-256',
    },
  },
  coreOpenIDClientConfig: {
    claims: {
      inherited: false,
      value: [],
    },
    clientSessionUri: {
      inherited: false,
    },
    backchannel_logout_uri: {
      inherited: false,
    },
    defaultAcrValues: {
      inherited: false,
      value: [],
    },
    jwtTokenLifetime: {
      inherited: false,
      value: 3600,
    },
    defaultMaxAgeEnabled: {
      inherited: false,
      value: false,
    },
    defaultMaxAge: {
      inherited: false,
      value: 600,
    },
    postLogoutRedirectUri: {
      inherited: false,
      value: [],
    },
    backchannel_logout_session_required: {
      inherited: false,
      value: false,
    },
  },
  coreUmaClientConfig: {
    claimsRedirectionUris: {
      inherited: false,
      value: [],
    },
  },
  _type: {
    _id: 'OAuth2Client',
    name: 'OAuth2 Clients',
    collection: true,
  },
};

const genericExtensionAttributesTemplate = {
  frIndexedDate1: {
    description: 'Generic Indexed Date 1',
    isPersonal: false,
    title: 'Generic Indexed Date 1',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedDate2: {
    description: 'Generic Indexed Date 2',
    isPersonal: false,
    title: 'Generic Indexed Date 2',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedDate3: {
    description: 'Generic Indexed Date 3',
    isPersonal: false,
    title: 'Generic Indexed Date 3',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedDate4: {
    description: 'Generic Indexed Date 4',
    isPersonal: false,
    title: 'Generic Indexed Date 4',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedDate5: {
    description: 'Generic Indexed Date 5',
    isPersonal: false,
    title: 'Generic Indexed Date 5',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedInteger1: {
    description: 'Generic Indexed Integer 1',
    isPersonal: false,
    title: 'Generic Indexed Integer 1',
    type: 'number',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedInteger2: {
    description: 'Generic Indexed Integer 2',
    isPersonal: false,
    title: 'Generic Indexed Integer 2',
    type: 'number',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedInteger3: {
    description: 'Generic Indexed Integer 3',
    isPersonal: false,
    title: 'Generic Indexed Integer 3',
    type: 'number',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedInteger4: {
    description: 'Generic Indexed Integer 4',
    isPersonal: false,
    title: 'Generic Indexed Integer 4',
    type: 'number',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedInteger5: {
    description: 'Generic Indexed Integer 5',
    isPersonal: false,
    title: 'Generic Indexed Integer 5',
    type: 'number',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedMultivalued1: {
    description: 'Generic Indexed Multivalue 1',
    isPersonal: false,
    items: {
      type: 'string',
    },
    title: 'Generic Indexed Multivalue 1',
    type: 'array',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedMultivalued2: {
    description: 'Generic Indexed Multivalue 2',
    isPersonal: false,
    items: {
      type: 'string',
    },
    title: 'Generic Indexed Multivalue 2',
    type: 'array',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedMultivalued3: {
    description: 'Generic Indexed Multivalue 3',
    isPersonal: false,
    items: {
      type: 'string',
    },
    title: 'Generic Indexed Multivalue 3',
    type: 'array',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedMultivalued4: {
    description: 'Generic Indexed Multivalue 4',
    isPersonal: false,
    items: {
      type: 'string',
    },
    title: 'Generic Indexed Multivalue 4',
    type: 'array',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedMultivalued5: {
    description: 'Generic Indexed Multivalue 5',
    isPersonal: false,
    items: {
      type: 'string',
    },
    title: 'Generic Indexed Multivalue 5',
    type: 'array',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedString1: {
    description: 'Generic Indexed String 1',
    isPersonal: false,
    title: 'Generic Indexed String 1',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedString2: {
    description: 'Generic Indexed String 2',
    isPersonal: false,
    title: 'Generic Indexed String 2',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedString3: {
    description: 'Generic Indexed String 3',
    isPersonal: false,
    title: 'Generic Indexed String 3',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedString4: {
    description: 'Generic Indexed String 4',
    isPersonal: false,
    title: 'Generic Indexed String 4',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frIndexedString5: {
    description: 'Generic Indexed String 5',
    isPersonal: false,
    title: 'Generic Indexed String 5',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedDate1: {
    description: 'Generic Unindexed Date 1',
    isPersonal: false,
    title: 'Generic Unindexed Date 1',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedDate2: {
    description: 'Generic Unindexed Date 2',
    isPersonal: false,
    title: 'Generic Unindexed Date 2',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedDate3: {
    description: 'Generic Unindexed Date 3',
    isPersonal: false,
    title: 'Generic Unindexed Date 3',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedDate4: {
    description: 'Generic Unindexed Date 4',
    isPersonal: false,
    title: 'Generic Unindexed Date 4',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedDate5: {
    description: 'Generic Unindexed Date 5',
    isPersonal: false,
    title: 'Generic Unindexed Date 5',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedInteger1: {
    description: 'Generic Unindexed Integer 1',
    isPersonal: false,
    title: 'Generic Unindexed Integer 1',
    type: 'number',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedInteger2: {
    description: 'Generic Unindexed Integer 2',
    isPersonal: false,
    title: 'Generic Unindexed Integer 2',
    type: 'number',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedInteger3: {
    description: 'Generic Unindexed Integer 3',
    isPersonal: false,
    title: 'Generic Unindexed Integer 3',
    type: 'number',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedInteger4: {
    description: 'Generic Unindexed Integer 4',
    isPersonal: false,
    title: 'Generic Unindexed Integer 4',
    type: 'number',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedInteger5: {
    description: 'Generic Unindexed Integer 5',
    isPersonal: false,
    title: 'Generic Unindexed Integer 5',
    type: 'number',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedMultivalued1: {
    description: 'Generic Unindexed Multivalue 1',
    isPersonal: false,
    items: {
      type: 'string',
    },
    title: 'Generic Unindexed Multivalue 1',
    type: 'array',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedMultivalued2: {
    description: 'Generic Unindexed Multivalue 2',
    isPersonal: false,
    items: {
      type: 'string',
    },
    title: 'Generic Unindexed Multivalue 2',
    type: 'array',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedMultivalued3: {
    description: 'Generic Unindexed Multivalue 3',
    isPersonal: false,
    items: {
      type: 'string',
    },
    title: 'Generic Unindexed Multivalue 3',
    type: 'array',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedMultivalued4: {
    description: 'Generic Unindexed Multivalue 4',
    isPersonal: false,
    items: {
      type: 'string',
    },
    title: 'Generic Unindexed Multivalue 4',
    type: 'array',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedMultivalued5: {
    description: 'Generic Unindexed Multivalue 5',
    isPersonal: false,
    items: {
      type: 'string',
    },
    title: 'Generic Unindexed Multivalue 5',
    type: 'array',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedString1: {
    description: 'Generic Unindexed String 1',
    isPersonal: false,
    title: 'Generic Unindexed String 1',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedString2: {
    description: 'Generic Unindexed String 2',
    isPersonal: false,
    title: 'Generic Unindexed String 2',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedString3: {
    description: 'Generic Unindexed String 3',
    isPersonal: false,
    title: 'Generic Unindexed String 3',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedString4: {
    description: 'Generic Unindexed String 4',
    isPersonal: false,
    title: 'Generic Unindexed String 4',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
  frUnindexedString5: {
    description: 'Generic Unindexed String 5',
    isPersonal: false,
    title: 'Generic Unindexed String 5',
    type: 'string',
    usageDescription: '',
    userEditable: true,
    viewable: true,
  },
};

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
  const client = adminClientTemplate;
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
  const propertyNames = Object.keys(genericExtensionAttributesTemplate);
  const updatedObjects = managed.objects.map((object) => {
    // ignore all other objects
    if (object.name !== getRealmManagedUser()) {
      return object;
    }
    propertyNames.forEach((name) => {
      if (
        isEqualJson(
          genericExtensionAttributesTemplate[name],
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
  const propertyNames = Object.keys(genericExtensionAttributesTemplate);
  const updatedObjects = managed.objects.map((object) => {
    // ignore all other objects
    if (object.name !== getRealmManagedUser()) {
      return object;
    }
    propertyNames.forEach((name) => {
      if (
        isEqualJson(
          genericExtensionAttributesTemplate[name],
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

async function repairOrgModelUser() {}

async function repairOrgModelOrg() {}

async function extendOrgModelPermissins() {}

export async function repairOrgModel(extendPermissions) {
  await repairOrgModelUser();
  await repairOrgModelOrg();
  if (extendPermissions) {
    await extendOrgModelPermissins();
  }
}

// suggested by John K.
export async function removeRealmNameFromManagedObjectLabels() {}

export async function addRealmNameToManagedObjectLabels() {}

// suggested by John K.
export async function cleanUpPostmanArtifacts() {}
