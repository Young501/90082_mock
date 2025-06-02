import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/public/**',
      '**/.env*'
    ],
  },

  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Indentation
      indent: ['error', 2],
      // Quote style
      quotes: ['error', 'single'],

      // No unused variables
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // Prefer const over let when possible
      'prefer-const': 'error',

      // Prevent trailing spaces
      'no-trailing-spaces': 'error',

      // Limit max line length
      'max-len': ['warn', { code: 100, ignoreUrls: true }],

      // Enforce consistent spacing inside braces
      'object-curly-spacing': ['error', 'always'],

      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }
];

export default eslintConfig;
