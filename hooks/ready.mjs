/**
 * @file
 * Actions to take during the 'ready' hook.
 */
import { MigrationRunner } from '../migration/MigrationRunner.mjs';
import { MigrationList } from '../migration/MigrationList.mjs';
import { MigrationSummary } from '../migration/MigrationSummary.mjs';

export const Ready = {
  listen() {
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
      // End storeInitialWorldVersions().
    });
  },
};

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
