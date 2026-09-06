import { ALL_BOOKS, getBook } from '../data/bookRegistry'
import { loadEditionWindow } from '../data/editionLoader'
import { storage } from '../services/storage'
import type { BookReadingLog } from '../types'
import {
  findReadingActivity,
  readingPassageExcerpt,
  readingPeriodLabel,
  type ReadingHistoryPeriod,
} from '../voice/readingMemory'
import {
  TINCT_VOICE_TOOLS,
  type TinctVoiceToolAdapter,
  type VoiceReadingRecallPayload,
  type VoiceTinctView,
} from '../voice/tinctTools'
import type { VoiceApplicationToolResult } from '../voice/types'
import type { LabSource } from './labSource'

export const LAB_TINCT_VOICE_POLICY = `Tinct memory and controls are available in this Lab session.

Only end Talk or resume the book when the reader explicitly asks. For bye, goodbye, see you later, “okay thanks, that's it for now,” or a similarly clear conversational ending, say one short natural goodbye and call end_voice_session. For resume, continue reading, or go back to the audiobook, call resume_audiobook. A bare thanks does not end Talk. Silence, a pause, a completed answer, a tool result, or uncertainty is never a reason to end Talk. After every non-resume tool result, remain in the conversation and listen for the next turn, except when end_voice_session was explicitly requested.

For “what did I read last time?”, “what did I read yesterday?”, or similar recall, call get_reading_history. Base the answer only on its result. Keep the initial recap to 5–15 spoken seconds; the result remains in this conversation so you can answer an exact follow-up about its passage.

For a request to open Library, Reading history, Settings, Chat, Cast, Pricing, or the book, call open_tinct_view. The Lab opens either the real Lab surface or an explicitly labelled Lab preview. Never claim a view opened unless the tool says ok.

For light/dark mode call set_tinct_theme. For reader text size call set_reader_font_size. For audiobook speed, including “go faster”, “slower”, or an exact speed such as 1.5x, call set_audiobook_speed so the change can be undone. Never claim to change device brightness.

For “undo that”, “put it back”, “I preferred it before”, “actually no”, “that is too fast”, and similar reversals, call undo_last_tinct_action. Undo only applies to changes made by voice in this Talk session.`

type NamedTool = { name?: unknown }

/** Lab historically supplied a replacement tool list. Merge it with the
 * production-owned controls, replacing the old non-undoable speed tool. */
export function mergeLabVoiceTools(labTools: readonly unknown[]): readonly unknown[] {
  const merged: unknown[] = []
  const names = new Set<string>()
  const append = (tool: unknown) => {
    const name = tool && typeof tool === 'object' && typeof (tool as NamedTool).name === 'string'
      ? (tool as NamedTool).name as string
      : ''
    if (name === 'set_playback_speed' || (name && names.has(name))) return
    if (name) names.add(name)
    merged.push(tool)
  }
  labTools.forEach(append)
  TINCT_VOICE_TOOLS.forEach(append)
  return merged
}

export function buildLabVoiceControlInstructions(
  base: string,
  recentTurns: Array<{ role: 'user' | 'assistant'; content: string; cancelled?: boolean }> = [],
): string {
  const remembered = recentTurns
    .filter(turn => !turn.cancelled && turn.content.trim())
    .slice(-8)
    .map(turn => `${turn.role === 'user' ? 'Reader' : 'Tinct'}: ${turn.content.replace(/\s+/g, ' ').trim().slice(0, 600)}`)
  const priorConversation = remembered.length > 0
    ? `\n\n[Recent Lab conversation]\n${remembered.join('\n')}\nUse this only when it makes the next answer more relevant. Refer back naturally; never announce a profile, memory system, or stored chat.`
    : ''
  return `${base}\n\n${LAB_TINCT_VOICE_POLICY}${priorConversation}`
}

export interface LabVoiceHistoryInput {
  period: ReadingHistoryPeriod
  bookQuery?: string
  source: LabSource
  paragraphIndex: number
  fixtureEnabled: boolean
  now?: number
  logs?: BookReadingLog[]
}

