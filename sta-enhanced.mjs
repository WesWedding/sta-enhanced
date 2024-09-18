import { STAEnhancedHooks } from './hooks/index.mjs';
import { ReputationRoll } from './dice/ReputationRoll.mjs';
import TaskDie from './dice/ReputationDice.mjs';

STAEnhancedHooks.listen();

CONFIG.Dice.rolls.push(ReputationRoll);
CONFIG.Dice.types.push(TaskDie);
CONFIG.Dice.terms.t = TaskDie;
