import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChapterNotesBeat, ChapterNotesRequest } from '../chapterNotes'
import { chapterNotesPlainText, fetchChapterNotes, storedChapterNotes } from './labChapterNotes'
import { RowIcon } from './LabSuperMenu.tsx'
import { CopyIcon } from '../components/reader/SelectionPopup'
import { useReaderWindow } from './useReaderWindow'
import { LabBalanceEmptyLine } from './LabAiUsageBar'
import { LAB_COPY } from './labCopy'
import './labCatchUp.css'

export interface LabChapterNotesSheetProps {
  request: ChapterNotesRequest
  title: string
  onClose: () => void
  onChat: (title: string, beats: ChapterNotesBeat[] | null) => void
  onTalk: (title: string, beats: ChapterNotesBeat[] | null) => void
  /** The reader's session, sent only while the AI allowance is on (labChapterNotes.ts). */
  readToken?: () => Promise<string | null>
  /** Opens where the reader can top up (the account sheet); links the balance line shown at zero. */
  onTopUp?: () => void
}

/**
 * Summarize ("so far"), the chapter-end summary and Primer: a short card of
 * titled beats in the Catch me up sheet, never a chat answer. Chat and Talk
 * continue from it; closing it leaves the reader where it was.
 */
export function LabChapterNotesSheet({ request, title, onClose, onChat, onTalk, readToken, onTopUp }: LabChapterNotesSheetProps) {
  const [beats, setBeats] = useState<ChapterNotesBeat[] | null>(() => storedChapterNotes(request))
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(() => (beats ? 'ok' : 'loading'))
  // Refused at zero (402 allowance_used, only while the AI allowance is on).
  const [allowanceUsed, setAllowanceUsed] = useState(false)
  // The daily AI ceiling or a provider limit (503 ai_resting): said above Retry.
  const [resting, setResting] = useState(false)
  const windowRef = useReaderWindow<HTMLElement>('chapter-notes', true)
  const mounted = useRef(true)
  // Set on every mount: React's development double mount runs the cleanup once.
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(copiedTimer.current), [])

  // The clipboard write starts inside the tap itself: iOS Safari grants
  // clipboard access only during the gesture. Nothing here touches the page
  // behind the sheet, so the reading place stays where it was.
  const copy = () => {
    if (!beats) return
    const text = chapterNotesPlainText(title, beats)
    const confirm = () => {
      if (!mounted.current) return
      setCopied(true)
      window.clearTimeout(copiedTimer.current)
      copiedTimer.current = window.setTimeout(() => { if (mounted.current) setCopied(false) }, 2000)
    }
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text).then(confirm, () => { if (copyBySelection(text)) confirm() })
    } else if (copyBySelection(text)) confirm()
  }

  const load = useCallback(() => {
    setState('loading')
    void fetchChapterNotes(request, { readToken }).then(result => {
      if (!mounted.current) return
      if (result.ok) { setBeats(result.beats); setState('ok') } else { setAllowanceUsed(result.allowanceUsed === true); setResting(result.resting === true); setState('error') }
    })
  }, [request, readToken])
  useEffect(() => { if (!beats) load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); onClose() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="lab-v2-sheet-layer lab-catch-up-layer" data-testid="lab-chapter-notes-layer">
      <button type="button" className="lab-super-scrim" aria-label="Close" onClick={onClose} />
      <section ref={windowRef} className="lab-v2-sheet lab-catch-up" data-testid="lab-chapter-notes" data-kind={request.kind} data-state={state} aria-label={title}>
        <div className="lab-v2-head is-titled" data-reader-window-handle>
          <h2 className="lab-v2-title">{title}</h2>
          <button type="button" className="lab-v2-dismiss" data-testid="lab-chapter-notes-close" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <div className="lab-v2-sheet-body lab-catch-up-body">
          <ol className="lab-catch-up-timeline">
            {state === 'ok' && beats ? beats.map((beat, index) => (
              <li key={index} className="lab-catch-up-entry" data-state="ok" data-testid="lab-chapter-notes-beat">
                <span className="lab-catch-up-dot" aria-hidden="true" />
                <h3 className="lab-catch-up-title">{beat.title}</h3>
                <p className="lab-catch-up-text">{beat.text}</p>
              </li>
            )) : state === 'error' ? (
              <li className="lab-catch-up-entry" data-state="error">
                <span className="lab-catch-up-dot" aria-hidden="true" />
                {allowanceUsed && <LabBalanceEmptyLine onTopUp={onTopUp} testId="lab-chapter-notes-balance" />}
                {resting && <p className="lab-catch-up-balance" data-testid="lab-chapter-notes-resting">{LAB_COPY.aiResting}</p>}
                <button type="button" className="lab-catch-up-retry" data-testid="lab-chapter-notes-retry" onClick={load}>Retry</button>
              </li>
            ) : [0, 1, 2].map(index => (
              <li key={index} className="lab-catch-up-entry" data-state="loading">
                <span className="lab-catch-up-dot" aria-hidden="true" />
                <span className="lab-catch-up-placeholder" aria-hidden="true"><i /><i /><i /></span>
              </li>
            ))}
            {request.kind === 'sofar' && <li className="lab-catch-up-here"><span className="lab-catch-up-dot" aria-hidden="true" />You are here</li>}
          </ol>
        </div>
        <div className="lab-catch-up-foot lab-chapter-notes-foot">
          <button type="button" className="lab-chapter-notes-tool" data-testid="lab-chapter-notes-chat" aria-label="Chat" onClick={() => onChat(title, beats)}><RowIcon id="chat" /></button>
          <button type="button" className="lab-chapter-notes-tool" data-testid="lab-chapter-notes-talk" aria-label="Talk" onClick={() => onTalk(title, beats)}><RowIcon id="talk" /></button>
          {state === 'ok' && beats && (
            <button type="button" className="lab-chapter-notes-tool" data-testid="lab-chapter-notes-copy" aria-label={copied ? 'Copied' : 'Copy'} onClick={copy}>
              {copied ? <span aria-hidden="true">✓</span> : <CopyIcon />}
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

/** Older browsers without the async clipboard: copy from an off-screen field
 *  that never scrolls the page. */
function copyBySelection(text: string): boolean {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') return false
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const field = document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;'
  document.body.appendChild(field)
  try {
    field.focus({ preventScroll: true })
    field.setSelectionRange(0, text.length)
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    field.remove()
    active?.focus({ preventScroll: true })
  }
}
