import { getBook } from '../data/bookRegistry'
// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, cleanup, createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LAB_DESKTOP_PANES, PRODUCTION_DESKTOP_PANES } from './labChrome'
import { LabApp } from './LabApp'
import { buildCompanionSystem, parseCompanionRequest } from '../companion/companionRequest'
import { LabPassage } from './LabPassage'
import { hearingPages } from './labHearing'
import { bibleFallbackSource, fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'
import { followParagraphFromManifest } from './labFollow'
import { readLabPositionLocal } from './labPositionStore'

// Synthetic timing fixtures test playback independently from temporary discovery holds.
vi.mock('../data/audioAvailability', async importOriginal => ({ ...await importOriginal<typeof import('../data/audioAvailability')>(), isAudioHeld: () => false }))

// These UI regressions intentionally use their synthetic legacy MP3 fixtures.
// Production Grok failure behavior is covered independently.
vi.mock('./labNarration', async importOriginal => ({
  ...await importOriginal<typeof import('./labNarration')>(),
  initialNarrationPilotInfo: () => ({ enabled:false, provider:'google', voices:[] }),
  fetchNarrationPilotInfo: async () => ({ enabled:false, provider:'google', voices:[] }),
}))

// The Bible fixtures below are KJV text with KJV recordings: these readers
// chose KJV. New readers default to BSB (labPrefs.test.ts).
beforeEach(() => {
  try { localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'kjv-en', audioEdition: 'kjv-en' })) } catch { /* jsdom */ }
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  try { localStorage.removeItem('tinct-lab-prefs') } catch { /* jsdom */ }
    try { localStorage.removeItem('tinct-lab-position') } catch { /* jsdom */ }
  try { localStorage.removeItem('tinct-lab-device-id') } catch { /* jsdom */ }
  try { localStorage.removeItem('tinct:lab-library-boot') } catch { /* jsdom */ }
  try { sessionStorage.removeItem('tinct:lab-reader-handoff') } catch { /* jsdom */ }
  try { localStorage.removeItem('tinct-lab-finished-chapters') } catch { /* jsdom */ }
  try { localStorage.removeItem('tinct:reading-memory') } catch { /* jsdom */ }
  try { localStorage.removeItem('tinct-lab-highlights') } catch { /* jsdom */ }
  try { localStorage.removeItem('tinct-lab-highlights-tap-cleanup-v1') } catch { /* jsdom */ }
  try { localStorage.removeItem('tinct:chat-history:lab') } catch { /* jsdom */ }
  try { localStorage.removeItem('tinct:chat-history:bible') } catch { /* jsdom */ }
  try { localStorage.removeItem('tinct:chat-history:odyssey') } catch { /* jsdom */ }
  try { localStorage.removeItem('tinct:lab-chat-history-legacy-cloud-migrated') } catch { /* jsdom */ }
  try { localStorage.removeItem('tinct:lab-ai-actions') } catch { /* jsdom */ }
  try { localStorage.removeItem('tinct:lab-second-book-nudge') } catch { /* jsdom */ }
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

function sourceWithWords() {
  const base = fallbackLabSource()
  const timedTokens = base.paragraphs[0].split(/\s+/).filter(Boolean)
  const first = followParagraphFromManifest(0, base.paragraphs[0], {
    duration: 20,
    file: 'p0.mp3',
    words: timedTokens.map((text, index) => ({ text, start: index * 0.5, end: (index + 1) * 0.5 })),
  })
  return {
    ...base,
    followParagraphs: [
      first,
      ...base.paragraphs.slice(1).map((text, index) => ({
        index: index + 1,
        text,
        file: `p${index + 1}.mp3`,
        duration: 20,
      })),
    ],
  }
}

class FakeAudio {
  private source = ''
  ended = false
  get src() { return this.source }
  set src(value: string) { this.source = value; this.ended = false }
  currentTime = 0
  duration = 20
  playbackRate = 1
  paused = true
  preload = 'auto'
  listeners = new Map<string, Set<() => void>>()

  addEventListener(type: string, fn: () => void) {
    const set = this.listeners.get(type) ?? new Set()
    set.add(fn)
    this.listeners.set(type, set)
  }

  removeEventListener(type: string, fn: () => void) {
    this.listeners.get(type)?.delete(fn)
  }

  play() {
    this.paused = false
    return Promise.resolve()
  }

  pause() {
    this.paused = true
  }

  load() { /* jsdom audio stub */ }

  removeAttribute() {
    this.src = ''
  }

  emit(type: string) {
    if (type === 'ended') this.ended = true
    for (const fn of this.listeners.get(type) ?? []) fn()
  }
}


describe('lab chrome', () => {

  it('does not call getUserMedia until Talk starts', () => {
    const getUserMedia = vi.fn()
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaDevices: { getUserMedia },
    })
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} authToken="signed-in" />)
    expect(getUserMedia).not.toHaveBeenCalled()
    expect(screen.getByTestId('lab-status').textContent).toBe('Reading · Book 1')
  })

  it('keeps voice resume distinct from simply returning to Read', () => {
    const app = readFileSync(resolve(__dirname, 'LabApp.tsx'), 'utf8')
    expect(app).toContain('resumeListenRef.current = (forceAudio = true) => resumeListenAfterAsk(forceAudio)')
    expect(app).toContain("const shouldHear = forceHearing || interruptedAudio")
  })

})

describe('lab bible book', () => {
  afterEach(() => {
    resetLabBibleManifestCache()
  })

  it('turning past the last page of the final chapter marks it finished in the position record', async () => {
    render(<LabApp pathname="/lab/phone" source={{
      ...bibleFallbackSource(),
      paragraphs: ['In the beginning God created the heaven and the earth.'],
      followParagraphs: [{ index: 0, text: 'In the beginning God created the heaven and the earth.' }],
      chapters: [{ number: 1, title: 'Genesis 1', path: 'ch0001.json' }],
    }} />)
    const root = screen.getByTestId('lab-root')
    expect(root.getAttribute('data-chapter')).toBe('1')
    // No next chapter: the forward control is not offered, but a forward turn still ends the chapter.
    expect(screen.queryByTestId('lab-page-next')).toBeNull()
    expect(readLabPositionLocal().finished.bible ?? []).toEqual([])

    fireEvent.keyDown(document.body, { key: 'ArrowRight' })
    await waitFor(() => {
      expect(readLabPositionLocal().finished.bible).toEqual([1])
    })
    // Still on the same (last) chapter and page; nothing was lost.
    expect(root.getAttribute('data-chapter')).toBe('1')
    expect(root.getAttribute('data-cover-page')).toBe('false')
    expect(screen.getByTestId('lab-passage-headline').textContent).toContain('Genesis 1')
  })

  it('puts a book cover one swipe before Genesis 1 without changing reading position', () => {
    render(<LabApp pathname="/lab/phone" source={{
      ...bibleFallbackSource(),
      paragraphs: ['In the beginning God created the heaven and the earth.'],
      followParagraphs: [{ index: 0, text: 'In the beginning God created the heaven and the earth.' }],
      chapters: [{ number: 1, title: 'Genesis 1', path: 'ch0001.json' }],
    }} />)
    const root = screen.getByTestId('lab-root')
    const place = root.getAttribute('data-place')
    const progress = screen.getByTestId('lab-chapter-progress').textContent

    fireEvent.click(screen.getByTestId('lab-page-prev'))
    expect(root.getAttribute('data-cover-page')).toBe('true')
    const cover = screen.getByTestId('lab-chapter-cover')
    expect(cover.textContent).toContain('Genesis')
    expect(document.activeElement).toBe(cover)
    expect(screen.queryByTestId('lab-passage-headline')).toBeNull()
    expect(root.getAttribute('data-place')).toBe(place)
    expect(screen.queryByTestId('lab-header-chapter')).toBeNull()
    expect(screen.queryByTestId('lab-bottom-chrome')).toBeNull()
    expect(screen.queryByTestId('lab-chapter-progress')).toBeNull()

    fireEvent.keyDown(cover, { key: 'ArrowRight' })
    expect(root.getAttribute('data-cover-page')).toBe('false')
    expect(screen.getByTestId('lab-passage-headline').textContent).toContain('Genesis 1')
    expect(root.getAttribute('data-place')).toBe(place)
    expect(screen.getByTestId('lab-chapter-progress').textContent).toBe(progress)
  })

  it('has no cover before the first page of another book: the introduction lives in the library', () => {
    render(<LabApp pathname="/reader" source={{
      ...sourceWithWords(),
      bookId: 'jane-eyre',
      bookTitle: 'Jane Eyre',
      editions: getBook('jane-eyre')!.editions,
      paragraphs: ['There was no possibility of taking a walk that day.'],
      chapters: [{ number: 1, title: 'Chapter 1', path: 'ch0001.json' }, { number: 2, title: 'Chapter 2', path: 'ch0002.json' }],
    }} />)
    const root = screen.getByTestId('lab-root')
    const place = root.getAttribute('data-place')
    expect(screen.queryByTestId('lab-chapter-cover')).toBeNull()
    fireEvent.keyDown(document.body, { key: 'ArrowLeft' })
    expect(screen.queryByTestId('lab-chapter-cover')).toBeNull()
    expect(root.getAttribute('data-cover-page')).toBe('false')
    expect(root.getAttribute('data-chapter')).toBe('1')
    expect(root.getAttribute('data-place')).toBe(place)
  })

  it('Previous on Genesis 2 page 1 goes to Genesis 1 last', async () => {
    const pageA = ['In the beginning God created the heaven and the earth.', ...Array.from({ length: 79 }, (_, i) => `g1a${i}`)].join(' ')
    const pageB = Array.from({ length: 80 }, (_, i) => `g1b${i}`).join(' ')
    const pageC = 'And God made two great lights; the greater light to rule the day, and to divide the light from the darkness. ' + Array.from({ length: 70 }, (_, i) => `g1c${i}`).join(' ')
    const genesis1 = [pageA, pageB, pageC]
    const genesis2 = ['Thus the heavens and the earth were finished.', 'And on the seventh day God ended his work.']
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('bible-kjv-en/manifest.json')) {
        return { ok: true, json: async () => ({
          format: 'tinct-edition-chapters-v1',
          bookId: 'bible',
          editionKey: 'kjv-en',
          chapters: [
            { number: 1, title: 'Genesis 1', path: 'ch0001.json' },
            { number: 2, title: 'Genesis 2', path: 'ch0002.json' },
          ],
        }) }
      }
      if (url.includes('bible-kjv-en/ch0001.json')) {
        return { ok: true, json: async () => ({ number: 1, title: 'Genesis 1', paragraphs: genesis1 }) }
      }
      if (url.includes('bible-kjv-en/ch0002.json')) {
        return { ok: true, json: async () => ({ number: 2, title: 'Genesis 2', paragraphs: genesis2 }) }
      }
      if (url.includes('bible-web-en')) return { ok: true, json: async () => ({ paragraphs: [] }) }
      if (url.includes('bible-threads.json')) return { ok: true, json: async () => ({ characters: [] }) }
      if (url.includes('audio-manifest')) {
        return { ok: true, json: async () => ({ chapter: 1, paragraphs: [{ paragraph: 0, file: 'p0.mp3', duration: 4 }] }) }
      }
      return { ok: false, json: async () => ({}) }
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab/phone" source={{
      ...bibleFallbackSource(),
      paragraphs: genesis1,
      followParagraphs: genesis1.map((text, index) => ({ index, text })),
      chapters: [
        { number: 1, title: 'Genesis 1', path: 'ch0001.json' },
        { number: 2, title: 'Genesis 2', path: 'ch0002.json' },
      ],
    }} />)
    const progress = () => screen.getByTestId('lab-chapter-progress').textContent || ''
    fireEvent.click(screen.getByTestId('lab-chapter-progress'))
    const line = () => (document.querySelector('.lab-hearing-line')?.textContent || '')
    expect(progress()).toMatch(/1 \/ \d+/)
    expect(line()).toContain('In the beginning')
    for (let i = 0; i < 8; i++) {
      if (screen.getByTestId('lab-root').getAttribute('data-chapter') === '2') break
      fireEvent.click(screen.getByTestId('lab-page-next'))
    }
    await waitFor(() => {
      expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('2')
    })
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Genesis 2/)
    expect(progress()).toContain('1 /')
    expect(line()).toContain('heavens and the earth were finished')
    fireEvent.click(screen.getByTestId('lab-page-prev'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('1')
    })
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Genesis 1/)
    const back = progress()
    expect(back).toMatch(/^(\d+) \/ \1 of chapter · \d+%$/)
    const nm = back.match(/(\d+) \/ (\d+)/)
    expect(nm).toBeTruthy()
    expect(Number(nm![1])).toBeGreaterThan(1)
    expect(Number(nm![1])).toBe(Number(nm![2]))
    await waitFor(() => {
      expect(line()).toMatch(/g1c\d+/)
      expect(line()).not.toContain('In the beginning')
    })
    fireEvent.click(screen.getByTestId('lab-page-next'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('2')
    })
    expect(line()).toContain('heavens and the earth were finished')
  })

  it('labels Proverbs 16 with the biblical name, never the linear index', () => {
    render(<LabApp pathname="/lab/phone" source={{
      ...bibleFallbackSource(),
      chapterNumber: 644,
      chapterLabel: 'Proverbs 16',
      chapterTitle: 'Proverbs 16',
      headerBook: 'Proverbs',
      headerChapter: '16',
      paragraphs: ['Every one that is proud in heart is an abomination to the LORD: though hand join in hand, he shall not be unpunished.'],
      followParagraphs: [{
        index: 0,
        text: 'Every one that is proud in heart is an abomination to the LORD: though hand join in hand, he shall not be unpunished.',
      }],
      chapters: [
        { number: 643, title: 'Proverbs 15', path: 'ch0643.json' },
        { number: 644, title: 'Proverbs 16', path: 'ch0644.json' },
        { number: 645, title: 'Proverbs 17', path: 'ch0645.json' },
      ],
    }} />)
    const label = screen.getByTestId('lab-chapter-progress').textContent || ''
    expect(label).toMatch(/^[\d,]+ \/ [\d,]+ of book · \d+%$/)
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Proverbs 16/)
  })

  it('page-next from Proverbs 16 last goes to Proverbs 17 p1, and prev returns to 16 last', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('manifest.json') && !url.includes('audio-manifest')) {
        return {
          ok: true,
          json: async () => ({
            format: 'tinct-edition-chapters-v1',
            bookId: 'bible',
            editionKey: 'kjv-en',
            chapters: [
              { number: 644, title: 'Proverbs 16', path: 'ch0644.json' },
              { number: 645, title: 'Proverbs 17', path: 'ch0645.json' },
            ],
          }),
        }
      }
      if (url.includes('ch0644.json')) {
        return {
          ok: true,
          json: async () => ({
            number: 644,
            title: 'Proverbs 16',
            paragraphs: ['Commit thy works unto the LORD, and thy thoughts shall be established. He shall not be unpunished.'],
          }),
        }
      }
      if (url.includes('ch0645.json')) {
        return {
          ok: true,
          json: async () => ({
            number: 645,
            title: 'Proverbs 17',
            paragraphs: ['Better is a dry morsel, and quietness therewith, than an house full of sacrifices with strife.'],
          }),
        }
      }
      if (url.includes('bible-web-en')) return { ok: true, json: async () => ({ paragraphs: [] }) }
      if (url.includes('bible-threads.json')) return { ok: true, json: async () => ({ characters: [] }) }
      if (url.includes('audio-manifest')) {
        return { ok: true, json: async () => ({ chapter: 644, paragraphs: [{ paragraph: 0, file: 'p0.mp3', duration: 4 }] }) }
      }
      return { ok: false, json: async () => ({}) }
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab/phone" source={{
      ...bibleFallbackSource(),
      chapterNumber: 644,
      chapterLabel: 'Proverbs 16',
      chapterTitle: 'Proverbs 16',
      headerBook: 'Proverbs',
      headerChapter: '16',
      paragraphs: ['Commit thy works unto the LORD, and thy thoughts shall be established. He shall not be unpunished.'],
      followParagraphs: [{
        index: 0,
        text: 'Commit thy works unto the LORD, and thy thoughts shall be established. He shall not be unpunished.',
      }],
      chapters: [
        { number: 644, title: 'Proverbs 16', path: 'ch0644.json' },
        { number: 645, title: 'Proverbs 17', path: 'ch0645.json' },
      ],
    }} />)
    const startLabel = screen.getByTestId('lab-chapter-progress').textContent || ''
    expect(startLabel).toMatch(/^[\d,]+ \/ [\d,]+ of book · \d+%$/)
    // One short paragraph = last page. Next must hop to Proverbs 17 p1.
    fireEvent.click(screen.getByTestId('lab-page-next'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('645')
    })
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Proverbs 17/)
    const p1 = screen.getByTestId('lab-chapter-progress').textContent || ''
    expect(p1).toMatch(/^[\d,]+ \/ [\d,]+ of book · \d+%$/)
    fireEvent.click(screen.getByTestId('lab-page-prev'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('644')
    })
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Proverbs 16/)
    const back = screen.getByTestId('lab-chapter-progress').textContent || ''
    expect(back).toMatch(/^[\d,]+ \/ [\d,]+ of book · \d+%$/)
    expect(document.querySelector('.lab-hearing-line')?.textContent).toMatch(/unpunished|Commit thy works/i)
  })

})

