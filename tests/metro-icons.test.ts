import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { ESLint } from 'eslint';

test('lint prevents full Phosphor catalog imports while allowing public single-icon entries', async () => {
  const lint = new ESLint();
  const [barrel] = await lint.lintText(
    "import { CheckIcon } from 'phosphor-react-native'; export const icon = CheckIcon;",
    { filePath: 'src/components/IconImportExample.tsx' },
  );
  assert.equal(
    barrel.messages.filter((message) => message.ruleId === 'no-restricted-imports').length,
    1,
  );
  const [individual] = await lint.lintText(
    "export { CheckIcon } from 'phosphor-react-native/src/icons/Check';",
    { filePath: 'src/components/IconImportExample.ts' },
  );
  assert.equal(
    individual.messages.filter((message) => message.ruleId === 'no-restricted-imports').length,
    0,
  );
});

test('Windows Metro uses a single transform worker without the worker-thread pool', () => {
  const require = createRequire(path.resolve('tests/metro-icons.test.ts'));
  const config = require('../metro.config.js');
  if (process.platform === 'win32') {
    assert.equal(config.maxWorkers, 1);
    assert.equal(config.transformer.unstable_workerThreads, false);
  } else assert.ok(config.maxWorkers <= 2);
});
