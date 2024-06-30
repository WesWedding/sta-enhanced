/**
 * @typedef {Object} NewDocumentMigrationRecord
 * @property version
 * @property previous
 */

/**
 * @typedef {Object} MigratedDocumentMigrationRecord
 * @param {number | null} version
 * @param {{
 *   schema: number | null,
 *   system: string | null,
 *   foundry: string | null
 * } | null}
 */

/**
 * @typedef {NewDocumentMigrationRecord | MigratedDocumentMigrationRecord} MigrationRecord
 */

export class MigrationRunner {
  static LATEST_SCHEMA_VERSION = 0.1;

  static MINIMUM_SAFE_VERSION= 0.0;

  static RECOMMENDED_SAFE_VERSION = 0.0;

  /** @type {MigrationBase[]} */
  migrations;

  /**
   * @param {MigrationBase[]} migrations
   */
  constructor(migrations) {
    this.migrations = migrations.sort((a, b) => a.version - b.version);
  }

  needsMigration() {
    const currentVersion = game.settings.get("sta-enhanced", "worldSchemaVersion");
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

    // Migrate tokens, especially synthetic actors attached.
    for (const /** @type Scene */ scene of game.scenes) {
      for (const /** @type TokenDocument */ token  of scene.tokens) {
        const { actor } = token;
        if (!actor) continue;

        const wasSuccessful = !!(await this.#migrateSceneToken(token, migrations));
        if (!wasSuccessful) continue;

        const deltaSource = token.delta?._source;
        const hasMigratableData =
          (!!deltaSource && !!deltaSource.flags['sta-enhanced']) ||
          ((deltaSource ?? {}).items ?? []).length > 0 ||
          Object.keys(deltaSource?.system ?? {}).length > 0;

        if (!actor.isToken) return;
        if (hasMigratableData) {
          const updated = await this.#migrateActor(migrations, actor);
          if (updated) {
            try {
              await actor.update(updated, { noHook: true });
            } catch (error) {
              console.warn(error);
            }
          }
        }
      }
    }

  }

  async runMigration() {
    const schemaVersion = {
      latest: MigrationRunner.LATEST_SCHEMA_VERSION,
      current: game.settings.get("sta-enhanced", "worldSchemaVersion")
    };
    const systemVersion = game.system.version;

    ui.notifications.info(game.i18n.format("sta-enhanced.Migrations.Starting", { version: systemVersion}));

    const migrationsToRun = this.migrations.filter((x) => schemaVersion.current < x.version);

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

    await game.settings.set("sta-enhanced", "worldSchemaVersion", schemaVersion.latest);
  }

  /**
   *
   * @param {Actors} collection
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

    for (const document of collection.contents) {
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

      const updated = await this.#migrateActor(migrations, document, { pack });
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

  /**
   * @param {TokenDocument} token
   * @param {MigrationBase[]} migrations
   * @return Promise<foundry.documents.TokenSource | null>
   */
  async #migrateSceneToken(token, migrations) {
    if (!migrations.some((migration) => !!migration.updateToken)) return token.toObject();

    try {
      const updatedToken = await this.getUpdatedToken(token, migrations);
      const changes = foundry.utils.diffObject(token.toObject(), updatedToken);

      if (Object.keys(changes).length === 0) {
        return updatedToken;
      }

      try {
        await token.update(changes, { noHook: true });
      } catch (error) {
        console.warn(error);
      }

    } catch (error) {
      console.error(error);
      return null;
    }
  }

  //ActorSourcePF2e
  /**
   *
   * @param actor
   * @param {MigrationBase[]} migrations
   * @return {Promise<Actor>}
   */
  async getUpdatedActor(actor, migrations) {
    const currentActor = foundry.utils.deepClone(actor);

    for (const migration of migrations) {
      await migration.updateActor(currentActor);
      // Also do (maybe someday) updates on items belonging to this actor here.
    }

    // Keep schema records from being added to compendium JSON documents.
    if (!"game" in globalThis) {
      return currentActor;
    }

    const latestMigration = migrations.slice(-1)[0];
    if (!currentActor.flags['sta-enhanced']) currentActor.flags['sta-enhanced'] = {};
    currentActor.flags['sta-enhanced']._migration ??= { version: null, previous: null };
    this.#updateMigrationRecord(currentActor.flags['sta-enhanced']._migration, latestMigration);

    for (const itemSource of currentActor.items) {
      if (!itemSource.flags['sta-enhanced']) itemSource.flags['sta-enhanced'] = {};
      itemSource.flags['sta-enhanced']._migration ??= {version: null, previous: null};
      this.#updateMigrationRecord(itemSource.flags['sta-enhanced']._migration, latestMigration);
    }

    return currentActor;
  }

  /**
   *
   * @param {TokenDocument} token
   * @param {MigrationBase[]} migrations
   * @return {Promise<TokenDocument>}
   */
  async getUpdatedToken(token, migrations) {
    const current = token.toObject();
    for (const migration of migrations) {
      await migration.updateToken(current, token.actor, token.scene);
    }

    return current;
  }

  /**
   * @param {MigrationRecord} migrations
   * @param {MigrationBase} latestMigration
   */
  #updateMigrationRecord(migrations, latestMigration) {
    if (!("game" in globalThis && latestMigration)) return;

    const fromVersion = typeof migrations.version === "number" ? migrations.version : null;
    migrations.version = latestMigration.version;
    migrations.previous = {
      schema: fromVersion,
      foundry: game.version,
      system: game.system.version,
    };
  }
}