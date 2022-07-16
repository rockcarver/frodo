import { getManagedObject } from '../api/ManagedObjectApi.js';

/**
 * Resolve a managed object's uuid to a human readable username
 * @param {String} type managed object type, e.g. teammember or alpha_user
 * @param {String} id managed object _id
 * @returns {String} resolved username or uuid if any error occurs during reslution
 */
export async function resolveUserName(type, id) {
  try {
    return (await getManagedObject(type, id, ['userName'])).data.userName;
  } catch (error) {
    // eslint-disable-next-line no-empty
  }
  return id;
}

/**
 * Resolve a managed object's uuid to a human readable full name
 * @param {String} type managed object type, e.g. teammember or alpha_user
 * @param {String} id managed object _id
 * @returns {String} resolved full name or uuid if any error occurs during reslution
 */
export async function resolveFullName(type, id) {
  try {
    const managedObject = (
      await getManagedObject(type, id, ['givenName', 'sn'])
    ).data;
    return `${managedObject.givenName} ${managedObject.sn}`;
  } catch (error) {
    // eslint-disable-next-line no-empty
  }
  return id;
}
