/**
 * "Send confirmation link" (approved 9 Oct 2026): the profile editor's button
 * for readers who signed up with email and want Everyone. One service email
 * with the same signed /confirm?t= link the welcome email carries
 * (lifecycle/links.ts confirmUrl, EMAIL_LINK_SECRET), confirmed by the same
 * route (routes/emailLinks.ts). The route itself is POST
 * /api/profile/confirm-link in routes/profiles.ts.
 *
 * An account email, not a reading email: it goes out only when the reader
 * asks for it, whatever their reading-email choice (privacy.html, "Account
 * and service emails … are sent regardless"). So neither LIFECYCLE_EMAILS nor
 * the lifecycle test gate (emails.ts isLifecycleTestRecipient, which pauses
 * the promotional campaign) applies: it works for every real account. Its
 * only switches are its secrets: no EMAIL_LINK_SECRET or BREVO_API_KEY, no
 * sender, and the route answers 503.
 *
 * Wording is the welcome email's confirm block (docs/lifecycle-emails/
 * templates/welcome.*) in the same look, nothing else.
 */
import { confirmUrl } from '../lifecycle/links'
import { escapeHtml } from '../lifecycle/render'
import { sendEmail, type EmailEnv } from './emails'
import type { UsageEnv } from '../lib/rateLimit'

export const CONFIRM_LINK_SUBJECT = 'Confirm your email'
const SENDER_ADDRESS = 'Tinct, Copenhagen, Denmark'

const SERIF = "font-family:Georgia, 'Times New Roman', serif;"
const SANS = "font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;"

export function confirmLinkEmail(url: string): { subject: string; html: string; text: string } {
  const href = escapeHtml(url)
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${CONFIRM_LINK_SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background-color:#ece8e0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ece8e0;">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#fbf8f2;border-radius:10px;">
<tr><td style="padding:30px 34px 26px 34px;">
<p style="margin:0 0 20px 0;${SERIF}font-size:20px;letter-spacing:-0.6px;color:#1b1814;">tinct</p>
<h1 style="margin:0 0 14px 0;${SERIF}font-size:27px;line-height:1.2;font-weight:normal;letter-spacing:-0.4px;color:#1b1814;">${CONFIRM_LINK_SUBJECT}</h1>
<p style="margin:0 0 14px 0;${SERIF}font-size:17px;line-height:1.55;color:#1b1814;">One click confirms this is your address:</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 6px 0;"><tr><td bgcolor="#1d1a16" style="background-color:#1d1a16;border-radius:999px;"><a href="${href}" style="display:inline-block;padding:13px 26px;${SANS}font-size:15px;font-weight:600;color:#f4efe4;text-decoration:none;border-radius:999px;">Confirm my email</a></td></tr></table>
</td></tr>
</table>
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;"><tr><td align="center" style="padding:16px 20px 0 20px;${SANS}font-size:12px;line-height:18px;color:#8a8274;">You&rsquo;re getting this because you have a Tinct account.<br>${SENDER_ADDRESS}</td></tr></table>
</td></tr>
</table>
</body>
</html>
`
  const text = `${CONFIRM_LINK_SUBJECT}\n\nOne click confirms this is your address:\n\nConfirm my email: ${url}\n\n--\nYou're getting this because you have a Tinct account.\n${SENDER_ADDRESS}\n`
  return { subject: CONFIRM_LINK_SUBJECT, html, text }
}

export type ConfirmLinkEnv = EmailEnv & { EMAIL_LINK_SECRET?: string }

/** The sender, or null when the Worker cannot sign or send (the route then answers 503). */
export function confirmLinkSender(env: ConfirmLinkEnv, now: () => number = Date.now): ((to: string, userId: string) => Promise<boolean>) | null {
  const secret = env.EMAIL_LINK_SECRET
  if (!secret || !env.BREVO_API_KEY) return null
  return async (to, userId) => {
    const email = confirmLinkEmail(await confirmUrl(secret, userId, to, now()))
    return sendEmail(env, to, email.subject, email.html, { text: email.text })
  }
}

export const CONFIRM_LINK_GAP_MS = 5 * 60_000
export const CONFIRM_LINK_DAILY = 5

/**
 * One email per account per 5 minutes, 5 a day, in the usage coordinator's
 * windows (atomic). Fails closed like lib/rateLimit.ts: no coordinator, or an
 * error, sends nothing.
 */
export function confirmLinkLimiter(env: UsageEnv): (userId: string) => Promise<boolean> {
  return async userId => {
    const windows = env.USAGE_COORDINATOR
    if (!windows) return false
    try {
      return await windows.getByName(`rl:confirm-link-5m:${userId}`).hit(1, CONFIRM_LINK_GAP_MS)
        && await windows.getByName(`rl:confirm-link-day:${userId}`).hit(CONFIRM_LINK_DAILY, 86_400_000)
    } catch {
      return false
    }
  }
}
