import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/placeholder.module.css';
import supabase from '../lib/supabaseClient';
import useAuth from '../lib/useAuth';

  // Read price IDs from env (public). Provide sensible fallbacks if missing.
  const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_MONTHLY_PRICE_ID ?? 'price_1SVaveR0HwyCDF23I8UloDkQ';
  const YEARLY_PRICE_ID = process.env.NEXT_PUBLIC_YEARLY_PRICE_ID ?? 'price_1SVazBR0HwyCDF23TPFn7RgV';
const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default function Upgrade() {
  const router = useRouter();

  const { user } = useAuth();

  const createCheckout = async (priceId?: string) => {
    try {
      if (!priceId) {
        console.error('createCheckout called without a priceId. Check NEXT_PUBLIC_MONTHLY_PRICE_ID / NEXT_PUBLIC_YEARLY_PRICE_ID in your .env.local');
        alert('Pricing not configured. Please contact the site admin.');
        return;
      }
      console.log('Initiating checkout for priceId:', priceId);
      // If logged in, include Supabase user id; otherwise leave undefined and allow Stripe to collect email
      const body: any = { priceId };
      if (user?.id) body.supabaseUserId = user.id;
      // also include email if available (helps associate)
      if (user?.email) body.email = user.email;

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      console.log('create-checkout-session response status:', res.status);
      const data = await res.json();
      console.log('create-checkout-session response data:', data);
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error.');
    }
  };

  return (
    <>
      <Head>
        <title>Upgrade to Pro</title>
      </Head>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1d', color: '#f0f0f0', padding: 40 }}>
        <div style={{ display: 'flex', gap: 24, maxWidth: 900, width: '100%', justifyContent: 'center' }}>
          <div style={{ background: '#2c2c34', border: '1px solid #444', borderRadius: 12, padding: 24, width: 320 }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Monthly</h3>
            <p style={{ marginTop: 8, marginBottom: 16, fontSize: '1.5rem', fontWeight: 700 }}>€3.99 / month</p>
            <div style={{ marginBottom: 12 }}>Billed monthly. Cancel anytime.</div>
            <button onClick={() => createCheckout(MONTHLY_PRICE_ID)} style={{ width: '100%', padding: '12px 16px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Upgrade</button>
          </div>
          <div style={{ background: '#2c2c34', border: '1px solid #444', borderRadius: 12, padding: 24, width: 360 }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Yearly</h3>
            <p style={{ marginTop: 8, marginBottom: 8, fontSize: '1.5rem', fontWeight: 700 }}>€24.99 / year</p>
            <div style={{ marginBottom: 12 }}>Equivalent to €2.08/month — save over the monthly plan.</div>
            <button onClick={() => createCheckout(YEARLY_PRICE_ID)} style={{ width: '100%', padding: '12px 16px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Upgrade</button>
          </div>
        </div>
      </div>
    </>
  );
}
