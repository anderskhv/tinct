import { useCallback, useEffect, useState } from 'react'
import { aiPrefsForAction, defaultAiSettings, normalizeAiSettings, type AiInstructionAction, type AiRequestPrefs, type AiSettings } from '../aiSettings'
import { storage } from '../services/storage'

/**
 * The reader's AI settings (aiSettings.ts) on this device, and what each AI
 * request carries from them. Light on purpose (no Supabase): every request
 * builder reads it. The account copy is labAiAccount.ts.
 */
const KEY = 'ai-settings'
export const AI_SETTINGS_EVENT = 'tinct:ai-settings'

export interface StoredAiSettings { settings: AiSettings; at: number }

/** The settings and when they last changed on this device. */
export function aiSettingsStored(): StoredAiSettings {
  const raw = storage.get<unknown>(KEY)
  if (!raw || typeof raw !== 'object') return { settings: defaultAiSettings(), at: 0 }
  const r = raw as Record<string, unknown>
  return { settings: normalizeAiSettings(r.settings), at: typeof r.at === 'number' && Number.isFinite(r.at) ? r.at : 0 }
}

export function readAiSettings(): AiSettings {
  return aiSettingsStored().settings
}

export function aiSettingsChangedAt(): number {
  return aiSettingsStored().at
}

/** `at`: when they changed (an account's copy keeps its own time, so it is not sent back). */
export function writeAiSettings(settings: AiSettings, at = Date.now()): void {
  storage.set(KEY, { settings: normalizeAiSettings(settings), at })
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(AI_SETTINGS_EVENT))
}

/**
 * The book the reader has open, as AI settings names it (This book's own lengths: the id its reading angle is kept
 * under). One book is open per page; the reader sets it, and every request builder reads it here.
 */
let openBookId: string | null = null
export function setAiSettingsBook(bookId: string | null): void { openBookId = bookId }
export function aiSettingsBook(): string | null { return openBookId }

/** What an AI request for `action` carries: its length (the open book's own, else General's) and the reader's instructions. */
export function aiPrefsFor(action: AiInstructionAction | null, bookId: string | null = openBookId): AiRequestPrefs | undefined {
  return aiPrefsForAction(readAiSettings(), action, bookId)
}

/** The AI settings action a structured companion request is (its Length row and instruction box), or null (general only). */
export function companionAiAction(companion: { intent?: unknown; chapter?: { action?: { kind?: unknown } } }): AiInstructionAction | null {
  switch (companion.intent) {
    case 'explain': return 'explain'
    case 'ask': return 'ask'
    case 'quiz': return 'quiz'
    case 'counterpoint': return 'counterpoint'
    case 'chapter': return companion.chapter?.action?.kind === 'discuss' ? 'summary' : 'primer'
    default: return null
  }
}

/**
 * A companion request with the reader's AI settings on it (`ai`), as the
 * reading angle rides in its context. `action` when the request's intent is
 * not what the reader asked for (a Recap or Summary sent as a question).
 * The librarian never takes them.
 */
export function withAiPrefs<T extends { intent?: unknown; chapter?: { action?: { kind?: unknown } } }>(companion: T, action?: AiInstructionAction | null): T {
  if (companion.intent === 'library') return companion
  const ai = aiPrefsFor(action === undefined ? companionAiAction(companion) : action)
  return ai ? { ...companion, ai } : companion
}

/** The settings, kept in step wherever they change on this page. */
export function useAiSettings(): [AiSettings, (next: AiSettings) => void] {
  const [settings, setSettings] = useState(readAiSettings)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const sync = () => setSettings(readAiSettings())
    window.addEventListener(AI_SETTINGS_EVENT, sync)
    return () => window.removeEventListener(AI_SETTINGS_EVENT, sync)
  }, [])
  const update = useCallback((next: AiSettings) => {
    setSettings(normalizeAiSettings(next))
    writeAiSettings(next)
  }, [])
  return [settings, update]
}

