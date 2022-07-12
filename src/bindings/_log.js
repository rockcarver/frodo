/**
 * @file Bindings to access logging
 */

/**
 * A binding to get a list of log sources
 * @param { &
 * import('../types/unions/WithTenant').WithTenant &
 * import('../types/unions/WithSecrets').WithSecrets
 * } config object
 *
 * @example ``` js
 * _list({
 *  host: 'https://openam-fr-example.forgeblocks.com/am',
 *  key: 'some-key',
 *  secret: '12aw33jgvvjg'
 * });
 * ```
 */
export const _list = ({ tenant, key, secret }) => {
  return {};
};

/**
 * A binding to tail the identity cloud logs
 * @param { &
 * import('../types/unions/WithTenant').WithTenant &
 * import('../types/unions/WithSecrets').WithSecrets
 * } config object
 * @example ``` js
 * _tail({
 *  host: 'https://openam-fr-example.forgeblocks.com/am',
 *  key: 'some-key',
 *  secret: '12aw33jgvvjg'
 * });
 * ```
 */
export const _tail = ({ tenant, key, secret }) => {
  return {};
};
