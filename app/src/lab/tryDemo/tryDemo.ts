import { useEffect, useRef } from 'react'
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

export function tryDemoTell(message: Record<string, unknown>): void {
  demoGlobal()?.tell(message)
}

export type TryDemoCommand =
  | { cmd: 'explain' }
  | { cmd: 'followup'; text: string }
  | { cmd: 'edition'; kind: 'original' | 'modern' }
  | { cmd: 'listen' }
  | { cmd: 'summary' }

export interface TryDemoHandles {
  /** Select the step 1 passage (the selection bar shows), then run Explain on it. */
  explain: () => boolean
  /** Put a suggested question in the open card's follow-up field and focus it; false when no card is open. */
  followUp: (text: string) => boolean
  edition: (kind: 'original' | 'modern') => void
  listen: () => void
  summary: () => void
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
  switch (src.cmd) {
    case 'explain': case 'listen': case 'summary': return { cmd: src.cmd }
    case 'followup': return { cmd: 'followup', text: typeof src.text === 'string' ? src.text.slice(0, 300) : '' }
    case 'edition': return src.kind === 'modern' || src.kind === 'original' ? { cmd: 'edition', kind: src.kind } : null
    default: return null
  }
}

/**
 * Wires the page's commands to the reader and reports the reader's state to the page. Off (and free) unless
 * TRY_DEMO: nothing listens and nothing is posted.
 */
export function useTryDemo(handles: { current: TryDemoHandles }, state: TryDemoState): void {
  const pendingFollowUp = useRef<string | null>(null)
  const pendingTimer = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (!TRY_DEMO) return
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return
      const command = parseCommand(event.data)
      if (!command) return
      const run = handles.current
      switch (command.cmd) {
        case 'explain': run.explain(); return
        case 'followup': {
          if (run.followUp(command.text)) return
          // No card open yet (step 1 was skipped): explain first, then the field once the card is there.
          pendingFollowUp.current = command.text
          run.explain()
          window.clearTimeout(pendingTimer.current)
          let tries = 0
          const retry = () => {
            if (pendingFollowUp.current === null) return
            if (handles.current.followUp(pendingFollowUp.current) || ++tries > 30) { pendingFollowUp.current = null; return }
            pendingTimer.current = window.setTimeout(retry, 200)
          }
          pendingTimer.current = window.setTimeout(retry, 1400)
          return
        }
        case 'edition': run.edition(command.kind); return
        case 'listen': run.listen(); return
        case 'summary': run.summary(); return
      }
    }
    window.addEventListener('message', onMessage)
    return () => { window.removeEventListener('message', onMessage); window.clearTimeout(pendingTimer.current) }
  }, [handles])

  const { ready, phone, edition, playing, card, selection, chapterCard } = state
  useEffect(() => {
    if (!TRY_DEMO) return
    tryDemoTell({ type: 'state', ready, phone, edition, playing, card, selection, chapterCard })
  }, [ready, phone, edition, playing, card, selection, chapterCard])
}

/** The first sentence of a paragraph, by word index (from the first word after a section number to the first word ending a sentence). */
export function firstSentenceWords(paragraph: string): { fromWord: number; toWord: number } | null {
  const words = paragraph.split(/\s+/).filter(Boolean)
  if (!words.length) return null
  const fromWord = /^\d+\.$/.test(words[0]) && words.length > 1 ? 1 : 0
  for (let index = fromWord; index < words.length; index++) {
    if (/[.!?]["'’”)]*$/.test(words[index])) return { fromWord, toWord: index }
  }
  return { fromWord, toWord: words.length - 1 }
}
