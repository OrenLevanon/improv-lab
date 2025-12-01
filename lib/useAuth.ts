import { useState, useEffect } from 'react';
import supabase from './supabaseClient';

export default function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }: any) => {
      if (!mounted) return;
      const u = data?.session?.user ?? null;
      // Check app_metadata.role for "pro" (Supabase stores subscription roles here)
      const role = u?.app_metadata?.role ?? u?.user_metadata?.subscriptionStatus;
      // eslint-disable-next-line no-console
      console.log('[useAuth] Session user:', u?.email, 'role:', role);
      setUser(u);
      setIsPro(role === 'pro');
    }).catch(() => {});

    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      const role = u?.app_metadata?.role ?? u?.user_metadata?.subscriptionStatus;
      // eslint-disable-next-line no-console
      console.log('[useAuth] Auth state changed, user:', u?.email, 'role:', role);
      setUser(u);
      setIsPro(role === 'pro');
    });

    return () => {
      mounted = false;
      try { listener?.subscription?.unsubscribe(); } catch { }
    };
  }, []);

  return { user, isPro };
}

// Helper to manually refresh the session (useful if metadata was updated server-side)
export async function refreshAuthSession() {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) {
      // eslint-disable-next-line no-console
      console.error('[useAuth] refresh error:', error);
      return null;
    }
    const u = session?.user ?? null;
    const role = u?.app_metadata?.role ?? u?.user_metadata?.subscriptionStatus;
    // eslint-disable-next-line no-console
    console.log('[useAuth] Session refreshed, role:', role);
    return u;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[useAuth] refresh exception:', e);
    return null;
  }
}
