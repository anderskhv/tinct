export type EmailEnv = {
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  BREVO_API_KEY?: string
}
// ===== Email: Send via Brevo =====

export async function sendEmail(
  env: EmailEnv,
  to: string,
  subject: string,
  html: string,
  options: { senderName?: string; replyTo?: string } = {}
): Promise<boolean> {
  if (!env.BREVO_API_KEY) return false
  try {
    const body: Record<string, unknown> = {
      sender: { name: options.senderName || 'Tinct', email: 'contact@tinct.app' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }
    if (options.replyTo) body.replyTo = { email: options.replyTo }
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const errText = await res.text()
      console.error('[sendEmail] failed:', res.status, errText)
    }
    return res.ok
  } catch (err) {
    console.error('[sendEmail] error:', err)
    return false
  }
}

// ═══ Lifecycle emails ═══
// Four emails across the 30-day trial. Voice is Tinct's, not personal.
// The mid-trial email is the feedback-request beat — it says we read every
// reply, so the inbox is a real feedback loop.

const EMAIL_FOOTER = `
  <p style="color: #aaa; font-size: 12px; margin-top: 32px;">Tinct · a new way to read<br>
  <a href="https://tinct.app" style="color: #aaa;">tinct.app</a></p>
`

const EMAIL_STYLE = `font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #2a2a2a; line-height: 1.55; font-size: 16px;`

const BTN_STYLE = `background: #1f4a5c; color: #fff; padding: 11px 24px; text-decoration: none; font-size: 15px; display: inline-block;`

function wrapEmail(inner: string): string {
  return `<div style="${EMAIL_STYLE}">${inner}${EMAIL_FOOTER}</div>`
}

// V1 lab pause: lifecycle/promotional emails are temporarily limited to
// Anders' own account and numbered Tinct test aliases. Keep this gate local to
// the scheduled campaign so transactional auth, issue-review, and internal
// anomaly emails continue to work normally.
function isLifecycleTestRecipient(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  return normalized === 'ahvelplund@fastmail.com' || /^tinct\d+@fastmail\.com$/.test(normalized)
}

// Day 0 — welcome
function welcomeEmail(): { subject: string; html: string } {
  return {
    subject: 'Welcome to Tinct',
    html: wrapEmail(`
      <h2 style="font-weight: 400; margin: 0 0 16px;">Welcome.</h2>
      <p>You're in. For the next 30 days you have full Premium: AI companion, audiobook, Cast, and Feed. No card on file, no charges. On day 30 you roll into the free tier automatically. Reading stays free forever.</p>
      <p style="margin: 22px 0;">
        <a href="https://tinct.app/read" style="${BTN_STYLE}">Open Tinct</a>
      </p>
      <p style="color: #555; font-size: 14px;">Tip: set a reading angle before you start a book. It sharpens what you notice and what the AI says back.</p>
    `),
  }
}

// Day 14 — mid-trial feedback ask
function midTrialEmail(): { subject: string; html: string } {
  return {
    subject: 'Halfway through — anything we should know?',
    html: wrapEmail(`
      <p>Two weeks in. You're halfway through your free Premium trial.</p>
      <p>We'd love to hear what's working and what isn't. <strong>Every reply to this email gets read.</strong> If something's bugging you, this is a good time to tell us before we build more on top of the same assumptions.</p>
      <p>What's felt right? What's felt off? Any book you wish was in the library?</p>
      <p style="color: #555; font-size: 14px;">No reply is fine too — just keep reading.</p>
    `),
  }
}

// Day 27 — 3 days left, the single warning
function threeDayEmail(): { subject: string; html: string } {
  return {
    subject: 'Your Tinct trial ends in 3 days',
    html: wrapEmail(`
      <h2 style="font-weight: 400; margin: 0 0 16px;">3 days left of Premium.</h2>
      <p>Your free Premium trial ends in <strong>3 days</strong>. To keep the AI companion, audiobook, Cast, and Feed, subscribe for <strong>$3/month</strong>.</p>
      <p style="margin: 22px 0;">
        <a href="https://tinct.app?action=subscribe" style="${BTN_STYLE}">Keep Premium · $3/mo</a>
      </p>
      <p style="color: #555; font-size: 14px;">Reading is always free. All your books, editions, highlights, and notes stay yours whether you subscribe or not.</p>
      <p style="color: #555; font-size: 14px;">Can't afford it? Reply to this email. We'll work something out.</p>
    `),
  }
}

