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
        enrichedBackstory: await TextEditor.enrichHTML(characterFlags?.backstory, { async: true }),
      },
    };

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
}
