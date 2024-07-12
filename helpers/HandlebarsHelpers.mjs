import { CharacterWeaponHelpers } from './CharacterWeaponHelpers.mjs';
import { Strings } from './Strings.mjs';

/**
 * STA Enhanced's small library of Handlebars helpers.
 */
export class HandleBarsHelpers {
  static RegisterHelpers() {
    Handlebars.registerHelper({
      systemEqOrNewer: HandleBarsHelpers.systemEqOrNewer,
    });
    Handlebars.registerHelper({
      bookWeaponString: HandleBarsHelpers.bookWeaponString,
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

  /**
   * Generate a descriptive string for a weapon.
   *
   * This string should match the style and order of information given for NPC
   * attacks found in the Tricorder Digest book (the most recent 1E core book).
   *
   * E.g. "Unarmed Strike (Melee, 3CD Knockdown, Size 1H, Non-Lethal)"
   *
   * @param {Item} weapon
   * @returns {string}
   */
  static bookWeaponString(weapon) {
    if (weapon.type !== 'characterweapon') return '';

    const currentEffects = [];
    const currentQualities = [];
    // The system doesn't differentiate between effects and qualities, but we're going to.
    for (const key in weapon.system.qualities) {
      const value = weapon.system.qualities[key];
      if (value === false || value === 0 || value === '') continue;
      const targetPool = CharacterWeaponHelpers.KNOWN_BOOK_QUALITIES.includes(key) ? currentQualities : currentEffects;
      const label = CharacterWeaponHelpers.getLocalizedQualityEffectsLabel(key);

      // If this is a numeric/stackable quality or effect, include the number in the output.
      const string = typeof value === 'number' ? `${label} ${value}` : `${label}`;
      targetPool.push(string);
    }

    // Assemble all of our lists and sub-lists, some of which could be empty.
    const qualitiesStr = Strings.joinPotentialEmpties(currentQualities, ', ');
    const effectsStr = Strings.joinPotentialEmpties(currentEffects, ', ');
    const weaponStats = Strings.joinPotentialEmpties([`${effectsStr}`, qualitiesStr], ', ');

    const range = weapon.system.range
      ? game.i18n.localize('sta.actor.belonging.weapon.ranged')
      : game.i18n.localize('sta.actor.belonging.weapon.melee');

    // Reference: "Unarmed Strike (Melee, 3CD Knockdown, Size 1H, Non-Lethal)"
    return `${weapon.name} (${Strings.joinPotentialEmpties([range, weaponStats], ', ')})`;
  }
}
