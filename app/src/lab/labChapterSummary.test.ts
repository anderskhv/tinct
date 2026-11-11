import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { CHAPTER_SUMMARY_KIND, chapterNotesTitle } from './labChapterNotes'

// Anders, 11 Nov 2026 (Bible, Luke 8): the chapter pill's Summary "works as catch me up, but should be a summary of
// that chapter". It had opened Catch me up's timeline at a chapter's start and the chapter "so far" further in.
describe('the chapter pill’s Summary is a summary of that chapter', () => {
  it('asks for the whole chapter (the chapter-end card’s request), under its own name', () => {
    expect(CHAPTER_SUMMARY_KIND).toBe('end')
    expect(chapterNotesTitle('end', 'Luke 8', 'summary')).toBe('Summary · Luke 8')
    expect(chapterNotesTitle('end', 'Luke 8')).toBe('Recap · Luke 8')
    expect(chapterNotesTitle('primer', 'Luke 8')).toBe('Primer · Luke 8')
  })

  it('the pill never routes to Catch me up or the chapter so far', () => {
    const app = readFileSync(resolve(__dirname, 'LabApp.tsx'), 'utf8')
    const start = app.indexOf('chapterSummaryRef.current = () => {')
    const body = app.slice(start, app.indexOf('\n  }\n', start))
    expect(start).toBeGreaterThan(0)
    expect(body).toContain("openChapterNotes(CHAPTER_SUMMARY_KIND, book.chapterNumber, 'pill', 'summary')")
    expect(body).not.toMatch(/marginCatchUpRef|setSuperSheet\('catchup'\)|'sofar'/)
  })
})
