import globals from 'globals'
import jsdoc from 'eslint-plugin-jsdoc'
import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'

export default [
  jsdoc.configs['flat/recommended'],
  js.configs.recommended,
  stylistic.configs['recommended-flat'],
  {
    languageOptions: {
      ecmaVersion: 2021,
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
      eqeqeq: ['error', 'smart'],
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
]
