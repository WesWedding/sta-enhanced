export class CharacterWeaponHelpers {
  /**
   * Get the appropriate label for a "quality" on an item.
   *
   * The system combines Effects and Qualities into a single system.qualities
   * object, hence the scare quotes.
   *
   * @param {string} key
   * @returns {string}
   */
  static getLocalizedQualityEffectsLabel(key) {
    const langStrings = Object.freeze({
      accurate: 'sta.actor.belonging.weapon.accurate',
      area: 'sta.actor.belonging.weapon.area',
      charge: 'sta.actor.belonging.weapon.charge',
      cumbersome: 'sta.actor.belonging.weapon.cumbersome',
      deadly: 'sta.actor.belonging.weapon.deadly',
      debilitating: 'sta.actor.belonging.weapon.debilitating',
      escalation: 'sta.item.genericitem.escalation',
      grenade: 'sta.actor.belonging.weapon.grenade',
      hiddenx: 'sta.actor.belonging.weapon.hiddenx',
      inaccurate: 'sta.actor.belonging.weapon.inaccurate',
      intense: 'sta.actor.belonging.weapon.intense',
      knockdown: 'sta.actor.belonging.weapon.knockdown',
      nonlethal: 'sta.actor.belonging.weapon.nonlethal',
      opportunity: 'sta.item.genericitem.opportunity',
      piercingx: 'sta.actor.belonging.weapon.piercingx',
      viciousx: 'sta.actor.belonging.weapon.viciousx',
    });

    if (!Object.keys(langStrings).includes(key)) return key;

    return game.i18n.localize(langStrings[key]);
  }
}
