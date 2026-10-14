import { proseRuns, sliceJoinsPrevious } from './labPoetry'
import { measureRowsState, paintRows, type MeasureRow } from './labMeasureRows'
import { LabChapterHeading } from './LabChapterHeading'
import { LabChapterEnd } from './LabChapterEnd'
import { cleanPageStarts, fitChapterEnd } from './labChapterEndPaging'
import { buildVerseAlignment, needsVerseAlignment, verseGroups } from './labVerseAlignment'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { hyphenLangForEdition, hyphenatorReady, loadHyphenator, pageEdgeBreaks } from './labHyphenate'
import { chapterPageSegments, segmentWordTexts, tokenizeHearingWords, type ChapterHearingPage, type ChapterPageSegment } from './labHearing'
import { paragraphKeepsWithNext, paragraphSetRagged } from './labParagraphStyle'
import { isFigureToken, setFigureLayout } from './labFigures'
import { LAB_CONTINUED_TAIL_MAX_GAP_EM, labMeasureJoinInto, labMeasureParagraphInto, measuredLineStarts, measuredTailGapEm } from './labMeasureParagraph'

/** Proportional word boundaries preserve all of each aligned paragraph, even
 * when the two editions have different lengths. No translated words are lost. */
export function comparisonSegment(segment: ChapterPageSegment, primary: string[], comparison: string[]): ChapterPageSegment {
  const sourceLength = tokenizeHearingWords(primary[segment.paragraphIndex] || '').length
  const targetLength = tokenizeHearingWords(comparison[segment.paragraphIndex] || '').length
  return { paragraphIndex: segment.paragraphIndex,
    from: Math.floor(segment.from * targetLength / Math.max(1, sourceLength)),
    to: segment.to >= sourceLength ? targetLength : Math.floor(segment.to * targetLength / Math.max(1, sourceLength)) }
}

/**
 * Where a word may be broken, for the paginator: character offsets into the
 * word at `wordIndex`, ascending. Supplying none keeps the old behaviour
 * exactly — every page break lands between whole words.
 */
export type WordBreakLookup = (paragraphIndex: number, wordIndex: number) => number[]

/**
 * Where the painted lines of a trial page begin: word indexes, in the
 * paragraph of the page's LAST segment, that start a line when `segments` is
 * laid out. Null when the layout cannot say (the paginator then keeps its
 * older word-count rules for that page).
 */
export type LineStartLookup = (segments: ChapterPageSegment[], first: boolean) => number[] | null

/**
 * How widely the last painted line of a trial page would be spaced if it were
 * justified to the margin, in ems (`continuedTailJustifiedGap`). Null when the
 * layout cannot say.
 */
export type TailGapLookup = (segments: ChapterPageSegment[], first: boolean) => number | null

/** Greedily fill the measured page, splitting a long paragraph at a word.
 * Both columns are measured as a paired row, so subsequent paragraphs align.
 *
 * With `breaks`, a page that still has room on its last line for part of the
 * next word takes it, hyphenated, rather than ending short: the longest break
 * that still fits wins, so the line is filled as far as it can be. The word is
 * then shared with the next page (see `segmentWordTexts`). Without `breaks`,
 * or where no break fits, the page ends between words as it always has.
 *
 * With `start`, pagination resumes mid-chapter at that word — the point just
 * after a page that is being kept as it is. No page of the result is the
 * chapter's first (no heading), and `headBreak` continues a word the kept page
 * already showed the opening of.
 *
 * With `lineStarts`, a page break is only ever moved back (a paragraph's last
 * words kept off the next page, a new sentence's first word or two kept
 * together) to the START of a painted line, so the page still ends on a full
 * line. A page whose paragraph continues sets its last line like any
 * interior line; moving the break to a mid-line sentence end left that line
 * short and ragged ("made in science." | "He soon noticed", Frankenstein;
 * nightly QA, Oct 2026), or justified across giant gaps. Where no line start
 * qualifies, the page keeps its natural, filled end.
 *
 * With `tailGap`, a page whose paragraph continues never ends on a line that
 * justifying would stretch beyond `LAB_CONTINUED_TAIL_MAX_GAP_EM` (Anders,
 * iPhone, 6 Oct 2026): the next word has already been offered to that line as
 * a hyphenated fragment; if the line is still too loose, the page ends a line
 * earlier, on a line the browser itself filled. */
