/**
 * Cards and highlights made in another edition of the book, placed in the edition on screen (Anders, 13 Nov 2026:
 * his Luke 2 and 3 cards, made in the World English Bible, were in the Notebook but not in the King James overview
 * or margin). A passage is carried across as the reader's one-chapter view already carries a highlight
 * (labHighlightProjection.ts: the same words, else the whole verses, else the aligned paragraph); one that cannot be
 * located in this edition stays out, as before. Only between editions aligned with each other (the registry's
 * `aligned`, the signal that also keeps Compare away from Pope's verse Odyssey): an unaligned edition shows the marks
 * made in it and nothing else (Anders, 13 Nov 2026). Nothing is written: the stored card or mark keeps its edition.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { bibleHighlightsCarryAcross } from '../../data/bibleEditionChapters'
import { getBook } from '../../data/bookRegistry'
import type { Edition } from '../../types'
import { loadChapterText } from '../../readingMemory/chapterText'
import type { ChatCardAnchor, ChatConversation } from '../../types'
import { highlightOffCurrentText } from '../labHighlightContentMigration'
import { projectHighlight } from '../labHighlightProjection'
import { isLabChapterNote, type LabHighlight } from '../labHighlights'
import { isUserBookId } from '../userBook/userBookId'

type Range = Pick<ChatCardAnchor, 'paragraphIndex' | 'fromWord' | 'endParagraphIndex' | 'toWord'>
type ChapterText = readonly string[]

export const editionChapterKey = (editionKey: string, chapterNumber: number) => `${editionKey}:${chapterNumber}`

type EditionList = readonly Pick<Edition, 'key' | 'aligned'>[]

const editionsOf = (bookId: string, editions?: EditionList): EditionList => editions?.length ? editions : getBook(bookId)?.editions ?? []

/**
 * Whether a passage of `from` may be shown in `to` at all: both editions known and aligned (not `aligned: false`),
 * and in the Bible not the Greek Esther or Daniel 3 against the Hebrew.
 */
export function carriesAcross(bookId: string, from: string, to: string, chapterNumber: number, editions?: EditionList): boolean {
  const list = editionsOf(bookId, editions)
  if (![from, to].every(key => { const edition = list.find(item => item.key === key); return !!edition && edition.aligned !== false })) return false
  return bookId !== 'bible' || bibleHighlightsCarryAcross(from, to, chapterNumber)
}

interface Scope { bookId: string; editionKey: string; chapters: ReadonlySet<number>; editions?: EditionList }

function foreignCard(item: ChatConversation, scope: Scope): ChatCardAnchor | null {
  const anchor = item.card?.anchor
  if (item.bookId !== scope.bookId || !anchor || item.card?.gone || anchor.editionKey === scope.editionKey || !scope.chapters.has(item.chapterNumber)) return null
  return carriesAcross(scope.bookId, anchor.editionKey, scope.editionKey, item.chapterNumber, scope.editions) ? anchor : null
}

function foreignHighlight(mark: LabHighlight, scope: Scope): boolean {
  return mark.bookId === scope.bookId && !!mark.editionKey && mark.editionKey !== scope.editionKey && scope.chapters.has(mark.chapterNumber)
    && !isLabChapterNote(mark) && mark.kind !== 'chapter' && !highlightOffCurrentText(mark)
    && carriesAcross(scope.bookId, mark.editionKey, scope.editionKey, mark.chapterNumber, scope.editions)
}

/** The other editions' chapter texts the chapters' cards and highlights are written in, as `edition:chapter` keys. */
export function foreignSourceKeys(input: Scope & { conversations: readonly ChatConversation[]; highlights: readonly LabHighlight[] }): string[] {
  const keys = new Set<string>()
  for (const item of input.conversations) {
    const anchor = foreignCard(item, input)
    if (anchor) keys.add(editionChapterKey(anchor.editionKey, item.chapterNumber))
  }
  for (const mark of input.highlights) {
    if (foreignHighlight(mark, input)) keys.add(editionChapterKey(mark.editionKey!, mark.chapterNumber))
  }
  return [...keys]
}

function sameText(a: ChapterText, b: ChapterText): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false
  for (let index = 0; index < a.length; index++) if (a[index] !== b[index]) return false
  return true
}

interface CacheEntry<T> { from: object; source: ChapterText; target: ChapterText; result: T | null }

