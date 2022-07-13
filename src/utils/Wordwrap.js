/**
 * Wraps a string at a given length
 * @param {string} str the input string to word wrap
 * @param {number} len the threshold before wrapping
 * @returns {string}
 */
export default (str, len) =>
  (str.match(new RegExp(`(\\S.{0,${len - 1}})(?=\\s+|$)`, 'g')) || []).join(
    '\n'
  );
