import { WithOptions } from '../state/State';
import { WithSecrets } from '../unions/WithSecrets';
import { WithTenant } from '../unions/WithTenant';
import { WithUsername, WithPassword } from '../unions/WithCredentials';

/**
 * List available ID Cloud log sources.
 *
 * @example ``` js
 * _list({
 *  state: {
 *      key: 'palantir-logger',
 *      secret: 'jdajdiwj9uf8f38ffsasdadkoajfiafj',
 *      tenant: 'example.forgeblock.com',
 *  },
 * });
 * ```
 */
export type List = (
  options: WithOptions<keyof WithTenant | keyof WithSecrets>
) => void;

/**
 * Tail Identity Cloud logs.
 *
 * @example ``` js
 * _tail({
 *  state: {
 *      key: 'palantir-logger',
 *      secret: 'jdajdiwj9uf8f38ffsasdadkoajfiafj',
 *      tenant: 'example.forgeblock.com',
 *  },
 * });
 * ```
 */
export type Tail = (
  options: WithOptions<keyof WithTenant | keyof WithSecrets>
) => void;
