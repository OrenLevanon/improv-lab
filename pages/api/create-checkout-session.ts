import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover'
});
const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  // Extract request body
  const { priceId, email, supabaseUserId } = req.body || {};
  console.log('create-checkout-session received priceId:', priceId);
  console.log('create-checkout-session received supabaseUserId:', supabaseUserId);
  
  if (!priceId) return res.status(400).json({ error: 'Missing priceId', received: priceId });
  
  try {
    // Create checkout session params
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      payment_method_types: ['card'],
      success_url: `${domain}/upgrade-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/upgrade`,
      // Include metadata with user_id for webhook
      metadata: {},
    };
    
    // Attach customer email if logged in
    if (email) {
      params.customer_email = email;
      console.log('Checkout email:', email);
    }
    
    // Include Supabase user ID in metadata and client_reference_id
    if (supabaseUserId) {
      params.metadata = { user_id: supabaseUserId };
      (params as Record<string, unknown>).client_reference_id = supabaseUserId;
      console.log('Checkout metadata.user_id:', supabaseUserId);
    } else {
      console.warn('No supabaseUserId provided to checkout');
    }

    // Create the session
    const session = await stripe.checkout.sessions.create(params);
    console.log('Checkout session created:', session.id);
    
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('CHECKOUT ERROR:', err, 'priceId:', priceId);
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    return res.status(500).json({ error: 'Stripe error', details: message, receivedPriceId: priceId });
  }
}
