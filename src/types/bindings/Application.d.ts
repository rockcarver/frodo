import { WithOptions } from '../state/State';
import { WithRealm } from '../unions/WithRealm';
import { WithTenant } from '../unions/WithTenant';
import { WithUsername, WithPassword } from '../unions/WithCredentials';

/**
 * List all applications in a realm.
 *
 * @example ``` js
 * _list({
 *  state: {
 *      tenant: 'palantir-logger',
 *      realm: 'jdajdiwj9uf8f38ffsasdadkoajfiafj',
 *      user: 'example.forgeblock.com',
 *      password: ''
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
 * _export({
 *  state: {
 *      tenant: 'palantir-logger',
 *      realm: 'jdajdiwj9uf8f38ffsasdadkoajfiafj',
 *      user: 'example.forgeblock.com',
 *      password: ''
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
 * _import({
 *  state: {
 *      tenant: 'palantir-logger',
 *      realm: 'jdajdiwj9uf8f38ffsasdadkoajfiafj',
 *      user: 'example.forgeblock.com',
 *      password: ''
 *  },
 * });
 * ```
 */
export type Import = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;
