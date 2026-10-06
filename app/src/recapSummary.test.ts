import { describe, expect, it } from 'vitest'
import { RECAP_BRIEF_MIN_NARRATIVE_WORDS, RECAP_PROMPT_VERSION, briefRecapHasEnoughText, isUsableRecapSummary, recapCacheKey, recapCoverageThrough, recapNarrativeWords } from './recapSummary'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('recapCoverageThrough', () => {
  it('keeps the exact paragraph for short chapters', () => {
    expect(recapCoverageThrough({ paragraphIndex: 3, paragraphCount: 6, completed: false })).toBe(3)
    expect(recapCoverageThrough({ paragraphIndex: 0, paragraphCount: 6, completed: false })).toBe(0)
    expect(recapCoverageThrough({ paragraphIndex: 23, paragraphCount: 24, completed: false })).toBe(23)
  })

  it('rounds long chapters DOWN to a five-paragraph bucket, never up', () => {
    expect(recapCoverageThrough({ paragraphIndex: 0, paragraphCount: 60, completed: false })).toBe(0)
    expect(recapCoverageThrough({ paragraphIndex: 4, paragraphCount: 60, completed: false })).toBe(0)
    expect(recapCoverageThrough({ paragraphIndex: 5, paragraphCount: 60, completed: false })).toBe(5)
    expect(recapCoverageThrough({ paragraphIndex: 17, paragraphCount: 60, completed: false })).toBe(15)
    expect(recapCoverageThrough({ paragraphIndex: 59, paragraphCount: 60, completed: false })).toBe(55)
  })

  it('covers the whole chapter once finished and clamps out-of-range indexes', () => {
    expect(recapCoverageThrough({ paragraphIndex: 2, paragraphCount: 6, completed: true })).toBe(5)
    expect(recapCoverageThrough({ paragraphIndex: 99, paragraphCount: 6, completed: false })).toBe(5)
    expect(recapCoverageThrough({ paragraphIndex: -1, paragraphCount: 6, completed: false })).toBe(0)
    expect(recapCoverageThrough({ paragraphIndex: 3, paragraphCount: 0, completed: false })).toBe(0)
  })
})

describe('recapCacheKey', () => {
  const base = { bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 645, paragraphCount: 6, completed: false }

  it('is stable for one place and carries the prompt version', () => {
    expect(recapCacheKey({ ...base, paragraphIndex: 3 })).toBe(`${RECAP_PROMPT_VERSION}/bible/kjv-en/645/645/3`)
  })

  it('shares an entry across nearby positions of a long chapter only', () => {
    const long = { ...base, bookId: 'moby-dick', editionKey: 'original-en', chapterNumber: 1, paragraphCount: 60 }
    expect(recapCacheKey({ ...long, paragraphIndex: 16 })).toBe(recapCacheKey({ ...long, paragraphIndex: 19 }))
    expect(recapCacheKey({ ...long, paragraphIndex: 16 })).not.toBe(recapCacheKey({ ...long, paragraphIndex: 20 }))
    expect(recapCacheKey({ ...base, paragraphIndex: 2 })).not.toBe(recapCacheKey({ ...base, paragraphIndex: 3 }))
  })

  it('separates finished, previous-chapter scope and unknown chapter lengths', () => {
    expect(recapCacheKey({ ...base, paragraphIndex: 5, completed: true })).toBe(`${RECAP_PROMPT_VERSION}/bible/kjv-en/645/645/end`)
    expect(recapCacheKey({ ...base, paragraphIndex: 0, chapterNumber: 646, previousChapterNumber: 645 })).toBe(`${RECAP_PROMPT_VERSION}/bible/kjv-en/646/645/0`)
    expect(recapCacheKey({ ...base, paragraphIndex: 17, paragraphCount: null })).toBe(`${RECAP_PROMPT_VERSION}/bible/kjv-en/645/645/17`)
  })
})

