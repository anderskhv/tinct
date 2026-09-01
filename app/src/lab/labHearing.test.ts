import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { followParagraphFromManifest } from './labFollow'
import {
  absorbOrphanLeftoverPages,
  applyPaintAbsorb,
  applyPaintShrink,
  absorbOneWordLeftoverPages,
  adjacentPageIndex,
  chapterHearingPages,
  chapterPageSegments,
  chapterPagesCover,
  chapterPageLabel,
  clampedChapterProgress,
  cutPageTailTo,
  followOnReadingPage,
  absorbChapterTailPages,
  growPaintedPageIfSlack,
  reflowAfterCut,
  isOneWordLeftoverPage,
  ensurePageIdentity,
  isOrphanLeftoverPage,
  LAB_ORPHAN_PAGE_WORDS,
  labChapterProgress,
  labNavPageList,
  labVerseMarkerDisplay,
  hearingFollowPaintActive,
  hearingPages,
  hearingProgress,
  hearingStageLines,
  isChapterFirstHearingPage,
  isChapterFirstReadingPage,
  pageAnchorOf,
  pageIndexForPlace,
  pageIndexForWord,
  paginateLineBoxes,
  polishPageEnd,
  readingPageLines,
  restorePageIndexForAnchor,
  snapPageEndToPriorSentence,
  snapShrinkEndToSentence,
  wrapWordsToLineBoxes,
  nextHearingSpeed,
  parseHearingSpeed,
  seekAcrossClips,
  clipPlayDuration,
  playbackTimeSeconds,
  labProgressLabel,
} from './labHearing'
import { lastContentClearsChrome } from './labChrome'

describe('lab hearing stage', () => {
  it('marks spoken, current, and upcoming words from real timings', () => {
    const paragraph = followParagraphFromManifest(0, 'Tell me, O Muse of that ingenious hero who travelled', {
      duration: 4,
      words: [
        { text: 'Tell', start: 0, end: 0.4 },
        { text: 'me,', start: 0.4, end: 0.7 },
        { text: 'O', start: 0.7, end: 0.9 },
        { text: 'Muse', start: 0.9, end: 1.3 },
        { text: 'of', start: 1.3, end: 1.5 },
        { text: 'that', start: 1.5, end: 1.8 },
        { text: 'ingenious', start: 1.8, end: 2.3 },
        { text: 'hero', start: 2.3, end: 2.6 },
        { text: 'who', start: 2.6, end: 2.8 },
        { text: 'travelled', start: 2.8, end: 3.4 },
      ],
    })

    const lines = hearingStageLines(paragraph, { kind: 'word', paragraphIndex: 0, wordIndex: 2 })
    expect(lines).toHaveLength(1)
    const roles = lines.flatMap(line => line.words.map(word => word.role))
    expect(roles).toEqual([
      'spoken', 'spoken', 'current', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming',
    ])
  })

  it('marks the current paragraph when words are missing', () => {
    const paragraph = followParagraphFromManifest(0, 'Tell me, O Muse, of that ingenious hero. Many cities did he visit.', {
      duration: 8,
    })
    const lines = hearingStageLines(paragraph, { kind: 'paragraph', paragraphIndex: 0 })
    expect(lines).toHaveLength(1)
    expect(lines.every(line => line.words.every(word => word.role === 'line'))).toBe(true)
    expect(lines[0].words[0].text).toContain('Tell me, O Muse')
  })

  it('keeps the same page words while the follow index stays inside the page', () => {
    const words = Array.from({ length: 200 }, (_, index) => ({
      text: (index + 1) % 20 === 0 ? `w${index}.` : `w${index}`,
      start: index * 0.3,
      end: index * 0.3 + 0.25,
    }))
    const paragraph = followParagraphFromManifest(0, words.map(word => word.text).join(' '), {
      duration: 60,
      words,
    })
    const midA = hearingStageLines(paragraph, { kind: 'word', paragraphIndex: 0, wordIndex: 30 })
    const midB = hearingStageLines(paragraph, { kind: 'word', paragraphIndex: 0, wordIndex: 50 })
    expect(midA[0].words.map(word => word.text)).toEqual(midB[0].words.map(word => word.text))
    expect(midA[0].words.length).toBeGreaterThanOrEqual(70)
    expect(midA[0].words.length).toBeLessThanOrEqual(90)
    expect(midA[0].words.some(word => word.text === 'w30' && word.role === 'current')).toBe(true)
    expect(midB[0].words.some(word => word.text === 'w50' && word.role === 'current')).toBe(true)
  })

  it('turns the page only after the current word is past the last word on the page', () => {
    const words = Array.from({ length: 200 }, (_, index) => ({
      text: (index + 1) % 20 === 0 ? `w${index}.` : `w${index}`,
      start: index * 0.3,
      end: index * 0.3 + 0.25,
    }))
    const paragraph = followParagraphFromManifest(0, words.map(word => word.text).join(' '), {
      duration: 60,
      words,
    })
    const first = hearingStageLines(paragraph, { kind: 'word', paragraphIndex: 0, wordIndex: 10 })
    const lastOnPage = first[0].words.length - 1
    const stillFirst = hearingStageLines(paragraph, { kind: 'word', paragraphIndex: 0, wordIndex: lastOnPage })
    const nextPage = hearingStageLines(paragraph, { kind: 'word', paragraphIndex: 0, wordIndex: lastOnPage + 1 })
    expect(stillFirst[0].words.map(word => word.text)).toEqual(first[0].words.map(word => word.text))
    expect(nextPage[0].words.map(word => word.text)).not.toEqual(first[0].words.map(word => word.text))
    expect(nextPage[0].words[0].text).toBe(first[0].words.at(-1) ? `w${lastOnPage + 1}` : nextPage[0].words[0].text)
    expect(nextPage[0].words[0].text).toBe(`w${lastOnPage + 1}`)
  })

  it('opens from the previous sentence through the next, as one flow', () => {
    const texts = [
      ...'Alpha one two three four.'.split(' '),
      ...'Beta five six seven eight nine ten.'.split(' '),
      ...'Gamma eleven twelve thirteen fourteen.'.split(' '),
    ]
    const words = texts.map((text, index) => ({
      text,
      start: index * 0.2,
      end: index * 0.2 + 0.15,
    }))
    const paragraph = followParagraphFromManifest(0, texts.join(' '), {
      duration: 8,
      words,
    })
    const current = texts.indexOf('seven')
    const lines = hearingStageLines(paragraph, { kind: 'word', paragraphIndex: 0, wordIndex: current })
    expect(lines).toHaveLength(1)
    const shown = lines[0].words.map(word => word.text)
    expect(shown[0]).toBe('Alpha')
    expect(shown.at(-1)).toBe('fourteen.')
    expect(shown.join(' ')).toContain('seven')
    expect(lines[0].words[shown.indexOf('seven')].role).toBe('current')
  })

  it('does not invent word roles from a word count', () => {
    const paragraph = followParagraphFromManifest(0, 'Tell me O Muse of that ingenious hero', { duration: 8 })
    const lines = hearingStageLines(paragraph, { kind: 'paragraph', paragraphIndex: 0 })
    expect(lines.flatMap(line => line.words).some(word => word.role === 'current')).toBe(false)
  })
})


