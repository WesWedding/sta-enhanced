import { STARoll } from '../../../systems/sta/module/roll.js';

/** @typedef {Object} StaChallengeResults
 * @property {string} success
 * @property {string} effects
 */

/** @typedef {Object} StaTaskResults
 */

/** @typedef {Object} CardRolls
 * @property {StaChallengeResults} challenge
 * @property {StaTaskResults} task
 */

/**
 * @typedef {Object} StaChatCardData
 * @property {string} type
 * @property {string} name
 * @property {string} img
 * @property {string} descriptionHtml
 * @property {string} varField
 * @property {Array<string>} tags
 * @property {CardRolls} rolls
 */

/**
 *
 * @param event
 * @param type
 * @param id
 * @param speaker
 * @return {{img: *, tagField: null, name: string, varField: null, descriptionHtml, type: string}}
 */

export function getActorDamageForItem(actor, itemId) {
  const item = actor.items.get(itemId);
  let actorSecurity = 0;
  if (actor.system.disciplines) {
    actorSecurity = parseInt(actor.system.disciplines.security.value);
  }
  else if (actor.system.departments) {
    actorSecurity = parseInt(actor.system.departments.security.value);
  }
  let scaleDamage = 0;
  if (item.system.includescale && actor.system.scale) scaleDamage = parseInt(actor.system.scale);
  return item.system.damage + actorSecurity + scaleDamage;
}

/**
 * Prepare data for the chat card that will be sent for a given item.
 *
 * @param {Event} event
 * @param {string} type
 * @param {number} id
 * @param {Actor} speaker
 * @param {Roll|undefined} damageRoll
 * @return StaChatCardData
 */
export function prepareItemDataForChatCard(event, type, id, speaker, damageRoll) {
  /** @type {Item} */
  const item = speaker.items.get(id);

  // Modifying the item directly causes a client-side corruption of the item's data, until it refreshes from server.
  // Use a new object instead.
  /** @type {StaChatCardData} */
  const data = {
    type: game.i18n.localize(`sta-enhanced.item.type.${item.type}`),
    name: item.name,
    img: item.img,
    descriptionHtml: item.system.description,
    varField: prepareCardVarsHtml(event, item, speaker),
    tags: prepareCardTags(event, item),
    rolls: {
      challenge: damageRoll ? prepareChallengeRoll(item, speaker, damageRoll) : null,
      task: {},
    },
  };

  return data;
}

/**
 * Generates the HTML for the "variables" section of the card.
 *
 * @param {Event} event
 * @param {Item} item
 * @param {Actor} speaker
 *
 * @returns {string}
 */
function prepareCardVarsHtml(event, item, speaker) {
  let variablePrompt = '';
  let html = '';

  switch (item.type) {
    case 'armor':
      variablePrompt = game.i18n.format('sta.roll.armor.protect');
      html = `${variablePrompt.replace('|#|', item.system.protection)}`;
      break;
    case 'characterweapon':
    case 'shipweapon':
      html = prepareWeaponVars(item, speaker);
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

function prepareWeaponVars(item, speaker) {
  let actorSecurity = 0;
  if (speaker.system.disciplines) {
    actorSecurity = parseInt(speaker.system.disciplines.security.value);
  }
  else if (speaker.system.departments) {
    actorSecurity = parseInt(speaker.system.departments.security.value);
  }
  let scaleDamage = 0;
  const calculatedDamage = item.system.damage + actorSecurity + scaleDamage;
  // Create variable div and populate it with localisation to use in the HTML.
  let variablePrompt = game.i18n.format('sta.roll.weapon.damagePlural');
  if (calculatedDamage === 1) {
    variablePrompt = game.i18n.format('sta.roll.weapon.damage');
  }
  return `${variablePrompt.replace('|#|', calculatedDamage)}`;
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

function prepareChallengeRoll(item, speaker, damageRoll) {

  /** @type {StaChallengeResults} */
  const results = {
    success: '',
    effects: '',
  };

  const successes = countSuccesses(damageRoll);
  const effects = countEffects(damageRoll);
  // const diceString = getDiceImageListFromChallengeRoll(damageRoll);

  // pluralize success string
  results.success = successes + ' ' + i18nPluralize(successes, 'sta.roll.success');

  // pluralize effect string
  if (effects >= 1) {
    results.effects = '<h4 class="dice-total effect"> ' + i18nPluralize(effects, 'sta.roll.effect') + '</h4>';
  }

  return results;
}

function i18nPluralize(count, localizationReference) {
  if (count > 1) {
    return game.i18n.format(localizationReference + 'Plural').replace('|#|', count);
  }
  return game.i18n.format(localizationReference).replace('|#|', count);
}

function prepareTaskRoll() {return undefined}

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
    type: 'Unknown',
    name: '????',
    img: '',
    descriptionHtml: '',
    varField: '',
    tags: [],
    rolls: {
      challenge: {
        success: '',
        effects: '',
      },
      task: {},
    },
  };
  const cardData = Object.assign({}, defaultData, data);

  const html = await renderTemplate('sta-enhanced.chat.items-generic', { item: cardData });
  await new STARoll().sendToChat(speaker, html);
}

function countEffects(roll) {
  let dice = roll.terms[0].results.map((die) => die.result);
  dice = dice.map((die) => {
    if (die >= 5) {
      return 1;
    }
    return 0;
  });
  return dice.reduce((a, b) => a + b, 0);
}

function countSuccesses(roll) {
  let dice = roll.terms[0].results.map((die) => die.result);
  dice = dice.map((die) => {
    if (die === 2) {
      return 2;
    }
    else if (die === 1 || die === 5 || die === 6) {
      return 1;
    }
    return 0;
  });
  return dice.reduce((a, b) => a + b, 0);
}

function getDiceImageListFromChallengeRoll(roll) {
  let diceString = '';
  const diceFaceTable = [
    '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Success1_small.png" /></li>',
    '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Success2_small.png" /></li>',
    '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Success0_small.png" /></li>',
    '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Success0_small.png" /></li>',
    '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Effect_small.png" /></li>',
    '<li class="roll die d6"><img src="systems/sta/assets/icons/ChallengeDie_Effect_small.png" /></li>',
  ];
  diceString = roll.terms[0].results.map((die) => die.result).map((result) => diceFaceTable[result - 1]).join(' ');
  return diceString;
}
