import { STAEnhancedHooks } from './hooks/index.mjs';
import { TaskRoll } from './dice/TaskRoll.mjs';
import { ReputationRoll } from './dice/ReputationRoll.mjs';
import STAChatMessage from './documents/STAChatMessage.mjs';

STAEnhancedHooks.listen();

CONFIG.ChatMessage.documentClass = STAChatMessage;
CONFIG.Dice.rolls.push(TaskRoll, ReputationRoll);
