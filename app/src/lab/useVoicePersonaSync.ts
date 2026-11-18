import { useEffect, useRef } from 'react'
import { supabase } from '../services/supabase'

export type VoicePersona = 'female' | 'male'

interface PreferencesRow {
  value: Record<string, unknown> | null
  rev: number | null
  applied?: boolean | null
  conflict?: boolean | null
}

/**
 * Before 2026-10-01 the default voice (Ara) was written to accounts as if the
 * reader had chosen it. Only a voice stored with `voicePersonaChosen` is a
 * choice; anything else is the old default and gives way to Helios.
 */
export function remoteVoiceChoice(value: Record<string, unknown>): VoicePersona | null {
  const voice = value.voicePersona
  return value.voicePersonaChosen === true && (voice === 'female' || voice === 'male') ? voice : null
}

async function persistVoicePersona(userId: string, voicePersona: VoicePersona, chosen: boolean): Promise<void> {
  if (!supabase) return
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data } = await supabase.from('user_data').select('value,rev').eq('user_id', userId).eq('key', 'preferences').maybeSingle()
    const current = (data || {}) as PreferencesRow
    const value = current.value && typeof current.value === 'object' ? current.value : {}
    if (value.voicePersona === voicePersona && (value.voicePersonaChosen === true) === chosen) return
    const { data: committed, error } = await supabase.rpc('commit_user_data', {
      p_user_id: userId,
      p_key: 'preferences',
      p_value: { ...value, voicePersona, voicePersonaChosen: chosen },
      p_expected_rev: typeof current.rev === 'number' ? current.rev : null,
    })
    if (error) return
    const row = (Array.isArray(committed) ? committed[0] : committed) as PreferencesRow | null
    if (row && row.applied !== false && row.conflict !== true) return
  }
}

/**
 * Keeps the one shared voice choice in the existing account `preferences`
 * row without taking ownership of the Lab reader's device-local preferences.
 */
export function useVoicePersonaSync(input: {
  userId: string | null
  value: VoicePersona
  /** The reader picked this voice (not just the default). */
  chosen: boolean
  onRemote: (value: VoicePersona) => void
}): void {
  const loadedUserRef = useRef<string | null>(null)
  const remoteRef = useRef(input.onRemote)
  remoteRef.current = input.onRemote
  const valueRef = useRef(input.value)
  valueRef.current = input.value
  const chosenRef = useRef(input.chosen)
  chosenRef.current = input.chosen

  useEffect(() => {
    const userId = input.userId
    if (!supabase || !userId) { loadedUserRef.current = null; return }
    let cancelled = false
    void supabase.from('user_data').select('value,rev').eq('user_id', userId).eq('key', 'preferences').maybeSingle().then(({ data }) => {
      if (cancelled) return
      const row = (data || {}) as PreferencesRow
      loadedUserRef.current = userId
      const value = row.value && typeof row.value === 'object' ? row.value : {}
      // The account's choice follows the reader across devices; a stored voice
      // that was never chosen is overwritten with this device's (Helios unless
      // picked here).
      const voice = remoteVoiceChoice(value)
      if (voice) remoteRef.current(voice)
      else void persistVoicePersona(userId, valueRef.current, chosenRef.current)
    })
    return () => { cancelled = true }
  }, [input.userId])

  useEffect(() => {
    if (!supabase || !input.userId || loadedUserRef.current !== input.userId) return
    void persistVoicePersona(input.userId, input.value, input.chosen)
  }, [input.userId, input.value, input.chosen])
}
