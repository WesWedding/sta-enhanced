/**
 * @file
 * Defines and provides a register helper for Handlebars helpers.
 *
 * Are likely registered in the Init hook.
 */

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
    Handlebars.registerHelper({
      challengeRollList: HandleBarsHelpers.challengeRollList,
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
   * Since Damage gets its own column, this part is left out.
   *
   * E.g. "Unarmed Strike (Melee, 3CD Knockdown, Size 1H, Non-Lethal)"
   *
   * @param {Item} weapon
   * @returns {string}
   */
  static bookWeaponString(weapon) {
    if (weapon.type !== 'characterweapon') return '';

    const qualities = [];
    for (const key in weapon.system.qualities) {
      const value = weapon.system.qualities[key];
      if (value === false || value === 0 || value === '') continue;
      const label = CharacterWeaponHelpers.getLocalizedQualityEffectsLabel(key);

      // If this is a numeric/stackable quality or effect, include the number in the output.
      const string = typeof value === 'number' ? `${label} ${value}` : `${label}`;
      qualities.push(string);
    }

    const qualitiesStr = qualities.join(', ');
    const range = game.i18n.localize(`sta.actor.belonging.weapon.${weapon.system.range}`);

    // Reference: "Unarmed Strike (Melee, 3CD Knockdown, Size 1H, Non-Lethal)"
    return `${weapon.name} (${Strings.joinPotentialEmpties([range, qualitiesStr], ', ')})`;
  }

  /**
   * Render a challenge Roll.
   *
   * @param {Roll} roll
   * @returns {string} Safe String.
   */
  static challengeRollList(roll) {
    let diceString = '';
    const diceFaceTable = [
      '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Success1_small.png" /></li>',
      '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Success2_small.png" /></li>',
      '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Success0_small.png" /></li>',
      '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Success0_small.png" /></li>',
      '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Effect_small.png" /></li>',
      '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Effect_small.png" /></li>',
    ];
    diceString = roll.terms[0].results.map((die) => die.result).map((result) => diceFaceTable[result - 1]).join(' ');
    return new Handlebars.SafeString(diceString);
  }
}
