import { createClient } from '@supabase/supabase-js';

// Ensure you set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn('Supabase env not fully configured: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

// Debug: log the supabase URL at runtime for easier troubleshooting of 401s.
// This will run both on server and client (NEXT_PUBLIC_* vars are inlined into client bundles).
try {
	if (typeof window === 'undefined') {
		// server-side
		console.log('[supabaseClient] using NEXT_PUBLIC_SUPABASE_URL (server):', supabaseUrl);
	} else {
		// client-side
		console.log('[supabaseClient] using NEXT_PUBLIC_SUPABASE_URL (client):', process.env.NEXT_PUBLIC_SUPABASE_URL);
	}
} catch {
	// swallow any errors in logging
}
