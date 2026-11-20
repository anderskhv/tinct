import { useEffect } from 'react'
import './tryDemo.css'

/**
 * The reader as the /try page shows it (docs/try-page/BRIEF.md): demo mode.
 *
 * The frame's head script (public/lab/try/reader-demo.js) decides it: only `/reader?demo=try` framed by /try on the
 * same origin, with storage held in memory and writes answered in the frame. This module is the reader's side of
 * the page's small API: the page sends commands (each step's Next), and the reader tells the page what the visitor
 * did by hand (a selection, a card, the edition, Listen, a Summary, an account prompt), so the step panel follows.
 * Messages go only between this frame and its /try parent, on the same origin.
 */
interface TryDemoGlobal { surface: 'try'; tell: (message: Record<string, unknown>) => void; carryOver: () => boolean }

function demoGlobal(): TryDemoGlobal | null {
  if (typeof window === 'undefined') return null
  const value = (window as unknown as { __TINCT_TRY_DEMO__?: TryDemoGlobal }).__TINCT_TRY_DEMO__
  return value && value.surface === 'try' ? value : null
}

/** This reader is the /try page's demo (decided once, before the app runs). */
export const TRY_DEMO = demoGlobal() !== null

/**
 * The demo's reading size on the desktop. The boards (docs/try-page/mockups D1–D9) show production's reader at
 * 1600px scaled into the page's ~1056px frame; one step under the desktop minimum (1.0) keeps the passage, its
 * Explain card and the follow-up answer on one screen without shrinking the whole reader.
 */
export const TRY_DEMO_DESKTOP_FONT_SIZE = 0.9

export function tryDemoTell(message: Record<string, unknown>): void {
  demoGlobal()?.tell(message)
}

/** The page's one command: its own Original | Modern English switch on the phone (the desktop switch is in the reader's top bar). */
export type TryDemoCommand = { cmd: 'edition'; kind: 'original' | 'modern' }

export interface TryDemoHandles {
  edition: (kind: 'original' | 'modern') => void
}

export interface TryDemoState {
  ready: boolean
  phone: boolean
  edition: string
  playing: boolean
  /** The open card's kind (explain, ask, simplify, …) or null. */
  card: string | null
  selection: boolean
  /** The open chapter card: 'summary', 'primer', … or null. */
  chapterCard: string | null
}

function parseCommand(data: unknown): TryDemoCommand | null {
  if (!data || typeof data !== 'object') return null
  const src = data as Record<string, unknown>
  if (src.source !== 'tinct-try-page') return null
  return src.cmd === 'edition' && (src.kind === 'modern' || src.kind === 'original') ? { cmd: 'edition', kind: src.kind } : null
}

/**
 * Wires the page's edition switch to the reader and reports the reader's state to the page, which ticks its
 * checklist and places its hints from it. The page never makes the reader act on its own: no Explain, no scroll.
 * Off (and free) unless TRY_DEMO: nothing listens and nothing is posted.
 */
export function useTryDemo(handles: { current: TryDemoHandles }, state: TryDemoState): void {
  useEffect(() => {
    if (!TRY_DEMO) return
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return
      const command = parseCommand(event.data)
      if (command) handles.current.edition(command.kind)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [handles])

  const { ready, phone, edition, playing, card, selection, chapterCard } = state
  useEffect(() => {
    if (!TRY_DEMO) return
    tryDemoTell({ type: 'state', ready, phone, edition, playing, card, selection, chapterCard })
  }, [ready, phone, edition, playing, card, selection, chapterCard])
}

/** The first sentence of a paragraph (the scripted Explain's passage is Book 2's first sentence), by word index (from the first word after a section number to the first word ending a sentence). */
export function firstSentenceWords(paragraph: string): { fromWord: number; toWord: number } | null {
  const words = paragraph.split(/\s+/).filter(Boolean)
  if (!words.length) return null
  const fromWord = /^\d+\.$/.test(words[0]) && words.length > 1 ? 1 : 0
  for (let index = fromWord; index < words.length; index++) {
    if (/[.!?]["'’”)]*$/.test(words[index])) return { fromWord, toWord: index }
  }
  return { fromWord, toWord: words.length - 1 }
}