describe('lab passage headline pages', () => {
  it('keeps a verse number with the first word that follows it', () => {
    render(
      <LabPassage
        chapterTitle="Genesis 1"
        paragraphs={['⁹ And God said, Let']}
        compareParagraphs={[]}
        compare={false}
        mode="reading"
        follow={{ kind: 'none' }}
        followParagraphs={[]}
        markedIndexes={new Set()}
        onMark={() => { /* unused */ }}
        readingPage={{ paragraphIndex: 0, from: 0, to: 5 }}
      />,
    )
    expect(screen.getByTestId('lab-reading-stage').textContent).toContain(`9\u00a0And`)
  })

  it('lets the line break before a protected verse start', () => {
    render(
      <LabPassage
        chapterTitle="Genesis 1"
        paragraphs={['it was so. ⁹ And God said']}
        compareParagraphs={[]}
        compare={false}
        mode="reading"
        follow={{ kind: 'none' }}
        followParagraphs={[]}
        markedIndexes={new Set()}
        onMark={() => { /* unused */ }}
        readingPage={{ paragraphIndex: 0, from: 0, to: 7 }}
      />,
    )
    const unit = screen.getByTestId('lab-reading-stage').querySelector('.lab-verse-unit')
    expect(unit?.previousSibling?.textContent).toBe(' ')
    expect(unit?.previousSibling?.previousSibling?.textContent).toBe('so.')
    expect(unit?.textContent).toContain(`9\u00a0And`)
  })

  it('shows the chapter headline only on the first hearing page', () => {
    const words = Array.from({ length: 200 }, (_, index) => ({
      text: (index + 1) % 20 === 0 ? `w${index}.` : `w${index}`,
      start: index * 0.3,
      end: index * 0.3 + 0.25,
    }))
    const first = followParagraphFromManifest(0, words.map(word => word.text).join(' '), {
      duration: 60,
      words,
    })
    const pages = hearingPages(words)
    expect(pages.length).toBeGreaterThan(1)
    const props = {
      chapterTitle: 'Book 1 — The gods in council',
      paragraphs: [first.text],
      compareParagraphs: [],
      compare: false,
      mode: 'hearing' as const,
      followParagraphs: [first],
      markedIndexes: new Set<number>(),
      onMark: () => { /* unused */ },
    }
    const { rerender } = render(
      <LabPassage {...props} playing follow={{ kind: 'word', paragraphIndex: 0, wordIndex: 4 }} />,
    )
    expect(screen.getByTestId('lab-passage-headline').textContent).toContain('Book 1')
    rerender(
      <LabPassage {...props} playing follow={{ kind: 'word', paragraphIndex: 0, wordIndex: pages[1].from }} />,
    )
    expect(screen.queryByTestId('lab-passage-headline')).toBeNull()
  })

  it('does not paint follow roles in Reading even when follow is still set', () => {
    const words = [
      { text: 'Tell', start: 0, end: 0.4 },
      { text: 'me,', start: 0.4, end: 0.7 },
      { text: 'O', start: 0.7, end: 0.9 },
      { text: 'Muse', start: 0.9, end: 1.4 },
    ]
    const first = followParagraphFromManifest(0, 'Tell me, O Muse', { duration: 2, words })
    render(
      <LabPassage
        chapterTitle="Book 1"
        paragraphs={[first.text]}
        compareParagraphs={[]}
        compare={false}
        mode="reading"
        playing={false}
        follow={{ kind: 'word', paragraphIndex: 0, wordIndex: 1 }}
        followParagraphs={[first]}
        markedIndexes={new Set()}
        onMark={() => { /* unused */ }}
        readingPage={{ paragraphIndex: 0, from: 0, to: 4 }}
      />,
    )
    const book = screen.getByTestId('lab-book')
    expect(book.getAttribute('data-passage-mode')).toBe('reading')
    expect(book.className).toContain('is-reading')
    expect(book.className).not.toContain('is-hearing')
    expect(screen.getByTestId('lab-reading-stage').textContent).toContain('Tell')
    expect(document.querySelector('.lab-hearing-word.is-current')).toBeNull()
    expect(document.querySelector('.lab-hearing-word.is-upcoming')).toBeNull()
    expect(document.querySelector('.lab-hearing-word.is-spoken')).toBeNull()
    expect(screen.queryByTestId('lab-hearing-current')).toBeNull()
  })

  it('turns pages from full-page edge taps and horizontal swipes while reserving center tap for controls', () => {
    const turn = vi.fn()
    const toggleControls = vi.fn()
    render(
      <LabPassage
        chapterTitle="Book 1"
        paragraphs={['Tell me, O Muse']}
        compareParagraphs={[]}
        compare={false}
        mode="reading"
        follow={{ kind: 'none' }}
        followParagraphs={[]}
        markedIndexes={new Set()}
        onMark={() => { /* unused */ }}
        onSelectRange={() => { /* edge taps must win over selection */ }}
        readingPage={{ paragraphIndex: 0, from: 0, to: 4 }}
        onPageTurn={turn}
        onToggleControls={toggleControls}
      />,
    )
    const page = screen.getByTestId('lab-book')
    vi.spyOn(page, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, right: 390, bottom: 600,
      width: 390, height: 600, toJSON() {},
    })

    // Short pages leave blank space below the text. The entire page surface,
    // not only the painted text block, must remain a page-turn target.
    fireEvent.pointerDown(page, { pointerId: 1, clientX: 370, clientY: 580 })
    fireEvent.pointerUp(page, { pointerId: 1, clientX: 370, clientY: 580 })
    const rightEdgeWord = screen.getAllByTestId('lab-word').at(-1) as HTMLElement
    fireEvent.pointerDown(rightEdgeWord, { pointerId: 5, pointerType: 'touch', clientX: 370, clientY: 300 })
    fireEvent.pointerUp(rightEdgeWord, { pointerId: 5, pointerType: 'touch', clientX: 370, clientY: 300 })
    fireEvent.pointerDown(page, { pointerId: 2, clientX: 20, clientY: 580 })
    fireEvent.pointerUp(page, { pointerId: 2, clientX: 20, clientY: 580 })
    fireEvent.pointerDown(page, { pointerId: 3, clientX: 330, clientY: 300 })
    fireEvent.pointerUp(page, { pointerId: 3, clientX: 60, clientY: 305 })
    fireEvent.pointerDown(page, { pointerId: 4, clientX: 195, clientY: 500 })
    fireEvent.pointerUp(page, { pointerId: 4, clientX: 195, clientY: 500 })

    expect(turn.mock.calls.map(([direction]) => direction)).toEqual([1, 1, -1, 1])
    expect(toggleControls).toHaveBeenCalledOnce()
  })

  it('animates page direction without dropping multi-paragraph text or verse markers', () => {
    const props = {
      chapterTitle: 'Book 1',
      paragraphs: ['Before ² the marker', 'After the marker'],
      compareParagraphs: [],
      compare: false,
      mode: 'reading' as const,
      follow: { kind: 'none' as const },
      followParagraphs: [],
      markedIndexes: new Set<number>(),
      readingPage: {
        paragraphIndex: 0,
        from: 0,
        to: 4,
        segments: [
          { paragraphIndex: 0, from: 0, to: 4 },
          { paragraphIndex: 1, from: 0, to: 3 },
        ],
      },
    }
    const view = render(<LabPassage {...props} pageTurn={{ direction: 'next', nonce: 1 }} />)
    expect(screen.getByTestId('lab-reading-stage').getAttribute('data-page-turn')).toBe('next')
    expect(screen.getByTestId('lab-reading-stage').textContent).toContain('Before 2\u00a0the marker')
    expect(screen.getByTestId('lab-reading-stage').textContent).toContain('After the marker')

    view.rerender(<LabPassage {...props} pageTurn={{ direction: 'previous', nonce: 2 }} />)
    expect(screen.getByTestId('lab-reading-stage').getAttribute('data-page-turn')).toBe('previous')
    expect(screen.getByTestId('lab-reading-stage').textContent).toContain('After the marker')
  })

  it('requires a touch long-press before selecting, so ordinary taps cannot create ghost highlights', () => {
    vi.useFakeTimers()
    const select = vi.fn()
    render(
      <LabPassage
        chapterTitle="Book 1"
        paragraphs={['Tell me O Muse']}
        compareParagraphs={[]}
        compare={false}
        mode="reading"
        follow={{ kind: 'none' }}
        followParagraphs={[]}
        markedIndexes={new Set()}
        onSelectRange={select}
        readingPage={{ paragraphIndex: 0, from: 0, to: 4 }}
      />,
    )
    const word = screen.getAllByTestId('lab-word')[1]
    fireEvent.pointerDown(word, { pointerId: 7, pointerType: 'touch', clientX: 195, clientY: 200 })
    fireEvent.pointerUp(word, { pointerId: 7, pointerType: 'touch', clientX: 195, clientY: 200 })
    vi.advanceTimersByTime(500)
    expect(select).not.toHaveBeenCalled()

    fireEvent.pointerDown(word, { pointerId: 8, pointerType: 'touch', clientX: 195, clientY: 200 })
    act(() => { vi.advanceTimersByTime(159) })
    expect(select).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(1) })
    expect(word.className).toContain('is-selecting')
    fireEvent.pointerUp(word, { pointerId: 8, pointerType: 'touch', clientX: 195, clientY: 200 })
    expect(select).toHaveBeenCalledOnce()
    expect(select.mock.calls[0][0].text).toBe('me')
  })

  it('lets a word at the page edge be long-pressed instead of forcing a page turn', () => {
    vi.useFakeTimers()
    const select = vi.fn()
    const turn = vi.fn()
    render(
      <LabPassage
        chapterTitle="Book 1"
        paragraphs={['Tell me O Muse']}
        compareParagraphs={[]}
        compare={false}
        mode="reading"
        follow={{ kind: 'none' }}
        followParagraphs={[]}
        markedIndexes={new Set()}
        onSelectRange={select}
        onPageTurn={turn}
        readingPage={{ paragraphIndex: 0, from: 0, to: 4 }}
      />,
    )
    const page = screen.getByTestId('lab-book')
    vi.spyOn(page, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, right: 390, bottom: 600,
      width: 390, height: 600, toJSON() {},
    })
    const word = screen.getAllByTestId('lab-word')[0]
    fireEvent.pointerDown(word, { pointerId: 81, pointerType: 'touch', clientX: 20, clientY: 200 })
    act(() => { vi.advanceTimersByTime(400) })
    fireEvent.pointerUp(word, { pointerId: 81, pointerType: 'touch', clientX: 20, clientY: 200 })
    expect(select).toHaveBeenCalledOnce()
    expect(select.mock.calls[0][0].text).toBe('Tell')
    expect(turn).not.toHaveBeenCalled()
  })

  it('keeps edge page turns active while audio is playing', () => {
    const turn = vi.fn()
    render(
      <LabPassage
        chapterTitle="Book 1"
        paragraphs={['Tell me O Muse']}
        compareParagraphs={[]}
        compare={false}
        mode="hearing"
        playing
        follow={{ kind: 'word', paragraphIndex: 0, wordIndex: 1 }}
        followParagraphs={[{ index: 0, text: 'Tell me O Muse' }]}
        markedIndexes={new Set()}
        onPageTurn={turn}
        readingPage={{ paragraphIndex: 0, from: 0, to: 4 }}
      />,
    )
    const page = screen.getByTestId('lab-book')
    vi.spyOn(page, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, right: 390, bottom: 600,
      width: 390, height: 600, toJSON() {},
    })
    fireEvent.pointerDown(page, { pointerId: 82, pointerType: 'touch', clientX: 370, clientY: 300 })
    fireEvent.pointerUp(page, { pointerId: 82, pointerType: 'touch', clientX: 370, clientY: 300 })
    expect(turn).toHaveBeenCalledWith(1)
  })

  it('keeps the page still when an active long-press selection reaches the page edge', () => {
    vi.useFakeTimers()
    vi.spyOn(Date, 'now').mockReturnValue(2_000)
    const turn = vi.fn()
    render(
      <LabPassage
        chapterTitle="Book 1"
        paragraphs={['Tell me O Muse']}
        compareParagraphs={[]}
        compare={false}
        mode="reading"
        follow={{ kind: 'none' }}
        followParagraphs={[]}
        markedIndexes={new Set()}
        onSelectRange={() => { /* selection remains active */ }}
        onPageTurn={turn}
        readingPage={{ paragraphIndex: 0, from: 0, to: 4 }}
      />,
    )
    const page = screen.getByTestId('lab-book')
    vi.spyOn(page, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, right: 390, bottom: 600,
      width: 390, height: 600, toJSON() {},
    })
    const word = screen.getAllByTestId('lab-word')[1]
    fireEvent.pointerDown(word, { pointerId: 10, pointerType: 'touch', clientX: 195, clientY: 200 })
    act(() => { vi.advanceTimersByTime(400) })
    fireEvent.pointerMove(page, { pointerId: 10, pointerType: 'touch', clientX: 385, clientY: 200 })
    expect(turn).not.toHaveBeenCalled()
  })

  it('keeps selected word boxes separate from whitespace', () => {
    render(
      <LabPassage
        chapterTitle="Book 1"
        paragraphs={['Tell me O Muse']}
        compareParagraphs={[]}
        compare={false}
        mode="reading"
        follow={{ kind: 'none' }}
        followParagraphs={[]}
        markedIndexes={new Set()}
        selectingRange={{ paragraphIndex: 0, fromWord: 1, endParagraphIndex: 0, toWord: 4, text: 'me O Muse' }}
        readingPage={{ paragraphIndex: 0, from: 0, to: 4 }}
      />,
    )
    const words = screen.getAllByTestId('lab-word')
    expect(words[1].className).toContain('is-selecting')
    expect(words[2].className).toContain('is-selecting')
    expect(words[3].className).toContain('is-selecting')
    expect(words[2].textContent).toBe('O')
    expect(words[2].previousSibling?.textContent).toBe(' ')
    expect(words[3].textContent).toBe('Muse')
    expect(words[3].previousSibling?.textContent).toBe(' ')
    const css = readFileSync(resolve(process.cwd(), 'src/lab/lab.css'), 'utf8')
    // The provisional mark is the highlight the Highlight action would make,
    // in the default colour, so the preview cannot lie about the result.
    const backgroundOf = (selector: string) => [...css.matchAll(
      new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{[^}]*background:\\s*([^;]+);`, 'g'),
    )].map(match => match[1].trim())
    const warm = backgroundOf('.lab-hearing-word.is-hl-warm')
    const selecting = backgroundOf('.lab-hearing-word.is-selecting')
    expect(warm.length).toBeGreaterThan(0)
    expect(selecting).toEqual(warm)
    // ...and the mark colours have one definition, the shared tokens, so the
    // same highlight is the same colour on every surface.
    expect(warm.every(value => value.startsWith('var(--highlight-gold'))).toBe(true)
    expect(css).not.toMatch(/\.lab-hearing-word\.is-selecting\s*\{[^}]*box-shadow:/)
  })

  it('opens a touch word lookup without saving an incidental highlight', () => {
    vi.useFakeTimers()
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} />)
    const word = screen.getAllByTestId('lab-word')[1]
    fireEvent.pointerDown(word, { pointerType: 'touch', clientX: 190, clientY: 200 })
    act(() => { vi.advanceTimersByTime(400) })
    fireEvent.pointerUp(word, { pointerType: 'touch', clientX: 190, clientY: 200 })
    expect(document.querySelector('.selection-popup')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]')).toHaveLength(0)
    vi.useRealTimers()
  })

  it('opens a desktop word lookup without saving an incidental highlight', () => {
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} />)
    const word = screen.getAllByTestId('lab-word')[1]
    fireEvent.pointerDown(word, { pointerType: 'mouse', button: 0, clientX: 190, clientY: 200 })
    fireEvent.pointerUp(word, { pointerType: 'mouse', clientX: 190, clientY: 200 })
    expect(document.querySelector('.selection-popup')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]')).toHaveLength(0)
  })

  /** The provisional mark previews the action; only Highlight writes it. */
  it('leaves no trace when a previewed selection is dismissed', async () => {
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} />)
    const words = screen.getAllByTestId('lab-word')
    fireEvent.pointerDown(words[1], { pointerId: 41, pointerType: 'mouse', clientX: 150, clientY: 200 })
    fireEvent.pointerMove(words[3], { pointerId: 41, pointerType: 'mouse', clientX: 230, clientY: 200 })
    fireEvent.pointerUp(words[3], { pointerId: 41, pointerType: 'mouse', clientX: 230, clientY: 200 })
    expect(document.querySelector('.selection-popup')).toBeTruthy()

    fireEvent.pointerDown(document.body, { pointerId: 42, pointerType: 'touch', clientX: 10, clientY: 10 })
    await waitFor(() => expect(document.querySelector('.selection-popup')).toBeNull())
    expect(JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]')).toHaveLength(0)
    expect(document.querySelector('.lab-hearing-word.is-selecting')).toBeNull()
  })

  /**
   * A click inside an existing highlight is a question about the thing the
   * reader marked, not about the word under the cursor.
   */
  describe('a click inside an existing highlight acts on the whole highlight', () => {
    const selectWords = async (from: number, to: number, id: number) => {
      const words = screen.getAllByTestId('lab-word')
      fireEvent.pointerDown(words[from], { pointerId: id, pointerType: 'mouse', clientX: 150, clientY: 200 })
      fireEvent.pointerMove(words[to], { pointerId: id, pointerType: 'mouse', clientX: 230, clientY: 200 })
      fireEvent.pointerUp(words[to], { pointerId: id, pointerType: 'mouse', clientX: 230, clientY: 200 })
    }
    const clickWord = (index: number, id: number) => {
      const word = screen.getAllByTestId('lab-word')[index]
      fireEvent.pointerDown(word, { pointerId: id, pointerType: 'mouse', button: 0, clientX: 190, clientY: 200 })
      fireEvent.pointerUp(word, { pointerId: id, pointerType: 'mouse', clientX: 190, clientY: 200 })
    }

    it('takes the whole highlight for copy and ask, and the clicked word for define', async () => {
      render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} />)
      const words = screen.getAllByTestId('lab-word')
      const whole = [1, 2, 3].map(i => words[i].textContent?.trim()).join(' ')
      await selectWords(1, 3, 51)
      fireEvent.click(screen.getByRole('button', { name: 'Highlight', exact: true }))
      await waitFor(() => expect(JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]')).toHaveLength(1))
      fireEvent.pointerDown(document.body, { pointerId: 52, pointerType: 'mouse', clientX: 10, clientY: 10 })
      await waitFor(() => expect(document.querySelector('.selection-popup')).toBeNull())

      const copied: string[] = []
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: (text: string) => { copied.push(text); return Promise.resolve() } },
      })
      clickWord(2, 53)
      const popup = await waitFor(() => {
        const found = document.querySelector('.selection-popup')
        expect(found).toBeTruthy()
        return found as HTMLElement
      })
      // The subject the actions operate on is the whole highlight.
      expect(popup.textContent).toBeTruthy()
      fireEvent.click(screen.getByRole('button', { name: /copy/i }))
      await waitFor(() => expect(copied).toHaveLength(1))
      expect(copied[0]).toBe(whole)
      expect(copied[0].split(/\s+/).length).toBeGreaterThan(1)
      // ...and the highlight's own actions are still there.
      expect(JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]')).toHaveLength(1)
    })

    it('leaves a word outside any highlight on the word itself', async () => {
      render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} />)
      const words = screen.getAllByTestId('lab-word')
      await selectWords(1, 2, 61)
      fireEvent.click(screen.getByRole('button', { name: 'Highlight', exact: true }))
      await waitFor(() => expect(JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]')).toHaveLength(1))
      fireEvent.pointerDown(document.body, { pointerId: 62, pointerType: 'mouse', clientX: 10, clientY: 10 })
      await waitFor(() => expect(document.querySelector('.selection-popup')).toBeNull())

      const copied: string[] = []
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: (text: string) => { copied.push(text); return Promise.resolve() } },
      })
      clickWord(5, 63)
      await waitFor(() => expect(document.querySelector('.selection-popup')).toBeTruthy())
      const copy = screen.queryByRole('button', { name: /copy/i })
      if (copy) {
        fireEvent.click(copy)
        await waitFor(() => expect(copied).toHaveLength(1))
        expect(copied[0]).toBe(words[5].textContent?.trim())
      }
    })

    it('uses the dragged selection when a fresh drag overlaps a highlight', async () => {
      render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} />)
      const words = screen.getAllByTestId('lab-word')
      await selectWords(1, 2, 71)
      fireEvent.click(screen.getByRole('button', { name: 'Highlight', exact: true }))
      await waitFor(() => expect(JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]')).toHaveLength(1))
      fireEvent.pointerDown(document.body, { pointerId: 72, pointerType: 'mouse', clientX: 10, clientY: 10 })
      await waitFor(() => expect(document.querySelector('.selection-popup')).toBeNull())

      const copied: string[] = []
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: (text: string) => { copied.push(text); return Promise.resolve() } },
      })
      await selectWords(0, 4, 73)
      await waitFor(() => expect(document.querySelector('.selection-popup')).toBeTruthy())
      fireEvent.click(screen.getByRole('button', { name: /copy/i }))
      await waitFor(() => expect(copied).toHaveLength(1))
      expect(copied[0]).toBe([0, 1, 2, 3, 4].map(i => words[i].textContent?.trim()).join(' '))
    })
  })

  it('saves a note and recolors the same range before closing', async () => {
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} />)
    const page = screen.getByTestId('lab-book')
    vi.spyOn(page, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, right: 390, bottom: 600,
      width: 390, height: 600, toJSON() {},
    })
    const words = screen.getAllByTestId('lab-word')
    fireEvent.pointerDown(words[1], { pointerId: 9, pointerType: 'mouse', clientX: 190, clientY: 200 })
    fireEvent.pointerMove(words[3], { pointerId: 9, pointerType: 'mouse', clientX: 220, clientY: 200 })
    fireEvent.pointerUp(words[3], { pointerId: 9, pointerType: 'mouse', clientX: 220, clientY: 200 })
    expect(document.querySelector('.selection-popup')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]')).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Highlight', exact: true }))
    await waitFor(() => expect(localStorage.getItem('tinct-lab-highlights')).toContain('gold'))
    expect(screen.queryByRole('textbox', {name:'Highlight note'})).toBeNull()
    fireEvent.click(screen.getByRole('button',{name:'Add note'}))
    fireEvent.change(screen.getByRole('textbox', { name: 'Highlight note' }), { target: { value: 'Remember this.' } })
    fireEvent.click(screen.getByTitle('Highlight Sky'))
    fireEvent.click(screen.getByRole('button',{name:'Save note'}))
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]')
      expect(saved).toHaveLength(1)
      expect(saved[0].color).toBe('sky')
      expect(saved[0].note).toBe('Remember this.')
    })
    expect(document.querySelector('.selection-popup')).toBeNull()
    await waitFor(() => expect(screen.getAllByTestId('lab-word')[1].className).toContain('is-hl-sky'))
  })

  it('dismisses on the first outside press without discarding the highlight', async () => {
    localStorage.removeItem('tinct-highlight-color')
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} />)
    const words = screen.getAllByTestId('lab-word')
    fireEvent.pointerDown(words[1], { pointerId: 91, pointerType: 'mouse', clientX: 150, clientY: 200 })
    fireEvent.pointerMove(words[3], { pointerId: 91, pointerType: 'mouse', clientX: 230, clientY: 200 })
    fireEvent.pointerUp(words[3], { pointerId: 91, pointerType: 'mouse', clientX: 230, clientY: 200 })
    fireEvent.click(screen.getByRole('button', { name: 'Highlight', exact: true }))
    await waitFor(() => expect(JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]')).toHaveLength(1))

    fireEvent.pointerDown(document.body, { pointerId: 92, pointerType: 'touch', clientX: 10, clientY: 10 })
    expect(document.querySelector('.selection-popup')).toBeNull()
    const saved = JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]')
    expect(saved).toHaveLength(1)
    expect(saved[0].color).toBe('gold')
    fireEvent.pointerUp(document.body)
    fireEvent.click(document.body)
  })

  it('opens a saved highlight on a short touch instead of toggling reader controls', () => {
    const onSelectRange = vi.fn()
    const onToggleControls = vi.fn()
    render(<LabPassage
      chapterTitle="Book 1"
      paragraphs={['Tell me O Muse']}
      compareParagraphs={[]}
      compare={false}
      mode="reading"
      follow={{ kind: 'none' }}
      followParagraphs={[]}
      markedIndexes={new Set()}
      chapterNumber={1}
      highlights={[{ id: 'saved', chapterNumber: 1, paragraphIndex: 0, fromWord: 1, endParagraphIndex: 0, toWord: 4, color: 'gold' }]}
      onSelectRange={onSelectRange}
      onToggleControls={onToggleControls}
      readingPage={{ paragraphIndex: 0, from: 0, to: 4 }}
    />)
    const marked = screen.getAllByTestId('lab-word')[2]
    fireEvent.pointerDown(marked, { pointerId: 103, pointerType: 'touch', clientX: 190, clientY: 200 })
    fireEvent.pointerUp(marked, { pointerId: 103, pointerType: 'touch', clientX: 190, clientY: 200 })
    expect(onSelectRange).toHaveBeenCalledWith(expect.objectContaining({ paragraphIndex: 0, fromWord: 2, toWord: 3 }), 190, 200, undefined, 'lookup', 'saved')
    expect(onToggleControls).not.toHaveBeenCalled()
  })

  it('sits the composer flush on the keyboard without the safe-area inset', () => {
    const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')
    expect(css).toMatch(/\.lab\.is-phone\.has-phone-keyboard \.lab-ask \.lab-ask-chrome[^{]*\{[^}]*padding-bottom:\s*0;/)
    expect(css).toMatch(/\.lab\.is-phone\.has-phone-keyboard \.lab-ask \.lab-ask-composer[^{]*\{[^}]*padding-bottom:\s*0\.34rem;/)
    expect(css).not.toMatch(/\.lab\.is-phone\.has-phone-keyboard \.lab-ask \.lab-ask-composer[^{]*\{[^}]*safe-area-inset-bottom/)
  })
})



function sourceWithFivePages() {
  const paragraphs = Array.from({ length: 5 }, (_, page) => (
    Array.from({ length: 80 }, (_, index) => (
      (index + 1) % 20 === 0 ? `p${page}w${index}.` : `p${page}w${index}`
    )).join(' ')
  ))
  return {
    ...fallbackLabSource(),
    paragraphs,
    followParagraphs: paragraphs.map((text, index) => ({
      index,
      text,
      file: `p${index}.mp3`,
      duration: 20,
    })),
    chapters: [{ number: 1, title: 'Book 1' }],
  }
}
function sourceWithManyWords() {
  const words = Array.from({ length: 200 }, (_, index) => ({
    text: (index + 1) % 20 === 0 ? `w${index}.` : `w${index}`,
    start: index * 0.3,
    end: index * 0.3 + 0.25,
  }))
  const text = words.map(word => word.text).join(' ')
  const first = followParagraphFromManifest(0, text, {
    duration: 60,
    file: 'p0.mp3',
    words,
  })
  return {
    ...fallbackLabSource(),
    paragraphs: [text, 'Later paragraph with its own page of leftover words after Book 1 opens.'],
    followParagraphs: [
      first,
      { index: 1, text: 'Later paragraph with its own page of leftover words after Book 1 opens.', file: 'p1.mp3', duration: 8 },
    ],
  }
}

describe('lab page turn identity', () => {

  it('keeps the desktop Compare divider in a dedicated center gutter', () => {
    const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')
    expect(css).toMatch(/\.lab\.is-desktop \.lab-book\.is-compare \.lab-book-columns\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) 52px minmax\(0, 1fr\)/)
    expect(css).toMatch(/\.lab\.is-desktop \.lab-book\.is-compare \.lab-book-col-compare\s*\{[^}]*grid-column:\s*3/)
    expect(css).toMatch(/\.lab\.is-desktop \.lab-book\.is-compare \.lab-book-columns::after\s*\{[^}]*grid-column:\s*2/)
  })

  it('Previous from page 5 lands on page 4 and Next returns to page 5', () => {
    render(<LabApp pathname="/lab/phone" source={sourceWithFivePages()} />)
    const progress = () => screen.getByTestId('lab-chapter-progress').textContent || ''
    expect(progress()).toContain('1 / 5')
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByTestId('lab-page-next'))
    expect(progress()).toContain('5 / 5')
    fireEvent.click(screen.getByTestId('lab-page-prev'))
    expect(progress()).toContain('4 / 5')
    expect(document.querySelector('.lab-hearing-line')?.textContent).toContain('p3w0')
    fireEvent.click(screen.getByTestId('lab-page-next'))
    expect(progress()).toContain('5 / 5')
    expect(document.querySelector('.lab-hearing-line')?.textContent).toContain('p4w0')
  })

  it('keeps the same N/M denominator while flipping pages', () => {
    render(<LabApp pathname="/lab/phone" source={sourceWithFivePages()} />)
    const denom = () => {
      const text = screen.getByTestId('lab-chapter-progress').textContent || ''
      const match = text.match(/(\d+)\s*\/\s*(\d+)/)
      return match ? match[2] : ''
    }
    const frozen = denom()
    expect(frozen).toBe('5')
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByTestId('lab-page-next'))
      expect(denom()).toBe(frozen)
    }
    fireEvent.click(screen.getByTestId('lab-page-prev'))
    expect(denom()).toBe(frozen)
  })

  it('rapid next/prev 10 times keeps adjacent page text and never shows N>M', () => {
    render(<LabApp pathname="/lab/phone" source={sourceWithFivePages()} />)
    const line = () => (document.querySelector('.lab-hearing-line')?.textContent || '').replace(/Keep this passage/g, '').trim()
    const nm = () => {
      const text = screen.getByTestId('lab-chapter-progress').textContent || ''
      const match = text.match(/(\d+)\s*\/\s*(\d+)/)
      return match ? { n: Number(match[1]), m: Number(match[2]), text } : { n: 0, m: 0, text }
    }
    const forward: string[] = [line()]
    for (let i = 0; i < 10; i++) {
      const btn = screen.queryByTestId('lab-page-next')
      if (!btn) break
      fireEvent.click(btn)
      const now = line()
      expect(now.length).toBeGreaterThan(0)
      forward.push(now)
      const { n, m, text } = nm()
      expect(n).toBeLessThanOrEqual(m)
      expect(text).not.toMatch(/9 \/ 8/)
    }
    expect(forward[0]).toContain('p0w0')
    expect(forward[1]).toContain('p1w0')
    expect(forward[2]).toContain('p2w0')
    expect(forward[3]).toContain('p3w0')
    expect(forward[4]).toContain('p4w0')
    const back: string[] = [line()]
    for (let i = 0; i < 10; i++) {
      const btn = screen.queryByTestId('lab-page-prev')
      if (!btn) break
      fireEvent.click(btn)
      const now = line()
      expect(now.length).toBeGreaterThan(0)
      back.push(now)
      const { n, m } = nm()
      expect(n).toBeLessThanOrEqual(m)
    }
    expect(back.some(text => text.includes('p0w0'))).toBe(true)
    expect(back[0]).toContain('p4w0')
    expect(back[1]).toContain('p3w0')
    expect(nm().text).toMatch(/1 \/ 5/)
  })

  it('Genesis 1 phone: after the page list exists, every page reports the same M', () => {
    const genesis = JSON.parse(readFileSync(resolve(__dirname, '../../public/data/editions-chapters/bible-kjv-en/ch0001.json'), 'utf8')).paragraphs as string[]
    render(<LabApp pathname="/lab/phone" source={{
      ...bibleFallbackSource(),
      chapterTitle: 'Genesis 1',
      chapterLabel: 'Genesis 1',
      paragraphs: genesis,
      followParagraphs: genesis.map((text, index) => ({ index, text })),
      chapters: [
        { number: 1, title: 'Genesis 1' },
        { number: 2, title: 'Genesis 2' },
      ],
    }} />)
    fireEvent.click(screen.getByTestId('lab-chapter-progress'))
    const nm = () => {
      const text = screen.getByTestId('lab-chapter-progress').textContent || ''
      const match = text.match(/(\d+)\s*\/\s*(\d+)/)
      return match ? { n: Number(match[1]), m: Number(match[2]), text } : { n: 0, m: 0, text }
    }
    const first = nm()
    expect(first.m).toBeGreaterThan(1)
    expect(first.n).toBe(1)
    expect(first.n).toBeLessThanOrEqual(first.m)
    expect(first.text).not.toMatch(/9 \/ 8/)
    const totals = new Set<number>([first.m])
    for (let i = 0; i < 40; i++) {
      const now = nm()
      expect(now.n).toBeLessThanOrEqual(now.m)
      expect(now.n).toBeGreaterThan(0)
      expect(now.text).not.toMatch(/9 \/ 8/)
      totals.add(now.m)
      if (now.n >= now.m) break
      const btn = screen.queryByTestId('lab-page-next')
      expect(btn).toBeTruthy()
      fireEvent.click(btn!)
    }
    const last = nm()
    expect(last.n).toBe(last.m)
    const frozen = last.m
    while (nm().n > 1) {
      fireEvent.click(screen.getByTestId('lab-page-prev'))
      const back = nm()
      expect(back.m).toBe(frozen)
      expect(back.n).toBeLessThanOrEqual(back.m)
    }
    expect(nm()).toMatchObject({ n: 1, m: frozen })
    expect(totals.size).toBe(1)
  })
})

describe('lab after-paint shrink', () => {
  function stubTooTallFirstPack() {
    const proto = HTMLElement.prototype
    const original = proto.getBoundingClientRect
    proto.getBoundingClientRect = function getBoundingClientRect() {
      const testid = this.getAttribute?.('data-testid') || ''
      if (
        this.classList?.contains('lab-bottom-chrome') || testid === 'lab-bottom-chrome'
        || this.classList?.contains('lab-phone-bar')
        || this.classList?.contains('lab-page-turn')
        || this.classList?.contains('lab-phone-transport')
        || this.classList?.contains('lab-hearing-transport')
      ) {
        return { top: 400, bottom: 480, height: 80, width: 390, left: 0, right: 390, x: 0, y: 400, toJSON() {} }
      }
      if (this.classList?.contains('lab-hearing-line')) {
        const words = (this.textContent || '').replace(/Keep this passage/g, '').trim().split(/\s+/).filter(Boolean).length
        const lines = Math.max(1, Math.ceil(words / 6))
        const height = lines * 40
        return { top: 160, bottom: 160 + height, height, width: 360, left: 15, right: 375, x: 15, y: 160, toJSON() {} }
      }
      if (this.classList?.contains('lab-passage-headline')) {
        return { top: 80, bottom: 160, height: 80, width: 360, left: 15, right: 375, x: 15, y: 80, toJSON() {} }
      }
      return original.call(this)
    }
    return () => { proto.getBoundingClientRect = original }
  }

  function lineWords() {
    return (document.querySelector('.lab-hearing-line')?.textContent || '')
      .replace(/Keep this passage/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
  }

  it('shrinks a too-tall first pack after paint and moves leftover words to page 2', async () => {
    const restore = stubTooTallFirstPack()
    try {
      render(<LabApp pathname="/lab/phone" source={sourceWithManyWords()} />)
      const firstWords = lineWords()
      expect(firstWords.length).toBeGreaterThan(40)
      await waitFor(() => {
        expect(lineWords().length).toBeLessThan(firstWords.length)
      })
      let prev = lineWords().length
      for (let i = 0; i < 12; i++) {
        await act(async () => {
          await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
        })
        const n = lineWords().length
        if (n === prev) break
        prev = n
      }
      const page1 = lineWords()
      expect(page1.length).toBeLessThan(firstWords.length)
      const leftover = firstWords[page1.length]
      expect(leftover).toBeTruthy()
      fireEvent.click(screen.getByTestId('lab-page-next'))
      const page2 = lineWords()
      expect(page2[0]).toBe(leftover)
      expect(page2.join(' ')).not.toBe(page1.join(' '))
    } finally {
      restore()
    }
  })

  it('rechecks a visible page after settle and peels it if browser paint overflows', async () => {
    const restore = stubTooTallFirstPack()
    try {
      render(<LabApp pathname="/lab/phone" source={sourceWithManyWords()} />)
      const firstWords = lineWords()
      await waitFor(() => {
        expect(lineWords().length).toBeLessThan(firstWords.length)
      })
      const nm = () => {
        const text = screen.getByTestId('lab-chapter-progress').textContent || ''
        const match = text.match(/(\d+)\s*\/\s*(\d+)/)
        return match ? { n: Number(match[1]), m: Number(match[2]) } : { n: 0, m: 0 }
      }
      let prev = lineWords().length
      let stable = 0
      for (let i = 0; i < 24; i++) {
        await act(async () => {
          await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
        })
        const n = lineWords().length
        if (n === prev) stable += 1
        else {
          stable = 0
          prev = n
        }
        if (stable >= 6) break
      }
      const settled = lineWords().join(' ')
      const frozen = nm()
      expect(frozen.m).toBeGreaterThan(1)
      expect(frozen.n).toBeLessThanOrEqual(frozen.m)
      for (let i = 0; i < 8; i++) {
        await act(async () => {
          await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
        })
      }
      expect(lineWords().join(' ')).toBe(settled)
      expect(nm()).toEqual(frozen)
      fireEvent.click(screen.getByTestId('lab-page-next'))
      const page2 = lineWords().join(' ')
      expect(page2).not.toBe(settled)
      const afterNext = nm()
      expect(afterNext.m).toBe(frozen.m)
      expect(afterNext.n).toBeLessThanOrEqual(afterNext.m)
      for (let i = 0; i < 6; i++) {
        await act(async () => {
          await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
        })
      }
      const correctedPage2 = lineWords().join(' ')
      expect(correctedPage2).not.toBe(page2)
      expect(correctedPage2.split(/\s+/).length).toBeLessThan(page2.split(/\s+/).length)
      expect(nm().m).toBeGreaterThanOrEqual(frozen.m)
      fireEvent.click(screen.getByTestId('lab-page-prev'))
      expect(lineWords().join(' ')).toBe(settled)
      expect(nm().n).toBe(1)
    } finally {
      restore()
    }
  })

  it('keeps last ink above the visible bar, not a lower chrome wrapper', async () => {
    const proto = HTMLElement.prototype
    const original = proto.getBoundingClientRect
    proto.getBoundingClientRect = function getBoundingClientRect() {
      const testid = this.getAttribute?.('data-testid') || ''
      if (this.classList?.contains('lab-phone-bar') || testid === 'lab-phone-bar') {
        return { top: 360, bottom: 420, height: 60, width: 390, left: 0, right: 390, x: 0, y: 360, toJSON() {} }
      }
      if (this.classList?.contains('lab-bottom-chrome') || testid === 'lab-bottom-chrome') {
        return { top: 480, bottom: 560, height: 80, width: 390, left: 0, right: 390, x: 0, y: 480, toJSON() {} }
      }
      if (this.classList?.contains('lab-hearing-line')) {
        const words = (this.textContent || '').replace(/Keep this passage/g, '').trim().split(/\s+/).filter(Boolean).length
        const lines = Math.max(1, Math.ceil(words / 6))
        const height = lines * 40
        return { top: 160, bottom: 160 + height, height, width: 360, left: 15, right: 375, x: 15, y: 160, toJSON() {} }
      }
      if (this.classList?.contains('lab-passage-headline')) {
        return { top: 80, bottom: 160, height: 80, width: 360, left: 15, right: 375, x: 15, y: 80, toJSON() {} }
      }
      return original.call(this)
    }
    try {
      render(<LabApp pathname="/lab/phone" source={sourceWithManyWords()} />)
      const firstWords = lineWords()
      await waitFor(() => {
        expect(lineWords().length).toBeLessThan(firstWords.length)
      })
      const page1 = lineWords()
      expect(page1.length).toBeLessThan(firstWords.length)
      const leftover = firstWords[page1.length]
      fireEvent.click(screen.getByTestId('lab-page-next'))
      expect(lineWords()[0]).toBe(leftover)
    } finally {
      proto.getBoundingClientRect = original
    }
  })

  function genesis1Source() {
    const text = 'In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.'
    return {
      ...bibleFallbackSource(),
      chapterTitle: 'Genesis 1',
      chapterLabel: 'Genesis 1',
      paragraphs: [text],
      followParagraphs: [{ index: 0, text, file: 'p0.mp3', duration: 20 }],
      chapters: [{ number: 1, title: 'Genesis 1' }],
    }
  }

  it('peels Genesis 1 page 1 when last ink is on the phone bar or the passage scrolls', async () => {
    const proto = HTMLElement.prototype
    const original = proto.getBoundingClientRect
    proto.getBoundingClientRect = function getBoundingClientRect() {
      const testid = this.getAttribute?.('data-testid') || ''
      if (
        this.classList?.contains('lab-bottom-chrome') || testid === 'lab-bottom-chrome'
        || this.classList?.contains('lab-phone-bar')
        || this.classList?.contains('lab-page-turn')
      ) {
        return { top: 560, bottom: 640, height: 80, width: 390, left: 0, right: 390, x: 0, y: 560, toJSON() {} }
      }
      if (this.classList?.contains('lab-hearing-line')) {
        const words = (this.textContent || '').replace(/Keep this passage/g, '').trim().split(/\s+/).filter(Boolean).length
        const lines = Math.max(1, Math.ceil(words / 6))
        const height = lines * 36
        return { top: 200, bottom: 200 + height, height, width: 360, left: 15, right: 375, x: 15, y: 200, toJSON() {} }
      }
      if (this.classList?.contains('lab-passage-headline')) {
        return { top: 80, bottom: 200, height: 120, width: 360, left: 15, right: 375, x: 15, y: 80, toJSON() {} }
      }
      return original.call(this)
    }
    const scrollGet = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight')
    const clientGet = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get() {
        if (this.classList?.contains('lab-passage') || this.classList?.contains('lab-page-wrap')) return 480
        return clientGet?.get?.call(this) ?? 0
      },
    })
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        if (this.classList?.contains('lab-passage') || this.classList?.contains('lab-page-wrap')) {
          const words = (this.textContent || '').trim().split(/\s+/).filter(Boolean).length
          return words > 28 ? 487 : 480
        }
        return scrollGet?.get?.call(this) ?? 0
      },
    })
    try {
      render(<LabApp pathname="/lab/phone" source={genesis1Source()} />)
      expect(screen.getByTestId('lab-passage-headline').textContent).toContain('Genesis 1')
      const firstWords = lineWords()
      expect(firstWords.length).toBeGreaterThan(20)
      await waitFor(() => {
        expect(lineWords().length).toBeLessThan(firstWords.length)
      })
      const page1 = lineWords()
      expect(page1.length).toBeGreaterThan(1)
      const leftover = firstWords[page1.length]
      expect(leftover).toBeTruthy()
      fireEvent.click(screen.getByTestId('lab-page-next'))
      expect(lineWords()[0]).toBe(leftover)
    } finally {
      proto.getBoundingClientRect = original
      if (scrollGet) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', scrollGet)
      if (clientGet) Object.defineProperty(HTMLElement.prototype, 'clientHeight', clientGet)
    }
  })
})


describe('lab chrome pass', () => {
  it('switches a Reading-now book through one saved coherent handoff tuple', () => {
    localStorage.setItem('tinct-lab-position', JSON.stringify({
      books: {
        odyssey: { bookId: 'odyssey', headerBook: 'The Odyssey', chapterNumber: 1, sequentialChapter: 1, paragraphIndex: 0, wordIndex: 0, pageIndex: 0, primaryEditionKey: 'original-en', updatedAt: 10, deviceId: 'device', rev: 1 },
        crito: { bookId: 'crito', headerBook: 'Crito', chapterNumber: 2, sequentialChapter: 2, paragraphIndex: 4, wordIndex: 3, pageIndex: 2, primaryEditionKey: 'modern-en', updatedAt: 20, deviceId: 'device', rev: 2 },
      },
      recentChapters: {}, finished: {}, hidden: {}, lastSettledBookId: 'odyssey', lastSettledAt: 10,
      updatedAt: 20, deviceId: 'device', owner: null,
    }))
    render(<LabApp pathname="/lab/phone" source={{ ...fallbackLabSource(), bookId: 'odyssey' }} />)
    const titleButton = screen.getByTestId('lab-header-book')
    expect(titleButton.getAttribute('aria-haspopup')).toBe('dialog')
    expect(titleButton.querySelector('.lab-header-book-chevron')).toBeNull()
    fireEvent.click(titleButton)
    fireEvent.click(screen.getByRole('button', { name: /Crito.*Chapter 2/i }))
    expect(JSON.parse(sessionStorage.getItem('tinct:lab-reader-handoff') || 'null')).toEqual({
      kind: 'open-reader',
      bookId: 'crito',
      primaryEditionKey: 'modern-en',
      savedPlace: { bookId: 'crito', chapterNumber: 2, page: 2, paragraphIndex: 4, wordIndex: 3 },
    })
  })

  it('wakes hidden controls from the top bar: the title reveals them, the chapter pill also opens the picker, neither turns the page', () => {
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} />)
    const root = screen.getByTestId('lab-root')
    const page = screen.getByTestId('lab-book')
    const stage = screen.getByTestId('lab-reading-stage')
    vi.spyOn(page, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, right: 390, bottom: 700,
      width: 390, height: 700, toJSON() {},
    })
    const hideControls = (pointerId: number) => {
      fireEvent.pointerDown(page, { pointerId, pointerType: 'touch', clientX: 370, clientY: 500 })
      fireEvent.pointerUp(page, { pointerId, pointerType: 'touch', clientX: 370, clientY: 500 })
      expect(root.getAttribute('data-reader-controls')).toBe('hidden')
    }

    hideControls(41)
    const pageText = stage.textContent
    fireEvent.click(screen.getByTestId('lab-header-work'))
    expect(root.getAttribute('data-reader-controls')).toBe('visible')
    expect(stage.textContent).toBe(pageText)
    expect(screen.queryByTestId('lab-toc')).toBeNull()
    // Visible controls: the title stays inert in the retained V1 DOM.
    fireEvent.click(screen.getByTestId('lab-header-work'))
    expect(root.getAttribute('data-reader-controls')).toBe('visible')
    expect(screen.queryByTestId('lab-toc')).toBeNull()

    hideControls(42)
    const nextPageText = stage.textContent
    fireEvent.click(screen.getByTestId('lab-header-chapter'))
    expect(root.getAttribute('data-reader-controls')).toBe('visible')
    expect(screen.getByTestId('lab-toc')).toBeTruthy()
    expect(stage.textContent).toBe(nextPageText)

    const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')
    const hiddenPill = css.match(/data-reader-controls="hidden"\] \.lab-header-chapter,[^{]*\{([^}]*)\}/)
    expect(hiddenPill).toBeTruthy()
    expect(hiddenPill![1]).not.toContain('pointer-events')
    expect(css).toMatch(/\.lab \.lab-hearing-line\.is-continued\[data-tail-full="true"\]\s*\{[^}]*text-align-last:\s*var\(--lab-text-align, justify\)/)
  })

  it('locks the V1 footer as an overlaid light Depth dock with a dark Tint variant', () => {
    const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')
    expect(css).toContain('V1 quiet immersive reader')
    expect(css).toMatch(/\.lab\.is-phone:not\(\.has-phone-ask\) \.lab-bottom-chrome,[^{]*\{[^}]*position:\s*absolute[^}]*height:\s*calc\(3rem/)
    expect(css).toMatch(/\.lab\.is-phone:not\(\.has-phone-ask\) \.lab-body,[^{]*\{[^}]*padding-bottom:\s*calc\(3rem/)
    expect(css).not.toMatch(/data-reader-controls="visible"[^}]*\.lab-body/)
    expect(css).not.toMatch(/data-reader-controls="visible"[^}]*\.lab-bottom-chrome/)
    expect(css).toMatch(/data-reader-controls="visible"[^}]*\.lab-page-turn\.is-phone-rail,[^{]*\{[^}]*display:\s*none/)
    expect(css).toMatch(/\.lab\.is-phone:not\(\.has-phone-ask\) \.lab-phone-bar,[^{]*\{[^}]*border-radius:\s*1\.05rem[^}]*linear-gradient[^}]*box-shadow:/)
    expect(css).toMatch(/data-reader-controls="hidden"[^}]*\.lab-phone-bar[^{]*\{[^}]*visibility:\s*hidden[^}]*opacity:\s*0/)
    expect(css).toMatch(/data-reader-controls="hidden"[^}]*\.lab-page-turn\.is-phone-rail[^{]*\{[^}]*bottom:\s*max\(0\.35rem, env\(safe-area-inset-bottom/)
    expect(css).toMatch(/Dark uses the warmer Tint treatment locked in the V1 design/)
  })

  it('toggles the printed mobile progress between book and chapter without opening settings', () => {
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} />)
    const progress = screen.getByTestId('lab-chapter-progress')
    expect(progress.textContent).toMatch(/^[\d,]+ \/ [\d,]+ of book · \d+%$/)
    fireEvent.click(progress)
    expect(progress.textContent).toMatch(/^\d+ \/ \d+ of chapter · \d+%$/)
    fireEvent.click(progress)
    expect(progress.textContent).toMatch(/^[\d,]+ \/ [\d,]+ of book · \d+%$/)
    expect(screen.queryByTestId('lab-settings')).toBeNull()
  })

  it('keeps a long chapter title ellipsized beside a fixed Tune slot', () => {
    const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')
    expect(css).toMatch(/\.lab\.has-phone-chrome \.lab-header-brand\s*\{[^}]*align-items:\s*center[^}]*overflow:\s*hidden/)
    expect(css).toMatch(/\.lab\.has-phone-chrome \.lab-header-chapter,[\s\S]*?flex:\s*0 1 auto[^}]*gap:\s*0\.56rem[^}]*overflow:\s*hidden/)
    expect(css).toMatch(/\.lab\.has-phone-chrome \.lab-header-chevron\s*\{[^}]*width:\s*0\.76rem[^}]*margin-left:\s*0\.12rem/)
    expect(css).toMatch(/\.lab\.has-phone-chrome \.lab-header-controls\s*\{[^}]*width:\s*2\.75rem/)
  })

  it('uses the shared dim night palette on phone and desktop without changing the light paper', () => {
    const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')
    expect(css).toMatch(/\.lab\s*\{[^}]*--lab-paper:\s*#ece7db;/)
    expect(css).toMatch(/\.lab\.is-night\s*\{[^}]*--lab-paper:\s*#171411;[^}]*--lab-ink:\s*#bdb3a7;[^}]*--lab-ink-muted:\s*#8f857a;/)
    expect(css).toMatch(/\.lab\.is-night\.is-desktop\s*\{[^}]*--lab-paper:\s*#171411;[^}]*--lab-ink:\s*#bdb3a7;[^}]*--lab-ink-muted:\s*#8f857a;/)
  })
})


describe('lab reading position', () => {
  it('restores the last settled biblical book on open', async () => {
    resetLabBibleManifestCache()
    localStorage.setItem('tinct-lab-position', JSON.stringify({
      books: {
        romans: {
          bookId: 'romans',
          headerBook: 'Romans',
          chapterNumber: 8,
          sequentialChapter: 1054,
          paragraphIndex: 4,
          wordIndex: 11,
          updatedAt: 40_000,
          deviceId: 'test',
          rev: 3,
        },
      },
      lastSettledBookId: 'romans',
      lastSettledAt: 40_000,
      updatedAt: 40_000,
      deviceId: 'test',
    }))
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('manifest.json')) {
        return { ok: true, json: async () => ({
          chapters: [
            { number: 1, title: 'Genesis 1', path: 'ch0001.json' },
            { number: 1054, title: 'Romans 8', path: 'ch1054.json' },
          ],
        }) }
      }
      if (url.includes('ch1054.json') && url.includes('kjv')) {
        return { ok: true, json: async () => ({ paragraphs: ['There is therefore now no condemnation.'] }) }
      }
      if (url.includes('ch1054.json')) {
        return { ok: true, json: async () => ({ paragraphs: ['So now there is no condemnation.'] }) }
      }
      if (url.includes('threads.json')) {
        return { ok: true, json: async () => ({ characters: [] }) }
      }
      if (url.includes('audio-manifest') || url.includes('lab-position')) {
        return { ok: true, json: async () => ({}) }
      }
      return { ok: false, json: async () => ({}) }
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab" authToken={null} />)
    const root = screen.getByTestId('lab-root')
    expect(root.getAttribute('data-biblical-book')).toBe('romans')
    expect(root.getAttribute('data-chapter')).toBe('1054')
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Romans/)
    expect(root.getAttribute('data-place')).toBe('4:11')
    await waitFor(() => {
      expect(screen.getByTestId('lab-passage-headline').textContent).toMatch(/Romans 8/)
    })
  })
})

describe('lab reader first paint: one resolved position', () => {
  const MANIFEST = {
    chapters: [
      { number: 1, title: 'Genesis 1', path: 'ch0001.json' },
      { number: 645, title: 'Proverbs 17', path: 'ch0645.json' },
      { number: 1054, title: 'Romans 8', path: 'ch1054.json' },
      { number: 1136, title: 'Hebrews 3', path: 'ch1136.json' },
    ],
  }
  const TEXT: Record<string, string> = {
    'ch0001.json': 'In the beginning God created the heaven and the earth.',
    'ch0645.json': 'Better is a dry morsel, and quietness therewith.',
    'ch1054.json': 'There is therefore now no condemnation.',
    'ch1136.json': 'Wherefore, holy brethren, partakers of the heavenly calling.',
  }
  function place(bookId: string, headerBook: string, chapterNumber: number, sequentialChapter: number, updatedAt: number, deviceId: string) {
    return { bookId, headerBook, chapterNumber, sequentialChapter, paragraphIndex: 0, wordIndex: 0, updatedAt, deviceId, rev: 1 }
  }
  function record(books: Record<string, ReturnType<typeof place>>, lastSettledBookId: string, lastSettledAt: number, deviceId: string) {
    return { books, finished: {}, lastSettledBookId, lastSettledAt, updatedAt: lastSettledAt, deviceId }
  }
  function stubBible(cloud: () => Promise<unknown | null>) {
    resetLabBibleManifestCache()
    resetLabChapterTextCache()
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.includes('manifest.json')) return { ok: true, json: async () => MANIFEST }
      const chapter = Object.keys(TEXT).find(file => url.includes(file))
      if (chapter) return { ok: true, json: async () => ({ paragraphs: [TEXT[chapter]] }) }
      if (url.includes('threads.json')) return { ok: true, json: async () => ({ characters: [] }) }
      if (url.includes('lab-position')) {
        if (init?.method === 'PUT') return { ok: true, json: async () => ({}) }
        const body = await cloud()
        return body ? { ok: true, json: async () => body } : { ok: false, status: 503, json: async () => ({}) }
      }
      return { ok: false, json: async () => ({}) }
    }))
  }
  /** Every distinct chapter heading the header painted, in order, plus the ready flags seen with it. */
  function observeHeadings(root: HTMLElement) {
    const trail: Array<{ label: string; ready: string | null; resolving: string | null }> = []
    const sample = () => {
      const label = root.querySelector('[data-testid="lab-header-chapter-label"], .lab-header-chapter-label')?.textContent ?? ''
      const entry = { label, ready: root.getAttribute('data-reader-ready'), resolving: root.getAttribute('data-position-resolving') }
      const last = trail[trail.length - 1]
      if (!last || last.label !== entry.label || last.ready !== entry.ready || last.resolving !== entry.resolving) trail.push(entry)
    }
    sample()
    const observer = new MutationObserver(sample)
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true })
    return { trail, stop: () => observer.disconnect() }
  }

  it('local says Proverbs 17, cloud says Hebrews 3 (newer): the header names Hebrews 3 and nothing else', async () => {
    localStorage.setItem('tinct-lab-device-id', 'phone')
    localStorage.setItem('tinct-lab-position', JSON.stringify(record({ proverbs: place('proverbs', 'Proverbs', 17, 645, 100_000, 'phone') }, 'proverbs', 100_000, 'phone')))
    let answer!: (value: unknown) => void
    const cloud = new Promise<unknown>((resolve) => { answer = resolve })
    stubBible(() => cloud)
    render(<LabApp pathname="/lab/phone" authToken="signed-in" />)
    const root = screen.getByTestId('lab-root')
    const headings = observeHeadings(root)
    expect(root.getAttribute('data-position-resolving')).toBe('true')
    expect(screen.getByTestId('lab-header-chapter').textContent).not.toMatch(/Proverbs/)
    // The local chapter loads while the cloud is still pending: still no heading.
    await waitFor(() => expect(root.getAttribute('data-chapter')).toBe('645'))
    expect(root.getAttribute('data-position-resolving')).toBe('true')
    expect(screen.getByTestId('lab-header-chapter').textContent).not.toMatch(/Proverbs/)
    await act(async () => {
      answer(record({ proverbs: place('proverbs', 'Proverbs', 17, 645, 100_000, 'phone'), hebrews: place('hebrews', 'Hebrews', 3, 1136, 200_000, 'desk') }, 'hebrews', 200_000, 'desk'))
    })
    await waitFor(() => expect(screen.getByTestId('lab-passage-headline').textContent).toMatch(/Hebrews 3/))
    await waitFor(() => expect(root.getAttribute('data-reader-ready')).toBe('true'))
    headings.stop()
    const painted = [...new Set(headings.trail.map(entry => entry.label).filter(Boolean))]
    expect(painted).toEqual(['Hebrews 3'])
    expect(headings.trail.some(entry => entry.ready === 'true' && entry.label !== 'Hebrews 3')).toBe(false)
    expect(root.getAttribute('data-biblical-book')).toBe('hebrews')
  })

  it('local says Proverbs 17, cloud is older (Hebrews 3): the header names Proverbs 17 and nothing else', async () => {
    localStorage.setItem('tinct-lab-device-id', 'phone')
    localStorage.setItem('tinct-lab-position', JSON.stringify(record({ proverbs: place('proverbs', 'Proverbs', 17, 645, 300_000, 'phone') }, 'proverbs', 300_000, 'phone')))
    stubBible(async () => record({ hebrews: place('hebrews', 'Hebrews', 3, 1136, 200_000, 'desk') }, 'hebrews', 200_000, 'desk'))
    render(<LabApp pathname="/lab/phone" authToken="signed-in" />)
    const root = screen.getByTestId('lab-root')
    const headings = observeHeadings(root)
    await waitFor(() => expect(screen.getByTestId('lab-passage-headline').textContent).toMatch(/Proverbs 17/))
    await waitFor(() => expect(root.getAttribute('data-reader-ready')).toBe('true'))
    headings.stop()
    expect([...new Set(headings.trail.map(entry => entry.label).filter(Boolean))]).toEqual(['Proverbs 17'])
  })

  it('a library handoff (reading-memory anchor Romans 8) wins over local Proverbs 17 and cloud Hebrews 3, painted once', async () => {
    localStorage.setItem('tinct-lab-device-id', 'phone')
    localStorage.setItem('tinct-lab-position', JSON.stringify(record({ proverbs: place('proverbs', 'Proverbs', 17, 645, 100_000, 'phone') }, 'proverbs', 100_000, 'phone')))
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
      kind: 'open-reader', bookId: 'bible', primaryEditionKey: 'kjv-en',
      savedPlace: { bookId: 'bible', chapterNumber: 1054, paragraphIndex: 0 },
    }))
    stubBible(async () => record({ hebrews: place('hebrews', 'Hebrews', 3, 1136, 900_000, 'desk') }, 'hebrews', 900_000, 'desk'))
    render(<LabApp pathname="/lab/phone" authToken="signed-in" />)
    const root = screen.getByTestId('lab-root')
    const headings = observeHeadings(root)
    // The handoff's placeholder label ("Chapter 1054") is never painted.
    expect(screen.getByTestId('lab-header-chapter').textContent).not.toMatch(/Chapter/)
    await waitFor(() => expect(screen.getByTestId('lab-passage-headline').textContent).toMatch(/Romans 8/))
    await waitFor(() => expect(root.getAttribute('data-reader-ready')).toBe('true'))
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)) })
    headings.stop()
    expect([...new Set(headings.trail.map(entry => entry.label).filter(Boolean))]).toEqual(['Romans 8'])
    expect(root.getAttribute('data-biblical-book')).toBe('romans')
  })

  it('a library Continue rechecks cloud and resumes Hebrews instead of its stale Romans handoff', async () => {
    localStorage.setItem('tinct-lab-device-id', 'phone')
    localStorage.setItem('tinct-lab-position', JSON.stringify(record({ proverbs: place('proverbs', 'Proverbs', 17, 645, 100_000, 'phone') }, 'proverbs', 100_000, 'phone')))
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
      kind: 'open-reader', resumeLatest: true, bookId: 'bible', primaryEditionKey: 'kjv-en',
      savedPlace: { bookId: 'bible', chapterNumber: 1054, paragraphIndex: 0 },
    }))
    stubBible(async () => record({ hebrews: place('hebrews', 'Hebrews', 3, 1136, 900_000, 'desk') }, 'hebrews', 900_000, 'desk'))
    render(<LabApp pathname="/lab/phone" authToken="signed-in" />)
    const root = screen.getByTestId('lab-root')
    const headings = observeHeadings(root)
    // The handoff's placeholder label ("Chapter 1054") is never painted.
    expect(screen.getByTestId('lab-header-chapter').textContent).not.toMatch(/Chapter/)
    try {
      await waitFor(() => expect(screen.getByTestId('lab-passage-headline').textContent).toMatch(/Hebrews 3/))
    } catch (error) {
      console.error('Continue resume diagnostic', JSON.stringify({
        headings: headings.trail,
        position: JSON.parse(localStorage.getItem('tinct-lab-position') || 'null'),
        requests: vi.mocked(fetch).mock.calls.map(([url, init]) => ({ url: String(url), method: init?.method || 'GET' })),
      }))
      throw error
    }
    await waitFor(() => expect(root.getAttribute('data-reader-ready')).toBe('true'))
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)) })
    headings.stop()
    expect([...new Set(headings.trail.map(entry => entry.label).filter(Boolean))]).toEqual(['Hebrews 3'])
    expect(root.getAttribute('data-biblical-book')).toBe('hebrews')
  })

  it('signed out: the local place is final and paints at once', async () => {
    localStorage.setItem('tinct-lab-device-id', 'phone')
    localStorage.setItem('tinct-lab-position', JSON.stringify(record({ proverbs: place('proverbs', 'Proverbs', 17, 645, 100_000, 'phone') }, 'proverbs', 100_000, 'phone')))
    stubBible(async () => null)
    render(<LabApp pathname="/lab/phone" authToken={null} />)
    const root = screen.getByTestId('lab-root')
    expect(root.getAttribute('data-position-resolving')).toBe('false')
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Proverbs 17/)
    await waitFor(() => expect(screen.getByTestId('lab-passage-headline').textContent).toMatch(/Proverbs 17/))
  })
})

describe('V2 listening place (2026-09-30)', () => {
  const wordAt = (index: number) => screen.getByTestId('lab-book')
    .querySelector<HTMLElement>(`[data-testid="lab-word"][data-paragraph-index="0"][data-word-index="${index}"]`)!
  const tap = (word: HTMLElement) => {
    fireEvent.pointerDown(word, { pointerType: 'mouse', button: 0, clientX: 50, clientY: 50 })
    fireEvent.pointerUp(word, { pointerType: 'mouse', clientX: 50, clientY: 50 })
  }

  it('a tap while listening moves audio to that exact word and never opens Define', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class { constructor() { return audio } })
    render(<LabApp pathname="/lab/phone" source={sourceWithManyWords()} />)
    fireEvent.click(screen.getByTestId('lab-v2-play'))
    await waitFor(() => expect(audio.paused).toBe(false))
    tap(wordAt(25))
    await waitFor(() => expect(audio.currentTime).toBeCloseTo(25 * 0.3))
    expect(audio.paused).toBe(false)
    expect(document.querySelector('.selection-popup')).toBeNull()
  })

  it('resumes after pause from the sentence of the latest place, including a word tapped while paused', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class { constructor() { return audio } })
    render(<LabApp pathname="/lab/phone" source={sourceWithManyWords()} />)
    fireEvent.click(screen.getByTestId('lab-v2-play'))
    await waitFor(() => expect(audio.paused).toBe(false))
    // Jump to w25 while playing, then pause and play: back to the start of
    // that sentence (w20), not to the page's first word.
    tap(wordAt(25))
    await waitFor(() => expect(audio.currentTime).toBeCloseTo(25 * 0.3))
    fireEvent.click(screen.getByTestId('lab-v2-play'))
    expect(audio.paused).toBe(true)
    fireEvent.click(screen.getByTestId('lab-v2-play'))
    await waitFor(() => expect(audio.paused).toBe(false))
    expect(audio.currentTime).toBeCloseTo(20 * 0.3)
    // Pause, tap w45 while paused: audio moves but stays paused, no Define.
    fireEvent.click(screen.getByTestId('lab-v2-play'))
    expect(audio.paused).toBe(true)
    tap(wordAt(45))
    expect(audio.paused).toBe(true)
    expect(document.querySelector('.selection-popup')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-v2-play'))
    await waitFor(() => expect(audio.paused).toBe(false))
    expect(audio.currentTime).toBeCloseTo(40 * 0.3)
  })
})

it('V2 plays from the new visible page after pausing and browsing, without replaying the chapter title', async () => {
  const audio = new FakeAudio()
  audio.duration = 500
  vi.stubGlobal('Audio', class { constructor() { return audio } })
  render(<LabApp pathname="/lab/phone" source={{ ...sourceWithManyWords(), audioTitle: { kind: 'title', file: 'title.mp3', duration: 2 } }} />)
  fireEvent.click(screen.getByTestId('lab-v2-play'))
  await waitFor(() => expect(audio.paused).toBe(false))
  expect(audio.src).not.toContain('title.mp3')
  fireEvent.click(screen.getByTestId('lab-v2-play'))
  expect(audio.paused).toBe(true)
  expect(screen.getByTestId('lab-v2-play').getAttribute('aria-label')).toBe('Play')
  expect(screen.getByTestId('lab-listen').getAttribute('aria-label')).toBe('Resume audiobook')
  expect(document.querySelector('[data-chrome-version="v2"]')?.getAttribute('data-transport')).toBe('open')
  // 2026-09-19: turning the page while paused puts the transport away; the
  // top-bar Play still resumes from the page now in view.
  fireEvent.click(screen.getByTestId('lab-page-next'))
  expect(document.querySelector('[data-chrome-version="v2"]')?.getAttribute('data-transport')).toBe('closed')
  const first = screen.getByTestId('lab-book').querySelector<HTMLElement>('[data-testid="lab-word"]')!
  const index = Number(first.dataset.wordIndex)
  expect(index).toBeGreaterThan(0)
  fireEvent.click(screen.getByTestId('lab-v2-play'))
  await waitFor(() => expect(audio.paused).toBe(false))
  expect(audio.currentTime).toBe(index * 0.3)
  fireEvent.click(screen.getByTestId('lab-v2-play'))
  fireEvent.click(screen.getByRole('button', { name: 'Close audio controls' }))
  expect(document.querySelector('[data-chrome-version="v2"]')?.getAttribute('data-transport')).toBe('closed')
  expect(audio.paused).toBe(true)
})


it('returns from V2 audio browsing without seeking or restarting playback', async () => {
  const audio = new FakeAudio()
  vi.stubGlobal('Audio', class { constructor() { return audio } })
  render(<LabApp pathname="/lab/phone" source={sourceWithManyWords()} />)
  fireEvent.click(screen.getByTestId('lab-v2-play'))
  await waitFor(() => expect(screen.getByTestId('lab-book').className).toContain('is-inline-hearing'))
  fireEvent.click(screen.getByTestId('lab-page-next'))
  await waitFor(() => expect(screen.getByTestId('lab-back-to-audio')).toBeTruthy())
  const time = audio.currentTime
  fireEvent.click(screen.getByTestId('lab-back-to-audio'))
  expect(screen.queryByTestId('lab-back-to-audio')).toBeNull()
  expect(audio.currentTime).toBe(time)
  expect(screen.getByTestId('lab-book').className).toContain('is-inline-hearing')
})


it('dismisses V2 speed controls with Done, outside tap and Escape without changing speed', async () => {
  const audio = new FakeAudio()
  vi.stubGlobal('Audio', class { constructor() { return audio } })
  render(<LabApp pathname="/lab/phone" source={sourceWithManyWords()} />)
  fireEvent.click(screen.getByTestId('lab-v2-play'))
  await waitFor(() => expect(audio.paused).toBe(false))
  fireEvent.click(screen.getByTestId('lab-hearing-speed'))
  fireEvent.change(screen.getByTestId('lab-audio-speed-slider'), { target: { value: '1.75' } })
  fireEvent.click(screen.getByRole('button', { name: 'Done', exact: true }))
  expect(screen.queryByTestId('lab-audio-speed-popover')).toBeNull()
  expect(screen.getByTestId('lab-hearing-speed').textContent).toBe('1.75×')
  fireEvent.click(screen.getByTestId('lab-hearing-speed'))
  fireEvent.pointerDown(document.body)
  expect(screen.queryByTestId('lab-audio-speed-popover')).toBeNull()
  fireEvent.click(screen.getByTestId('lab-hearing-speed'))
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.queryByTestId('lab-audio-speed-popover')).toBeNull()
  expect(audio.paused).toBe(false)
})

it('selects a short final line by vertical proximity on touch after a 240ms hold', () => {
  vi.useFakeTimers()
  const onSelectRange = vi.fn()
  const { container } = render(<LabPassage chapterTitle="Short lines" readingPage={{ paragraphIndex: 0, from: 0, to: 2, segments: [{ paragraphIndex: 0, from: 0, to: 2 }, { paragraphIndex: 1, from: 0, to: 1 }, { paragraphIndex: 2, from: 0, to: 2 }] }} paragraphs={['Opening words', 'End.', 'Next section']} compareParagraphs={[]} compare={false} mode="reading" follow={{ kind: 'none' }} followParagraphs={[]} markedIndexes={new Set()} chapterNumber={1} onSelectRange={onSelectRange} />)
  const words = screen.getAllByTestId('lab-word')
  words.forEach((word, index) => {
    const top = index < 2 ? 100 : index === 2 ? 130 : 160
    const left = index < 3 ? 50 + (index === 1 ? 70 : 0) : 300 + (index - 3) * 60
    vi.spyOn(word, 'getBoundingClientRect').mockReturnValue({ left, right: left + 45, top, bottom: top + 20, width: 45, height: 20, x: left, y: top, toJSON() {} })
  })
  const surface = container.querySelector('.lab-passage')!
  const prior = document.elementFromPoint
  document.elementFromPoint = () => surface
  try {
    fireEvent.pointerDown(words[0], { pointerId: 810, pointerType: 'touch', clientX: 60, clientY: 110 })
    act(() => vi.advanceTimersByTime(240))
    fireEvent.pointerMove(surface, { pointerId: 810, pointerType: 'touch', clientX: 310, clientY: 140 })
    fireEvent.pointerUp(surface, { pointerId: 810, pointerType: 'touch', clientX: 310, clientY: 140 })
    expect(onSelectRange).toHaveBeenCalledWith(expect.objectContaining({ endParagraphIndex: 1, toWord: 1 }), 310, 140, undefined)
  } finally { document.elementFromPoint = prior; vi.useRealTimers() }
})

it.each([[120, true], [50, false]])('distinguishes slow selection movement at %ims from a quick swipe', (elapsed, expected) => {
  vi.useFakeTimers()
  const select = vi.fn()
  render(<LabPassage chapterTitle="Test" paragraphs={['Tell me O Muse']} compareParagraphs={[]} compare={false} mode="reading" follow={{kind:'none'}} followParagraphs={[]} markedIndexes={new Set()} onSelectRange={select} readingPage={{paragraphIndex:0,from:0,to:4}} />)
  const word = screen.getAllByTestId('lab-word')[1]
  const down = createEvent.pointerDown(word, {pointerId:42,pointerType:'touch',clientX:180,clientY:200})
  Object.defineProperty(down,'timeStamp',{value:1000})
  fireEvent(word,down)
  const move = createEvent.pointerMove(word,{pointerId:42,pointerType:'touch',clientX:202,clientY:200})
  Object.defineProperty(move,'timeStamp',{value:1000+elapsed})
  fireEvent(word,move)
  act(()=>vi.advanceTimersByTime(160))
  expect(word.classList.contains('is-selecting')).toBe(expected)
  fireEvent.pointerUp(word,{pointerId:42,pointerType:'touch',clientX:202,clientY:200})
  expect(select).toHaveBeenCalledTimes(expected?1:0)
  vi.useRealTimers()
})

it('keeps mobile selection painted after its menu opens when both edition keys match', () => {
  localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition:'kjv-en',compareEdition:'kjv-en' }))
  render(<LabApp pathname="/lab/phone" source={{...fallbackLabSource(),bookId:'bible'}} />)
  const words=screen.getAllByTestId('lab-word')
  fireEvent.pointerDown(words[1],{pointerType:'mouse',clientX:150,clientY:200})
  fireEvent.pointerMove(words[3],{pointerType:'mouse',clientX:230,clientY:200})
  fireEvent.pointerUp(words[3],{pointerType:'mouse',clientX:230,clientY:200})
  expect(screen.getByRole('button',{name:'Explain',exact:true})).toBeTruthy()
  for(const word of words.slice(1,4))expect(word.classList.contains('is-selecting')).toBe(true)
})

it.each(['/lab/desktop', '/lab/phone'])('Play restarts the first visible word, without moving the page during loading (%s)', async pathname => {
  const audio = new FakeAudio()
  audio.duration = 500
  vi.stubGlobal('Audio', class { constructor() { return audio } })
  render(<LabApp pathname={pathname} source={sourceWithManyWords()} />)
  const play = () => fireEvent.click(screen.getByTestId('lab-v2-play'))
  const firstWord = () => screen.getByTestId('lab-book').querySelector<HTMLElement>('[data-testid="lab-word"], .lab-hearing-word')!
  play()
  await waitFor(() => expect(audio.paused).toBe(false))
  // Pause several words into the first page: Play must not resume that cursor.
  audio.currentTime = 1.5
  act(() => audio.emit('timeupdate'))
  play()
  const firstIndex = Number(firstWord().dataset.wordIndex)
  play()
  await waitFor(() => expect(audio.currentTime).toBe(firstIndex * 0.3))
  play()
  fireEvent.click(screen.getByTestId('lab-page-next'))
  const pageWord = firstWord().textContent
  const index = Number(firstWord().dataset.wordIndex)
  expect(index).toBeGreaterThan(firstIndex)
  let started!: () => void
  audio.play = () => { audio.paused = false; return new Promise<void>(resolve => { started = resolve }) }
  play()
  await waitFor(() => expect(audio.currentTime).toBe(index * 0.3))
  // The previous follow position must not move the page while play() is pending.
  expect(firstWord().textContent).toBe(pageWord)
  await act(async () => { started() })
  expect(firstWord().textContent).toBe(pageWord)
})
