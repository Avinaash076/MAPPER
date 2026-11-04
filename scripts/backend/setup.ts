import { prepareBackendFiles } from './config';

async function main() {
  for (const report of await prepareBackendFiles(process.cwd())) console.log(report);
  console.log(
    'Next: fill public Supabase settings, configure the staging project and upload server secrets.',
  );
  console.log(
    'Run npm.cmd run backend:check for configuration checks. See docs/supabase-setup.md.',
  );
}
main().catch(() => {
  console.error(
    'Setup could not create the files. Check permissions and keep existing files intact.',
  );
  process.exitCode = 1;
});
