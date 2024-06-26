

export class MigrationRunner {
  static LATEST_SCHEMA_VERSION = 0.1;

  static MINIMUM_SAFE_VERSION= 0.1;

  static RECOMMENDED_SAFE_VERSION = 0.1;

  needsMigration(currentVersion) {
    return currentVersion < MigrationRunner.LATEST_SCHEMA_VERSION;
  }


  /**
   * @param {MigrationBase[]}migrations
   * @return {Promise<void>}
   */
  async runMigrations(migrations) {
    if (migrations.length === 0) return;


    /** A roughly estimated "progress max" to reach, for displaying progress. */
    const progress = {
      current: 0,
      max: game.actors.size + game.items.size,
    };

    // Migrate World Actors
    await this.#migrateDocuments(game.actors, migrations, progress);

    // Migrate World Items
    await this.#migrateDocuments(game.items, migrations, progress);
  }

  async runMigration() {
    const schemaVersion = {
      latest: MigrationRunner.LATEST_SCHEMA_VERSION,
      current: game.settings.get("sta-enhanced", "worldSchemaVersion")
    };
    const systemVersion = game.system.version;

    ui.notifications.info(game.i18n.format("sta-enhanced.Migrations.Starting", { version: systemVersion}));

    const migrationsToRun = this.migrations.filter(() => schemaVersion.current < x.version);

    /** @type MigrationBase[][] */
    const migrationPhases = [[]];
    for (const migration of migrationsToRun) {
      migrationPhases[migrationPhases.length - 1].push(migration);
      if (migration.requiresFlush) {
        migrationPhases.push([]);
      }
    }

    for (const migrationPhase of migrationPhases) {
      if (migrationPhase.length > 0) {
        await this.runMigrations(migrationPhase);
      }
    }

  }

  /**
   *
   * @param {Actors|Items} collection
   * @param {MigrationBase[]}migrations
   * @param {Object|Undefined} progress
   * @param {Number } progress.current
   * @param {Number} progress.max
   * @return {Promise<void>}
   */
  async #migrateDocuments(collection, migrations, progress) {
    const documentClass = collection.documentClass;
    const pack = "metadata" in collection ? collection.metadata.id : null;
    const updateGroup = [];

    // PF2E sorts "familiars" to the end of the list, we might need to do something similar in the future.
    // See: https://github.com/foundryvtt/pf2e/blob/1da6f466291767c1e72ef26d34052c2c64943872/src/module/migration/runner/index.ts#L74
    for (const document of collection.contents()) {
      if (updateGroup.length === 100) {
        try {
          await documentClass.updateDocuments(updateGroup, { noHook: true, pack });
          if (progress) {
            progress.current += updateGroup.length;
          }
        } catch (error) {
          console.warn(error);
        } finally {
          updateGroup.length = 0;
        }
      }

      const updated = "prototypeToken" in document ? await this.#migrateActor(migrations, document, { pack }) : await this.#migrateItem(migrations, document);
      if (updated) updateGroup.push(updated);
    }
    if (updateGroup.length > 0) {
      try {
        await documentClass.updateDocuments(updateGroup, { noHook: true, pack });
        if (progress) progress.current += updateGroup.length;
      } catch (error) {
        console.warn(error);
      }
    }
  }

  /**
   * @param {MigrationBase[]} migrations
   * @param {Actor} actor
   * @param {Object|Undefined} options
   * @param {string|Undefined} options.pack
   * @return {Promise<void>}
   */
  async #migrateActor(migrations, actor, options = {}) {
    const pack = options.pack;
    const baseActor = actor.toObject();

    const updatedActor = await (async () => {
      try {
        return await this.getUpdatedActor(baseActor, migrations);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error thrown while migrating ${actor.uuid}: ${error.message}`);
        }
        return null;
      }
    })();
    if (!updatedActor) return null;

    return updatedActor;
  }

  //ActorSourcePF2e
  /**
   *
   * @param actor
   * @param {MigrationBase[]} migrations
   * @return {Promise<void>}
   */
  async getUpdatedActor(actor, migrations) {
    const currentActor = fu.deepClone(actor);

    for (const migration of migrations) {
      await migration.updateActor?.(currentActor);

      // Also do (maybe someday) updates on items belonging to this actor here.
    }
  }
}