// Day 30 — trial ended
function trialEndedEmail(): { subject: string; html: string } {
  return {
    subject: 'Your Tinct trial has ended',
    html: wrapEmail(`
      <h2 style="font-weight: 400; margin: 0 0 16px;">Your trial ended.</h2>
      <p>You're now on the free tier. Reading stays free: all the books, every edition, your highlights, your notes, your reading position across devices. Nothing you've already made is gone.</p>
      <p>Premium features (AI companion, audiobook, Cast, Feed) have paused. $3/month brings them back whenever you want.</p>
      <p style="margin: 22px 0;">
        <a href="https://tinct.app?action=subscribe" style="${BTN_STYLE}">Resubscribe · $3/mo</a>
      </p>
      <p style="color: #555; font-size: 14px;">Or just keep reading for free. The books are still here.</p>
    `),
  }
}

// ===== Cron: Trial lifecycle emails =====

/** Users whose account was created roughly `daysAgo` days ago (±12h window).
 * Filtered to accounts that haven't subscribed. */
async function usersAgedDays(env: EmailEnv, daysAgo: number): Promise<Array<{ id: string; email: string }>> {
  const now = Date.now()
  const start = new Date(now - (daysAgo + 0.5) * 24 * 60 * 60 * 1000).toISOString()
  const end = new Date(now - (daysAgo - 0.5) * 24 * 60 * 60 * 1000).toISOString()
  const query = `profiles?select=id,email&subscription_status=is.null&created_at=gte.${start}&created_at=lt.${end}`
  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${query}`, {
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    })
    if (!res.ok) {
      console.error(`[cron] Supabase query failed for daysAgo=${daysAgo}: ${res.status}`)
      return []
    }
    const users = await res.json() as Array<{ id: string; email: string }>
    return Array.isArray(users) ? users : []
  } catch (err) {
    console.error(`[cron] query error for daysAgo=${daysAgo}:`, err)
    return []
  }
}

export async function handleScheduled(env: EmailEnv): Promise<void> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[cron] Missing Supabase config, skipping')
    return
  }
  if (!env.BREVO_API_KEY) {
    console.error('[cron] Missing BREVO_API_KEY, skipping emails')
    return
  }

  // Four emails across the trial. Sent from "Tinct" brand voice. Mid-trial
  // email is the feedback ask — we commit to reading every reply.
  const milestones: Array<{ daysAgo: number; email: () => { subject: string; html: string } }> = [
    { daysAgo: 0,  email: () => welcomeEmail() },         // welcome
    { daysAgo: 14, email: () => midTrialEmail() },        // halfway — ask for feedback
    { daysAgo: 27, email: () => threeDayEmail() },        // 3 days left
    { daysAgo: 30, email: () => trialEndedEmail() },      // trial ended
  ]

  let totalSent = 0
  for (const { daysAgo, email } of milestones) {
    const users = await usersAgedDays(env, daysAgo)
    if (users.length === 0) {
      console.log(`[cron] daysAgo=${daysAgo}: 0 users`)
      continue
    }
    const { subject, html } = email()
    let sent = 0
    let skipped = 0
    for (const user of users) {
      if (!user.email) continue
      if (!isLifecycleTestRecipient(user.email)) {
        skipped++
        continue
      }
      const ok = await sendEmail(env, user.email, subject, html)
      if (ok) sent++
    }
    totalSent += sent
    console.log(`[cron] daysAgo=${daysAgo}: sent ${sent}/${users.length}, paused ${skipped}`)
  }
  console.log(`[cron] total emails sent: ${totalSent}`)

  // Anomaly detection: chapters with 3+ reports in the last 24h
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const anomalyRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/rpc/issue_anomalies`,
      {
        method: 'POST',
        headers: {
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ since_ts: since }),
      }
    )
    const anomalies = await anomalyRes.json() as { book_id: string; chapter_number: number; n: number }[]
    if (Array.isArray(anomalies) && anomalies.length > 0) {
      const rows = anomalies.map(a => `<li><strong>${a.book_id}</strong> ch${a.chapter_number}: ${a.n} reports</li>`).join('')
      await sendEmail(
        env,
        'contact@tinct.app',
        '[Tinct Anomaly] High issue volume detected',
        `<div style="font-family:sans-serif;max-width:600px">
          <p>The following chapters had 3+ issue reports in the last 24 hours:</p>
          <ul>${rows}</ul>
        </div>`
      )
    }
  } catch {
    // Silent
  }
}
