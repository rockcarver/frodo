// @ts-nocheck

/**
 * Encode base64 URL
 * @type {(input: string, encoding: string) => string | Buffer}
 */
let encode;
if (Buffer.isEncoding('base64url')) {
  encode = (input, encoding = 'utf8') =>
    Buffer.from(input, encoding).toString('base64url');
} else {
  /**
   * @param {string} base64
   * @returns {string}
   */
  const fromBase64 = (base64) =>
    base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  encode = (input, encoding = 'utf8') =>
    fromBase64(Buffer.from(input, encoding).toString('base64'));
}

export { decode } from './Base64';
export { encode };
