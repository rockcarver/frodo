/**
 * List all realms.
 *
 * @example ``` js
 * $list({
 *  state: {
 *      tenant: 'https://palantir-example.com/am',
 *      realm: '/mordor',
 *      user: 'gandalf',
 *      password: 'TheAge3021!&^'
 *  },
 * });
 * ```
 */
export type List = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;

/**
 * Get information about a realm.
 *
 * @example ``` js
 * $info({
 *  state: {
 *      tenant: 'https://palantir-example.com/am',
 *      realm: '/mordor',
 *      user: 'gandalf',
 *      password: 'TheAge3021!&^'
 *  },
 * });
 * ```
 */
export type Info = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;

/**
 * Add custom DNS domain to a realm.
 *
 * @example ``` js
 * $addCustomDomain({
 *  state: {
 *      tenant: 'https://palantir-example.com/am',
 *      realm: '/mordor',
 *      user: 'gandalf',
 *      password: 'TheAge3021!&^'
 *  },
 * });
 * ```
 */
export type AddCustomDomain = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;

/**
 * Remove custom DNS domain to a realm.
 *
 * @example ``` js
 * $removeCustomDomain({
 *  state: {
 *      tenant: 'https://palantir-example.com/am',
 *      realm: '/mordor',
 *      user: 'gandalf',
 *      password: 'TheAge3021!&^'
 *  },
 * });
 * ```
 */
export type RemoveCustomDomain = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;