describe('lab reading chapter pages', () => {
  it('uses the same stable pages Hearing uses and only headlines page one', () => {
    const words = Array.from({ length: 200 }, (_, index) => (
      (index + 1) % 20 === 0 ? `w${index}.` : `w${index}`
    ))
    const later = 'Later paragraph with enough words to stand alone as a page after the first.'
    const pages = chapterHearingPages([words.join(' '), later])
    expect(pages.length).toBeGreaterThan(1)
    expect(pages[0].paragraphIndex).toBe(0)
    expect(pages[0].from).toBe(0)
    expect(isChapterFirstReadingPage(pages[0])).toBe(true)
    expect(isChapterFirstReadingPage(pages[1])).toBe(false)
    const first = readingPageLines([words.join(' '), later], pages[0])
    const second = readingPageLines([words.join(' '), later], pages[1])
    expect(first[0].words.map(word => word.text)).not.toEqual(second[0].words.map(word => word.text))
    expect(first[0].words[0].text).toBe('w0')
  })
})

describe('lab hearing chapter headline page', () => {
  it('is true only on the first page of the first paragraph', () => {
    const words = Array.from({ length: 200 }, (_, index) => ({
      text: (index + 1) % 20 === 0 ? `w${index}.` : `w${index}`,
      start: index * 0.3,
      end: index * 0.3 + 0.25,
    }))
    const first = followParagraphFromManifest(0, words.map(word => word.text).join(' '), {
      duration: 60,
      words,
    })
    const later = followParagraphFromManifest(1, 'Later paragraph.', { duration: 8 })
    const pages = hearingPages(words)
    expect(pages.length).toBeGreaterThan(1)
    expect(isChapterFirstHearingPage(first, { kind: 'word', paragraphIndex: 0, wordIndex: 0 })).toBe(true)
    expect(isChapterFirstHearingPage(first, { kind: 'word', paragraphIndex: 0, wordIndex: 10 })).toBe(true)
    expect(isChapterFirstHearingPage(first, { kind: 'word', paragraphIndex: 0, wordIndex: pages[1].from })).toBe(false)
    expect(isChapterFirstHearingPage(later, { kind: 'paragraph', paragraphIndex: 1 })).toBe(false)
    expect(isChapterFirstHearingPage(first, { kind: 'paragraph', paragraphIndex: 0 })).toBe(true)
  })
})

