import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const readJson = async (name) =>
  JSON.parse((await readFile(path.join(root, name), 'utf8')).replace(/^\uFEFF/, ''));
const references = await readJson('assets/karnataka-references.json');
const existingCredits = await readJson('assets/photo-credits.json');
const credits = Object.fromEntries(
  ['kelgeri-lake', 'belagavi-fort', 'gokak-falls', 'unkal-lake'].map((id) => [
    id,
    existingCredits[id],
  ]),
);
for (const reference of references) {
  credits[reference.id] = {
    author: reference.author,
    license: reference.license,
    licenseUrl: reference.licenseUrl,
    sourceUrl: reference.photoSourceUrl,
  };
}
// A TypeScript data file avoids treating JSON asset imports as runtime URLs in the preview bundler.
await writeFile(
  path.join(root, 'src/referenceData.ts'),
  `// Generated from credited reference metadata by scripts/sync-reference-data.mjs.\nexport const referencePlaces = ${JSON.stringify(references, null, 2)};\nexport const photoCredits: Record<string, { author: string; license: string; licenseUrl?: string; sourceUrl: string; uri?: string }> = ${JSON.stringify(credits, null, 2)};\n`,
);