export interface LabPaginationStart {
  paragraphIndex: number
  wordIndex: number
  headBreak?: number
}

/** How long one task may lay out pages before the browser gets the thread back. */
const MEASURE_SLICE_MS = 50

/** Fewer words than this left of a paragraph would open the next page as a stray line. */
const WIDOW_WORDS = 4
/** How far back a stray line may reach for the start of its sentence. */
const WIDOW_SENTENCE_REACH = 14

export function measuredDesktopPages(
  lengths: number[],
  fits: (segments: ChapterPageSegment[], first: boolean) => boolean,
  breaks?: WordBreakLookup,
  pageLimit = Infinity,
  paragraphs?: string[],
  start?: LabPaginationStart,
  lineStarts?: LineStartLookup,
  tailGap?: TailGapLookup,
): ChapterHearingPage[] {
  const steps = measuredDesktopPageSteps(lengths, fits, breaks, pageLimit, paragraphs, start, lineStarts, tailGap)
  let step = steps.next()
  while (!step.done) step = steps.next()
  return step.value
}

/**
 * `measuredDesktopPages`, one page at a time: the generator pauses after each
 * page it closes (yielding how many are closed) and returns the finished map.
 * A caller that lays out a whole chapter can spread the work over several
 * tasks and drop it the moment it is stale; draining it in one go is exactly
 * `measuredDesktopPages`.
 */
