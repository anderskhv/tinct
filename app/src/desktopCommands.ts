import { useEffect, useRef, useState } from 'react'

export type DesktopCommand = { id: string; label: string; key?: string; run: () => void; enabled?: () => boolean }
export type DesktopCommands = { commands: DesktopCommand[]; blocked: () => boolean; prepare?: () => void }
declare global {
  interface Window {
    __tinctDesktopCommands?: DesktopCommands
    __tinctDesktopOpen?: () => void
  }
}

/** Keep commands on the existing action handlers, including their saved-place rules. */
export function useDesktopCommands(config: DesktopCommands) {
  const current = useRef(config)
  current.current = config
  useEffect(() => {
    const registration: DesktopCommands = {
      get commands() { return current.current.commands },
      blocked: () => current.current.blocked(),
      prepare: () => current.current.prepare?.(),
    }
    window.__tinctDesktopCommands = registration
    return () => { if (window.__tinctDesktopCommands === registration) delete window.__tinctDesktopCommands }
  }, [])
}

export function openDesktopCommands() { window.__tinctDesktopOpen?.() }

export function loadDesktopExperience() {
  if (document.getElementById('tinct-desktop-runtime')) return
  const script = document.createElement('script')
  script.id = 'tinct-desktop-runtime'
  script.type = 'module'
  script.src = '/omarchy/experience.js?v=20260928-1'
  document.head.append(script)
}

export function useDesktopAppearance() {
  const read = () => document.documentElement.dataset.tinctTheme
    ? { dark: document.documentElement.dataset.tinctReaderDark === 'true' } : null
  const [appearance, setAppearance] = useState(read)
  useEffect(() => {
    const update = () => setAppearance(read())
    window.addEventListener('tinct:appearance', update)
    update()
    return () => window.removeEventListener('tinct:appearance', update)
  }, [])
  return appearance
}