/**
 * Projections, kept per card or mark while the stored item and both chapter texts are the same, so a render that
 * changes nothing here (a scroll, a streamed answer elsewhere) gives back the same objects.
 */
export interface CrossEditionProjector {
  card: (item: ChatConversation, anchor: ChatCardAnchor, editionKey: string, source: ChapterText, target: ChapterText) => ChatConversation | null
  highlight: (mark: LabHighlight, editionKey: string, source: ChapterText, target: ChapterText) => LabHighlight | null
}

export function createCrossEditionProjector(bookId: string, editions?: EditionList): CrossEditionProjector {
  // As the one-chapter reader's highlights: the paragraph fallback only between editions marked aligned.
  const aligned = (a: string, b: string) => [a, b].every(key => editionsOf(bookId, editions).find(edition => edition.key === key)?.aligned === true)
  const cards = new Map<string, CacheEntry<ChatConversation>>()
  const marks = new Map<string, CacheEntry<LabHighlight>>()
  function cached<T>(cache: Map<string, CacheEntry<T>>, id: string, from: object, source: ChapterText, target: ChapterText, make: () => T | null): T | null {
    const hit = cache.get(id)
    if (hit && hit.from === from && sameText(hit.source, source) && sameText(hit.target, target)) return hit.result
    const result = make()
    cache.set(id, { from, source, target, result })
    return result
  }
  const project = (range: Range, from: string, to: string, source: ChapterText, target: ChapterText): Range | null => {
    const probe = { id: 'probe', chapterNumber: 0, color: 'gold', ...range } as LabHighlight
    const moved = projectHighlight(probe, [...source], [...target], aligned(from, to))
    return moved ? { paragraphIndex: moved.paragraphIndex, fromWord: moved.fromWord, endParagraphIndex: moved.endParagraphIndex, toWord: moved.toWord } : null
  }
  return {
    card: (item, anchor, editionKey, source, target) => cached(cards, `${editionKey}|${item.id}`, item, source, target, () => {
      const range = project(anchor, anchor.editionKey, editionKey, source, target)
      return range && item.card ? { ...item, card: { ...item.card, anchor: { ...anchor, ...range, editionKey } } } : null
    }),
    highlight: (mark, editionKey, source, target) => cached(marks, `${editionKey}|${mark.id}`, mark, source, target, () => {
      const range = project(mark, mark.editionKey!, editionKey, source, target)
      return range ? { ...mark, ...range } : null
    }),
  }
}

/** The previous list when every item is the same object, so memos downstream keep their work. */
function stable<T>(previous: readonly T[] | undefined, next: T[]): readonly T[] {
  return previous && previous.length === next.length && previous.every((item, index) => item === next[index]) ? previous : next
}

export interface CrossEditionMarks {
  /** Cards of another edition, as copies whose anchor is in the reader's edition, by conversation id. */
  cards: ReadonlyMap<string, ChatConversation>
  /** Highlights and notes of another edition, at their passage in the reader's edition (same ids). */
  highlights: readonly LabHighlight[]
}

const EMPTY: CrossEditionMarks = { cards: new Map(), highlights: [] }

/**
 * Pure: the cross-edition cards and highlights of `chapters` that can be located, given the chapter texts at hand.
 * `sources` holds other editions' chapters by `edition:chapter`; `target(n)` the reader's edition of chapter n.
 */
export function crossEditionMarks(input: Scope & {
  conversations: readonly ChatConversation[]; highlights: readonly LabHighlight[]
  sources: ReadonlyMap<string, ChapterText>; target: (chapterNumber: number) => ChapterText | undefined
  projector: CrossEditionProjector
}): { cards: ChatConversation[]; highlights: LabHighlight[] } {
  const cards: ChatConversation[] = []
  const highlights: LabHighlight[] = []
  for (const item of input.conversations) {
    const anchor = foreignCard(item, input)
    if (!anchor) continue
    const source = input.sources.get(editionChapterKey(anchor.editionKey, item.chapterNumber)), target = input.target(item.chapterNumber)
    const moved = source?.length && target?.length ? input.projector.card(item, anchor, input.editionKey, source, target) : null
    if (moved) cards.push(moved)
  }
  for (const mark of input.highlights) {
    if (!foreignHighlight(mark, input)) continue
    const source = input.sources.get(editionChapterKey(mark.editionKey!, mark.chapterNumber)), target = input.target(mark.chapterNumber)
    const moved = source?.length && target?.length ? input.projector.highlight(mark, input.editionKey, source, target) : null
    if (moved) highlights.push(moved)
  }
  return { cards, highlights }
}

