import { createRoot, type Root } from 'react-dom/client'
import { createElement } from 'react'
import { LabAiSettings, type LabAiSettingsProps } from './LabAiSettings'
import { syncAiSettingsToAccount } from './labAiAccount'

let open: { root: Root; host: HTMLElement } | null = null

/** The phone gets the full screen (the mock's 390px screen); anything wider the dialog. */
export function aiSettingsPhoneLayout(): boolean {
  try { return window.matchMedia('(max-width: 640px)').matches } catch { return false }
}

/**
 * Opens AI settings over whatever page is showing (the reader, or Profile from
 * the library), outside any React tree there. One at a time. On close, a
 * signed-in reader's settings are written to their account at once.
 */
export function openAiSettingsLayer(options: {
  dark?: boolean; phone?: boolean; userId?: string | null; onClosed?: () => void
  /** The open book: adds the This book tab (its own lengths and its reading angle). */
  book?: LabAiSettingsProps['book']
  /** 'book': open on This book (a "Set reading angle" entry); `focusAngle` puts the caret in the reading angle. */
  tab?: LabAiSettingsProps['tab']; focusAngle?: boolean
  dictation?: LabAiSettingsProps['dictation']
} = {}): void {
  if (open || typeof document === 'undefined') return
  const host = document.createElement('div')
  host.dataset.testid = 'ai-settings-host'
  document.body.appendChild(host)
  const root = createRoot(host)
  open = { root, host }
  const close = () => {
    if (!open || open.host !== host) return
    open = null
    root.unmount()
    host.remove()
    if (options.userId) void syncAiSettingsToAccount(options.userId)
    options.onClosed?.()
  }
  root.render(createElement(LabAiSettings, { onClose: close, phone: options.phone ?? aiSettingsPhoneLayout(), dark: options.dark, book: options.book, tab: options.tab, focusAngle: options.focusAngle, dictation: options.dictation }))
}

export function aiSettingsLayerOpen(): boolean {
  return open !== null
}
