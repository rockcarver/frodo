/**
 * Create an oauth2 client with admin privileges.
 * @type {import('../types/bindings/Admin').CreatePrivlidgedOAuth2Client}
 * @example ``` js
 * _createPrivlidgedOAuth2Client({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 *});
 * ```
 */
export const _createPrivlidgedOAuth2Client = ({ state }) => {
  state;
};

/**
 * List oauth2 clients with admin privileges.
 * @type {import('../types/bindings/Admin').ListPrivlidgedOAuth2Clients}
 * @example ``` js
 * _listPrivlidgedOAuth2Client({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 *});
 * ```
 */
export const _listPrivlidgedOAuth2Client = ({ state }) => {
  state;
};

/**
 * Grant an oauth2 client admin privileges.
 * @type {import('../types/bindings/Admin').GrantPrivlidgedOAuth2Client}
 * @example ``` js
 * _grantPrivlidgedOAuth2Client({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 *});
 * ```
 */
export const _grantPrivlidgedOAuth2Client = ({ state }) => {
  state;
};

/**
 * Revoke admin privileges from an oauth2.
 * @type {import('../types/bindings/Admin').RevokePrivlidgedOAuth2Client}
 * @example ``` js
 * _revokePrivlidgedOAuth2Client({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 *});
 * ```
 */
export const _revokePrivlidgedOAuth2Client = ({ state }) => {
  state;
};

/**
 * List oauth2 clients with custom privileges.
 * @type {import('../types/bindings/Admin').ListCustomPrivilegedOAuth2Clients}
 * @example ``` js
 * _listCustomPrivilegedOAuth2Clients({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 *});
 * ```
 */
export const _listCustomPrivilegedOAuth2Clients = ({ state }) => {
  state;
};

/**
 * List all subjects of static user mappings that are not oauth2 clients.
 * @type {import('../types/bindings/Admin').ListStaticUserMappings}
 * @example ``` js
 * _listStaticUserMappings({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 *});
 * ```
 */
export const _listStaticUserMappings = ({ state }) => {
  state;
};

/**
 * Remove a subject's static user mapping.
 * @type {import('../types/bindings/Admin').RemoveStaticUserMapping}
 * @example ``` js
 * _removeStaticUserMapping({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 *});
 * ```
 */
export const _removeStaticUserMapping = ({ state }) => {
  state;
};

/**
 * Add AutoId static user mapping to enable dashboards and other AutoId-based functionality.
 * @type {import('../types/bindings/Admin').AddAutoIDStaticUserMapping}
 * @example ``` js
 * _addAutoIdStaticUserMapping({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 *});
 * ```
 */
export const _addAutoIdStaticUserMapping = ({ state }) => {
  state;
};

/**
 * Hide generic extension attributes.
 * @type {import('../types/bindings/Admin').HideGenericExtensionAttributes}
 * @example ``` js
 * _hideGenericExtensionAttributes({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 *});
 * ```
 */
export const _hideGenericExtensionAttributes = ({ state }) => {
  state;
};

/**
 * Show generic extension attributes.
 * @type {import('../types/bindings/Admin').ShowGenericExtensionAttributes}
 * @example ``` js
 * _showGenericExtensionAttributes({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 *});
 * ```
 */
export const _showGenericExtensionAttributes = ({ state }) => {
  state;
};

/**
 * Repair org model.
 * @type {import('../types/bindings/Admin').RepairOrgModel}
 * @example ``` js
 * _repairOrgModel({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 *});
 * ```
 */
export const _repairOrgModel = ({ state }) => {
  state;
};
