import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    'settings': {
      'react': {
        'version': 'detect'
      }
    }
  },
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'], plugins: { js }, extends: ['js/recommended'] },
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'], languageOptions: { globals: globals.browser } },
  {
    rules: {
      'indent': ['error', 2],
      'semi': ['error', 'never'],
    }
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
])