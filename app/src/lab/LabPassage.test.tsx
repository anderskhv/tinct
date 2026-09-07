// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  LAB_CONTINUED_TAIL_MIN_FILL,
  LabPassage,
  continuedTailFill,
  lineContinuesParagraph,
  markFullContinuedTails,
} from './LabPassage'
import { chapterPageSegments, isLabVerseMarker, labVerseMarkerDisplay, tokenizeHearingWords, type ChapterHearingPage, type ChapterPageSegment } from './labHearing'
import { bibleFallbackSource } from './labSource'
import { followFromPlayback, mergeSidecarWords, type TimedWord } from './labFollow'

afterEach(cleanup)

/** Word-addressed page map of `size` words per page, cutting paragraphs mid-way like the phone paginator does. */
function fixedWordPages(paragraphs: string[], size: number): ChapterHearingPage[] {
  const pages: ChapterHearingPage[] = []
  let current: ChapterPageSegment[] = []
  let room = size
  paragraphs.forEach((text, paragraphIndex) => {
    const total = tokenizeHearingWords(text).length
    let from = 0
    while (from < total) {
      const to = Math.min(total, from + room)
      current.push({ paragraphIndex, from, to })
      room -= to - from
      from = to
      if (room === 0) {
        pages.push({ ...current[0], segments: current.length > 1 ? current : undefined })
        current = []
        room = size
      }
    }
  })
  if (current.length > 0) pages.push({ ...current[0], segments: current.length > 1 ? current : undefined })
  return pages
}

function passageProps(paragraphs: string[], readingPage: ChapterHearingPage) {
  return {
    chapterTitle: 'Genesis 1',
    paragraphs,
    compareParagraphs: [],
    compare: false,
    mode: 'reading' as const,
    follow: { kind: 'none' as const },
    followParagraphs: paragraphs.map((text, index) => ({ index, text })),
    markedIndexes: new Set<number>(),
    readingPage,
  }
}

