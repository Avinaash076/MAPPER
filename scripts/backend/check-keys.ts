import { readBackendConfig } from './config';
import { checkProviderKeys } from './provider-checks';

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: npm.cmd run keys:check [-- --chat]');
    console.log(
      'Default: address request, Mistral model lookup and forecast. --chat generates a sample AI answer instead of model lookup.',
    );
    console.log(
      'Internet and provider allowances are required. Supabase is not required. This help made no requests.',
    );
    return;
  }
  if (args.some((argument) => argument !== '--chat')) {
    console.error('Unsupported option. Run npm.cmd run keys:check -- --help. No requests made.');
    process.exitCode = 1;
    return;
  }
  const config = await readBackendConfig(process.cwd());
  const chat = args.includes('--chat');
  console.log(`Reading ${config.serverFile}. Keys and raw responses are hidden.`);
  console.log(
    'Testing providers directly from this PC. No Supabase, database, login or deployment is used.',
  );
  console.log(
    chat
      ? 'Making one address search, one paid/quota-counted sample AI completion and one forecast request.'
      : 'Making one address search, one Mistral model lookup (no generated answer) and one forecast request. Provider quotas apply.',
  );
  const checks = await checkProviderKeys(
    {
      geoapifyKey: config.server.GEOAPIFY_API_KEY,
      mistralKey: config.server.MISTRAL_API_KEY,
      mistralModel: config.server.MISTRAL_MODEL,
      weatherMode: config.server.OPEN_METEO_MODE,
      weatherKey: config.server.OPEN_METEO_API_KEY,
    },
    { chat },
  );
  for (const check of checks)
    console.log(`${check.ok ? 'PASS' : 'FAIL'} · ${check.name}: ${check.detail}`);
  if (checks.some((check) => !check.ok)) process.exitCode = 1;
  console.log(
    'This does not connect the app UI. App online features still use the Supabase backend.',
  );
}
main().catch(() => {
  console.error('Could not read server settings. Check your saved .env file. No keys are printed.');
  process.exitCode = 1;
});
