import { useState, useEffect, useRef, useCallback } from 'react';
import supabase from './supabaseClient';

async function fetchUserProfile(userId: string): Promise<{ is_pro: boolean; stripe_customer_id?: string | null } | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_pro, stripe_customer_id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[useAuth] Error fetching profile:', error.code, error.message);
      // Try to create a profile if it doesn't exist (likely PGRST116 = no rows found)
      if (error.code === 'PGRST116') {
        console.log('[useAuth] No profile found for user', userId, '- creating one');
        try {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ id: userId, is_pro: false, stripe_customer_id: null })
            .select()
            .single();
          if (!insertError && newProfile) {
            console.log('[useAuth] Profile created successfully');
            return newProfile;
          }
          if (insertError) console.error('[useAuth] Error creating profile:', insertError.message);
        } catch (insertException) {
          console.error('[useAuth] Exception creating profile:', insertException);
        }
      }
      return null;
    }

    return data;
  } catch (e) {
    console.error('[useAuth] Exception fetching profile:', e);
    return null;
  }
}

// Global registry to allow manual profile refresh from anywhere
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let refetchCallbacks: Set<(userId: string) => void> = new Set();

export function registerRefetchCallback(callback: (userId: string) => void) {
  refetchCallbacks.add(callback);
  return () => refetchCallbacks.delete(callback);
}

export async function refetchUserProfile(userId: string) {
  console.log('[useAuth] Manual refetch requested for user:', userId);
  // Notify all registered components to refetch
  refetchCallbacks.forEach(cb => cb(userId));
}

export default function useAuth() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession() as { data: { session: { user: Record<string, unknown> } | null } | null };
      if (!mounted) return;
      
      const u = data?.session?.user ?? null;
      setUser(u);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (u && typeof u === 'object' && 'id' in u && typeof (u as any).id === 'string') {
        userIdRef.current = (u as any).id;
        // Try to fetch is_pro and stripe_customer_id from profiles table first
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profile = await fetchUserProfile((u as any).id);
        if (mounted) {
          if (profile !== null) {
            console.log('[useAuth] Session user:', u?.email, 'is_pro from profiles:', profile.is_pro, 'stripe_customer_id:', profile.stripe_customer_id);
            setIsPro(profile.is_pro);
            setStripeCustomerId(profile.stripe_customer_id || null);
          } else {
            // Fallback to metadata if profile fetch fails
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const role = (u as any)?.app_metadata?.role ?? (u as any)?.user_metadata?.subscriptionStatus;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const customerId = (u as any)?.user_metadata?.stripeCustomerId;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            console.log('[useAuth] Session user:', (u as any)?.email, 'role from metadata:', role, 'customerId:', customerId);
            setIsPro(role === 'pro');
            setStripeCustomerId(customerId || null);
          }
        }
      } else {
        setIsPro(false);
        setStripeCustomerId(null);
      }
    };

    initAuth().catch(() => {});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
      if (!mounted) return;
      
      const u = session?.user ?? null;
      setUser(u);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (u && typeof u === 'object' && 'id' in u && typeof (u as any).id === 'string') {
        userIdRef.current = (u as any).id;
        // Try to fetch is_pro and stripe_customer_id from profiles table first
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profile = await fetchUserProfile((u as any).id);
        if (mounted) {
          if (profile !== null) {
            console.log('[useAuth] Auth state changed, user:', u?.email, 'is_pro from profiles:', profile.is_pro, 'stripe_customer_id:', profile.stripe_customer_id);
            setIsPro(profile.is_pro);
            setStripeCustomerId(profile.stripe_customer_id || null);
          } else {
            // Fallback to metadata if profile fetch fails
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const role = (u as any)?.app_metadata?.role ?? (u as any)?.user_metadata?.subscriptionStatus;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const customerId = (u as any)?.user_metadata?.stripeCustomerId;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            console.log('[useAuth] Auth state changed, user:', (u as any)?.email, 'role from metadata:', role, 'customerId:', customerId);
            setIsPro(role === 'pro');
            setStripeCustomerId(customerId || null);
          }
        }
      } else {
        setIsPro(false);
        setStripeCustomerId(null);
      }
    });

    // Register callback for manual refetch requests
    const handleRefetch = async (requestedUserId: string) => {
      if (mounted && userIdRef.current === requestedUserId) {
        console.log('[useAuth] Handling manual refetch for user:', requestedUserId);
        const profile = await fetchUserProfile(requestedUserId);
        if (mounted && profile !== null) {
          console.log('[useAuth] Profile refetched, is_pro:', profile.is_pro, 'stripe_customer_id:', profile.stripe_customer_id);
          setIsPro(profile.is_pro);
          setStripeCustomerId(profile.stripe_customer_id || null);
        }
      }
    };

    const unsubscribe = registerRefetchCallback(handleRefetch);

    return () => {
      mounted = false;
      unsubscribe();
      try { listener?.subscription?.unsubscribe(); } catch { }
    };
  }, []);

  return { user, isPro, stripeCustomerId };
}

// Helper to manually refresh the session (useful if metadata was updated server-side)
export async function refreshAuthSession() {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('[useAuth] refresh error:', error);
      return null;
    }
    const u = session?.user ?? null;
    const role = u?.app_metadata?.role ?? u?.user_metadata?.subscriptionStatus;
    console.log('[useAuth] Session refreshed, role:', role);
    return u;
  } catch (e) {
    console.error('[useAuth] refresh exception:', e);
    return null;
  }
}

