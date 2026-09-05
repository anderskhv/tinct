import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FOLLOW_MATCH_RATIO,
  alignTimedWordsToText,
  followAtTime,
  followFromPlayback,
  followGranularity,
  followParagraphFromManifest,
  followThresholdFromSidecar,
  followWordRole,
  isSentenceTerminator,
  mergeSidecarWords,
  followTimeFromAudio,
  sentenceSpanAt,
  wordIndexAtTime,
  wordsFromManifestParagraph,
  paragraphHasWordTimings,
  type FollowParagraph,
  type TimedWord,
  type WordSidecar,
} from './labFollow'

describe('lab word follow', () => {
  it('keeps silent verse markers from putting the highlight one word behind', () => {
    const words = alignTimedWordsToText('¹ And the LORD called ² Speak unto Israel', [
      { text: 'And', start: 0.11, end: 0.49 },
      { text: 'the', start: 0.49, end: 0.59 },
      { text: 'Lord', start: 0.59, end: 0.79 },
      { text: 'called', start: 0.79, end: 1.11 },
      { text: 'Speak', start: 1.4, end: 1.7 },
      { text: 'unto', start: 1.7, end: 1.9 },
      { text: 'Israel', start: 1.9, end: 2.2 },
    ])!
    expect(words.map(word => word.text)).toEqual(['¹', 'And', 'the', 'LORD', 'called', '²', 'Speak', 'unto', 'Israel'])
    expect(wordIndexAtTime(words, 0.3)).toBe(1)
    expect(wordIndexAtTime(words, 1.5)).toBe(6)
  })

  it('maps Hebrews speech to visible semantic words across three verse boundaries', () => {
    const display = '¹ God spoke ² Hath spoken ³ Who shines ⁴ Being made'
    const sidecar = [
      { text: 'God', start: 0, end: 0.4 },
      { text: 'spoke', start: 0.4, end: 0.8 },
      { text: 'Hath', start: 1, end: 1.3 },
      { text: 'spoken', start: 1.3, end: 1.7 },
      { text: 'Who', start: 2, end: 2.3 },
      { text: 'shines', start: 2.3, end: 2.7 },
      { text: 'Being', start: 3, end: 3.4 },
      { text: 'made', start: 3.4, end: 3.8 },
    ]
    const words = alignTimedWordsToText(display, sidecar)!

    expect(words.map(word => word.text)).toEqual([
      '¹', 'God', 'spoke', '²', 'Hath', 'spoken', '³', 'Who', 'shines', '⁴', 'Being', 'made',
    ])
    expect(words[wordIndexAtTime(words, 1.1)].text).toBe('Hath')
    expect(words[wordIndexAtTime(words, 2.1)].text).toBe('Who')
    expect(words[wordIndexAtTime(words, 3.1)].text).toBe('Being')
  })

  it('rejects a semantically mismatched or malformed timing corpus', () => {
    expect(alignTimedWordsToText('Hear the word', [
      { text: 'Here', start: 0, end: 0.3 },
      { text: 'the', start: 0.3, end: 0.5 },
      { text: 'word', start: 0.5, end: 0.9 },
    ])).toBeUndefined()
    expect(wordsFromManifestParagraph({ words: [
      { text: 'Hear', start: 0.4, end: 0.7 },
      { text: 'word', start: 0.2, end: 0.9 },
    ] })).toBeUndefined()
  })

  it('rejects sidecars for another chapter or audio file', () => {
    const paragraph = followParagraphFromManifest(0, 'Hear the word', { file: 'p0.mp3', duration: 1 })
    const words = [{ text: 'Hear', start: 0, end: 0.3 }, { text: 'the', start: 0.3, end: 0.5 }, { text: 'word', start: 0.5, end: 0.9 }]
    expect(mergeSidecarWords([paragraph], { chapter: 2, paragraphs: [{ paragraph: 0, file: 'p0.mp3', words }] }, 1)[0].words).toBeUndefined()
    expect(mergeSidecarWords([paragraph], { chapter: 1, paragraphs: [{ paragraph: 0, file: 'p9.mp3', words }] }, 1)[0].words).toBeUndefined()
  })

  it('uses manifest words when they carry real start and end times', () => {
    const paragraph = followParagraphFromManifest(0, 'Tell me, O Muse', {
      duration: 2,
      words: [
        { text: 'Tell', start: 0, end: 0.4 },
        { text: 'me,', start: 0.4, end: 0.7 },
        { text: 'O', start: 0.7, end: 0.9 },
        { text: 'Muse', start: 0.9, end: 1.4 },
      ],
    })

    expect(paragraph.words).toHaveLength(4)
    expect(followAtTime([paragraph], 0.5)).toEqual({
      kind: 'word',
      paragraphIndex: 0,
      wordIndex: 1,
    })
  })

  it('does not invent word times when the manifest has duration only', () => {
    const paragraph = followParagraphFromManifest(0, 'Tell me, O Muse', { duration: 4, paragraph: 0 })
    expect(paragraph.words).toBeUndefined()
    expect(followAtTime([paragraph], 1.2)).toEqual({
      kind: 'paragraph',
      paragraphIndex: 0,
    })
  })

  it('does not treat a missing duration as a downloaded corpus', () => {
    const text = 'Tell me O Muse of that ingenious hero'
    expect(wordsFromManifestParagraph({ duration: 8 })).toBeUndefined()
    expect(wordsFromManifestParagraph({ words: [] })).toBeUndefined()
    expect(wordsFromManifestParagraph({
      words: [{ text: 'Tell', start: Number.NaN, end: 1 }],
    })).toBeUndefined()

    const followed = followParagraphFromManifest(0, text, { file: 'p0.mp3' })
    expect(followed.words).toBeUndefined()
    expect(followAtTime([followed], 2).kind).toBe('paragraph')
  })

  it('walks later paragraphs using their own timings', () => {
    const paragraphs = [
      followParagraphFromManifest(0, 'First', { duration: 2 }),
      followParagraphFromManifest(1, 'Second with words', {
        duration: 3,
        words: [
          { text: 'Second', start: 0, end: 1 },
          { text: 'with', start: 1, end: 2 },
          { text: 'words', start: 2, end: 3 },
        ],
      }),
    ]

    expect(followAtTime(paragraphs, 1)).toEqual({ kind: 'paragraph', paragraphIndex: 0 })
    expect(followAtTime(paragraphs, 3.2)).toEqual({
      kind: 'word',
      paragraphIndex: 1,
      wordIndex: 1,
    })
  })

  it('follows the playing paragraph from audio currentTime, not a chapter clock', () => {
    const paragraphs = [
      followParagraphFromManifest(0, 'First', { duration: 4, file: 'p0.mp3' }),
      followParagraphFromManifest(1, 'Second with words', {
        duration: 3,
        file: 'p1.mp3',
        words: [
          { text: 'Second', start: 0, end: 1 },
          { text: 'with', start: 1, end: 2 },
          { text: 'words', start: 2, end: 3 },
        ],
      }),
    ]

    expect(followFromPlayback({ paragraphs, paragraphIndex: 0, currentTime: 2 })).toEqual({
      kind: 'paragraph',
      paragraphIndex: 0,
    })
    expect(followFromPlayback({ paragraphs, paragraphIndex: 1, currentTime: 1.2 })).toEqual({
      kind: 'word',
      paragraphIndex: 1,
      wordIndex: 1,
    })
  })

  it('uses sidecar words only when the manifest paragraph has none', () => {
    const paragraphs = [
      followParagraphFromManifest(0, 'Tell me', {
        duration: 2,
        file: 'p0.mp3',
        words: [{ text: 'Tell', start: 0, end: 0.8 }, { text: 'me', start: 0.8, end: 2 }],
      }),
      followParagraphFromManifest(1, 'So now', { file: 'p1.mp3' }),
    ]
    const merged = mergeSidecarWords(paragraphs, {
      chapter: 1,
      paragraphs: [
        { paragraph: 0, words: [{ text: 'NO', start: 0, end: 2 }] },
        { paragraph: 1, words: [{ text: 'So', start: 0, end: 1 }, { text: 'now', start: 1, end: 2 }] },
      ],
    })
    expect(merged[0].words?.[0].text).toBe('Tell')
    expect(merged[1].words).toEqual([
      { text: 'So', start: 0, end: 1 },
      { text: 'now', start: 1, end: 2 },
    ])
  })

  it('replaces missing manifest words with sidecar start times', () => {
    const text = 'In the beginning God created'
    const derived = followParagraphFromManifest(0, text, { duration: 25, file: 'p0.mp3' })
    expect(derived.words).toBeUndefined()

    const merged = mergeSidecarWords([derived], {
      chapter: 1,
      paragraphs: [{
        paragraph: 0,
        file: 'p0.mp3',
        words: [
          { text: 'In', start: 0.05, end: 0.22 },
          { text: 'the', start: 0.22, end: 0.34 },
          { text: 'beginning', start: 0.34, end: 1.15 },
          { text: 'God', start: 1.15, end: 1.45 },
          { text: 'created', start: 1.45, end: 2.05 },
        ],
      }],
    })
    expect(merged[0].words?.[2]).toEqual({ text: 'beginning', start: 0.34, end: 1.15 })
    expect(followFromPlayback({ paragraphs: merged, paragraphIndex: 0, currentTime: 0.5 })).toEqual({
      kind: 'word',
      paragraphIndex: 0,
      wordIndex: 2,
    })
  })
})

