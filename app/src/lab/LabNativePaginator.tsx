import { proseJoins, proseRuns } from './labPoetry'
import { measureRowsState, paintRows } from './labMeasureRows'
import { LabChapterHeading } from './LabChapterHeading'
import { LabChapterEnd } from './LabChapterEnd'
import { cleanPageStarts, fitChapterEnd } from './labChapterEndPaging'
import { labMeasureJoinInto, labMeasureParagraphInto, measuredLineStarts, measuredTailGapEm } from './labMeasureParagraph'
import { Fragment, memo, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { hyphenLangForEdition, hyphenatorReady, loadHyphenator, pageEdgeBreaks } from './labHyphenate'
import {
  LAB_ORPHAN_PAGE_WORDS,
  chapterPagesCover,
  chapterPageSegments,
  chapterPageTail,
  cutPageTailTo,
  applyPaintShrink,
  isLabVerseMarker,
  LAB_VERSE_SEPARATOR,
  labVerseMarkerDisplay,
  sameChapterPages,
  snapShrinkEndToSentence,
  segmentWordTexts,
  tokenizeHearingWords,
  type ChapterHearingPage,
  type ChapterPageSegment,
} from './labHearing'
import { labPageFitsPaint, nextPaintShrinkTo } from './labChrome'
import { measuredDesktopPages, measuredDesktopPageSteps, type LabPaginationStart } from './LabDesktopPaginator'
import { paragraphKindClass, paragraphSetRagged, wordLink } from './labParagraphStyle'
import { planHyphenation } from './labHyphenPlan'
import { figureFor, setFigureLayout } from './labFigures'
import { LabFigureView } from './LabFigure'
import { presentationLineRanges, verseLineStarts, verseSpeakerEnd, isInternalVerseBreak } from './labVerseLines'

export interface LabNativeWordPlacement {
  pageIndex: number
  paragraphIndex: number
  wordIndex: number
}

export interface LabNativePaintMeasurement {
  lastBottom: number
  chromeTop: number
  lineHeight: number
  lastLineWords: number
  scrollOverflow?: boolean
}

/**
 * The column flow is a preflight. This final correction uses the real painted
 * page, so Safari font rounding can never leave a partial line under chrome.
 */
export function shrinkNativePageAfterPaint(
  paragraphs: string[],
  pages: ChapterHearingPage[],
  pageIndex: number,
  painted: LabNativePaintMeasurement,
): ChapterHearingPage[] {
  if (labPageFitsPaint(painted)) return pages
  const page = pages[pageIndex]
  const tail = chapterPageTail(page)
  if (!page || !tail) return pages
  const segments = chapterPageSegments(page)
  // A browser-laid-out page can end with only a verse unit or one word from
  // the next paragraph. That tiny final segment may be exactly what crosses
  // the chrome boundary. Move it forward as a unit, then let the next painted
  // pass decide whether the preceding segment also needs trimming.
  if (tail.to <= tail.from + 1) {
    if (segments.length <= 1 || tail.to <= tail.from) return pages
    const next = cutPageTailTo(pages, pageIndex, tail.from)
    return sameChapterPages(next, pages) ? pages : next
  }
  const overflowPx = Math.max(0, painted.lastBottom - painted.chromeTop)
  let nextTo = nextPaintShrinkTo(tail.from, tail.to, painted.lastLineWords, overflowPx, painted.lineHeight)
  nextTo = snapShrinkEndToSentence(
    tokenizeHearingWords(paragraphs[tail.paragraphIndex] || ''),
    tail.from,
    tail.to,
    nextTo,
    Math.max(6, painted.lastLineWords || 0),
  )
  if (nextTo >= tail.to) return pages
  const next = segments.length > 1
    ? cutPageTailTo(pages, pageIndex, nextTo)
    : applyPaintShrink(pages, pageIndex, nextTo, {
        lastLineWords: painted.lastLineWords,
        overflowing: true,
      })
  return sameChapterPages(next, pages) ? pages : next
}

/**
 * Safari can leave only a word or two in the final column after a fullscreen
 * resize. Pulling words from the preceding page is always height-safe: the
 * sparse final page gains text while the full preceding page only shrinks.
 */
export function balanceNativeChapterTail(pages: ChapterHearingPage[]): ChapterHearingPage[] {
  if (pages.length < 2) return pages
  const lastIndex = pages.length - 1
  const previous = pages[lastIndex - 1]
  const last = pages[lastIndex]
  const previousSegments = chapterPageSegments(previous)
  const lastSegments = chapterPageSegments(last)
  const previousTail = previousSegments[previousSegments.length - 1]
  const lastHead = lastSegments[0]
  if (
    !previousTail
    || !lastHead
    || previousTail.paragraphIndex !== lastHead.paragraphIndex
    || previousTail.to !== lastHead.from
  ) return pages
  const lastWords = lastSegments.reduce((sum, segment) => sum + Math.max(0, segment.to - segment.from), 0)
  const previousTailWords = previousTail.to - previousTail.from
  if (lastWords <= 0 || lastWords >= LAB_ORPHAN_PAGE_WORDS) return pages
  const move = Math.min(LAB_ORPHAN_PAGE_WORDS - lastWords, Math.max(0, previousTailWords - LAB_ORPHAN_PAGE_WORDS))
  if (move <= 0) return pages

  const next = pages.slice()
  const nextPreviousSegments = previousSegments.map((segment, index) => (
    index === previousSegments.length - 1 ? { ...segment, to: segment.to - move } : segment
  ))
  const nextLastSegments = lastSegments.map((segment, index) => (
    index === 0 ? { ...segment, from: segment.from - move } : segment
  ))
  next[lastIndex - 1] = {
    ...nextPreviousSegments[0],
    segments: nextPreviousSegments.length > 1 ? nextPreviousSegments : undefined,
  }
  next[lastIndex] = {
    ...nextLastSegments[0],
    segments: nextLastSegments.length > 1 ? nextLastSegments : undefined,
  }
  return next
}

/**
 * Where the page after `page` begins: the word after its last one, carrying
 * any hyphenated opening the page already showed of that word. Null when the
 * page ends the chapter.
 */
export function labResumeAfterPage(
  page: ChapterHearingPage | undefined,
  lengths: number[],
): LabPaginationStart | null {
  const tail = chapterPageTail(page)
  if (!tail) return null
  if (tail.to < (lengths[tail.paragraphIndex] ?? 0)) {
    return {
      paragraphIndex: tail.paragraphIndex,
      wordIndex: tail.to,
      ...(tail.tailFragment != null ? { headBreak: tail.tailFragment } : {}),
    }
  }
  for (let paragraphIndex = tail.paragraphIndex + 1; paragraphIndex < lengths.length; paragraphIndex += 1) {
    if (lengths[paragraphIndex] > 0) return { paragraphIndex, wordIndex: 0 }
  }
  return null
}

/**
 * The page map after the reserved foot changes height under an open page
 * (the audio transport opening or closing). The pages up to and including
 * the one on screen are kept exactly — no word the reader is looking at
 * moves; with the transport up it simply covers that page's last line — and
 * only the rest of the chapter is laid out again, from the word after the
 * kept page, at the new height. `paginateFrom` lays out a remainder;
 * `fitEnd` reserves the chapter actions on the final leaf.
 */
export function labPagesKeepingPrefix(
  kept: ChapterHearingPage[],
  lengths: number[],
  paginateFrom: (start: LabPaginationStart) => ChapterHearingPage[],
  fitEnd?: (pages: ChapterHearingPage[]) => ChapterHearingPage[],
): ChapterHearingPage[] {
  if (kept.length === 0) return kept
  const start = labResumeAfterPage(kept[kept.length - 1], lengths)
  if (!start) return kept
  const rest = paginateFrom(start)
  if (rest.length === 0) return kept
  const pages = [...kept, ...rest]
  return fitEnd ? fitEnd(pages) : pages
}

/** Convert browser-laid-out word columns into the existing reader page contract. */
export function nativePagesFromPlacements(
  placements: LabNativeWordPlacement[],
): ChapterHearingPage[] {
  if (placements.length === 0) return []
  const lastPage = placements.reduce((max, placement) => Math.max(max, placement.pageIndex), 0)
  const pageSegments = Array.from({ length: lastPage + 1 }, () => [] as ChapterPageSegment[])

  placements.forEach((placement) => {
    const segments = pageSegments[placement.pageIndex]
    const tail = segments[segments.length - 1]
    if (tail && tail.paragraphIndex === placement.paragraphIndex && tail.to === placement.wordIndex) {
      tail.to += 1
      return
    }
    segments.push({
      paragraphIndex: placement.paragraphIndex,
      from: placement.wordIndex,
      to: placement.wordIndex + 1,
    })
  })

  const pages = pageSegments.filter(segments => segments.length > 0).map((segments) => {
    const first = segments[0]
    return {
      ...first,
      segments: segments.length > 1 ? segments : undefined,
    }
  })
  return balanceNativeChapterTail(pages)
}

function nativeWordSpacing(
  word: { text: string },
  wordIndex: number,
  previous?: { text: string },
): string {
  if (wordIndex <= 0 || word.text.startsWith("'") || word.text.startsWith(',') || word.text.startsWith('.')) return ''
  // Mirrors LabPassage.wordSpacing exactly: the paginator must measure the same
  // characters the reading column renders, or pages break in different places.
  return previous && isLabVerseMarker(previous.text) ? LAB_VERSE_SEPARATOR : ' '
}

function NativeWord({
  text,
  paragraphIndex,
  wordIndex,
  spacing,
  paragraph,
}: {
  text: string
  paragraphIndex: number
  wordIndex: number
  spacing: string
  paragraph?: string
}) {
  // A link is laid out as painted: its label, not the raw address.
  const link = wordLink(paragraph, wordIndex, text)
  const figure = figureFor(text)
  return (
    <>
      {spacing}
      <span
        className={figure ? 'lab-hearing-word lab-figure-word' : 'lab-hearing-word'}
        data-native-word="true"
        data-paragraph-index={paragraphIndex}
        data-word-index={wordIndex}
      >
        {figure ? <LabFigureView figure={figure} /> : link ? <>{link.lead}<a className={`lab-link${link.end ? ' is-link-end' : ''}`}>{link.label}</a>{link.trail}</> : isLabVerseMarker(text) ? (
          <span className="lab-verse-mark">{labVerseMarkerDisplay(text)}</span>
        ) : text}
      </span>
    </>
  )
}

function nativeParagraphWords(text: string, paragraphIndex: number): ReactNode[] {
  const words = tokenizeHearingWords(text)
  const rendered: Array<{ at: number; node: ReactNode }> = []
  for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
    const word = words[wordIndex]
    const node = (
      <NativeWord
        key={wordIndex}
        text={word.text}
        paragraphIndex={paragraphIndex}
        wordIndex={wordIndex}
        spacing={nativeWordSpacing(word, wordIndex, words[wordIndex - 1])}
        paragraph={text}
      />
    )
    if (isLabVerseMarker(word.text) && words[wordIndex + 1]) {
      const nextIndex = wordIndex + 1
      rendered.push({ at: wordIndex, node: (
        <Fragment key={`verse-${wordIndex}`}>
          {nativeWordSpacing(word, wordIndex, words[wordIndex - 1])}
          <span className="lab-verse-unit">
            <NativeWord
              text={word.text}
              paragraphIndex={paragraphIndex}
              wordIndex={wordIndex}
              spacing=""
            />
            <NativeWord
              text={words[nextIndex].text}
              paragraphIndex={paragraphIndex}
              wordIndex={nextIndex}
              spacing={nativeWordSpacing(words[nextIndex], nextIndex, word)}
            />
          </span>
        </Fragment>
      ) })
      wordIndex = nextIndex
    } else {
      rendered.push({ at: wordIndex, node })
    }
  }
  return nativeVerseLines(text, rendered)
}

