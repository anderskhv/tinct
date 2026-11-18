/**
 * Talk's speaking speed, `audio.output.speed` in xAI's session.update
 * (documented range 0.7-1.5, default 1). The control offers these steps;
 * a spoken "slower / faster" still maps through ASSISTANT_PACE_SPEED.
 */
export const TALK_SPEED_STEPS = [0.8, 1, 1.25, 1.5] as const
export const TALK_SPEED_MIN = 0.7
export const TALK_SPEED_MAX = 1.5
export const TALK_SPEED_DEFAULT = 1

/** Any stored or requested speed, held inside the documented range. */
export function clampTalkSpeed(raw: unknown): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return TALK_SPEED_DEFAULT
  return Math.max(TALK_SPEED_MIN, Math.min(TALK_SPEED_MAX, Math.round(raw * 100) / 100))
}
