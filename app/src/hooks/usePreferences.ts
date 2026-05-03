import { useState, useCallback, useEffect, useRef } from 'react'
import { storage, localStorageProvider } from '../services/storage'
import type { Language, Style, EditionKey, UserPreferences, PanelTab, FontSize, FontFamily } from '../types'
import { DEFAULT_PREFERENCES } from '../types'

/**
 * Preferences persistence is split (B9):
 *
 * - **Account-synced** keys go to `preferences` via the storage abstraction
 *   (= Supabase when signed in; localStorage fallback when not). These
 *   follow the user across devices.
 *
 * - **Per-device** keys go to `device-preferences` in localStorage only.
 *   These are layout/ergonomic choices that legitimately vary by device:
 *   theme, font size, font family, split-view default, panel-open default.
 *
 * The split happens at the persistence layer; React state still holds one
 * merged UserPreferences object so consumers don't change.
 */
const STORAGE_KEY = 'preferences'
const DEVICE_KEY = 'device-preferences'

/** Fields that vary per device — never sync to cloud. */
const DEVICE_FIELDS = ['darkMode', 'fontSize', 'fontFamily', 'splitView', 'panelOpen'] as const

function pickDevice(prefs: UserPreferences): Partial<UserPreferences> {
  const out: Partial<UserPreferences> = {}
  for (const f of DEVICE_FIELDS) (out as Record<string, unknown>)[f] = prefs[f]
  return out
}

function pickAccount(prefs: UserPreferences): Partial<UserPreferences> {
  const out: Partial<UserPreferences> = { ...prefs }
  for (const f of DEVICE_FIELDS) delete (out as Record<string, unknown>)[f]
  return out
}

/** First-visit default for reading languages: infer from browser locale. If
 * Danish appears anywhere in navigator.languages, include it alongside English
 * (most Danish readers want both). Otherwise default to English only. */
function detectDefaultReadingLanguages(): Language[] {
  if (typeof navigator === 'undefined') return ['en']
  const langs: string[] = Array.isArray(navigator.languages) && navigator.languages.length > 0
    ? [...navigator.languages]
    : [navigator.language || 'en']
  const hasDanish = langs.some(l => (l || '').toLowerCase().startsWith('da'))
  return hasDanish ? ['en', 'da'] : ['en']
}

