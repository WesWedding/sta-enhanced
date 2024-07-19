import { STASharedActorFunctions } from '../../../systems/sta/module/actors/actor.js';
import { STARoll } from '../../../systems/sta/module/roll.js';

/**
 * @typedef {Object} StaChatCardData
 * @property {string} type
 * @property {string} name
 * @property {string} descriptionHtml
 * @property {string} varFieldHtml
 * @property {Array<string>} tags
 */

/**
 *
 * @param event
 * @param type
 * @param id
 * @param speaker
 * @return {{img: *, tagField: null, name: string, varField: null, descriptionHtml, type: string}}
 */

/**
 * Prepare data for the chat card that will be sent for a given item.
 *
 * @param {Event} event
 * @param {string} type
 * @param {number} id
 * @param {Actor} speaker
 * @return StaChatCardData
 */
export function prepareItemDataForChatCard(event, type, id, speaker) {

  /** @type {StaChatCardData} */
  const defaultData = {
    // All items have a name and a type, and a potential description in this system.
    type: undefined,
    name: '????',
    descriptionHtml: undefined,
    // Some items have "variables"; number of dice, quantity of an item, an amount of protection...
    varFieldHtml: undefined,
    // Some items have "tags"; a list of effects or weapon qualities, for instance.
    tagFieldHtml: undefined,
  };

  /** @type {Item} */
  const item = speaker.items.get(id);

  // Modifying the item directly causes a client-side corruption of the item's data, until it refreshes from server.
  // Use a new object instead.
  const data = {
    type: game.i18n.localize(`sta-enhanced.item.type.${item.type}`),
    name: item.name,
    img: item.img,
    descriptionHtml: item.system.description,
    varField: prepareCardVarsHtml(event, item),
    tags: prepareCardTags(event, item),
  };

  return data;
}

/**
 * Generates the HTML for the "variables" section of the card.
 *
 * @param {Event} event
 * @param {Item} item
 * @returns {string}
 */
function prepareCardVarsHtml(event, item) {
  let variablePrompt = '';
  let html = '';

  switch (item.type) {
    case 'armor':
      variablePrompt = game.i18n.format('sta.roll.armor.protect');
      html = `${variablePrompt.replace('|#|', item.system.protection)}`;
      break;
    default:
      if (item.system.quantity) {
        variablePrompt = game.i18n.format('sta.roll.item.quantity');
        html = `${variablePrompt.replace('|#|', item.system.quantity)}`;
      }
      break;
  }
  return html;
}

/**
 * Prepare the tag list  data some items might display.
 *
 * @param {Event} event
 * @param {Item} item
 * @returns {Array<string>}
 */
function prepareCardTags(event, item) {
  const KNOWN_TAGS = Object.freeze(['escalation', 'opportunity']);

  const tags = [];
  for (const property in item.system) {
    if (!KNOWN_TAGS.includes(property) || !item.system[property]) continue;

    // This won't work for characterweapon or shipweapon...
    const label = game.i18n.localize(`sta.item.genericitem.${property}`);
    const tag = Number.isInteger(item.system[property]) ? `${label} ${item.system[property]}` : label;
    tags.push(tag);
  }
  return tags;
}

/**
 * Send a card to the chat, representing the item (or item roll).
 *
 * @param {Actor} speaker
 * @param {StaChatCardData} data
 * @returns {Promise<void>}
 */
export async function sendChatCardForItem(speaker, data) {
  /** @type {StaChatCardData} */
  const defaultData = {
    type: undefined,
    name: '????',
    descriptionHtml: undefined,
    varFieldHtml: undefined,
    tags: undefined,
  };
  const cardData = Object.assign({}, defaultData, data);

  const html = await renderTemplate('sta-enhanced.chat.items-generic', { item: cardData });
  await new STARoll().sendToChat(speaker, html);
}
