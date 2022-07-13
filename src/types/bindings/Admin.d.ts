import { WithOptions } from '../state/State';
import { WithRealm } from '../unions/WithRealm';
import { WithTenant } from '../unions/WithTenant';
import { WithUsername, WithPassword } from '../unions/WithCredentials';

/**
 * Create an oauth2 client with admin privileges.
 *
 * @example ``` js
 * $createPrivlidgedOAuth2Client({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 * });
 * ```
 */
export type CreatePrivlidgedOAuth2Client = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;

/**
 * List oauth2 clients with admin privileges.
 *
 * @example
 * ```js
 * $listPrivlidgedOAuth2Client({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 * });
 * ```
 */
export type ListPrivlidgedOAuth2Clients = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;

/**
 * Grant an oauth2 client admin privileges.
 *
 * @example
 * ```js
 * $grantPrivlidgedOAuth2Client({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 * });
 * ```
 */
export type GrantPrivlidgedOAuth2Client = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;

/**
 * Revoke admin privileges from an oauth2.
 *
 * @example
 * ```js
 * $revokePrivlidgedOAuth2Client({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 * });
 * ```
 */
export type RevokePrivlidgedOAuth2Client = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;

/**
 * List oauth2 clients with custom privileges.
 *
 * @example
 * ```js
 * $listCustomPrivilegedOAuth2Clients({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 * });
 * ```
 */
export type ListCustomPrivilegedOAuth2Clients = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;

/**
 * List all subjects of static user mappings that are not oauth2 clients.
 *
 * @example
 * ```js
 * $listStaticUserMappings({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 * });
 * ```
 */
export type ListStaticUserMappings = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;

/**
 * Remove a subject's static user mapping.
 *
 * @example
 * ```js
 * $removeStaticUserMapping({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 * });
 * ```
 */
export type RemoveStaticUserMapping = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;

/**
 * Add AutoId static user mapping to enable dashboards and other AutoId-based functionality.
 *
 * @example
 * ```js
 * $addAutoIdStaticUserMapping({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 * });
 * ```
 */
export type AddAutoIDStaticUserMapping = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;

/**
 * Hide generic extension attributes.
 *
 * @example
 * ```js
 * $hideGenericExtensionAttributes({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 * });
 * ```
 */
export type HideGenericExtensionAttributes = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;

/**
 * Show generic extension attributes.
 *
 * @example
 * ```js
 * $showGenericExtensionAttributes({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 * });
 * ```
 */
export type ShowGenericExtensionAttributes = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;

/**
 * Repair org model.
 *
 * @example
 * ```js
 * $repairOrgModel({
 *  state: {
 *      username: 'gandalf',
 *      password: 'maiar',
 *      realm: '/',
 *      tenant: 'example.forgeblock.com',
 *  },
 * });
 * ```
 */
export type RepairOrgModel = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;