describe('lab hearing transport math', () => {
  const clips = [
    { duration: 10 },
    { duration: 8 },
    { duration: 6 },
  ]

  it('builds a thin chapter progress from manifest durations', () => {
    expect(hearingProgress(clips, 1, 2)).toEqual({ current: 12, total: 24 })
    expect(hearingProgress([{ duration: undefined }, { duration: 4 }], 0, 1)).toBeNull()
  })

  it('seeks back and forward across paragraph clips', () => {
    expect(seekAcrossClips({
      clips,
      clipIndex: 1,
      currentTime: 2,
      deltaSeconds: -15,
    })).toEqual({ clipIndex: 0, offsetSeconds: 0 })

    expect(seekAcrossClips({
      clips,
      clipIndex: 0,
      currentTime: 8,
      deltaSeconds: 15,
    })).toEqual({ clipIndex: 2, offsetSeconds: 5 })
  })

  it('mid-book −15 does not go to clip 0 / word 0 unless you are in the first 15s', () => {
    const book = [
      { duration: 40, words: [{ text: 'Tell', start: 0, end: 0.4 }, { text: 'later', start: 38, end: 40 }] },
      { duration: 30 },
      { duration: 30 },
    ]
    expect(seekAcrossClips({
      clips: book,
      clipIndex: 2,
      currentTime: 10,
      deltaSeconds: -15,
    })).toEqual({ clipIndex: 1, offsetSeconds: 25 })
    expect(seekAcrossClips({
      clips: book,
      clipIndex: 1,
      currentTime: 20,
      deltaSeconds: -15,
    })).toEqual({ clipIndex: 1, offsetSeconds: 5 })
    expect(seekAcrossClips({
      clips: book,
      clipIndex: 0,
      currentTime: 8,
      deltaSeconds: -15,
    })).toEqual({ clipIndex: 0, offsetSeconds: 0 })
    expect(clipPlayDuration({ words: [{ text: 'a', start: 0, end: 12 }] })).toBe(12)
    expect(playbackTimeSeconds(0, 45)).toBe(45)
    expect(playbackTimeSeconds(12, 45)).toBe(12)
    expect(playbackTimeSeconds(0, 0)).toBe(0)
    expect(seekAcrossClips({
      clips: [{}, {}, { duration: 20 }],
      clipIndex: 2,
      currentTime: 5,
      deltaSeconds: -15,
    })).toEqual({ clipIndex: 2, offsetSeconds: 0 })
  })

  it('cycles hearing speed without touching production audio-speed storage', () => {
    expect(nextHearingSpeed(1)).toBe(1.25)
    expect(nextHearingSpeed(2)).toBe(0.75)
  })

  it('accepts only the lab playback rates', () => {
    expect(parseHearingSpeed(2)).toBe(2)
    expect(parseHearingSpeed('1.25')).toBe(1.25)
    expect(parseHearingSpeed(0.75)).toBe(0.75)
    expect(parseHearingSpeed(3)).toBeNull()
    expect(parseHearingSpeed('fast')).toBeNull()
  })
})

