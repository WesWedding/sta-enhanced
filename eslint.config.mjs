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
        ...globals.node,
        ...globals.jquery,

        // Foundry VTT Globals.
        Actor: 'readonly',
        Actors: 'readonly',
        ChatMessage: 'readonly',
        CONFIG: 'readonly',
        CONST: 'readonly',
        Dialog: 'readonly',
        foundry: 'readonly',
        fromUuid: 'readonly',
        fromUuidSync: 'readonly',
        game: 'readonly',
        Handlebars: 'writable',
        Hooks: 'readonly',
        Item: 'readonly',
        loadTemplates: 'readonly',
        renderTemplate: 'readonly',
        Roll: 'readonly',
        TextEditor: 'readonly',
        ui: 'readonly',
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
        tagNamePreference: {
          augments: 'extends',
        },
        preferredTypes: {
          '.<>': '<>',
          'Object': 'object',
        },
      },
    },
  },
];
