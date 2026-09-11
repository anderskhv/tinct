/**
 * The one place that names the reading companion's Claude model, shared by
 * the Worker (`/api/chat`, `/api/lab-chat`) and the lab client. Switch here
 * (e.g. to `claude-opus-5`) and nothing else needs a code hunt.
 *
 * Sonnet 5 request rules the callers follow: no `thinking` block, no
 * sampling parameters, depth via `output_config.effort`, no assistant
 * prefill, strict tool schemas.
 */
export const COMPANION_MODEL = 'claude-sonnet-5'

export type CompanionEffort = 'low' | 'medium' | 'high'

/** Spoken answers: latency first. */
export const COMPANION_EFFORT_VOICE: CompanionEffort = 'low'
/** Typed chat: a little more depth is worth the wait. */
export const COMPANION_EFFORT_TYPED: CompanionEffort = 'medium'

export function parseCompanionEffort(value: unknown): CompanionEffort | null {
  return value === 'low' || value === 'medium' || value === 'high' ? value : null
}
