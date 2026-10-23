import { useEffect, useRef, useState, type ComponentType } from 'react'
import type { HighlightColor } from '../../../types'
import { SelectionDeskBar, type DeskMoreId } from '../../../components/reader/SelectionDeskBar'
import { LabSuperButton } from '../../LabSuperButton'
import { LabInlineMarkdown } from '../../LabMarkdown'
import { PdfOriginalAnswer } from './PdfOriginalAnswer'
import { LabPhoneCard } from '../../marginPhone/LabPhoneCard'
import { LabPhoneBar } from '../../marginPhone/LabPhoneBar'
import { PhoneFollowField, PhoneQuizBody } from '../../marginPhone/LabPhoneCards'
import { readLabPrefs, writeLabPrefs, type LabTheme } from '../../labPrefs'
import { loadPdfEngine } from '../../userBook/pdfEdition'
import { PdfOriginalSurface, type PdfOriginalOutlineEntry, type PdfOriginalPlace, type PdfOriginalSelection, type PdfOriginalSurfaceProps } from './PdfOriginalSurface'
import { pdfCatchUpPages, pdfCompleteUnitPages, pdfOriginalUnits, pdfPrimerPages, pdfUnitAt, type PdfOriginalScanOutline, type PdfOriginalUnitRules } from './pdfOriginalUnits'
import '../../lab.css'
import './pdfOriginalReaderShell.css'

export type PdfOriginalMark = { id: string; page: number; text: string; rects: number[][]; color: string; note?: string; at: number }
export type PdfOriginalCard = { id: string; page: number; text: string; kind: string; rects?: number[][]; turns: Array<{ role: 'user' | 'assistant'; content: string }>; at: number; data?: Record<string, unknown> }
export type PdfOriginalTalkConversation = { id: string; page: number | null; turns: PdfOriginalCard['turns']; at: number; localOnly: true }
export type PdfOriginalCardOptions = { question?: string; turns?: PdfOriginalCard['turns']; data?: Record<string, unknown> }
export type PdfOriginalQuizCheck = { question: string; expected: string; why?: string; answer: string }
export type PdfOriginalUnitSource = { unit: { key: string; title: string; from: number; to: number }; pages: Array<{ n: number; text: string }>; atPage: number }
export type PdfOriginalUnitAction = 'primer' | 'catchup' | 'recap'
/** The owner-qualified service handles private geometry, storage, and companion requests. */
export interface PdfOriginalReaderServices {
  marks: PdfOriginalMark[]; cards: PdfOriginalCard[]; talkConversations?: PdfOriginalTalkConversation[]
  recoverableTalkCount?: number; adoptRecoverableTalk?: () => boolean
  audio?: { speed: number; setSpeed: (speed: number) => void; playing: boolean; pause: () => void; available: boolean; resume?: () => boolean }
  heardPage?: number | null
  follow?: PdfOriginalSurfaceProps['follow']
  subscribe?: (notify: () => void) => () => void
  saveHighlight: (selection: PdfOriginalSelection, color: HighlightColor) => boolean
  saveNote: (selection: PdfOriginalSelection, note: string) => boolean
  removeMark: (id: string) => (() => boolean | void) | null
  saveCard: (selection: PdfOriginalSelection, kind: string, answer: string, options?: PdfOriginalCardOptions) => boolean
  saveCardWithId?: (selection: PdfOriginalSelection, kind: string, answer: string, options?: PdfOriginalCardOptions) => string | null
  askCardFollow?: (id: string, question: string, signal?: AbortSignal, onDelta?: (text: string) => void) => Promise<string | null>
  appendCardTurn?: (id: string, question: string, answer: string) => boolean
  removeCard: (id: string) => (() => boolean | void) | null
  ask: (selection: PdfOriginalSelection, intent: string, question?: string, signal?: AbortSignal, onDelta?: (text: string) => void) => Promise<string | null>
  askQuizCheck?: (selection: PdfOriginalSelection, quiz: PdfOriginalQuizCheck) => Promise<string | null>
  getPageText?: (page: number) => Promise<string>
  askUnit?: (source: PdfOriginalUnitSource, action: PdfOriginalUnitAction, signal?: AbortSignal, onDelta?: (text: string) => void) => Promise<string | null>
  saveUnitCard?: (source: PdfOriginalUnitSource, action: PdfOriginalUnitAction, answer: string) => boolean
  saveUnitCardWithId?: (source: PdfOriginalUnitSource, action: PdfOriginalUnitAction, answer: string) => string | null
  askUnitQuiz?: (source: PdfOriginalUnitSource, signal?: AbortSignal, onDelta?: (text: string) => void) => Promise<string | null>
  askUnitQuizCheck?: (source: PdfOriginalUnitSource, quiz: PdfOriginalQuizCheck) => Promise<string | null>
  saveUnitQuizCardWithId?: (source: PdfOriginalUnitSource, summary: string, generatedQuiz: string) => string | null
  saveUnitNote?: (source: { unit: PdfOriginalUnitSource['unit']; atPage: number; source: { from: number; to: number } }, note: string) => string | null
  setPdfPageText?: (page: number, text: string, pages: number) => void
  listen?: (page: number, text: string) => void
  TalkCard?: ComponentType<{ page: number; text: string; onClose: () => void }>
}
export interface PdfOriginalReaderShellProps extends Pick<PdfOriginalSurfaceProps, 'bytes' | 'initialPlace' | 'onVisiblePlace' | 'onDocument' | 'onSelection'> {
  title: string
  onOpenText?: (place: PdfOriginalPlace) => void
  services?: PdfOriginalReaderServices
  scanOutline?: PdfOriginalScanOutline | null
  /** Injected only by focused tests; production loads the existing margin rules. */
  unitRules?: PdfOriginalUnitRules
}
type Pane = 'menu' | 'contents' | 'reading' | 'book' | 'audio' | 'notebook' | null
type Card = { kind: string; selection: PdfOriginalSelection; text: string; busy?: boolean; saved?: boolean; id?: string; turns?: PdfOriginalCard['turns']; sourceRange?: { from: number; to: number }; sourceUnverified?: boolean; quizToken?: number; unitSource?: PdfOriginalUnitSource }
const filename = (title: string) => `${title.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || 'Notebook'} notebook.md`
const cardSourceRange = (data?: Record<string, unknown>): { from: number; to: number } | null => {
  const source = data?.source as { from?: unknown; to?: unknown } | undefined
  return Number.isSafeInteger(source?.from) && Number.isSafeInteger(source?.to)
    && (source?.from as number) > 0 && (source?.to as number) >= (source?.from as number)
    ? { from: source?.from as number, to: source?.to as number } : null
}
export const contentsPages = (count: number, current: number): number[] => {
  if (count <= 0) return []
  if (count <= 60) return Array.from({ length: count }, (_, index) => index + 1)
  const from = Math.max(1, current - 14), to = Math.min(count, current + 14)
  return [...new Set([1, ...Array.from({ length: to - from + 1 }, (_, index) => from + index), count])]
}
export const contentsUnitIndexes = (count: number, current: number): number[] => {
  if (count <= 40) return Array.from({ length: count }, (_, index) => index)
  const from = Math.max(0, current - 12), to = Math.min(count - 1, current + 12)
  return [...new Set([0, ...Array.from({ length: to - from + 1 }, (_, index) => from + index), count - 1])]
}

