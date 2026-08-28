import { supabase } from '../services/supabase'

/**
 * Same token the production voice client sends: the Supabase access_token
 * as `Authorization: Bearer …` on `/api/voice-session`.
 */
export async function resolveLabVoiceToken(input: {
  override?: string | null
  sessionToken?: string | null
  readSession?: () => Promise<string | null>
}): Promise<string | null> {
  if (input.override !== undefined) {
    const trimmed = input.override?.trim() || null
    return trimmed
  }
  if (input.sessionToken) return input.sessionToken
  if (!input.readSession) return null
  return (await input.readSession()) || null
}

export async function readSupabaseAccessToken(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}
