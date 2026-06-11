import type { ReaderPersistenceSnapshot, ReaderSessionEvent } from './types'

const SHADOW_FLAG_KEY = 'tinct:reader-session-v2-shadow'
const SHADOW_LOG_KEY = 'tinct:reader-session-v2-shadow-log'
const MAX_ENTRIES = 200

export type ReaderSessionShadowEntry =
  | { at: number; kind: 'event'; event: ReaderSessionEvent['type']; detail: unknown }
  | { at: number; kind: 'position'; detail: ReaderPersistenceSnapshot }
  | { at: number; kind: 'chat'; detail: unknown }
  | { at: number; kind: 'offline'; detail: unknown }

declare global {
  interface Window {
    __tinctReaderSessionV2?: {
      enabled: boolean
      entries: ReaderSessionShadowEntry[]
      setEnabled: (enabled: boolean) => void
      clear: () => void
    }
  }
}

function safeLocalStorageGet(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

function safeLocalStorageSet(key: string, value: string): void {
  try { localStorage.setItem(key, value) } catch { /* ignore */ }
}

function safeLocalStorageRemove(key: string): void {
  try { localStorage.removeItem(key) } catch { /* ignore */ }
}

function queryEnablesShadow(): boolean {
  try {
    const params = new URLSearchParams(window.location.search)
    return params.get('v2shadow') === '1'
  } catch {
    return false
  }
}

export function isReaderSessionShadowEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (import.meta.env.VITE_READER_SESSION_V2_SHADOW === 'true') return true
  if (queryEnablesShadow()) return true
  // Default-on local shadow logging. It stays on-device in a capped ring
  // buffer and can be disabled per browser with setEnabled(false).
  return safeLocalStorageGet(SHADOW_FLAG_KEY) !== '0'
}

export function loadReaderSessionShadowLog(): ReaderSessionShadowEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = safeLocalStorageGet(SHADOW_LOG_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(-MAX_ENTRIES) : []
  } catch {
    return []
  }
}

function saveReaderSessionShadowLog(entries: ReaderSessionShadowEntry[]): void {
  safeLocalStorageSet(SHADOW_LOG_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)))
}

export function setReaderSessionShadowEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  if (enabled) safeLocalStorageSet(SHADOW_FLAG_KEY, '1')
  else safeLocalStorageSet(SHADOW_FLAG_KEY, '0')
  installReaderSessionShadowDebug()
  if (window.__tinctReaderSessionV2) window.__tinctReaderSessionV2.enabled = enabled
}

export function clearReaderSessionShadowLog(): void {
  if (typeof window === 'undefined') return
  safeLocalStorageRemove(SHADOW_LOG_KEY)
  installReaderSessionShadowDebug()
  if (window.__tinctReaderSessionV2) window.__tinctReaderSessionV2.entries = []
}

export function appendReaderSessionShadow(entry: Omit<ReaderSessionShadowEntry, 'at'>): void {
  if (!isReaderSessionShadowEnabled()) return
  const entries = loadReaderSessionShadowLog()
  entries.push({ ...entry, at: Date.now() } as ReaderSessionShadowEntry)
  saveReaderSessionShadowLog(entries)
  installReaderSessionShadowDebug()
  if (window.__tinctReaderSessionV2) {
    window.__tinctReaderSessionV2.entries = entries.slice(-MAX_ENTRIES)
  }
}

export function installReaderSessionShadowDebug(): void {
  if (typeof window === 'undefined') return
  window.__tinctReaderSessionV2 = {
    enabled: isReaderSessionShadowEnabled(),
    entries: loadReaderSessionShadowLog(),
    setEnabled: setReaderSessionShadowEnabled,
    clear: clearReaderSessionShadowLog,
  }
}
