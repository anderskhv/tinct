import { useEffect, useRef } from 'react'
import { supabase } from '../services/supabase'

export type VoicePersona = 'female' | 'male'

interface PreferencesRow {
  value: Record<string, unknown> | null
  rev: number | null
  applied?: boolean | null
  conflict?: boolean | null
}

async function persistVoicePersona(userId: string, voicePersona: VoicePersona): Promise<void> {
  if (!supabase) return
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data } = await supabase.from('user_data').select('value,rev').eq('user_id', userId).eq('key', 'preferences').maybeSingle()
    const current = (data || {}) as PreferencesRow
    const value = current.value && typeof current.value === 'object' ? current.value : {}
    if (value.voicePersona === voicePersona) return
    const { data: committed, error } = await supabase.rpc('commit_user_data', {
      p_user_id: userId,
      p_key: 'preferences',
      p_value: { ...value, voicePersona },
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
  onRemote: (value: VoicePersona) => void
}): void {
  const loadedUserRef = useRef<string | null>(null)
  const remoteRef = useRef(input.onRemote)
  remoteRef.current = input.onRemote
  const valueRef = useRef(input.value)
  valueRef.current = input.value

  useEffect(() => {
    if (!supabase || !input.userId) { loadedUserRef.current = null; return }
    let cancelled = false
    void supabase.from('user_data').select('value,rev').eq('user_id', input.userId).eq('key', 'preferences').maybeSingle().then(({ data }) => {
      if (cancelled) return
      const row = (data || {}) as PreferencesRow
      loadedUserRef.current = input.userId
      const value = row.value && typeof row.value === 'object' ? row.value : {}
      const voice = value.voicePersona
      if (voice === 'female' || voice === 'male') remoteRef.current(voice)
      else void persistVoicePersona(input.userId, valueRef.current)
    })
    return () => { cancelled = true }
  }, [input.userId])

  useEffect(() => {
    if (!supabase || !input.userId || loadedUserRef.current !== input.userId) return
    void persistVoicePersona(input.userId, input.value)
  }, [input.userId, input.value])
}
