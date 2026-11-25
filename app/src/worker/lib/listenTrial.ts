/**
 * A signed-out guest's listening trial (Anders, 25 Nov 2026): five minutes of
 * narration per device per UTC day, from recordings that already exist. A
 * guest's request never makes new narration (routes/narration.ts serves a
 * guest from the cache only); this caps how much of the cache one guest is
 * handed a day.
 *
 * Same mechanism and identifier as the Talk trial (talkTrial.ts): one
 * UsageCoordinator object per UTC day and hashed IP (`hashGuestKey`, never the
 * raw address), holding a single request-window row (a count and its reset
 * time) that the coordinator's alarm clears when the day's window ends. Here
 * the count is seconds of recordings handed out instead of conversations.
 *
 * The reader stops at five minutes of playback (lab/labListenTrial.ts). The
 * Worker cannot see playback, only the recordings it hands out, and the reader
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

/**
 * Count `seconds` of recordings handed to this guest. `false` = today's trial
 * was already used up (nothing counted). The answer that crosses the ceiling
 * is still served: it is at most one buffer's worth. Fails closed: no binding
 * or a coordinator error refuses, as the Talk trial does.
 */
export async function takeListenTrial(env: ListenTrialEnv, slot: ListenTrialSlot, seconds: number): Promise<boolean> {
  const namespace = env.USAGE_COORDINATOR
  if (!namespace) return false
  const units = Math.max(1, Math.ceil(seconds))
  try {
    return await namespace.getByName(slot.name).hitUnits(units, slot.limit, DAY_MS)
  } catch {
    return false
  }
}
