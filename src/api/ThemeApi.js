import { getConfigEntity, putConfigEntity } from './IdmConfigApi.js';
import { getCurrentRealmName } from './utils/ApiUtils.js';

const THEMEREALM_ID = 'ui/themerealm';

/**
 * Get realm themes
 * @param {Object} themes object containing themes
 * @returns {Object} array of theme pertaining to the current realm
 */
function getRealmThemes(themes) {
  return themes.realm[getCurrentRealmName()]
    ? themes.realm[getCurrentRealmName()]
    : [];
}

/**
 * Get all themes
 * @returns {Promise} a promise that resolves to an array of themes
 */
export async function getThemes() {
  return getConfigEntity(THEMEREALM_ID).then((response) =>
    getRealmThemes(response.data)
  );
}

/**
 * Get theme by id
 * @param {string} id theme id
 * @returns {Promise} a promise that resolves to an array of themes
 */
export async function getTheme(id) {
  const themes = (await getConfigEntity(THEMEREALM_ID)).data;
  return getRealmThemes(themes).filter((theme) => theme._id === id);
}

/**
 * Get theme by name
 * @param {string} name theme name
 * @returns {Promise} a promise that resolves to an array of themes
 */
export async function getThemeByName(name) {
  const themes = (await getConfigEntity(THEMEREALM_ID)).data;
  return getRealmThemes(themes).filter((theme) => theme.name === name);
}

/**
 * Put theme by id
 * @param {string} id theme id
 * @param {Object} data theme object
 * @returns {Promise} a promise that resolves to an object containing a themes object
 */
export async function putTheme(id, data) {
  const themeData = data;
  themeData._id = id;
  const themes = (await getConfigEntity(THEMEREALM_ID)).data;
  let isNew = true;
  const realmThemes = getRealmThemes(themes).map((theme) => {
    if (theme._id === id) {
      isNew = false;
      return themeData;
    }
    // eslint-disable-next-line no-param-reassign
    if (themeData.isDefault) theme.isDefault = false;
    return theme;
  });
  if (isNew) {
    realmThemes.push(themeData);
  }
  themes.realm[getCurrentRealmName()] = realmThemes;
  return putConfigEntity(THEMEREALM_ID, themes);
}

/**
 * Put theme by name
 * @param {string} name theme name
 * @param {Object} data theme object
 * @returns {Promise} a promise that resolves to an object containing a themes object
 */
export async function putThemeByName(name, data) {
  const themeData = data;
  themeData.name = name;
  const themes = await getConfigEntity(THEMEREALM_ID);
  let isNew = true;
  const realmThemes = getRealmThemes(themes).map((theme) => {
    if (theme.name === name) {
      isNew = false;
      return themeData;
    }
    // eslint-disable-next-line no-param-reassign
    if (themeData.isDefault) theme.isDefault = false;
    return theme;
  });
  if (isNew) {
    realmThemes.push(themeData);
  }
  themes.realm[getCurrentRealmName()] = realmThemes;
  return putConfigEntity(THEMEREALM_ID, themes);
}

/**
 * Put all themes
 * @param {Object} data themes object containing all themes for all realms
 * @returns {Promise} a promise that resolves to an object containing a themes object
 */
export async function putThemes(data) {
  const allThemesData = data;
  const themes = (await getConfigEntity(THEMEREALM_ID)).data;
  const allThemeIDs = Object.keys(allThemesData);
  const existingThemeIDs = [];
  let defaultThemeId = null;
  // update existing themes
  let realmThemes = getRealmThemes(themes).map((theme) => {
    if (allThemesData[theme._id]) {
      existingThemeIDs.push(theme._id);
      // remember the id of the last default theme
      if (allThemesData[theme._id].isDefault) defaultThemeId = theme._id;
      return allThemesData[theme._id];
    }
    return theme;
  });
  const newThemeIDs = allThemeIDs.filter(
    (id) => !existingThemeIDs.includes(id)
  );
  // add new themes
  newThemeIDs.forEach((themeId) => {
    // remember the id of the last default theme
    if (allThemesData[themeId].isDefault) defaultThemeId = themeId;
    realmThemes.push(allThemesData[themeId]);
  });
  // if we imported a default theme, flag all the other themes as not default
  if (defaultThemeId) {
    realmThemes = realmThemes.map((theme) => {
      // eslint-disable-next-line no-param-reassign
      theme.isDefault = theme._id === defaultThemeId;
      return theme;
    });
  }
  themes.realm[getCurrentRealmName()] = realmThemes;
  return putConfigEntity(THEMEREALM_ID, themes);
}

/**
 * Delete theme by id
 * @param {string} id theme id
 * @returns {Promise} a promise that resolves to an object containing a themes object
 */
export async function deleteTheme(id) {
  const themes = (await getConfigEntity(THEMEREALM_ID)).data;
  const realmThemes = getRealmThemes(themes);
  const finalThemes = realmThemes.filter((theme) => theme._id !== id);
  if (realmThemes.length === finalThemes.length)
    throw new Error(`${id} not found`);
  themes.realm[getCurrentRealmName()] = realmThemes;
  return putConfigEntity(THEMEREALM_ID, themes);
}

/**
 * Delete theme by name
 * @param {string} name theme name
 * @returns {Promise} a promise that resolves to an object containing a themes object
 */
export async function deleteThemeByName(name) {
  const themes = (await getConfigEntity(THEMEREALM_ID)).data;
  const realmThemes = getRealmThemes(themes);
  const finalThemes = realmThemes.filter((theme) => theme.name !== name);
  if (realmThemes.length === finalThemes.length)
    throw new Error(`${name} not found`);
  themes.realm[getCurrentRealmName()] = finalThemes;
  return putConfigEntity(THEMEREALM_ID, themes);
}

/**
 * Delete all themes
 * @returns {Promise} a promise that resolves to an array of themes
 */
export async function deleteThemes() {
  const themes = (await getConfigEntity(THEMEREALM_ID)).data;
  themes.realm[getCurrentRealmName()] = [];
  return putConfigEntity(THEMEREALM_ID, themes);
}
