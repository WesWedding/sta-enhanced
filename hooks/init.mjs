/**
 * @file
 * Actions to take during the 'init' hook.
 */
import { HandleBarsHelpers } from '../helpers/HandlebarsHelpers.mjs';
import { STACharacterEnhancedSheet } from '../documents/actor/STACharacterEnhancedSheet.mjs';
import { registerModuleSettings } from '../settings.mjs';
import { STACharacterEnhancedSheet2E } from '../documents/actor/STACharacterEnhancedSheet2E.mjs';

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
  Actors.registerSheet('sta-enhanced', STACharacterEnhancedSheet, {
    types: ['character'],
    label: 'sta-enhanced.SheetClassCharacter',
    makeDefault: true,
  });

  Actors.registerSheet('sta-enhanced', STACharacterEnhancedSheet2E, {
    types: ['character'],
    label: 'sta-enhanced.SheetClassCharacter2e',
    makeDefault: false,
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
    [`sta-enhanced.tabs.reputation`]: 'modules/sta-enhanced/templates/actors/tabs/reputation.hbs',
    [`sta-enhanced.tabs.biography`]: 'modules/sta-enhanced/templates/actors/tabs/biography.hbs',
    [`sta-enhanced.tabs.notes`]: 'modules/sta-enhanced/templates/actors/tabs/notes.hbs',
    [`sta-enhanced.tabs.extras`]: 'modules/sta-enhanced/templates/actors/tabs/extras.hbs',

    [`sta-enhanced.tabs.details2e`]: 'modules/sta-enhanced/templates/actors/tabs/details2e.hbs',
    [`sta-enhanced.tabs.reputation2e`]: 'modules/sta-enhanced/templates/actors/tabs/reputation2e.hbs',
    [`sta-enhanced.tabs.biography2e`]: 'modules/sta-enhanced/templates/actors/tabs/biography2e.hbs',

    [`sta-enhanced.parts.character-items-weapon`]: 'modules/sta-enhanced/templates/actors/parts/character-items-weapon.hbs',
    [`sta-enhanced.parts.character-items-weapon2e`]: 'modules/sta-enhanced/templates/actors/parts/character-items-weapon2e.hbs',
  };

  return loadTemplates(paths);
}
