import { RollHelpers } from '../helpers/RollHelpers.mjs';
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
 * Structure TBD.
 *
 * @typedef {object} StaTaskResults
 * @property {undefined} TBD
 */

/**
 * Structured data for the rolls section of an item card.
 *
 * @typedef {object} CardRolls
 * @property {StaChallengeResults} challenge
 * @property {StaTaskResults} task
 */

/**
 * Structured item data for an STA Enhanced item chat card.
 *
 * @typedef {object} StaChatCardItemData
 * @property {string} type
 * @property {string} name
 * @property {string} id
 * @property {string} img
 * @property {string} descriptionHtml
 * @property {string} varField
 * @property {Array<string>} tags
 * @property {CardRolls} rolls
 */

/**
 * Structured speaker data for an STA enhanced item chat card.
 *
 * @typedef {object} StaChatCardSpeakerData
 * @property {string} id
 * @property {string=} tokenId
 */

/**
 * Structured data for an STA Enhanced item chat card.
 *
 * @typedef {object} StaChatCardData
 *
 * @property {StaChatCardItemData} item
 * @property {StaChatCardSpeakerData} speaker
 */

export class ItemChatCard {
  /** @type {Item} */
  _item;
  /** @type {StaChatCardItemData} */
  _itemData;

  /**
   * Constructor.
   *
   * @param {Item} item
   * @param {Roll} [damageRoll]
   */
  constructor(item, damageRoll) {
    this._item = item;
    this._damageRoll = damageRoll;
    this._itemData = this._prepareDataFor();
  }

  /**
   * Prepare data for the chat card that will be sent for a given item.
   *
   * @returns {StaChatCardItemData}
   * @private
   */
  _prepareDataFor() {
    // Modifying the item directly causes a client-side corruption of the item's data, until it refreshes from the server.
    // Use a new object instead.
    return {
      type: game.i18n.localize(`sta-enhanced.item.type.${this._item.type}`),
      name: this._item.name,
      img: this._item.img,
      id: this._item.id,
      descriptionHtml: this._item.system.description,
      varField: this._prepareCardVarsHtml(this._item),
      tags: this._prepareCardTags(this._item),
      rolls: {
        challenge: this._damageRoll ? this._prepareChallengeRoll() : null,
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
   * @returns {string}
   * @private
   */
  _prepareWeaponVars() {
    const terms = this._damageRoll.terms[0];
    const numDice = terms.results.length;

    // Create variable div and populate it with localisation to use in the HTML.
    let variablePrompt = game.i18n.format('sta.roll.weapon.damagePlural');
    if (numDice === 1) {
      variablePrompt = game.i18n.format('sta.roll.weapon.damage');
    }
    return `${variablePrompt.replace('|#|', numDice)}`;
  }

  /**
   * Prepare the tag list data some items might display.
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

  /**
   * Return tag strings general to all items.
   *
   * @returns {Array<string>}
   * @private
   */
  _prepareGenericTags() {
    const tags = [];
    const labels = ItemHelpers.genericQualityLocalizationLabels();
    for (const property in this._item.system) {
      if (!Object.hasOwn(labels, property) || !this._item.system[property]) continue;

      const label = game.i18n.localize(labels[property]);
      const tag = Number.isInteger(this._item.system[property]) ? `${label} ${this._item.system[property]}` : label;
      tags.push(tag);
    }
    return tags;
  }

  /**
   * Return tag strings specific to weapons.
   *
   * @returns {Array<string>}
   * @private
   */
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

      const counts = RollHelpers.countChallengeResults(this._damageRoll);

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
    // Update data with speaker.
    const sendAs = speaker ? speaker : this._item.actor;
    const speakerId = sendAs ? sendAs.id : '';
    const token = sendAs.token;

    /** @type {StaChatCardSpeakerData} */
    const speakerData = {
      id: speakerId,
      tokenId: token?.uuid || null,
    };
    /** @type {StaChatCardData} */
    const cardData = {
      item: this._itemData,
      speaker: speakerData,
    };
    const flags = {
      'sta-enhanced': {
        itemData: this._item.toObject(),
      },
    };
    const html = await renderTemplate('sta-enhanced.chat.items-generic', cardData);
    return await RollHelpers.sendToChat(sendAs, html, flags);
  }

  /**
   * Attach chat card listeners to chat in a Hook somewhere.
   *
   * @param {jQuery} html
   */
  static chatListeners(html) {
    html.on('click', '.chat.card button[data-action]', this._onChatCardAction.bind(this));
  }

  /**
   * Handler for card action button clicks.
   *
   * @param {Event} event
   * @returns {Promise<void>}
   * @private
   */
  static async _onChatCardAction(event) {
    event.preventDefault();

    // Extract card data
    const button = event.currentTarget;

    button.disabled = true;
    const card = button.closest('.chat.card');
    const messageId = card.closest('.message').dataset.messageId;
    const message = game.messages.get(messageId);
    const action = button.dataset.action;

    const actor = await this._getChatCardActor(card);

    // Restrict rerolls to users with permission.
    if (!(game.user.isGM || actor.isOwner)) return;

    const storedData = message.getFlag('sta-enhanced', 'itemData');
    let item = storedData ? new Item(storedData, { parent: actor }) : actor.items.get(card.dataset.itemId);
    if (!item) {
      ui.notifications.error('sta-enhanced.cardWarningItem', { item: card.dataset.itemId, name: actor.name });
    }

    // Do the action.
    // Currently, we only recognize challenge rerolls, maybe there will be more someday.
    switch (action) {
      default:
        await RollHelpers.promptChallengeRoll(item, 0, actor);
        break;
    }

    // Re-enable the button when we're done.
    button.disabled = false;
  }

  /**
   * Get the author of a chat card.
   *
   * @param {HTMLElement} card
   * @returns {Actor|null}
   * @private
   */
  static async _getChatCardActor(card) {
    // Could be a token, a "synthetic" actor
    if (card.dataset.tokenId) {
      const token = await fromUuid(card.dataset.tokenId);
      if (!token) return null;
      return token.actor;
    }

    // Could be an actual World actor.
    const actorId = card.dataset.actorId;
    return game.actors.get(actorId) || null;
  }
}