describe('lab height-fit pages vs chrome', () => {
  const measureText = (text: string) => text.length * 8

  it('keeps last text node bottom strictly above chrome top on reading pages 1 and 2', () => {
    const words = Array.from({ length: 120 }, (_, index) => ({ text: `word${index}` }))
    const lines = wrapWordsToLineBoxes(words, 360, measureText)
    const lineHeight = 40
    const chromeTop = 200
    const headline = 72
    const pages = paginateLineBoxes(lines, lineHeight, chromeTop, headline)
    expect(pages.length).toBeGreaterThan(1)
    pages.forEach((page, index) => {
      const count = lines.filter(line => line.from >= page.from && line.to <= page.to).length
      const extra = index === 0 ? headline : 0
      const lastBottom = extra + count * lineHeight
      expect(lastContentClearsChrome(lastBottom, chromeTop)).toBe(true)
    })
  })

  it('keeps the same word when chrome height changes between paused and playing', () => {
    const words = Array.from({ length: 120 }, (_, index) => ({ text: `word${index}` }))
    const lines = wrapWordsToLineBoxes(words, 360, measureText)
    const paused = paginateLineBoxes(lines, 40, 200)
    const playing = paginateLineBoxes(lines, 40, 248)
    expect(paused.length).toBeGreaterThan(1)
    expect(playing.length).toBeGreaterThan(1)
    const word = paused[1].from + 1
    const pausedPage = paused[pageIndexForWord(paused, word)]
    const playingPage = playing[pageIndexForWord(playing, word)]
    expect(pausedPage.from).toBeLessThanOrEqual(word)
    expect(pausedPage.to).toBeGreaterThan(word)
    expect(playingPage.from).toBeLessThanOrEqual(word)
    expect(playingPage.to).toBeGreaterThan(word)
    const chapter = [
      { paragraphIndex: 0, ...paused[0] },
      { paragraphIndex: 0, ...paused[1] },
    ]
    expect(pageIndexForPlace(chapter, 0, word)).toBe(1)
  })

  it('moves leftover words of a too-tall first pack onto page 2', () => {
    const pages = [
      { paragraphIndex: 0, from: 0, to: 80 },
      { paragraphIndex: 0, from: 80, to: 160 },
    ]
    const shrunk = applyPaintShrink(pages, 0, 48)
    expect(shrunk[0]).toEqual({ paragraphIndex: 0, from: 0, to: 48 })
    expect(shrunk[1]).toEqual({ paragraphIndex: 0, from: 48, to: 160 })
    const only = applyPaintShrink([{ paragraphIndex: 0, from: 0, to: 80 }], 0, 30)
    expect(only).toEqual([
      { paragraphIndex: 0, from: 0, to: 30 },
      { paragraphIndex: 0, from: 30, to: 80 },
    ])
  })

  it('does not peel a single leftover word onto its own page', () => {
    const pages = [{ paragraphIndex: 0, from: 0, to: 80 }]
    expect(applyPaintShrink(pages, 0, 79)).toEqual(pages)
    const split = [
      { paragraphIndex: 0, from: 0, to: 79 },
      { paragraphIndex: 0, from: 79, to: 80 },
    ]
    expect(isOneWordLeftoverPage(split[1])).toBe(true)
    expect(absorbOneWordLeftoverPages(split)).toEqual([{ paragraphIndex: 0, from: 0, to: 80 }])
  })

  it('peels a one-word last line when the painted page still overflows', () => {
    const pages = [{ paragraphIndex: 0, from: 0, to: 80 }]
    const peeled = applyPaintShrink(pages, 0, 79, { overflowing: true })
    expect(peeled).toEqual([
      { paragraphIndex: 0, from: 0, to: 79 },
      { paragraphIndex: 0, from: 79, to: 80 },
    ])
    expect(isOneWordLeftoverPage(peeled[1])).toBe(true)
  })

  it('mints a page when a later pack overflows instead of freezing M', () => {
    const pages = [
      { paragraphIndex: 0, from: 0, to: 40 },
      { paragraphIndex: 0, from: 40, to: 80 },
      { paragraphIndex: 1, from: 0, to: 80 },
    ]
    const minted = applyPaintShrink(pages, 2, 40)
    expect(minted).toHaveLength(4)
    const overflowMint = applyPaintShrink(pages, 2, 40, { overflowing: true })
    expect(overflowMint).toHaveLength(4)
    expect(overflowMint[2].to).toBe(40)
    expect(overflowMint[3].from).toBe(40)
  })

  it('reflows the rest of the chapter after a peel so M is the complete set', () => {
    const words = (n: number, prefix: string) => Array.from({ length: n }, (_, i) => `${prefix}${i}.`).join(' ')
    const paragraphs = [words(80, 'a'), words(80, 'b'), words(80, 'c')]
    const budget = {
      height: 200,
      width: 360,
      lineHeight: 40,
      measureText: (text: string) => Math.max(1, text.length * 10),
    }
    const pages = chapterHearingPages(paragraphs, budget)
    expect(pages.length).toBeGreaterThan(2)
    const first = pages[0]
    const cut = Math.max(first.from + 1, first.to - 8)
    const next = reflowAfterCut(paragraphs, pages, 0, cut, budget, { overflowing: true })
    expect(next[0].to).toBe(cut)
    expect(chapterPagesCover(paragraphs, next)).toBe(true)
    const progress = clampedChapterProgress(labChapterProgress({
      paragraphs,
      pages: next,
      pageIndex: next.length + 4,
    }))
    expect(progress.currentPage).toBe(progress.totalPages)
    expect(progress.currentPage).toBeLessThanOrEqual(progress.totalPages)
    let m = next.length
    for (let i = 0; i < next.length; i++) {
      expect(i + 1).toBeLessThanOrEqual(m)
      expect(adjacentPageIndex(next.length, i, 1)).toBe(i < next.length - 1 ? i + 1 : null)
    }
    expect(next.length).toBe(m)
  })

  it('paginates Genesis 1 as a stable fitting set on a phone-sized budget', () => {
    const genesis = JSON.parse(readFileSync(resolve(__dirname, '../../public/data/editions-chapters/bible-kjv-en/ch0001.json'), 'utf8')).paragraphs as string[]
    const budget = {
      height: 520,
      width: 360,
      lineHeight: 40,
      headlineHeight: 64,
      measureText: (text: string) => Math.max(1, text.length * 10),
    }
    const pages = chapterHearingPages(genesis, budget)
    expect(pages.length).toBeGreaterThan(1)
    expect(chapterPagesCover(genesis, pages)).toBe(true)
    const m = pages.length
    for (let i = 0; i < pages.length; i++) {
      const progress = labChapterProgress({ paragraphs: genesis, pages, pageIndex: i })
      expect(progress.currentPage).toBe(i + 1)
      expect(progress.totalPages).toBe(m)
      expect(progress.currentPage).toBeLessThanOrEqual(progress.totalPages)
      expect(pages[i].to).toBeGreaterThan(pages[i].from)
    }
    const verse16 = genesis.findIndex(text => text.includes('two great lights'))
    expect(verse16).toBeGreaterThanOrEqual(0)
    const verse16Page = pageIndexForPlace(pages, verse16, 0)
    expect(verse16Page).toBeGreaterThanOrEqual(0)
    expect(verse16Page).toBeLessThan(m)
    const label = labProgressLabel(labChapterProgress({ paragraphs: genesis, pages, pageIndex: verse16Page }), 1, 'Genesis 1')
    expect(label).toMatch(/^Genesis 1 — \d+ \/ \d+$/)
    const [n, total] = label.split('—')[1].split('/').map(part => Number(part.trim()))
    expect(n).toBeLessThanOrEqual(total)
    expect(label).not.toContain('9 / 8')
  })

  it('keeps one M for every page after a later-page reflow', () => {
    const genesis = JSON.parse(readFileSync(resolve(__dirname, '../../public/data/editions-chapters/bible-kjv-en/ch0001.json'), 'utf8')).paragraphs as string[]
    const budget = {
      height: 520,
      width: 360,
      lineHeight: 40,
      headlineHeight: 64,
      measureText: (text: string) => Math.max(1, text.length * 10),
    }
    const pages = chapterHearingPages(genesis, budget)
    expect(pages.length).toBeGreaterThan(3)
    const cutAt = Math.max(pages[2].from + 1, pages[2].to - 6)
    const next = reflowAfterCut(genesis, pages, 2, cutAt, budget, { overflowing: true })
    expect(chapterPagesCover(genesis, next)).toBe(true)
    const m = next.length
    expect(m).toBeGreaterThan(1)
    for (let i = 0; i < next.length; i++) {
      const progress = clampedChapterProgress(labChapterProgress({ paragraphs: genesis, pages: next, pageIndex: i }))
      expect(progress.totalPages).toBe(m)
      expect(progress.currentPage).toBe(i + 1)
      expect(progress.currentPage).toBeLessThanOrEqual(progress.totalPages)
      const label = chapterPageLabel(next, i)
      expect(label.totalPages).toBe(m)
      expect(label.currentPage).toBeLessThanOrEqual(label.totalPages)
    }
    expect(chapterPageLabel(next, next.length + 4).currentPage).toBe(m)
    expect(adjacentPageIndex(m, 0, 1)).toBe(1)
    expect(adjacentPageIndex(m, m - 1, 1)).toBeNull()
    expect(adjacentPageIndex(m, 0, -1)).toBeNull()
  })

  it('absorbs an orphan leftover line into the previous page', () => {
    const leftover = { paragraphIndex: 0, from: 72, to: 80 }
    expect(isOrphanLeftoverPage(leftover)).toBe(true)
    const pages = [
      { paragraphIndex: 0, from: 0, to: 72 },
      leftover,
    ]
    expect(applyPaintAbsorb(pages, 1)).toEqual([{ paragraphIndex: 0, from: 0, to: 80 }])
    expect(absorbOrphanLeftoverPages(pages)).toEqual([{ paragraphIndex: 0, from: 0, to: 80 }])
  })

  it('does not collapse page 1 to a lone verse mark when absorbing', () => {
    const pages = [
      { paragraphIndex: 0, from: 0, to: 1 },
      { paragraphIndex: 0, from: 1, to: 80 },
    ]
    expect(isOrphanLeftoverPage(pages[1])).toBe(false)
    expect(absorbOrphanLeftoverPages(pages)).toEqual(pages)
  })

  it('page turns are exactly ±1 and keep a stable identity if absorb rebuilds pages', () => {
    const pages = [
      { paragraphIndex: 0, from: 0, to: 20 },
      { paragraphIndex: 0, from: 20, to: 40 },
      { paragraphIndex: 0, from: 40, to: 60 },
      { paragraphIndex: 0, from: 60, to: 72 },
      { paragraphIndex: 0, from: 72, to: 200 },
    ]
    expect(adjacentPageIndex(pages.length, 4, -1)).toBe(3)
    expect(adjacentPageIndex(pages.length, 3, 1)).toBe(4)
    expect(adjacentPageIndex(pages.length, 0, -1)).toBeNull()
    const onFive = pages[4]
    const dest = adjacentPageIndex(pages.length, 4, -1)
    expect(dest).toBe(3)
    const anchor = pageAnchorOf(pages[dest!])
    expect(anchor).toEqual({ paragraphIndex: 0, wordIndex: 60 })
    const absorbed = absorbOrphanLeftoverPages(pages)
    expect(absorbed).toEqual([
      { paragraphIndex: 0, from: 0, to: 20 },
      { paragraphIndex: 0, from: 20, to: 40 },
      { paragraphIndex: 0, from: 40, to: 72 },
      { paragraphIndex: 0, from: 72, to: 200 },
    ])
    const kept = absorbOrphanLeftoverPages(pages, anchor)
    expect(kept[3]).toEqual({ paragraphIndex: 0, from: 60, to: 72 })
    const restored = ensurePageIdentity(absorbed, anchor!)
    expect(restorePageIndexForAnchor(restored, anchor!)).toBe(3)
    expect(restored[3]).toEqual({ paragraphIndex: 0, from: 60, to: 72 })
    expect(onFive.from).toBe(72)
  })

  it('labNavPageList prefers the longer unsettled list so next can reach peeled tail pages', () => {
    const reading = [
      { paragraphIndex: 0, from: 0, to: 20 },
      { paragraphIndex: 0, from: 20, to: 40 },
      { paragraphIndex: 0, from: 40, to: 60 },
      { paragraphIndex: 0, from: 60, to: 72 },
      { paragraphIndex: 0, from: 72, to: 90 },
      { paragraphIndex: 0, from: 90, to: 100 },
    ]
    const working = [
      ...reading,
      { paragraphIndex: 0, from: 100, to: 110 },
    ]
    const nav = labNavPageList(false, working, reading)
    expect(nav.length).toBe(7)
    const penult = nav.length - 2
    expect(adjacentPageIndex(nav.length, penult, 1)).toBe(penult + 1)
    expect(labNavPageList(true, working, reading)).toBe(reading)
  })

  it('maps unicode superscript verse markers to plain digits', () => {
    expect(labVerseMarkerDisplay('¹⁰')).toBe('10')
    expect(labVerseMarkerDisplay('³⁰')).toBe('30')
    expect(labVerseMarkerDisplay('¹')).toBe('1')
  })

  it('absorbs peeled tail fragments for a short psalm chapter', () => {
    const paragraphs = [
      '⁶ Arise, O LORD, in thine anger, lift up thyself because of the rage of mine enemies: and awake for me to the judgment that thou hast commanded. ⁷ So shall the congregation of the people compass thee about: for their sakes therefore return thou on high. ⁸ The LORD shall judge the people: judge me, O LORD, according to my righteousness, and according to mine integrity that is in me. ⁹ Oh let the wickedness of the wicked come to an end; but establish the just: for the righteous God trieth the hearts and reins. ¹⁰ My defence is of God, which saveth the upright in heart.',
      '¹¹ God judgeth the righteous, and God is angry with the wicked every day. ¹² If he turn not, he will whet his sword; he hath bent his bow, and made it ready. ¹³ He hath also prepared for him the instruments of death; he ordaineth his arrows against the persecutors. ¹⁴ Behold, he travaileth with iniquity, and hath conceived mischief, and brought forth falsehood. ¹⁵ He made a pit, and digged it, and is fallen into the ditch which he made.',
    ]
    const budget = {
      height: 520,
      width: 340,
      lineHeight: 38,
      headlineHeight: 54,
      measureText: (text: string) => text.length * 9,
    }
    const pages = chapterHearingPages(paragraphs, budget)
    const last = pages[pages.length - 1]
    const splitAt = last.to - 4
    const orphanTail = [
      ...pages.slice(0, -1),
      { paragraphIndex: last.paragraphIndex, from: last.from, to: splitAt },
      { paragraphIndex: last.paragraphIndex, from: splitAt, to: last.to },
    ]
    expect(chapterPagesCover(paragraphs, orphanTail)).toBe(true)
    expect(isOrphanLeftoverPage(orphanTail[orphanTail.length - 1])).toBe(true)
    const settled = absorbOrphanLeftoverPages(orphanTail)
    expect(settled.length).toBeLessThan(orphanTail.length)
    expect(chapterPagesCover(paragraphs, settled)).toBe(true)
    settled.forEach(page => {
      expect(page.to - page.from).toBeGreaterThan(LAB_ORPHAN_PAGE_WORDS)
    })
  })
})

