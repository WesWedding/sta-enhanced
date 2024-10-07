import { TaskRoll } from './TaskRoll.mjs';

/** This gets added to the rep for the roll's Target Number. From Klingon/Digest/2E. */
const REP_TARGET_BASE = 7;

/** Reputation complications are always at least 1. */
const MIN_COMPLICATION_RANGE = 1;

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
   * @param {Actor} [options.actor]
   */
  constructor(formula, data = {}, options = {}) {
    if (options.reputation) {
      options.target = options.reputation + REP_TARGET_BASE;
      options.critical = options.reputation;
    }
    if (options.reprimand) {
      options.complication = Math.clamp(options.reprimand, MIN_COMPLICATION_RANGE, MAX_COMPLICATION_RANGE);
    }
    super(formula, data, options);

    this._actorId = options.actor?.uuid;
    this._reputation = options.reputation ? options.reputation : 0;
    this._reprimand = options.reprimand ? options.reprimand : 0;
    this._negativeInf = this.options.negativeInfluence ? this.options.negativeInfluence : 0;
  }

  _actorId;

  _reputation;

  _reprimand;

  _negativeInf;

  _rolledAcclaim;

  _rolledReprimand;

  /** @override */
  static CHAT_TEMPLATE = 'modules/sta-enhanced/templates/dice/reputation-roll.hbs';

  /**
   * Return the actor UUID this roll is for.
   * @returns {string}
   */
  get actorId() {
    console.log('actorId', this._actorId);
    return String(this._actorId) || '';
  }

  /**
   * Return the number of reprimands impacting this roll.
   *
   * @returns {number}
   */
  get reprimand() {
    return Number(this._reprimand) || 0;
  }

  /**
   * Return the number of negative influences impacting this roll.
   * @returns {number}
   */
  get negativeInfluences() {
    return Number(this._negativeInf) || 0;
  }

  /**
   * Return the number of Acclaim generated, if this roll has been evaluated.
   *
   * @returns {number}
   */
  get rolledAcclaim() {
    return Number(this._rolledAcclaim) || 0;
  }

  /**
   * Return the number of Reprimand generated, if this roll has been evaluated.
   *
   * @returns {number}
   */
  get rolledReprimand() {
    return Number(this._rolledReprimand) || 0;
  }

  /** @override */
  static get defaultImplementation() {
    return ReputationRoll;
  }

  /** @override */
  async evaluate(options = {}) {
    return super.evaluate(options).then(this._evaluateReputation.bind(this));
  }

  /**
   * Calculate and store the results of this reputation roll during evaluate().
   *
   * @returns {ReputationRoll}
   *
   * @see ReputationRoll.evaluate()
   * @see ReputationRoll.evaluateSync()
   * @private
   */
  _evaluateReputation() {
    if (!this._evaluated) return this;

    const difficulty = this.negativeInfluences;
    if (this.total >= difficulty) {
      this._rolledAcclaim = this.total - this.negativeInfluences;
      this._rolledReprimand = 0;
    }
    else if (this.total < difficulty) {
      this._rolledAcclaim = 0;
      this._rolledReprimand = (this.negativeInfluences - this.total) + this.reprimand;
    }

    return this;
  }

  /** @override */
  evaluateSync(options = {}) {
    return super.evaluateSync(options)._evaluateReputation();
  }

  /* -------------------------------------------- */
  /*  Chat Messages                               */
  /* -------------------------------------------- */

  /** @override */
  async render({ flavor, template = this.constructor.CHAT_TEMPLATE, isPrivate = false } = {}) {
    // We need to provide complications, not just total.
    // Much of this is repeated from FoundryVTT V12's implementation in roll.mjs.
    if (!this._evaluated) await this.evaluate({ allowInteractive: !isPrivate });
    const chatData = {
      actorId: this.actorId,
      formula: isPrivate ? '???' : this.formulaDiceOnly,
      flavor: isPrivate ? null : flavor ?? this.options.flavor,
      user: game.user.id,
      tooltip: isPrivate ? '' : await this.getTooltip(),
      acclaim: this.rolledAcclaim,
      reprimand: this.rolledReprimand,
      result: isPrivate ? '?' : this._resultText(),
      checkTarget: isPrivate ? '?' : this._targetNum,
      complicationRange: isPrivate ? '?' : this._complicationRange,
      // Store actor data into message structure;
      // We cannot rely on ChatMessage.speaker because some cases (e.g. rolled from sidebar actor list, not a scene token)
      // the speaker of the ChatMessage is the User, not an actor.

    };
    return renderTemplate(template, chatData);
  }

  /**
   * Text that announces the result of this reputation roll.
   *
   * @returns {string}
   * @private
   */
  _resultText() {
    if (this.rolledReprimand > 0) {
      return 'OH NO ROLLED REPRIMAND';
    }
    else if (this.rolledAcclaim > 0) {
      return 'YAY ROLLED ACCLAIM.';
    }

    return 'NO CHANGE';
  }

  /** @override */
  async toMessage(messageData = {}, { rollMode, create = true } = {}) {
    messageData = foundry.utils.mergeObject({
      flavor: game.i18n.localize('sta-enhanced.roll.reputation.flavor'),
    }, messageData);
    console.log('messageData actor', messageData.actorId);
    return super.toMessage(messageData, { rollMode, create });
  }

  static chatListeners(html) {
    html.on('click', '.chat-message button[data-action]', this._onChatCardAction.bind(this));
  }

  static async _onChatCardAction(event) {
    event.preventDefault();

    // Don't want the message to collapse in response to this click.
    event.stopPropagation();

    const button = event.currentTarget;
    const action = button.dataset.action;
    if (action !== 'save-reputation') return;
    button.disabled = true;

    // Extract card data
    const card = button.closest('.roll');
    const messageId = card.closest('.message').dataset.messageId;
    const targetId = card.dataset.actorId;
    const actor = fromUuidSync(targetId);
    try {
    /** @type {ChatMessage} */
      const message = game.messages.get(messageId, { strict: true });

      if (!(actor instanceof Actor) || actor.type !== 'character') {
        ui.notifications.error(game.i18n.format('sta-enhanced.notifications.error.loadRepActor', { id: targetId }));
        button.disabled = false;
        return;
      }
      // Restrict rerolls to users with permission.
      if (!(game.user.isGM || actor.isOwner)) return;

      console.log(message);
      const roll = message.rolls[0];
      if (!(roll instanceof ReputationRoll)) {
        ui.notifications.error(game.i18n.format('sta-enhanced.notifications.error.loadRepRoll', { id: targetId }));
        button.disabled = false;
        return;
      }

      await this._updateCharacterRep(actor, roll);
      ui.notifications.info(game.i18n.format('sta-enhanced.notifications.info.repSaved', { name: actor.name }));
    }
    catch (e) {
      ui.notifications.error(game.i18n.format('sta-enhanced.notifications.error.repSaveAction', { name: actor.name, error: e.message }));
    }

    // Re-enable the button when we're done.
    button.disabled = false;
  }

  /**
   * Save the Rep Roll results to a character.
   *
   * @param {Actor} actor
   * @param {ReputationRoll} roll
   * @private
   */
  static async _updateCharacterRep(actor, roll) {
    const rolledAcclaim = roll.rolledAcclaim;
    const rolledReprimand = roll.rolledReprimand;

    // If no change was rolled, then there's nothing to do!
    if (rolledAcclaim + rolledReprimand === 0) {
      return;
    }

    const currentAcclaim = parseInt(actor.system.acclaim, 10);
    const updated = {
      system: {},
    };

    // A Rep roll should only have either an Acclaim or Reprimand result, not both.
    if (rolledAcclaim > 0) {
      updated.system.acclaim = currentAcclaim + rolledAcclaim;
    }
    else if (rolledReprimand > 0) {
      // Unlike Acclaim, Reprimand is not accumulated.
      updated.system.reprimand = rolledReprimand;
    }

    await actor.update(updated);
  }

  /**
   *
   * @param {ChatMessage} message
   * @returns {Promise<void>}
   * @private
   */
  static async _getMessageActor(message) {
    // Could be a token, a "synthetic" actor
    if (message.speaker.token && message.speaker.scene) {
      const scene = game.scenes.get(message.speaker.scene);
      const token = scene.tokens.get(message.speaker.token);
      if (!token) return null;
      return token.actor;
    }

    // Could be an actual World actor.
    const actorId = message.speaker.actor;
    const actor = game.actors.get(actorId);
    console.log('actor from actor id', actor, message);
    return game.actors.get(actorId) || null;
  }

  /** @override */
  toJSON() {
    const json = super.toJSON();
    json.actorId = this._actorId;
    json.reputation = this._reputation;
    json.reprimand = this._reprimand;
    json.negativeInf = this._negativeInf;
    json.rolledAcclaim = this._rolledAcclaim;
    json.rolledReprimand = this._rolledReprimand;
    return json;
  }

  /** @override */
  static fromData(data) {
    const roll = super.fromData(data);
    roll._actorId = data.actorId;
    roll._reputation = data.reputation;
    roll._reprimand = data.reprimand;
    roll._negativeInf = data.negativeInf;
    roll._rolledAcclaim = data.rolledAcclaim;
    roll._rolledReprimand = data.rolledReprimand;

    return roll;
  }
}
