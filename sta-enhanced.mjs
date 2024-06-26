import { STACharacterSheet } from '../../systems/sta/module/actors/sheets/character-sheet.js'
import { STAActor } from '../../systems/sta/module/actors/actor.js'
import { MigrationRunner } from './migrations/MigrationRunner.mjs'

/**
 * Store the world system and schema versions for the first time.
 *
 * Many thanks to the PF2E system for this implementation.
 * @link https://github.com/foundryvtt/pf2e/blob/1da6f466291767c1e72ef26d34052c2c64943872/src/scripts/store-versions.ts#L3
 */
async function storeInitialWorldVersions() {
  if (!game.user.hasRole(CONST.USER_ROLES.GAMEMASTER)) return;

  const storedModuleVersion = game.settings.storage.get("world").getItem("sta-enhanced.worldModuleVersion");
  console.log("stored module version");
  if (!storedModuleVersion) {
    // await game.settings.set("sta-advanced", "worldModuleVersion", game.modules["sta-enhanced"].version);
  }

  const storedSchemaVersion = game.settings.storage.get("world").getItem("sta-enhanced.worldSchemaVersion");
  console.log("stored schema version", storedSchemaVersion);
  if (!storedSchemaVersion) {
    console.log("no schema found, setting default");
    const minVersion = MigrationRunner.RECOMMENDED_SAFE_VERSION;
    const currentVersion = game.actors.size === 0
        ? game.settings.get("sta-enhanced", "worldSchemaVersion")
        : Math.max(
            Math.min(...new Set(game.actors.map((actor) => {
              console.log("actor", actor.flags["sta-enhanced"]?.schemaVersion);
              return actor.flags["sta-enhanced"]?.schemaVersion ?? minVersion
            }))),
            minVersion
        );

    console.log("todo: set the schema to", currentVersion);
    await game.settings.set("sta-enhanced", "worldSchemaVersion", currentVersion);
  }
}

Hooks.once("init", () => {

  console.log(game.modules)

  // Register settings
  game.settings.register("sta-enhanced", "worldSchemaVersion", {
    name: "sta-enhanced.settings.worldSchemaVersion.Name",
    hint: "sta-enhanced.settings.worldSchemaVersion.Hint",
    scope: "world",
    config: true,
    default: MigrationRunner.LATEST_SCHEMA_VERSION,
    type: Number,
    requiresReload: true,
  });


  // Register sheets.
  Actors.registerSheet("sta-enhanced", STACharacterEnhancedSheet, {
    types: ["character"],
    label: "sta-enhanced.SheetClassCharacter",
    // makeDefault: true
  });

  console.log("Has type data????", STAActor.hasTypeData);

  console.log("CONFIG.Actor.dataModels", CONFIG.Actor.dataModels);


  
  // Preload Handlebars partials.
  preloadHandlebarsTemplates();
});

Hooks.once("ready", () => {
  console.log("ready");


  // Determine whether a system migration is required and feasible.
  const currentVersion = game.settings.get("sta-enhanced", "worldSchemaVersion");
  console.log("worldSchema version detected at ready", currentVersion);

  // Run flag data migrations.
  storeInitialWorldVersions().then(async () => {
    // Ensure only a single GM will run migrations if multiple users are logged in.
    if (game.user !== game.users.activeGM) return;

    const migrationRunner = new MigrationRunner();
    if (migrationRunner.needsMigration()) {
      if (currentVersion && currentVersion < MigrationRunner.MINIMUM_SAFE_VERSION) {
        ui.notifications.error(
          `Your STA Enhanced data is from too old a Foundry version and cannot be reliably migrated to the latest version.  An attempt will be made, but errors may occur.`,
            {permanent: true},
        );
      }
      await migrationRunner.runMigration();
    }
  });
});

Hooks.on('createActor', (actor, options, userId) => {
  if (actor.type !== 'character') return;
  console.warn('STA Character created!', actor, options, userId);
});

Hooks.on('updateActor', (actor, change, options, userId) => {
  if (actor.type !== 'character') return;


  console.warn('STA character updated!', actor, change, options, userId);
})

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