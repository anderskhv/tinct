import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Section } from '../types'
import { catchUpPlan, catchUpSeparateWorks, catchUpUnits, type CatchUpEntry } from '../catchUp'
import type { LabChapter } from './labSource'
import { useReaderWindow } from './useReaderWindow'
import { LabBalanceEmptyLine } from './LabAiUsageBar'
import { LAB_COPY } from './labCopy'
import { RowIcon } from './LabSuperMenu.tsx'
import {
  CATCH_UP_COOLDOWN_MS,
  catchUpContextText,
  CATCH_UP_INITIAL_WANTED,
  catchUpShouldCoolDown,
  fetchCatchUpEntry,
  nextCatchUpKeys,
  rememberedCatchUp,
  type CatchUpLoadState,
} from './labCatchUp'
import './labCatchUp.css'
import { AI_ALLOWANCE_ENFORCED } from '../aiAllowanceSwitch'
import { LabPhoneCard } from './marginPhone/LabPhoneCard'

export const CATCH_UP_TITLE = 'Catch me up'

export interface LabCatchUpSheetProps {
  bookId: string
  editionKey: string
  bookTitle?: string
  chapters: LabChapter[]
  sections?: Section[]
  chapterNumber: number
  paragraphIndex: number
  /** The reader finished the current chapter. The current chapter is never recapped either way (`catchUpPlan`). */
  completed: boolean
  /** The current chapter's paragraphs in `editionKey` (unused by the plan: the current chapter is never recapped). */
  paragraphs?: readonly string[]
  /** The book's library form (`libraryTaxonomy.ts`); a collection of separate works is recapped one work at a time. */
  form?: string | null
  readToken?: () => Promise<string | null>
  onClose: () => void
  /** Chat and Talk carry what the sheet has shown (`catchUpContextText`), as Explain does. */
  onChat: (text: string) => void
  onTalk: (text: string) => void
  /** Opens where the reader can top up (the account sheet); links the balance line shown at zero. */
  onTopUp?: () => void
  /** The phone's margin mode: shown as the bottom card (marginPhone/LabPhoneCard), with this label. */
  card?: { label: string }
}

/**
 * `allowanceUsed`: refused at zero (402 allowance_used, only while the AI allowance is on).
 * `resting`: the daily AI ceiling or a provider limit (503 ai_resting).
 */
interface EntryState { state: CatchUpLoadState; summary?: string; allowanceUsed?: true; resting?: true }

/**
 * "Catch me up": a timeline of what has been read, oldest at the top, ending
 * at "You are here" (scope: `catchUp.ts`). It is an overlay only — it reads the place
 * it was opened at and never writes one, so opening and closing it cannot
 * move the reader.
 */
