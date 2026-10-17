import { useEffect, useRef, useState } from 'react'
import { LabWait } from './LabWait'
import {
  OFFLINE_BOOK_SAVED_EVENT,
  offlineBookSaved,
  offlineBookSupported,
  removeBookOffline,
  requestPersistentStorage,
  saveBookOffline,
} from './labOfflineBook'

type OfflineState =
  | { kind: 'idle' }
  | { kind: 'saving'; done: number; total: number }
  | { kind: 'saved' }

function buildVersion(): string {
  return typeof __BUILD_VERSION__ === 'string' ? __BUILD_VERSION__ : 'dev'
}

/** Book editions: save this book's main and compare editions for reading without a connection. */
export function LabOfflineRow({ bookId, editionKeys, hasVerseLines }: {
  bookId: string
  editionKeys: string[]
  hasVerseLines: boolean
}) {
  const editionsId = editionKeys.join(',')
  const [state, setState] = useState<OfflineState>(() => (
    offlineBookSaved(bookId, editionKeys, buildVersion()) ? { kind: 'saved' } : { kind: 'idle' }
  ))
  const alive = useRef(true)
  useEffect(() => () => { alive.current = false }, [])
  useEffect(() => {
    setState(current => current.kind === 'saving' ? current
      : offlineBookSaved(bookId, editionsId.split(','), buildVersion()) ? { kind: 'saved' } : { kind: 'idle' })
  }, [bookId, editionsId])
  // The background save finishing while the sheet is open.
  useEffect(() => {
    const saved = (event: Event) => {
      if ((event as CustomEvent<{ bookId?: string }>).detail?.bookId !== bookId) return
      setState(current => current.kind === 'idle' && offlineBookSaved(bookId, editionsId.split(','), buildVersion()) ? { kind: 'saved' } : current)
    }
    window.addEventListener(OFFLINE_BOOK_SAVED_EVENT, saved)
    return () => window.removeEventListener(OFFLINE_BOOK_SAVED_EVENT, saved)
  }, [bookId, editionsId])
  if (!offlineBookSupported()) return null

  const save = () => {
    if (state.kind !== 'idle') return
    // Asked inside the tap, so Safari counts it as the reader's own request.
    requestPersistentStorage()
    setState({ kind: 'saving', done: 0, total: 0 })
    saveBookOffline({
      bookId,
      editionKeys,
      hasVerseLines,
      onProgress: (done, total) => { if (alive.current) setState({ kind: 'saving', done, total }) },
    }).then(
      () => { if (alive.current) setState({ kind: 'saved' }) },
      () => { if (alive.current) setState({ kind: 'idle' }) },
    )
  }
  const remove = () => {
    void removeBookOffline(bookId).finally(() => { if (alive.current) setState({ kind: 'idle' }) })
  }

  if (state.kind === 'saved') {
    return (
      <div className="lab-v2-row lab-v2-offline is-saved" data-testid="lab-v2-offline" data-offline-state="saved">
        <span className="lab-v2-row-label">Available offline</span>
        <span className="lab-v2-offline-tick" aria-hidden="true">✓</span>
        <button type="button" className="lab-v2-offline-remove" data-testid="lab-v2-offline-remove" onClick={remove}>Remove</button>
      </div>
    )
  }
  return (
    <button type="button" className="lab-v2-row lab-v2-offline" data-testid="lab-v2-offline"
      data-offline-state={state.kind} aria-busy={state.kind === 'saving'} onClick={save}>
      <span className="lab-v2-row-label" aria-live="polite">
        {state.kind === 'saving'
          // The reader's ring in the row (the label is the live region); the count stays for screen readers.
          ? <LabWait label={state.total ? `Saving… ${state.done} of ${state.total}` : 'Saving…'} size={16} live={false} testId="lab-v2-offline-wait" />
          : 'Make available offline'}
      </span>
    </button>
  )
}
