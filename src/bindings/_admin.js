/**
 * @file Platform admin tasks.
 */

/**
 * Create an oauth2 client with admin privileges.
 * @type {import('../types/bindings/Admin').CreatePrivlidgedOAuth2Client}
 */
export const $createPrivlidgedOAuth2Client = ({ state }) => {
  state;
};

/**
 * List oauth2 clients with admin privileges.
 * @type {import('../types/bindings/Admin').ListPrivlidgedOAuth2Clients}
 */
export const $listPrivlidgedOAuth2Client = ({ state }) => {
  state;
};

/**
 * Grant an oauth2 client admin privileges.
 * @type {import('../types/bindings/Admin').GrantPrivlidgedOAuth2Client}
 */
export const $grantPrivlidgedOAuth2Client = ({ state }) => {
  state;
};

/**
 * Revoke admin privileges from an oauth2.
 * @type {import('../types/bindings/Admin').RevokePrivlidgedOAuth2Client}
 */
export const $revokePrivlidgedOAuth2Client = ({ state }) => {
  state;
};

/**
 * List oauth2 clients with custom privileges.
 * @type {import('../types/bindings/Admin').ListCustomPrivilegedOAuth2Clients}
 */
export const $listCustomPrivilegedOAuth2Clients = ({ state }) => {
  state;
};

/**
 * List all subjects of static user mappings that are not oauth2 clients.
 * @type {import('../types/bindings/Admin').ListStaticUserMappings}
 */
export const $listStaticUserMappings = ({ state }) => {
  state;
};

/**
 * Remove a subject's static user mapping.
 * @type {import('../types/bindings/Admin').RemoveStaticUserMapping}
 */
export const $removeStaticUserMapping = ({ state }) => {
  state;
};

/**
 * Add AutoId static user mapping to enable dashboards and other AutoId-based functionality.
 * @type {import('../types/bindings/Admin').AddAutoIDStaticUserMapping}
 */
export const $addAutoIdStaticUserMapping = ({ state }) => {
  state;
};

/**
 * Hide generic extension attributes.
 * @type {import('../types/bindings/Admin').HideGenericExtensionAttributes}
 */
export const $hideGenericExtensionAttributes = ({ state }) => {
  state;
};

/**
 * Show generic extension attributes.
 * @type {import('../types/bindings/Admin').ShowGenericExtensionAttributes}
 */
export const $showGenericExtensionAttributes = ({ state }) => {
  state;
};

/**
 * Repair org model.
 * @type {import('../types/bindings/Admin').RepairOrgModel}
 */
export const $repairOrgModel = ({ state }) => {
  state;
};
