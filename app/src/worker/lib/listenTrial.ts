/**
 * A signed-out guest's listening trial (Anders, 25 Nov 2026): five minutes of
 * narration per device per UTC day, on the public library's books in the guest
 * voices (Grok's Ara and Helios). Recordings that exist are served; a sentence
 * group not yet recorded is made for the guest too (Anders, 25 Nov 2026: about
 * $0.07 per five minutes at $15 per million characters, then cached in R2 for
 * every later reader). Orion and Eve, other providers and own books still need
 * an account.
 *
 * Same mechanism and identifier as the Talk trial (talkTrial.ts): one
 * UsageCoordinator object per UTC day and hashed IP (`hashGuestKey`, never the
 * raw address), holding a single request-window row (a count and its reset
 * time) that the coordinator's alarm clears when the day's window ends. Here
 * the count is seconds of narration instead of conversations.
 *
 * Recordings handed out count as they are served. A sentence group to be made
 * is reserved first, at its estimated length, strictly within the ceiling (as
 * Talk reserves before it connects), and only then sent to the provider; once
 * made, the reservation is settled to the recording's real length, and given
 * back if nothing was made. The global narration byte ceilings and the
 * per-chunk budget reservation apply to it exactly as to a signed-in reader's.
 *
 * The reader stops at five minutes of playback (lab/labListenTrial.ts). The
 * Worker cannot see playback, only the narration it hands out, and the reader
 * asks for a buffer ahead of what it plays, so the Worker's ceiling is twice
 * the trial: the buffer never cuts the five minutes short, and a guest who
 * skips the reader still gets no more than ten minutes a day.
 */
import type { UsageEnv } from './rateLimit'
import { hashGuestKey, type LedgerEnv } from './aiUsage'

/** What the reader plays for a guest before the account sheet. */
export const LISTEN_TRIAL_SECONDS = 300
/** The most recorded audio the Worker hands one guest a day: the trial plus the reader's buffer ahead. */
export const LISTEN_TRIAL_SERVED_SECONDS = 2 * LISTEN_TRIAL_SECONDS
/**
 * Tinct's own checks (`x-tinct-check: 1`, the post-deploy listening
 * acceptance) share this pool a day instead of a per-IP one, as Talk's checks
 * do. The header is not a secret, so this is the most anyone gains by sending
 * it; the recordings are cached ones either way, never new narration.
 */
export const LISTEN_TRIAL_CHECK_SERVED_SECONDS = 12 * 3600
/** The JSON `code` of a guest refusal because today's trial is used. */
export const LISTEN_TRIAL_USED_CODE = 'listen_trial_used'
const DAY_MS = 86_400_000

export type ListenTrialEnv = UsageEnv & LedgerEnv

export interface ListenTrialSlot {
  /** Coordinator object holding today's served seconds (hashed, never the raw IP). */
  name: string
  limit: number
}

/** Today's listening slot for this caller: per hashed IP, or the shared pool for Tinct's own checks. */
export async function listenTrialSlot(env: ListenTrialEnv, input: { ip: string; check: boolean; day: string }): Promise<ListenTrialSlot> {
  if (input.check) return { name: `rl:listen-trial:${input.day}:check`, limit: LISTEN_TRIAL_CHECK_SERVED_SECONDS }
  return { name: `rl:listen-trial:${input.day}:${await hashGuestKey(env, input.ip)}`, limit: LISTEN_TRIAL_SERVED_SECONDS }
}

/** Spoken pace for a sentence group not yet recorded: characters per second (as the reader estimates). */
export const LISTEN_TRIAL_CHARS_PER_SECOND = 14

/** A sentence group's estimated length before it is made, in whole seconds. */
export function estimatedNarrationSeconds(text: string): number {
  return Math.max(1, Math.ceil(text.length / LISTEN_TRIAL_CHARS_PER_SECOND))
}

/**
 * Count `seconds` against this guest's day. `false` = nothing counted. Served
 * recordings (lenient): refused only once the day is used up, so the answer
 * that crosses the ceiling is still served (one buffer at most). Narration to
 * be made (`strict`): refused when it would take the day past the ceiling, so
 * nothing is ever generated past it. Fails closed: no binding or a coordinator
 * error refuses, as the Talk trial does.
 */
export async function takeListenTrial(env: ListenTrialEnv, slot: ListenTrialSlot, seconds: number, options: { strict?: boolean } = {}): Promise<boolean> {
  const namespace = env.USAGE_COORDINATOR
  if (!namespace) return false
  const units = Math.max(1, Math.ceil(seconds))
  try {
    return await namespace.getByName(slot.name).hitUnits(units, slot.limit, DAY_MS, options.strict === true)
  } catch {
    return false
  }
}

/** Give back seconds reserved for narration that was not made, or reserved above its real length. Best effort. */
export async function returnListenTrial(env: ListenTrialEnv, slot: ListenTrialSlot, seconds: number): Promise<void> {
  const units = Math.floor(seconds)
  if (units < 1) return
  try { await env.USAGE_COORDINATOR?.getByName(slot.name).unhit(units) } catch { /* the seconds stay counted */ }
}
