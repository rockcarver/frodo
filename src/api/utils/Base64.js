/**
 * Regex to determine if a string is Base64-encoded
 */
const base64regex =
  /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

/**
 * Is input Base64-encoded
 * @param {String} input
 * @returns {boolean} true if input is Base64-encoded, false otherwise
 */
export function isBase64Encoded(input) {
  return base64regex.test(input);
}

/**
 * Base64-encode a string
 * @param {String} input String to base64-encode
 * @returns {String} Base64-encoded input string
 */
export function encode(input, padding = true) {
  if (padding) {
    return Buffer.from(input).toString('base64');
  }
  return Buffer.from(input).toString('base64').replace(/=/g, '');
}

/**
 * Base64-decode a string
 * @param {String} input
 * @returns {String} Base64-decoded input string
 */
export function decode(input) {
  // eslint-disable-next-line no-param-reassign
  if (input.length % 4 !== 0) input += '='.repeat(4 - (input.length % 4));
  return Buffer.from(input, 'base64').toString();
}

let enc;
if (Buffer.isEncoding('base64url')) {
  enc = (input, encoding = 'utf8') =>
    Buffer.from(input, encoding).toString('base64url');
} else {
  const fromBase64 = (base64) =>
    base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  enc = (input, encoding = 'utf8') =>
    fromBase64(Buffer.from(input, encoding).toString('base64'));
}

/**
 * Decode Base64URL
 * @param {*} input the string to decode
 * @returns {String} the decoded string.
 */
export const decodeBase64Url = (input) => `${Buffer.from(input, 'base64')}`;

/**
 * Encode Base65URL
 * @param {*} input the string to encode
 * @returns {String} the encoded string.
 */
export const encodeBase64Url = enc;
