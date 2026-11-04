import { createTravelHandler } from '../_shared/gateway.ts';

// Narrow runtime declaration also lets the repository's TypeScript check this entry point.
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Promise<Response>): void;
};
const env = (name: string) => Deno.env.get(name);
Deno.serve(
  createTravelHandler({
    supabaseUrl: env('SUPABASE_URL'),
    authKey: env('SUPABASE_ANON_KEY'),
    serviceKey: env('SUPABASE_SERVICE_ROLE_KEY'),
    geoapifyKey: env('GEOAPIFY_API_KEY'),
    mistralKey: env('MISTRAL_API_KEY'),
    mistralModel: env('MISTRAL_MODEL'),
    weatherMode: env('OPEN_METEO_MODE'),
    weatherKey: env('OPEN_METEO_API_KEY'),
    allowedOrigins: (env('ALLOWED_APP_ORIGINS') ?? 'http://localhost:8081,http://127.0.0.1:8081')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  }),
);
