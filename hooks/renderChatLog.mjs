import { ItemChatCard } from '../chat/ItemChatCard.mjs';

export const RenderChatLog = {
  listen() {
    Hooks.on('renderChatLog', (app, /** @type {jQuery} */ $html) => {
      ItemChatCard.chatListeners($html);
    });
  },
};