describe('continued page tails', () => {
  const paragraphs = ['one two three four five', 'six seven eight']

  it('flags only slices whose paragraph goes on after the slice', () => {
    const words = (from: number, to: number) => tokenizeHearingWords(paragraphs[0]).slice(from, to).map(word => ({ text: word.text }))
    expect(lineContinuesParagraph(paragraphs, { paragraphIndex: 0, from: 0, words: words(0, 3) })).toBe(true)
    expect(lineContinuesParagraph(paragraphs, { paragraphIndex: 0, from: 3, words: words(3, 5) })).toBe(false)
    expect(lineContinuesParagraph(paragraphs, { paragraphIndex: 0, from: 0, words: words(0, 5) })).toBe(false)
    expect(lineContinuesParagraph(paragraphs, { words: words(0, 3) })).toBe(false)
    expect(lineContinuesParagraph(paragraphs, { paragraphIndex: 0, from: 0, words: [] })).toBe(false)
  })

  it('renders the continued class on the page tail only, never on a genuine paragraph end', () => {
    const page: ChapterHearingPage = {
      paragraphIndex: 0,
      from: 2,
      to: 5,
      segments: [
        { paragraphIndex: 0, from: 2, to: 5 },
        { paragraphIndex: 1, from: 0, to: 2 },
      ],
    }
    render(<LabPassage {...passageProps(paragraphs, page)} />)
    const lines = [...screen.getByTestId('lab-reading-stage').querySelectorAll('.lab-hearing-line')]
    expect(lines).toHaveLength(2)
    expect(lines[0].className).not.toContain('is-continued')
    expect(lines[1].className).toContain('is-continued')
    expect(lines[1].textContent?.trim()).toBe('six seven')
  })

  it('never changes which words a page paints while flagging every mid-paragraph tail of Genesis 1', () => {
    const genesis = bibleFallbackSource().paragraphs
    const pages = fixedWordPages(genesis, 23)
    const reference = pages.map(page => chapterPageSegments(page).map(segment =>
      tokenizeHearingWords(genesis[segment.paragraphIndex]).slice(segment.from, segment.to).map(word => isLabVerseMarker(word.text) ? labVerseMarkerDisplay(word.text) : word.text)))
    expect(pages.length).toBeGreaterThan(3)

    let continuedTails = 0
    pages.forEach((page, pageIndex) => {
      const view = render(<LabPassage {...passageProps(genesis, page)} />)
      const lines = [...screen.getByTestId('lab-reading-stage').querySelectorAll('.lab-hearing-line')]
      const painted = lines.map(line => [...line.querySelectorAll('[data-testid="lab-word"]')].map(word => word.textContent?.trim()))
      expect(painted).toEqual(reference[pageIndex])
      const segments = chapterPageSegments(page)
      segments.forEach((segment, index) => {
        const endsParagraph = segment.to === tokenizeHearingWords(genesis[segment.paragraphIndex]).length
        expect(lines[index].classList.contains('is-continued')).toBe(!endsParagraph)
        if (!endsParagraph) {
          expect(index).toBe(segments.length - 1)
          continuedTails += 1
        }
      })
      view.unmount()
    })
    expect(continuedTails).toBeGreaterThan(0)
    expect(continuedTails).toBeLessThan(pages.length)
  })

  it('measures the natural fill of the last painted line from per-fragment rects', () => {
    const line = (right: number, bottom: number) => ({ left: 10, right, bottom, height: 20 })
    expect(continuedTailFill(10, 310, [line(310, 20), line(310, 40), line(250, 60)])).toBe(0.8)
    expect(continuedTailFill(10, 310, [line(310, 20), line(70, 40)])).toBe(0.2)
    // A hyphenated word straddling the break contributes only its last-line fragment.
    expect(continuedTailFill(10, 310, [line(310, 20), { left: 10, right: 100, bottom: 40, height: 20 }])).toBe(0.3)
    expect(continuedTailFill(10, 310, [])).toBe(0)
    expect(continuedTailFill(10, 10, [line(10, 20)])).toBe(0)
    expect(continuedTailFill(10, 310, [{ left: 0, right: 0, bottom: 0, height: 0 }])).toBe(0)
  })

  it('marks a continued slice full only when its last line reaches the fill threshold, and clears stale marks', () => {
    const root = document.createElement('article')
    root.innerHTML = [
      '<p class="lab-hearing-line is-continued"><span>a</span><span>b</span></p>',
      '<p class="lab-hearing-line is-continued is-tail-full"><span>c</span><span>d</span></p>',
      '<p class="lab-hearing-line"><span>e</span></p>',
    ].join('')
    document.body.appendChild(root)
    const [full, short, ending] = [...root.querySelectorAll('p')]
    const box = { x: 0, y: 0, top: 0, left: 20, right: 320, bottom: 60, width: 300, height: 60, toJSON() {} }
    for (const p of [full, short, ending]) vi.spyOn(p, 'getBoundingClientRect').mockReturnValue(box as DOMRect)
    const rects = (list: Array<[number, number, number]>) => ({
      length: list.length,
      item: (i: number) => null,
      [Symbol.iterator]: function* () {
        for (const [left, right, bottom] of list) yield { left, right, bottom, top: bottom - 20, height: 20, width: right - left } as DOMRect
      },
    }) as unknown as DOMRectList
    const fullSpans = full.querySelectorAll('span')
    vi.spyOn(fullSpans[0], 'getClientRects').mockReturnValue(rects([[20, 320, 20]]))
    vi.spyOn(fullSpans[1], 'getClientRects').mockReturnValue(rects([[20, 20 + 300 * LAB_CONTINUED_TAIL_MIN_FILL, 40]]))
    const shortSpans = short.querySelectorAll('span')
    vi.spyOn(shortSpans[0], 'getClientRects').mockReturnValue(rects([[20, 320, 20]]))
    vi.spyOn(shortSpans[1], 'getClientRects').mockReturnValue(rects([[20, 120, 40]]))
    vi.spyOn(ending.querySelector('span')!, 'getClientRects').mockReturnValue(rects([[20, 320, 20]]))

    markFullContinuedTails(root)
    expect(full.classList.contains('is-tail-full')).toBe(true)
    expect(short.classList.contains('is-tail-full')).toBe(false)
    expect(ending.classList.contains('is-tail-full')).toBe(false)
    expect(ending.classList.contains('is-continued')).toBe(false)
    markFullContinuedTails(null)
    root.remove()
  })

  it('survives a layout-less document without marking anything', () => {
    const page: ChapterHearingPage = { paragraphIndex: 0, from: 0, to: 3 }
    render(<LabPassage {...passageProps(paragraphs, page)} />)
    const line = screen.getByTestId('lab-reading-stage').querySelector('.lab-hearing-line')!
    expect(line.className).toContain('is-continued')
    expect(line.className).not.toContain('is-tail-full')
  })
})

