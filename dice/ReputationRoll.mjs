/**
 * A type of Roll specific to a d20-based Reputation check in the STA system.
 */
export class ReputationRoll extends Roll {
  /**
   * @param {string} formula    The string formula to parse
   * @param {object} data       The data object against which to parse attributes within the formula
   * @param {object} [options]  Options which modify or describe the Roll
   * @param {object} [options.reputation]
   * @param {number} [options.positiveInfluence]
   * @param {number} [options.negativeInfluence]
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

  configureModifiers() {
    console.log('TODO: verify validity of terms');

    const d20 = this.terms[0];
    d20.modifiers = [];

    if (this.options.positiveInfluence) {
      d20.number = this.options.positiveInfluence;
    }

    if (this.options.reputation) {
      const target = this.options.reputation + 7;
      d20.modifiers.push(`d${target}`);
      d20.modifiers.push(`f=${this.options.reputation}`);
    }
    if (this.options.reprimand) {
      d20.modifiers.push(`c=${this.options.reprimand}`);
    }

    // Re-compile the underlying formula
    this._formula = this.constructor.getFormula(this.terms);

    this.configured = true;
  }

  /** @override */
  static get defaultImplementation() {
    return ReputationRoll;
  }
}
