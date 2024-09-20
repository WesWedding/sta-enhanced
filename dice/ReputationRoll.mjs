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
  constructor(formula, data = {}, options = {}) {
    super(formula, data, options);

    this._targetNum = options.reputation ? options.reputation + 7 : 0;
    this._complicationRange = options.reprimand ? options.reprimand : 0;

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
   * @type {number}
   * @internal
   */
  _totalComplications;

  /**
   * The numeric 'range' for complications.
   *
   * @type {number}
   * @internal
   */
  _complicationRange;

  /**
   * The numeric cutoff for what a successful die in this roll is.
   *
   * @type {number}
   * @private
   */
  _targetNum;

  /** @override */
  static CHAT_TEMPLATE = 'modules/sta-enhanced/templates/dice/reputation-roll.hbs';

  /** @override */
  static TOOLTIP_TEMPLATE = 'modules/sta-enhanced/templates/dice/reputation-tooltip.hbs';

  /**
   * Add modifiers to the roll according to the Roll's options.
   */
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

  /**
   * Return the total complications of the Roll expression if it has been evaluated.
   *
   * @type {number}
   */
  get complications() {
    console.log('getComplications', this._totalComplications);
    return Number(this._totalComplications) || 0;
  }

  /**
   * Display only the first Dice term, with no modifiers attached.
   *
   * @returns {string}
   */
  get formulaDiceOnly() {
    console.log('TODO: validate');
    return this.formula.match(/^[0-9]+d[0-9]+/i)[0];
  }

  /** @override */
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
   * @returns {ReputationRoll}
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
          result.critical = true;
          finalTotal += 1; // This result should have been 2, and was already counted as 1.
        }
        if (result.result >= complicationLimit) {
          result.complication = true;
          finalComplications += 1;
        }
      });
    });

    this._total = finalTotal;
    this._totalComplications = finalComplications;

    return this;
  }

  /** @override */
  evaluateSync(options = {}) {
    return super.evaluateSync(options)._processEvaluatedRoll();
  }

  /** @override */
  static get defaultImplementation() {
    return ReputationRoll;
  }

  /* -------------------------------------------- */
  /*  Chat Messages                               */
  /* -------------------------------------------- */

  /**
   * Get tooltip for Roll.
   *
   * The STA system flags criticals as "max" and complications as "min" and
   * doesn't flag successes at all.  The DiceTerms provided by core currently
   * don't make it easy to alter when those labels are applied, so we have to
   * do it here.
   *
   * @override
   */
  async getTooltip() {
    const parts = this.dice.map((d) => {
      // Determine which array indexes need to have their CSS classes updated.
      const crits = [];
      const comps = [];
      d.results.forEach((result, idx) => {
        if (result.critical) {
          crits.push(idx);
        }
        // Else used here, because we do not want to override crit styling with complication styling.
        else if (result.complication) {
          comps.push(idx);
        }
      });

      const data = d.getTooltipData();
      const rollToolTipData = data.rolls;
      rollToolTipData.forEach((data, idx) => {
        if (crits.includes(idx)) data.classes += ' max';
        if (comps.includes(idx)) data.classes += ' min';

        // STA system also doesn't flag 'success' dice.
        data.classes = data.classes.replace(/success\w*/i, '');
      });
      return data;
    });

    return renderTemplate(this.constructor.TOOLTIP_TEMPLATE, { parts });
  }

  /** @override */
  async render({ flavor, template = this.constructor.CHAT_TEMPLATE, isPrivate = false } = {}) {
    // We need to provide complications, not just total.
    // Much of this is repeated from FoundryVTT V12's implementation in roll.mjs.
    if (!this._evaluated) await this.evaluate({ allowInteractive: !isPrivate });
    const chatData = {
      formula: isPrivate ? '???' : this.formulaDiceOnly,
      flavor: isPrivate ? null : flavor ?? this.options.flavor,
      user: game.user.id,
      tooltip: isPrivate ? '' : await this.getTooltip(),
      total: isPrivate ? '?' : this._successText(),
      complications: isPrivate ? '?' : this._complicationText(),
      checkTarget: isPrivate ? '?' : this.options.reputation + 7,
      complicationRange: isPrivate ? '?' : this.options.reprimand,
    };
    return renderTemplate(template, chatData);
  }

  /**
   * Generate the text string used to represent complications in chat.
   *
   * The text needs to be pluralized; it isn't simply a number.  Most of this
   * comes directly from the STA system sourcecode.
   *
   * @returns {string}
   * @private
   */
  _complicationText() {
    const complications = Math.round(this.complications * 100) / 100;
    const multipleComplicationsAllowed = game.settings.get('sta', 'multipleComplications');

    let complicationText = '';
    if (complications >= 1) {
      if (complications > 1 && multipleComplicationsAllowed === true) {
        const localisedPluralisation = game.i18n.format('sta.roll.complicationPlural');
        complicationText = localisedPluralisation.replace('|#|', complications);
      }
      else {
        complicationText = game.i18n.format('sta.roll.complication');
      }
    }
    else {
      complicationText = '';
    }
    return complicationText;
  }

  /**
   * Generate the success string for a reputation roll in chat.
   *
   * The text needs to be pluralized; it isn't simply a number.  Most of this
   * comes directly from the STA system sourcecode.
   *
   * @returns {string}
   * @private
   */
  _successText() {
    const successes = Math.round(this.total * 100) / 100;
    let successText = '';
    if (successes === 1) {
      successText = successes + ' ' + game.i18n.format('sta.roll.success');
    }
    else {
      successText = successes + ' ' + game.i18n.format('sta.roll.successPlural');
    }

    return successText;
  }

  /** @override */
  async toMessage(messageData = {}, { rollMode, create = true } = {}) {
    messageData = foundry.utils.mergeObject({
      flavor: game.i18n.localize('sta-enhanced.roll.flavor.reputation'),
    }, messageData);
    return super.toMessage(messageData, { rollMode, create });
  }

  /** @override */
  toJSON() {
    const json = super.toJSON();
    json.totalComplications = this._totalComplications;
    json.complcationRange = this._complicationRange;
    json.targetNum = this._targetNum;
    return json;
  }

  /** @override */
  static fromData(data) {
    console.log('data', data);
    const roll = super.fromData(data);
    roll._complicationRange = data.complcationRange;
    roll._targetNum = data.targetNum;

    // Repopulate evaluated state specific to ReputationRoll.
    if (data.evaluated ?? true) {
      roll._totalComplications = data.totalComplications;
    }
    return roll;
  }
}