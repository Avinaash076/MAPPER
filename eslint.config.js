const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/*', '.npm-cache/*', '.metro-cache/**'] },
  {
    files: ['src/**/*.tsx'],
    rules: { 'react/jsx-no-leaked-render': ['error', { validStrategies: ['ternary'] }] },
  },
]);