export function usePreferences(storageReady = true) {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() => {
    // Layered load: account from cloud (stripped of any legacy device
    // fields), device from localStorage (else defaults).
    const stored = storage.get<UserPreferences>(STORAGE_KEY)
    const accountOnly = stored ? pickAccount(stored as UserPreferences) : {}
    const device = localStorageProvider.get<Partial<UserPreferences>>(DEVICE_KEY)
    const saved = { ...DEFAULT_PREFERENCES, ...accountOnly, ...(device || {}) } as UserPreferences
    // Migrate removed 'highlights' tab → 'notes'
    if ((saved.panelTab as string) === 'highlights') saved.panelTab = 'notes'
    // Migrate removed 'compare' tab (briefly lived as a 4th desktop rail) → chat
    if ((saved.panelTab as string) === 'compare') saved.panelTab = 'chat'
    // Migrate removed kids editions → modern
    if (saved.splitEditionKey?.includes('kids')) saved.splitEditionKey = 'modern-en'
    // First-visit reading-languages inference
    if (!stored || !Array.isArray(stored.readingLanguages) || stored.readingLanguages.length === 0) {
      saved.readingLanguages = detectDefaultReadingLanguages()
    }
    return saved
  })

  // Persist on change — skip the very first write when storageReady transitions
  // to true, because at that point preferences are stale defaults and the cloud
  // restore effect hasn't run yet. Writing here would overwrite Supabase data.
  //
  // Splits the merged preferences object into account-synced + device-local
  // before writing to their respective stores.
  const writeUnlockedRef = useRef(false)
  useEffect(() => {
    if (!storageReady) return
    if (!writeUnlockedRef.current) {
      writeUnlockedRef.current = true
      return
    }
    storage.set(STORAGE_KEY, pickAccount(preferences))
    localStorageProvider.set(DEVICE_KEY, pickDevice(preferences))
  }, [preferences, storageReady])

  // Apply dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.darkMode ? 'dark' : 'light')
  }, [preferences.darkMode])

  // Apply font size and font family as CSS variables.
  //
  // fontSize is a numeric rem value (FONT_SIZE_MIN..FONT_SIZE_MAX, currently
  // 1.0–2.4) — used directly, no lookup. Earlier code used a string-keyed
  // map ({ small, medium, large, xlarge }) that became dead when the type
  // switched to `number`: every button click looked up `sizeMap[1.3]` →
  // undefined → setProperty(undefined) → variable never changed and font
  // size silently froze regardless of which button you clicked.
  //
  // Set on documentElement (<html>) so the variable cascades regardless of
  // which `.app` instance is currently mounted (loading shell vs. main).
  useEffect(() => {
    const familyMap: Record<FontFamily, string> = {
      garamond: "'EB Garamond', var(--font-serif)",
      baskerville: "'Libre Baskerville', var(--font-serif)",
      sourceserif: "'Source Serif 4', var(--font-serif)",
    }
    const root = document.documentElement
    root.style.setProperty('--font-size-reader', `${preferences.fontSize}rem`)
    root.style.setProperty('--font-family-reader', familyMap[preferences.fontFamily])
  }, [preferences.fontSize, preferences.fontFamily])

  const update = useCallback((partial: Partial<UserPreferences>) => {
    setPreferencesState(prev => ({ ...prev, ...partial }))
  }, [])

  const setLanguage = useCallback((language: Language) => update({ language }), [update])
  const setStyle = useCallback((style: Style) => update({ style }), [update])
  const toggleSplitView = useCallback(() => {
    setPreferencesState(prev => ({ ...prev, splitView: !prev.splitView }))
  }, [])
  const toggleDarkMode = useCallback(() => {
    setPreferencesState(prev => ({ ...prev, darkMode: !prev.darkMode }))
  }, [])
  const setPanelTab = useCallback((panelTab: UserPreferences['panelTab']) => update({ panelTab }), [update])
  const togglePanel = useCallback(() => {
    setPreferencesState(prev => ({ ...prev, panelOpen: !prev.panelOpen }))
  }, [])
  const setSplitEditionKey = useCallback((splitEditionKey: EditionKey) => update({ splitEditionKey }), [update])
  const setReadingObjective = useCallback((readingObjective: string) => update({ readingObjective }), [update])
  const setOnboardingComplete = useCallback((onboardingComplete: boolean) => update({ onboardingComplete }), [update])
  const setFontSize = useCallback((fontSize: FontSize) => update({ fontSize }), [update])
  const setFontFamily = useCallback((fontFamily: FontFamily) => update({ fontFamily }), [update])
  const setAccountDecisionSeen = useCallback((accountDecisionSeen: boolean) => update({ accountDecisionSeen }), [update])
  const setProgressDisplay = useCallback((progressDisplay: UserPreferences['progressDisplay']) => update({ progressDisplay }), [update])
  const setChatHidden = useCallback((chatHidden: boolean) => update({ chatHidden }), [update])
  const setFeedHidden = useCallback((feedHidden: boolean) => update({ feedHidden }), [update])
  const setCastHidden = useCallback((castHidden: boolean) => update({ castHidden }), [update])
  const setReadingLanguages = useCallback((readingLanguages: Language[]) => update({ readingLanguages }), [update])

  // Re-read preferences from storage (called after storage provider swap).
  // Same layered load as initial: cloud account prefs (stripped of device
  // fields) + localStorage device overlay.
  const refreshFromStorage = useCallback(() => {
    const raw = storage.get<UserPreferences>(STORAGE_KEY)
    const device = localStorageProvider.get<Partial<UserPreferences>>(DEVICE_KEY)
    if (raw || device) {
      const accountOnly = raw ? pickAccount(raw as UserPreferences) : {}
      const saved = { ...DEFAULT_PREFERENCES, ...accountOnly, ...(device || {}) } as UserPreferences
      if ((saved.panelTab as string) === 'highlights') saved.panelTab = 'notes'
      if ((saved.panelTab as string) === 'compare') saved.panelTab = 'chat'
      if (saved.splitEditionKey?.includes('kids')) saved.splitEditionKey = 'modern-en'
      setPreferencesState(saved)
    }
  }, [])

  return {
    preferences,
    setLanguage,
    setStyle,
    toggleSplitView,
    toggleDarkMode,
    setPanelTab,
    togglePanel,
    setSplitEditionKey,
    setReadingObjective,
    setOnboardingComplete,
    setFontSize,
    setFontFamily,
    setAccountDecisionSeen,
    setProgressDisplay,
    setChatHidden,
    setFeedHidden,
    setCastHidden,
    setReadingLanguages,
    refreshFromStorage,
    update,
  }
}
