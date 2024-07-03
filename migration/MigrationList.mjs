import * as Migrations from './Migrations.mjs';
import { MigrationRunner } from './MigrationRunner.mjs';

export class MigrationList {
  /** @type {MigrationBase[]} */
  static #list = Object.values(Migrations);

  /**
   * @param {Number|null} version
   * @returns MigrationBase[]
   */
  static constructFromVersion(version) {
    const minVersion = Number(version) || MigrationRunner.RECOMMENDED_SAFE_VERSION;
    return this.#list.filter((M) => M.version > minVersion).map((M) => new M());
  }
}
