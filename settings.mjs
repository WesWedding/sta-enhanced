export const CONSTS = Object.freeze({
  reputation: {
    variant: {
      'original': 'original',
      '1stEdNew': '1stEdNew',
    },
    resultLabels: {
      generic: 'generic',
      klingon: 'klingon',
    },
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
    name: 'sta-enhanced.settings.reputation.variant.Name',
    hint: 'sta-enhanced.settings.reputation.variant.Hint',
    scope: 'world',
    config: true,
    default: CONSTS.reputation.variant['1stEdNew'],
    choices: {
      [CONSTS.reputation.variant.original]: 'sta-enhanced.settings.reputation.variant.original',
      [CONSTS.reputation.variant['1stEdNew']]: 'sta-enhanced.settings.reputation.variant.1stEdNew',
    },
    onChange: _resetMaxSystemReputation,
  });

  game.settings.register('sta-enhanced', 'reputationLabels', {
    name: 'sta-enhanced.settings.reputation.reputationLabels.Name',
    hint: 'sta-enhanced.settings.reputation.reputationLabels.Hint',
    score: 'world',
    config: true,
    default: CONSTS.reputation.resultLabels.generic,
    choices: {
      [CONSTS.reputation.resultLabels.generic]: 'sta-enhanced.settings.reputation.labels.generic',
      [CONSTS.reputation.resultLabels.klingon]: 'sta-enhanced.settings.reputation.labels.klingon',
    },
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
  if (variant === CONSTS.reputation.variant.original) {
    game.settings.set('sta', 'maxNumberOfReputation', 20);
  }

  // Klingon max rep is 5.
  if (variant === CONSTS.reputation.variant['1stEdNew']) {
    game.settings.set('sta', 'maxNumberOfReputation', 5);
  }
}
