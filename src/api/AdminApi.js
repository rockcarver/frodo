import { listOAuth2Clients } from './OAuth2ClientApi.js';
import { getConfigEntity } from './IdmConfigApi.js';
import storage from '../storage/SessionStorage.js';
import * as global from '../storage/StaticStorage.js';

const protectedClients = ['ui', 'idm-provisioning'];
const protectedSubjects = ['amadmin'];

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

export async function grantOAuth2ClientCustomPrivileges() {}

export async function revokeOAuth2ClientPrivileges() {}

export async function listOAuth2UserClients() {}

export async function grantOAuth2ClientUserPrivileges() {}

export async function listOAuth2AdminClients() {}

export async function grantOAuth2ClientAdminPrivileges() {}
