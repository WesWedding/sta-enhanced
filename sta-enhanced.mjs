import { STACharacterSheet } from '../../systems/sta/module/actors/sheets/character-sheet.js'

Hooks.once("init", () => {
  
  // Register sheets.
  Actors.registerSheet("sta-enhanced", STACharacterEnhancedSheet, {
    types: ["character"],
    label: "ENHANCED CHAR SHEET", // TODO: Localize.
    // makeDefault: true
  });
  
  // Preload Handlebars partials.
  preloadHandlebarsTemplates();
});

class STACharacterEnhancedSheet extends STACharacterSheet {
  /** @inheritDoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: super.defaultOptions.classes.concat(["sta-enhanced"]),
      tabs: [
        {navSelector: "nav", contentSelector: ".tab-area", initial: "character"}
      ],
    }, {insertValues: true});
  }
  
  /** @inheritDoc */
  getData(options = {}) {
    const context = super.getData(options);
    
    return context;
  }
  
  /** @inheritDoc */
  get template() {
    if ( !game.user.isGM && this.actor.limited ) return "systems/sta/templates/actors/limited-sheet.html";
    return "modules/sta-enhanced/templates/actors/character-sheet.hbs";
  }
}


async function preloadHandlebarsTemplates() {
  const paths = {
    [`sta-enhanced.tabs.details`]: "modules/sta-enhanced/templates/actors/tabs/details.hbs",
    [`sta-enhanced.tabs.belongings`]: "modules/sta-enhanced/templates/actors/tabs/belongings.hbs",
    [`sta-enhanced.tabs.reputation`]: "modules/sta-enhanced/templates/actors/tabs/reputation.hbs",
    [`sta-enhanced.tabs.biography`]: "modules/sta-enhanced/templates/actors/tabs/biography.hbs",
  };
  
  return loadTemplates(paths);
}