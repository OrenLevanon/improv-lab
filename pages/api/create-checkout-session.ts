import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });
const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { priceId, email, supabaseUserId } = req.body || {};
  console.log('create-checkout-session received priceId:', priceId);
  if (!priceId) return res.status(400).json({ error: 'Missing priceId', received: priceId });
  try {
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      payment_method_types: ['card'],
      success_url: `${domain}/upgrade-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/upgrade`,
      // pass along metadata to help webhook associate with supabase user
      metadata: {},
    };
    // If we have an email (from logged-in user), attach it so Stripe won't prompt for it
    if (email) params.customer_email = email;
    if (supabaseUserId) {
      params.metadata = { supabaseUserId };
      // also set client_reference_id so the session includes the supabase user id for easier matching
      (params as any).client_reference_id = supabaseUserId;
    }

    const session = await stripe.checkout.sessions.create(params);
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('CHECKOUT ERROR:', err, 'priceId:', priceId);
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    return res.status(500).json({ error: 'Stripe error', details: message, receivedPriceId: priceId });
  }
}
