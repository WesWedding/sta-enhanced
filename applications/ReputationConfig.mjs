import { ReputationRoll } from '../rolls/ReputationRoll.mjs';

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

  constructor(options = {}) {
    super(options);
    console.log('roller constructed');
  }

  static async #onSubmitForm(event, form, formData) {
    const { positive, negative } = foundry.utils.expandObject(formData.object);
    if (positive + negative <= 0) throw new ReputationFormError('At least some influences are required to roll Reputation.');

    console.log('TODO: trigger roll with ', positive, negative);

    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.implementation.getSpeaker(),
    };

    const actor = ChatMessage.getSpeakerActor(chatData.speaker) || game.user.character;

    const rollData = actor ? actor.getRollData() : {};

    console.log('chatData', chatData);

    const rollOptions = {
      positiveInfluence: 2,
      negativeInfluence: 1,
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
