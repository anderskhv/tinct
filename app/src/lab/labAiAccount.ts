import { useEffect, useRef } from 'react'
import { normalizeAiSettings, type AiSettings } from '../aiSettings'
import { supabase } from '../services/supabase'
import { AI_SETTINGS_EVENT, aiSettingsStored as readStored, writeAiSettings } from './labAiPrefs'
import { READING_ANGLE_EVENT, applyAccountReadingAngles, localReadingAngles, readingAnglesChangedAt } from './labReadingAngle'

/**
 * The reader's AI settings (aiSettings.ts) on this device, and with their
 * account so they apply on every device: in the existing per-user
 * `preferences` row (user_data), next to the voice choice
 * (useVoicePersonaSync.ts), with the books' reading angles. No schema change.
 *
 * Whichever side changed last wins: each side keeps when it last changed
 * (`at`). A reader signed out keeps them on this device only.
 */
/** At most this many books' reading angles go with the account. */
export const ACCOUNT_READING_ANGLES_MAX = 200

export { aiPrefsFor, readAiSettings, useAiSettings, withAiPrefs, writeAiSettings, AI_SETTINGS_EVENT } from './labAiPrefs'

interface PreferencesRow { value: Record<string, unknown> | null; rev: number | null; applied?: boolean | null; conflict?: boolean | null }

/** What the account's `preferences` row holds for AI settings and reading angles. */
export interface AccountAiValue {
  aiSettings?: { settings: AiSettings; at: number }
  readingAngles?: { angles: Record<string, string>; at: number }
}

export function readAccountAiValue(value: Record<string, unknown>): AccountAiValue {
  const out: AccountAiValue = {}
  const ai = value.aiSettings && typeof value.aiSettings === 'object' ? value.aiSettings as Record<string, unknown> : null
  if (ai && typeof ai.at === 'number') out.aiSettings = { settings: normalizeAiSettings(ai.settings), at: ai.at }
  const angles = value.readingAngles && typeof value.readingAngles === 'object' ? value.readingAngles as Record<string, unknown> : null
  if (angles && typeof angles.at === 'number' && angles.angles && typeof angles.angles === 'object') {
    const map: Record<string, string> = {}
    for (const [bookId, text] of Object.entries(angles.angles as Record<string, unknown>).slice(0, ACCOUNT_READING_ANGLES_MAX)) {
      if (typeof text === 'string' && text.trim()) map[bookId] = text
    }
    out.readingAngles = { angles: map, at: angles.at }
  }
  return out
}

/** This device's side, as it would be written to the account. */
export function localAccountAiValue(): Required<AccountAiValue> {
  const stored = readStored()
  return {
    aiSettings: { settings: stored.settings, at: stored.at },
    readingAngles: { angles: Object.fromEntries(Object.entries(localReadingAngles()).slice(0, ACCOUNT_READING_ANGLES_MAX)), at: readingAnglesChangedAt() },
  }
}

/**
 * Merge the account's copy with this device's: the newer side wins, for the
 * settings and for the reading angles separately. Applies the account's side
 * here; returns whether this device's side should be written to the account.
 */
export function reconcileAccountAiValue(remote: AccountAiValue): boolean {
  const local = localAccountAiValue()
  let push = false
  const remoteAiAt = remote.aiSettings?.at ?? 0
  if (remote.aiSettings && remoteAiAt > local.aiSettings.at) writeAiSettings(remote.aiSettings.settings, remoteAiAt)
  else if (local.aiSettings.at > remoteAiAt) push = true
  const remoteAnglesAt = remote.readingAngles?.at ?? 0
  if (remote.readingAngles && remoteAnglesAt > local.readingAngles.at) applyAccountReadingAngles(remote.readingAngles.angles, remoteAnglesAt)
  else if (local.readingAngles.at > remoteAnglesAt) push = true
  return push
}

/** Write this device's settings and reading angles to the account now (a newer copy there is taken instead). */
export function syncAiSettingsToAccount(userId: string): Promise<void> {
  return persistAccountAiValue(userId).catch(() => {})
}

async function persistAccountAiValue(userId: string): Promise<void> {
  if (!supabase) return
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data } = await supabase.from('user_data').select('value,rev').eq('user_id', userId).eq('key', 'preferences').maybeSingle()
    const current = (data || {}) as PreferencesRow
    const value = current.value && typeof current.value === 'object' ? current.value : {}
    const remote = readAccountAiValue(value)
    const local = localAccountAiValue()
    // Another device changed them since: take theirs, write nothing.
    if ((remote.aiSettings?.at ?? 0) >= local.aiSettings.at && (remote.readingAngles?.at ?? 0) >= local.readingAngles.at) {
      reconcileAccountAiValue(remote)
      return
    }
    const next = {
      ...value,
      aiSettings: (remote.aiSettings?.at ?? 0) > local.aiSettings.at ? value.aiSettings : local.aiSettings,
      readingAngles: (remote.readingAngles?.at ?? 0) > local.readingAngles.at ? value.readingAngles : local.readingAngles,
    }
    const { data: committed, error } = await supabase.rpc('commit_user_data', {
      p_user_id: userId,
      p_key: 'preferences',
      p_value: next,
      p_expected_rev: typeof current.rev === 'number' ? current.rev : null,
    })
    if (error) return
    const row = (Array.isArray(committed) ? committed[0] : committed) as PreferencesRow | null
    if (row && row.applied !== false && row.conflict !== true) return
  }
}

/** Write a change to the account this long after the last edit (typing in an instruction box). */
const PERSIST_DELAY_MS = 800

/**
 * Keeps AI settings and reading angles in the account's `preferences` row:
 * read once per signed-in reader, then every change on this device written
 * back shortly after it is made.
 */
export function useAiSettingsAccountSync(userId: string | null): void {
  const loadedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!supabase || !userId) { loadedRef.current = null; return }
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const schedule = () => {
      if (loadedRef.current !== userId) return
      clearTimeout(timer)
      timer = setTimeout(() => { void persistAccountAiValue(userId) }, PERSIST_DELAY_MS)
    }
    void supabase.from('user_data').select('value,rev').eq('user_id', userId).eq('key', 'preferences').maybeSingle().then(({ data }) => {
      if (cancelled) return
      const row = (data || {}) as PreferencesRow
      const value = row.value && typeof row.value === 'object' ? row.value : {}
      const push = reconcileAccountAiValue(readAccountAiValue(value))
      loadedRef.current = userId
      if (push) void persistAccountAiValue(userId)
    }, () => { /* offline: this device's copy stands until the next load */ })
    window.addEventListener(AI_SETTINGS_EVENT, schedule)
    window.addEventListener(READING_ANGLE_EVENT, schedule)
    return () => {
      cancelled = true
      clearTimeout(timer)
      window.removeEventListener(AI_SETTINGS_EVENT, schedule)
      window.removeEventListener(READING_ANGLE_EVENT, schedule)
    }
  }, [userId])
}
