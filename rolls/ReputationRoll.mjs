/**
 * A type of Roll specific to a d20-based Reputation check in the STA system.
 */
export class ReputationRoll extends Roll {
  /**
   * @param {string} formula    The string formula to parse
   * @param {object} data       The data object against which to parse attributes within the formula
   * @param {object} [options]  Options which modify or describe the Roll
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

    console.log('configuring mods', this.data, this.options);

    if (this.options.positiveInfluence) {
      d20.number = this.options.positiveInfluence;
    }
    if (this.data.reputation) {
      const target = this.data.reputation + 7;
      d20.modifiers.push(`cs<=${target}`);
    }
    if (this.data.reprimand) {
      const complicationMin = 20 - this.data.reprimand;
      d20.modifiers.push(`cf>=${complicationMin}`);
    }

    this.configured = true;
  }

  /** @override */
  static get defaultImplementation() {
    return ReputationRoll;
  }
}
