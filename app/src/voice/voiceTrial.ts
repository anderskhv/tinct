/** Explicit lab experiment; absence always means the shipped voice path. */
export type VoiceTrial = 'full' | 'mini'
export const VOICE_TRIAL_MODELS = {
  full: 'gpt-realtime-2.1',
  mini: 'gpt-realtime-2.1-mini',
} as const
export function parseVoiceTrial(value: unknown): VoiceTrial | null {
  return value === 'full' || value === 'mini' ? value : null
}