describe('sentence-level hearing follow', () => {
  const paragraphs = [
    'In the beginning God created the heavens and the earth.',
    'These are the generations of Noah. Noah was a righteous man; he walked with God.',
  ]
  const timed = (text: string): TimedWord[] => text.split(' ')
    .map((word, index) => ({ text: word, start: index * 0.5, end: (index + 1) * 0.5 }))
  const followParagraphs = mergeSidecarWords(
    paragraphs.map((text, index) => ({ index, text, file: `p${index}.mp3` })),
    {
      chapter: 1,
      alignment: { minimumParagraphRatio: 0.85 },
      paragraphs: [
        { paragraph: 0, file: 'p0.mp3', words: timed(paragraphs[0]), alignment: { matchRatio: 1 } },
        { paragraph: 1, file: 'p1.mp3', words: timed(paragraphs[1]), alignment: { matchRatio: 0.8 } },
      ],
    },
    1,
  )

  function hearingProps(paragraphIndex: number, currentTime: number) {
    return {
      chapterTitle: 'Genesis',
      paragraphs,
      compareParagraphs: [],
      compare: false,
      mode: 'hearing' as const,
      playing: true,
      clipIndex: paragraphIndex,
      currentTime,
      follow: followFromPlayback({ paragraphs: followParagraphs, paragraphIndex, currentTime }),
      followParagraphs,
      markedIndexes: new Set<number>(),
    }
  }

  it('marks one word current on a fully aligned paragraph', () => {
    render(<LabPassage {...hearingProps(0, 1.6)} />)
    const line = screen.getByTestId('lab-hearing-stage').querySelector('.lab-hearing-line')!
    expect(line.getAttribute('data-follow-granularity')).toBeNull()
    const current = line.querySelectorAll('.lab-hearing-word.is-current')
    expect(current).toHaveLength(1)
    expect(current[0].textContent?.trim()).toBe('God')
    expect(line.querySelectorAll('.lab-hearing-word.is-spoken')).toHaveLength(3)
  })

  it('marks the whole sentence current on a weakly aligned paragraph', () => {
    render(<LabPassage {...hearingProps(1, 3.6)} />)
    const line = screen.getByTestId('lab-hearing-stage').querySelector('.lab-hearing-line')!
    expect(line.getAttribute('data-follow-granularity')).toBe('sentence')
    const current = [...line.querySelectorAll('.lab-hearing-word.is-current')]
    expect(current.map(el => el.textContent?.trim())).toEqual(['Noah', 'was', 'a', 'righteous', 'man;'])
    expect(line.querySelectorAll('.lab-hearing-word.is-spoken')).toHaveLength(6)
    expect(line.querySelectorAll('.lab-hearing-word.is-upcoming')).toHaveLength(4)
    expect(screen.getAllByTestId('lab-hearing-current')).toHaveLength(5)
  })

  it('paints the sentence span inline on the reading page too', () => {
    const page: ChapterHearingPage = { paragraphIndex: 1, from: 0, to: 15 }
    render(<LabPassage {...hearingProps(1, 3.6)} mode="reading" inlineHearingPaint readingPage={page} />)
    const line = screen.getByTestId('lab-reading-stage').querySelector('.lab-hearing-line')!
    expect(line.getAttribute('data-follow-granularity')).toBe('sentence')
    const current = [...line.querySelectorAll('[data-testid="lab-word"].is-current')]
    expect(current.map(el => el.getAttribute('data-word-index'))).toEqual(['6', '7', '8', '9', '10'])
  })
})

