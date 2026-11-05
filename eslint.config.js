const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/*', '.npm-cache/*', '.metro-cache/**'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'phosphor-react-native',
              message:
                'Use the app components/icons registry to avoid loading the full icon catalog in Metro.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.tsx'],
    rules: { 'react/jsx-no-leaked-render': ['error', { validStrategies: ['ternary'] }] },
  },
]);
