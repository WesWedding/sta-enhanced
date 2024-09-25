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
      contentClasses: ['standard-form'],
      title: 'sta-enhanced.reputation.config.title',
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

  async _prepareContext(options) {
    return super._prepareContext(options).then((context) => {
      context.actorId = this._actor.uuid;
      return context;
    });
  }

  static async #onSubmitForm(event, form, formData) {
    const { positive = 0, negative = 0, actorId } = foundry.utils.expandObject(formData.object);
    if (positive + negative <= 0) throw new ReputationFormError('At least some influences are required to roll Reputation.');

    // Reputation must be related explicitly to the actor data in the form, not extrapolated from the rolling
    // user's default character or the actively selected token via ChatMessage.getSpeaker() or similar approaches.



    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.implementation.getSpeaker(),
      actorId: actorId,
    };

    const actor = fromUuidSync(actorId);
    console.log('actor', actor);

    chatData.speaker.alias = actor.name;

    // The actor must come from the form and not from more handy ChatMessage helper functions like getSpeakerActor().
    // ChatMessage functions rely on token and scene actors, but ReputationRolls can be initiated from sidebars.

    const rollData = actor instanceof Actor ? actor.getRollData() : {};

    const rollOptions = {
      reputation: rollData.reputation,
      reprimand: parseInt(rollData.reprimand),
      positiveInfluence: positive,
      negativeInfluence: negative,
      actor: actor,
    };

    const roll = new ReputationRoll(`${rollOptions.positiveInfluence}d20`, rollData, rollOptions);
    await roll.evaluate();
    await roll.toMessage(chatData);
    await this.close();
  }
}

class ReputationFormError extends Error {
  constructor(message) {
    super(message);
    this.name = 'Reputation Form Error';
  }
}
