import { STACharacterSheet } from '../../../../systems/sta/module/actors/sheets/character-sheet.js';
import { CONSTS as SETTINGS_CONSTS } from '../../settings.mjs';
import ReputationConfig from '../../applications/ReputationConfig.mjs';

// After changes in the System, this global is required to keep sheets working.  Not ideal!
if (typeof globalThis.localizedValues === 'undefined') {
  globalThis.localizedValues = { resolute: '{{localize \'sta.actor.character.talents.resolute\'}}' };
}

export class STACharacterEnhancedSheet extends STACharacterSheet {
  /** @inheritDoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: super.defaultOptions.classes.concat(['sta-enhanced']),
      scrollY: ['.tab-area'],
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

    // Re-enable the tab buttons, which are disabled by Core listener attachers when not editable.
    for (let el of this.form.getElementsByTagName('BUTTON')) {
      if (el.dataset.tab !== undefined) {
        el.disabled = false;
      }
    }

    if (!this.isEditable) return;

    $html.find('[data-action]').on('click', this._onAction.bind(this));

    this._handleTooltipClicks($html);
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
   * Show a apps to trigger a reputation roll.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _onReputationRoll() {
    const rollApp = new ReputationConfig({ actor: this.actor });

    console.log('actor.uuid?', this.actor.uuid);

    const context = {
      character: this.actor,
    };
    console.log('context', context);

    rollApp.render(true);
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
}
