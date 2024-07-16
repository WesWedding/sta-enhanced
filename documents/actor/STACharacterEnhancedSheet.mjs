import { STACharacterSheet } from '../../../../systems/sta/module/actors/sheets/character-sheet.js';

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
    };

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
    this._handleStressMod($html);
    this._handleTooltipClicks($html);
  }

  _handleStressMod($html) {
    const $changers = $html.find('#strmod-changer button');
    const $modInput = $html.find('#strmod');

    // This probably indicates this verion of the STA system doesn't have the strmod added yet.
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
   * This plugin adds more "tooltips" to character certain items.
   *
   * @param {jQuery} $html
   * @private
   */
  _handleTooltipClicks($html) {
    $html.find('.weapon-tooltip-clickable').click((ev) => {
      console.log('clicked', ev);
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
