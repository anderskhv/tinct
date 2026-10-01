import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChapterNotesBeat, ChapterNotesRequest } from '../chapterNotes'
import { fetchChapterNotes, storedChapterNotes } from './labChapterNotes'
import { RowIcon } from './LabSuperMenu'
import { useReaderWindow } from './useReaderWindow'
import './labCatchUp.css'

export interface LabChapterNotesSheetProps {
  request: ChapterNotesRequest
  title: string
  onClose: () => void
  onChat: (title: string, beats: ChapterNotesBeat[] | null) => void
  onTalk: (title: string, beats: ChapterNotesBeat[] | null) => void
}

/**
 * Summarize ("so far"), the chapter-end summary and Primer: a short card of
 * titled beats in the Catch me up sheet, never a chat answer. Chat and Talk
 * continue from it; closing it leaves the reader where it was.
 */
export function LabChapterNotesSheet({ request, title, onClose, onChat, onTalk }: LabChapterNotesSheetProps) {
  const [beats, setBeats] = useState<ChapterNotesBeat[] | null>(() => storedChapterNotes(request))
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(() => (beats ? 'ok' : 'loading'))
  const windowRef = useReaderWindow<HTMLElement>('chapter-notes', true)
  const mounted = useRef(true)
  useEffect(() => () => { mounted.current = false }, [])

  const load = useCallback(() => {
    setState('loading')
    void fetchChapterNotes(request).then(result => {
      if (!mounted.current) return
      if (result.ok) { setBeats(result.beats); setState('ok') } else setState('error')
    })
  }, [request])
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
        </div>
      </section>
    </div>
  )
}
