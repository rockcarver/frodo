import {
  getConfigEntitiesByType,
  getConfigEntity,
  putConfigEntity,
} from './IdmConfigApi.js';

/**
 * Email template type key used to build the IDM id: 'emailTemplate/<id>'
 */
export const EMAIL_TEMPLATE_TYPE = 'emailTemplate';

/**
 * Get all email templates
 * @returns {Promise} a promise that resolves to an object containing an array of email template objects
 */
export async function getEmailTemplates() {
  return getConfigEntitiesByType(EMAIL_TEMPLATE_TYPE);
}

/**
 * Get email template
 * @param {String} id id/name of the email template without the type prefix
 * @returns {Promise} a promise that resolves to an object containing the email template object
 */
export async function getEmailTemplate(id) {
  return getConfigEntity(`${EMAIL_TEMPLATE_TYPE}/${id}`);
}

/**
 * Put email template
 * @param {String} id id/name of the email template without the type prefix
 * @param {Object} data email template object
 * @returns {Promise} a promise that resolves to an object containing the email template object
 */
export async function putEmailTemplate(id, data) {
  return putConfigEntity(`${EMAIL_TEMPLATE_TYPE}/${id}`, data);
}
