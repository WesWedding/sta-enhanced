import { Init } from './init.mjs';
import { Setup } from './setup.mjs';
import { Ready } from './ready.mjs';
import { RenderChatLog } from './renderChatLog.mjs';

export const STAEnhancedHooks = {
  listen() {
    Init.listen();
    Setup.listen();
    Ready.listen();
    RenderChatLog.listen();
  },
};
