import { useState, useCallback, useEffect, useRef } from 'react'
import { storage, localStorageProvider } from '../services/storage'
import type { Language, Style, EditionKey, UserPreferences, PanelTab, FontSize, FontFamily } from '../types'
import { DEFAULT_PREFERENCES } from '../types'

/**
 * Preferences persistence is split (B9):
 *
 * - **Account-synced** keys go to `preferences` via the storage abstraction
 *   (= Supabase when signed in; localStorage fallback when not). These are
 *   the choices that should follow the user across devices: language,
 *   primary edition, compare edition, panel tab, progress display metric,
 *   reading languages, premium-feature visibility, account flags.
 *
 * - **Per-device** keys go to `device-preferences` in localStorage only.
 *   These are layout/ergonomic choices that legitimately vary by device:
 *   theme, font size, font family, split-view default, panel-open default.
 *   Anders explicitly asked for this — "I want dark mode in one place,
 *   big font on my mobile, small on desktop, etc."
 *
 * The split happens at the persistence layer; React state still holds one
 * merged UserPreferences object so consumers don't change.
 */
const STORAGE_KEY = 'preferences'
const DEVICE_KEY = 'device-preferences'

/** Fields that vary per device — never sync to cloud. */
const DEVICE_FIELDS = ['darkMode', 'fontSize', 'fontFamily', 'splitView', 'panelOpen'] as const
type DeviceField = typeof DEVICE_FIELDS[number]

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
    // Layered load with explicit field-class separation:
    //   account fields ← cloud preferences (stripped of device fields so
    //                    legacy cloud-stored device values don't leak)
    //   device fields  ← localStorage device-preferences (else defaults)
    // This is safe for users mid-migration who still have device fields
    // in their cloud preferences blob: those values are ignored on read.
    const storedRaw = storage.get<UserPreferences>(STORAGE_KEY)
    const accountOnly = storedRaw ? pickAccount(storedRaw as UserPreferences) : {}
    const device = localStorageProvider.get<Partial<UserPreferences>>(DEVICE_KEY)
    const saved = { ...DEFAULT_PREFERENCES, ...accountOnly, ...(device || {}) } as UserPreferences
    // Migrate removed 'highlights' tab → 'notes'
    if ((saved.panelTab as string) === 'highlights') saved.panelTab = 'notes'
    // Migrate removed 'compare' tab (briefly lived as a 4th desktop rail) → chat
    if ((saved.panelTab as string) === 'compare') saved.panelTab = 'chat'
    // Migrate removed kids editions → modern
    if (saved.splitEditionKey?.includes('kids')) saved.splitEditionKey = 'modern-en'
    // Migrate old S/M/L/XL fontSize enum → numeric rem value.
    // Upward-shift: even "XL" under the old scale was visibly too small on
    // e-readers, so we level-set by mapping each tier to roughly one size up.
    // Former XL users get a true XL (2.0rem); former medium users land on
    // what's now a comfortable reading default.
    const fs = saved.fontSize as unknown
    if (typeof fs === 'string') {
      const map: Record<string, number> = { small: 1.1, medium: 1.3, large: 1.6, xlarge: 2.0 }
      saved.fontSize = map[fs] ?? DEFAULT_PREFERENCES.fontSize
    } else if (typeof fs !== 'number' || !isFinite(fs)) {
      saved.fontSize = DEFAULT_PREFERENCES.fontSize
    }
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
  // The save splits the merged preferences object: account-synced fields go
  // to cloud (preferences key); device-local fields go to localStorage only
  // (device-preferences key). See top-of-file comment for the split.
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

  // Apply font size and font family as CSS variables
  useEffect(() => {
    const familyMap: Record<FontFamily, string> = {
      garamond: "'EB Garamond', var(--font-serif)",
      baskerville: "'Libre Baskerville', var(--font-serif)",
      sourceserif: "'Source Serif 4', var(--font-serif)",
    }
    const appEl = document.querySelector('.app') as HTMLElement | null
    if (appEl) {
      appEl.style.setProperty('--font-size-reader', `${preferences.fontSize}rem`)
      appEl.style.setProperty('--font-family-reader', familyMap[preferences.fontFamily])
    }
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
  // Same layered load as initial: cloud account prefs + localStorage device
  // overlay. Without the device overlay here, re-fetching after sign-in
  // would clobber per-device settings with cloud values.
  const refreshFromStorage = useCallback(() => {
    const raw = storage.get<UserPreferences>(STORAGE_KEY)
    const device = localStorageProvider.get<Partial<UserPreferences>>(DEVICE_KEY)
    if (raw || device) {
      // Same field-class separation as initial load — strip device fields
      // from cloud so cross-device device preferences stay independent.
      const accountOnly = raw ? pickAccount(raw as UserPreferences) : {}
      const saved = { ...DEFAULT_PREFERENCES, ...accountOnly, ...(device || {}) } as UserPreferences
      if ((saved.panelTab as string) === 'highlights') saved.panelTab = 'notes'
      // Migrate removed 'compare' tab (briefly lived as a 4th desktop rail) → chat
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
