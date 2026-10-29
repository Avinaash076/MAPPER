import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// The publishable key is public by design. RLS protects private submissions.
// Sessions stay in memory; discovery and local drafts do not require sign-in.
export const communityClient =
  url && key
    ? createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: false },
      })
    : null;
