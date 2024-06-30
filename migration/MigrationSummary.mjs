import {MigrationRunner} from "./MigrationRunner.mjs";

export class MigrationSummary {
  static reportMigrationStatus() {
    const latestSchemaVersion = MigrationRunner.LATEST_SCHEMA_VERSION;
    const actors = {
      successful: game.actors.filter((actor) => {
        return actor.type === "character" && MigrationSummary.actorSchemaVersion(actor) === latestSchemaVersion
      }).length,
      total: game.actors.filter((actor) => actor.type === "character").length,
    }

    ui.notifications.info(
      game.i18n.format("sta-enhanced.Migrations.Summary",
        {
          migrated: actors.successful,
          total: actors.total,
        })
    );

    if (actors.successful !== actors.total) {
      console.warn("unmigrated documents:", game.actors.filter((actor) => {
        return actor.type === "character" && MigrationSummary.actorSchemaVersion(actor) !== latestSchemaVersion
      }));
    }
  }

  static actorSchemaVersion(actor) {
    const flags = actor.flags["sta-enhanced"];
    return Number(actor.flags["sta-enhanced"]?._migration?.version) || null;
  }
}