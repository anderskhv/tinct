import { useCallback, useEffect, useRef, useState } from 'react'
import { useReaderWindow } from '../useReaderWindow'
import { LabBalanceEmptyLine } from '../LabAiUsageBar'
import { CATCH_UP_COOLDOWN_MS, catchUpShouldCoolDown } from '../labCatchUp'
import { CATCH_UP_TITLE } from '../LabCatchUpSheet'
import { buildOwnCatchUp, ownCatchUpPlan } from './ownCatchUp'
import type { UserBookChapter } from './userEdition'
import '../labCatchUp.css'

/** The one entry's title: everything read so far, in one recap. */
export const OWN_CATCH_UP_ENTRY_TITLE = 'So far'

export interface LabOwnCatchUpSheetProps {
  bookHex: string
  bookTitle?: string
  /** The book's chapters with their text, from this device. */
  chapters: readonly UserBookChapter[]
  chapterNumber: number
  paragraphIndex: number
  completed: boolean
  readToken: () => Promise<string | null>
  onClose: () => void
  onDiscuss: () => void
  onTopUp?: () => void
}

type State =
  | { state: 'loading'; done: number; total: number }
  | { state: 'ok'; recap: string }
  | { state: 'error'; allowanceUsed?: true; status: number }

/**
 * Catch me up on a reader's own book: the same sheet and timeline as the
 * built-in one (LabCatchUpSheet), holding one cumulative recap of everything
 * read so far above "You are here". The recap is built chapter by chapter
 * (userBook/ownCatchUp.ts). Like the built-in sheet it reads the place once,
 * at open, and never writes one.
 */
export function LabOwnCatchUpSheet(props: LabOwnCatchUpSheetProps) {
  const { bookHex, bookTitle, chapters, chapterNumber, paragraphIndex, completed, readToken, onClose, onDiscuss, onTopUp } = props
  const [steps] = useState(() => ownCatchUpPlan({ chapters, chapterNumber, paragraphIndex, completed }))
  const [status, setStatus] = useState<State>({ state: 'loading', done: 0, total: steps.length })
  const [attempt, setAttempt] = useState(0)
  const windowRef = useReaderWindow<HTMLElement>('catchup', true)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    let cancelled = false
    setStatus({ state: 'loading', done: 0, total: steps.length })
    void (async () => {
      const token = await readToken().catch(() => null)
      const result = await buildOwnCatchUp({
        bookHex, bookTitle, steps, token,
        cancelled: () => cancelled || !mounted.current,
        onProgress: (done, total) => { if (!cancelled) setStatus({ state: 'loading', done, total }) },
      })
      if (cancelled || !mounted.current) return
      setStatus(result.ok ? { state: 'ok', recap: result.recap } : { state: 'error', status: result.status, ...(result.allowanceUsed ? { allowanceUsed: true as const } : {}) })
    })()
    return () => { cancelled = true }
  }, [attempt, bookHex, bookTitle, readToken, steps])

  // A rate limit or a resting AI: ask again on our own after the built-in sheet's cooldown.
  useEffect(() => {
    if (status.state !== 'error' || !catchUpShouldCoolDown(status.status)) return
    const timer = window.setTimeout(() => setAttempt(n => n + 1), CATCH_UP_COOLDOWN_MS)
    return () => window.clearTimeout(timer)
  }, [status])

  const retry = useCallback(() => setAttempt(n => n + 1), [])

  return (
    <div className="lab-v2-sheet-layer lab-catch-up-layer" data-testid="lab-catch-up-layer">
      <button type="button" className="lab-super-scrim" data-testid="lab-catch-up-scrim" aria-label="Close" onClick={onClose} />
      <section ref={windowRef} className="lab-v2-sheet lab-catch-up" data-testid="lab-catch-up" data-layer="catchup" data-own-book="true" aria-label={CATCH_UP_TITLE}>
        <div className="lab-v2-head is-titled" data-reader-window-handle>
          <h2 className="lab-v2-title">{CATCH_UP_TITLE}</h2>
          <button type="button" className="lab-v2-dismiss" data-testid="lab-catch-up-close" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <div className="lab-v2-sheet-body lab-catch-up-body" data-testid="lab-catch-up-body">
          <ol className="lab-catch-up-timeline">
            {/* Nothing read yet that has anything to summarise: no entry, only "You are here". */}
            {!(status.state === 'ok' && !status.recap) && (
              <li className="lab-catch-up-entry is-current" data-state={status.state} data-testid="lab-catch-up-entry">
                <span className="lab-catch-up-dot" aria-hidden="true" />
                <h3 className="lab-catch-up-title">{OWN_CATCH_UP_ENTRY_TITLE}</h3>
                {status.state === 'ok' ? (
                  <p className="lab-catch-up-text">{status.recap}</p>
                ) : status.state === 'error' ? (<>
                  {status.allowanceUsed && <LabBalanceEmptyLine onTopUp={onTopUp} testId="lab-catch-up-balance" />}
                  <button type="button" className="lab-catch-up-retry" data-testid="lab-catch-up-retry" onClick={retry}>Retry</button>
                </>) : (<>
                  <span className="lab-catch-up-placeholder" aria-hidden="true"><i /><i /><i /></span>
                  {status.total > 1 && (
                    <p className="lab-catch-up-progress" data-testid="lab-catch-up-progress">
                      Chapter {Math.min(status.done + 1, status.total)} of {status.total}
                    </p>
                  )}
                </>)}
              </li>
            )}
            <li className="lab-catch-up-here" data-testid="lab-catch-up-here">
              <span className="lab-catch-up-dot" aria-hidden="true" />
              You are here
            </li>
          </ol>
        </div>
        <div className="lab-catch-up-foot">
          <button type="button" className="lab-catch-up-discuss" data-testid="lab-catch-up-discuss" onClick={onDiscuss}>Discuss</button>
        </div>
      </section>
    </div>
  )
}
