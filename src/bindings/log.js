/**
 * @file View Identity Cloud logs.
 */

/**
 * List available ID Cloud log sources.
 * @type {import('../types/bindings/Log').List}
 */
export const $list = ({ state }) => {};

/**
 * A binding to tail the identity cloud logs
 * @type {import('../types/bindings/Log').Tail}
 */
export const $tail = ({ state }) => {};