/**
 * The hook: loads each other-edition chapter a card or highlight of `chapters` is written in, and the reader's
 * edition of a chapter `target` does not have yet, once, then projects. Recomputed when the cards, highlights or
 * texts change, never on scroll. A reader's own books keep their marks to their own edition.
 */
export function useCrossEditionMarks(input: {
  enabled: boolean; bookId: string; editionKey: string; chapters: readonly number[]
  /** The book's editions as the reader knows them (an added book's too); the registry's when absent. */
  editions?: EditionList
  conversations: readonly ChatConversation[]; highlights: readonly LabHighlight[]
  target: (chapterNumber: number) => ChapterText | undefined
  /** Changes whenever `target` would answer differently. */
  targetKey: unknown
}): CrossEditionMarks {
  const { bookId, editionKey } = input
  const editionsKey = (input.editions ?? []).map(edition => `${edition.key}:${edition.aligned}`).join(',')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const editions = useMemo(() => input.editions, [editionsKey])
  const enabled = input.enabled && !isUserBookId(bookId)
  const chaptersKey = input.chapters.join(',')
  const chapters = useMemo(() => new Set(chaptersKey ? chaptersKey.split(',').map(Number) : []), [chaptersKey])
  const scope = `${bookId}/${editionKey}`
  const [loaded, setLoaded] = useState<{ scope: string; texts: Map<string, ChapterText> }>(() => ({ scope, texts: new Map() }))
  const texts = loaded.scope === scope ? loaded.texts : null
  const pending = useRef(new Set<string>())
  const scopeRef = useRef(scope)
  scopeRef.current = scope
  const needed = useMemo(() => enabled ? foreignSourceKeys({ bookId, editionKey, chapters, editions, conversations: input.conversations, highlights: input.highlights }) : [],
    [enabled, bookId, editionKey, chapters, editions, input.conversations, input.highlights])
  const neededKey = needed.join('|')
  useEffect(() => {
    if (!enabled || !neededKey) return
    const wanted = new Set(neededKey.split('|'))
    // The reader's own edition of each such chapter, where the reader has not loaded it.
    for (const key of [...wanted]) {
      const chapterNumber = Number(key.slice(key.lastIndexOf(':') + 1))
      if (!input.target(chapterNumber)?.length) wanted.add(editionChapterKey(editionKey, chapterNumber))
    }
    for (const key of wanted) {
      const flight = `${scope}|${key}`
      if (texts?.has(key) || pending.current.has(flight)) continue
      pending.current.add(flight)
      const at = key.lastIndexOf(':')
      void loadChapterText({ bookId, editionKey: key.slice(0, at), chapterNumber: Number(key.slice(at + 1)) })
        .then(chapter => {
          if (scopeRef.current !== scope || !chapter?.paragraphs.length) return
          setLoaded(previous => {
            const base = previous.scope === scope ? previous.texts : new Map<string, ChapterText>()
            if (base.has(key)) return previous
            return { scope, texts: new Map(base).set(key, chapter.paragraphs) }
          })
        })
        .catch(() => {})
        .finally(() => { pending.current.delete(flight) })
    }
  // `target` answers through `targetKey`.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, neededKey, scope, texts, input.targetKey])
  const projector = useMemo(() => createCrossEditionProjector(bookId, editions), [bookId, editions])
  const previous = useRef<CrossEditionMarks>(EMPTY)
  return useMemo(() => {
    if (!enabled || !needed.length || !texts) return previous.current = EMPTY
    const target = (chapterNumber: number) => {
      const shown = input.target(chapterNumber)
      return shown?.length ? shown : texts.get(editionChapterKey(editionKey, chapterNumber))
    }
    const next = crossEditionMarks({ bookId, editionKey, chapters, editions, conversations: input.conversations, highlights: input.highlights, sources: texts, target, projector })
    const cards = stable([...previous.current.cards.values()], next.cards)
    const highlights = stable(previous.current.highlights, next.highlights)
    if (cards !== next.cards && highlights === previous.current.highlights) return previous.current
    return previous.current = { cards: new Map(cards.map(item => [item.id, item])), highlights }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, needed, texts, bookId, editionKey, chapters, editions, input.conversations, input.highlights, input.targetKey, projector])
}