export function* measuredDesktopPageSteps(
  lengths: number[],
  fits: (segments: ChapterPageSegment[], first: boolean) => boolean,
  breaks?: WordBreakLookup,
  pageLimit = Infinity,
  paragraphs?: string[],
  start?: LabPaginationStart,
  lineStarts?: LineStartLookup,
  tailGap?: TailGapLookup,
): Generator<number, ChapterHearingPage[], void> {
  const pages: ChapterHearingPage[] = []
  let segments: ChapterPageSegment[] = []
  // A figure that did not fit the rest of its page opens the next one.
  let deferred: ChapterPageSegment | null = null
  const commit = () => {
    if (segments.length) pages.push({ ...segments[0], segments })
    segments = deferred ? [deferred] : []
    deferred = null
  }
  const isFirst = () => !start && pages.length === 0
  for (let paragraphIndex = 0; paragraphIndex < lengths.length; paragraphIndex += 1) {
    const length = lengths[paragraphIndex]
    if (pages.length >= pageLimit) break
    if (start && paragraphIndex < start.paragraphIndex) continue
    const resumes = start && paragraphIndex === start.paragraphIndex
    let from = resumes ? start.wordIndex : 0
    let headBreak: number | undefined = resumes && start.wordIndex < length ? start.headBreak : undefined
    // A figure (labFigures) that does not fit the rest of the page floats to
    // the top of the next one while the text after it keeps filling this page.
    // One at a time; a figure alone on its page stays where it is.
    if (!resumes && length === 1 && segments.length && !deferred && paragraphIndex < lengths.length - 1
      && isFigureToken(paragraphs?.[paragraphIndex]) && !fits([...segments, { paragraphIndex, from: 0, to: 1 }], isFirst())) {
      deferred = { paragraphIndex, from: 0, to: 1 }
      continue
    }
    while (from < length && pages.length < pageLimit) {
      const segment = (to: number, tailFragment?: number): ChapterPageSegment => ({
        paragraphIndex,
        from,
        to,
        ...(headBreak != null ? { headBreak } : {}),
        ...(tailFragment != null ? { tailFragment } : {}),
      })
      const full = segment(length)
      if (fits([...segments, full], isFirst())) { segments.push(full); break }
      let low = from, high = length
      while (low < high) {
        const to = Math.ceil((low + high) / 2)
        if (fits([...segments, segment(to)], isFirst())) low = to
        else high = to - 1
      }
      if (low === from && segments.length) {
        // Keep with next: a page never ends on a heading (or a label) whose
        // text starts overleaf. It opens the next page instead, above it.
        const carried: ChapterPageSegment[] = []
        while (segments.length > 1) {
          const tail = segments[segments.length - 1]
          const whole = tail.from === 0 && tail.to === lengths[tail.paragraphIndex] && tail.headBreak == null && tail.tailFragment == null
          if (!whole || !paragraphKeepsWithNext(paragraphs?.[tail.paragraphIndex])) break
          carried.unshift(segments.pop()!)
        }
        commit()
        segments = [...segments, ...carried]
        yield pages.length
        continue
      }
      let to = Math.max(from + 1, low)
      // The line starts of the page as it naturally fills, measured once and
      // only when a rule below wants to move the break.
      let starts: Set<number> | null | undefined
      const naturalLineStarts = () => {
        if (starts === undefined) {
          const found = lineStarts?.([...segments, segment(to)], isFirst())
          starts = found ? new Set(found) : null
        }
        return starts
      }
      // A paragraph's last word or two never open a page alone ("God."):
      // carry their whole sentence when it starts close by, else a few words.
      if (paragraphs && to < length && length - to < WIDOW_WORDS && length - WIDOW_WORDS > from) {
        const words = tokenizeHearingWords(paragraphs[paragraphIndex])
        let cut = length - WIDOW_WORDS
        for (let start = to; start > Math.max(from, length - WIDOW_SENTENCE_REACH); start--) {
          if (/[.!?;:][”’"')]*$/.test(words[start - 1]?.text || '')) { cut = Math.min(cut, start); break }
        }
        const lines = naturalLineStarts()
        if (!lines) to = cut
        else {
          // Back to the start of the line that holds the cut, so the page
          // ends on the full line above it. None on this page: the page keeps
          // its natural, filled end.
          let line = -1
          for (const at of lines) if (at > from && at <= cut && at > line) line = at
          if (line > 0) to = line
        }
      }
      if (paragraphs && to < length) {
        const words = tokenizeHearingWords(paragraphs[paragraphIndex])
        const lines = naturalLineStarts()
        // Avoid a page ending with just the first word or two of a new
        // sentence (e.g. "Thus"). Never remove a whole page or skip a word.
        // Measured: only when those words are all the last line holds.
        for (let cut = to - 1; cut >= Math.max(from + 1, to - 2); cut--) {
          if (/[.!?][”’"')]*$/.test(words[cut - 1]?.text || '')) {
            if (!lines || lines.has(cut)) to = cut
            break
          }
        }
      }
      // The last line has whatever room the next whole word could not use. The
      // fragment is display only: `to` does not move, so this page still owns
      // exactly the words it owned and the next page owns the broken word.
      // Longest break first: the most of the word that still fits.
      let tailFragment: number | undefined
      if (to === low && to < length && breaks) {
        const points = breaks(paragraphIndex, to)
        for (let index = points.length - 1; index >= 0; index -= 1) {
          if (fits([...segments, segment(to, points[index])], isFirst())) {
            tailFragment = points[index]
            break
          }
        }
      }
      if (tailGap && to < length) {
        const gap = tailGap([...segments, segment(to, tailFragment)], isFirst())
        if (gap != null && gap > LAB_CONTINUED_TAIL_MAX_GAP_EM) {
          // The line starts of the page as it ends now (the rules above may have moved `to`).
          const lines = lineStarts?.([...segments, segment(to)], isFirst()) ?? null
          let line = -1
          for (const at of lines ?? []) if (at > from && at < to && at > line) line = at
          if (line > from) { to = line; tailFragment = undefined }
          // A one-line opening of a new paragraph goes overleaf whole.
          else if (lines && segments.length && from === 0 && headBreak == null) { to = from; tailFragment = undefined }
        }
      }
      if (to > from) segments.push(segment(to, tailFragment))
      commit()
      yield pages.length
      if (to === from) continue
      // Whatever this page showed of the next word, that page resumes after.
      headBreak = tailFragment
      from = to
    }
  }
  commit()
  commit()
  return pages
}

/**
 * How many words one leaf of this layout holds, measured rather than inferred
 * from the chapter in front of the reader. A one-page Psalm has no full page,
 * and its handful of words divided by its one page would claim a tiny leaf and
 * throw off every book-wide figure built on it. Laying the chapter out as a
 * single block gives words-per-line; the leaf's own height gives lines-per-leaf.
 */
export interface LabLeafCapacity {
  /** Words one leaf of this layout holds. */
  wordsPerPage: number
  /** The leaf height it was measured at; the figure is only valid for that leaf. */
  leafHeight: number
}

export function measuredLeafCapacity(page: HTMLElement, probe: HTMLElement, words: number): LabLeafCapacity | null {
  const lineHeight = parseFloat(getComputedStyle(probe).lineHeight)
  const leafHeight = page.getBoundingClientRect().height
  const probeHeight = probe.getBoundingClientRect().height
  if (!(lineHeight > 0) || !(leafHeight > 0) || !(probeHeight > 0) || words <= 0) return null
  const lines = Math.max(1, Math.round(probeHeight / lineHeight))
  const linesPerLeaf = Math.max(1, Math.floor(leafHeight / lineHeight))
  return { wordsPerPage: Math.max(1, Math.round((words / lines) * linesPerLeaf)), leafHeight: Math.round(leafHeight) }
}

export function LabDesktopPaginator({ paragraphs, comparison, chapterTitle, layoutKey, editionKey, chapterActions = false, hasNextChapter = false, pageLimit, onPages }: {
  paragraphs: string[]; comparison?: string[]; chapterTitle: string; layoutKey: string
  chapterActions?: boolean; hasNextChapter?: boolean
  /** Bound a next-chapter opening measurement without truncating its source. */
  pageLimit?: number
  /** Reading edition, for the hyphenation patterns a page-edge break needs. */
  editionKey?: string
  onPages: (pages: ChapterHearingPage[], content: string[], key: string, capacity: LabLeafCapacity | null, endInFooter?: boolean) => void
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const callbackRef = useRef(onPages)
  callbackRef.current = onPages
  // Same two-pass arrangement as the phone reader: break between words until
  // the patterns land, then re-measure and fill the last lines.
  const hyphenLang = hyphenLangForEdition(editionKey)
  const [hyphensReady, setHyphensReady] = useState(() => (hyphenLang ? hyphenatorReady(hyphenLang) : false))
  useEffect(() => {
    if (!hyphenLang) { setHyphensReady(false); return }
    if (hyphenatorReady(hyphenLang)) { setHyphensReady(true); return }
    let live = true
    void loadHyphenator(hyphenLang).then(() => { if (live) setHyphensReady(hyphenatorReady(hyphenLang)) })
    return () => { live = false }
  }, [hyphenLang])
  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cancelled = false, frame = 0, generation = 0, slice = 0
    // The host size the last map was measured at. A new ResizeObserver always
    // reports once on observe; when that size is the one just measured, a
    // second full measurement would only repeat the first.
    let measuredSize = ''
    const hostSize = () => `${host.clientWidth}x${host.clientHeight}`
    // The host size when this measurement was asked for. A window being
    // resized (a maximise, a tile, a drag) reports a new size every frame;
    // laying the whole chapter out for each passing size blocked the page for
    // seconds and left it blank, its last painted frame stuck at the old width
    // (To the Lighthouse, Chrome, half screen to full screen; Anders, 9 Oct
    // 2026). The chapter is measured once the box has kept its size for a frame.
    let askedSize = ''
    // A measurement in progress (see `measuredDesktopPageSteps`) gives way to a
    // newer request; this counts how often in a row one has, so a box that
    // never stops changing still gets its pages.
    let busy = false, yielded = 0
    const source = paragraphs.map(tokenizeHearingWords)
    const target = comparison?.map(tokenizeHearingWords)
    // Editions paragraphed differently (BSB beside KJV) pair verse by verse.
    const alignment = comparison && needsVerseAlignment(paragraphs, comparison) ? buildVerseAlignment(paragraphs, comparison) : null
    // Emphasised words paint in the italic face. Requested with the upright one
    // so the map is measured with it: arriving mid-measurement, it restarted
    // the measurement (and before that, re-measured the whole chapter once the
    // first map, set in a stand-in italic, was already up).
    const emphasised = [...source, ...(target ?? [])].flatMap(words => words.filter(word => word.emphasis).map(word => word.text)).join(' ')
    const schedule = () => {
      const revision = ++generation
      cancelAnimationFrame(frame)
      askedSize = hostSize()
      // An empty measurement tree has not requested the reading font yet.
      // Request the actual body and heading faces before awaiting fonts.ready;
      // otherwise the first map can be measured with the fallback font.
      const rows = host.querySelector<HTMLElement>('.lab-desktop-measure-rows')!
      const heading = host.querySelector<HTMLElement>('.lab-passage-headline')!
      const probe = document.createElement('p')
      probe.className = 'lab-hearing-line'
      probe.textContent = paragraphs.join(' ')
      rows.replaceChildren(probe)
      const fonts = document.fonts
      const bodyFont = getComputedStyle(probe).font
      const requested = fonts ? [
        fonts.load(bodyFont, probe.textContent),
        fonts.load(getComputedStyle(heading).font, chapterTitle),
        ...(emphasised ? [fonts.load(`italic ${bodyFont}`, emphasised)] : []),
      ] : []
      // The probe was only needed for its computed font. Left in the tree, the
      // whole chapter as one paragraph is laid out again in every frame until
      // the measurement starts.
      probe.remove()
      void Promise.allSettled(requested).then(() => fonts?.ready).then(() => {
        if (cancelled || revision !== generation) return
        const begin = () => {
          if (cancelled || revision !== generation || host.clientWidth < 10 || host.clientHeight < 10) return
          // Still resizing, or the previous measurement is finishing (below):
          // look again next frame. Nothing is measured for a passing size.
          const size = hostSize()
          if (size !== askedSize || busy) { askedSize = size; frame = requestAnimationFrame(begin); return }
          measuredSize = size
          const page = host.querySelector<HTMLElement>('.lab-desktop-measure-page')!
          const header = host.querySelector<HTMLElement>('.lab-passage-header')!
          const rows = host.querySelector<HTMLElement>('.lab-desktop-measure-rows')!
          // Desktop leaves keep the browser's own dictionary hyphenation (at most
          // two hyphenated lines in a row, lab.css); planned hyphens
          // (labHyphenPlan) are for the phone's narrow column only.
          const breakLang = hyphenLang && hyphensReady ? hyphenLang : null
          // Figures are sized from this leaf (labFigures); the page paints with the same.
          // The next chapter's opening (pageLimit) is measured in the same leaf and sets nothing.
          if (pageLimit == null) {
            const probeRow = document.createElement('div')
            probeRow.className = 'lab-desktop-measure-row'
            const probe = document.createElement('p')
            probe.className = 'lab-hearing-line'
            probeRow.append(probe)
            if (comparison) probeRow.append(document.createElement('p'))
            header.hidden = true
            rows.replaceChildren(probeRow)
            setFigureLayout({ columnWidth: probe.getBoundingClientRect().width, pageHeight: page.getBoundingClientRect().height })
            rows.replaceChildren()
          }
          const makeParagraph = (segment: ChapterPageSegment, words: ReturnType<typeof tokenizeHearingWords>[], texts: string[]) => {
            const p = document.createElement('p')
            p.className = 'lab-hearing-line'
            // The measured and visible desktop pages share dictionary
            // hyphenation and both carry the painted word
            // markup. A plain-text probe measured a verse number as full-size
            // body digits in a strut-height line; painted it is a small
            // superscript inside a taller inline-block, so pages were packed
            // against a line box that was the wrong width and the wrong height.
            return labMeasureParagraphInto(
              p,
              segmentWordTexts(words[segment.paragraphIndex] || [], segment),
              { text: texts[segment.paragraphIndex], from: segment.from },
            )
          }
          const end = page.querySelector<HTMLElement>('.lab-chapter-end')
          // Rows a trial shares with the one on the stage stay painted (labMeasureRows).
          const painted = measureRowsState()
          const fits = (segments: ChapterPageSegment[], first: boolean, withEnd = false) => {
            if (end) end.hidden = !withEnd
            header.hidden = !first
            const next: MeasureRow[] = []
            if (comparison && target && alignment) {
              // Verse-paired rows: a compare cell spans the primary lines of
              // its verses (see LabPassage), so measure each verse group as
              // one row. The primary stack keeps its lines' own margins, as
              // separate grid rows do.
              for (const group of verseGroups(segments, alignment)) next.push({ key: JSON.stringify([group.segments, group.pieces]), build: () => {
                const row = document.createElement('div')
                row.className = 'lab-desktop-measure-row'
                const stack = document.createElement('div')
                stack.style.cssText = 'display:flex;flex-direction:column'
                group.segments.forEach((segment, index) => {
                  const line = makeParagraph(segment, source, paragraphs)
                  // A joined BSB line keeps its own row here, set tight (LabPassage).
                  if (sliceJoinsPrevious(paragraphs, group.segments[index - 1], segment)) line.classList.add('is-joined-row')
                  stack.append(line)
                })
                const cell = document.createElement('div')
                cell.className = 'lab-compare-cell'
                for (const run of proseRuns(comparison, group.pieces)) {
                  const p = makeParagraph(group.pieces[run[0]], target, comparison)
                  for (const index of run.slice(1)) {
                    const piece = group.pieces[index]
                    labMeasureJoinInto(p, segmentWordTexts(target[piece.paragraphIndex] || [], piece), { text: comparison[piece.paragraphIndex], from: piece.from })
                  }
                  cell.append(p)
                }
                row.append(stack, cell)
                return row
              } })
            } else if (comparison && target) for (const segment of segments) next.push({ key: JSON.stringify(segment), build: () => {
              const row = document.createElement('div')
              row.className = 'lab-desktop-measure-row'
              row.append(makeParagraph(segment, source, paragraphs))
              row.append(makeParagraph(comparisonSegment(segment, paragraphs, comparison), target, comparison))
              return row
            } })
            else for (const run of proseRuns(paragraphs, segments)) next.push({ key: JSON.stringify(run.map(index => segments[index])), build: () => {
              // BSB poetry lines paint inside one visual paragraph (labPoetry).
              const row = document.createElement('div')
              row.className = 'lab-desktop-measure-row'
              const p = makeParagraph(segments[run[0]], source, paragraphs)
              for (const index of run.slice(1)) {
                const segment = segments[index]
                labMeasureJoinInto(p, segmentWordTexts(source[segment.paragraphIndex] || [], segment), { text: paragraphs[segment.paragraphIndex], from: segment.from })
              }
              row.append(p)
              return row
            } })
            paintRows(rows, painted, next)
            const bottom = withEnd && end ? end.getBoundingClientRect().bottom : rows.getBoundingClientRect().bottom
            return bottom <= page.getBoundingClientRect().bottom + .1
          }
          const lineStarts: LineStartLookup | undefined = comparison ? undefined : (segments, first) => {
            const tail = segments[segments.length - 1]
            if (!tail) return null
            fits(segments, first)
            const block = rows.lastElementChild?.querySelector('.lab-hearing-line')
            if (!block) return null
            const runs = proseRuns(paragraphs, segments)
            const join = (runs[runs.length - 1]?.length ?? 0) > 1 ? block.lastElementChild : null
            return measuredLineStarts(join ?? block, tail.from)
          }
          const steps = measuredDesktopPageSteps(
            source.map(words => words.length),
            fits,
            // A heading, label or index line is never hyphenated: at a page edge only its own dashes break.
            (paragraphIndex, wordIndex) => pageEdgeBreaks(source[paragraphIndex]?.[wordIndex]?.text ?? '', paragraphSetRagged(paragraphs[paragraphIndex]) ? null : breakLang),
            pageLimit,
            paragraphs,
            undefined,
            // Single-edition leaves only: a paired row's primary column sits
            // beside its comparison, and the older word-count rules stay.
            lineStarts,
            comparison ? undefined : (segments, first) => {
              if (!segments.length) return null
              fits(segments, first)
              const block = rows.lastElementChild?.querySelector('.lab-hearing-line')
              return block ? measuredTailGapEm(block) : null
            },
          )
          // The chapter is laid out a few pages per task, so the browser keeps
          // painting (the reader's chrome follows the window) and a measurement
          // for a size that has already gone is dropped at its next page
          // instead of being finished. One that has given way twice in a row
          // finishes, and the newer request waits for it.
          busy = true
          const run = () => {
            slice = 0
            if (cancelled) { busy = false; return }
            if (revision !== generation && yielded < 2) { yielded += 1; busy = false; return }
            const until = performance.now() + MEASURE_SLICE_MS
            let step = steps.next()
            while (!step.done && performance.now() < until) step = steps.next()
            if (!step.done) { slice = window.setTimeout(run, 0); return }
            busy = false
            yielded = 0
            finish(step.value)
          }
          const finish = (measured: ChapterHearingPage[]) => {
            let pages = measured
            const tail = pages.length ? chapterPageSegments(pages[pages.length - 1]).at(-1) : undefined
            const complete = tail?.paragraphIndex === source.length - 1 && tail.to === source[source.length - 1]?.length
            let endInFooter = false
            if (chapterActions && pages.length && complete) {
              const lastFits = fits(chapterPageSegments(pages[pages.length - 1]), pages.length === 1, true)
              // The bottom padding is already reserved for folios. Only borrow
              // it if the complete action row fits; the matching folio is hidden.
              // The row is measured as it is shown there (is-docked: compact),
              // below its 2px top margin and 1px clear of the leaf's edge.
              const footerSpace = parseFloat(getComputedStyle(host).getPropertyValue('--desktop-pad-bottom')) - 3
              let dockedHeight = Infinity
              if (end) {
                end.classList.add('is-docked')
                dockedHeight = end.getBoundingClientRect().height
                end.classList.remove('is-docked')
              }
              endInFooter = !comparison && !lastFits && !!end && dockedHeight <= footerSpace
              if (!lastFits && !endInFooter) pages = fitChapterEnd(pages, (segments, first) => fits(segments, first, true), cleanPageStarts(source), lineStarts)
            }
            if (end) end.hidden = true
            header.hidden = true
            if (pageLimit != null) {
              rows.replaceChildren()
              callbackRef.current(pages, paragraphs, layoutKey, null, endInFooter)
              return
            }
            const capacityProbe = document.createElement('p')
            capacityProbe.className = 'lab-hearing-line'
            labMeasureParagraphInto(capacityProbe, source.flat())
            // A paired measure row is a two-column grid; an unwrapped probe would
            // run the full spread width and claim twice the words per line.
            const capacityRow = document.createElement('div')
            capacityRow.className = 'lab-desktop-measure-row'
            capacityRow.append(capacityProbe)
            rows.replaceChildren(capacityRow)
            const capacity = measuredLeafCapacity(page, capacityProbe, source.reduce((total, words) => total + words.length, 0))
            rows.replaceChildren()
            callbackRef.current(pages, paragraphs, layoutKey, capacity, endInFooter)
          }
          run()
        }
        frame = requestAnimationFrame(begin)
      })
    }
    schedule()
    const observer = new ResizeObserver(() => {
      if (hostSize() !== measuredSize) schedule()
    })
    observer.observe(host)
    document.fonts?.addEventListener('loadingdone', schedule)
    return () => { cancelled = true; cancelAnimationFrame(frame); window.clearTimeout(slice); observer.disconnect(); document.fonts?.removeEventListener('loadingdone', schedule) }
  }, [paragraphs, comparison, chapterTitle, layoutKey, chapterActions, hasNextChapter, pageLimit, hyphenLang, hyphensReady])
  return <div ref={hostRef} className={`lab-desktop-measure lab-page-measure${comparison ? ' is-paired' : ''}`} aria-hidden="true">
    <div className="lab-desktop-measure-page">
      <LabChapterHeading title={chapterTitle} preview={chapterActions} measuring />
      <div className="lab-desktop-measure-rows" />
      {chapterActions && <LabChapterEnd hasNext={hasNextChapter} measuring />}
    </div>
  </div>
}
