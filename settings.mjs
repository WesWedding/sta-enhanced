export const CONSTS = Object.freeze({
  reputationVariant: {
    'original': 'original',
    '1stEdNew': '1stEdNew',
  },
});

/**
 * Register all of the module's settings.
 */
export function registerModuleSettings() {
  // The "schema" version this World is using for this module.
  game.settings.register('sta-enhanced', 'worldSchemaVersion', {
    name: 'sta-enhanced.settings.worldSchemaVersion.Name',
    hint: 'sta-enhanced.settings.worldSchemaVersion.Hint',
    scope: 'world',
    config: true,
    type: Number,
    requiresReload: true,
  });

  // The version this World uses/last used of this specific module.
  game.settings.register('sta-enhanced', 'worldModuleVersion', {
    name: 'World Module Version',
    scope: 'world',
    config: false,
    default: game.modules.get('sta-enhanced').version,
    type: String,
  });

  // The Reputation version to be used in Character sheets.
  game.settings.register('sta-enhanced', 'reputationVariant', {
    name: 'sta-enhanced.settings.reputationVariant.Name',
    hint: 'sta-enhanced.settings.reputationVariant.Hint',
    scope: 'world',
    config: true,
    default: CONSTS.reputationVariant['1stEdNew'],
    choices: {
      [CONSTS.reputationVariant.original]: 'sta-enhanced.settings.reputationVariant.variant.original',
      [CONSTS.reputationVariant['1stEdNew']]: 'sta-enhanced.settings.reputationVariant.variant.1stEdNew',
    },
    onChange: _resetMaxSystemReputation,
  });
}

/**
 * Set the max reputation to a value that fits the variant.
 *
 * @param {string} variant
 * @private
 */
function _resetMaxSystemReputation(variant) {
  // Original variant max rep was 20.
  if (variant === CONSTS.reputationVariant.original) {
    game.settings.set('sta', 'maxNumberOfReputation', 20);
  }

  // Klingon max rep is 5.
  if (variant === CONSTS.reputationVariant['1stEdNew']) {
    game.settings.set('sta', 'maxNumberOfReputation', 5);
  }
}