describe('wordIndexAtTime', () => {
  it('holds the last word across a timing gap instead of jumping to the start', () => {
    const words = [
      { text: 'Tell', start: 0.05, end: 0.55 },
      { text: 'me,', start: 0.55, end: 0.77 },
      { text: 'O', start: 1.03, end: 1.03 },
      { text: 'Muse,', start: 1.03, end: 1.35 },
    ]
    expect(wordIndexAtTime(words, 0.9)).toBe(1)
    expect(wordIndexAtTime(words, 1.1)).toBe(3)
    expect(wordIndexAtTime(words, 0.1)).toBe(0)
  })
})

describe('followTimeFromAudio', () => {
  it('tracks the element clock without lead or lag fudge', () => {
    expect(followTimeFromAudio(0)).toBe(0)
    expect(followTimeFromAudio(1.25)).toBe(1.25)
    expect(followTimeFromAudio(-1)).toBe(0)
  })

  it('sits on the spoken word at manifest timings', () => {
    const words = [
      { text: 'In', start: 0, end: 0.4 },
      { text: 'the', start: 0.4, end: 0.7 },
      { text: 'beginning', start: 0.7, end: 1.3 },
      { text: 'God', start: 1.3, end: 1.7 },
    ]
    expect(wordIndexAtTime(words, followTimeFromAudio(0.45))).toBe(1)
    expect(wordIndexAtTime(words, followTimeFromAudio(0.75))).toBe(2)
  })

  it('selects solely from audio currentTime at every playback rate', () => {
    const words = [
      { text: 'God', start: 0, end: 0.5 },
      { text: 'spoke', start: 0.5, end: 1 },
      { text: 'again', start: 1, end: 1.5 },
    ]
    for (const playbackRate of [0.75, 1, 1.5, 2]) {
      expect(playbackRate).toBeGreaterThan(0)
      expect(wordIndexAtTime(words, followTimeFromAudio(0.75))).toBe(1)
    }
    expect(wordIndexAtTime(words, followTimeFromAudio(1.25))).toBe(2)
  })
})

