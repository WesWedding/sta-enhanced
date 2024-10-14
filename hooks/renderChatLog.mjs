import { ItemChatCard } from '../chat/ItemChatCard.mjs';
import { ReputationRoll } from '../dice/ReputationRoll.mjs';

export const RenderChatLog = {
  listen() {
    Hooks.on('renderChatLog', (app, /** @type {jQuery} */ $html) => {
      ItemChatCard.chatListeners($html);
      ReputationRoll.chatListeners($html);
    });
  },
};
