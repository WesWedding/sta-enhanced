/**
 * A type of Roll specific to a d20-based Reputation check in the STA system.
 */
export class ReputationRoll extends Roll {
  /**
   * @param {string} formula    The string formula to parse
   * @param {object} data       The data object against which to parse attributes within the formula
   * @param {object} [options]  Options which modify or describe the Roll
   * @param {object} [options.reputation]
   * @param {object} [options.reprimand]
   */
  constructor(formula, data, options) {
    super(formula, data, options);

    if (!this.options.configured) this.configureModifiers();
  }

  /**
   * Whether this ReputationRoll has had its formula modifiers configured.
   *
   * @type {boolean}
   */
  configured;

  /**
   * The numeric total of complications generated through evaluation of the Roll.
   *
   * @internal
   */
  _totalComplications;

  configureModifiers() {
    console.log('TODO: verify validity of terms');

    const d20 = this.terms[0];
    d20.modifiers = [];

    if (this.options.reputation) {
      const target = this.options.reputation + 7;
      d20.modifiers.push(`cs<=${target}`);
      // Critical will need to be handled in final evaluation, not a modifier.
    }

    // Re-compile the underlying formula
    this._formula = this.constructor.getFormula(this.terms);

    this.configured = true;
  }

  async evaluate(options = {}) {
    return super.evaluate(options).then(this._processEvaluatedRoll.bind(this));
  }

  /**
   * Apply critical and complication ranges to results.
   *
   * Unfortunately, modifiers are not enough to accomplish the handling of
   * criticals counting twice, nor complications being counted.  "Count" modifiers
   * just overwrite the previous counts.
   *
   * @returns ReputationRoll
   * @internal
   */
  _processEvaluatedRoll() {
    if (!this._evaluated) return this;

    const terms = this.terms;
    let finalTotal = this._total;
    let finalComplications = 0;
    const complicationLimit = 20 - this.options.reprimand;
    terms.forEach((term) => {
      if (!(term instanceof foundry.dice.terms.DiceTerm)) return;
      /** @type {DiceTerm} term */
      term.results.forEach((result) => {
        if (result.result <= this.options.reputation) {
          result.count = 2;
          finalTotal += 1; // This result should have been 2, and was already counted as 1.
        }
        if (result.result >= complicationLimit) {
          result.complication = true;
          // Only flag a term as a failure if it won't overwrite the success.
          if (!result.success) {
            result.failure = true;
          }
          finalComplications += 1;
        }
      });
    });

    this._total = finalTotal;
    this._totalComplications = finalComplications;

    return this;
  }

  evaluateSync(options = {}) {
    return super.evaluateSync(options)._processEvaluatedRoll();
  }

  /** @override */
  static get defaultImplementation() {
    return ReputationRoll;
  }
}
