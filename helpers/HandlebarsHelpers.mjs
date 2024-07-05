/**
 * STA Enhanced's small library of Handlebars helpers.
 */
export class HandleBarsHelpers {
  static RegisterHelpers() {
    Handlebars.registerHelper({
      systemEqOrNewer: HandleBarsHelpers.systemEqOrNewer,
    });
  }


  /**
   * Checks if a given version is greater or equal to the STA System version.
   *
   * Useful for including or excluding certain portions of a character sheet as features change.
   *
   * @param {number} version
   * @returns {boolean}
   */
  static systemEqOrNewer(version) {
    return foundry.utils.isNewerVersion(game.system.version, version);
  }
}
