import { useState, useCallback, useEffect } from 'react'
import { storage } from '../services/storage'
import type { Language, Style, EditionKey, UserPreferences, PanelTab } from '../types'
import { DEFAULT_PREFERENCES } from '../types'

const STORAGE_KEY = 'preferences'

export function usePreferences() {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() => {
    return storage.get<UserPreferences>(STORAGE_KEY) || DEFAULT_PREFERENCES
  })

  // Persist on change
  useEffect(() => {
    storage.set(STORAGE_KEY, preferences)
  }, [preferences])

  // Apply dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.darkMode ? 'dark' : 'light')
  }, [preferences.darkMode])

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
    update,
  }
}