function normalized(value: string): string {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

function fixtureMatches(source: LabSource, query?: string): boolean {
  if (!query?.trim()) return true
  const needle = normalized(query)
  return [source.bookTitle, source.bookAuthor, source.headerBook, 'bible']
    .map(normalized)
    .some(value => value.includes(needle) || needle.includes(value))
}

function yesterdayAt(now: number, hour: number, minute: number): number {
  const value = new Date(now)
  value.setDate(value.getDate() - 1)
  value.setHours(hour, minute, 0, 0)
  return value.getTime()
}

function fixtureActivity(input: LabVoiceHistoryInput): Record<string, unknown> {
  const last = Math.max(0, input.source.paragraphs.length - 1)
  const start = Math.max(0, Math.min(last, input.paragraphIndex))
  const end = Math.min(last, start + 1)
  const now = input.now ?? Date.now()
  return {
    book_id: 'bible',
    book_title: input.source.bookTitle,
    book_author: input.source.bookAuthor,
    chapter_number: input.source.chapterNumber,
    chapter_title: input.source.chapterLabel,
    edition: input.source.editionLabel,
    mode: 'read',
    started_at: new Date(yesterdayAt(now, 20, 5)).toISOString(),
    last_active_at: new Date(yesterdayAt(now, 20, 22)).toISOString(),
    paragraph_range: start === end ? `${start + 1}` : `${start + 1}–${end + 1}`,
    passage_excerpt: readingPassageExcerpt({
      paragraphs: input.source.paragraphs,
      startParagraphIndex: start,
      lastParagraphIndex: end,
    }),
    lab_fixture: true,
  }
}

/** Read genuine production history first. If none exists, the Lab may return
 * a visibly labelled, in-memory yesterday fixture. This never writes storage. */
export async function getLabVoiceReadingHistory(input: LabVoiceHistoryInput): Promise<VoiceReadingRecallPayload> {
  const now = input.now ?? Date.now()
  const hits = findReadingActivity({
    logs: input.logs ?? storage.getAll<BookReadingLog>('reading-log:'),
    books: ALL_BOOKS,
    period: input.period,
    now,
    bookQuery: input.bookQuery,
    limit: 4,
  })
  const activities = await Promise.all(hits.map(async hit => {
    const book = getBook(hit.bookId)
    const edition = book?.editions.find(candidate => candidate.key === hit.editionKey)
      || book?.editions[0]
    let chapterTitle = `Chapter ${hit.chapterNumber}`
    let excerpt = ''
    if (book && edition) {
      try {
        const data = await loadEditionWindow(book.id, edition.key, hit.chapterNumber)
        const chapter = data.chapters.find(candidate => candidate.number === hit.chapterNumber)
        if (chapter) {
          chapterTitle = chapter.title
          excerpt = readingPassageExcerpt({
            paragraphs: chapter.paragraphs,
            startParagraphIndex: hit.startParagraphIndex,
            lastParagraphIndex: hit.lastParagraphIndex,
          })
        }
      } catch { /* metadata-only history still remains truthful */ }
    }
    const start = typeof hit.startParagraphIndex === 'number' ? hit.startParagraphIndex + 1 : undefined
    const end = typeof hit.lastParagraphIndex === 'number' ? hit.lastParagraphIndex + 1 : undefined
    return {
      book_id: hit.bookId,
      book_title: hit.bookTitle,
      book_author: hit.bookAuthor,
      chapter_number: hit.chapterNumber,
      chapter_title: chapterTitle,
      edition: edition?.label || hit.editionKey,
      mode: hit.mode,
      started_at: new Date(hit.startedAt).toISOString(),
      last_active_at: new Date(hit.lastActiveAt).toISOString(),
      paragraph_range: start === undefined ? undefined : start === end || end === undefined ? `${start}` : `${start}–${end}`,
      passage_excerpt: excerpt || undefined,
      lab_fixture: false,
    }
  }))

  if (
    activities.length === 0
    && input.fixtureEnabled
    && (input.period === 'last_session' || input.period === 'yesterday')
    && fixtureMatches(input.source, input.bookQuery)
  ) {
    activities.push(fixtureActivity(input))
  }

  return {
    ok: true,
    period: input.period,
    period_label: readingPeriodLabel(input.period),
    activities,
    lab_fixture_used: activities.some(activity => activity.lab_fixture === true),
  }
}

/**
 * Navigation policy shared by typed chat and voice (V1 and V2).
 *
 * A chapter or paragraph move requested through the companion opens the
 * reader at that place. It starts the audiobook only when the session began
 * from playback (the companion paused a playing book) or the reader
 * explicitly asked to play or read aloud. A move made to look something up
 * must never turn the audiobook on by itself.
 */
export interface LabPlaybackNavigationOutcome {
  /** True when playback should resume once the companion has confirmed the move. */
  resumePlayback: boolean
}

export function shouldResumePlaybackAfterNavigation(input: {
  sessionStartedFromPlayback: boolean
  explicitPlayRequest?: boolean
}): boolean {
  return input.sessionStartedFromPlayback || input.explicitPlayRequest === true
}

export interface LabVoiceActionEntry {
  id: string
  tool: string
  arguments: Record<string, unknown>
  ok: boolean
  outcome: string
  originatingTurn: string
  undoResult?: string
}

export interface LabVoiceViewSnapshot {
  view: VoiceTinctView
  phoneAskOpen: boolean
  desktopAskOpen: boolean
  gearOpen: boolean
  tocOpen: boolean
  inTheBookOpen: boolean
  peekBook: boolean
  settingsSection: 'reading' | 'layout'
}

export function labVoiceActionEntry(
  tool: string,
  arguments_: Record<string, unknown>,
  callId: string,
  result: VoiceApplicationToolResult,
): LabVoiceActionEntry {
  const output = result.output
  const ok = output.ok !== false
  const origin = typeof output.originating_turn === 'string' ? output.originating_turn : callId
  let outcome = ok ? 'Completed' : `Failed: ${String(output.error || 'unknown')}`
  let undoResult: string | undefined
  if (tool === 'get_reading_history') outcome = `${Array.isArray(output.activities) ? output.activities.length : 0} history result(s)`
  else if (tool === 'open_tinct_view') outcome = `Opened ${String(output.view || 'view').replace('_', ' ')}`
  else if (tool === 'set_tinct_theme') outcome = `${String(output.theme || '')} mode${output.changed === false ? ' already set' : ''}`
  else if (tool === 'set_reader_font_size') outcome = `Font ${String(output.font_size_rem || '')}rem`
  else if (tool === 'set_audiobook_speed') outcome = `Audiobook ${String(output.speed || '')}×`
  else if (tool === 'undo_last_tinct_action') {
    undoResult = ok ? `Undid ${String(output.undone || 'last action')}` : 'Nothing to undo'
    outcome = undoResult
  }
  return {
    id: `${callId}:${tool}`,
    tool,
    arguments: arguments_,
    ok,
    outcome,
    originatingTurn: origin,
    undoResult,
  }
}

export interface LabVoiceAdapterBindings<ViewSnapshot> {
  getViewSnapshot: () => ViewSnapshot
  openView: TinctVoiceToolAdapter<ViewSnapshot>['openView']
  restoreView: TinctVoiceToolAdapter<ViewSnapshot>['restoreView']
  getTheme: TinctVoiceToolAdapter<ViewSnapshot>['getTheme']
  setTheme: TinctVoiceToolAdapter<ViewSnapshot>['setTheme']
  getFontSize: TinctVoiceToolAdapter<ViewSnapshot>['getFontSize']
  setFontSize: TinctVoiceToolAdapter<ViewSnapshot>['setFontSize']
  getAudioSpeed: TinctVoiceToolAdapter<ViewSnapshot>['getAudioSpeed']
  setAudioSpeed: TinctVoiceToolAdapter<ViewSnapshot>['setAudioSpeed']
  getReadingHistory: TinctVoiceToolAdapter<ViewSnapshot>['getReadingHistory']
}

/** Kept as a named Lab boundary so its actual UI bindings can be regression-tested. */
export function createLabVoiceToolAdapter<ViewSnapshot>(
  bindings: LabVoiceAdapterBindings<ViewSnapshot>,
): TinctVoiceToolAdapter<ViewSnapshot> {
  return { ...bindings }
}
