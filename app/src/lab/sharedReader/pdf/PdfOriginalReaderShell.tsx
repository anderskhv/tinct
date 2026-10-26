import type { PdfConversionProgress } from '../../userBook/pdfEdition'
import { flushSync } from 'react-dom'
import { LabContentsV2 } from '../../LabContentsV2'
import { ReaderNotebookIcon } from '../../ReaderNotebookIcon'
import { PdfBookSwitcher } from './PdfBookSwitcher'
import { useReadingScrollActivity } from '../useReadingScrollActivity'
import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import type { ChatConversation, HighlightColor } from '../../../types'
import { SelectionDeskBar, type DeskMoreId } from '../../../components/reader/SelectionDeskBar'
import { LabSuperMenu } from '../../LabSuperMenu.tsx'
import { labSuperMenuRows } from '../../labSuperMenu'
import { LabSuperButton } from '../../LabSuperButton'
import { LabInlineMarkdown } from '../../LabMarkdown'
import { PdfOriginalAnswer, pdfOriginalAnswerPreview } from './PdfOriginalAnswer'
import type { QuizTurn } from '../../../companion/companionRequest'
import { useLabDictation } from '../../useLabDictation'
import { SourceMarginRail, type SourceMarginEntry } from '../SourceMarginRail'
import { PdfFigureCardImage } from './PdfFigureTools'
import type { PdfRegionCapture } from './pdfOriginalFigures'
import type { PdfHeadingActions } from './pdfHeadingGeometry'
import { LabDesktopCard } from '../LabDesktopCard'
import type { CardBox } from '../desktopCardPlace'
import { LabPhoneCard } from '../../marginPhone/LabPhoneCard'
import { LabPhoneBar, lastHighlightColor } from '../../marginPhone/LabPhoneBar'
import { PhoneFollowField, PhoneQuizBody } from '../../marginPhone/LabPhoneCards'
import { readLabPrefs, writeLabPrefs, type LabTheme } from '../../labPrefs'
import { useReaderWindow } from '../../useReaderWindow'
import { LAB_V2_THEMES } from '../../labV2Sheet'
import { loadPdfEngine } from '../../userBook/pdfEdition'
import { type PdfOriginalOutlineEntry, type PdfOriginalPlace, type PdfOriginalSelection, type PdfOriginalSurfaceProps } from './PdfOriginalSurface'
import { PdfContinuousSurface } from './PdfContinuousSurface'
import { pdfCatchUpPages, pdfCompleteUnitPages, pdfOriginalUnits, pdfPrimerPages, pdfUnitAt, type PdfOriginalScanOutline, type PdfOriginalUnitRules } from './pdfOriginalUnits'
import '../../lab.css'
import './pdfOriginalReaderShell.css'

export type PdfOriginalMark = { id: string; page: number; text: string; rects: number[][]; color: string; note?: string; at: number; box?: boolean; kind?: string }
export type PdfOriginalCard = { id: string; page: number; text: string; kind: string; rects?: number[][]; turns: Array<{ role: 'user' | 'assistant'; content: string }>; at: number; data?: Record<string, unknown> }
export type PdfOriginalTalkConversation = { id: string; page: number | null; turns: PdfOriginalCard['turns']; at: number; localOnly: true }
export type PdfOriginalCardOptions = { question?: string; turns?: PdfOriginalCard['turns']; data?: Record<string, unknown> }
export type PdfOriginalQuizCheck = { question: string; expected: string; why?: string; answer: string; turns?: QuizTurn[] }
export type PdfOriginalUnitSource = { unit: { key: string; title: string; from: number; to: number }; pages: Array<{ n: number; text: string }>; atPage: number; anchor?: { page: number; frac: number } }
export type PdfOriginalUnitAction = 'primer' | 'catchup' | 'recap'
/** The owner-qualified service handles private geometry, storage, and companion requests. */
export interface PdfOriginalReaderServices {
  setPdfRegionCapture?: (capture: PdfRegionCapture | null) => void
  captureRegion?: PdfRegionCapture
  marks: PdfOriginalMark[]; cards: PdfOriginalCard[]; talkConversations?: PdfOriginalTalkConversation[]
  recoverableTalkCount?: number; adoptRecoverableTalk?: () => boolean
  audio?: { speed: number; setSpeed: (speed: number) => void; playing: boolean; pause: () => void; available: boolean; resume?: () => boolean }
  heardPage?: number | null
  follow?: PdfOriginalSurfaceProps['follow']
  subscribe?: (notify: () => void) => () => void
  saveHighlight: (selection: PdfOriginalSelection, color: HighlightColor) => boolean
  saveNote: (selection: PdfOriginalSelection, note: string) => boolean
  updateMarkNote?: (id: string, note: string) => boolean
  saveMarginNote?: (page: number, y: number, note: string, id?: string) => string | null
  dictation?: { getAuthToken: () => Promise<string | null> }
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
  saveUnitNote?: (source: { unit: PdfOriginalUnitSource['unit']; atPage: number; source: { from: number; to: number }; anchor?: { page: number; frac: number } }, note: string) => string | null
  setPdfPageText?: (page: number, text: string, pages: number) => void
  listen?: (page: number, text: string) => void
  TalkCard?: ComponentType<{ page: number; text: string; selectedText?: string; reference?: string; onClose: () => void }>
}
export interface PdfOriginalReaderShellProps extends Pick<PdfOriginalSurfaceProps, 'bytes' | 'initialPlace' | 'onVisiblePlace' | 'onDocument' | 'onSelection'> {
  bookId?: string
  owner?: string
  title: string
  onBeforeLeave?: (place: PdfOriginalPlace) => void
  onOpenText?: (place: PdfOriginalPlace) => void
  textAvailable?: boolean
  autoConvert?: boolean
  textProgress?: PdfConversionProgress
  textBusy?: boolean
  textError?: string
  initialZoom?: number
  onZoom?: (zoom: number) => void
  serviceStatus?: string
  onRetryServices?: () => void
  services?: PdfOriginalReaderServices
  scanOutline?: PdfOriginalScanOutline | null
  /** Injected only by focused tests; production loads the existing margin rules. */
  unitRules?: PdfOriginalUnitRules
}
type Pane = 'menu' | 'contents' | 'reading' | 'book' | 'audio' | 'notebook' | 'switcher' | null
type Card = { talkReference?: string; kind: string; selection: PdfOriginalSelection; text: string; busy?: boolean; saved?: boolean; id?: string; turns?: PdfOriginalCard['turns']; sourceRange?: { from: number; to: number }; sourceUnverified?: boolean; quizToken?: number; unitSource?: PdfOriginalUnitSource; noteUnit?: { key: string; title: string; from: number; to: number }; freeY?: number; markId?: string }
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

/** Project saved source geometry through the current sheet bounds, including after scroll or zoom. */
export function pdfSelectionAnchor(selection: PdfOriginalSelection, page: CardBox, viewport: CardBox, wholePage = false): CardBox | null {
  const width = page.right - page.left, height = page.bottom - page.top
  if (width <= 0 || height <= 0) return null
  const rects = selection.rects.filter(rect => rect[0] === selection.page && rect.slice(1).every(Number.isFinite)
    && rect[1] >= 0 && rect[1] < 1 && rect[2] >= 0 && rect[2] < 1 && rect[3] > 0 && rect[4] > 0)
  const boxes = rects.map(([, x, y, w, h]) => ({ left: page.left + x * width, right: page.left + Math.min(1, x + w) * width,
    top: page.top + y * height, bottom: page.top + Math.min(1, y + h) * height }))
    .filter(box => box.bottom > viewport.top && box.top < viewport.bottom && box.right > viewport.left && box.left < viewport.right)
  if (selection.rects.length && !boxes.length) return null
  if (!boxes.length) {
    if (page.bottom <= viewport.top || page.top >= viewport.bottom || page.right <= viewport.left || page.left >= viewport.right) return null
    const top = Math.max(page.top, viewport.top)
    return { left: page.left, right: page.right, top, bottom: Math.min(page.bottom, viewport.bottom, top + 24) }
  }
  return { left: wholePage ? page.left : Math.max(viewport.left, Math.min(...boxes.map(box => box.left))),
    right: wholePage ? page.right : Math.min(viewport.right, Math.max(...boxes.map(box => box.right))),
    top: Math.max(viewport.top, Math.min(...boxes.map(box => box.top))), bottom: Math.min(viewport.bottom, Math.max(...boxes.map(box => box.bottom))) }
}

