/**
 * @abstract
 */
/* eslint no-unused-vars: off */
export class MigrationBase {
  /** @type {number} */
  static version;
  get version() {
    return (this.constructor).version;
  }

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
