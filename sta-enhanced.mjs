import { STAEnhancedHooks } from './hooks/index.mjs';
import { ReputationRoll } from './rolls/ReputationRoll.mjs';

STAEnhancedHooks.listen();

CONFIG.Dice.rolls.push(ReputationRoll);
