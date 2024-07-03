import { MigrationBase } from './MigrationBase.mjs';
/**
 * Extend MigrationBase and include them here as exports.
 */

/**
 * Move the character Biography flag to the Backstory flag.
 */
export class Migration0001MoveToBackstory extends MigrationBase {
  static version = 0.1;
  /**
   * @override
   */
  async updateActor(source) {
    if (source.type !== 'character') {
      return;
    }
    const biography = source.flags['sta-enhanced']?.character?.biography;
    if (!biography) {
      return;
    }

    source.flags['sta-enhanced'].character.backstory = biography;
    source.flags['sta-enhanced'].character['-=biography'] = null;
  }
}
