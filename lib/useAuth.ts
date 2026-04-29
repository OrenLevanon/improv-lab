import { useState, useEffect } from 'react';
import supabase from './supabaseClient';

async function fetchUserProfile(userId: string): Promise<{ is_pro: boolean } | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', userId)
      .single();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[useAuth] Error fetching profile:', error);
      return null;
    }

    return data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[useAuth] Exception fetching profile:', e);
    return null;
  }
}

export default function useAuth() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession() as { data: { session: { user: Record<string, unknown> } | null } | null };
      if (!mounted) return;
      
      const u = data?.session?.user ?? null;
      setUser(u);
      
      if (u?.id) {
        // Try to fetch is_pro from profiles table first
        const profile = await fetchUserProfile(u.id);
        if (mounted) {
          if (profile !== null) {
            // eslint-disable-next-line no-console
            console.log('[useAuth] Session user:', u?.email, 'is_pro from profiles:', profile.is_pro);
            setIsPro(profile.is_pro);
          } else {
            // Fallback to metadata if profile fetch fails
            const role = u?.app_metadata?.role ?? u?.user_metadata?.subscriptionStatus;
            // eslint-disable-next-line no-console
            console.log('[useAuth] Session user:', u?.email, 'role from metadata:', role);
            setIsPro(role === 'pro');
          }
        }
      } else {
        setIsPro(false);
      }
    };

    initAuth().catch(() => {});

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event: string, session: Record<string, unknown> | null) => {
      if (!mounted) return;
      
      const u = session?.user ?? null;
      setUser(u);
      
      if (u?.id) {
        // Try to fetch is_pro from profiles table first
        const profile = await fetchUserProfile(u.id);
        if (mounted) {
          if (profile !== null) {
            // eslint-disable-next-line no-console
            console.log('[useAuth] Auth state changed, user:', u?.email, 'is_pro from profiles:', profile.is_pro);
            setIsPro(profile.is_pro);
          } else {
            // Fallback to metadata if profile fetch fails
            const role = u?.app_metadata?.role ?? u?.user_metadata?.subscriptionStatus;
            // eslint-disable-next-line no-console
            console.log('[useAuth] Auth state changed, user:', u?.email, 'role from metadata:', role);
            setIsPro(role === 'pro');
          }
        }
      } else {
        setIsPro(false);
      }
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
