import { TaskRoll } from './TaskRoll.mjs';

/** This gets added to the rep for the roll's Target Number. From Klingon/Digest/2E. */
const REP_TARGET_BASE = 7;

/** Reputation complications max out at 5 reprimands. Which is added to the baseline 1. */
const MAX_COMPLICATION_RANGE = 5;

export class ReputationRoll extends TaskRoll {
  /**
   * @param {string} formula    The string formula to parse
   * @param {object} data       The data object against which to parse attributes within the formula
   * @param {TaskRollOptions} [options]  Options which modify or describe the Roll
   * @param {number} [options.reputation]
   * @param {number} [options.reprimand]
   * @param {number} [options.negativeInfluence]
   */
  constructor(formula, data = {}, options = {}) {
    if (options.reputation) {
      options.target = options.reputation + REP_TARGET_BASE;
      options.critical = options.reputation;
    }
    if (options.reprimand) {
      options.complication = Math.max(options.reprimand, MAX_COMPLICATION_RANGE);
    }
    super(formula, data, options);
    this._reputation = options.reputation ? options.reputation : 0;
    this._reprimand = options.reprimand ? options.reprimand : 0;
    this._negativeInf = this.options.negativeInfluence ? this.options.negativeInfluence : 0;
  }

  /** @override */
  async toMessage(messageData = {}, { rollMode, create = true } = {}) {
    messageData = foundry.utils.mergeObject({
      flavor: game.i18n.localize('sta-enhanced.roll.reputation.flavor'),
    }, messageData);
    return super.toMessage(messageData, { rollMode, create });
  }

  /** @override */
  toJSON() {
    const json = super.toJSON();
    json.reputation = this._reputation;
    json.reprimand = this._reprimand;
    json.negativeInf = this._negativeInf;
    return json;
  }

  /** @override */
  static fromData(data) {
    const roll = super.fromData(data);
    roll._reputation = data.reputation;
    roll._reprimand = data.reprimand;
    roll._negativeInf = data.negativeInf;

    return roll;
  }
}
