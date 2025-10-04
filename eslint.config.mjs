import {FlatCompat} from '@eslint/eslintrc';
import _import from 'eslint-plugin-import';

const compat = new FlatCompat();

export default [
  {ignores: ['**/.next']},
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript', 'prettier'],
    rules: {
      '@typescript-eslint/array-type': ['error', {default: 'generic'}],
      '@typescript-eslint/camelcase': 0,
      '@typescript-eslint/class-name-casing': 0,
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {assertionStyle: 'as'},
      ],
      // '@typescript-eslint/consistent-type-imports': [
      //   'error',
      //   {fixStyle: 'separate-type-imports'},
      // ],
      '@typescript-eslint/explicit-function-return-type': 0,
      '@typescript-eslint/explicit-module-boundary-types': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-extra-non-null-assertion': 'error',
      // '@typescript-eslint/no-meaningless-void-operator': 'error',
      '@typescript-eslint/no-inferrable-types': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      '@typescript-eslint/no-require-imports': 0,
      '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/no-unused-expressions': 0,
      '@typescript-eslint/no-use-before-define': 0,
      '@typescript-eslint/no-var-requires': 0,
      '@typescript-eslint/prefer-as-const': 'error',
      // '@typescript-eslint/prefer-includes': 'error',
      // '@typescript-eslint/prefer-optional-chain': 'error',
      // '@typescript-eslint/prefer-readonly': 'error',
      // '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      'no-constant-condition': 0,
      'no-prototype-builtins': 0,
      'no-case-declarations': 0,
      'no-fallthrough': 0,
      'require-atomic-updates': 0,
      '@typescript-eslint/no-empty-function': 0,

      'import/first': 'error',
      'import/no-duplicates': 'error',
      // 'import/exports-last': 1,
    },
  }),
];

// export default tseslint.config(
//   {
//     ignores: [
//       '**/dist/*',
//       '**/*.example.*',
//       '**/node_modules/*',
//       '**/build/*',
//       '**/fontPreviews/compression/modules/*',
//       '**/webpack.config.*',
//       'enzymeSetup.js',
//       'webpack.aliases.js',
//       'webpack.devServer.js',
//     ],
//   },
//   eslint.configs.recommended,
//   tseslint.configs.recommended,
//   {
//     extends: ['next/core-web-vitals'],

//     languageOptions: {
//       globals: {...globals.browser},

//       ecmaVersion: 2023,
//       sourceType: 'module',
//     },

//     plugins: {import: _import, react},

//   },
//   {
//     files: ['**/*.js', '**/*.jsx'],
//     rules: {'@typescript-eslint/no-require-imports': 0},
//   },
//   {
//     files: ['**/*.d.ts'],
//     rules: {'@typescript-eslint/consistent-type-definitions': 0},
//   },
// );
