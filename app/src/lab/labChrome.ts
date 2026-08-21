/** Production desktop still uses the vertical Chat / Feed / Cast rails. */
export const PRODUCTION_DESKTOP_PANES = ['Chat', 'Feed', 'Cast'] as const

/** The lab desktop right pane is Ask only. */
export const LAB_DESKTOP_PANES = ['Ask'] as const

export type ProductionDesktopPane = typeof PRODUCTION_DESKTOP_PANES[number]
export type LabDesktopPane = typeof LAB_DESKTOP_PANES[number]

/** One lab surface at a time. The ears cannot hear and talk together. */
export type LabChromeState = 'reading' | 'hearing' | 'talking'
export type LabReturnTo = 'reading' | 'hearing'

export function isProductionDesktopPane(label: string): label is ProductionDesktopPane {
  return (PRODUCTION_DESKTOP_PANES as readonly string[]).includes(label)
}

export function isLabDesktopPane(label: string): label is LabDesktopPane {
  return (LAB_DESKTOP_PANES as readonly string[]).includes(label)
}

export function labStatusLine(state: LabChromeState, chapterLabel: string): string {
  if (state === 'talking') return 'Talking · tap the circle to stop'
  if (state === 'hearing') return `Hearing · ${chapterLabel}`
  return `Reading · ${chapterLabel}`
}

export function labAfterTalk(returnTo: LabReturnTo): LabChromeState {
  return returnTo
}

export function labVoicePhaseLabel(phase: 'idle' | 'connecting' | 'listening' | 'speaking'): string | null {
  if (phase === 'connecting') return 'Starting'
  if (phase === 'listening') return 'Listening'
  if (phase === 'speaking') return 'Speaking'
  return null
}