describe('lab chapter progress', () => {
  it('measures percent of this chapter from pages and words', () => {
    const paragraphs = ['one two three four', 'five six']
    const pages = [
      { paragraphIndex: 0, from: 0, to: 4 },
      { paragraphIndex: 1, from: 0, to: 2 },
    ]
    const first = labChapterProgress({ paragraphs, pages, pageIndex: 0 })
    expect(first.wordsTotal).toBe(6)
    expect(first.wordsRead).toBe(4)
    expect(first.percent).toBe(67)
    expect(first.currentPage).toBe(1)
    expect(first.totalPages).toBe(2)
    const mid = labChapterProgress({
      paragraphs,
      pages,
      pageIndex: 0,
      paragraphIndex: 0,
      wordIndex: 2,
    })
    expect(mid.wordsRead).toBe(2)
    expect(mid.percent).toBe(33)
    const source = readFileSync(resolve(__dirname, 'labHearing.ts'), 'utf8')
    expect(source).toMatch(/PAGE of CHAPTER stays the live default/)
    expect(labProgressLabel(mid, 643)).toBe('Chapter 643 — 1 / 2')
    expect(labProgressLabel(mid, 644, 'Proverbs 16')).toBe('Proverbs 16 — 1 / 2')
    expect(labProgressLabel(mid, 644, 'Proverbs 16')).not.toContain('644')
  })
})

