import { STARoll } from '../../../systems/sta/module/roll.js';
import { countChallengeResults } from '../helpers/RollHelpers.mjs';
import { ItemHelpers } from '../helpers/ItemHelpers.mjs';
import { CharacterWeaponHelpers } from '../helpers/CharacterWeaponHelpers.mjs';
import { i18nHelper } from '../helpers/i18n.mjs';

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
   * @param {Roll} [damageRoll]
   */
  constructor(item, damageRoll) {
    this._item = item;
    this._damageRoll = damageRoll;
    this._data = this._prepareDataFor(this._item);
  }

  /**
   * Prepare data for the chat card that will be sent for a given item.
   *
   * @param {Item} item
   * @returns {StaChatCardData}
   * @private
   */
  _prepareDataFor(item) {
    // Modifying the item directly causes a client-side corruption of the item's data, until it refreshes from the server.
    // Use a new object instead.
    return {
      type: game.i18n.localize(`sta-enhanced.item.type.${item.type}`),
      name: this._item.name,
      img: this._item.img,
      descriptionHtml: this._item.system.description,
      varField: this._prepareCardVarsHtml(item),
      tags: this._prepareCardTags(item),
      rolls: {
        challenge: this._damageRoll ? this._prepareChallengeRoll(item, this._damageRoll) : null,
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
   * @returns {string}
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
   * Prepare the tag list  data some items might display.
   *
   * @returns {Array<string>}
   * @private
   */
  _prepareCardTags() {
    const tags = [];
    tags.push(...this._prepareGenericTags());

    switch (this._item.type) {
      case 'characterweapon':
      case 'shipweapon':
        tags.push(...this._prepareWeaponTags());
        break;
      default:
        // Do nothing.
        break;
    }
    return tags;
  }

  _prepareGenericTags() {
    const tags = [];
    const labels = ItemHelpers.qualityLocalizationLabels();
    for (const property in this._item.system) {
      if (!Object.hasOwn(labels, property) || !this._item.system[property]) continue;

      const label = game.i18n.localize(labels[property]);
      const tag = Number.isInteger(this._item.system[property]) ? `${label} ${this._item.system[property]}` : label;
      tags.push(tag);
    }
    return tags;
  }

  _prepareWeaponTags() {
    const tags = [];
    const labels = CharacterWeaponHelpers.qualityLocalizationLabels();
    const qualities = this._item.system.qualities;

    for (const property in qualities) {
      if (!Object.hasOwn(labels, property) || !qualities[property]) continue;

      const label = game.i18n.localize(labels[property]);
      const tag = Number.isInteger(qualities[property]) ? `${label} ${qualities[property]}` : label;
      tags.push(tag);
    }

    return tags;
  }

  /**
   * Prepare the challenge roll data for a Chat Card.
   *
   * @returns {StaChallengeResults}
   * @private
   */
  _prepareChallengeRoll() {
    {
      /** @type {StaChallengeResults} */
      const results = {
        success: '',
        effects: '',
        roll: this._damageRoll,
      };

      const counts = countChallengeResults(this._damageRoll);

      // pluralize success string
      results.success = counts.successes + ' ' + i18nHelper.i18nPluralize(counts.successes, 'sta.roll.success');

      // pluralize effect string
      if (counts.effects >= 1) {
        results.effects = '<h4 class="dice-total effect"> ' + i18nHelper.i18nPluralize(counts.effects, 'sta.roll.effect') + '</h4>';
      }

      results.roll = this._damageRoll;

      return results;
    }
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
