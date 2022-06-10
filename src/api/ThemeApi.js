import { getConfigEntity, putConfigEntity } from './IdmConfigApi.js';
import storage from '../storage/SessionStorage.js';

const THEMEREALM_ID = 'ui/themerealm';

function getRealmThemes(themes) {
  return themes.realm[storage.session.getRealm()]
    ? themes.realm[storage.session.getRealm()]
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

export async function getTheme(id) {
  const themes = await getConfigEntity(THEMEREALM_ID);
  return getRealmThemes(themes).filter((theme) => theme._id === id);
}

export async function getThemeByName(name) {
  const themes = await getConfigEntity(THEMEREALM_ID);
  return getRealmThemes(themes).filter((theme) => theme.name === name);
}

export async function putTheme(id, data) {
  const themeData = data;
  themeData._id = id;
  // don't import a new theme as default theme
  themeData.isDefault = false;
  const themes = await getConfigEntity(THEMEREALM_ID);
  let isNew = true;
  const realmThemes = getRealmThemes(themes).map((theme) => {
    if (theme._id === id) {
      isNew = false;
      // preserve isDefault setting when overwriting existing theme
      themeData.isDefault = theme.isDefault;
      return themeData;
    }
    return theme;
  });
  if (isNew) {
    realmThemes.push(themeData);
  }
  themes.realm[storage.session.getRealm()] = realmThemes;
  return putConfigEntity(THEMEREALM_ID, themes);
}

export async function putThemeByName(name, data) {
  const themeData = data;
  themeData.name = name;
  // don't import a new theme as default theme
  themeData.isDefault = false;
  const themes = await getConfigEntity(THEMEREALM_ID);
  let isNew = true;
  const realmThemes = getRealmThemes(themes).map((theme) => {
    if (theme.name === name) {
      isNew = false;
      // preserve isDefault setting when overwriting existing theme
      themeData.isDefault = theme.isDefault;
      return themeData;
    }
    return theme;
  });
  if (isNew) {
    realmThemes.push(themeData);
  }
  themes.realm[storage.session.getRealm()] = realmThemes;
  return putConfigEntity(THEMEREALM_ID, themes);
}

export async function putThemes(data) {
  const allThemesData = data;
  const themes = (await getConfigEntity(THEMEREALM_ID)).data;
  const allThemeIDs = Object.keys(allThemesData);
  const existingThemeIDs = [];
  const realmThemes = getRealmThemes(themes).map((theme) => {
    if (allThemesData[theme._id]) {
      existingThemeIDs.push(theme._id);
      // preserve isDefault setting when overwriting existing theme
      allThemesData[theme._id].isDefault = theme.isDefault;
      return allThemesData[theme._id];
    }
    return theme;
  });
  const newThemeIDs = allThemeIDs.filter(
    (id) => !existingThemeIDs.includes(id)
  );
  newThemeIDs.forEach((themeId) => {
    // don't import a new theme as default theme
    allThemesData[themeId].isDefault = false;
    realmThemes.push(allThemesData[themeId]);
  });
  themes.realm[storage.session.getRealm()] = realmThemes;
  return putConfigEntity(THEMEREALM_ID, themes);
}
