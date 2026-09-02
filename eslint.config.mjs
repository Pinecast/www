import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

const config = [
  {ignores: ['**/.next/', '**/out/', '.claude/', 'next-env.d.ts']},
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      '@typescript-eslint/array-type': ['error', {default: 'generic'}],
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

      // eslint-plugin-react-hooks 7 (pulled in by eslint-config-next 16) adds
      // React Compiler rules to its recommended set. This site doesn't use the
      // compiler and its canvas/audio code predates the rules, so keep them off.
      'react-hooks/immutability': 0,
      'react-hooks/purity': 0,
      'react-hooks/refs': 0,
      'react-hooks/set-state-in-effect': 0,
    },
  },
];

export default config;
