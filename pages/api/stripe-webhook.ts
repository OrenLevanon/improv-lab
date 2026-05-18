import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-11-17.clover' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buf = await buffer(req as unknown as any);
  const sig = req.headers['stripe-signature'] as string | undefined;
  let event: Stripe.Event;
  try {
    if (!sig) throw new Error('No signature');
    event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email || (session.customer as string) || null;
      const subscriptionId = session.subscription as string | undefined;
      let plan = 'unknown';
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price?.id;
        if (priceId === process.env.MONTHLY_PRICE_ID) plan = 'monthly';
        if (priceId === process.env.YEARLY_PRICE_ID) plan = 'yearly';
      }
      if (email || session.metadata?.user_id) {
        // Update or create Supabase user metadata using service role key
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        if (!supabaseServiceKey) {
          console.warn('SUPABASE_SERVICE_ROLE_KEY is not set; cannot update user metadata.');
        } else {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let userRecord: any = null;
            // If checkout session included user_id, try to find by id
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const supabaseUserId = (session.metadata as any)?.user_id || null;
            if (supabaseUserId) {
              const { data, error } = await supabase.auth.admin.getUserById(supabaseUserId);
              if (!error && data) userRecord = data;
            }
            // If still not found, try to find by email
            if (!userRecord && email) {
              const list = await supabase.auth.admin.listUsers();
              if (list.data && Array.isArray(list.data.users)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                userRecord = list.data.users.find((u: any) => u.email === email) || null;
              }
            }
            // If still not found, create a new Supabase user with the email
            if (!userRecord && email) {
              const createResp = await supabase.auth.admin.createUser({ email, email_confirm: true });
              if (createResp?.data) userRecord = createResp.data;
            }

                  if (userRecord) {
                    // Update metadata with subscription info and stripe ids + period start/end
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const updates: any = { subscriptionStatus: 'pro', plan };
                    if (session.customer) updates.stripeCustomerId = session.customer as string;
                    if (subscriptionId) updates.stripeSubscriptionId = subscriptionId;
                    // Add subscription period start/end if available
                    if (subscriptionId) {
                      try {
                        const sub = await stripe.subscriptions.retrieve(subscriptionId);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const psValue = (sub as any).current_period_start as number;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const peValue = (sub as any).current_period_end as number;
                        if (psValue) updates.period_start = new Date(psValue * 1000).toISOString();
                        if (peValue) updates.period_end = new Date(peValue * 1000).toISOString();
                      } catch (e) {
                        console.warn('Could not retrieve subscription period info:', e);
                      }
                    }
                    await supabase.auth.admin.updateUserById(userRecord.id as string, { user_metadata: updates });
                    
                    // Also update profiles table with stripe_customer_id and is_pro flag
                    const stripeCustomerId = session.customer as string || null;
                    try {
                      const { error: upsertError } = await supabase
                        .from('profiles')
                        .upsert({
                          id: userRecord.id as string,
                          stripe_customer_id: stripeCustomerId,
                          is_pro: true,
                          updated_at: new Date().toISOString()
                        }, {
                          onConflict: 'id'
                        });
                      
                      if (upsertError) {
                        console.error('Error upserting profiles table:', upsertError);
                      } else {
                        console.log('Updated profiles table for user', userRecord.id, 'with stripe_customer_id:', stripeCustomerId);
                      }
                    } catch (e) {
                      console.error('Error updating profiles table:', e);
                    }
                    
                    console.log('Updated/created Supabase user for', email || userRecord.id);
                  } else {
                    console.warn('Could not find or create Supabase user for', email);
                  }
          } catch (e) {
            console.error('Error updating/creating supabase user metadata:', e);
          }
        }
      }
    }
    res.json({ received: true });
  } catch (e) {
    console.error('Webhook handler error:', e);
    res.status(500).send('Server error');
  }
}
