/**
 * @file
 * Actions to take during the 'init' hook.
 */
import { HandleBarsHelpers } from '../helpers/HandlebarsHelpers.mjs';
import { STACharacterEnhancedSheet } from '../documents/actor/STACharacterEnhancedSheet.mjs';
import { registerModuleSettings } from '../settings.mjs';

export const Init = {
  listen() {
    Hooks.once('init', () => {
      registerModuleSettings();
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
  };

  return loadTemplates(paths);
}
