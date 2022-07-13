/**
 * Encode base64 URL
 * @type {(input: string) => Buffer}
 */
const encode = (input) => Buffer.from(input).toString('base64');

/**
 * Decode base64
 * @type {(input: string) => Buffer}
 */
const decode = (input) => Buffer.from(input, 'base64');

export { decode, encode };
