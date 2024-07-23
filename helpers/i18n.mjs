/**
 * @file
 * Localization helpers.
 */

export class i18nHelper {
  /**
   * Pluralizes an STA system string.
   *
   * Limited to certain strings.  Cribbed from the STA System (it isn't exported).
   *
   * @param {number} count
   * @param {string} localizationReference
   * @returns {string}
   */
  static i18nPluralize(count, localizationReference) {
    if (count > 1) {
      return game.i18n.format(localizationReference + 'Plural').replace('|#|', count);
    }
    return game.i18n.format(localizationReference).replace('|#|', count);
  }
}
