import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return res.status(500).json({ error: 'Stripe not configured' })
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  // Verify user auth
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const { amount_cents } = req.body
  const validAmounts = [500, 1000, 2000]
  if (!validAmounts.includes(amount_cents)) {
    return res.status(400).json({ error: 'Invalid amount. Choose $5, $10, or $20.' })
  }

  try {
    const stripe = new Stripe(stripeKey)

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const amountLabels: Record<number, string> = {
      500: '$5 — ~150 messages',
      1000: '$10 — ~300 messages',
      2000: '$20 — ~600 messages',
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Tinct AI Chat Credits',
              description: amountLabels[amount_cents],
            },
            unit_amount: amount_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'https://tinct.app'}?payment=success`,
      cancel_url: `${req.headers.origin || 'https://tinct.app'}?payment=cancelled`,
      metadata: {
        supabase_user_id: user.id,
        credit_cents: String(amount_cents),
      },
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    return res.status(500).json({
      error: 'Checkout creation failed',
      details: err instanceof Error ? err.message : String(err),
    })
  }
}
