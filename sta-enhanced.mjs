import { STACharacterSheet } from '../../systems/sta/module/actors/sheets/character-sheet.js';
import { HandleBarsHelpers } from './helpers/HandlebarsHelpers.mjs';
import { MigrationRunner } from './migration/MigrationRunner.mjs';
import { MigrationList } from './migration/MigrationList.mjs';
import { MigrationSummary } from './migration/MigrationSummary.mjs';

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

Hooks.once('ready', () => {
  // Determine whether a system migration is required and feasible (later).
  const currentVersion = game.settings.get('sta-enhanced', 'worldSchemaVersion');

  // Store the current world schema version if it hasn't before.
  storeInitialWorldVersions().then(async () => {
    // Ensure only a single GM will run migrations if multiple users are logged in.
    if (game.user !== game.users.activeGM) return;

    const migrationRunner = new MigrationRunner(MigrationList.constructFromVersion(currentVersion));
    if (migrationRunner.needsMigration()) {
      if (currentVersion && currentVersion < MigrationRunner.MINIMUM_SAFE_VERSION) {
        ui.notifications.error(
          `Your STA Enhanced data is from too old a Foundry version and cannot be reliably migrated to the latest version.  An attempt will be made, but errors may occur.`,
          { permanent: true },
        );
      }
      await migrationRunner.runMigration();
      MigrationSummary.reportMigrationStatus();
    }

    // Update the world module version.
    const previous = game.settings.get('sta-enhanced', 'worldModuleVersion');
    const current = game.modules.get('sta-enhanced').version;
    if (foundry.utils.isNewerVersion(current, previous)) {
      await game.settings.set('sta-enhanced', 'worldModuleVersion', current);
    }
  });
});

/**
 * Store the world system and schema versions for the first time.
 *
 * If they're not already present, that is.  This approach is cribbed
 * mostly from the {@link https://github.com/foundryvtt/pf2e/blob/1da6f466291767c1e72ef26d34052c2c64943872/src/scripts/store-versions.ts#L3|PF2E System}'s
 * implementation.
 */
async function storeInitialWorldVersions() {
  if (!game.user.hasRole(CONST.USER_ROLES.GAMEMASTER)) return;

  const storedModuleVersion = game.settings.storage.get('world').getItem('sta-enhanced.worldModuleVersion');
  if (!storedModuleVersion) {
    const module = game.modules.get('sta-enhanced');
    await game.settings.set('sta-enhanced', 'worldModuleVersion', module.version);
  }

  const storedSchemaVersion = game.settings.storage.get('world').getItem('sta-enhanced.worldSchemaVersion');
  if (!storedSchemaVersion) {
    const minVersion = MigrationRunner.RECOMMENDED_SAFE_VERSION;
    const currentVersion = game.actors.size === 0
      ? game.settings.get('sta-enhanced', 'worldSchemaVersion')
      : Math.max(
        Math.min(...new Set(game.actors.map((actor) => {
          console.log('actor', actor.flags['sta-enhanced']?.schemaVersion);
          return actor.flags['sta-enhanced']?.schemaVersion ?? minVersion;
        }))),
        minVersion,
      );

    await game.settings.set('sta-enhanced', 'worldSchemaVersion', currentVersion);
  }
}

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

class STACharacterEnhancedSheet extends STACharacterSheet {
  /** @inheritDoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: super.defaultOptions.classes.concat(['sta-enhanced']),
      tabs: [
        { navSelector: 'nav', contentSelector: '.tab-area', initial: 'character' },
      ],
    }, { insertValues: true });
  }

  /** @inheritDoc */
  async getData(options) {
    const context = super.getData(options);

    const characterFlags = this.object.flags['sta-enhanced']?.character;
    context['sta-enhanced'] = {
      character: {
        gender: characterFlags?.gender,
        personality: characterFlags?.personality,
        enrichedBackstory: await TextEditor.enrichHTML(characterFlags?.backstory, { async: true }),
      },
    };

    return context;
  }

  /** @inheritDoc */
  get template() {
    if (!game.user.isGM && this.actor.limited) return 'systems/sta/templates/actors/limited-sheet.html';
    return 'modules/sta-enhanced/templates/actors/character-sheet.hbs';
  }

  /** @inheritDoc */
  activateListeners($html) {
    this._handleStressMod($html);
    super.activateListeners($html);
  }

  _handleStressMod($html) {
    const $changer = $html.find('#strmod-changer');
    const $modInput = $html.find('#strmod');

    // This probably indicates this verion of the STA system doesn't have the strmod added yet.
    if (!$changer || !$modInput) {
      return;
    }

    const currentMod = parseInt($modInput.val());
    $changer.on('click', (event) => {
      if (event.target.classList.contains('up')) {
        $modInput.val(currentMod + 1);
        this.submit();
      }
      else if (event.target.classList.contains('down')) {
        $modInput.val(currentMod - 1);
        this.submit();
      }
    });
  }
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
  };

  return loadTemplates(paths);
}
