import { STASharedActorFunctions } from '../../../systems/sta/module/actors/actor.js';

/**
 * A placeholder for old functionality that was successfully ported to the
 * STA System directly.  Here to support old chat cards that might still be in
 * the chat log.
 *
 * @deprecated since version 0.1.10, to be removed in version 0.2.0+.
 */
export class ItemChatCard {
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
   *
   * @deprecated since version 0.1.10, to be removed in version 0.2.0+.
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
      ui.notifications.error('sta-enhanced.notifications.warning.cardItem', { item: card.dataset.itemId, name: actor.name });
    }

    const STAActor = new STASharedActorFunctions();

    // Do the action.
    // Currently, we only recognize challenge rerolls, maybe there will be more someday.
    switch (action) {
      default:
        /** @deprecated */
        await STAActor.rollChallengeRoll(event, item.name, 0, actor);
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
