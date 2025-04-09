import { ReputationRoll } from '../dice/ReputationRoll.mjs';

export const RenderChatLog = {
  listen() {
    Hooks.on('renderChatLog', (app, /** @type {HTMLElement} */ html) => {
      ReputationRoll.chatListeners(html);
    });
  },
};