describe('lab bible page leftovers', () => {
  it('paginates Proverbs 16 and Genesis without a one-word leftover page', () => {
    const proverbs = [
      'The preparations of the heart in man, and the answer of the tongue, is from the LORD. All the ways of a man are clean in his own eyes; but the LORD weigheth the spirits. Commit thy works unto the LORD, and thy thoughts shall be established. The LORD hath made all things for himself: yea, even the wicked for the day of evil. Every one that is proud in heart is an abomination to the LORD: though hand join in hand, he shall not be unpunished.',
    ]
    const genesis = [
      'In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep.',
      'And God said, Let there be light: and there was light. And God saw the light, that it was good: and God divided the light from the darkness.',
    ]
    const budget = {
      height: 200,
      width: 360,
      lineHeight: 40,
      measureText: (text: string) => Math.max(1, text.length * 10),
    }
    const proverbsPages = chapterHearingPages(proverbs, budget)
    const genesisPages = chapterHearingPages(genesis, budget)
    expect(proverbsPages.length).toBeGreaterThan(0)
    expect(genesisPages.length).toBeGreaterThan(0)
    for (const page of [...proverbsPages, ...genesisPages]) {
      expect(page.to - page.from).toBeGreaterThan(1)
    }
    expect(proverbsPages.some(page => page.to - page.from === 1)).toBe(false)
    expect(adjacentPageIndex(proverbsPages.length, 0, 1)).toBe(proverbsPages.length > 1 ? 1 : null)
    if (proverbsPages.length > 1) {
      expect(adjacentPageIndex(proverbsPages.length, 1, -1)).toBe(0)
    }
    expect(adjacentPageIndex(genesisPages.length, 0, -1)).toBeNull()
  })
})

