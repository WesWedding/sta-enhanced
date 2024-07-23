import {STARoll} from '../../../systems/sta/module/roll.js';

/**
 * Structured data for the challenge dice section of the template.
 *
 * @typedef {object} StaChallengeResults
 * @property {string} success
 * @property {string} effects
 * @property {Roll} roll
 */

/**
 * Structured data for the Task dice section of the template.
 *
 * @typedef {object} StaTaskResults
 */

/**
 * Structured data for the rolls section of an item card.
 *
 * @typedef {object} CardRolls
 * @property {StaChallengeResults} challenge
 * @property {StaTaskResults} task
 */

/**
 * Structured data for a STA Enhanced item chat card.
 *
 * @typedef {object} StaChatCardData
 * @property {string} type
 * @property {string} name
 * @property {string} img
 * @property {string} descriptionHtml
 * @property {string} varField
 * @property {Array<string>} tags
 * @property {CardRolls} rolls
 */

export class ItemChatCard {
  /** @type {Item} */
  _item;
  /** @type {StaChatCardData} */
  _data;

  /**
   * Constructor.
   *
   * @param {Item} item
   * @param {Roll} damageRoll
   */
  constructor(item, damageRoll) {
    this._item = item;
    this._data = this._prepareDataFor(this._item, damageRoll);
  }

  /**
   * Prepare data for the chat card that will be sent for a given item.
   *
   * @param {Item} item
   * @param {Roll|undefined} damageRoll
   * @returns {StaChatCardData}
   * @private
   */
  _prepareDataFor(item, damageRoll) {
    // Modifying the item directly causes a client-side corruption of the item's data, until it refreshes from the server.
    // Use a new object instead.
    return {
      type: game.i18n.localize(`sta-enhanced.item.type.${item.type}`),
      name: item.name,
      img: item.img,
      descriptionHtml: item.system.description,
      varField: this._prepareCardVarsHtml(item),
      tags: prepareCardTags(item),
      rolls: {
        challenge: damageRoll ? prepareChallengeRoll(item, damageRoll) : null,
        task: {},
      },
    };
  }

  /**
   * Generates the HTML for the "variables" section of the card.
   *
   * @param {Item} item
   *
   * @returns {string}
   * @private
   */
  _prepareCardVarsHtml(item) {
    let variablePrompt = '';
    let html = '';

    switch (item.type) {
      case 'armor':
        variablePrompt = game.i18n.format('sta.roll.armor.protect');
        html = `${variablePrompt.replace('|#|', item.system.protection)}`;
        break;
      case 'characterweapon':
      case 'shipweapon':
        html = this._prepareWeaponVars(item);
        break;
      default:
        if (item.system.quantity) {
          variablePrompt = game.i18n.format('sta.roll.item.quantity');
          html = `${variablePrompt.replace('|#|', item.system.quantity)}`;
        }
        break;
    }
    return html;
  }

  /**
   * Generates the "variables" section of a card with particulars specific to weapons.
   *
   * @param {Item} item
   *
   * @return {string}
   * @private
   */
  _prepareWeaponVars(item) {
    const owner = item.actor;

    let actorSecurity = 0;
    if (owner.system.disciplines) {
      actorSecurity = parseInt(owner.system.disciplines.security.value);
    }
    else if (owner.system.departments) {
      actorSecurity = parseInt(owner.system.departments.security.value);
    }
    let scaleDamage = 0;
    const calculatedDamage = item.system.damage + actorSecurity + scaleDamage;
    // Create variable div and populate it with localisation to use in the HTML.
    let variablePrompt = game.i18n.format('sta.roll.weapon.damagePlural');
    if (calculatedDamage === 1) {
      variablePrompt = game.i18n.format('sta.roll.weapon.damage');
    }
    return `${variablePrompt.replace('|#|', calculatedDamage)}`;
  }

  /**
   * Sends the chat card to the chat.
   *
   * @param {Actor|undefined} speaker
   *   Override the speaker of the card; defaults to the item owner.
   *
   * @returns {Promise<void>}
   */
  async sendToChat(speaker) {
    const html = await renderTemplate('sta-enhanced.chat.items-generic', { item: this._data });
    const sendAs = speaker ? speaker : this._item.actor;
    await new STARoll().sendToChat(sendAs, html);
  }
}

/**
 * Prepare the tag list  data some items might display.
 *
 * @param {Item} item
 * @returns {Array<string>}
 */
function prepareCardTags(item) {
  const KNOWN_TAGS = Object.freeze(['escalation', 'opportunity']);

  const tags = [];
  for (const property in item.system) {
    if (!KNOWN_TAGS.includes(property) || !item.system[property]) continue;

    // This won't work for characterweapon or shipweapon...
    const label = game.i18n.localize(`sta.item.genericitem.${property}`);
    const tag = Number.isInteger(item.system[property]) ? `${label} ${item.system[property]}` : label;
    tags.push(tag);
  }
  return tags;
}

function prepareChallengeRoll(item, damageRoll) {
  /** @type {StaChallengeResults} */
  const results = {
    success: '',
    effects: '',
    roll: damageRoll,
  };

  const successes = countSuccesses(damageRoll);
  const effects = countEffects(damageRoll);

  // pluralize success string
  results.success = successes + ' ' + i18nPluralize(successes, 'sta.roll.success');

  // pluralize effect string
  if (effects >= 1) {
    results.effects = '<h4 class="dice-total effect"> ' + i18nPluralize(effects, 'sta.roll.effect') + '</h4>';
  }

  results.roll = damageRoll;

  return results;
}

function countEffects(roll) {
  let dice = roll.terms[0].results.map((die) => die.result);
  dice = dice.map((die) => {
    if (die >= 5) {
      return 1;
    }
    return 0;
  });
  return dice.reduce((a, b) => a + b, 0);
}

function countSuccesses(roll) {
  let dice = roll.terms[0].results.map((die) => die.result);
  dice = dice.map((die) => {
    if (die === 2) {
      return 2;
    }
    else if (die === 1 || die === 5 || die === 6) {
      return 1;
    }
    return 0;
  });
  return dice.reduce((a, b) => a + b, 0);
}

function i18nPluralize(count, localizationReference) {
  if (count > 1) {
    return game.i18n.format(localizationReference + 'Plural').replace('|#|', count);
  }
  return game.i18n.format(localizationReference).replace('|#|', count);
}