export function LabCatchUpSheet(props: LabCatchUpSheetProps) {
  const { bookId, editionKey, bookTitle, chapters, sections, chapterNumber, paragraphIndex, completed, paragraphs, form, readToken, onClose, onChat, onTalk, onTopUp, card } = props
  // The place is captured once, when the sheet opens.
  const [entries] = useState<CatchUpEntry[]>(() => catchUpPlan({
    bookId, editionKey, bookTitle,
    units: catchUpUnits({ title: bookTitle || bookId, chapters, sections, bible: bookId === 'bible' }),
    chapters, chapterNumber, paragraphIndex, completed,
    currentParagraphs: paragraphs ?? null,
    separateWorks: catchUpSeparateWorks({ bookId, form }),
  }))
  const keys = useMemo(() => entries.map(entry => entry.key), [entries])
  const [states, setStates] = useState<Record<string, EntryState>>(() => {
    const initial: Record<string, EntryState> = {}
    for (const entry of entries) {
      const summary = rememberedCatchUp(entry)
      if (summary) initial[entry.key] = { state: 'ok', summary }
    }
    return initial
  })
  const [wanted, setWanted] = useState<Set<string>>(() => new Set(keys.slice(0, CATCH_UP_INITIAL_WANTED)))
  const [coolUntil, setCoolUntil] = useState(0)
  // Earlier parts start folded to one line; a tap opens one.
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set())
  const toggle = useCallback((key: string) => setOpen(prev => {
    const next = new Set(prev)
    if (!next.delete(key)) next.add(key)
    return next
  }), [])
  const bodyRef = useRef<HTMLDivElement>(null)
  const windowRef = useReaderWindow<HTMLElement>('catchup', true)
  const tokenRef = useRef<Promise<string | null> | null>(null)
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

  // Entries near the visible part of the timeline are the ones worth asking for.
  useEffect(() => {
    const body = bodyRef.current
    if (!body || typeof IntersectionObserver !== 'function') return
    const observer = new IntersectionObserver(items => {
      const seen = items.filter(item => item.isIntersecting).map(item => (item.target as HTMLElement).dataset.key).filter((key): key is string => !!key)
      if (seen.length) setWanted(prev => seen.every(key => prev.has(key)) ? prev : new Set([...prev, ...seen]))
    }, { root: body, rootMargin: '320px 0px' })
    body.querySelectorAll<HTMLElement>('[data-key]').forEach(node => observer.observe(node))
    return () => observer.disconnect()
  }, [keys])

  // Requests in flight, by entry key. The ref, not rendered state, is what
  // stops an entry being asked for twice between two renders.
  const inflight = useRef(new Set<string>())
  const load = useCallback((entry: CatchUpEntry) => {
    if (inflight.current.has(entry.key)) return
    inflight.current.add(entry.key)
    setStates(prev => ({ ...prev, [entry.key]: { state: 'loading' } }))
    void (async () => {
      let token: string | null = null
      // Earlier units carry the session only while the AI allowance is on (labAiAllowance.ts).
      if ((entry.kind === 'current' || AI_ALLOWANCE_ENFORCED) && readToken) {
        tokenRef.current ??= readToken().catch(() => null)
        token = await tokenRef.current
      }
      const result = await fetchCatchUpEntry(entry, { token })
      inflight.current.delete(entry.key)
      if (!mounted.current) return
      if (!result.ok && catchUpShouldCoolDown(result.status)) setCoolUntil(Date.now() + CATCH_UP_COOLDOWN_MS)
      setStates(prev => ({
        ...prev,
        [entry.key]: result.ok ? { state: 'ok', summary: result.summary } : result.empty ? { state: 'empty' }
          : result.allowanceUsed ? { state: 'error', allowanceUsed: true } : result.resting ? { state: 'error', resting: true } : { state: 'error' },
      }))
    })()
  }, [readToken])

  // Start what is wanted, in reading order, a few at a time.
  useEffect(() => {
    const wait = coolUntil - Date.now()
    if (wait > 0) {
      const timer = window.setTimeout(() => setCoolUntil(0), wait)
      return () => window.clearTimeout(timer)
    }
    const plain: Record<string, CatchUpLoadState> = {}
    for (const key of keys) plain[key] = inflight.current.has(key) ? 'loading' : states[key]?.state ?? 'idle'
    for (const key of nextCatchUpKeys({ keys, states: plain, wanted })) {
      const entry = entries.find(item => item.key === key)
      if (entry) load(entry)
    }
  }, [coolUntil, entries, keys, load, states, wanted])

  const shownText = () => catchUpContextText(entries.map(entry => ({
    title: entry.title,
    summary: states[entry.key]?.state === 'ok' ? states[entry.key]?.summary : undefined,
  })))

  const timeline = (
        <div ref={bodyRef} className="lab-v2-sheet-body lab-catch-up-body" data-testid="lab-catch-up-body">
          <ol className="lab-catch-up-timeline">
            {entries.map(entry => {
              const status = states[entry.key]
              // Nothing to summarise there: no entry, never the model's words about it.
              if (status?.state === 'empty') return null
              const folded = entry.kind === 'unit' && entry.folded === true
              const expanded = folded && open.has(entry.key)
              return (
                <li key={entry.key} className={`lab-catch-up-entry is-${entry.kind}${folded ? ' is-folded' : ''}`} data-key={entry.key}
                  data-state={status?.state ?? 'idle'} data-testid="lab-catch-up-entry"
                  {...(folded ? { 'data-expanded': expanded ? 'true' : 'false' } : {})}>
                  <span className="lab-catch-up-dot" aria-hidden="true" />
                  <h3 className="lab-catch-up-title">{folded ? (
                    <button type="button" className="lab-catch-up-fold" data-testid="lab-catch-up-fold" aria-expanded={expanded}
                      onClick={() => toggle(entry.key)}>{entry.title}</button>
                  ) : entry.title}</h3>
                  {status?.state === 'ok' ? (
                    folded && !expanded
                      // One line: the part's recap, cut to fit; the tap opens it.
                      ? <p className="lab-catch-up-text is-line" onClick={() => toggle(entry.key)}>{status.summary}</p>
                      : <p className="lab-catch-up-text">{status.summary}</p>
                  ) : status?.state === 'error' ? (<>
                    {status.allowanceUsed && <LabBalanceEmptyLine onTopUp={onTopUp} testId="lab-catch-up-balance" />}
                    {status.resting && <p className="lab-catch-up-balance" data-testid="lab-catch-up-resting">{LAB_COPY.aiResting}</p>}
                    <button type="button" className="lab-catch-up-retry" data-testid="lab-catch-up-retry" onClick={() => { setCoolUntil(0); load(entry) }}>Retry</button>
                  </>) : (
                    <span className="lab-catch-up-placeholder" aria-hidden="true"><i /><i /><i /></span>
                  )}
                </li>
              )
            })}
            <li className="lab-catch-up-here" data-testid="lab-catch-up-here">
              <span className="lab-catch-up-dot" aria-hidden="true" />
              You are here
            </li>
          </ol>
        </div>
  )
  const foot = (
        <div className="lab-catch-up-foot lab-chapter-notes-foot">
          <button type="button" className="lab-chapter-notes-tool" data-testid="lab-catch-up-chat" aria-label="Chat" onClick={() => onChat(shownText())}><RowIcon id="chat" /></button>
          <button type="button" className="lab-chapter-notes-tool" data-testid="lab-catch-up-talk" aria-label="Talk" onClick={() => onTalk(shownText())}><RowIcon id="talk" /></button>
        </div>
  )
  if (card) return <LabPhoneCard label={card.label} kind="catchup" onClose={onClose} foot={foot} testId="lab-phone-card">{timeline}</LabPhoneCard>
  return (
    <div className="lab-v2-sheet-layer lab-catch-up-layer" data-testid="lab-catch-up-layer">
      <button type="button" className="lab-super-scrim" data-testid="lab-catch-up-scrim" aria-label="Close" onClick={onClose} />
      <section ref={windowRef} className="lab-v2-sheet lab-catch-up" data-testid="lab-catch-up" data-layer="catchup" aria-label={CATCH_UP_TITLE}>
        <div className="lab-v2-head is-titled" data-reader-window-handle>
          <h2 className="lab-v2-title">{CATCH_UP_TITLE}</h2>
          <button type="button" className="lab-v2-dismiss" data-testid="lab-catch-up-close" aria-label="Close" onClick={onClose}>×</button>
        </div>
        {timeline}
        {foot}
      </section>
    </div>
  )
}
