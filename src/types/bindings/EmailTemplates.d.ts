import { WithOptions } from '../state/State';
import { WithRealm } from '../unions/WithRealm';
import { WithTenant } from '../unions/WithTenant';
import { WithUsername, WithPassword } from '../unions/WithCredentials';

/**
 * List all the email templates in the system.
 *
 * @example ``` js
 * _list({
 *  state: {
 *      tenant: 'palantir-logger',
 *      user: 'example.forgeblock.com',
 *      password: ''
 *  },
 * });
 * ```
 */
export type List = (
  options: WithOptions<
    keyof WithTenant | keyof WithUsername | keyof WithPassword
  >
) => void;

/**
 * Export email templates.
 *
 * @example ``` js
 * _export({
 *  state: {
 *      tenant: 'palantir-logger',
 *      user: 'example.forgeblock.com',
 *      password: ''
 *  },
 * });
 * ```
 */
export type Export = (
  options: WithOptions<
    keyof WithTenant | keyof WithUsername | keyof WithPassword
  >
) => void;

/**
 * Import email template.
 *
 * @example ``` js
 * _import({
 *  state: {
 *      tenant: 'palantir-logger',
 *      user: 'example.forgeblock.com',
 *      password: ''
 *  },
 * });
 * ```
 */
export type Import = (
  options: WithOptions<
    keyof WithTenant | keyof WithUsername | keyof WithPassword
  >
) => void;
