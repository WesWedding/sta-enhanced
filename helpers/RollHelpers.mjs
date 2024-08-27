/**
 * @file
 * Helpers related to interpreting dice results.
 */
import { STARollDialog } from '../../../systems/sta/module/apps/roll-dialog.js';
import { ItemChatCard } from '../chat/ItemChatCard.mjs';

export class RollHelpers {
  /**
   * Roll challenge dice.
   *
   * Optionally wait for Dice So Nice to animate the roll outcome.
   *
   * @param {number} numDice
   * @returns {Roll}
   */
  static async performChallengeRoll(numDice) {
    const damageRoll = await new Roll(`${numDice}d6`).evaluate({});

    if (game.dice3d) {
      await game.dice3d.showForRoll(damageRoll, game.user, true);
    }
    return damageRoll;
  }

  /**
   * Create a dialog to prompt a challenge roll.
   *
   * @param {Item} item
   * @param {number} defaultValue
   * @param {Actor} speaker
   * @returns {Promise<void>}
   */
  static async promptChallengeRoll(item, defaultValue, speaker) {
    // This creates a dialog to gather details regarding the roll and waits for a response
    const rolldialog = await STARollDialog.create(false, defaultValue);
    if (rolldialog) {
      const numDice = rolldialog.get('dicePoolValue');
      const result = await RollHelpers.performChallengeRoll(numDice);
      const card = new ItemChatCard(item, result);
      await card.sendToChat(speaker);
    }
  }

  /**
   * Send a Roll to chat.
   *
   * @param {Actor} speaker
   * @param {string} content
   * @param {object} flags
   * @param {Roll} roll
   * @param {string | null} flavor
   * @param {string} sound
   * @returns {Promise<ChatMessage>}
   */
  static async sendToChat(speaker, content, flags, roll, flavor, sound) {
    let messageProps = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: speaker }),
      content: content,
      sound: sound,
      flags: flags,
    };
    if (typeof roll != 'undefined')
      messageProps.roll = roll;
    if (typeof flavor != 'undefined')
      messageProps.flavor = flavor;
    // Send's Chat Message to foundry, if items are missing they will appear as false or undefined and this not be rendered.
    return ChatMessage.create(messageProps);
  }

  /**
   * @typedef {object} StaChallengeResults
   * @property {number} blanks
   * @property {number} effects
   * @property {number} successes
   */

  /**
   * Parse a Foundry Roll result for Challenge Dice outcomes.
   *
   * @param {Roll} roll
   * @returns {StaChallengeResults}
   */
  static countChallengeResults(roll) {
    /** @type {StaChallengeResults} */
    const results = {
      blanks: 0,
      effects: 0,
      successes: 0,
    };

    let dice = roll.terms[0].results.map((die) => die.result);
    dice.forEach((dieFace) => {
      if ([1, 2].includes(dieFace)) {
        results.successes += dieFace;
      }
      else if ([5, 6].includes(dieFace)) {
        results.successes += 1;
        results.effects += 1;
      }
      else {
        results.blanks += 1;
      }
    });

    return results;
  }

  /**
   * Create a Dialog prompt used to configure and initiate a Reputation roll.
   *
   * @param reputation
   * @returns {Promise<void>}
   */
  static async reputationRollDialog(reputation) {
    const template = 'modules/sta-enhanced/templates/chat/reputation-roll-dialogue.hbs';

    const title = game.i18n.localize('sta-enhanced.reputationDialog.title');

    const content = renderTemplate(template, {});

    const options = {};

    const handleSubmit = (html) => {
      console.log('submit button!!', html);
      return [];
    };

    return new Promise((resolve) => {
      new Dialog({
        title,
        content,
        buttons: {
          roll: {
            label: game.i18n.localize('sta-enhanced.reputationDialog.rollButton'),
            callback: (html) => resolve(handleSubmit(html)),
          },
        },
      }, options).render(true);
    });
  }
}
