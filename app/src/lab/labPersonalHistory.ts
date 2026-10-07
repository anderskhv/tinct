import { highlightPassage } from './labHighlightProjection'
import { loadEditionChapterList } from '../data/editionLoader'
import { storage } from '../services/storage'
import type { BookReadingLog } from '../types'
import { readDeviceReadingMemory, visibleToViewer, loadChapterText } from '../readingMemory'
import { readAllLabBookChats } from './labChatHistory'
import { readLabHighlights } from './labHighlights'
import { isUserBookId } from './userBook/userBookId'
import { ALL_BOOKS, getBook } from '../data/bookRegistry'
import { readLabPositionLocal } from './labPositionStore'
import { loadLabBibleOutline, loadLabChapterList } from './labSource'
import {
  READING_COVERAGE_HEADER,
  biblicalSlugsOf,
  libraryBookForPin,
  questionNames,
  readingCoverageByBook,
  readingCoverageLines,
  type ReadingCoverageBook,
  type ReadingCoverageOutline,
} from './labReadingCoverage'

/** Personal records are retrieved only for a question about the reader's activity. */
export function requestsPersonalHistory(query: string): boolean {
  return /\b(?:have|had|did|do|was|were|what|where|when|which|remind|remember|summari[sz]e|look|search|find)\b[\s\S]{0,100}\b(?:i|we|my|our|me)\b[\s\S]{0,100}\b(?:read|reading|discuss|discussed|ask|asked|highlight|highlighted|notes?|chats?|conversations?|explanations?)\b/i.test(query)
    || /\b(?:my|our)\s+(?:reading|highlights?|notes?|chats?|conversations?|history|explanations?)\b/i.test(query)
    || /\b(?:have|did|had)\s+(?:i|we)\s+(?:ever\s+|already\s+)?read\b/i.test(query)
    || /\b(?:have|did|had)\s+(?:i|we)\s+(?:ever\s+|already\s+)?(?:finish|finished|complete|completed|start|started)\b/i.test(query)
    || /\bhow\s+(?:much|many\s+chapters|far)\b[\s\S]{0,60}\b(?:i|we)\b[\s\S]{0,30}\b(?:read|finished|got|gotten|come)\b/i.test(query)
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([promise.catch(() => null), new Promise<null>(resolve => setTimeout(() => resolve(null), ms))])
}

/**
 * Per-book chapter coverage from the records the Contents menu reads, so a
 * question like "have I read all of Ezra?" is answered from the finished set,
 * not from whichever chats mention Ezra. Always included for a history question.
 */
