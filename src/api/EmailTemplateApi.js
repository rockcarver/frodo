import util from 'util';
import { generateIdmApi } from './BaseApi.js';
import { getTenantURL } from './utils/ApiUtils.js';
import storage from '../storage/SessionStorage.js';
import { printMessage } from './utils/Console.js';

const emailTemplateURLTemplate = '%s/openidm/config/emailTemplate/%s';
const emailTemplateQueryTemplate =
  '%s/openidm/config?_queryFilter=_id%20sw%20%27emailTemplate%27';

export async function listEmailTemplates() {
  try {
    const urlString = util.format(
      emailTemplateQueryTemplate,
      getTenantURL(storage.session.getTenant())
    );
    const response = await generateIdmApi().get(urlString);
    if (response.status < 200 || response.status > 399) {
      printMessage(
        `listEmailTemplates ERROR: list email templates data call returned ${response.status}`,
        'error'
      );
      return null;
    }
    return response.data.result;
  } catch (e) {
    printMessage(
      `listEmailTemplates ERROR: list email templates data error - ${e.message}`,
      'error'
    );
    return null;
  }
}

export async function getEmailTemplate(id) {
  try {
    const urlString = util.format(
      emailTemplateURLTemplate,
      getTenantURL(storage.session.getTenant()),
      id
    );
    const response = await generateIdmApi().get(urlString);
    if (response.status < 200 || response.status > 399) {
      printMessage(
        `getEmailTemplate ERROR: get email template data call returned ${response.status}, possible cause: email template not found`,
        'error'
      );
      return null;
    }
    return response.data;
  } catch (e) {
    printMessage(
      `getEmailTemplate ERROR: get email template data error - ${e.message}`,
      'error'
    );
    return null;
  }
}

export async function putEmailTemplate(id, longid, data) {
  try {
    const urlString = util.format(
      emailTemplateURLTemplate,
      getTenantURL(storage.session.getTenant()),
      id
    );
    const response = await generateIdmApi().put(urlString, data);
    if (response.status < 200 || response.status > 399) {
      printMessage(
        `putEmailTemplate ERROR: put template call returned ${response.status}, details: ${response}`,
        'error'
      );
      return null;
    }
    if (response.data._id !== longid) {
      printMessage(
        `putEmailTemplate ERROR: generic error importing template ${id} (${longid})`,
        'error'
      );
      console.dir(data);
      return null;
    }
    return '';
  } catch (e) {
    printMessage(
      `putEmailTemplate ERROR: template ${id} (${longid}) - ${e.message}`,
      'error'
    );
    console.dir(data);
    return null;
  }
}
