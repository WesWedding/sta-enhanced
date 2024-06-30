/**
 * @abstract
 */
export class MigrationBase {

  /** @type {Number} */
  static version;
  get version()  {
    return (this.constructor).version;
  }

  requiresFlush = false;

  /**
   * Update the actor to the latest schema version.
   *
   * @param {Actor} source
   *
   * @abstract
   * @return Promise<void>
   */
  updateActor(source) {}

  /**
   *
   * @param {TokenDocument} tokenData
   * @param {Actor} actor
   * @param {Scene} scene
   * @return Promse<void>
   */
  updateToken(tokenData, actor, scene) {}
}