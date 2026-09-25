import React from 'react'
import { createRoot } from 'react-dom/client'
import { LibraryAssistant, type LibraryAssistantControls, type LibraryAssistantHost } from './labLibraryAssistant'

/** Isolate the production assistant's CSS from the illustrated library. */
export async function mountLibraryTwoAssistant(element: HTMLElement, options: Pick<LibraryAssistantHost, 'onClose' | 'openBook' | 'returnTo' | 'getBookId'>): Promise<LibraryAssistantControls> {
  const shadow = element.shadowRoot ?? element.attachShadow({ mode: 'open' })
  const stylesheet = document.createElement('link')
  stylesheet.rel = 'stylesheet'
  stylesheet.href = '/lab/library_2/assistant.css?v=20260925i'
  await new Promise<void>((resolve, reject) => {
    stylesheet.onload = () => resolve()
    stylesheet.onerror = () => { stylesheet.remove(); reject(new Error('Librarian styles unavailable')) }
    shadow.append(stylesheet)
  })
  const container = document.createElement('div')
  container.id = 'assistant-root'
  shadow.append(container)
  const root = createRoot(container)
  const controls: React.MutableRefObject<LibraryAssistantControls | null> = { current: null }
  await new Promise<void>(resolve => {
    root.render(<LibraryAssistant host={{ ...options, controls, ready: resolve }} />)
  })
  // Resolve the current callbacks at each gesture (auth/context may have changed).
  return { open: mode => controls.current?.open(mode), close: () => controls.current?.close() }
}

declare global {
  interface Window { __tinctLibraryTwoAssistant?: { mount: typeof mountLibraryTwoAssistant } }
}
// Like the reading bridge, this survives Vite's application-entry export pruning.
window.__tinctLibraryTwoAssistant = { mount: mountLibraryTwoAssistant }
