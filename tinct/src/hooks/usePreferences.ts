import { useState, useCallback, useEffect } from 'react'
import { storage } from '../services/storage'
import type { Language, Style, EditionKey, UserPreferences, PanelTab, FontSize, FontFamily } from '../types'
import { DEFAULT_PREFERENCES } from '../types'

const STORAGE_KEY = 'preferences'

export function usePreferences() {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() => {
    const saved = storage.get<UserPreferences>(STORAGE_KEY) || DEFAULT_PREFERENCES
    // Migrate removed 'highlights' tab → 'notes'
    if ((saved.panelTab as string) === 'highlights') saved.panelTab = 'notes'
    return saved
  })

  // Persist on change
  useEffect(() => {
    storage.set(STORAGE_KEY, preferences)
  }, [preferences])

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
    update,
  }
}