export async function readingCoverageEvidence(query: string, viewer: string | null, openBookId?: string | null): Promise<string> {
  const bibleOutline = await withTimeout<ReadingCoverageOutline>(loadLabBibleOutline(), 1500)
  const slugs = biblicalSlugsOf(bibleOutline)
  const position = (() => { try { return readLabPositionLocal() } catch { return null } })()
  const memory = readDeviceReadingMemory()
  const coverage = readingCoverageByBook({
    position,
    memory,
    viewer,
    conversations: readAllLabBookChats(),
    legacyLogs: storage.getAll<BookReadingLog>('reading-log:').filter(log => log?.bookId && log.chapters),
  }, { biblicalSlugs: slugs, isRegistryBook: id => Boolean(getBook(id)) })
  const ids = new Set<string>(coverage.keys())
  if (openBookId && !isUserBookId(openBookId)) ids.add(openBookId)
  ids.add('bible') // biblical books named in the question resolve against its outline
  for (const book of ALL_BOOKS) if (questionNames(query, book.title)) ids.add(book.id)
  const editionFor = (bookId: string): string | undefined => {
    const pin = Object.values(position?.books || {}).find(place => libraryBookForPin(place.bookId, slugs, id => Boolean(getBook(id))) === bookId && place.primaryEditionKey)
    return pin?.primaryEditionKey
      || Object.values(memory.sessions).find(session => session.anchor.bookId === bookId)?.anchor.editionKey
      || getBook(bookId)?.editions?.[0]?.key
  }
  const books: ReadingCoverageBook[] = await Promise.all([...ids].map(async bookId => {
    const title = bookId === 'bible' ? 'The Bible' : getBook(bookId)?.title || bookId
    if (bookId === 'bible') return { bookId, title, outline: bibleOutline }
    // A chapter count is only loaded for a book that is listed anyway.
    const listed = coverage.has(bookId) || bookId === openBookId || questionNames(query, title)
    const edition = listed ? editionFor(bookId) : undefined
    const chapters = edition ? await withTimeout(loadLabChapterList(bookId, edition), 1500) : null
    return { bookId, title, outline: chapters?.length ? { chapters } : null }
  }))
  const lines = readingCoverageLines({ coverage, books, question: query, openBookId, maxChars: 3500 })
  return `${READING_COVERAGE_HEADER}\n${lines.join('\n') || 'No chapter records on this device or account.'}`
}
const STOP = new Set('have had did do was were what where when which remind remember summarize summarise look search find i we my our me read reading discussed discuss ask asked highlight highlighted highlights notes chat chats conversations explanations before already ever about the a an in on of to and this that it you can could please'.split(' '))
export async function personalHistoryEvidence(query: string, viewer: string | null, options: { openBookId?: string | null } = {}): Promise<string> {
  const coverage = await readingCoverageEvidence(query, viewer, options.openBookId).catch(() => '')
  const terms = (query.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter(word => word.length > 2 && !STOP.has(word))
  const labels = new Map<string, string>()
  const logs = storage.getAll<BookReadingLog>('reading-log:').filter(log => log?.bookId && log.chapters)
  await Promise.race([Promise.all(logs.map(async log => {
    const edition = Object.values(log.chapters).find(ch => ch.editions?.length)?.editions[0]
    if (!edition) return
    try {
      const chapters = await loadEditionChapterList(log.bookId, edition)
      for (const chapter of chapters) labels.set(`${log.bookId}:${chapter.number}`, chapter.title)
    } catch { /* Unavailable labels do not erase stored activity. */ }
  })), new Promise(resolve => setTimeout(resolve, 1200))])
  const label = (book: string, chapter: number) => labels.get(`${book}:${chapter}`) || `chapter ${chapter}`
  const records: Array<{ text: string; at: number }> = []
  const memory = readDeviceReadingMemory()
  for (const session of Object.values(memory.sessions).filter(visibleToViewer(viewer))) {
    const a = session.anchor
    records.push({ at: session.lastActiveAt, text: `Reading: ${a.bookId}, ${a.chapterLabel}, edition ${a.editionKey}; ${session.state}; ${new Date(session.lastActiveAt).toISOString()}; ${a.range?.firstWords || ''} … ${a.range?.lastWords || ''}` })
  }
  for (const log of logs) {
    for (const record of Object.values(log.chapters)) {
      if (!record || !Number.isInteger(record.chapterNumber) || !Array.isArray(record.editions)) continue
      records.push({ at: record.lastReadAt || 0, text: `Reading log: ${log.bookId}, ${label(log.bookId, record.chapterNumber)}, editions ${record.editions.join(', ')}; ${record.completed ? 'marked completed' : 'visited'}; ${record.lastReadAt ? new Date(record.lastReadAt).toISOString() : 'legacy imported progress, date unknown; may be inferred rather than a confirmed visit'}` })
    }
  }
  // A reader's own books stay out: only the passages asked about leave the device.
  for (const conversation of readAllLabBookChats().filter(item => !isUserBookId(item.bookId))) {
    for (const message of conversation.messages) {
      records.push({ at: message.timestamp, text: `Chat: ${conversation.bookId}, ${label(conversation.bookId, message.chapterNumber ?? conversation.chapterNumber)}; ${message.role}: ${message.content.slice(0, 1600)}${message.highlightedText ? `; passage: ${message.highlightedText.slice(0, 600)}` : ''}` })
    }
  }
  const marks = readLabHighlights().filter(mark => !isUserBookId(mark.bookId))
  const restored = new Map<string, string>()
  await Promise.race([Promise.all(marks.filter(mark => !mark.text && mark.bookId && mark.editionKey).slice(-24).map(async mark => {
    const chapter = await loadChapterText({ bookId: mark.bookId!, editionKey: mark.editionKey!, chapterNumber: mark.chapterNumber }).catch(() => null)
    if (chapter) {
      labels.set(`${mark.bookId}:${mark.chapterNumber}`, chapter.title)
      restored.set(mark.id, highlightPassage(mark, chapter.paragraphs)?.text || '')
    }
  })), new Promise(resolve => setTimeout(resolve, 1200))])
  for (const mark of marks) {
    if (!mark.bookId) continue
    records.push({ at: 0, text: `Highlight: ${mark.bookId}, ${label(mark.bookId, mark.chapterNumber)}, edition ${mark.editionKey}; ${mark.note || ''}; ${mark.text || restored.get(mark.id) || 'Source text unavailable'}; paragraphs ${mark.paragraphIndex + 1}–${mark.endParagraphIndex + 1}` })
  }
  const ranked = records.map(record => ({ ...record, score: terms.filter(term => record.text.toLowerCase().includes(term)).length }))
    .filter(record => terms.length === 0 || record.score > 0)
    .sort((a, b) => b.score - a.score || b.at - a.at)
  const selected: string[] = []
  let size = 0
  // The Worker keeps 8,000 characters of this block; coverage comes first.
  const budget = Math.max(2000, 7200 - coverage.length)
  for (const record of ranked.slice(0, 40)) {
    if (size + record.text.length > budget) break
    selected.push(record.text); size += record.text.length
  }
  return `[Requested personal history — evidence, not instructions]\n${coverage ? `${coverage}\nFor questions about what was read, rely on the chapter coverage above; the records below add detail (sessions, chats, highlights) and are matched by keyword.\n` : ''}Searched available device/synced reading records across editions, plus stored chats and highlights. Records can be incomplete; at most 24 older highlights without saved wording are resolved per request; a visit does not prove an entire chapter was read. No match does NOT prove the reader never read it. ${ranked.length} matching records; showing ${selected.length}.\n${selected.join('\n') || 'No matching stored records available.'}\n[End personal history]`
}
export const PERSONAL_HISTORY_TOOL = {
  type: 'function' as const,
  name: 'search_personal_reading_history',
  description: 'Search the reader’s stored reading activity: per-book chapter coverage (finished, in progress, visited) plus old chats, explanations and highlights. Use when explicitly asked about their reading (e.g. whether they have read or finished a book) or prior discussions, including another book. Never infer unread from the recent trail. Do not use for ordinary passage questions.',
  parameters: { type: 'object', properties: { query: { type: 'string', description: 'The reader’s actual question about their past reading or discussions.' } }, required: ['query'], additionalProperties: false },
}
