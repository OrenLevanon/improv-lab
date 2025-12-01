import { createClient } from '@supabase/supabase-js';

// Ensure you set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
	// Helpful runtime warning for developers — ensures env vars are present
	// (Don't throw so the app can still run in some environments)
	// eslint-disable-next-line no-console
	console.warn('Supabase env not fully configured: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

// Debug: log the supabase URL at runtime for easier troubleshooting of 401s.
// This will run both on server and client (NEXT_PUBLIC_* vars are inlined into client bundles).
try {
	if (typeof window === 'undefined') {
		// server-side
		// eslint-disable-next-line no-console
		console.log('[supabaseClient] using NEXT_PUBLIC_SUPABASE_URL (server):', supabaseUrl);
	} else {
		// client-side
		// eslint-disable-next-line no-console
		console.log('[supabaseClient] using NEXT_PUBLIC_SUPABASE_URL (client):', process.env.NEXT_PUBLIC_SUPABASE_URL);
	}
} catch (e) {
	// swallow any errors in logging
}
