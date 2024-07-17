import { STASharedActorFunctions } from '../../../systems/sta/module/actors/actor.js';
import { STARoll } from '../../../systems/sta/module/roll.js';

/**
 * Generate a chat message for an item that has been clicked.
 *
 * @param {Event} event
 * @param {string} type
 * @param {number} id
 * @param {Actor} speaker
 * @returns {Promise<void>}
 */
export async function chatCardForItem(event, type, id, speaker) {
  if (type === 'characterweapon' || type === 'starshipweapon') {
    return new STASharedActorFunctions().rollGenericItem(event, type, id, speaker);
  }

  const item = speaker.items.get(id);
  item.type = game.i18n.localize(`sta-enhanced.item.type.${item.type}`);

  // TODO: Clean this up a bit more.  Integrate the HTML into the template more?
  const variablePrompt = game.i18n.format('sta.roll.item.quantity');
  const variable = `<div class='dice-formula'> `+variablePrompt.replace('|#|', item.system.quantity)+`</div>`;
  item.varField = variable;

  const html = await renderTemplate('sta-enhanced.chat.items-generic', { item: item });
  await new STARoll().sendToChat(speaker, html);
}
