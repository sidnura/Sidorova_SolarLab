import pluginJs from '@eslint/js';
import sort from 'eslint-plugin-sort';
import sortClassMembers from 'eslint-plugin-sort-class-members';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  sort.configs['flat/recommended'],
  sortClassMembers.configs['flat/recommended'],
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { files: ['**/*.js'], languageOptions: { sourceType: 'script' } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': ['warn'],
      '@typescript-eslint/interface-name-prefix': ['off'],
      '@typescript-eslint/member-ordering': ['warn'],
      '@typescript-eslint/no-empty-interface': ['warn'],
      '@typescript-eslint/no-explicit-any': ['off'],
      '@typescript-eslint/no-namespace': ['off'],
      '@typescript-eslint/no-require-imports': ['warn'],
      '@typescript-eslint/no-unused-expressions': 0,
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/prefer-as-const': ['warn'],
      '@typescript-eslint/unified-signatures': ['warn'],
      'comma-dangle': ['off', 'always-multiline'],
      eqeqeq: ['error', 'always'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-constant-binary-expression': 0,
      'no-nested-ternary': ['warn'],
      'no-unneeded-ternary': ['warn'],
      'one-var': ['error', 'never'],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', next: 'return', prev: '*' },
        {
          blankLine: 'always',
          next: '*',
          prev: ['case', 'default', 'multiline-block-like'],
        },
        {
          blankLine: 'always',
          next: ['case', 'default', 'multiline-block-like'],
          prev: '*',
        },
        {
          blankLine: 'always',
          next: '*',
          prev: ['const', 'let', 'var', 'import'],
        },
        {
          blankLine: 'any',
          next: ['const', 'let', 'var', 'import'],
          prev: ['const', 'let', 'var', 'import'],
        },
      ],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'sort-class-members/sort-class-members': [
        2,
        {
          accessorPairPositioning: 'together',
          stopAfterFirstProblem: true,
        },
      ],
    },
  },
];