/**
 * One painted visual paragraph: a source paragraph, plus any BSB poetry lines
 * joined to it (labPoetry), each in a `lab-prose-join` span after a space --
 * the same markup the reading page paints, so the column flow places words
 * where the reader will.
 */
function NativeParagraph({ paragraphs, run }: { paragraphs: string[]; run: number[] }) {
  return <p className={`lab-hearing-line${paragraphKindClass(paragraphs[run[0]])}`}>{run.map((paragraphIndex, position) => position === 0
    ? <Fragment key={paragraphIndex}>{nativeParagraphWords(paragraphs[paragraphIndex], paragraphIndex)}</Fragment>
    : <Fragment key={paragraphIndex}>{' '}<span className="lab-prose-join">{nativeParagraphWords(paragraphs[paragraphIndex], paragraphIndex)}</span></Fragment>)}</p>
}

/** Whole source paragraphs grouped into the visual paragraphs they paint as. */
function nativeRuns(paragraphs: string[]): number[][] {
  const joins = proseJoins(paragraphs)
  const runs: number[][] = []
  paragraphs.forEach((_, index) => {
    if (index > 0 && joins[index]) runs[runs.length - 1].push(index)
    else runs.push([index])
  })
  return runs
}

/**
 * Group a whole painted paragraph into one block per verse line, or leave it
 * exactly as it was for prose. The phone paints whole paragraphs, so the slice
 * always starts at word 0.
 */
