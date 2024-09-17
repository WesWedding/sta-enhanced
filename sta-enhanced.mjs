import { STAEnhancedHooks } from './hooks/index.mjs';
import { ReputationRoll } from './dice/ReputationRoll.mjs';

STAEnhancedHooks.listen();

CONFIG.Dice.rolls.push(ReputationRoll);