/** One source coordinate, PDF page/fraction, through original pages, settings, selection, and Notebook. */
export function PdfOriginalReaderShell({ title, bytes, initialPlace, onVisiblePlace, onDocument, onSelection, onOpenText, services, scanOutline, unitRules }: PdfOriginalReaderShellProps) {
  const [pane, setPane] = useState<Pane>(null)
  const [pages, setPages] = useState(0)
  const pageCount = useRef(0)
  const [place, setPlace] = useState<PdfOriginalPlace>(initialPlace ?? { page: 1, frac: 0 })
  const [endPage, setEndPage] = useState<number | null>(null)
  const visiblePage = useRef(place.page)
  const [requestedPlace, setRequestedPlace] = useState<PdfOriginalPlace | null>(null)
  const [pageText, setPageText] = useState<Record<number, string>>({})
  const [outline, setOutline] = useState<PdfOriginalOutlineEntry[]>([])
  const [rules, setRules] = useState<PdfOriginalUnitRules | null>(unitRules ?? null)
  const [selection, setSelection] = useState<PdfOriginalSelection | null>(null)
  const [selectionPoint, setSelectionPoint] = useState({ x: 160, y: 240 })
  const [barState, setBarState] = useState<'menu' | 'colors'>('menu')
  const [card, setCard] = useState<Card | null>(null)
  const [note, setNote] = useState('')
  const [question, setQuestion] = useState('')
  const [followDraft, setFollowDraft] = useState('')
  const [quizDraft, setQuizDraft] = useState('')
  const quizAnswer = useRef('')
  const quizToken = useRef(0)
  const pending = useRef<AbortController | null>(null)
  const cancelPending = () => { quizToken.current++; pending.current?.abort(); pending.current = null }
  const [status, setStatus] = useState('')
  const [undo, setUndo] = useState<{ id: string; restore: () => boolean | void } | null>(null)
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [revision, setRevision] = useState(0)
  const [filter, setFilter] = useState<'all' | 'mine' | 'ai'>('all')
  const [pageInput, setPageInput] = useState('')
  const [phone, setPhone] = useState(() => typeof matchMedia === 'function' && matchMedia('(max-width: 700px)').matches)
  const [prefs, setPrefs] = useState(() => readLabPrefs(phone ? 'phone' : 'desktop'))
  const [systemDark, setSystemDark] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches)
  const theme = prefs.theme === 'system' ? systemDark ? 'dark' : 'light' : prefs.theme
  const chooseTheme = (value: LabTheme) => { const next = { ...prefs, theme: value, darkMode: value === 'dark' }; setPrefs(next); writeLabPrefs(next, phone ? 'phone' : 'desktop') }
  useEffect(() => { if (typeof matchMedia !== 'function') return; const media = matchMedia('(max-width: 700px)'); const update = () => setPhone(media.matches); media.addEventListener?.('change', update); return () => media.removeEventListener?.('change', update) }, [])
  useEffect(() => setPrefs(readLabPrefs(phone ? 'phone' : 'desktop')), [phone])
  useEffect(() => { if (typeof matchMedia !== 'function') return; const media = matchMedia('(prefers-color-scheme: dark)'); const update = () => setSystemDark(media.matches); media.addEventListener?.('change', update); return () => media.removeEventListener?.('change', update) }, [])
  useEffect(() => { const root = document.documentElement, before = root.getAttribute('data-theme'), scheme = root.style.colorScheme; root.setAttribute('data-theme', theme); root.style.colorScheme = theme === 'dark' ? 'dark' : 'light'; return () => { if (before === null) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', before); root.style.colorScheme = scheme } }, [theme])
  useEffect(() => { if (unitRules) { setRules(unitRules); return }; let live = true; void loadPdfEngine().then(engine => { if (live) setRules(engine.margin ?? null) }).catch(() => {}); return () => { live = false } }, [unitRules])
  useEffect(() => services?.subscribe?.(() => setRevision(n => n + 1)), [services])
  useEffect(() => () => { quizToken.current++; pending.current?.abort() }, [])
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key !== 'Escape' || event.defaultPrevented) return; if (card) { cancelPending(); setCard(null) } else if (selection) setSelection(null); else if (pane) setPane(null); else return; event.preventDefault() }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close) }, [card, selection, pane])
  const currentText = pageText[place.page]?.trim() ?? ''
  const units = rules ? pdfOriginalUnits(rules, pages, outline, scanOutline) : []
  const unit = pdfUnitAt(units, place.page)
  const unitIndex = unit ? units.indexOf(unit) : 0
  const primerPages = unit ? pdfPrimerPages(unit) : []
  const catchupPages = rules && unit ? pdfCatchUpPages(rules, unit, place.page) : []
  const atUnitEnd = !!unit && unit.to === place.page && endPage === place.page
  const completeUnitPages = unit && atUnitEnd ? pdfCompleteUnitPages(unit) : []
  const pageSelection = (): PdfOriginalSelection => ({ page: place.page, text: currentText, rects: [] })
  const jump = (page: number, frac = 0) => { cancelPending(); const next = { page: Math.max(1, Math.min(pages || 1, page)), frac: Math.max(0, Math.min(1, frac)) }; setEndPage(null); setRequestedPlace(next); setPlace(next); setPane(null); setSelection(null); setCard(current => current?.saved ? current : null) }
  useEffect(() => { if (services?.audio?.playing && services.heardPage && services.heardPage !== place.page && services.heardPage <= pages) jump(services.heardPage) }, [services, services?.heardPage, services?.audio?.playing, place.page, pages])
  const run = async (kind: string, source: PdfOriginalSelection, question?: string) => {
    if (!services || !source.text.trim()) { setStatus(source.text.trim() ? 'This action is unavailable.' : 'There is no usable text on this page.'); return }
    if (kind === 'quiz') {
      if (!services.askQuizCheck) { setStatus('Quiz is unavailable.'); return }
      cancelPending()
      quizAnswer.current = ''; setQuizDraft(''); setPane(null); setSelection(null)
      setCard({ kind, selection: source, text: '', busy: true, quizToken: quizToken.current }); return
    }
    cancelPending()
    const controller = new AbortController()
    pending.current = controller
    setPane(null); setSelection(null); setCard({ kind, selection: source, text: '', busy: true })
    try {
      const answer = await services.ask(source, kind, question, controller.signal, delta => { if (!controller.signal.aborted) setCard(previous => previous?.selection === source ? { ...previous, text: delta } : previous) })
      if (controller.signal.aborted) return
      if (!answer?.trim()) { setCard(previous => previous?.selection === source ? { ...previous, text: 'No answer was returned.', busy: false } : previous); return }
      const options = question ? { question } : undefined
      const id = services.saveCardWithId?.(source, kind, answer, options) ?? null
      const saved = !!id || (!services.saveCardWithId && services.saveCard(source, kind, answer, options))
      setCard(previous => previous?.selection === source ? { ...previous, text: answer, busy: false, saved, id: id ?? undefined,
        turns: saved ? [{ role: 'user', content: question || source.text }, { role: 'assistant', content: answer }] : undefined } : previous)
      setRevision(n => n + 1)
    } catch { if (!controller.signal.aborted) setCard(previous => previous?.selection === source ? { ...previous, text: 'This answer could not be completed.', busy: false } : previous) }
    finally { if (pending.current === controller) pending.current = null }
  }
  const runUnit = async (action: PdfOriginalUnitAction, pageNumbers: number[]) => {
    if (!unit || !services?.getPageText || !services.askUnit || !services.saveUnitCard || !pageNumbers.length) return
    cancelPending()
    const controller = new AbortController()
    pending.current = controller
    const atPage = place.page
    const title = unit.title.trim() || `Pages ${unit.from}–${unit.to}`
    const sourceSelection: PdfOriginalSelection = { page: atPage, text: title, rects: [] }
    setPane(null); setSelection(null)
    setCard({ kind: action, selection: sourceSelection, text: '', busy: true })
    try {
      const extracted = await Promise.all(pageNumbers.map(async n => ({ n, text: await services.getPageText!(n) })))
      if (controller.signal.aborted) return
      // Keep complete page text and a contiguous source span; the provider limit must never silently crop a page.
      const ordered = action === 'catchup' ? [...extracted].reverse() : extracted
      const chosen: typeof extracted = []
      let chars = 0
      for (const page of ordered) {
        if (page.text.length > 6000 || chars + page.text.length > 36_000) break
        chosen.push(page); chars += page.text.length
      }
      const bounded = action === 'catchup' ? chosen.reverse() : chosen
      if (action !== 'catchup' && bounded.length !== extracted.length) {
        setCard(previous => previous?.selection === sourceSelection ? { ...previous, text: 'These pages contain more text than this action can safely send.', busy: false } : previous)
        return
      }
      if (!bounded.some(page => page.text.trim())) {
        const message = extracted.some(page => page.text.length > 6000) ? 'These pages contain more text than this action can safely send.' : 'There is no usable text in these original pages.'
        setCard(previous => previous?.selection === sourceSelection ? { ...previous, text: message, busy: false } : previous)
        return
      }
      const source: PdfOriginalUnitSource = { unit: { key: unit.key, title, from: unit.from, to: unit.to }, pages: bounded, atPage }
      setCard(previous => previous?.selection === sourceSelection ? { ...previous, sourceRange: { from: bounded[0].n, to: bounded[bounded.length - 1].n } } : previous)
      const answer = await services.askUnit(source, action, controller.signal, delta => { if (!controller.signal.aborted) setCard(previous => previous?.selection === sourceSelection ? { ...previous, text: delta } : previous) })
      if (controller.signal.aborted) return
      if (!answer?.trim()) { setCard(previous => previous?.selection === sourceSelection ? { ...previous, text: 'No answer was returned.', busy: false } : previous); return }
      const id = services.saveUnitCardWithId?.(source, action, answer) ?? null
      const saved = !!id || (!services.saveUnitCardWithId && services.saveUnitCard(source, action, answer))
      setCard(previous => previous?.selection === sourceSelection ? { ...previous, text: answer, busy: false, saved, id: id ?? undefined,
        turns: saved ? [{ role: 'user', content: action === 'primer' ? `Prepare me to read ${title}.` : action === 'catchup' ? `Catch me up before page ${atPage}.` : `Summarize ${title}.` }, { role: 'assistant', content: answer }] : undefined } : previous)
      setRevision(n => n + 1)
    } catch { if (!controller.signal.aborted) setCard(previous => previous?.selection === sourceSelection ? { ...previous, text: 'This answer could not be completed.', busy: false } : previous) }
    finally { if (pending.current === controller) pending.current = null }
  }
  const runUnitQuiz = async () => {
    if (!unit || !completeUnitPages.length || !services?.getPageText || !services.askUnitQuiz || !services.askUnitQuizCheck || !services.saveUnitQuizCardWithId) return
    cancelPending()
    const controller = new AbortController()
    pending.current = controller
    const token = quizToken.current, atPage = place.page
    const title = unit.title.trim() || `Pages ${unit.from}–${unit.to}`
    const sourceSelection: PdfOriginalSelection = { page: atPage, text: title, rects: [] }
    quizAnswer.current = ''; setQuizDraft(''); setPane(null); setSelection(null)
    setCard({ kind: 'unit-quiz-preparing', selection: sourceSelection, text: '', busy: true, quizToken: token })
    try {
      const extracted = await Promise.all(completeUnitPages.map(async n => ({ n, text: await services.getPageText!(n) })))
      if (controller.signal.aborted || token !== quizToken.current) return
      if (extracted.some(page => page.text.length > 6000) || extracted.reduce((sum, page) => sum + page.text.length, 0) > 36_000) {
        setCard(previous => previous?.selection === sourceSelection ? { ...previous, text: 'These pages contain more text than this action can safely send.', busy: false } : previous)
        return
      }
      if (!extracted.some(page => page.text.trim())) {
        setCard(previous => previous?.selection === sourceSelection ? { ...previous, text: 'There is no usable text in these original pages.', busy: false } : previous)
        return
      }
      const source: PdfOriginalUnitSource = { unit: { key: unit.key, title, from: unit.from, to: unit.to }, pages: extracted, atPage }
      setCard(previous => previous?.selection === sourceSelection ? { ...previous, kind: 'unit-quiz', busy: false, unitSource: source,
        sourceRange: { from: extracted[0].n, to: extracted[extracted.length - 1].n } } : previous)
    } catch { if (!controller.signal.aborted) setCard(previous => previous?.selection === sourceSelection ? { ...previous, text: 'This quiz could not be prepared.', busy: false } : previous) }
    finally { if (pending.current === controller) pending.current = null }
  }
  const openUnitNote = () => {
    if (!unit || !services?.saveUnitNote || !atUnitEnd) return
    setNote('')
    setCard({ kind: 'unit-note', selection: { page: unit.to, text: unit.title || `Pages ${unit.from}–${unit.to}`, rects: [] }, text: '',
      sourceRange: { from: unit.from, to: unit.to } })
  }
  const saveUnitNote = (sourceCard: Card) => {
    if (!unit || !services?.saveUnitNote || !note.trim() || sourceCard.selection.page !== unit.to) return
    const source = { unit: { key: unit.key, title: unit.title || `Pages ${unit.from}–${unit.to}`, from: unit.from, to: unit.to },
      atPage: unit.to, source: { from: unit.from, to: unit.to } }
    const id = services.saveUnitNote(source, note.trim())
    setCard(previous => previous?.selection === sourceCard.selection ? { ...previous, kind: 'unit-note-review', text: note.trim(),
      saved: !!id, id: id ?? undefined } : previous)
    if (id) setNote('')
    setRevision(n => n + 1)
  }
  const follow = async (from: Card, question: string) => {
    if (!from.id || !services?.askCardFollow || !services.appendCardTurn) return
    cancelPending()
    const controller = new AbortController()
    pending.current = controller
    setFollowDraft('')
    setCard(previous => previous && previous.id === from.id ? { ...previous, busy: true } : previous)
    try {
      const answer = await services.askCardFollow(from.id, question, controller.signal)
      if (controller.signal.aborted) return
      if (!answer?.trim()) { setStatus('This follow-up could not be completed.'); setCard(previous => previous && previous.id === from.id ? { ...previous, busy: false } : previous); return }
      const saved = services.appendCardTurn(from.id, question, answer)
      setCard(previous => previous && previous.id === from.id ? { ...previous, busy: false, saved,
        turns: [...(previous.turns ?? []), { role: 'user', content: question }, { role: 'assistant', content: answer }] } : previous)
      if (!saved) setStatus('This follow-up could not be saved.')
      setRevision(n => n + 1)
    } catch (error) { if (!controller.signal.aborted) { setStatus(error && typeof error === 'object' && 'code' in error && error.code === 'pdf_original_incomplete_source'
      ? 'The full source for this saved answer is unavailable. This follow-up was not sent.' : 'This follow-up could not be completed.'); setCard(previous => previous && previous.id === from.id ? { ...previous, busy: false } : previous) } }
    finally { if (pending.current === controller) pending.current = null }
  }
  const highlight = (color: HighlightColor, showPalette = false) => { if (!selection || !services) { setStatus('Highlights are unavailable.'); return }; setStatus(services.saveHighlight(selection, color) ? 'Highlight saved.' : 'Highlight could not be saved.'); if (showPalette) setBarState('colors'); else setSelection(null); setRevision(n => n + 1) }
  const saveNote = () => { if (!selection || !services || !note.trim()) return; setStatus(services.saveNote(selection, note.trim()) ? 'Note saved.' : 'Note could not be saved.'); setSelection(null); setCard(null); setNote(''); setRevision(n => n + 1) }
  void revision
  const allSaved = [
    ...(services?.marks ?? []).map(item => ({ id: item.id, kind: 'highlight' as const, page: item.page, text: item.text, note: item.note || '', at: item.at,
      turns: [] as PdfOriginalCard['turns'], rects: item.rects, sourceRange: null as { from: number; to: number } | null, label: item.note ? 'Note' : 'Highlight' })),
    ...(services?.cards ?? []).map(item => { const lead = item.kind === 'note' && item.turns[0]?.role === 'user' ? 0 : -1
      return { id: item.id, kind: 'card' as const, page: item.page, text: item.text,
        note: lead >= 0 ? item.turns[lead].content : '', at: item.at,
        turns: lead >= 0 ? item.turns.filter((_, index) => index !== lead) : item.turns,
        rects: item.rects ?? [], sourceRange: cardSourceRange(item.data), label: item.kind === 'note' ? 'Note' : item.kind } }),
    ...(services?.talkConversations ?? []).map(item => ({ id: item.id, kind: 'talk' as const, page: item.page, text: '', note: '', at: item.at,
      turns: item.turns, rects: [] as number[][], sourceRange: null as { from: number; to: number } | null, label: item.page === null ? 'Older private Talk · Source unverified · Saved on this device' : 'Talk · Saved on this device' })),
  ].filter(item => !hidden.has(item.kind + ':' + item.id)).sort((a, b) => b.at - a.at)
  const saved = allSaved.filter(item => filter === 'all' || (filter === 'mine') === (item.kind === 'highlight' || item.kind === 'card' && item.label === 'Note'))
  const exportMarkdown = () => ['# ' + title.replace(/[\r\n]/g, ' ') + ': notebook', '', `${allSaved.length} ${allSaved.length === 1 ? 'entry' : 'entries'}`,
    ...allSaved.flatMap(item => ['', `## ${item.label}${item.page === null ? '' : ` · Original PDF page ${item.page}`}`, ...(item.sourceRange ? [`Source · Original PDF pages ${item.sourceRange.from}–${item.sourceRange.to}`] : []), ...(item.text ? ['', ...item.text.split('\n').map(line => '> ' + line)] : []),
      ...(item.note ? ['', item.note] : []), ...item.turns.flatMap(turn => ['', `**${turn.role === 'assistant' ? 'A' : 'Q'}.** ${turn.content}`])])].join('\n') + '\n'
  const deleteEntry = (item: typeof saved[number]) => { if (item.kind === 'talk') return; const restore = item.kind === 'card' ? services?.removeCard(item.id) : services?.removeMark(item.id); if (!restore) { setStatus('This entry could not be deleted.'); return }; const id = item.kind + ':' + item.id; setHidden(current => new Set(current).add(id)); setUndo({ id, restore }); setStatus('Entry deleted.'); setRevision(n => n + 1) }
  const more = (id: DeskMoreId) => { if (!selection) return; if (id === 'copy') { void navigator.clipboard?.writeText(selection.text).then(() => setStatus('Passage copied.')).catch(() => setStatus('Copy failed.')); setSelection(null) } else if (['define', 'factcheck', 'counterpoint', 'quiz'].includes(id)) void run(id, selection) }
  return <div className={`lab pdf-original-reader ${phone ? 'is-phone' : 'is-desktop'} ${theme === 'dark' ? 'is-night' : ''} ${theme === 'book' ? 'is-book-theme' : ''}`} data-testid="lab-root" data-shared-reader="true" data-reader-ready="true" data-pdf-original="true" data-chrome-version="v2" data-theme={theme}>
    <header className="lab-header"><a className="lab-v2-library-back" href="/library?sharedReader=1" aria-label="Back to library">‹</a><div className="lab-header-brand"><h1 className="lab-header-work"><span className="lab-header-book">{title}</span></h1><span className="lab-title-sep" aria-hidden="true"> · </span><span className="lab-header-chapter">Original pages</span></div>
      <div className="pdf-original-reader__head-actions"><button onClick={() => setPane(pane === 'contents' ? null : 'contents')}>Contents</button><button onClick={() => setPane(pane === 'notebook' ? null : 'notebook')}>Notebook</button><button aria-label="Reading settings" onClick={() => setPane(pane === 'reading' ? null : 'reading')}>Aa</button><LabSuperButton open={pane === 'menu'} onToggle={() => setPane(pane === 'menu' ? null : 'menu')} reducedMotion /></div></header>
    {pane && <section className="pdf-original-reader__panel" role="dialog" aria-label={pane === 'menu' ? 'Reader menu' : pane === 'contents' ? 'Contents' : pane === 'reading' ? 'Reading settings' : pane === 'book' ? 'Book settings' : pane === 'audio' ? 'Audio settings' : 'Notebook'}>
      <div className="pdf-original-reader__panel-head"><strong>{pane === 'menu' ? 'Menu' : pane === 'contents' ? 'Contents' : pane === 'reading' ? 'Reading settings' : pane === 'book' ? 'Book settings' : pane === 'audio' ? 'Audio settings' : 'Notebook'}</strong><button onClick={() => setPane(null)} aria-label="Close panel">×</button></div>
      {pane === 'menu' && <div className="pdf-original-reader__menu"><button onClick={() => setPane('notebook')}>Notebook</button><button onClick={() => setPane('contents')}>Contents</button><button onClick={() => setPane('reading')}>Aa · Reading settings</button><button onClick={() => setPane('book')}>Book settings</button>{services?.audio && <button onClick={() => setPane('audio')}>Audio settings</button>}{currentText && services?.askUnit && services.getPageText && services.saveUnitCard && primerPages.length > 0 && <button onClick={() => void runUnit('primer', primerPages)}>Primer · {unit?.title || 'These pages'}</button>}{currentText && services?.askUnit && services.getPageText && services.saveUnitCard && catchupPages.length > 0 && <button onClick={() => void runUnit('catchup', catchupPages)}>Catch me up</button>}{currentText && <button onClick={() => void run('recap', pageSelection())}>Summarize this page</button>}{services?.listen && services.audio?.available && currentText && <button onClick={() => { services.listen?.(place.page, currentText); setPane(null) }}>Listen</button>}{services?.TalkCard && currentText && <button onClick={() => { setCard({ kind: 'talk', selection: pageSelection(), text: '' }); setPane(null) }}>Talk</button>}<a href="/library?sharedReader=1">Library</a><a href="/library?card=you&sharedReader=1">Profile</a></div>}
      {pane === 'contents' && <>{units.some(entry => entry.title.trim() && !entry.pages) && <div className="pdf-original-reader__unit-list" role="group" aria-label="Reading sections">{contentsUnitIndexes(units.length, unitIndex).map(index => { const entry = units[index], label = entry.title || `Pages ${entry.from}–${entry.to}`; return <button key={entry.key} aria-label={`${label} · page ${entry.start}`} aria-current={entry === unit ? 'location' : undefined} onClick={() => jump(entry.start)}><span>{label}</span><small>p. {entry.start}</small></button> })}</div>}<form className="pdf-original-reader__page-jump" onSubmit={event => { event.preventDefault(); const target = Number(pageInput); if (Number.isInteger(target) && target >= 1 && target <= pages) { jump(target); setPageInput('') } }}><label htmlFor="pdf-page-number">Go to page</label><input id="pdf-page-number" type="number" min="1" max={pages || undefined} value={pageInput} onChange={event => setPageInput(event.target.value)} /><button type="submit" disabled={!pageInput}>Go</button></form><div className="pdf-original-reader__page-list" role="group" aria-label="Original PDF pages">{contentsPages(pages, place.page).map(number => <button key={number} aria-current={place.page === number ? 'page' : undefined} onClick={() => jump(number)}>Page {number}</button>)}</div></>}
      {pane === 'reading' && <div className="pdf-original-reader__settings"><p>Original pages retain the PDF’s type and layout.</p><fieldset><legend>Theme</legend>{(['system', 'light', 'book', 'dark'] as const).map(value => <label key={value}><input type="radio" name="pdf-original-theme" checked={prefs.theme === value} onChange={() => chooseTheme(value)} />{value === 'book' ? 'Book' : value === 'dark' ? 'Dark' : value === 'system' ? 'System' : 'Light'}</label>)}</fieldset></div>}
      {pane === 'book' && <div className="pdf-original-reader__settings"><p>Reading edition</p><p aria-current="true">Original PDF pages</p>{onOpenText && <button onClick={() => onOpenText(place)}>Switch to Tinct text</button>}</div>}
      {pane === 'audio' && services?.audio && <div className="pdf-original-reader__settings"><label htmlFor="pdf-audio-speed">Narration speed</label><select id="pdf-audio-speed" value={services.audio.speed} onChange={event => { services.audio?.setSpeed(Number(event.target.value)); setRevision(n => n + 1) }}>{[.75, 1, 1.25, 1.5, 2].map(value => <option key={value} value={value}>{value}×</option>)}</select>{services.audio.playing && <button onClick={() => { services.audio?.pause(); setRevision(n => n + 1) }}>Pause</button>}{!services.audio.playing && services.audio.resume && <button onClick={() => { if (services.audio?.resume?.()) setPane(null) }}>Continue</button>}{!services.audio.available && <p>Audio is unavailable for this page.</p>}</div>}
      {pane === 'notebook' && <div className="pdf-original-reader__notebook">{!!services?.recoverableTalkCount && services.adoptRecoverableTalk && <div className="pdf-original-reader__recovery" role="status"><p>{services.recoverableTalkCount} older {services.recoverableTalkCount === 1 ? 'Talk conversation has' : 'Talk conversations have'} no account label. If {services.recoverableTalkCount === 1 ? 'it is' : 'they are'} yours, attach {services.recoverableTalkCount === 1 ? 'it' : 'them'} to this account and review {services.recoverableTalkCount === 1 ? 'it' : 'them'} here.</p><button onClick={() => { setStatus(services.adoptRecoverableTalk?.() ? 'Older Talk conversations attached to this account.' : 'Could not attach older Talk conversations.'); setRevision(n => n + 1) }}>Attach older Talk conversations</button></div>}<div className="pdf-original-reader__notebook-tools"><button onClick={() => { void navigator.clipboard?.writeText(exportMarkdown()).then(() => setStatus('Notebook copied.')).catch(() => setStatus('Copy failed.')) }}>Copy all</button><button onClick={() => { const url = URL.createObjectURL(new Blob([exportMarkdown()], { type: 'text/markdown;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = filename(title); document.body.append(a); a.click(); a.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 0) }}>Download</button></div><div className="pdf-original-reader__filters">{(['all', 'mine', 'ai'] as const).map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === 'mine' ? 'My notes' : value === 'ai' ? 'AI' : 'All'}</button>)}</div>{!saved.length && <p>No saved entries on these pages.</p>}{saved.map(item => <article key={item.kind + item.id} className="pdf-original-reader__saved"><div><button onClick={() => { if (item.page !== null) { const rect = item.rects.find(candidate => item.kind === 'highlight' ? candidate.length === 4 : candidate.length === 5 && candidate[0] === item.page); jump(item.page, rect?.[item.kind === 'highlight' ? 1 : 2] ?? 0) }; const answer = item.label === 'Note' && item.kind === 'card' && item.note ? item.note : item.kind === 'talk' ? item.turns.map(turn => `${turn.role === 'assistant' ? 'Tinct' : 'You'}: ${turn.content}`).join('\n\n') : item.turns.filter(turn => turn.role === 'assistant').map(turn => turn.content).join('\n\n'); if (answer) setCard({ kind: item.kind === 'talk' ? 'talk-review' : item.label === 'Note' ? item.note ? 'unit-note-review' : 'note-review-thread' : item.label === 'quiz' ? 'quiz-review' : item.label, selection: { page: item.page ?? place.page, text: item.text, rects: item.kind === 'card' ? item.rects as PdfOriginalSelection['rects'] : [] }, text: answer, saved: true, id: item.kind === 'card' ? item.id : undefined, turns: item.kind === 'card' ? item.turns : undefined, sourceUnverified: item.kind === 'talk' && item.page === null, sourceRange: item.sourceRange ?? undefined }) }}>{item.page === null ? item.label : `Original PDF page ${item.page} · ${item.label}`}</button>{item.kind !== 'talk' && <button onClick={() => deleteEntry(item)} aria-label={'Delete ' + item.label + ' on page ' + item.page}>Delete</button>}</div>{item.text && <blockquote>{item.text}</blockquote>}{item.sourceRange && <p>Source · Original PDF pages {item.sourceRange.from}–{item.sourceRange.to}</p>}{item.note && <p>{item.note}</p>}{item.turns.map((turn, index) => <div key={index} className="pdf-original-reader__saved-turn"><strong>{turn.role === 'assistant' ? 'A.' : 'Q.'}</strong> {turn.role === 'assistant' && (index === 0 || index === 1 && item.turns[0]?.role === 'user') ? <PdfOriginalAnswer kind={item.label} raw={turn.content} /> : turn.content}</div>)}</article>)}</div>}
    </section>}
    <main className="lab-body"><div className="lab-page-wrap"><PdfOriginalSurface bytes={bytes} initialPlace={initialPlace} requestedPlace={requestedPlace} highlights={services?.marks} follow={services?.follow} onVisiblePlace={next => { if (visiblePage.current !== next.page) { cancelPending(); setEndPage(null); setSelection(null); setBarState('menu'); setCard(current => current?.saved ? current : null) }; visiblePage.current = next.page; setPlace(next); onVisiblePlace(next) }} onDocument={count => { pageCount.current = count; setPages(count); onDocument?.(count) }} onOutline={setOutline} onPageEnd={(page, atEnd) => setEndPage(current => atEnd ? page : current === page ? null : current)} onPageText={(page, text) => { setPageText(current => current[page] === text ? current : { ...current, [page]: text }); services?.setPdfPageText?.(page, text, pageCount.current) }} onSelection={next => { const selected = window.getSelection(); const range = selected?.rangeCount ? selected.getRangeAt(0) : null; const rect = range && typeof range.getBoundingClientRect === 'function' ? range.getBoundingClientRect() : null; if (rect?.width) setSelectionPoint({ x: rect.left, y: rect.top }); setSelection(next); setBarState('menu'); onSelection?.(next); setStatus('') }} /></div></main>
    {unit && atUnitEnd && !selection && !card && <aside className="pdf-original-reader__unit-actions" aria-label={`After ${unit.title || 'these pages'}`}>
      <strong>After {unit.title || `pages ${unit.from}–${unit.to}`}</strong>
      {currentText && completeUnitPages.length > 0 && services?.getPageText && services.askUnit && services.saveUnitCard && <button onClick={() => void runUnit('recap', completeUnitPages)}>Recap</button>}
      {currentText && completeUnitPages.length > 0 && services?.getPageText && services.askUnitQuiz && services.askUnitQuizCheck && services.saveUnitQuizCardWithId && <button onClick={() => void runUnitQuiz()}>Quiz me</button>}
      {services?.saveUnitNote && <button onClick={openUnitNote}>Note</button>}
    </aside>}
    <button className="pdf-original-reader__reading-now" onClick={() => setPane('contents')}>Reading now · Page {place.page}{pages ? ` of ${pages}` : ''}</button>
    {selection && !phone && !card && <SelectionDeskBar sharedReader state={barState} color="gold" marked={barState === 'colors'} noted={false} moreRows={[[ 'define', 'factcheck', 'counterpoint', ...(services?.askQuizCheck ? ['quiz' as const] : []) ], ['copy']]} fallback={selectionPoint} onAsk={() => { setQuestion(''); setCard({ kind: 'ask-compose', selection, text: '' }) }} onAskQuestion={question => void run('ask', selection, question)} onExplain={() => void run('explain', selection)} onSimplify={() => void run('simplify', selection)} onMore={more} onHighlight={() => highlight('gold', true)} onSwatch={highlight} onNote={() => { setNote(''); setCard({ kind: 'note', selection, text: '' }) }} onRemove={() => setSelection(null)} />}
    {selection && phone && !card && <LabPhoneBar text={selection.text} fallbackX={selectionPoint.x} fallbackY={selectionPoint.y}
      onAsk={() => { setQuestion(''); setCard({ kind: 'ask-compose', selection, text: '' }) }}
      onExplain={() => void run('explain', selection)} onSimplify={() => void run('simplify', selection)}
      onMore={more} onHighlight={color => highlight(color)}
      onNote={() => { setNote(''); setCard({ kind: 'note', selection, text: '' }) }}
      onRemove={() => setSelection(null)} onDismiss={() => setSelection(null)} />}

    {card && <LabPhoneCard kind={card.kind} tall={card.kind === 'talk'} label={card.sourceUnverified ? 'Older private Talk · Source unverified' : `${card.kind === 'note' ? 'Note' : card.kind === 'ask-compose' ? 'Ask' : card.kind === 'talk' ? 'Talk' : card.kind} · Original PDF page ${card.selection.page}`} onClose={() => { cancelPending(); setCard(null); setSelection(null) }}>{card.kind === 'talk' && services?.TalkCard ? <services.TalkCard page={card.selection.page} text={card.selection.text} onClose={() => { cancelPending(); setCard(null) }} /> : <><blockquote>{card.selection.text}</blockquote>{card.sourceRange && <p className="pdf-original-reader__source-range">Source · Original PDF pages {card.sourceRange.from}–{card.sourceRange.to}</p>}{card.kind === 'unit-note' ? <form onSubmit={event => { event.preventDefault(); saveUnitNote(card) }}><label htmlFor="pdf-unit-note">Your note on this section</label><textarea id="pdf-unit-note" value={note} onChange={event => setNote(event.target.value)} /><button type="submit" disabled={!note.trim()}>Save note</button></form> : card.kind === 'note' ? <form onSubmit={event => { event.preventDefault(); saveNote() }}><label htmlFor="pdf-note">Your note</label><textarea id="pdf-note" value={note} onChange={event => setNote(event.target.value)} /><button type="submit" disabled={!note.trim()}>Save note</button></form> : card.kind === 'ask-compose' ? <form onSubmit={event => { event.preventDefault(); if (question.trim()) void run('ask', card.selection, question.trim()) }}><label htmlFor="pdf-question">Ask about this passage</label><input id="pdf-question" value={question} onChange={event => setQuestion(event.target.value)} /><button type="submit" disabled={!question.trim()}>Ask</button></form> : card.kind === 'unit-quiz' && card.unitSource ? <PhoneQuizBody request={async onDelta => { const controller = new AbortController(); pending.current = controller; try { const answer = await services?.askUnitQuiz?.(card.unitSource!, controller.signal, text => { if (!controller.signal.aborted && card.quizToken === quizToken.current) onDelta(text) }); if (!answer?.trim() || controller.signal.aborted || card.quizToken !== quizToken.current) throw new Error('Unit quiz unavailable'); quizAnswer.current = answer; return answer } finally { if (pending.current === controller) pending.current = null } }} mark={async (item, answer) => { const result = await services?.askUnitQuizCheck?.(card.unitSource!, { question: item.q, expected: item.answer, why: item.why, answer }); if (!result || card.quizToken !== quizToken.current) throw new Error('Unit quiz check unavailable'); return result }} draft={quizDraft} setDraft={setQuizDraft} onComplete={summary => { if (card.quizToken !== quizToken.current) return; const id = services?.saveUnitQuizCardWithId?.(card.unitSource!, summary, quizAnswer.current) ?? null; setCard(previous => previous?.selection === card.selection ? { ...previous, kind: 'quiz-review', text: summary, busy: false, saved: !!id, id: id ?? undefined } : previous); setRevision(n => n + 1) }} /> : card.kind === 'quiz' ? <PhoneQuizBody request={async onDelta => { pending.current?.abort(); const controller = new AbortController(); pending.current = controller; try { const answer = await services?.ask(card.selection, 'quiz', undefined, controller.signal, text => { if (!controller.signal.aborted && card.quizToken === quizToken.current) onDelta(text) }); if (!answer?.trim() || controller.signal.aborted || card.quizToken !== quizToken.current) throw new Error('Quiz unavailable'); quizAnswer.current = answer; return answer } finally { if (pending.current === controller) pending.current = null } }} mark={async (item, answer) => { const result = await services?.askQuizCheck?.(card.selection, { question: item.q, expected: item.answer, why: item.why, answer }); if (!result || card.quizToken !== quizToken.current) throw new Error('Quiz check unavailable'); return result }} draft={quizDraft} setDraft={setQuizDraft} onComplete={summary => { if (card.quizToken !== quizToken.current) return; const options = { data: { generatedQuiz: quizAnswer.current } }; const id = services?.saveCardWithId?.(card.selection, 'quiz', summary, options) ?? null; const saved = !!id || (!services?.saveCardWithId && services?.saveCard(card.selection, 'quiz', summary, options)) || false; setCard(previous => previous?.selection === card.selection ? { ...previous, kind: 'quiz-review', text: summary, busy: false, saved, id: id ?? undefined } : previous); setRevision(n => n + 1) }} /> : <>{card.busy && <p role="status">Writing…</p>}{card.kind === 'unit-note-review' ? <><p className="pdf-original-reader__note-prose">{card.text}</p>{card.turns?.length ? <div className="pdf-original-reader__thread">{card.turns.map((turn, index) => <div key={index}><strong>{turn.role === 'user' ? 'You' : 'Tinct'}</strong><LabInlineMarkdown>{turn.content}</LabInlineMarkdown></div>)}</div> : null}</> : card.turns?.length && !card.busy ? <div className="pdf-original-reader__thread">{card.turns.map((turn, index) => <div key={index}><strong>{turn.role === 'user' ? 'You' : 'Tinct'}</strong>{turn.role === 'assistant' && (index === 0 || index === 1 && card.turns?.[0]?.role === 'user') ? <PdfOriginalAnswer kind={card.kind} raw={turn.content} /> : <LabInlineMarkdown>{turn.content}</LabInlineMarkdown>}</div>)}</div> : <PdfOriginalAnswer kind={card.kind} raw={card.text} busy={card.busy} />}{card.saved === false && <p role="status">This answer could not be saved.</p>}{card.saved && card.id && card.kind !== 'unit-note-review' && services?.askCardFollow && services.appendCardTurn && <PhoneFollowField value={followDraft} onChange={setFollowDraft} onSend={text => void follow(card, text)} disabled={!!card.busy} />}</>}</>}</LabPhoneCard>}
    {status && <div className="pdf-original-reader__status" role="status">{status} {undo && <button onClick={() => { let restored: boolean | void; try { restored = undo.restore() } catch { restored = false }; if (restored === false) { setStatus('Could not restore entry.'); return }; setHidden(current => { const next = new Set(current); next.delete(undo.id); return next }); setUndo(null); setRevision(n => n + 1); setStatus('Entry restored.') }}>Undo</button>}</div>}
  </div>
}
