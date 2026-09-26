import { LabChapterHeading } from './LabChapterHeading'
import { LabChapterEnd } from './LabChapterEnd'
import { fitChapterEnd } from './labChapterEndPaging'
import { buildVerseAlignment, needsVerseAlignment, verseGroups } from './labVerseAlignment'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { hyphenLangForEdition, hyphenationBreaks, hyphenatorReady, loadHyphenator } from './labHyphenate'
import { chapterPageSegments, segmentWordTexts, tokenizeHearingWords, type ChapterHearingPage, type ChapterPageSegment } from './labHearing'
import { labMeasureParagraphInto } from './labMeasureParagraph'

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

/** Greedily fill the measured page, splitting a long paragraph at a word.
 * Both columns are measured as a paired row, so subsequent paragraphs align.
 *
 * With `breaks`, a page that still has room on its last line for part of the
 * next word takes it, hyphenated, rather than ending short: the longest break
 * that still fits wins, so the line is filled as far as it can be. The word is
 * then shared with the next page (see `segmentWordTexts`). Without `breaks`,
 * or where no break fits, the page ends between words as it always has. */
export function measuredDesktopPages(
  lengths: number[],
  fits: (segments: ChapterPageSegment[], first: boolean) => boolean,
  breaks?: WordBreakLookup,
): ChapterHearingPage[] {
  const pages: ChapterHearingPage[] = []
  let segments: ChapterPageSegment[] = []
  const commit = () => { if (segments.length) pages.push({ ...segments[0], segments }); segments = [] }
  lengths.forEach((length, paragraphIndex) => {
    let from = 0
    let headBreak: number | undefined
    while (from < length) {
      const segment = (to: number, tailFragment?: number): ChapterPageSegment => ({
        paragraphIndex,
        from,
        to,
        ...(headBreak != null ? { headBreak } : {}),
        ...(tailFragment != null ? { tailFragment } : {}),
      })
      const full = segment(length)
      if (fits([...segments, full], pages.length === 0)) { segments.push(full); break }
      let low = from, high = length
      while (low < high) {
        const to = Math.ceil((low + high) / 2)
        if (fits([...segments, segment(to)], pages.length === 0)) low = to
        else high = to - 1
      }
      if (low === from && segments.length) { commit(); continue }
      const to = Math.max(from + 1, low)
      // The last line has whatever room the next whole word could not use. The
      // fragment is display only: `to` does not move, so this page still owns
      // exactly the words it owned and the next page owns the broken word.
      // Longest break first: the most of the word that still fits.
      let tailFragment: number | undefined
      if (to < length && breaks) {
        const points = breaks(paragraphIndex, to)
        for (let index = points.length - 1; index >= 0; index -= 1) {
          if (fits([...segments, segment(to, points[index])], pages.length === 0)) {
            tailFragment = points[index]
            break
          }
        }
      }
      segments.push(segment(to, tailFragment))
      commit()
      // Whatever this page showed of the next word, that page resumes after.
      headBreak = tailFragment
      from = to
    }
  })
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

export function LabDesktopPaginator({ paragraphs, comparison, chapterTitle, layoutKey, editionKey, chapterActions = false, hasNextChapter = false, onPages }: {
  paragraphs: string[]; comparison?: string[]; chapterTitle: string; layoutKey: string
  chapterActions?: boolean; hasNextChapter?: boolean
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
    let cancelled = false, frame = 0, generation = 0
    const source = paragraphs.map(tokenizeHearingWords)
    const target = comparison?.map(tokenizeHearingWords)
    // Editions paragraphed differently (BSB beside KJV) pair verse by verse.
    const alignment = comparison && needsVerseAlignment(paragraphs, comparison) ? buildVerseAlignment(paragraphs, comparison) : null
    const schedule = () => {
      const revision = ++generation
      cancelAnimationFrame(frame)
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
      const requested = fonts ? [
        fonts.load(getComputedStyle(probe).font, probe.textContent),
        fonts.load(getComputedStyle(heading).font, chapterTitle),
      ] : []
      void Promise.allSettled(requested).then(() => fonts?.ready).then(() => {
        if (cancelled || revision !== generation) return
        frame = requestAnimationFrame(() => {
          if (cancelled || revision !== generation || host.clientWidth < 10 || host.clientHeight < 10) return
          const page = host.querySelector<HTMLElement>('.lab-desktop-measure-page')!
          const header = host.querySelector<HTMLElement>('.lab-passage-header')!
          const rows = host.querySelector<HTMLElement>('.lab-desktop-measure-rows')!
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
          const fits = (segments: ChapterPageSegment[], first: boolean, withEnd = false) => {
            if (end) end.hidden = !withEnd
            header.hidden = !first
            rows.replaceChildren()
            if (comparison && target && alignment) {
              // Verse-paired rows: a compare cell spans the primary lines of
              // its verses (see LabPassage), so measure each verse group as
              // one row. The primary stack keeps its lines' own margins, as
              // separate grid rows do.
              for (const group of verseGroups(segments, alignment)) {
                const row = document.createElement('div')
                row.className = 'lab-desktop-measure-row'
                const stack = document.createElement('div')
                stack.style.cssText = 'display:flex;flex-direction:column'
                for (const segment of group.segments) stack.append(makeParagraph(segment, source, paragraphs))
                const cell = document.createElement('div')
                cell.className = 'lab-compare-cell'
                for (const piece of group.pieces) cell.append(makeParagraph(piece, target, comparison))
                row.append(stack, cell)
                rows.append(row)
              }
            } else for (const segment of segments) {
              const row = document.createElement('div')
              row.className = 'lab-desktop-measure-row'
              row.append(makeParagraph(segment, source, paragraphs))
              if (comparison && target) row.append(makeParagraph(comparisonSegment(segment, paragraphs, comparison), target, comparison))
              rows.append(row)
            }
            const bottom = withEnd && end ? end.getBoundingClientRect().bottom : rows.getBoundingClientRect().bottom
            return bottom <= page.getBoundingClientRect().bottom + .1
          }
          let pages = measuredDesktopPages(source.map(words => words.length), fits, hyphenLang && hyphensReady
            ? (paragraphIndex, wordIndex) => hyphenationBreaks(source[paragraphIndex]?.[wordIndex]?.text ?? '', hyphenLang)
            : undefined)
          let endInFooter = false
          if (chapterActions && pages.length) {
            const lastFits = fits(chapterPageSegments(pages[pages.length - 1]), pages.length === 1, true)
            // The bottom padding is already reserved for folios. Only borrow
            // it if the complete action row fits; the matching folio is hidden.
            const footerSpace = parseFloat(getComputedStyle(host).getPropertyValue('--desktop-pad-bottom')) - 16
            endInFooter = !comparison && !lastFits && !!end && end.getBoundingClientRect().height <= footerSpace
            if (!lastFits && !endInFooter) pages = fitChapterEnd(pages, (segments, first) => fits(segments, first, true))
          }
          if (end) end.hidden = true
          header.hidden = true
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
        })
      })
    }
    schedule()
    const observer = new ResizeObserver(schedule)
    observer.observe(host)
    document.fonts?.addEventListener('loadingdone', schedule)
    return () => { cancelled = true; cancelAnimationFrame(frame); observer.disconnect(); document.fonts?.removeEventListener('loadingdone', schedule) }
  }, [paragraphs, comparison, chapterTitle, layoutKey, chapterActions, hasNextChapter, hyphenLang, hyphensReady])
  return <div ref={hostRef} className={`lab-desktop-measure lab-page-measure${comparison ? ' is-paired' : ''}`} aria-hidden="true">
    <div className="lab-desktop-measure-page">
      <LabChapterHeading title={chapterTitle} preview={chapterActions} measuring />
      <div className="lab-desktop-measure-rows" />
      {chapterActions && <LabChapterEnd hasNext={hasNextChapter} measuring />}
    </div>
  </div>
}
