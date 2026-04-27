import { useState, useCallback, useEffect, useRef } from 'react'
import { storage } from '../services/storage'
import type { Language, Style, EditionKey, UserPreferences, PanelTab, FontSize, FontFamily } from '../types'
import { DEFAULT_PREFERENCES } from '../types'

const STORAGE_KEY = 'preferences'

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
    const stored = storage.get<UserPreferences>(STORAGE_KEY)
    const saved = { ...DEFAULT_PREFERENCES, ...stored }
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
  const writeUnlockedRef = useRef(false)
  useEffect(() => {
    if (!storageReady) return
    if (!writeUnlockedRef.current) {
      writeUnlockedRef.current = true
      return
    }
    storage.set(STORAGE_KEY, preferences)
  }, [preferences, storageReady])

  // Apply dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.darkMode ? 'dark' : 'light')
  }, [preferences.darkMode])

  // Apply font size and font family as CSS variables
  useEffect(() => {
    const sizeMap: Record<FontSize, string> = {
      small: '1rem',
      medium: '1.1rem',
      large: '1.25rem',
      xlarge: '1.4rem',
    }
    const familyMap: Record<FontFamily, string> = {
      garamond: "'EB Garamond', var(--font-serif)",
      baskerville: "'Libre Baskerville', var(--font-serif)",
      sourceserif: "'Source Serif 4', var(--font-serif)",
    }
    const appEl = document.querySelector('.app') as HTMLElement | null
    if (appEl) {
      appEl.style.setProperty('--font-size-reader', sizeMap[preferences.fontSize])
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

  // Re-read preferences from storage (called after storage provider swap)
  const refreshFromStorage = useCallback(() => {
    const raw = storage.get<UserPreferences>(STORAGE_KEY)
    if (raw) {
      const saved = { ...DEFAULT_PREFERENCES, ...raw }
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