function nativeVerseLines(text: string, rendered: Array<{ at: number; node: ReactNode }>): ReactNode[] {
  const ranges = presentationLineRanges(text, 0, rendered.length ? rendered[rendered.length - 1].at + 1 : 0)
  if (!ranges) return rendered.map(item => item.node)
  return ranges.map(([start, end], index) => {
    const speakerEnd = verseSpeakerEnd(text, start)
    return <span className={verseLineStarts(text) ? "lab-verse-line" : "lab-speech-run"} key={`verse-line-${index}`}>
    {start < speakerEnd && <span className="lab-verse-speaker">{rendered.filter(item => item.at >= start && item.at < Math.min(end, speakerEnd)).map(item => item.node)}</span>}
    <span className="lab-verse-dialogue">{rendered.filter(item => item.at >= Math.max(start, speakerEnd) && item.at < end).map(item => item.node)}</span>
    {isInternalVerseBreak(text, end) && <span className="lab-verse-break" aria-hidden="true" />}
  </span>
  })
}

/**
 * The column flow's pages for the words from `start` on, as stand-ins: a
 * head-first map (`headFirst` below) has its opening page exactly laid out and
 * these after it only until the rest of the chapter is, a moment later. They
 * are never shown: the reader does not turn onto a page of a head-first map.
 */
