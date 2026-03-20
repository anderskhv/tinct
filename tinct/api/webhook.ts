import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = {
  api: { bodyParser: false },
}

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  const stripe = new Stripe(stripeKey)
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const signature = req.headers['stripe-signature'] as string
  const rawBody = await getRawBody(req)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.supabase_user_id
    const creditCents = parseInt(session.metadata?.credit_cents || '0', 10)

    if (userId && creditCents > 0) {
      // Credit balance atomically
      const { error: rpcError } = await supabase.rpc('credit_balance', {
        p_user_id: userId,
        p_amount_cents: creditCents,
      })

      if (rpcError) {
        console.error('Balance credit failed:', rpcError)
        return res.status(500).json({ error: 'Balance credit failed' })
      }

      // Log payment
      await supabase.from('payments').insert({
        user_id: userId,
        stripe_session_id: session.id,
        amount_cents: creditCents,
        status: 'completed',
      })
    }
  }

  return res.status(200).json({ received: true })
}