/** One source coordinate, PDF page/fraction, through original pages, settings, selection, and Notebook. */
export function PdfOriginalReaderShell({ title, bookId = 'pdf-original', owner, onBeforeLeave, bytes, initialPlace, onVisiblePlace, onDocument, onSelection, onOpenText, textAvailable = false, textBusy = false, autoConvert = false, textProgress, textError, initialZoom = 1, onZoom, services, serviceStatus, onRetryServices, scanOutline, unitRules }: PdfOriginalReaderShellProps) {
  const root = useRef<HTMLDivElement>(null)
  const [scrollHost, setScrollHost] = useState<HTMLElement | null>(null)
  const [pane, setPane] = useState<Pane>(null)
  const panelRef = useReaderWindow<HTMLElement>('settings', !!pane && pane !== 'menu' && pane !== 'contents' && pane !== 'switcher')
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
  const [highlightColor, setHighlightColor] = useState<HighlightColor>(lastHighlightColor)
  const [highlightedSelection, setHighlightedSelection] = useState<PdfOriginalSelection | null>(null)
  const [barState, setBarState] = useState<'menu' | 'colors'>('menu')
  const [card, setCard] = useState<Card | null>(null)
  const [note, setNote] = useState('')
  const [foldedDraft, setFoldedDraft] = useState<{ card: Card; note: string; question: string; follow: string } | null>(null)
  const noteDrafts = useRef(new Map<string, string>())
  const followDrafts = useRef(new Map<string, string>())
  const [question, setQuestion] = useState('')
  const [followDraft, setFollowDraft] = useState('')
  const dictation = useLabDictation('own-pdf', setFollowDraft, { signedIn: !!services?.dictation, getAuthToken: () => services?.dictation?.getAuthToken(), getKeyterms: () => [], language: 'en' })
  useEffect(() => { if (dictation.notice) setStatus(dictation.notice) }, [dictation.notice])
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
  const [pageZoom, setPageZoom] = useState(initialZoom)
  const [pageZoomLimit, setPageZoomLimit] = useState(3)
  const [phone, setPhone] = useState(() => typeof matchMedia === 'function' && matchMedia('(max-width: 700px)').matches)
  const readingScrollActive = useReadingScrollActivity(scrollHost, !phone)
  const [prefs, setPrefs] = useState(() => readLabPrefs(phone ? 'phone' : 'desktop'))
  const [systemDark, setSystemDark] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches)
  const theme = prefs.theme === 'system' ? systemDark ? 'dark' : 'light' : prefs.theme
  const chooseTheme = (value: LabTheme) => { const next = { ...prefs, theme: value, darkMode: value === 'dark' }; setPrefs(next); writeLabPrefs(next, phone ? 'phone' : 'desktop') }
  useEffect(() => { if (typeof matchMedia !== 'function') return; const media = matchMedia('(max-width: 700px)'); const update = () => setPhone(media.matches); media.addEventListener?.('change', update); return () => media.removeEventListener?.('change', update) }, [])
  useEffect(() => setPrefs(readLabPrefs(phone ? 'phone' : 'desktop')), [phone])
  useEffect(() => { if (typeof matchMedia !== 'function') return; const media = matchMedia('(prefers-color-scheme: dark)'); const update = () => setSystemDark(media.matches); media.addEventListener?.('change', update); return () => media.removeEventListener?.('change', update) }, [])
  useEffect(() => { const root = document.documentElement, before = root.getAttribute('data-theme'), scheme = root.style.colorScheme; root.setAttribute('data-theme', theme); root.style.colorScheme = theme === 'dark' ? 'dark' : 'light'; return () => { if (before === null) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', before); root.style.colorScheme = scheme } }, [theme])
  useEffect(() => { if (unitRules) { setRules(unitRules); return }; let live = true; void loadPdfEngine().then(engine => { if (live) setRules(engine.margin ?? null) }).catch(() => {}); return () => { live = false } }, [unitRules])
  useEffect(() => {
    if (!selection) return
    const dismiss = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element) || target.closest('[role=toolbar], [role=menu], .lab-pcard, .lab-dbar, .lab-phone-bar')) return
      setSelection(null); setBarState('menu')
    }
    document.addEventListener('pointerdown', dismiss, true)
    return () => document.removeEventListener('pointerdown', dismiss, true)
  }, [selection])
  useEffect(() => services?.subscribe?.(() => setRevision(n => n + 1)), [services])
  useEffect(() => () => { quizToken.current++; pending.current?.abort() }, [])
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing || event.keyCode === 229) return; if (pane) setPane(null); else if (card) { cancelPending(); if (phone) setCard(null); else minimiseCard() } else if (selection) setSelection(null); else if (pane) setPane(null); else return; event.preventDefault() }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close) }, [card, selection, pane])
  const currentText = pageText[place.page]?.trim() ?? ''
  const units = useMemo(() => rules ? pdfOriginalUnits(rules, pages, outline, scanOutline) : [], [rules, pages, outline, scanOutline])
  const unit = pdfUnitAt(units, place.page)
  const unitIndex = unit ? units.indexOf(unit) : 0
  const chapterTitle = unit && !unit.pages && unit.title.trim() ? unit.title : `Page ${place.page}`
  const openTextLabel = textBusy ? 'Converting…' : textAvailable ? 'Tinct book' : 'Convert to Tinct book'
  const conversionRequested = useRef(false)
  useEffect(() => {
    if (!autoConvert || conversionRequested.current || !onOpenText) return
    conversionRequested.current = true
    setPane('reading')
    void onOpenText(place)
  }, [autoConvert, onOpenText, place])
  const conversionStatus = textBusy && <div className="pdf-original-reader__conversion" role="status"><p>{textProgress?.stage === 'text' ? `Preparing pages ${textProgress.done ?? 0} of ${textProgress.total ?? pages}` : ({ loading: 'Opening the PDF…', scanning: 'Checking the text and chapters…', images: 'Preparing illustrations…', saving: 'Saving your Tinct book…' }[textProgress?.stage ?? 'loading'])}</p><progress aria-label="Conversion progress" {...(textProgress?.stage === 'text' && textProgress.total ? { max: textProgress.total, value: textProgress.done ?? 0 } : {})} /></div>
  const primerPages = unit ? pdfPrimerPages(unit) : []
  const catchupPages = rules && unit ? pdfCatchUpPages(rules, unit, place.page) : []
  const atUnitEnd = !!unit && unit.to === place.page && endPage === place.page
  const completeUnitPages = unit && atUnitEnd ? pdfCompleteUnitPages(unit) : []
  const pageSelection = (): PdfOriginalSelection => ({ page: place.page, text: currentText, rects: [] })
  const jump = (page: number, frac = 0) => { cancelPending(); const next = { page: Math.max(1, Math.min(pages || 1, page)), frac: Math.max(0, Math.min(1, frac)) }; setEndPage(null); setRequestedPlace(next); setPlace(next); setPane(null); setSelection(null); setCard(current => current?.saved ? current : null) }
  useEffect(() => { if (services?.audio?.playing && services.heardPage && services.heardPage !== place.page && services.heardPage <= pages) jump(services.heardPage) }, [services, services?.heardPage, services?.audio?.playing, place.page, pages])
  const run = async (kind: string, source: PdfOriginalSelection, question?: string) => {
    if (!services || !source.text.trim()) { setStatus(source.text.trim() ? serviceStatus || 'This action is unavailable.' : 'There is no usable text on this page.'); return }
    if (kind === 'quiz') {
      if (!services.askQuizCheck) { setStatus('Quiz is unavailable.'); return }
      cancelPending()
      quizAnswer.current = ''; setQuizDraft(''); setPane(null); setSelection(null)
      setCard({ kind, selection: source, text: '', busy: true, quizToken: quizToken.current }); return
    }
    cancelPending()
    const controller = new AbortController()
    pending.current = controller
    const freeY = card?.selection === source ? card.freeY : undefined
    setPane(null); setSelection(null); setCard({ kind, selection: source, text: '', busy: true, ...(freeY !== undefined ? { freeY } : {}) })
    try {
      const answer = await services.ask(source, kind, question, controller.signal, delta => { if (!controller.signal.aborted) setCard(previous => previous?.selection === source ? { ...previous, text: delta } : previous) })
      if (controller.signal.aborted) return
      if (!answer?.trim()) { setCard(previous => previous?.selection === source ? { ...previous, text: 'No answer was returned.', busy: false } : previous); return }
      const options = source.region ? { question: question || `Explain this ${source.region.kind}.`, data: { region: source.region.kind === 'equation' ? 'formula' : 'figure', label: source.region.label, caption: source.region.caption } } : question ? { question } : undefined
      const savedKind = source.region ? 'figure' : kind
      let id = services.saveCardWithId?.(source, savedKind, answer, options) ?? null
      const saved = !!id || (!services.saveCardWithId && services.saveCard(source, savedKind, answer, options))
      if (saved && !id) id = services.cards.find(item => item.page === source.page && item.text === source.text && item.kind === kind && item.turns.some(turn => turn.role === 'assistant' && turn.content === answer))?.id ?? null
      setCard(previous => previous?.selection === source ? { ...previous, text: answer, busy: false, saved, id: id ?? undefined,
        turns: saved ? [{ role: 'user', content: question || source.text }, { role: 'assistant', content: answer }] : undefined } : previous)
      setRevision(n => n + 1)
    } catch { if (!controller.signal.aborted) setCard(previous => previous?.selection === source ? { ...previous, text: 'This answer could not be completed.', busy: false } : previous) }
    finally { if (pending.current === controller) pending.current = null }
  }
  const runUnit = async (action: PdfOriginalUnitAction, pageNumbers: number[], targetUnit = unit, sourceAnchor?: PdfOriginalSelection) => {
    const unit = targetUnit
    const cached = services?.cards.find(item => item.data?.action === action && (item.data?.unit as { key?: string } | undefined)?.key === unit?.key)
    if (cached) { openSavedCard(cached); return }
    if (!unit || !services?.getPageText || !services.askUnit || !services.saveUnitCard || !pageNumbers.length) return
    cancelPending()
    const controller = new AbortController()
    pending.current = controller
    const atPage = sourceAnchor?.page ?? place.page
    const title = unit.title.trim() || `Pages ${unit.from}–${unit.to}`
    const sourceSelection: PdfOriginalSelection = sourceAnchor ?? { page: atPage, text: title, rects: [] }
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
      const source: PdfOriginalUnitSource = { unit: { key: unit.key, title, from: unit.from, to: unit.to }, pages: bounded, atPage, ...(sourceAnchor ? { anchor: { page: sourceAnchor.page, frac: sourceAnchor.rects[0]?.[2] ?? 0 } } : {}) }
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
  const runUnitQuiz = async (targetUnit = unit, sourceAnchor?: PdfOriginalSelection) => {
    const unit = targetUnit
    const completeUnitPages = unit ? pdfCompleteUnitPages(unit) : []
    const cached = services?.cards.find(item => item.data?.action === 'quiz' && (item.data.unit as { key?: string } | undefined)?.key === unit?.key)
    if (cached) { openSavedCard(cached); return }
    if (!unit || !completeUnitPages.length || !services?.getPageText || !services.askUnitQuiz || !services.askUnitQuizCheck || !services.saveUnitQuizCardWithId) return
    cancelPending()
    const controller = new AbortController()
    pending.current = controller
    const token = quizToken.current, atPage = unit.to
    const title = unit.title.trim() || `Pages ${unit.from}–${unit.to}`
    const sourceSelection: PdfOriginalSelection = sourceAnchor ?? { page: atPage, text: title, rects: [] }
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
      const source: PdfOriginalUnitSource = { unit: { key: unit.key, title, from: unit.from, to: unit.to }, pages: extracted, atPage, ...(sourceAnchor ? { anchor: { page: sourceAnchor.page, frac: sourceAnchor.rects[0]?.[2] ?? 0 } } : {}) }
      setCard(previous => previous?.selection === sourceSelection ? { ...previous, kind: 'unit-quiz', busy: false, unitSource: source,
        sourceRange: { from: extracted[0].n, to: extracted[extracted.length - 1].n } } : previous)
    } catch { if (!controller.signal.aborted) setCard(previous => previous?.selection === sourceSelection ? { ...previous, text: 'This quiz could not be prepared.', busy: false } : previous) }
    finally { if (pending.current === controller) pending.current = null }
  }
  const openUnitNote = (targetUnit = unit, sourceAnchor?: PdfOriginalSelection) => {
    if (!targetUnit || !services?.saveUnitNote) return
    const cached = services.cards.find(item => item.data?.action === 'note' && (item.data.unit as { key?: string } | undefined)?.key === targetUnit.key)
    if (cached) { openSavedCard(cached); return }
    setNote(''); setPane(null); setSelection(null)
    setCard({ kind: 'unit-note', selection: sourceAnchor ?? { page: targetUnit.to, text: targetUnit.title || `Pages ${targetUnit.from}–${targetUnit.to}`, rects: [] }, text: '',
      noteUnit: { key: targetUnit.key, title: targetUnit.title || `Pages ${targetUnit.from}–${targetUnit.to}`, from: targetUnit.from, to: targetUnit.to }, sourceRange: { from: targetUnit.from, to: targetUnit.to } })
  }
  const persistNote = (sourceCard: Card, value: string): string | null => {
    if (!services) return null
    let id = sourceCard.id ?? null
    if (sourceCard.kind === 'margin-note' && services.saveMarginNote) id = services.saveMarginNote(sourceCard.selection.page, sourceCard.freeY ?? 0, value, sourceCard.id)
    else if (sourceCard.kind === 'unit-note' && sourceCard.noteUnit && services.saveUnitNote) id = services.saveUnitNote({ unit: sourceCard.noteUnit, atPage: sourceCard.noteUnit.to,
      source: { from: sourceCard.noteUnit.from, to: sourceCard.noteUnit.to }, ...(sourceCard.selection.rects.length ? { anchor: { page: sourceCard.selection.page, frac: sourceCard.selection.rects[0][2] } } : {}) }, value)
    else if (sourceCard.kind === 'note') {
      const saved = sourceCard.markId && services.updateMarkNote ? services.updateMarkNote(sourceCard.markId, value) : value.trim() ? services.saveNote(sourceCard.selection, value.trim()) : true
      if (!saved) return null
      const mark = sourceCard.markId ? services.marks.find(mark => mark.id === sourceCard.markId) : services.marks.find(mark => mark.page === sourceCard.selection.page && mark.text === sourceCard.selection.text && mark.note === value.trim())
      id = mark?.id ?? null
      setCard(previous => previous?.selection === sourceCard.selection ? { ...previous, markId: id ?? undefined, saved: !!id, text: value } : previous)
    }
    if (sourceCard.kind !== 'note') setCard(previous => previous?.selection === sourceCard.selection ? { ...previous, id: id ?? undefined, saved: !!id, text: value } : previous)
    setRevision(n => n + 1)
    return id
  }
  const saveUnitNote = (sourceCard: Card) => { const id = persistNote(sourceCard, note); if (id) { setCard(null); setNote('') } }
  useEffect(() => {
    if (phone || !card || !['note', 'unit-note', 'margin-note'].includes(card.kind)) return
    const timer = setTimeout(() => { if (note.trim() && note !== card.text) persistNote(card, note) }, 400)
    return () => clearTimeout(timer)
  }, [phone, note, card?.kind, card?.id, card?.markId, card?.selection, card?.text])
  const minimiseCard = () => {
    dictation.stop()
    if (card?.id) followDrafts.current.set(card.id, followDraft)
    if (card && ['note', 'unit-note', 'margin-note'].includes(card.kind)) {
      const id = card.id ?? card.markId
      const saved = (!note.trim() && !card.id && !card.markId) || (note === card.text && !!card.saved) || !!persistNote(card, note)
      if (id) { if (saved) noteDrafts.current.delete(id); else noteDrafts.current.set(id, note) }
      if (!saved && !id) setFoldedDraft({ card, note, question, follow: followDraft })
    } else if (card && !card.saved && !card.id && !card.busy && !['talk', 'quiz', 'unit-quiz'].includes(card.kind)) {
      setFoldedDraft({ card, note, question, follow: followDraft })
    }
    setCard(null); setSelection(null)
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
  const highlight = (color: HighlightColor, keepSelection = false) => {
    if (!selection || !services) { setStatus(serviceStatus || 'Highlights are unavailable.'); return }
    const saved = services.saveHighlight(selection, color)
    setStatus(saved ? 'Highlight saved.' : 'Highlight could not be saved.')
    if (saved) {
      setHighlightColor(color); setHighlightedSelection(selection)
      // Keep the source-coordinate selection for its toolbar, but reveal the
      // saved ink immediately instead of covering it with native blue paint.
      window.getSelection()?.removeAllRanges()
      try { localStorage.setItem('tinct-highlight-color', color) } catch { /* private mode */ }
      if (!keepSelection) setSelection(null)
    }
    setRevision(n => n + 1)
  }
  const saveNote = () => { if (!card || !services || !note.trim()) return; const saved = card.markId ? persistNote(card, note) : services.saveNote(card.selection, note.trim()); setStatus(saved ? 'Note saved.' : 'Note could not be saved.'); setSelection(null); setCard(null); setNote('') }
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
  const sourceAnchor = (source: PdfOriginalSelection | null, wholePage = false, inRail = false): CardBox | null => {
    if (!source) return null
    const page = root.current?.querySelector<HTMLElement>(`.pdf-original__page[data-page="${source.page}"], .pdf-original__slot[data-page="${source.page}"]`)
    const viewport = root.current?.querySelector<HTMLElement>('.pdf-original__scroll')
    if (!page || !viewport) return null
    const frame = viewport.getBoundingClientRect()
    return pdfSelectionAnchor(source, page.getBoundingClientRect(), inRail ? { left: frame.left, right: frame.right, top: -Number.MAX_VALUE, bottom: Number.MAX_VALUE } : frame, wholePage)
  }
  // The quotation already identifies this source; keep real questions and later turns.
  const cardTurns = card?.turns?.filter((turn, index) => !(index === 0 && turn.role === 'user'
    && turn.content.replace(/\s+/g, ' ').trim() === card.selection.text.replace(/\s+/g, ' ').trim()))
  const openSavedCard = (item: PdfOriginalCard) => {
    const point = item.data?.sourceAnchor as { page?: number; frac?: number } | undefined
    const source: PdfOriginalSelection = { page: point?.page ?? item.page, text: item.text, rects: item.rects as PdfOriginalSelection['rects'] ?? [] }
    const figureRect = item.kind === 'figure' ? source.rects[0] : null
    if (figureRect && services?.captureRegion) source.region = { kind: item.data?.region === 'formula' ? 'equation' : 'figure', label: String(item.data?.label || ''), caption: String(item.data?.caption || item.text), identity: services.captureRegion, image: () => services.captureRegion!(figureRect[0], { x: figureRect[1], y: figureRect[2], w: figureRect[3], h: figureRect[4] }) }
    const free = item.data?.free as { y?: number } | undefined
    if ((point || free) && !source.rects.length) source.rects = [[source.page, .1, free?.y ?? point?.frac ?? 0, .001, .001]]
    if (item.kind === 'note') {
      const value = item.turns.find(turn => turn.role === 'user')?.content ?? ''
      setNote(noteDrafts.current.get(item.id) ?? value)
      setCard({ id: item.id, kind: item.data?.free ? 'margin-note' : 'unit-note', selection: source, text: value, saved: true,
        freeY: (item.data?.free as { y?: number } | undefined)?.y, noteUnit: item.data?.unit as Card['noteUnit'], turns: item.turns, sourceRange: cardSourceRange(item.data) ?? undefined })
    } else setCard({ id: item.id, kind: item.kind === 'quiz' ? 'quiz-review' : item.kind, selection: source, text: item.turns.filter(turn => turn.role === 'assistant').map(turn => turn.content).join('\n\n'),
      turns: item.turns, saved: true, sourceRange: cardSourceRange(item.data) ?? undefined })
    setPane(null); setSelection(null); setFollowDraft(followDrafts.current.get(item.id) ?? '')
  }
  const openSavedMark = (item: PdfOriginalMark) => {
    const source: PdfOriginalSelection = { page: item.page, text: item.text, rects: item.rects.map(rect => [item.page, ...rect] as [number, number, number, number, number]) }
    if (item.note) { setNote(noteDrafts.current.get(item.id) ?? item.note); setCard({ kind: 'note', selection: source, text: item.note, markId: item.id, saved: true }) }
    else { setCard(null); setSelection(source); setHighlightedSelection(source); setHighlightColor(item.color as HighlightColor); setBarState('colors') }
  }
  const headingActions: PdfHeadingActions[] = units.filter(unit => !unit.matter && unit.title.trim()).map((target, index) => ({ key: target.key, title: target.title, page: target.start,
    actions: [{ id: 'primer', label: 'Primer' }, ...(index ? [{ id: 'catchup' as const, label: 'Catch me up' }] : []), { id: 'recap', label: 'Recap' }, { id: 'quiz', label: 'Quiz me' }, { id: 'note', label: 'Note' }],
    onAction: (action, source) => {
      if (action === 'note') openUnitNote(target, source)
      else if (action === 'quiz') void runUnitQuiz(target, source)
      else { const numbers = action === 'primer' ? pdfPrimerPages(target) : action === 'catchup' && rules ? pdfCatchUpPages(rules, target, target.start) : pdfCompleteUnitPages(target); void runUnit(action, numbers, target, source) }
    } }))
  const ReaderCard = phone ? LabPhoneCard : LabDesktopCard
  const more = (id: DeskMoreId) => { if (!selection) return; if (id === 'copy') { void navigator.clipboard?.writeText(selection.text).then(() => setStatus('Passage copied.')).catch(() => setStatus('Copy failed.')); setSelection(null) } else if (['define', 'factcheck', 'counterpoint', 'quiz'].includes(id)) void run(id, selection) }
  const followField = card && <PhoneFollowField value={followDraft} onChange={setFollowDraft} onSend={text => void follow(card, text)} disabled={!!card.busy} onMic={services?.dictation ? () => { services.audio?.pause(); dictation.toggle(followDraft) } : undefined} micOn={dictation.state === 'starting' || dictation.state === 'listening'} onTalk={services?.TalkCard ? () => { dictation.stop(); setCard({ kind: 'talk', selection: card.selection, text: '', talkReference: [card.selection.region ? `Focused figure: ${card.selection.region.label || card.selection.region.kind}. Caption: ${card.selection.region.caption}. The image is not provided to this voice session.` : `Focused passage: ${card.selection.text}`, ...(card.turns ?? []).slice(-8).map(turn => `${turn.role}: ${turn.content}`)].join('\n') }) } : undefined} />
  const activeCardBody = card && <ReaderCard {...(!phone && card.kind !== 'talk' ? { embedded: true, getAnchor: () => sourceAnchor(card.selection, true) } : {})} kind={card.kind} tall={card.kind === 'talk'} label={card.sourceUnverified ? 'Older private Talk · Source unverified' : `${card.kind === 'note' ? 'Note' : card.kind === 'ask-compose' ? 'Ask' : card.kind === 'talk' ? 'Talk' : card.kind} · Original PDF page ${card.selection.page}`} onClose={() => { cancelPending(); setCard(null); setSelection(null) }}>{card.kind === 'talk' && services?.TalkCard ? <services.TalkCard page={card.selection.page} text={pageText[card.selection.page] || card.selection.text} selectedText={card.selection.text} reference={card.talkReference} onClose={() => { cancelPending(); setCard(null) }} /> : <><span className="lab-visually-hidden">{card.selection.text}</span>{card.selection.region && <PdfFigureCardImage source={card.selection} />}{card.sourceRange && <p className="pdf-original-reader__source-range">Source · Original PDF pages {card.sourceRange.from}–{card.sourceRange.to}</p>}{card.kind === 'unit-note' || card.kind === 'margin-note' ? <form onSubmit={event => { event.preventDefault(); saveUnitNote(card) }}><label htmlFor="pdf-unit-note">Your note on this section</label><textarea onBlur={event => { if (!phone && !(event.relatedTarget as HTMLElement | null)?.closest('button[type="submit"]')) { if (note.trim()) persistNote(card, note); else minimiseCard() } }} id="pdf-unit-note" value={note} onChange={event => setNote(event.target.value)} /><button type="submit" disabled={!note.trim()}>Save note</button></form> : card.kind === 'note' ? <form onSubmit={event => { event.preventDefault(); saveNote() }}><label htmlFor="pdf-note">Your note</label><textarea onBlur={event => { if (!phone && !(event.relatedTarget as HTMLElement | null)?.closest('button[type="submit"]')) { if (note.trim()) persistNote(card, note); else minimiseCard() } }} id="pdf-note" value={note} onChange={event => setNote(event.target.value)} /><button type="submit" disabled={!note.trim()}>Save note</button></form> : card.kind === 'ask-compose' ? <form onSubmit={event => { event.preventDefault(); if (question.trim()) void run('ask', card.selection, question.trim()) }}><label htmlFor="pdf-question">{card.freeY !== undefined ? 'Ask about this page' : 'Ask about this passage'}</label><input id="pdf-question" value={question} onChange={event => setQuestion(event.target.value)} /><button type="submit" disabled={!question.trim()}>Ask</button></form> : card.kind === 'unit-quiz' && card.unitSource ? <PhoneQuizBody request={async onDelta => { const controller = new AbortController(); pending.current = controller; try { const answer = await services?.askUnitQuiz?.(card.unitSource!, controller.signal, text => { if (!controller.signal.aborted && card.quizToken === quizToken.current) onDelta(text) }); if (!answer?.trim() || controller.signal.aborted || card.quizToken !== quizToken.current) throw new Error('Unit quiz unavailable'); quizAnswer.current = answer; return answer } finally { if (pending.current === controller) pending.current = null } }} mark={async (item, answer, turns) => { const result = await services?.askUnitQuizCheck?.(card.unitSource!, { question: item.q, expected: item.answer, why: item.why, answer, turns }); if (!result || card.quizToken !== quizToken.current) throw new Error('Unit quiz check unavailable'); return result }} draft={quizDraft} setDraft={setQuizDraft} onComplete={summary => { if (card.quizToken !== quizToken.current) return; const id = services?.saveUnitQuizCardWithId?.(card.unitSource!, summary, quizAnswer.current) ?? null; setCard(previous => previous?.selection === card.selection ? { ...previous, kind: 'quiz-review', text: summary, busy: false, saved: !!id, id: id ?? undefined } : previous); setRevision(n => n + 1) }} /> : card.kind === 'quiz' ? <PhoneQuizBody request={async onDelta => { pending.current?.abort(); const controller = new AbortController(); pending.current = controller; try { const answer = await services?.ask(card.selection, 'quiz', undefined, controller.signal, text => { if (!controller.signal.aborted && card.quizToken === quizToken.current) onDelta(text) }); if (!answer?.trim() || controller.signal.aborted || card.quizToken !== quizToken.current) throw new Error('Quiz unavailable'); quizAnswer.current = answer; return answer } finally { if (pending.current === controller) pending.current = null } }} mark={async (item, answer, turns) => { const result = await services?.askQuizCheck?.(card.selection, { question: item.q, expected: item.answer, why: item.why, answer, turns }); if (!result || card.quizToken !== quizToken.current) throw new Error('Quiz check unavailable'); return result }} draft={quizDraft} setDraft={setQuizDraft} onComplete={summary => { if (card.quizToken !== quizToken.current) return; const options = { data: { generatedQuiz: quizAnswer.current } }; const id = services?.saveCardWithId?.(card.selection, 'quiz', summary, options) ?? null; const saved = !!id || (!services?.saveCardWithId && services?.saveCard(card.selection, 'quiz', summary, options)) || false; setCard(previous => previous?.selection === card.selection ? { ...previous, kind: 'quiz-review', text: summary, busy: false, saved, id: id ?? undefined } : previous); setRevision(n => n + 1) }} /> : <>{card.busy && <p role="status">Writing…</p>}{card.kind === 'unit-note-review' ? <><p className="pdf-original-reader__note-prose">{card.text}</p>{cardTurns?.length ? <div className="pdf-original-reader__thread">{cardTurns.map((turn, index) => <div key={index}><strong>{turn.role === 'user' ? 'You' : 'Tinct'}</strong><LabInlineMarkdown>{turn.content}</LabInlineMarkdown></div>)}</div> : null}</> : cardTurns?.length && !card.busy ? <div className="pdf-original-reader__thread">{cardTurns.map((turn, index) => <div key={index}><strong>{turn.role === 'user' ? 'You' : 'Tinct'}</strong>{turn.role === 'assistant' && (index === 0 || index === 1 && cardTurns?.[0]?.role === 'user') ? <PdfOriginalAnswer kind={card.kind} raw={turn.content} /> : <LabInlineMarkdown>{turn.content}</LabInlineMarkdown>}</div>)}</div> : <PdfOriginalAnswer kind={card.kind} raw={card.text} busy={card.busy} />}{card.saved === false && <p role="status">This answer could not be saved.</p>}</>}</>}{['note', 'unit-note', 'margin-note'].includes(card.kind) && card.turns && card.turns.length > 1 && <div className="pdf-original-reader__thread">{card.turns.slice(1).map((turn, index) => <div key={index}><strong>{turn.role === 'user' ? 'You' : 'Tinct'}</strong><LabInlineMarkdown>{turn.content}</LabInlineMarkdown></div>)}</div>}{card.saved && card.id && services?.askCardFollow && services.appendCardTurn && followField}</ReaderCard>
  const marginActionLabel = (kind: string) => ({ 'ask-compose': 'Ask', 'unit-note': 'Note', 'margin-note': 'Note', 'unit-quiz': 'Quiz me', 'quiz-review': 'Quiz me', quiz: 'Quiz me', catchup: 'Catch me up', factcheck: 'Fact-check' } as Record<string, string>)[kind] || kind.charAt(0).toUpperCase() + kind.slice(1)
  const railEntries: SourceMarginEntry[] = [
    ...(foldedDraft && !card ? [{ id: 'unsaved-draft', label: marginActionLabel(foldedDraft.card.kind), source: () => sourceAnchor(foldedDraft.card.freeY !== undefined ? { ...foldedDraft.card.selection, rects: [[foldedDraft.card.selection.page, .1, foldedDraft.card.freeY, .001, .001]] } : foldedDraft.card.selection, true, true), order: foldedDraft.card.selection.page * 1_000_000 + (foldedDraft.card.freeY ?? foldedDraft.card.selection.rects[0]?.[2] ?? 0) * 100_000, open: false, content: null, preview: ['note', 'unit-note', 'margin-note'].includes(foldedDraft.card.kind) ? foldedDraft.note : foldedDraft.card.kind === 'ask-compose' ? foldedDraft.question : foldedDraft.card.text, free: foldedDraft.card.freeY !== undefined, onToggle: () => { setNote(foldedDraft.note); setQuestion(foldedDraft.question); setFollowDraft(foldedDraft.follow); setCard(foldedDraft.card); setFoldedDraft(null) } }] : []),
    ...(services?.cards ?? []).filter(item => !hidden.has('card:' + item.id)).map(item => {
      const active = card?.id === item.id
      const point = item.data?.sourceAnchor as { page?: number; frac?: number } | undefined
      const free = item.data?.free as { y?: number } | undefined
      const source: PdfOriginalSelection = { page: point?.page ?? item.page, text: item.text, rects: item.rects as PdfOriginalSelection['rects'] ?? [] }
      if (!source.rects.length && (point || free)) source.rects = [[source.page, .1, free?.y ?? point?.frac ?? 0, .001, .001]]
      return { id: 'card:' + item.id, label: marginActionLabel(item.kind), source: () => sourceAnchor(source, true, true), order: source.page * 1_000_000 + (source.rects[0]?.[2] ?? 0) * 100_000,
        open: active, content: active ? activeCardBody : null, preview: pdfOriginalAnswerPreview(item.kind, item.turns.map(turn => turn.content).at(-1) || ''), sourceText: item.text, free: !!free || item.kind === 'ask' && !!item.rects?.length && item.rects.every(rect => rect[3] === .001 && rect[4] === .001),
        onToggle: () => active ? minimiseCard() : openSavedCard(item), onDelete: () => { const entry = allSaved.find(saved => saved.kind === 'card' && saved.id === item.id); if (entry) deleteEntry(entry); if (active) setCard(null) } }
    }),
    ...(services?.marks ?? []).filter(mark => mark.note && !hidden.has('highlight:' + mark.id)).map(mark => {
      const source: PdfOriginalSelection = { page: mark.page, text: mark.text, rects: mark.rects.map(rect => [mark.page, ...rect] as [number, number, number, number, number]) }, active = card?.markId === mark.id
      return { id: 'mark:' + mark.id, label: 'Note', source: () => sourceAnchor(source, true, true), order: mark.page * 1_000_000 + (mark.rects[0]?.[1] ?? 0) * 100_000,
        open: active, content: active ? activeCardBody : null, preview: mark.note, sourceText: mark.text, onToggle: () => active ? minimiseCard() : openSavedMark(mark),
        onDelete: () => { const entry = allSaved.find(saved => saved.kind === 'highlight' && saved.id === mark.id); if (entry) deleteEntry(entry); if (active) setCard(null) } }
    }),
    ...(card && card.kind !== 'talk' && !(card.id && services?.cards.some(item => item.id === card.id)) && !(card.markId && services?.marks.some(mark => mark.id === card.markId && mark.note)) ? [{ id: 'draft', label: marginActionLabel(card.kind), source: () => {
      const source = card.freeY !== undefined ? { ...card.selection, rects: [[card.selection.page, .1, card.freeY, .001, .001]] as PdfOriginalSelection['rects'] } : card.selection
      return sourceAnchor(source, true, true)
    }, order: card.selection.page * 1_000_000 + (card.freeY ?? card.selection.rects[0]?.[2] ?? 0) * 100_000, open: true, content: activeCardBody, free: card.freeY !== undefined,
      onToggle: minimiseCard }] : []),
  ]
  // Adapt existing records for the normal Contents tree without creating another store.
  const contentsSources = [
    ...(services?.cards ?? []).filter(item => !hidden.has('card:' + item.id)).map(item => {
      const point = item.data?.sourceAnchor as { page?: number; frac?: number } | undefined
      const sourcePage = point?.page ?? item.page
      return { id: 'card:' + item.id, page: sourcePage, at: item.at, turns: item.turns,
        open: () => { jump(sourcePage, point?.frac ?? item.rects?.find(rect => rect[0] === sourcePage)?.[2] ?? 0); openSavedCard(item) } }
    }),
    ...(services?.talkConversations ?? []).filter(item => item.page !== null).map(item => ({
      id: 'talk:' + item.id, page: item.page!, at: item.at, turns: item.turns,
      open: () => { jump(item.page!); setCard({ kind: 'talk-review', selection: { page: item.page!, text: '', rects: [] }, text: item.turns.map(turn => `${turn.role === 'assistant' ? 'Tinct' : 'You'}: ${turn.content}`).join('\n\n'), saved: true }) },
    })),
  ].filter(item => Number.isSafeInteger(item.page) && item.page > 0 && item.page <= pages)
  const contentsConversations: ChatConversation[] = contentsSources.flatMap(item => {
    const chapterIndex = units.findIndex(entry => item.page >= entry.from && item.page <= entry.to)
    if (chapterIndex < 0) return []
    return [{ id: item.id, bookId, chapterNumber: chapterIndex + 1, paragraphIndex: 0,
      startTimestamp: item.at, endTimestamp: item.at, preview: item.turns.find(turn => turn.role === 'user')?.content ?? '',
      messages: item.turns.map((turn, index) => ({ id: `${item.id}:${index}`, role: turn.role, content: turn.content, timestamp: item.at, bookId, chapterNumber: chapterIndex + 1 })),
    }]
  })
  return <div ref={root} className={`lab pdf-original-reader ${phone ? 'is-phone' : 'is-desktop'} ${theme === 'dark' ? 'is-night' : ''} ${theme === 'book' ? 'is-book-theme' : ''}`} data-testid="lab-root" data-shared-reader="true" data-reader-ready="true" data-pdf-original="true" data-reading-scroll={readingScrollActive ? 'true' : undefined} data-chrome-version="v2" data-theme={theme}>
    <header className="lab-header"><a className="lab-v2-library-back" href="/library?sharedReader=1" aria-label="Back to library"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5.6M11 6.2 5.2 12l5.8 5.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></a><div className="lab-header-brand"><h1 className="lab-header-work"><button type="button" className="lab-header-book" data-testid="lab-header-book" aria-label={`Switch books, currently ${title}`} aria-expanded={pane === 'switcher'} aria-haspopup="dialog" onClick={() => setPane(pane === 'switcher' ? null : 'switcher')}><span>{title}</span></button></h1><span className="lab-title-sep" aria-hidden="true"> · </span><button type="button" className="lab-header-chapter" aria-label="Contents" onClick={() => setPane(pane === 'contents' ? null : 'contents')}>{chapterTitle}</button></div>
      <div className="lab-header-controls pdf-original-reader__head-actions"><button className="lab-v2-aa" aria-label="Appearance" onClick={() => setPane(pane === 'reading' ? null : 'reading')}>Aa</button>{!phone && <button className="lab-header-notebook" data-testid="lab-header-notebook" aria-label="Notebook" title="Notebook" onClick={() => setPane(pane === 'notebook' ? null : 'notebook')}><ReaderNotebookIcon /></button>}<button className="lab-v2-play" aria-label="Listen" disabled={!services?.listen || !services.audio?.available || !currentText} onClick={() => services?.listen?.(place.page, currentText)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8.6 6.4v11.2L17.8 12 8.6 6.4Z" fill="currentColor" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" /></svg></button><LabSuperButton open={pane === 'menu'} onToggle={() => setPane(pane === 'menu' ? null : 'menu')} reducedMotion /></div></header>
    {pane === 'switcher' && <PdfBookSwitcher owner={owner} bookId={bookId} title={title} chapterLabel={chapterTitle} onClose={() => setPane(null)} beforeLeave={() => { if (onBeforeLeave) onBeforeLeave(place); else onVisiblePlace(place) }} />}
    {pane === 'contents' && <LabContentsV2 open bookId={bookId} title={title} editionKey="pdf-original" editionLabel="Original PDF pages" chapters={units.map((entry, index) => ({ number: index + 1, title: entry.title || `Pages ${entry.from}–${entry.to}` }))} chaptersReady={pages > 0} currentChapter={unitIndex + 1} currentPage={place.page - (unit?.from ?? 1) + 1} totalPages={unit ? unit.to - unit.from + 1 : pages} statuses={new Map()} conversations={contentsConversations} historyStatus="ready" highlights={(services?.marks ?? []).filter(mark => !hidden.has('highlight:' + mark.id)).map(mark => ({ id: mark.id, bookId, editionKey: 'pdf-original', chapterNumber: Math.max(0, units.findIndex(entry => mark.page >= entry.from && mark.page <= entry.to)) + 1, paragraphIndex: mark.page - 1, endParagraphIndex: mark.page - 1, fromWord: 0, toWord: mark.text.split(/\s+/).length, text: mark.text, color: mark.color as HighlightColor, note: mark.note, updatedAt: mark.at }))} unassignedHighlights={[]} onOpenHighlight={highlight => { const mark = services?.marks.find(mark => mark.id === highlight.id); if (mark) jump(mark.page, mark.rects[0]?.[1] ?? 0) }} onClose={() => setPane(null)} onSwitchBook={() => setPane('switcher')} onSelectChapter={number => { const entry = units[number - 1]; if (entry) jump(entry.start) }} onWarmChapter={() => {}} onOpenPassage={source => { const entry = units[source.chapterNumber - 1]; if (entry) jump(entry.start) }} onContinueConversation={conversation => contentsSources.find(item => item.id === conversation.id)?.open()} navigationFooter={<form className="pdf-original-reader__page-jump" onSubmit={event => { event.preventDefault(); const target = Number(pageInput); if (Number.isInteger(target) && target >= 1 && target <= pages) { jump(target); setPageInput('') } }}><label htmlFor="pdf-page-number">Go to page</label><input id="pdf-page-number" type="number" min="1" max={pages || undefined} value={pageInput} onChange={event => setPageInput(event.target.value)} /><button type="submit" disabled={!pageInput}>Go</button></form>} />}
    <LabSuperMenu open={pane === 'menu'} phone={phone} privateBook ownPdf sharedReader onClose={() => setPane(null)}
      rows={labSuperMenuRows({phone, privateBook:true, ownPdf:true, sharedReader:true, noCatchUp:!catchupPages.length}).flatMap(row => {
        if (row.id === 'conversation') return currentText ? [{...row, modes: services?.TalkCard ? row.modes : ['chat' as const]}] : []
        if (row.id === 'summarize' && !currentText || row.id === 'catchup' && !(currentText && services?.askUnit && services.getPageText && services.saveUnitCard) || row.id === 'audio' && !services?.audio) return []
        return [row]
      })}
      onSelect={id => {
        if (id === 'text') setPane('reading')
        else if (id === 'editions') setPane('book')
        else if (id === 'audio') setPane('audio')
        else if (id === 'notebook') setPane('notebook')
        else if (id === 'catchup') void runUnit('catchup', catchupPages)
        else if (id === 'summarize') void run('recap', pageSelection())
        else if (id === 'talk') { if (card) minimiseCard(); setCard({kind:'talk', selection:pageSelection(), text:''}); setPane(null) }
        else if (id === 'library') window.location.assign('/library?sharedReader=1')
        else if (id === 'account') window.location.assign('/library?card=you&sharedReader=1')
        else if (id === 'chat') {
        const source: PdfOriginalSelection = { page: place.page, text: currentText, rects: [[place.page, .1, Math.min(.999, place.frac), .001, .001]] }
        const retained = card?.kind === 'ask-compose' && card.selection.page === place.page ? { card, question } : foldedDraft?.card.kind === 'ask-compose' && foldedDraft.card.selection.page === place.page ? foldedDraft : null
        flushSync(() => { if (card && card !== retained?.card) minimiseCard(); setPane(null); setSelection(null); setQuestion(retained?.question ?? ''); setCard(retained?.card ?? { kind: 'ask-compose', selection: source, text: '', freeY: place.frac }); if (retained) setFoldedDraft(null) })
        root.current?.querySelector<HTMLInputElement>('#pdf-question')?.focus({ preventScroll: true })

        }
      }} />
    {pane && pane !== 'menu' && pane !== 'contents' && pane !== 'switcher' && <div className="lab-v2-sheet-layer"><button type="button" className="lab-super-scrim" aria-label="Dismiss panel" onClick={() => setPane(null)} /><section ref={panelRef} className="lab-v2-sheet pdf-original-reader__panel" role="dialog" aria-label={pane === 'reading' ? 'Appearance' : pane === 'book' ? 'Book settings' : pane === 'audio' ? 'Audio settings' : 'Notebook'}>
      {(pane === 'notebook') && <nav className="pdf-original-reader__contents-tabs" aria-label="Book navigation"><button  onClick={() => setPane('contents')}>Contents</button><button aria-current={pane === 'notebook' ? 'page' : undefined} onClick={() => setPane('notebook')}>Notebook</button></nav>}
      <div className="lab-v2-head is-titled pdf-original-reader__panel-head" data-reader-window-handle><h2 className="lab-v2-title">{pane === 'reading' ? 'Appearance' : pane === 'book' ? 'Book settings' : pane === 'audio' ? 'Audio settings' : 'Notebook'}</h2><button className="lab-v2-dismiss" onClick={() => setPane(null)} aria-label="Close panel">×</button></div><div className="lab-v2-sheet-body">
      {pane === 'reading' && <div className="pdf-original-reader__settings">
        <div className="lab-v2-themes" role="group" aria-label="Theme">{LAB_V2_THEMES.map(({ theme: value, label }) => <button key={value} type="button" data-testid={`lab-v2-theme-${value}`} className={`lab-v2-theme is-${value}${prefs.theme === value ? ' is-active' : ''}`} aria-pressed={prefs.theme === value} onClick={() => chooseTheme(value)}><span className="lab-v2-theme-face">Aa</span><span className="lab-v2-theme-label">{label}</span></button>)}</div>
        <label htmlFor="pdf-page-size">Page size</label><div className="pdf-original-reader__page-size"><input className="lab-v2-slider" id="pdf-page-size" aria-label="Page size" type="range" min="0.5" max={pageZoomLimit} step="0.05" value={Math.min(pageZoom, pageZoomLimit)} onChange={event => { const value = Number(event.target.value); setPageZoom(value); onZoom?.(value) }} /><button onClick={() => { setPageZoom(1); onZoom?.(1) }}>Fit</button></div>
        {onOpenText && <button className="pdf-original-reader__edition" disabled={textBusy} onClick={() => onOpenText(place)}>{openTextLabel}</button>}{conversionStatus}{textError && <p role="status">{textError}</p>}
      </div>}
      {pane === 'book' && <div className="pdf-original-reader__settings"><p>Reading edition</p><p aria-current="true">Original PDF pages</p>{onOpenText && <button disabled={textBusy} onClick={() => onOpenText(place)}>{openTextLabel}</button>}{conversionStatus}</div>}
      {pane === 'audio' && services?.audio && <div className="pdf-original-reader__settings"><label htmlFor="pdf-audio-speed">Narration speed</label><select id="pdf-audio-speed" value={services.audio.speed} onChange={event => { services.audio?.setSpeed(Number(event.target.value)); setRevision(n => n + 1) }}>{[.75, 1, 1.25, 1.5, 2].map(value => <option key={value} value={value}>{value}×</option>)}</select>{services.audio.playing && <button onClick={() => { services.audio?.pause(); setRevision(n => n + 1) }}>Pause</button>}{!services.audio.playing && services.audio.resume && <button onClick={() => { if (services.audio?.resume?.()) setPane(null) }}>Continue</button>}{!services.audio.available && <p>Audio is unavailable for this page.</p>}</div>}
      {pane === 'notebook' && <div className="pdf-original-reader__notebook">{!!services?.recoverableTalkCount && services.adoptRecoverableTalk && <div className="pdf-original-reader__recovery" role="status"><p>{services.recoverableTalkCount} older {services.recoverableTalkCount === 1 ? 'Talk conversation has' : 'Talk conversations have'} no account label. If {services.recoverableTalkCount === 1 ? 'it is' : 'they are'} yours, attach {services.recoverableTalkCount === 1 ? 'it' : 'them'} to this account and review {services.recoverableTalkCount === 1 ? 'it' : 'them'} here.</p><button onClick={() => { setStatus(services.adoptRecoverableTalk?.() ? 'Older Talk conversations attached to this account.' : 'Could not attach older Talk conversations.'); setRevision(n => n + 1) }}>Attach older Talk conversations</button></div>}<div className="pdf-original-reader__notebook-tools"><button onClick={() => { void navigator.clipboard?.writeText(exportMarkdown()).then(() => setStatus('Notebook copied.')).catch(() => setStatus('Copy failed.')) }}>Copy all</button><button onClick={() => { const url = URL.createObjectURL(new Blob([exportMarkdown()], { type: 'text/markdown;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = filename(title); document.body.append(a); a.click(); a.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 0) }}>Download</button></div><div className="pdf-original-reader__filters">{(['all', 'mine', 'ai'] as const).map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === 'mine' ? 'My notes' : value === 'ai' ? 'AI' : 'All'}</button>)}</div>{!saved.length && <p>No saved entries on these pages.</p>}{saved.map(item => <article key={item.kind + item.id} className="pdf-original-reader__saved"><div className="pdf-original-reader__saved-head"><button onClick={() => { if (item.page !== null) { const point = item.kind === 'card' ? services?.cards.find(card => card.id === item.id)?.data?.sourceAnchor as { page?: number; frac?: number } | undefined : undefined; const rect = item.rects.find(rect => item.kind === 'highlight' ? rect.length === 4 : rect.length === 5 && rect[0] === item.page); jump(point?.page ?? item.page, point?.frac ?? rect?.[item.kind === 'highlight' ? 1 : 2] ?? 0) }; if (item.kind === 'card') { const found = services?.cards.find(card => card.id === item.id); if (found) openSavedCard(found) } else if (item.kind === 'highlight') { const found = services?.marks.find(mark => mark.id === item.id); if (found) openSavedMark(found) } else setCard({ kind: 'talk-review', selection: { page: item.page ?? place.page, text: '', rects: [] }, text: item.turns.map(turn => `${turn.role === 'assistant' ? 'Tinct' : 'You'}: ${turn.content}`).join('\n\n'), saved: true, sourceUnverified: item.page === null }) }}>{item.page === null ? item.label : `Original PDF page ${item.page} · ${item.label}`}</button>{item.kind !== 'talk' && <button onClick={() => deleteEntry(item)} aria-label={'Delete ' + item.label + ' on page ' + item.page}>Delete</button>}</div>{item.text && <blockquote>{item.text}</blockquote>}{item.sourceRange && <p>Source · Original PDF pages {item.sourceRange.from}–{item.sourceRange.to}</p>}{item.note && <p>{item.note}</p>}{item.turns.map((turn, index) => <div key={index} className="pdf-original-reader__saved-turn"><span className="pdf-original-reader__saved-role">{turn.role === 'assistant' ? 'Tinct' : 'You'}</span>{turn.role === 'assistant' && (index === 0 || index === 1 && item.turns[0]?.role === 'user') ? <PdfOriginalAnswer kind={item.label} raw={turn.content} /> : turn.content}</div>)}</article>)}</div>}
    </div></section></div>}
    <main className="lab-body"><div className="lab-page-wrap"><PdfContinuousSurface bytes={bytes} initialPlace={initialPlace} requestedPlace={requestedPlace} onScrollHost={setScrollHost} onRegionCapture={services?.setPdfRegionCapture} onFigureAction={(action, source) => { if (action === 'highlight') { services?.saveHighlight(source, 'gold'); setRevision(n => n + 1) } else if (services?.cards.some(item => item.kind === 'figure' && item.page === source.page && JSON.stringify(item.rects) === JSON.stringify(source.rects.map(rect => rect.map(n => Math.round(n * 10000) / 10000))))) { const existing = services.cards.find(item => item.kind === 'figure' && item.page === source.page && JSON.stringify(item.rects) === JSON.stringify(source.rects.map(rect => rect.map(n => Math.round(n * 10000) / 10000))))!; openSavedCard(existing) } else if (action === 'ask') { setSelection(null); setQuestion(''); setCard({ kind: 'ask-compose', selection: source, text: '' }) } else void run('explain', source) }} headingActions={headingActions} activeCardId={card?.id} onSourceActivate={source => { if (source.kind === 'card') { const item = services?.cards.find(item => item.id === source.id); if (item) openSavedCard(item) } else { const item = services?.marks.find(item => item.id === source.id); if (item) openSavedMark(item) } }} highlights={services?.marks} cards={services?.cards} follow={services?.follow} phone={phone} initialZoom={initialZoom} requestedZoom={pageZoom} onZoom={value => { setPageZoom(value); onZoom?.(value) }} onZoomLimit={setPageZoomLimit} onVisiblePlace={next => { if (visiblePage.current !== next.page) { if (phone) cancelPending(); setEndPage(null); setSelection(null); setBarState('menu'); setCard(current => current?.kind === 'talk' ? null : phone && !current?.saved ? null : current) }; visiblePage.current = next.page; setPlace(next); onVisiblePlace(next) }} onDocument={count => { pageCount.current = count; setPages(count); onDocument?.(count) }} onOutline={setOutline} onPageEnd={(page, atEnd) => setEndPage(current => atEnd ? page : current === page ? null : current)} onPageText={(page, text) => { setPageText(current => current[page] === text ? current : { ...current, [page]: text }); services?.setPdfPageText?.(page, text, pageCount.current) }} onSelection={next => { const selected = window.getSelection(); const range = selected?.rangeCount ? selected.getRangeAt(0) : null; const rect = range && typeof range.getBoundingClientRect === 'function' ? range.getBoundingClientRect() : null; if (rect?.width) setSelectionPoint({ x: rect.left, y: rect.top }); setSelection(next); setBarState('menu'); onSelection?.(next); setStatus('') }} /></div></main>
    {phone && unit && atUnitEnd && !selection && !card && <aside className="pdf-original-reader__unit-actions" aria-label={`After ${unit.title || 'these pages'}`}>
      <strong>After {unit.title || `pages ${unit.from}–${unit.to}`}</strong>
      {currentText && completeUnitPages.length > 0 && services?.getPageText && services.askUnit && services.saveUnitCard && <button onClick={() => void runUnit('recap', completeUnitPages)}>Recap</button>}
      {currentText && completeUnitPages.length > 0 && services?.getPageText && services.askUnitQuiz && services.askUnitQuizCheck && services.saveUnitQuizCardWithId && <button onClick={() => void runUnitQuiz()}>Quiz me</button>}
      {services?.saveUnitNote && <button onClick={() => openUnitNote()}>Note</button>}
    </aside>}
    {phone && <nav className={`lab-page-turn pdf-original-reader__footer${phone ? ' is-phone-rail' : ''}`} aria-label="Page">
      <button className="lab-page-turn-btn" aria-label="Previous PDF page" disabled={place.page <= 1} onClick={() => jump(place.page - 1)}>‹</button>
      <button className="lab-chapter-progress is-interactive" onClick={() => setPane('contents')} aria-label={`Page ${place.page}${pages ? ` of ${pages}` : ''}. Contents`}><span className="lab-chapter-progress-info">Page {place.page}{pages ? ` of ${pages}` : ''}</span></button>
      <button className="lab-page-turn-btn" aria-label="Next PDF page" disabled={!pages || place.page >= pages} onClick={() => jump(place.page + 1)}>›</button>
    </nav>}
    {selection && !phone && !card && <SelectionDeskBar sharedReader getAnchor={() => sourceAnchor(selection)} state={barState} color={highlightColor} marked={highlightedSelection === selection} noted={false} moreRows={[[ 'define', 'factcheck', 'counterpoint', ...(services?.askQuizCheck ? ['quiz' as const] : []) ], ['copy']]} fallback={selectionPoint} onAsk={() => { setQuestion(''); setCard({ kind: 'ask-compose', selection, text: '' }) }} onAskQuestion={question => void run('ask', selection, question)} onExplain={() => void run('explain', selection)} onSimplify={() => void run('simplify', selection)} onMore={more} onHighlight={() => { if (highlightedSelection === selection) setBarState('colors'); else highlight(highlightColor, true) }} onSwatch={highlight} onNote={() => { setNote(''); setCard({ kind: 'note', selection, text: '' }) }} onRemove={() => setSelection(null)} />}
    {selection && phone && !card && <LabPhoneBar existingColor={highlightedSelection === selection ? highlightColor : undefined} text={selection.text} fallbackX={selectionPoint.x} fallbackY={selectionPoint.y}
      onAsk={() => { setQuestion(''); setCard({ kind: 'ask-compose', selection, text: '' }) }}
      onExplain={() => void run('explain', selection)} onSimplify={() => void run('simplify', selection)}
      onMore={more} onHighlight={color => highlight(color, highlightedSelection !== selection)}
      onNote={() => { setNote(''); setCard({ kind: 'note', selection, text: '' }) }}
      onRemove={() => setSelection(null)} onDismiss={() => setSelection(null)} />}

    {phone ? activeCardBody : <><SourceMarginRail host={scrollHost} entries={railEntries} ownsSourcePointer={event => {
      if (!(event.target instanceof Element) || !event.target.closest('.pdf-original__page')) return false
      const rects = [...(services?.cards ?? []).flatMap(item => item.rects ?? []), ...(services?.marks ?? []).flatMap(item => item.rects.map(rect => [item.page, ...rect]))]
      return rects.some(([page, x, y, width, height]) => {
        const box = scrollHost?.querySelector<HTMLElement>(`.pdf-original__page[data-page="${page}"]`)?.getBoundingClientRect()
        return !!box && event.clientX >= box.left + x * box.width && event.clientX <= box.left + (x + width) * box.width && event.clientY >= box.top + y * box.height && event.clientY <= box.top + (y + height) * box.height
      })
    }} onBlankNote={({ clientY }) => {
      if (card) { minimiseCard(); return }
      if (!services?.saveMarginNote || !scrollHost) return
      const slots = [...scrollHost.querySelectorAll<HTMLElement>('.pdf-original__slot')]
      const slot = slots.find(slot => { const box = slot.getBoundingClientRect(); return clientY >= box.top && clientY <= box.bottom }) ?? slots.at(-1)
      if (!slot) return
      const box = slot.getBoundingClientRect(), page = Number(slot.dataset.page), y = Math.max(0, Math.min(1, (clientY - box.top) / box.height))
      setNote(''); setCard({ kind: 'margin-note', selection: { page, text: '', rects: [] }, text: '', freeY: y })
    }} />{card?.kind === 'talk' && activeCardBody}</>}

    {status && <div className="pdf-original-reader__status" role="status">{!services && serviceStatus ? serviceStatus : status}{!services && onRetryServices && <button onClick={() => { setStatus('Preparing highlights and AI…'); onRetryServices() }}>Try again</button>} {undo && <button onClick={() => { let restored: boolean | void; try { restored = undo.restore() } catch { restored = false }; if (restored === false) { setStatus('Could not restore entry.'); return }; setHidden(current => { const next = new Set(current); next.delete(undo.id); return next }); setUndo(null); setRevision(n => n + 1); setStatus('Entry restored.') }}>Undo</button>}</div>}
  </div>
}
