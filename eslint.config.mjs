import globals from 'globals';
import { defineConfig } from 'eslint/config';


export default defineConfig([
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'indent': ['error', 2],     
      'no-unused-vars': 'warn',   
    },
  },
  {
    ignores: [
      'node_modules',
      'app/prisma',
    ]
  }
]);
