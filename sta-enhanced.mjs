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
  async getData(options) {
    const context = super.getData(options);

    const characterFlags = this.object.flags['sta-enhanced']?.character;
    context['sta-enhanced'] = {
      'character': {
        gender: characterFlags?.gender,
        personality: characterFlags?.personality,
        enrichedBiography: await TextEditor.enrichHTML(characterFlags?.biography, {async: true}),
      },
    };
    
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
  }

  async _updateObject(event, formData) {
    //  It might not be possible for this to happen, but seems like a good check, anyway.
    if (!game.user.isOwner) {
      return super._updateObject(event, formData);
    }

    // TODO: Is there a way to roll this in to the update behavior so 2 updates aren't triggered?
    this.actor.setFlag("sta-enhanced", "character", {
      "gender": formData["sta-enhanced.character.gender"],
      "personality": formData["sta-enhanced.character.personality"],
      "biography": formData["flags.sta-enhanced.character.biography"],
    });

    return super._updateObject(event, formData);
  }
}

/**
 * Loads specific template for the different chunks of our handlebars templates.
 */
async function preloadHandlebarsTemplates() {
  const paths = {
    [`sta-enhanced.tabs.details`]: "modules/sta-enhanced/templates/actors/tabs/details.hbs",
    [`sta-enhanced.tabs.belongings`]: "modules/sta-enhanced/templates/actors/tabs/belongings.hbs",
    [`sta-enhanced.tabs.reputation`]: "modules/sta-enhanced/templates/actors/tabs/reputation.hbs",
    [`sta-enhanced.tabs.biography`]: "modules/sta-enhanced/templates/actors/tabs/biography.hbs",
  };
  
  return loadTemplates(paths);
}