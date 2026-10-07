/**
 * Signed links from lifecycle emails (src/worker/lifecycle/links.ts):
 *
 * - /unsubscribe?t=…  One-click "Stop reading emails". POST (the mail
 *   client's List-Unsubscribe-Post one-click, or the page's own form) switches
 *   reading emails off at once: profiles.email_opt_in = false and
 *   email_opt_out_at = now(). GET answers with a page whose form posts itself
 *   on load, so a reader needs one click while link scanners that only fetch
 *   (and run no script) cannot unsubscribe anyone.
 * - /confirm?t=…      One-click email confirmation from the welcome email:
 *   sets ship 2's profiles.email_confirmed_at once, for the address the link
 *   was sent to. POST confirms; GET answers with a page that posts itself (one
 *   click for people, nothing for link scanners), as /unsubscribe does. This is
 *   the only confirm route (ship 2's /api/confirm-email was folded into it).
 *
 * Handled only when EMAIL_LINK_SECRET is set and the URL carries `t`; without
 * the secret no such link was ever sent and the request falls through
 * exactly as before. Links keep working after LIFECYCLE_EMAILS is switched off.
 */
import { emailHash, verifyLink } from '../lifecycle/links'

export interface EmailLinksEnv {
  EMAIL_LINK_SECRET?: string
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

const PAGE_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function page(title: string, body: string, status = 200, extraHead = ''): Response {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(title)} · Tinct</title>${extraHead}</head>`
    + `<body style="margin:0;background:#ece8e0;font-family:Georgia,'Times New Roman',serif;color:#1b1814"><main style="max-width:520px;margin:10vh auto;padding:32px 28px;background:#fbf8f2;border-radius:10px">`
    + `<p style="margin:0 0 18px;font-size:20px;letter-spacing:-0.6px">tinct</p><h1 style="margin:0 0 14px;font-size:26px;font-weight:normal;line-height:1.2">${escapeHtml(title)}</h1>${body}</main></body></html>`
  return new Response(html, { status, headers: PAGE_HEADERS })
}

const p = (text: string) => `<p style="margin:0 0 14px;font-size:17px;line-height:1.55">${text}</p>`
const BUTTON = 'display:inline-block;padding:13px 26px;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#f4efe4;background:#1d1a16;border:0;border-radius:999px;text-decoration:none;cursor:pointer'
const LIBRARY = `<p style="margin:18px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px"><a href="/library" style="color:#1b1814">Open the library</a></p>`

async function patchProfile(env: EmailLinksEnv, filter: string, data: Record<string, unknown>): Promise<Response> {
  return fetch(`${env.SUPABASE_URL}/rest/v1/profiles?${filter}`, {
    method: 'PATCH',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(data),
  })
}

export function isEmailLinkRequest(url: URL, env: EmailLinksEnv): boolean {
  return Boolean(env.EMAIL_LINK_SECRET) && (url.pathname === '/unsubscribe' || url.pathname === '/confirm') && url.searchParams.has('t')
}

export async function handleEmailLink(request: Request, env: EmailLinksEnv): Promise<Response> {
  const url = new URL(request.url)
  const token = url.searchParams.get('t')
  const secret = env.EMAIL_LINK_SECRET ?? ''
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return page('Something went wrong', p('Please try again later, or reply to the email.'), 503)

  if (url.pathname === '/unsubscribe') {
    const payload = await verifyLink(secret, token, 'u')
    if (!payload) return page('This link does not work', p('It may have been copied incompletely. Reply to the email and we will switch reading emails off for you.'), 400)
    if (request.method === 'POST') {
      const res = await patchProfile(env, `id=eq.${payload.u}`, { email_opt_in: false, email_opt_out_at: new Date().toISOString() })
      if (!res.ok) return page('Something went wrong', p('Please try again later, or reply to the email and we will switch reading emails off for you.'), 503)
      // RFC 8058: the mail client's one-click POST needs only a 200.
      return page('Reading emails are off', p('We won&rsquo;t send you reading emails any more. Account emails, such as the welcome and trial notices, still arrive.') + p('You can switch reading emails back on in your account settings.') + LIBRARY)
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 })
    const action = escapeHtml(`/unsubscribe?t=${encodeURIComponent(token!)}`)
    return page('Stop reading emails', `<form method="post" action="${action}" id="stop">${p('One click switches off emails about your reading progress and what to read next.')}<button type="submit" style="${BUTTON}">Stop reading emails</button></form>`
      + `<script>document.getElementById('stop').submit()</script>`)
  }

  // /confirm
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const payload = await verifyLink(secret, token, 'c')
  if (!payload) return page('This link has expired', p('Confirmation links work for 30 days. Sign in to Tinct and we will send a new one.') + LIBRARY, 400)
  if (request.method !== 'POST') {
    // Like /unsubscribe: the page posts itself, so the reader's one click confirms
    // while a link scanner that only fetches confirms nobody.
    const action = escapeHtml(`/confirm?t=${encodeURIComponent(token!)}`)
    return page('Confirm your email', `<form method="post" action="${action}" id="confirm">${p('One click confirms this address for Tinct.')}<button type="submit" style="${BUTTON}">Confirm my email</button></form>`
      + `<script>document.getElementById('confirm').submit()</script>`)
  }
  const profileRes = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${payload.u}&select=*&limit=1`, {
    headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
  })
  const profile = profileRes.ok ? (await profileRes.json() as Array<Record<string, unknown>>)[0] : null
  if (!profile || typeof profile.email !== 'string' || await emailHash(profile.email) !== payload.e) {
    return page('This link does not work', p('It was sent to a different address. Sign in to Tinct and we will send a new one.') + LIBRARY, 400)
  }
  if (!('email_confirmed_at' in profile)) return page('Something went wrong', p('Please try again later.'), 503)
  if (!profile.email_confirmed_at) {
    const res = await patchProfile(env, `id=eq.${payload.u}&email_confirmed_at=is.null`, { email_confirmed_at: new Date().toISOString() })
    if (!res.ok) return page('Something went wrong', p('Please try again later.'), 503)
  }
  return page('Your email is confirmed', p('Thank you. Reading emails, if you asked for them, and a public profile, if you choose one, are now possible.') + LIBRARY)
}