/** The real Letter 4 of Frankenstein, where Anders opened Catch me up on 2026-10-06. */
function frankensteinLetter4(edition: 'original-en' | 'modern-en'): string[] {
  const data = JSON.parse(readFileSync(resolve(__dirname, `../public/data/editions/frankenstein-${edition}.json`), 'utf8')) as { chapters: Array<{ title: string; paragraphs: string[] }> }
  return data.chapters.find(chapter => chapter.title === 'Letter 4')!.paragraphs
}

describe('narrative floor for the chapter-in-progress entry', () => {
  it('counts headings, address lines, dates and salutations as no narrative', () => {
    expect(recapNarrativeWords(['_To Mrs. Saville, England._', 'August 5th, 17—.'])).toBe(0)
    expect(recapNarrativeWords(['<h2>Chapter 1</h2>', 'My dear Victor,'])).toBe(0)
    expect(recapNarrativeWords(['So strange an accident has happened to us that I cannot forbear recording it.'])).toBe(14)
    // Verse numbers are not words.
    expect(recapNarrativeWords(['¹ In the beginning God created the heaven and the earth.'])).toBe(10)
  })

  it('Frankenstein, Letter 4: no entry while only the heading lines are covered, an entry once a page is', () => {
    for (const edition of ['original-en', 'modern-en'] as const) {
      const paragraphs = frankensteinLetter4(edition)
      expect(paragraphs.length).toBeGreaterThanOrEqual(25)
      // 0–4 are one cache bucket that covers paragraph 0 only: the address line.
      for (const paragraphIndex of [0, 1, 2, 4]) expect(briefRecapHasEnoughText({ paragraphs, paragraphIndex, completed: false })).toBe(false)
      expect(briefRecapHasEnoughText({ paragraphs, paragraphIndex: 5, completed: false })).toBe(true)
      expect(briefRecapHasEnoughText({ paragraphs, paragraphIndex: 1, completed: true })).toBe(true)
    }
  })

  it('a short chapter needs about 40 words of it read', () => {
    const verses = ['¹ Better is a dry morsel, and quietness therewith, than an house full of sacrifices with strife.', '² A wise servant shall have rule over a son that causeth shame.', '³ The fining pot is for silver, and the furnace for gold: but the LORD trieth the hearts.']
    expect(recapNarrativeWords(verses.slice(0, 2))).toBeLessThan(RECAP_BRIEF_MIN_NARRATIVE_WORDS)
    expect(briefRecapHasEnoughText({ paragraphs: verses, paragraphIndex: 1, completed: false })).toBe(false)
    expect(briefRecapHasEnoughText({ paragraphs: verses, paragraphIndex: 2, completed: false })).toBe(true)
    expect(briefRecapHasEnoughText({ paragraphs: [], paragraphIndex: 0, completed: false })).toBe(false)
  })
})

describe('isUsableRecapSummary', () => {
  it('rejects empty answers and replies that talk about the passage instead of summarising it', () => {
    expect(isUsableRecapSummary('')).toBe(false)
    expect(isUsableRecapSummary('   ')).toBe(false)
    expect(isUsableRecapSummary(null)).toBe(false)
    expect(isUsableRecapSummary('I need to see the actual content of Letter 4 to write an accurate summary. The passage provided only shows the heading "Letter 4" and the salutation "To Mrs. Saville, England." but contains no narrative or content beyond that. Could you provide the full text of the passage where the reader stopped?')).toBe(false)
    expect(isUsableRecapSummary('Could you please share the rest of the chapter?')).toBe(false)
    expect(isUsableRecapSummary("I can't summarise this passage because it contains only a heading.")).toBe(false)
  })

  it('accepts ordinary summaries, including ones about letters, needs and texts', () => {
    expect(isUsableRecapSummary('Walton writes to his sister from the ice. He records a strange accident and a sledge seen far off.')).toBe(true)
    expect(isUsableRecapSummary('Walton tells Margaret he needs a friend. He describes the text of his last letter and the passage north.')).toBe(true)
    expect(isUsableRecapSummary('The proverbs contrast a quiet home with a house full of strife, and the LORD tries the hearts.')).toBe(true)
  })
})
