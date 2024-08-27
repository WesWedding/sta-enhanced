import { STACharacterSheet } from '../../../../systems/sta/module/actors/sheets/character-sheet.js';
import { ItemChatCard } from '../../chat/ItemChatCard.mjs';
import { ItemHelpers } from '../../helpers/ItemHelpers.mjs';
import { RollHelpers } from '../../helpers/RollHelpers.mjs';
import { CONSTS as SETTINGS_CONSTS } from '../../settings.mjs';

// After changes in the System, this global is required to keep sheets working.  Not ideal!
if (typeof globalThis.localizedValues === 'undefined') {
  globalThis.localizedValues = { resolute: '{{localize \'sta.actor.character.talents.resolute\'}}' };
}

export class STACharacterEnhancedSheet extends STACharacterSheet {
  /** @inheritDoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: super.defaultOptions.classes.concat(['sta-enhanced']),
      tabs: [
        { navSelector: 'nav', contentSelector: '.tab-area', initial: 'character' },
      ],
    }, { insertValues: true });
  }

  /** @inheritDoc */
  async getData(options) {
    const context = super.getData(options);

    const characterFlags = this.object.flags['sta-enhanced']?.character;
    context['sta-enhanced'] = {
      character: {
        gender: characterFlags?.gender,
        personality: characterFlags?.personality,
        enrichedBackstory: await TextEditor.enrichHTML(characterFlags?.backstory, { async: true }), // Async copied from PF2E but maybe not actually used?
      },
      new1ERep: false,
    };

    // New fields to show when the 'Klingon' reputation variant is used.
    const repVariant = await game.settings.get('sta-enhanced', 'reputationVariant');
    if (repVariant === SETTINGS_CONSTS.reputation.variant['1stEdNew']) {
      const new1ERep = {
        labels: {
          positive: '',
          negative: '',
        },
      };
      const labelSettings = await game.settings.get('sta-enhanced', 'reputationLabels');
      if (labelSettings === SETTINGS_CONSTS.reputation.resultLabels.generic) {
        new1ERep.labels.positive = game.i18n.localize('sta-enhanced.reputation.variant.generic.positive.label');
        new1ERep.labels.negative = game.i18n.localize('sta-enhanced.reputation.variant.generic.negative.label');
      }
      else {
        new1ERep.labels.positive = game.i18n.localize('sta-enhanced.reputation.variant.klingon.positive.label');
        new1ERep.labels.negative = game.i18n.localize('sta-enhanced.reputation.variant.klingon.negative.label');
      }
      context['sta-enhanced'].new1ERep = new1ERep;
    }

    // We're using the prosemirror editor on Notes, so we should be enriching accordingly.
    context.system.notes = await TextEditor.enrichHTML(context.system.notes);

    return context;
  }

  /** @inheritDoc */
  get template() {
    if (!game.user.isGM && this.actor.limited) return 'systems/sta/templates/actors/limited-sheet.html';
    return 'modules/sta-enhanced/templates/actors/character-sheet.hbs';
  }

  /** @inheritDoc */
  activateListeners($html) {
    super.activateListeners($html);

    if (!game.user.isGM && this.actor.limited) return;

    $html.find('[data-action]').on('click', this._onAction.bind(this));

    this._handleStressMod($html);
    this._handleTooltipClicks($html);
    this._replaceSystemItemRolls($html);
  }

  /**
   * Handle user performing a sheet action.
   *
   * @param {PointerEvent} event
   * @private
   */
  _onAction(event) {
    const target = event.currentTarget;
    switch (target.dataset.action) {
      case 'rollReputation':
        this._onReputationRoll();
        break;
    }
  }

  /**
   * Show a dialog to trigger a reputation roll.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _onReputationRoll() {
    event.stopPropagation();

    const result = await RollHelpers.reputationRollDialog(this.actor.system.reputation);
    console.log('dialog done', result);
  }

  _handleStressMod($html) {
    const $changers = $html.find('#strmod-changer button');
    const $modInput = $html.find('#strmod');

    // This probably indicates this version of the STA system doesn't have the strmod added yet.
    if (!$changers || !$modInput) {
      return;
    }

    const currentMod = parseInt($modInput.val());
    $changers.on('click', (event) => {
      if (event.currentTarget.classList.contains('up')) {
        $modInput.val(currentMod + 1);
        this.submit();
      }
      else if (event.currentTarget.classList.contains('down')) {
        $modInput.val(currentMod - 1);
        this.submit();
      }
    });
  }

  /**
   * This plugin adds more "tooltips" to character sheets.
   *
   * Many items have descriptions that can't be seen anywhere on the sheet.
   *
   * @param {jQuery} $html
   * @private
   */
  _handleTooltipClicks($html) {
    $html.find('.weapon-tooltip-clickable').click((ev) => {
      const weaponId = $(ev.currentTarget)[0].id.substring('weapon-tooltip-clickable-'.length);
      const tooltopSelector = '.weapon-tooltip-container:not(.hide)';
      const currentShowingWeaponId = $(tooltopSelector)[0] ? $(tooltopSelector)[0].id.substring('weapon-tooltip-container-'.length) : null;

      if (weaponId === currentShowingWeaponId) {
        $('#weapon-tooltip-container-' + weaponId).addClass('hide').removeAttr('style');
      }
      else {
        $('.weapon-tooltip-container').addClass('hide').removeAttr('style');
        $('#weapon-tooltip-container-' + weaponId).removeClass('hide').height($('#weapon-tooltip-text-' + weaponId)[0].scrollHeight + 5);
      }
    });
  }

  /**
   * Swap in new chat card icons.
   *
   * Hide the existing images that the system provides with new ones that have
   * their own handlers attached.  The existing system ones are not extensible
   * so they are being replaced entirely.
   *
   * @param {jQuery} $html
   * @private
   */
  _replaceSystemItemRolls($html) {
    const rollIcons = $html.find('.chat, .rollable');
    const clones = rollIcons.clone();
    rollIcons.each((idx, element) => {
      $(element).after(clones[idx]);
    });
    rollIcons.hide();

    clones.on('click', async (event) => {
      const itemType = $(event.currentTarget).parents('.entry')[0].getAttribute('data-item-type');
      const itemId = $(event.currentTarget).parents('.entry')[0].getAttribute('data-item-id');
      const item = this.actor.items.get(itemId);

      const numDice = ItemHelpers.getNumDamageDiceFor(item);
      let damageRoll = null;
      if (itemType === 'characterweapon' || itemType === 'starshipweapon') {
        damageRoll = await RollHelpers.performChallengeRoll(numDice);
      }

      const card = new ItemChatCard(item, damageRoll);
      await card.sendToChat(this.actor);
    });
  }
}
