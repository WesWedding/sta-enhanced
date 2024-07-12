/**
 * @file
 * Helpers aimed specifically at strings.
 */
export class Strings {
  /**
   * Join some potentially empty strings.
   *
   * @param {Array<string>} parts
   * @param {string} delimiter
   * @returns {string}
   */
  static joinPotentialEmpties(parts, delimiter) {
    // Empty or null strings have a truthy value of false, so we can filter em.
    return parts.filter((x) => Boolean(x)).join(delimiter);
  }
}