describe('page fill after peel', () => {
  it('keeps a full line instead of rolling far back to a sentence end', () => {
    const words = [
      { text: 'First.' },
      { text: 'Second' },
      { text: 'sentence' },
      { text: 'ends.' },
      { text: 'Tail' },
      { text: 'words.' },
    ]
    expect(snapShrinkEndToSentence(words, 0, 6, 4)).toBe(4)
    expect(snapShrinkEndToSentence(words, 0, 6, 3)).toBe(3)
    const genesis = JSON.parse(readFileSync(resolve(__dirname, '../../public/data/editions-chapters/bible-kjv-en/ch0001.json'), 'utf8')).paragraphs as string[]
    const genesisWords = genesis[0].split(/\s+/).filter(Boolean).map(text => ({ text }))
    expect(snapShrinkEndToSentence(genesisWords, 0, 58, 57)).toBe(57)
  })

  it('only moves short dangling connectors or fragments to the next page', () => {
    const genesis = JSON.parse(readFileSync(resolve(__dirname, '../../public/data/editions-chapters/bible-kjv-en/ch0001.json'), 'utf8')).paragraphs as string[]
    const words = genesis[0].split(/\s+/).filter(Boolean).map(text => ({ text }))
    const end = snapPageEndToPriorSentence(words, 0, 58)
    expect(end).toBe(57)
    expect(polishPageEnd([
      { text: 'The' }, { text: 'earth.' }, { text: 'And' }, { text: 'God' },
    ], 0, 4, 4)).toBe(2)
    expect(polishPageEnd([
      { text: 'the' }, { text: 'water' }, { text: 'and' },
    ], 0, 3, 4)).toBe(2)
    expect(polishPageEnd([
      { text: 'It' }, { text: 'was.' }, { text: 'that' }, { text: 'may' },
    ], 0, 4, 6)).toBe(2)
    expect(polishPageEnd([
      { text: 'It' }, { text: 'was.' }, { text: 'which' }, { text: 'is' },
    ], 0, 4, 6)).toBe(2)
    expect(polishPageEnd([
      { text: 'his' }, { text: 'kind:' }, { text: 'and' }, { text: 'God' },
    ], 0, 4, 6)).toBe(2)
    expect(polishPageEnd([{ text: '⁶' }], 0, 1, 6)).toBe(0)
    expect(polishPageEnd([
      { text: 'the' }, { text: 'second' }, { text: 'day.' },
      { text: '⁹' }, { text: 'And' }, { text: 'God' }, { text: 'said,' }, { text: 'Let' },
    ], 0, 8, 6)).toBe(3)
    expect(polishPageEnd([
      { text: 'was' }, { text: 'good.' }, { text: '¹²' }, { text: 'And' },
      { text: 'the' }, { text: 'earth' }, { text: 'brought' }, { text: 'forth' },
      { text: 'grass,' }, { text: 'and' }, { text: 'herb' },
    ], 0, 11, 6)).toBe(9)
  })

  it('grows a fitted page when remeasure shows slack below the ink', () => {
    const pages = [
      { paragraphIndex: 0, from: 0, to: 40 },
      { paragraphIndex: 0, from: 40, to: 80 },
    ]
    const painted = {
      lastBottom: 500,
      chromeTop: 600,
      lineHeight: 40,
      lastLineWords: 8,
      scrollOverflow: false,
    }
    const grown = growPaintedPageIfSlack(pages, 0, painted, 'peel')
    expect(grown[0].to).toBeGreaterThan(pages[0].to)
    expect(grown[1].from).toBe(grown[0].to)
  })

  it('fills visual slack across a paragraph boundary without consuming words', () => {
    const pages = [
      { paragraphIndex: 0, from: 0, to: 12 },
      { paragraphIndex: 1, from: 0, to: 12 },
    ]
    const painted = {
      lastBottom: 480,
      chromeTop: 600,
      lineHeight: 40,
      lastLineWords: 4,
      scrollOverflow: false,
    }
    const paragraphs = ['a '.repeat(12), 'b '.repeat(12)]
    const grown = growPaintedPageIfSlack(pages, 0, painted, null, paragraphs)
    expect(grown[0].segments).toEqual([
      { paragraphIndex: 0, from: 0, to: 12 },
      { paragraphIndex: 1, from: 0, to: 4 },
    ])
    expect(grown[1]).toMatchObject({ paragraphIndex: 1, from: 4, to: 12 })
    expect(chapterPagesCover(paragraphs, grown)).toBe(true)
    expect(pageIndexForPlace(grown, 1, 2)).toBe(0)
    expect(followOnReadingPage({ kind: 'word', paragraphIndex: 1, wordIndex: 2 }, grown, 0)).toBe(true)
    expect(readingPageLines(paragraphs, grown[0]).map(line => [line.paragraphIndex, line.from, line.words.length]))
      .toEqual([[0, 0, 12], [1, 0, 4]])

    const cut = cutPageTailTo(grown, 0, 2)
    expect(cut[0].segments?.[1]).toEqual({ paragraphIndex: 1, from: 0, to: 2 })
    expect(cut[1]).toMatchObject({ paragraphIndex: 1, from: 2, to: 12 })
    expect(chapterPagesCover(paragraphs, cut)).toBe(true)

    const movedWholeTail = cutPageTailTo(grown, 0, 0)
    expect(chapterPageSegments(movedWholeTail[0])).toEqual([
      { paragraphIndex: 0, from: 0, to: 12 },
    ])
    expect(chapterPageSegments(movedWholeTail[1])[0]).toEqual({ paragraphIndex: 1, from: 0, to: 12 })
    expect(chapterPagesCover(paragraphs, movedWholeTail)).toBe(true)
  })

  it('grows the last page into the paragraph tail when there is no next page', () => {
    const paragraphs = ['one two three four five six seven eight nine ten']
    const pages = [{ paragraphIndex: 0, from: 0, to: 4 }]
    const painted = {
      lastBottom: 500,
      chromeTop: 600,
      lineHeight: 40,
      lastLineWords: 4,
      scrollOverflow: false,
    }
    const grown = growPaintedPageIfSlack(pages, 0, painted, null, paragraphs)
    expect(grown[0].to).toBeGreaterThan(4)
    expect(grown.length).toBe(1)
  })

  it('merges a short chapter tail into the previous page', () => {
    const pages = [
      { paragraphIndex: 0, from: 0, to: 80 },
      { paragraphIndex: 0, from: 80, to: 95 },
    ]
    const merged = absorbChapterTailPages(pages)
    expect(merged).toEqual([{ paragraphIndex: 0, from: 0, to: 95 }])
  })

})

