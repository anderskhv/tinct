/**
 * POST /api/admin/announce-email — the one-off announcement service email
 * (docs/lifecycle-emails/templates/announce.*), site admins only.
 *
 * Body: { campaign: "add-any-book-2026-10", omitFeatures?: [...], dryRun?: true }
 * - campaign: a slug ending in its month (-YYYY-MM); each reader gets a
 *   campaign at most once (send log key `announce:<campaign>`), so repeating
 *   the call is safe. It sends only from a month before that month to 12
 *   months after it, inside the send log's 24 months (announceCampaignOpen).
 * - omitFeatures: feature rows not live at send time, from ANNOUNCE_FEATURES
 *   (their row, and their privacy sentence, are dropped from both parts).
 * - dryRun: returns the rendered email and the recipient count; sends nothing.
 *
 * Off (404) unless LIFECYCLE_EMAILS is on; while the test gate is on only the
 * tinct{n}@fastmail.com aliases (and Anders's own account) can receive it.
 */
import { jsonResponse } from '../lib/responses'
import { ANNOUNCE_DEFAULTS, ANNOUNCE_FEATURES, announceCampaignOpen, LIBRARY_ART, runAnnouncement, SENDER_ADDRESS } from '../lifecycle/engine'
import { renderEmail } from '../lifecycle/render'
import { configured, createLifecycleDeps, lifecycleEmailsOn, lifecycleProfiles, type LifecycleEnv } from '../lifecycle/runtime'

type VerifySiteAdmin = (env: LifecycleEnv, request: Request) => Promise<boolean>

export async function handleAdminAnnounceEmail(request: Request, env: LifecycleEnv, verifySiteAdmin: VerifySiteAdmin): Promise<Response> {
  if (!lifecycleEmailsOn(env)) return jsonResponse({ error: 'Not found' }, 404, request)
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (!configured(env)) return jsonResponse({ error: 'Not configured' }, 500, request)
  if (!await verifySiteAdmin(env, request)) return jsonResponse({ error: 'Forbidden' }, 403, request)

  let body: { campaign?: unknown; omitFeatures?: unknown; dryRun?: unknown }
  try { body = await request.json() } catch { return jsonResponse({ error: 'Invalid JSON' }, 400, request) }
  const campaign = typeof body?.campaign === 'string' ? body.campaign : ''
  if (!/^[a-z0-9][a-z0-9-]{2,60}$/.test(campaign)) return jsonResponse({ error: 'campaign must be a slug (a-z, 0-9, -)' }, 400, request)
  if (body.dryRun !== true && !announceCampaignOpen(campaign, Date.now())) {
    return jsonResponse({ error: 'campaign must end in its month (-YYYY-MM) and is sent from a month before it to 12 months after' }, 400, request)
  }
  const omit = Array.isArray(body.omitFeatures) ? body.omitFeatures : []
  const known = new Set<string>(ANNOUNCE_FEATURES)
  if (!omit.every(item => typeof item === 'string' && known.has(item))) {
    return jsonResponse({ error: `omitFeatures may contain only: ${ANNOUNCE_FEATURES.join(', ')}` }, 400, request)
  }
  const omitFeatures = omit as string[]
  const profiles = await lifecycleProfiles(env)

  if (body.dryRun === true) {
    const preview = renderEmail('announce', { ...ANNOUNCE_DEFAULTS, ...LIBRARY_ART, sender_address: SENDER_ADDRESS }, { omitFeatures })
    return jsonResponse({ dryRun: true, campaign, recipients: profiles.length, ...preview }, 200, request)
  }
  const result = await runAnnouncement(createLifecycleDeps(env), profiles, campaign, omitFeatures)
  console.log(JSON.stringify({ event: 'lifecycle_announce', campaign, sent: result.sent.length, skipped: result.skipped }))
  return jsonResponse({ campaign, considered: result.considered, sent: result.sent.length, skipped: result.skipped }, 200, request)
}
