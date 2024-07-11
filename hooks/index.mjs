import { Init } from './init.mjs';
import { Setup } from './setup.mjs';
import { Ready } from './ready.mjs';

export const STAEnhancedHooks = {
  listen() {
    Init.listen();
    Setup.listen();
    Ready.listen();
  },
};
