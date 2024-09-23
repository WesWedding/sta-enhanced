import { STAEnhancedHooks } from './hooks/index.mjs';
import { TaskRoll } from './dice/TaskRoll.mjs';
import { ReputationRoll } from './dice/ReputationRoll.mjs';

STAEnhancedHooks.listen();

CONFIG.Dice.rolls.push(TaskRoll, ReputationRoll);
