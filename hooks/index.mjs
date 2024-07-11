import { Init } from './init.mjs';
import { Ready } from './ready.mjs';

export const STAEnhancedHooks = {
  listen() {
    Init.listen();
    Ready.listen();
  },
};
