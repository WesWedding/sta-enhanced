import { STACharacterSheet } from '../../systems/sta/module/actors/sheets/character-sheet.js'
import { STAActor } from '../../systems/sta/module/actors/actor.js'

Hooks.once("init", () => {

  // Register sheets.
  Actors.registerSheet("sta-enhanced", STACharacterEnhancedSheet, {
    types: ["character"],
    label: "sta-enhanced.SheetClassCharacter",
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

  /** @inheritDoc */
  activateListeners($html) {
    super.activateListeners($html);

    const html = $html[0];

    // New inputs need new handlers
    flagInputHandler(this.actor, html, "gender");
  }
}

/**
 * Set a listener for a flag input.
 *
 * Stops the form change handler from triggering a 2nd update by preventing propagation.
 *
 * @param {Actor} actor
 * @param {HTMLElement} html
 * @param {string} flagName
 */
function flagInputHandler(actor, html, flagName) {
  html.querySelector(`input[name="sta-enhanced.flags.${flagName}"]`)?.addEventListener("change", (/** Event */) => {
    event.stopImmediatePropagation();
    actor.setFlag("sta-enhanced", flagName, event.target.value);
  })
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