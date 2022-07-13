import { WithOptions } from '../state/State';
import { WithRealm } from '../unions/WithRealm';
import { WithTenant } from '../unions/WithTenant';
import { WithUsername, WithPassword } from '../unions/WithCredentials';

/**
 * List all the email templates in the system.
 *
 * @example ``` js
 * $list({
 *  state: {
 *      tenant: 'https://palantir-example.com/am',
 *      user: 'gandalf',
 *      password: 'TheAge3021!&^'
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
 * $export({
 *  state: {
 *      tenant: 'https://palantir-example.com/am',
 *      user: 'gandalf',
 *      password: 'TheAge3021!&^'
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
 * $import({
 *  state: {
 *      tenant: 'https://palantir-example.com/am',
 *      user: 'gandalf',
 *      password: 'TheAge3021!&^'
 *  },
 * });
 * ```
 */
export type Import = (
  options: WithOptions<
    keyof WithTenant | keyof WithUsername | keyof WithPassword
  >
) => void;
