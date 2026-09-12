import { useLayoutEffect, useRef } from 'react'
import { tokenizeHearingWords, type ChapterHearingPage, type ChapterPageSegment } from './labHearing'
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

/** Greedily fill the measured page, splitting a long paragraph at a word.
 * Both columns are measured as a paired row, so subsequent paragraphs align. */
export function measuredDesktopPages(lengths: number[], fits: (segments: ChapterPageSegment[], first: boolean) => boolean): ChapterHearingPage[] {
  const pages: ChapterHearingPage[] = []
  let segments: ChapterPageSegment[] = []
  const commit = () => { if (segments.length) pages.push({ ...segments[0], segments }); segments = [] }
  lengths.forEach((length, paragraphIndex) => {
    let from = 0
    while (from < length) {
      const full = { paragraphIndex, from, to: length }
      if (fits([...segments, full], pages.length === 0)) { segments.push(full); break }
      let low = from, high = length
      while (low < high) {
        const to = Math.ceil((low + high) / 2)
        if (fits([...segments, { paragraphIndex, from, to }], pages.length === 0)) low = to
        else high = to - 1
      }
      if (low === from && segments.length) { commit(); continue }
      const to = Math.max(from + 1, low)
      segments.push({ paragraphIndex, from, to })
      commit()
      from = to
    }
  })
  commit()
  return pages
}

export function LabDesktopPaginator({ paragraphs, comparison, chapterTitle, layoutKey, onPages }: {
  paragraphs: string[]; comparison?: string[]; chapterTitle: string; layoutKey: string
  onPages: (pages: ChapterHearingPage[], content: string[], key: string) => void
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const callbackRef = useRef(onPages)
  callbackRef.current = onPages
  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cancelled = false, frame = 0, generation = 0
    const source = paragraphs.map(tokenizeHearingWords)
    const target = comparison?.map(tokenizeHearingWords)
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
          const makeParagraph = (segment: ChapterPageSegment, words: ReturnType<typeof tokenizeHearingWords>[]) => {
            const p = document.createElement('p')
            p.className = 'lab-hearing-line'
            // The measured and visible desktop pages both use ordinary word
            // wrapping without hyphenation, and both carry the painted word
            // markup. A plain-text probe measured a verse number as full-size
            // body digits in a strut-height line; painted it is a small
            // superscript inside a taller inline-block, so pages were packed
            // against a line box that was the wrong width and the wrong height.
            return labMeasureParagraphInto(p, (words[segment.paragraphIndex] || []).slice(segment.from, segment.to))
          }
          const pages = measuredDesktopPages(source.map(words => words.length), (segments, first) => {
            header.hidden = !first
            rows.replaceChildren()
            for (const segment of segments) {
              const row = document.createElement('div')
              row.className = 'lab-desktop-measure-row'
              row.append(makeParagraph(segment, source))
              if (comparison && target) row.append(makeParagraph(comparisonSegment(segment, paragraphs, comparison), target))
              rows.append(row)
            }
            const bottom = rows.getBoundingClientRect().bottom
            return bottom <= page.getBoundingClientRect().bottom + .1
          })
          callbackRef.current(pages, paragraphs, layoutKey)
        })
      })
    }
    schedule()
    const observer = new ResizeObserver(schedule)
    observer.observe(host)
    document.fonts?.addEventListener('loadingdone', schedule)
    return () => { cancelled = true; cancelAnimationFrame(frame); observer.disconnect(); document.fonts?.removeEventListener('loadingdone', schedule) }
  }, [paragraphs, comparison, chapterTitle, layoutKey])
  return <div ref={hostRef} className={`lab-desktop-measure lab-page-measure${comparison ? ' is-paired' : ''}`} aria-hidden="true">
    <div className="lab-desktop-measure-page">
      <header className="lab-passage-header"><h1 className="lab-passage-headline">{chapterTitle}</h1></header>
      <div className="lab-desktop-measure-rows" />
    </div>
  </div>
}
