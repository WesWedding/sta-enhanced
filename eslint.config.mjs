import globals from 'globals';
import jsdoc from 'eslint-plugin-jsdoc';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';

export default [
  jsdoc.configs['flat/recommended'],
  js.configs.recommended,
  stylistic.configs.customize({
    semi: true,
  }),
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        game: false,
        Hooks: false,
        foundry: false,
        ui: false,
        CONFIG: false,
        CONST: false,
        TextEditor: false,
        Actors: false,
        loadTemplates: false,
      },
    },
    plugins: {
      'jsdoc': jsdoc,
      '@stylistic': stylistic,
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
    rules: {
      'eqeqeq': ['error', 'smart'],
      // no-undefined-types makes overriding Foundry class methods very annoying, and doesn't recognize our own Migration classes like MigrationBase.  Go away.
      'jsdoc/no-undefined-types': 'off',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-property-description': 'off',
      'jsdoc/require-returns-description': 'off',
      'jsdoc/tag-lines': ['warn', 'any', { startLines: 1 }],
      '@stylistic/arrow-parens': ['error', 'always'],
    },
    settings: {
      jsdoc: {
        preferredTypes: {
          '.<>': '<>',
          'Object': 'object',
        },
      },
    },
  },
];
