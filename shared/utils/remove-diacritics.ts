/**
 * Removes diacritics from a string and replaces them with their non-diacritic equivalents.
 *
 * @param str - The input string containing diacritics
 * @returns The string with diacritics removed
 *
 * @example
 * removeDiacritics('café') // returns 'cafe'
 * removeDiacritics('naïve') // returns 'naive'
 * removeDiacritics('São Paulo') // returns 'Sao Paulo'
 */
export function removeDiacritics(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
