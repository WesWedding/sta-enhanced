import { ReputationRoll } from '../dice/ReputationRoll.mjs';

/**
 * @typedef {object} ReputationConfigOptions
 * @property {Actor} actor - The actor which is rolling for reputation.
 */

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * An application for configuring the Reputation Roll.
 *
 * @extends ApplicationV2
 * @mixes HandlebarsApplication
 * @alias ReputationConfig
 */
export default class ReputationConfig extends HandlebarsApplicationMixin(ApplicationV2) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    id: 'reputation-config',
    classes: ['sta-enhanced'],
    tag: 'form',
    window: {
      contentClasses: ['sta-form'],
      title: 'sta-enhanced.roll.reputation.config.title',
    },
    position: {
      width: 400,
    },
    form: {
      closeOnSubmit: true,
      handler: ReputationConfig.#onSubmitForm,
    },
  }, { inplace: false });

  /** @override */
  static PARTS = {
    form: {
      id: 'form',
      template: 'modules/sta-enhanced/templates/apps/reputation-roll-dialogue.hbs',
    },
  };

  /**
   * The Actor that is rolling for reputation.
   *
   * @private
   */
  _actor;

  constructor({ actor, ...options } = {}) {
    super(options);
    if (actor) {
      this._actor = actor;
    }
  }

  /** @override */
  async _prepareContext(options) {
    return super._prepareContext(options).then((context) => {
      context.actorId = this._actor.uuid;
      return context;
    });
  }

  /**
   * Handler to be used for form submission.
   *
   * @param {SubmitEvent|Event} event
   * @param  {HTMLFormElement} form
   * @param {FormDataExtended} formData
   * @returns {Promise<void>}
   */
  static async #onSubmitForm(event, form, formData) {
    const {
      /** @type {number | null} */ positive = 0,
      /** @type {number | null} */ negative = 0,
      actorId,
    } = foundry.utils.expandObject(formData.object);

    const valid = ReputationConfig._validate(positive, negative);

    if (!valid) throw new ReputationFormError(game.i18n.localize('sta-enhanced.notifications.error.repFormInvalid'));

    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.implementation.getSpeaker(),
      actorId: actorId,
    };

    // The actor must come from the form and not from more handy ChatMessage helper functions like getSpeakerActor().
    // ChatMessage functions rely on token and scene actors, but ReputationRolls can be initiated from sidebars.
    const actor = fromUuidSync(actorId);
    chatData.speaker.alias = actor.name;

    const rollData = actor instanceof Actor ? actor.getRollData() : {};

    const rollOptions = {
      reputation: Number(rollData.reputation),
      reprimand: Number(rollData.reprimand),
      positiveInfluence: Number(positive),
      negativeInfluence: Number(negative),
      actor: actor,
    };

    const roll = new ReputationRoll(`${rollOptions.positiveInfluence}d20`, rollData, rollOptions);
    await roll.evaluate();
    await roll.toMessage(chatData);
    await this.close();
  }

  /**
   * Ensure at least 1 influence is present.
   *
   * @param {number} positive
   * @param {number} negative
   * @returns {boolean}
   * @private
   */
  static _validate(positive, negative) {
    let valid = true;

    if (!(positive || negative)) {
      valid = false;
    }
    return valid;
  }
}

class ReputationFormError extends Error {
  constructor(message) {
    super(message);
    this.name = 'Reputation Form Error';
  }
}