describe('audio follow paint is layout-neutral', () => {
  const paragraphs = [
    'In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep.',
    'And God said, Let there be light: and there was light.',
  ]
  const timed = (text: string): TimedWord[] => text.split(' ')
    .map((word, index) => ({ text: word, start: index * 0.5, end: (index + 1) * 0.5 }))
  const followParagraphs = paragraphs.map((text, index) => ({ index, text, file: `p${index}.mp3`, words: timed(text) }))
  // A page tail: paragraph 0 continues past the slice, so the line is `is-continued`.
  const page: ChapterHearingPage = { paragraphIndex: 0, from: 0, to: 12 }
  const props = (wordIndex: number, layoutKey = 'garamond|1.3|justify') => ({
    ...passageProps(paragraphs, page),
    followParagraphs,
    playing: true,
    inlineHearingPaint: true,
    follow: { kind: 'word' as const, paragraphIndex: 0, wordIndex },
    layoutKey,
  })
  const flushObservers = () => new Promise(resolve => setTimeout(resolve, 0))
  const labCss = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')

  it('every follow rule in lab.css changes only color, background or decoration-break', () => {
    const rules = [...labCss.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    const followRules = rules.filter(([, selector]) => /\.is-(current|spoken|upcoming|line|paragraph-current)\b/.test(selector)
      && /lab-(passage|hearing)/.test(selector))
    expect(followRules.length).toBeGreaterThan(8)
    const paintOnly = new Set(['color', 'background', 'background-color', 'box-decoration-break', '-webkit-box-decoration-break'])
    for (const [, selector, body] of followRules) {
      for (const declaration of body.split(';')) {
        const [property, value] = declaration.split(':').map(part => part.trim())
        if (!property) continue
        // The resting word is weight 400; a follow rule may restate that, never change it.
        if (property === 'font-weight') {
          expect(value, selector.trim()).toBe('400')
          continue
        }
        expect(paintOnly.has(property), `${selector.trim()} sets ${property}`).toBe(true)
      }
    }
  })

  it('a current word keeps the resting word\'s font, spacing, padding, border and display', () => {
    const style = document.createElement('style')
    style.textContent = labCss
    document.head.appendChild(style)
    try {
      render(<div className="lab is-desktop"><LabPassage {...props(3)} /></div>)
      const spans = [...screen.getByTestId('lab-reading-stage').querySelectorAll<HTMLElement>('[data-testid="lab-word"]')]
      expect(spans[3].className).toContain('is-current')
      const box = (el: HTMLElement) => {
        const cs = getComputedStyle(el)
        return {
          display: cs.display,
          fontWeight: cs.fontWeight,
          fontSize: cs.fontSize,
          fontStyle: cs.fontStyle,
          letterSpacing: cs.letterSpacing,
          wordSpacing: cs.wordSpacing,
          padding: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' '),
          border: [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].join(' '),
          margin: [cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft].join(' '),
          verticalAlign: cs.verticalAlign,
          lineHeight: cs.lineHeight,
          boxDecorationBreak: cs.getPropertyValue('box-decoration-break'),
        }
      }
      // The sheet is applied: the rest word carries the resting rule's decoration-break.
      expect(box(spans[2]).boxDecorationBreak).toBe('clone')
      expect(box(spans[3])).toEqual(box(spans[2]))
      expect(box(spans[3])).toEqual(box(spans[11]))
    } finally {
      style.remove()
    }
  })

  it('moves the highlight by toggling a class on the same word spans', async () => {
    const { rerender } = render(<LabPassage {...props(3)} />)
    const stage = screen.getByTestId('lab-reading-stage')
    const spans = [...stage.querySelectorAll('[data-testid="lab-word"]')]
    expect(spans[3].className).toContain('is-current')
    const records: MutationRecord[] = []
    const observer = new MutationObserver(list => records.push(...list))
    observer.observe(stage, { childList: true, subtree: true, attributes: true, characterData: true })
    rerender(<LabPassage {...props(4)} />)
    await flushObservers()
    observer.disconnect()
    const after = [...stage.querySelectorAll('[data-testid="lab-word"]')]
    expect(after.length).toBe(spans.length)
    expect(after.every((el, index) => el === spans[index])).toBe(true)
    expect(spans[3].className).not.toContain('is-current')
    expect(spans[4].className).toContain('is-current')
    expect(records.filter(record => record.type !== 'attributes')).toHaveLength(0)
    expect(records.every(record => record.attributeName === 'class')).toBe(true)
    expect(new Set(records.map(record => record.target))).toEqual(new Set([spans[3], spans[4]]))
  })

  it('does not re-measure the continued tail when only the spoken word changes', async () => {
    const { rerender } = render(<LabPassage {...props(3)} />)
    const stage = screen.getByTestId('lab-reading-stage')
    const line = stage.querySelector<HTMLElement>('.lab-hearing-line.is-continued')!
    expect(line).not.toBeNull()
    // Give the line a layout: one full first line, and a last line at the fill threshold.
    const box = { x: 0, y: 0, top: 0, left: 20, right: 320, bottom: 60, width: 300, height: 60, toJSON() {} }
    vi.spyOn(line, 'getBoundingClientRect').mockReturnValue(box as DOMRect)
    const rects = (list: Array<[number, number, number]>) => ({
      length: list.length,
      item: () => null,
      [Symbol.iterator]: function* () {
        for (const [left, right, bottom] of list) yield { left, right, bottom, top: bottom - 20, height: 20, width: right - left } as DOMRect
      },
    }) as unknown as DOMRectList
    const spans = [...line.querySelectorAll<HTMLElement>(':scope > span')]
    spans.forEach((span, index) => {
      const last = index === spans.length - 1
      vi.spyOn(span, 'getClientRects').mockReturnValue(rects([last ? [20, 20 + 300 * LAB_CONTINUED_TAIL_MIN_FILL, 40] : [20, 320, 20]]))
    })
    // A typography change re-measures and marks the tail full.
    rerender(<LabPassage {...props(3, 'garamond|1.5|justify')} />)
    expect(line.classList.contains('is-tail-full')).toBe(true)

    const records: MutationRecord[] = []
    const observer = new MutationObserver(list => records.push(...list))
    observer.observe(line, { attributes: true })
    rerender(<LabPassage {...props(4, 'garamond|1.5|justify')} />)
    rerender(<LabPassage {...props(5, 'garamond|1.5|justify')} />)
    await flushObservers()
    expect(line.classList.contains('is-tail-full')).toBe(true)
    expect(records).toHaveLength(0)

    // Typography changes still re-measure (the class is stripped, then restored).
    rerender(<LabPassage {...props(5, 'garamond|1.7|justify')} />)
    await flushObservers()
    observer.disconnect()
    expect(records.length).toBeGreaterThan(0)
    expect(line.classList.contains('is-tail-full')).toBe(true)
  })
})