export function provisionalPagesAfter(preflight: ChapterHearingPage[], start: LabPaginationStart): ChapterHearingPage[] {
  const pages: ChapterHearingPage[] = []
  for (const page of preflight) {
    const kept: ChapterPageSegment[] = []
    for (const segment of chapterPageSegments(page)) {
      if (segment.paragraphIndex < start.paragraphIndex) continue
      if (segment.paragraphIndex === start.paragraphIndex && segment.to <= start.wordIndex) continue
      const from = segment.paragraphIndex === start.paragraphIndex ? Math.max(segment.from, start.wordIndex) : segment.from
      kept.push({
        paragraphIndex: segment.paragraphIndex,
        from,
        to: segment.to,
        ...(segment.paragraphIndex === start.paragraphIndex && from === start.wordIndex && start.headBreak != null ? { headBreak: start.headBreak } : {}),
      })
    }
    if (kept.length) pages.push({ ...kept[0], segments: kept })
  }
  return pages
}

/** A head-first map needs at least this many pages: the chapter's end fitting (fitChapterEnd) only ever changes its last page. */
const HEAD_FIRST_MIN_PAGES = 3

/** Layouts whose chapter map a paginator keeps, per paragraph list. */
const MEASURED_LAYOUTS = 4

/** How many font files have loaded: any that arrives can change a measured line. */
function loadedFontFaces(): number {
  let loaded = 0
  document.fonts?.forEach?.(face => { if (face.status === 'loaded') loaded += 1 })
  return loaded
}