describe('paragraphHasWordTimings', () => {
  it('is false until validated manifest or sidecar words exist', () => {
    expect(paragraphHasWordTimings({ index: 0, text: 'Hi', duration: 2 })).toBe(false)
    expect(paragraphHasWordTimings({
      index: 0,
      text: 'Hi',
      words: [{ text: 'Hi', start: 0, end: 0.2 }],
    })).toBe(true)
  })
})

/** Evenly timed words (0.5s each) for `text`, in sidecar form (no verse markers). */
function timed(text: string, step = 0.5): TimedWord[] {
  return text.split(/\s+/).filter(Boolean).filter(token => !/^[⁰¹²³⁴⁵⁶⁷⁸⁹]+$/.test(token))
    .map((word, index) => ({ text: word, start: index * step, end: (index + 1) * step }))
}

function sidecarFor(
  paragraphs: Array<{ text: string; matchRatio?: number }>,
  minimumParagraphRatio?: number,
): WordSidecar {
  return {
    chapter: 1,
    alignment: minimumParagraphRatio == null ? undefined : { minimumParagraphRatio },
    paragraphs: paragraphs.map(({ text, matchRatio }, paragraph) => ({
      paragraph,
      file: `p${paragraph}.mp3`,
      words: timed(text),
      alignment: matchRatio == null ? undefined : { expectedWords: 1, heardWords: 1, matchedWords: 1, matchRatio },
    })),
  }
}

function followedFor(
  paragraphs: Array<{ text: string; matchRatio?: number }>,
  minimumParagraphRatio?: number,
): FollowParagraph[] {
  const base = paragraphs.map(({ text }, index) => followParagraphFromManifest(index, text, { file: `p${index}.mp3` }))
  return mergeSidecarWords(base, sidecarFor(paragraphs, minimumParagraphRatio), 1)
}