describe('followOnReadingPage', () => {
  const pages = [
    { paragraphIndex: 0, from: 0, to: 40 },
    { paragraphIndex: 0, from: 40, to: 80 },
  ]

  it('matches word and paragraph follow against a page slice', () => {
    expect(followOnReadingPage({ kind: 'word', paragraphIndex: 0, wordIndex: 10 }, pages, 0)).toBe(true)
    expect(followOnReadingPage({ kind: 'word', paragraphIndex: 0, wordIndex: 50 }, pages, 0)).toBe(false)
    expect(followOnReadingPage({ kind: 'word', paragraphIndex: 0, wordIndex: 50 }, pages, 1)).toBe(true)
    expect(followOnReadingPage({ kind: 'paragraph', paragraphIndex: 0 }, pages, 0)).toBe(true)
    expect(followOnReadingPage({ kind: 'none' }, pages, 0)).toBe(true)
  })
})

describe('hearing follow paint', () => {
  const wordFollow = { kind: 'word' as const, paragraphIndex: 0, wordIndex: 2 }

  it('is only active while Hearing is playing a real follow target', () => {
    expect(hearingFollowPaintActive('hearing', true, wordFollow)).toBe(true)
    expect(hearingFollowPaintActive('hearing', true, { kind: 'paragraph', paragraphIndex: 0 })).toBe(true)
    expect(hearingFollowPaintActive('hearing', true, { kind: 'none' })).toBe(false)
    expect(hearingFollowPaintActive('hearing', false, wordFollow)).toBe(false)
    expect(hearingFollowPaintActive('reading', true, wordFollow)).toBe(false)
    expect(hearingFollowPaintActive('reading', false, wordFollow)).toBe(false)
  })
})
