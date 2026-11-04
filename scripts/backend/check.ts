import {
  publicConfigChecks,
  readBackendConfig,
  serverConfigChecks,
  type SetupCheck,
} from './config';
import { checkRemoteBackend } from './checks';

function print(checks: SetupCheck[]) {
  for (const check of checks)
    console.log(`${check.ok ? 'PASS' : 'NEEDS SETUP'} · ${check.name}: ${check.detail}`);
}
async function main() {
  const args = process.argv.slice(2);
  const originIndex = args.indexOf('--origin');
  const origin = originIndex < 0 ? 'http://localhost:8081' : args[originIndex + 1];
  if (!origin || new URL(origin).origin !== origin) throw new Error('Invalid origin');
  const config = await readBackendConfig(process.cwd());
  const app = publicConfigChecks(config);
  const server = serverConfigChecks(config, origin);
  console.log(`Server file: ${config.serverFile}. Values are never printed.`);
  print(app);
  print(server);
  let failed = [...app, ...server].some((check) => !check.ok);
  if (args.includes('--online')) {
    if (app.slice(0, 3).some((check) => !check.ok))
      console.log('Online checks skipped until public connection settings are valid.');
    else {
      const checks = await checkRemoteBackend(config, origin);
      print(checks);
      failed ||= checks.some((check) => !check.ok);
    }
  } else console.log('No network requests made. Add -- --online for read-only remote checks.');
  console.log(
    'Presence checks do not verify provider keys, SMTP delivery, hosted secrets or device behavior.',
  );
  if (failed) process.exitCode = 1;
}
main().catch(() => {
  console.error('Configuration could not be checked. See docs/supabase-setup.md.');
  process.exitCode = 1;
});