const GENEALOGY = 'These are the generations of Noah. Noah was a righteous man; he walked with God. Noah became the father of Shem, Ham, and Japheth.'
// 24 words. sentence 1 = [0, 6)  sentence 2 (ends `man;`) = [6, 11)  clause = [11, 15)  sentence 4 = [15, 24)

describe('sentence-level follow for weakly aligned paragraphs', () => {
  it('keeps a single word current when the sidecar paragraph aligned fully', () => {
    const [paragraph] = followedFor([{ text: GENEALOGY, matchRatio: 1 }])
    expect(paragraph.alignment).toEqual({ matchRatio: 1, threshold: DEFAULT_FOLLOW_MATCH_RATIO })
    expect(followGranularity(paragraph)).toBe('word')
    const follow = followFromPlayback({ paragraphs: [paragraph], paragraphIndex: 0, currentTime: 3.6 })
    expect(follow).toEqual({ kind: 'word', paragraphIndex: 0, wordIndex: 7 })
    expect(followWordRole(follow, 0, 6)).toBe('spoken')
    expect(followWordRole(follow, 0, 7)).toBe('current')
    expect(followWordRole(follow, 0, 8)).toBe('upcoming')
  })

  it('widens the current mark to the enclosing sentence at ratio 0.8', () => {
    const [paragraph] = followedFor([{ text: GENEALOGY, matchRatio: 0.8 }])
    expect(followGranularity(paragraph)).toBe('sentence')
    const words = paragraph.words!

    const mid = followFromPlayback({ paragraphs: [paragraph], paragraphIndex: 0, currentTime: 3.6 })
    expect(mid).toEqual({
      kind: 'word',
      paragraphIndex: 0,
      wordIndex: 7,
      granularity: 'sentence',
      span: { from: 6, to: 11, start: words[6].start, end: words[10].end },
    })
    expect(words.slice(6, 11).map(word => word.text).join(' ')).toBe('Noah was a righteous man;')
    expect(followWordRole(mid, 0, 5)).toBe('spoken')
    expect(followWordRole(mid, 0, 6)).toBe('current')
    expect(followWordRole(mid, 0, 10)).toBe('current')
    expect(followWordRole(mid, 0, 11)).toBe('upcoming')

    // First sentence starts at the paragraph start.
    const first = followFromPlayback({ paragraphs: [paragraph], paragraphIndex: 0, currentTime: 0 })
    expect(first.kind === 'word' && first.span).toEqual({ from: 0, to: 6, start: 0, end: 3 })

    // `;` and `:` also close a span.
    const clause = followFromPlayback({ paragraphs: [paragraph], paragraphIndex: 0, currentTime: 6.1 })
    expect(clause.kind === 'word' && clause.span).toMatchObject({ from: 11, to: 15 })

    // Last sentence runs to the end of the paragraph, even past the last timing.
    const last = followFromPlayback({ paragraphs: [paragraph], paragraphIndex: 0, currentTime: 99 })
    expect(last).toMatchObject({ wordIndex: 23, span: { from: 15, to: 24, start: 7.5, end: 12 } })
  })

  it('treats verse markers as sentence boundaries', () => {
    const text = '¹ Adam lived a hundred and thirty years, and became the father of Seth. ² The days of Adam were eight hundred years ³ and he died.'
    const [paragraph] = followedFor([{ text, matchRatio: 0.8 }])
    const words = paragraph.words!
    expect(words.map(word => word.text)).toEqual(text.split(' '))
    // Speech starts at the first spoken word; the silent ¹ opens the span at the same time.
    const first = sentenceSpanAt(words, 3)
    expect(first).toMatchObject({ from: 0, to: 14, start: words[1].start })
    expect(words[13].text).toBe('Seth.')
    // ² opens a span even after the terminator; ³ mid-sentence still cuts the span.
    expect(sentenceSpanAt(words, 16)).toMatchObject({ from: 14, to: 23 })
    expect(words.slice(14, 23).map(word => word.text).join(' ')).toBe('² The days of Adam were eight hundred years')
    expect(sentenceSpanAt(words, 23)).toMatchObject({ from: 23, to: 27 })
    expect(sentenceSpanAt(words, 25)).toMatchObject({ from: 23, to: 27 })
    expect(words.slice(23, 27).map(word => word.text).join(' ')).toBe('³ and he died.')
  })

  it('reads the threshold from the chapter alignment metadata', () => {
    expect(followThresholdFromSidecar(null)).toBe(DEFAULT_FOLLOW_MATCH_RATIO)
    expect(followThresholdFromSidecar({ alignment: { minimumParagraphRatio: 0.9 } })).toBe(0.9)
    expect(followThresholdFromSidecar({ alignment: { minimumParagraphRatio: 1.5 } })).toBe(DEFAULT_FOLLOW_MATCH_RATIO)

    const strict = followedFor([{ text: GENEALOGY, matchRatio: 0.88 }], 0.9)
    expect(strict[0].alignment).toEqual({ matchRatio: 0.88, threshold: 0.9 })
    expect(followGranularity(strict[0])).toBe('sentence')

    const lenient = followedFor([{ text: GENEALOGY, matchRatio: 0.78 }], 0.75)
    expect(followGranularity(lenient[0])).toBe('word')

    // Exactly at the threshold is still word-level.
    const edge = followedFor([{ text: GENEALOGY, matchRatio: 0.85 }])
    expect(followGranularity(edge[0])).toBe('word')
  })

  it('keeps word-level follow when a sidecar carries no alignment metadata', () => {
    const [paragraph] = followedFor([{ text: GENEALOGY }])
    expect(paragraph.words).toHaveLength(24)
    expect(paragraph.alignment).toBeUndefined()
    expect(followGranularity(paragraph)).toBe('word')
    expect(followFromPlayback({ paragraphs: [paragraph], paragraphIndex: 0, currentTime: 3.6 }))
      .toEqual({ kind: 'word', paragraphIndex: 0, wordIndex: 7 })
    expect(followGranularity(undefined)).toBe('word')
    expect(followGranularity({ index: 0, text: 'No timings' })).toBe('word')
  })

  it('switches the span exactly at the boundary word start while stepping through time', () => {
    const [paragraph] = followedFor([{ text: GENEALOGY, matchRatio: 0.8 }])
    const words = paragraph.words!
    const boundary = words[6].start
    const spanAt = (t: number) => {
      const follow = followFromPlayback({ paragraphs: [paragraph], paragraphIndex: 0, currentTime: t })
      return follow.kind === 'word' ? [follow.span!.from, follow.span!.to] : null
    }
    expect(spanAt(boundary - 0.4)).toEqual([0, 6])
    expect(spanAt(boundary - 0.01)).toEqual([0, 6])
    expect(spanAt(boundary)).toEqual([6, 11])
    expect(spanAt(boundary + 0.01)).toEqual([6, 11])
    expect(spanAt(words[10].end - 0.01)).toEqual([6, 11])
    expect(spanAt(words[11].start)).toEqual([11, 15])
    // followAtTime walks chapter time to the same spans.
    expect(followAtTime([paragraph], boundary - 0.01)).toMatchObject({ span: { from: 0, to: 6 } })
    expect(followAtTime([paragraph], boundary)).toMatchObject({ span: { from: 6, to: 11 } })
  })

  it('only widens the weak paragraph, leaving well-aligned neighbours word-level', () => {
    const paragraphs = followedFor([
      { text: 'In the beginning God created the heavens and the earth.', matchRatio: 1 },
      { text: GENEALOGY, matchRatio: 0.8 },
    ])
    expect(followFromPlayback({ paragraphs, paragraphIndex: 0, currentTime: 1.6 }))
      .toEqual({ kind: 'word', paragraphIndex: 0, wordIndex: 3 })
    expect(followFromPlayback({ paragraphs, paragraphIndex: 1, currentTime: 1.6 }))
      .toMatchObject({ kind: 'word', paragraphIndex: 1, wordIndex: 3, granularity: 'sentence', span: { from: 0, to: 6 } })
    const weak = followFromPlayback({ paragraphs, paragraphIndex: 1, currentTime: 1.6 })
    expect(followWordRole(weak, 0, 9)).toBe('spoken')
    expect(followWordRole(weak, 2, 0)).toBe('upcoming')
    expect(followWordRole({ kind: 'paragraph', paragraphIndex: 1 }, 1, 0)).toBeNull()
  })

  it('recognises terminators with trailing quotes and brackets', () => {
    for (const token of ['waters.', 'so!', 'why?', 'man;', 'said:', 'waters."', 'said.’', 'so.)']) {
      expect(isSentenceTerminator(token)).toBe(true)
    }
    for (const token of ['Noah,', 'the', '"Let', 'e.g', 'Mr']) {
      expect(isSentenceTerminator(token)).toBe(false)
    }
  })
})
