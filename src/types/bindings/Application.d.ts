import { WithOptions } from '../state/State';
import { WithRealm } from '../unions/WithRealm';
import { WithTenant } from '../unions/WithTenant';
import { WithUsername, WithPassword } from '../unions/WithCredentials';

/**
 * List all applications in a realm.
 *
 * @example ``` js
 * $list({
 *  state: {
 *      tenant: 'palantir',
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
 * Export applications.
 *
 * @example ``` js
 * $export({
 *  state: {
 *      tenant: 'palantir',
 *      realm: '/mordor',
 *      user: 'gandalf',
 *      password: 'TheAge3021!&^'
 *  },
 * });
 * ```
 */
export type Export = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;

/**
 * Import application.
 *
 * @example ``` js
 * $import({
 *  state: {
 *      tenant: 'palantir',
 *      realm: '/mordor',
 *      user: 'gandalf',
 *      password: 'TheAge3021!&^'
 *  },
 * });
 * ```
 */
export type Import = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;
