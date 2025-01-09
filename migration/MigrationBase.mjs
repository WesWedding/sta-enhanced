/**
 * @file The Migration Runner.
 *
 * This copies copiously from the official PF2E System's migration approach.
 *
 * @see {@link https://github.com/foundryvtt/pf2e/blob/master/src/module/migration/base.ts}
 */

/**
 * @abstract
 */
/* eslint no-unused-vars: off */
export class MigrationBase {
  /**
   * The schema version.  This should match the new version in MigrationRunner.
   *
   * @type {number}
   */
  static version;
  get version() {
    return (this.constructor).version;
  }

  /**
   * Setting requiresFlush to true will indicate that the migration runner should not call any more
   * migrations after this in a batch. Use this if you are adding items to actors for instance.
   */
  requiresFlush = false;

  /**
   * Update the actor to the latest schema version.
   *
   * @param {Actor} source
   *
   * @returns {Promise<void>}
   * @abstract
   */
  updateActor(source) {}

  /**
   * @param {TokenDocument} tokenData
   * @param {Actor} actor
   * @param {Scene} scene
   *
   * @returns {Promise<void>}
   * @abstract
   */
  updateToken(tokenData, actor, scene) {}
}
