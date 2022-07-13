/**
 * Remove duplicates from an array
 * @param {Array<any>} array
 * @returns {Array<any>} deduped array
*/
export const dedupeArr = (array) => [...new Set(array)];