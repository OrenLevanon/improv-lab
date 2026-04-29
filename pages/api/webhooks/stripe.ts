import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-11-17.clover' });

// Helper function to update Supabase profile
async function updateUserProfile(userId: string, supabaseAdmin: SupabaseClient): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_pro: true })
      .eq('id', userId);

    if (error) {
      console.error('[Stripe Webhook] Error updating profile:', error);
      return false;
    }

    console.log('[Stripe Webhook] Successfully updated profile for user:', userId);
    console.log('[Stripe Webhook] Set is_pro = true');
    return true;
  } catch (err) {
    console.error('[Stripe Webhook] Exception updating profile:', err);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // Initialize Supabase admin client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseServiceKey) {
    console.error('[Stripe Webhook] SUPABASE_SERVICE_ROLE_KEY is not set');
    return res.status(500).json({ error: 'Supabase service key not configured' });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Read raw body for signature verification
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buf = await buffer(req as unknown as any);
    const sig = req.headers['stripe-signature'] as string | undefined;

    if (!sig) {
      console.error('[Stripe Webhook] No stripe-signature header');
      return res.status(400).json({ error: 'No stripe-signature header' });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret);
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err);
      return res.status(400).json({ error: 'Webhook signature verification failed' });
    }

    // Log event type
    console.log('[Stripe Webhook] Received event:', event.type);

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;

      console.log('[Stripe Webhook] checkout.session.completed');
      console.log('[Stripe Webhook] Session ID:', session.id);
      console.log('[Stripe Webhook] User ID:', userId);
      console.log('[Stripe Webhook] Customer Email:', session.customer_details?.email);
      console.log('[Stripe Webhook] Subscription ID:', session.subscription);

      if (!userId) {
        console.warn('[Stripe Webhook] No user_id in session metadata, skipping profile update');
        return res.status(200).json({ received: true, warning: 'No user_id in metadata' });
      }

      const success = await updateUserProfile(userId as string, supabaseAdmin);
      if (!success) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }
    }

    // Handle invoice.payment_succeeded (recurring subscription payments)
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      
      console.log('[Stripe Webhook] invoice.payment_succeeded');
      console.log('[Stripe Webhook] Invoice ID:', invoice.id);
      console.log('[Stripe Webhook] Customer ID:', invoice.customer);

      let userId: string | undefined;

      // Try to get user_id from invoice metadata first
      userId = (invoice.metadata as Record<string, unknown>)?.user_id as string | undefined;
      console.log('[Stripe Webhook] Invoice metadata.user_id:', userId);

      // If not found, try to get from subscription (via lines[0])
      if (!userId && invoice.lines && invoice.lines.data.length > 0) {
        try {
          const subscriptionId = invoice.lines.data[0].subscription as string;
          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            userId = (subscription.metadata as Record<string, unknown>)?.user_id as string | undefined;
            console.log('[Stripe Webhook] Subscription metadata.user_id:', userId);
          }
        } catch (err) {
          console.error('[Stripe Webhook] Error retrieving subscription:', err);
        }
      }

      // If still not found, try to get from customer
      if (!userId && invoice.customer) {
        try {
          const customer = await stripe.customers.retrieve(invoice.customer as string);
          if (customer && 'metadata' in customer) {
            userId = (customer.metadata as Record<string, unknown>)?.user_id as string | undefined;
            console.log('[Stripe Webhook] Customer metadata.user_id:', userId);
          }
        } catch (err) {
          console.error('[Stripe Webhook] Error retrieving customer:', err);
        }
      }

      if (!userId) {
        console.warn('[Stripe Webhook] No user_id found in invoice/subscription/customer metadata, skipping profile update');
        return res.status(200).json({ received: true, warning: 'No user_id found' });
      }

      const success = await updateUserProfile(userId, supabaseAdmin);
      if (!success) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook] Handler error:', err);
    return res.status(500).json({ error: 'Webhook handler error' });
  }
}
