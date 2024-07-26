/**
 * @file
 * Actions to take during the 'init' hook.
 */
import { HandleBarsHelpers } from '../helpers/HandlebarsHelpers.mjs';
import { STACharacterEnhancedSheet } from '../documents/actor/STACharacterEnhancedSheet.mjs';

export const Init = {
  listen() {
    Hooks.once('init', () => {
      // Register settings
      game.settings.register('sta-enhanced', 'worldSchemaVersion', {
        name: 'sta-enhanced.settings.worldSchemaVersion.Name',
        hint: 'sta-enhanced.settings.worldSchemaVersion.Hint',
        scope: 'world',
        config: true,
        type: Number,
        requiresReload: true,
      });

      game.settings.register('sta-enhanced', 'worldModuleVersion', {
        name: 'World Module Version',
        scope: 'world',
        config: false,
        default: game.modules.get('sta-enhanced').version,
        type: String,
      });

      registerSheets();
      HandleBarsHelpers.RegisterHelpers();
      preloadHandlebarsTemplates();
    });
  },
};

/**
 * Registers the new sheets we need.
 */
function registerSheets() {
  // Register sheets.
  Actors.registerSheet('sta-enhanced', STACharacterEnhancedSheet, {
    types: ['character'],
    label: 'sta-enhanced.SheetClassCharacter',
    makeDefault: true,
  });
}

/**
 * Loads specific template for the different chunks of our handlebars templates.
 *
 * @returns {Promise<Function[]>}
 */
async function preloadHandlebarsTemplates() {
  const paths = {
    [`sta-enhanced.tabs.details`]: 'modules/sta-enhanced/templates/actors/tabs/details.hbs',
    [`sta-enhanced.tabs.belongings`]: 'modules/sta-enhanced/templates/actors/tabs/belongings.hbs',
    [`sta-enhanced.tabs.reputation`]: 'modules/sta-enhanced/templates/actors/tabs/reputation.hbs',
    [`sta-enhanced.tabs.biography`]: 'modules/sta-enhanced/templates/actors/tabs/biography.hbs',

    [`sta-enhanced.parts.character-items-weapon`]: 'modules/sta-enhanced/templates/actors/parts/character-items-weapon.hbs',
    [`sta-enhanced.chat.items-generic`]: 'modules/sta-enhanced/templates/chat/item-card.hbs',
    [`sta-enhanced.chat.parts.weapon-roll`]: 'modules/sta-enhanced/templates/chat/parts/weapon-roll.hbs',
  };

  return loadTemplates(paths);
}
