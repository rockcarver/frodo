import fs from 'fs';
import { createTable, printMessage } from './utils/Console.js';
import {
  getTypedFilename,
  saveToFile,
  titleCase,
  validateImport,
} from './utils/ExportImportUtils.js';
import storage from '../storage/SessionStorage.js';
import {
  getOAuth2Client,
  getOAuth2Clients,
  putOAuth2Client,
} from '../api/OAuth2ClientApi.js';
import { getOAuth2Provider } from '../api/OAuth2ProviderApi.js';
import { getRealmName } from '../api/utils/ApiUtils.js';

/**
 * List OAuth2 clients
 */
export async function listOAuth2Clients(long = false) {
  try {
    const clients = (await getOAuth2Clients()).data.result;
    clients.sort((a, b) => a._id.localeCompare(b._id));
    if (long) {
      const table = createTable([
        'Client Id',
        'Status',
        'Client Type',
        'Grant Types',
        'Scopes',
        'Redirect URIs',
        // 'Description',
      ]);
      const grantTypesMap = {
        authorization_code: 'Authz Code',
        client_credentials: 'Client Creds',
        refresh_token: 'Refresh Token',
        password: 'ROPC',
        'urn:ietf:params:oauth:grant-type:uma-ticket': 'UMA',
        implicit: 'Implicit',
        'urn:ietf:params:oauth:grant-type:device_code': 'Device Code',
        'urn:ietf:params:oauth:grant-type:saml2-bearer': 'SAML2 Bearer',
        'urn:openid:params:grant-type:ciba': 'CIBA',
        'urn:ietf:params:oauth:grant-type:token-exchange': 'Token Exchange',
        'urn:ietf:params:oauth:grant-type:jwt-bearer': 'JWT Bearer',
      };
      clients.forEach((client) => {
        table.push([
          client._id,
          client.coreOAuth2ClientConfig.status === 'Active'
            ? 'Active'.brightGreen
            : client.coreOAuth2ClientConfig.status.brightRed,
          client.coreOAuth2ClientConfig.clientType,
          client.advancedOAuth2ClientConfig.grantTypes
            .map((type) => grantTypesMap[type])
            .join('\n'),
          client.coreOAuth2ClientConfig.scopes.join('\n'),
          client.coreOAuth2ClientConfig.redirectionUris.join('\n'),
          // wordwrap(client.description, 30),
        ]);
      });
      printMessage(table.toString(), 'data');
    } else {
      clients.forEach((client) => {
        printMessage(`${client._id}`, 'data');
      });
    }
  } catch (error) {
    printMessage(`Error listing scripts - ${error}`, 'error');
  }
}

/**
 * Export OAuth2 client to file
 * @param {String} id client id
 * @param {String} file file name
 */
export async function exportOAuth2ClientToFile(id, file) {
  let fileName = getTypedFilename(id, 'oauth2.app');
  if (file) {
    fileName = file;
  }
  const oauth2Service = (await getOAuth2Provider()).data;
  const client = (await getOAuth2Client(id)).data;
  client._provider = oauth2Service;
  saveToFile('application', [client], '_id', fileName);
}

/**
 * Export all OAuth2 clients to file
 * @param {String} file file name
 */
export async function exportOAuth2ClientsToFile(file) {
  let fileName = getTypedFilename(
    `all${titleCase(getRealmName(storage.session.getRealm()))}Applications`,
    'oauth2.app'
  );
  if (file) {
    fileName = file;
  }
  const oauth2Service = (await getOAuth2Provider()).data;
  const clients = (await getOAuth2Clients()).data.result;
  const exportData = [];
  for (const client of clients) {
    client._provider = oauth2Service;
    exportData.push(client);
  }
  saveToFile('application', exportData, '_id', fileName);
}

/**
 * Export all OAuth2 clients to separate files
 */
export async function exportOAuth2ClientsToFiles() {
  const oauth2Service = (await getOAuth2Provider()).data;
  const clients = (await getOAuth2Clients()).data.result;
  for (const client of clients) {
    client._provider = oauth2Service;
    const fileName = getTypedFilename(client._id, 'oauth2.app');
    saveToFile('application', [client], '_id', fileName);
  }
}

/**
 * Import OAuth2 clients from file
 * @param {String} file file name
 */
export async function importOAuth2ClientsFromFile(file) {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) throw err;
    const applicationData = JSON.parse(data);
    if (validateImport(applicationData.meta)) {
      for (const id in applicationData.application) {
        if (
          Object.prototype.hasOwnProperty.call(applicationData.application, id)
        ) {
          delete applicationData.application[id]._provider;
          delete applicationData.application[id]._rev;
          putOAuth2Client(id, applicationData.application[id]).then(
            (result) => {
              if (!result == null) printMessage(`Imported ${id}`);
            }
          );
        }
      }
    } else {
      printMessage('Import validation failed...', 'error');
    }
  });
}
