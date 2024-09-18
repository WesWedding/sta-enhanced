/**
 * Extends original typedef from: FoundryV12 'app\client-esm\dice\_types.mjs'
 *
 * @typedef {object} TaskDieResult
 * @property {number} result            The numeric result
 * @property {boolean} [active]         Is this result active, contributing to the total?
 * @property {number} [count]           A value that the result counts as, otherwise the result is not used directly as
 * @property {boolean} [success]        Does this result denote a success?
 * @property {boolean} [failure]        Does this result denote a failure?
 * @property {boolean} [discarded]      Was this result discarded?
 * @property {boolean} [rerolled]       Was this result rerolled?
 * @property {boolean} [exploded]       Was this result exploded?
 * @property {boolean} [critical]       Does this result denote a critical success?
 * @property {boolean} [complication]   Does this result denote a complication?
 */

/**
 * @property {TaskDieResult[]} results
 */
export default class TaskDie extends foundry.dice.terms.DiceTerm {
  static _FACES = 20;
  constructor(termData) {
    termData.faces = TaskDie._FACES;
    super(termData);
  }

  /** @inheritdoc */
  static DENOMINATION = 't';

  /** @inheritdoc */
  static MODIFIERS = {
    d: TaskDie.prototype.target,
    f: TaskDie.prototype.focus,
    c: TaskDie.prototype.complication,
  };

  static _applyTarget(results, number) {
    for (let r of results) {
      if (r.result <= number) {
        r.success = true;

        // Let the success flag win out over the failure flag, since
        // complications aren't actually failures.
        r.failure = false;
      }
      TaskDie._setResultCount(r);
    }
  }

  /**
   * Mark results within the Focus range as a critical.
   *
   * @param {TaskDieResult[]} results
   * @param {number} number
   * @private
   */
  static _applyFocus(results, number) {
    for (let r of results) {
      if (r.result <= number) {
        r.critical = true;
      }
      TaskDie._setResultCount(r);
    }
  }

  /**
   * Helper to make sure that count is valid, regardless of the order of modifiers.
   * @param {TaskDieResult} result
   * @private
   */
  static _setResultCount(result) {
    result.count = 0;
    if (result.success !== true) return;

    if (result.critical === true) {
      result.count = 2;
    }
    else {
      result.count = 1;
    }
  }

  /**
   * Mark results within the complication range as generating complications.
   *
   * @param {TaskDieResult[]} results
   * @param {number} number
   * @private
   */
  static _applyComplication(results, number) {
    const limit = TaskDie._FACES - number;
    for (let r of results) {
      if (r.result >= limit) {
        r.complication = true;
        // Let the success flag win out over the failure flag, since
        // complications aren't actually failures.
        if (!r.success) r.failure = true;
      }
    }
  }

  /* -------------------------------------------- */
  /*  Term Modifiers                              */
  /* -------------------------------------------- */

  /**
   * @param {string} modifier
   * @returns {boolean|undefined}
   */
  target(modifier) {
    const rgx = /d([0-9]+)?/i;
    const match = modifier.match(rgx);
    if (!match) return false;
    let [number] = match.slice(1);
    number = parseInt(number) || 1;
    TaskDie._applyTarget(this.results, number);
  }

  /**
   * @param {string} modifier
   * @returns {boolean|undefined}
   */
  focus(modifier) {
    const rgx = /f=+?([0-9]+)?/i;
    const match = modifier.match(rgx);
    if (!match) return false;
    let [number] = match.slice(1);
    number = parseInt(number) || 1;
    TaskDie._applyFocus(this.results, number);
  }

  /**
   * @param {string} modifier
   * @returns {boolean|undefined}
   */
  complication(modifier) {
    const rgx = /c=+?([0-9]+)?/i;
    const match = modifier.match(rgx);
    if (!match) return false;
    let [number] = match.slice(1);
    number = parseInt(number) || 1;
    TaskDie._applyComplication(this.results, number);
  }

  /**
   * @override
   * @returns {Promise<TaskDieResult>}
   */
  async roll({ minimize = false, maximize = false, ...options } = {}) {
    return super.roll({ minimize, maximize, options });
  }
}
