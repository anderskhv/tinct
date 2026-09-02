import { Fragment, useLayoutEffect, useRef, type ReactNode } from 'react'
import {
  LAB_ORPHAN_PAGE_WORDS,
  chapterPagesCover,
  chapterPageSegments,
  isLabVerseMarker,
  labVerseMarkerDisplay,
  tokenizeHearingWords,
  type ChapterHearingPage,
  type ChapterPageSegment,
} from './labHearing'

export interface LabNativeWordPlacement {
  pageIndex: number
  paragraphIndex: number
  wordIndex: number
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
  return previous && isLabVerseMarker(previous.text) ? '' : ' '
}

function NativeWord({
  text,
  paragraphIndex,
  wordIndex,
  spacing,
  hasFollowingWord,
}: {
  text: string
  paragraphIndex: number
  wordIndex: number
  spacing: string
  hasFollowingWord: boolean
}) {
  return (
    <>
      {spacing}
      <span
        className="lab-hearing-word"
        data-native-word="true"
        data-paragraph-index={paragraphIndex}
        data-word-index={wordIndex}
      >
        {isLabVerseMarker(text) ? (
          <span className="lab-verse-mark">
            {labVerseMarkerDisplay(text)}
            {hasFollowingWord ? '\u00a0' : ''}
          </span>
        ) : text}
      </span>
    </>
  )
}

function NativeParagraph({ text, paragraphIndex }: { text: string; paragraphIndex: number }) {
  const words = tokenizeHearingWords(text)
  const rendered: ReactNode[] = []
  for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
    const word = words[wordIndex]
    const node = (
      <NativeWord
        key={wordIndex}
        text={word.text}
        paragraphIndex={paragraphIndex}
        wordIndex={wordIndex}
        spacing={nativeWordSpacing(word, wordIndex, words[wordIndex - 1])}
        hasFollowingWord={wordIndex < words.length - 1}
      />
    )
    if (isLabVerseMarker(word.text) && words[wordIndex + 1]) {
      const nextIndex = wordIndex + 1
      const secondLeadIndex = wordIndex + 2
      const keepSecondLead = !!words[secondLeadIndex]
        && `${words[nextIndex].text} ${words[secondLeadIndex].text}`.length <= 16
      rendered.push(
        <Fragment key={`verse-${wordIndex}`}>
          {nativeWordSpacing(word, wordIndex, words[wordIndex - 1])}
          <span className="lab-verse-unit">
            <NativeWord
              text={word.text}
              paragraphIndex={paragraphIndex}
              wordIndex={wordIndex}
              spacing=""
              hasFollowingWord
            />
            <NativeWord
              text={words[nextIndex].text}
              paragraphIndex={paragraphIndex}
              wordIndex={nextIndex}
              spacing=""
              hasFollowingWord={nextIndex < words.length - 1}
            />
            {keepSecondLead && (
              <NativeWord
                text={words[secondLeadIndex].text}
                paragraphIndex={paragraphIndex}
                wordIndex={secondLeadIndex}
                spacing={nativeWordSpacing(words[secondLeadIndex], secondLeadIndex, words[nextIndex])}
                hasFollowingWord={secondLeadIndex < words.length - 1}
              />
            )}
          </span>
        </Fragment>,
      )
      wordIndex = keepSecondLead ? secondLeadIndex : nextIndex
    } else {
      rendered.push(node)
    }
  }
  return <p className="lab-hearing-line">{rendered}</p>
}

export function LabNativePaginator({
  chapterTitle,
  paragraphs,
  layoutKey,
  onPages,
}: {
  chapterTitle: string
  paragraphs: string[]
  layoutKey: string
  onPages: (pages: ChapterHearingPage[]) => void
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const generationRef = useRef(0)

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cancelled = false
    let firstFrame = 0
    let secondFrame = 0

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
      const pages = nativePagesFromPlacements(placements)
      if (placements.length === wordNodes.length && chapterPagesCover(paragraphs, pages)) {
        onPages(pages)
      }
    }

    const schedule = () => {
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
      generationRef.current += 1
      if (firstFrame) cancelAnimationFrame(firstFrame)
      if (secondFrame) cancelAnimationFrame(secondFrame)
      observer?.disconnect()
      document.fonts?.removeEventListener?.('loadingdone', schedule)
    }
  }, [chapterTitle, paragraphs, layoutKey, onPages])

  return (
    <div ref={hostRef} className="lab-page-measure lab-native-page-measure" aria-hidden="true" data-testid="lab-native-page-measure">
      <article className="lab-passage lab-book is-reading lab-native-page-surface">
        <div className="lab-native-page-flow" data-native-page-flow>
          <header className="lab-passage-header">
            <h1 className="lab-passage-headline">{chapterTitle}</h1>
          </header>
          <div className="lab-book-columns">
            <div className="lab-book-col">
              <div className="lab-hearing-stage">
                {paragraphs.map((paragraph, paragraphIndex) => (
                  <NativeParagraph key={paragraphIndex} text={paragraph} paragraphIndex={paragraphIndex} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