export const LabNativePaginator = memo(function LabNativePaginator({
  chapterTitle,
  paragraphs,
  layoutKey,
  fillPages = false,
  chapterActions = false,
  hasNextChapter = false,
  editionKey,
  keepPages,
  headFirst = false,
  onPages,
}: {
  chapterTitle: string
  paragraphs: string[]
  layoutKey: string
  fillPages?: boolean
  chapterActions?: boolean
  hasNextChapter?: boolean
  /** Reading edition, for the hyphenation patterns a page-edge break needs. */
  editionKey?: string
  /**
   * Pages to keep verbatim at the head of the map (the reader's current page
   * and those before it) when the foot changes height under them. Only the
   * remainder is laid out at the new height. Ignored if the width changes.
   */
  keepPages?: ChapterHearingPage[]
  /**
   * The reader opens at this chapter's first page (a new reader, a chapter
   * start). The first map is then published as soon as its opening page is
   * laid out (`partial`), and the rest of the chapter is laid out right after
   * that page has painted, with the same layout, and published in full. The
   * opening page is the same in both: it is the first page of one layout.
   * Read when the chapter is measured, not one of its triggers.
   */
  headFirst?: boolean
  onPages: (pages: ChapterHearingPage[], paragraphs?: string[], partial?: boolean) => void
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const generationRef = useRef(0)
  // Chapter maps this paginator has measured, per paragraph list and layout.
  // Going back to a layout (Compare off, the other edition back on standby)
  // takes its map instead of laying the whole chapter out again.
  const measuredRef = useRef(new WeakMap<string[], Map<string, ChapterHearingPage[]>>())
  const headFirstRef = useRef(headFirst)
  headFirstRef.current = headFirst
  const hyphenLang = hyphenLangForEdition(editionKey)
  // Patterns arrive after the first layout. Re-measuring once they do is the
  // whole point: the first pass breaks between words, the second fills the
  // last lines. Both are correct pages, so the reader sees no error state.
  const [hyphensReady, setHyphensReady] = useState(() => (hyphenLang ? hyphenatorReady(hyphenLang) : false))
  useEffect(() => {
    if (!hyphenLang || hyphenatorReady(hyphenLang)) { setHyphensReady(!!hyphenLang && hyphenatorReady(hyphenLang)); return }
    let live = true
    void loadHyphenator(hyphenLang).then(() => { if (live) setHyphensReady(hyphenatorReady(hyphenLang)) })
    return () => { live = false }
  }, [hyphenLang])

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cancelled = false
    let firstFrame = 0
    let secondFrame = 0
    let publishedPages: ChapterHearingPage[] | null = null
    // The published map is a head-first one: its full map is always published, even if equal.
    let publishedPartial = false
    // The kept pages were laid out at this width; a different width (a
    // rotation) invalidates them and the whole chapter is laid out again.
    let keepWidth: number | null = null
    // The rest of a head-first map, waiting for its opening page to paint.
    let rest: { frame: number; timer: number } | null = null
    const cancelRest = () => {
      if (!rest) return
      cancelAnimationFrame(rest.frame)
      window.clearTimeout(rest.timer)
      rest = null
    }

    const measure = () => {
      if (cancelled) return
      const flow = host.querySelector('[data-native-page-flow]') as HTMLElement | null
      if (!flow) return
      const pageWidth = flow.getBoundingClientRect().width
      if (pageWidth <= 1) return
      const flowLeft = flow.getBoundingClientRect().left
      const wordNodes = flow.querySelectorAll<HTMLElement>('[data-native-word="true"]')
      const placements: LabNativeWordPlacement[] = []
      wordNodes.forEach((node) => {
        const paragraphIndex = Number(node.dataset.paragraphIndex)
        const wordIndex = Number(node.dataset.wordIndex)
        const rect = [...node.getClientRects()].find(item => item.width > 0 && item.height > 0)
        if (!rect || !Number.isInteger(paragraphIndex) || !Number.isInteger(wordIndex)) return
        placements.push({
          pageIndex: Math.max(0, Math.floor((rect.left - flowLeft + 0.5) / pageWidth)),
          paragraphIndex,
          wordIndex,
        })
      })
      let pages = nativePagesFromPlacements(placements)
      if (fillPages) {
        // The column flow keeps whole words together. The visible leaf allows
        // hyphenation, so that conservative map can leave several lines empty.
        // Fit actual leaf fragments offscreen, once per layout, before exposing
        // the map. Navigation then only selects a page; it never grows it live.
        const surface = host.querySelector<HTMLElement>('[data-native-fragment-surface]')!
        const header = surface.querySelector<HTMLElement>('.lab-passage-header')!
        const stage = surface.querySelector<HTMLElement>('.lab-hearing-stage')!
        const sourceWords = paragraphs.map(tokenizeHearingWords)
        // The book's own dashes break at a page edge from the first pass, as
        // the browser breaks them inside a page; dictionary breaks join once
        // the patterns land.
        const breakLang = hyphenLang && hyphensReady ? hyphenLang : null
        // A heading, label or index line is never hyphenated: at a page edge only its own dashes break.
        const wordBreaks = (paragraphIndex: number, wordIndex: number) => pageEdgeBreaks(
          sourceWords[paragraphIndex]?.[wordIndex]?.text ?? '', paragraphSetRagged(paragraphs[paragraphIndex]) ? null : breakLang, true,
        )
        const end = surface.querySelector<HTMLElement>('.lab-chapter-end')
        // The block holding the last segment's words in the latest trial.
        let tailBlock = null as Element | null
        // The trial on the stage: asking about the same page again (its line
        // starts, its last line's spacing, right after fitting it) reads that
        // layout instead of building it again.
        let onStage = ''
        const stageRows = measureRowsState()
        const paint = (segments: ChapterPageSegment[], first: boolean, withEnd: boolean) => {
          const trial = JSON.stringify([segments, first, withEnd])
          if (trial === onStage && stage.isConnected) return
          onStage = trial
          if (end) end.hidden = !withEnd
          header.hidden = !first
          // Rows this trial shares with the one on the stage stay painted (labMeasureRows).
          const runs = proseRuns(paragraphs, segments)
          const blocks = paintRows(stage, stageRows, runs.map(run => ({ key: JSON.stringify(run.map(index => segments[index])), build: () => {
            const p = document.createElement('p')
            p.className = 'lab-hearing-line'
            run.forEach((index, position) => {
              const segment = segments[index]
              const words = segmentWordTexts(sourceWords[segment.paragraphIndex], segment)
              const lineation = { text: paragraphs[segment.paragraphIndex], from: segment.from }
              if (position === 0) labMeasureParagraphInto(p, words, lineation, { plans: true })
              else labMeasureJoinInto(p, words, lineation, { plans: true })
            })
            return p
          } })))
          const last = blocks[blocks.length - 1]
          tailBlock = last ? (runs[runs.length - 1].length > 1 ? last.lastElementChild : last) : null
        }
        const lineStarts = (segments: ChapterPageSegment[], first: boolean) => {
          const tail = segments[segments.length - 1]
          if (!tail) return null
          paint(segments, first, false)
          return tailBlock ? measuredLineStarts(tailBlock, tail.from) : null
        }
        const tailGap = (segments: ChapterPageSegment[], first: boolean) => {
          if (!segments.length) return null
          paint(segments, first, false)
          const block = tailBlock?.closest('.lab-hearing-line') ?? null
          return block ? measuredTailGapEm(block) : null
        }
        const fits = (segments: ChapterPageSegment[], first: boolean, withEnd = false) => {
          paint(segments, first, withEnd)
          const painted = [...stage.querySelectorAll('.lab-hearing-word, .lab-word-fragment')]
          const last = painted[painted.length - 1]
          const lastBottom = last ? Math.max(...[...last.getClientRects()].map(rect => rect.bottom)) : Infinity
          const bottom = withEnd && end ? Math.max(lastBottom, end.getBoundingClientRect().bottom) : lastBottom
          return labPageFitsPaint({ lastBottom: bottom, chromeTop: host.getBoundingClientRect().bottom })
        }
        // Figures are sized from this page (labFigures); the page paints with the same.
        header.hidden = true
        stage.replaceChildren()
        onStage = ''
        const probe = document.createElement('p')
        probe.className = 'lab-hearing-line'
        stage.append(probe)
        const columnWidth = probe.getBoundingClientRect().width
        const pageHeight = host.getBoundingClientRect().bottom - probe.getBoundingClientRect().top
        const face = getComputedStyle(probe)
        const faceKey = [face.font, face.lineHeight, face.letterSpacing, face.wordSpacing, face.textAlign, face.textIndent, face.marginBottom, face.hyphens].join('|')
        setFigureLayout({ columnWidth, pageHeight })
        probe.remove()
        // Hyphens where a line needs one, chosen in this column (labHyphenPlan).
        const planKey = planHyphenation(stage, paragraphs, breakLang, (p, words, text, plan) => { labMeasureParagraphInto(p, words, { text, from: 0 }, { plan }) })
        onStage = ''
        const lengths = sourceWords.map(words => words.length)
        const fitEnd = chapterActions
          ? (list: ChapterHearingPage[]) => fitChapterEnd(list, (segments, first) => fits(segments, first, true), cleanPageStarts(sourceWords), lineStarts)
          : undefined
        if (keepPages?.length && keepWidth == null) keepWidth = pageWidth
        const kept = keepPages?.length && keepWidth === pageWidth
          ? labPagesKeepingPrefix(keepPages, lengths, start => measuredDesktopPages(lengths, fits, wordBreaks, Infinity, paragraphs, start, lineStarts, tailGap), fitEnd)
          : null
        if (kept && chapterPagesCover(paragraphs, kept)) pages = kept
        else {
          // Everything the map depends on: the column, the page, the face and
          // every loaded font file, the breaks and the hyphen plans.
          const layout = JSON.stringify([layoutKey, chapterTitle, chapterActions, hasNextChapter, breakLang, pageWidth, columnWidth, pageHeight, faceKey, planKey, loadedFontFaces()])
          let measured = measuredRef.current.get(paragraphs)
          if (!measured) measuredRef.current.set(paragraphs, measured = new Map())
          const known = measured.get(layout)
          if (known) {
            pages = known
            measured.delete(layout)
          } else {
            const preflight = pages
            const opening: { page: ChapterHearingPage | null } = { page: null }
            const steps = measuredDesktopPageSteps(lengths, fits, wordBreaks, Infinity, paragraphs, undefined, lineStarts, tailGap, closed => {
              if (!opening.page && closed.length) opening.page = closed[0]
            })
            const headOnly = headFirstRef.current && !publishedPages && preflight.length >= HEAD_FIRST_MIN_PAGES
            let step = steps.next()
            while (!step.done && !(headOnly && opening.page)) step = steps.next()
            const start = !step.done && opening.page ? labResumeAfterPage(opening.page, lengths) : null
            const head = start && opening.page ? [opening.page, ...provisionalPagesAfter(preflight, start)] : null
            if (head && placements.length === wordNodes.length && chapterPagesCover(paragraphs, head)) {
              publishedPages = head
              publishedPartial = true
              onPages(head, paragraphs, true)
              const layoutMap = measured
              // The same layout carries on from the page it closed, on the
              // same stage, once that page has painted (two frames, then a task).
              const finish = () => {
                rest = null
                if (cancelled) return
                let next = steps.next()
                while (!next.done) next = steps.next()
                let full = next.value
                if (fitEnd) full = fitEnd(full)
                layoutMap.set(layout, full)
                while (layoutMap.size > MEASURED_LAYOUTS) layoutMap.delete(layoutMap.keys().next().value!)
                if (end) end.hidden = true
                stage.replaceChildren()
                if (chapterPagesCover(paragraphs, full)) {
                  publishedPages = full
                  publishedPartial = false
                  onPages(full, paragraphs)
                }
              }
              const pending = { frame: 0, timer: 0 }
              pending.frame = requestAnimationFrame(() => {
                pending.frame = requestAnimationFrame(() => { pending.timer = window.setTimeout(finish, 0) })
              })
              rest = pending
              return
            }
            while (!step.done) step = steps.next()
            pages = step.value
            if (fitEnd) pages = fitEnd(pages)
          }
          measured.set(layout, pages)
          while (measured.size > MEASURED_LAYOUTS) measured.delete(measured.keys().next().value!)
        }
        if (end) end.hidden = true
        stage.replaceChildren()
      }
      if (placements.length === wordNodes.length && chapterPagesCover(paragraphs, pages)
        && (!publishedPages || publishedPartial || !sameChapterPages(publishedPages, pages))) {
        // loadingdone also fires for toolbar fonts. Re-publishing an unchanged
        // preflight map would erase the visible-page rounding corrections and
        // move the reader backwards. A changed reading font/layout still emits
        // its genuinely different map, and a new effect always publishes once.
        publishedPages = pages
        publishedPartial = false
        onPages(pages, paragraphs)
      }
    }

    const schedule = () => {
      // A newer measurement replaces the rest still to come.
      cancelRest()
      const generation = ++generationRef.current
      if (firstFrame) cancelAnimationFrame(firstFrame)
      if (secondFrame) cancelAnimationFrame(secondFrame)
      void Promise.resolve(document.fonts?.ready).then(() => {
        if (cancelled || generation !== generationRef.current) return
        firstFrame = requestAnimationFrame(() => {
          const flow = host.querySelector('[data-native-page-flow]') as HTMLElement | null
          const pageWidth = flow?.getBoundingClientRect().width ?? 0
          if (flow && pageWidth > 1) flow.style.columnWidth = `${pageWidth}px`
          secondFrame = requestAnimationFrame(() => {
            if (!cancelled && generation === generationRef.current) measure()
          })
        })
      })
    }

    schedule()
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null
    observer?.observe(host)
    document.fonts?.addEventListener?.('loadingdone', schedule)
    return () => {
      cancelled = true
      cancelRest()
      generationRef.current += 1
      if (firstFrame) cancelAnimationFrame(firstFrame)
      if (secondFrame) cancelAnimationFrame(secondFrame)
      observer?.disconnect()
      document.fonts?.removeEventListener?.('loadingdone', schedule)
    }
  }, [chapterTitle, paragraphs, layoutKey, fillPages, chapterActions, hasNextChapter, onPages, hyphenLang, hyphensReady, keepPages])

  return (
    <div ref={hostRef} className="lab-page-measure lab-native-page-measure" aria-hidden="true" data-testid="lab-native-page-measure">
      <article className="lab-passage lab-book is-reading lab-native-page-surface">
        <div className="lab-native-page-flow" data-native-page-flow>
          <LabChapterHeading title={chapterTitle} preview={chapterActions} measuring />
          <div className="lab-book-columns">
            <div className="lab-book-col">
              <div className="lab-hearing-stage">
                {nativeRuns(paragraphs).map(run => (
                  <NativeParagraph key={run[0]} paragraphs={paragraphs} run={run} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
      {fillPages && <article className="lab-passage lab-book is-reading lab-native-fragment-surface" data-native-fragment-surface>
        <LabChapterHeading title={chapterTitle} preview={chapterActions} measuring />
        <div className="lab-book-columns"><div className="lab-book-col"><div className="lab-hearing-stage" />{chapterActions && <LabChapterEnd chapterTitle={chapterTitle} hasNext={hasNextChapter} measuring />}</div></div>
      </article>}
    </div>
  )
})
