import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-11-17.clover' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerId } = req.body;

  console.log('[Portal] Request received. customerId:', customerId, 'STRIPE_SECRET_KEY set:', !!process.env.STRIPE_SECRET_KEY);

  if (!customerId || typeof customerId !== 'string') {
    console.error('[Portal] Invalid customerId:', customerId);
    return res.status(400).json({ error: 'customerId is required' });
  }

  const returnUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  console.log('[Portal] returnUrl:', returnUrl);

  try {
    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    console.log('[Portal] Session created successfully. URL:', session.url);
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('[Portal] Error creating billing portal session:', error);
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    return res.status(500).json({
      error: errorMsg,
      customerId,
      apiVersion: '2025-11-17.clover',
    });
  }
}
