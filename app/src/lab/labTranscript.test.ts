import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { transcriptTurns, transcriptWordClass } from './labTranscript'

const LINES = [
  'TRANSCRIPT',
  '0:00 Robert Lawrence Kuhn David, the many-worlds interpretation of quantum theory arguably is one of the most remarkable claims.',
  '0:20 David Deutsch What it is first: it is the idea that the physical world that we see around us is one tiny sliver.',
  '1:04 Robert Lawrence Kuhn Now how can you believe such a thing?',
  '1:07 David Deutsch The reason we have to believe this, if we believe anything due to science, is two paths.',
]

describe('transcriptTurns', () => {
  it('finds the time and the recurring speaker at the head of each turn', () => {
    const turns = transcriptTurns(LINES)!
    expect(turns.has(0)).toBe(false)
    expect(turns.get(1)).toEqual({ time: 1, name: 3 })
    expect(turns.get(2)).toEqual({ time: 1, name: 2 })
    expect(turns.get(3)).toEqual({ time: 1, name: 3 })
    expect(turns.get(4)).toEqual({ time: 1, name: 2 })
    expect(transcriptWordClass(turns, 1, 0)).toBe(' lab-transcript-time')
    expect(transcriptWordClass(turns, 1, 3)).toBe(' lab-transcript-speaker')
    expect(transcriptWordClass(turns, 1, 4)).toBe('')
    expect(transcriptWordClass(turns, 0, 0)).toBe('')
  })

  it('styles only the time where the name does not recur', () => {
    const turns = transcriptTurns([...LINES, '2:10 Narrator Something else happens here.'])!
    expect(turns.get(5)).toEqual({ time: 1, name: 0 })
  })

  it('leaves ordinary text alone', () => {
    expect(transcriptTurns(['It was a dark night.', '10:30 was the hour he left.', 'He went home.'])).toBeNull()
    expect(transcriptTurns(LINES.slice(0, 3))).toBeNull()
    expect(transcriptWordClass(null, 0, 0)).toBe('')
  })

  it('marks only the transcript editions in the library (Bold Conjectures)', () => {
    const dir = resolve(__dirname, '../../public/data/editions')
    const hits: string[] = []
    for (const file of readdirSync(dir).filter(name => name.endsWith('.json'))) {
      let data: unknown
      try { data = JSON.parse(readFileSync(resolve(dir, file), 'utf8')) } catch { continue }
      const chapters = (data as { chapters?: Array<{ paragraphs?: unknown[] }> })?.chapters
      if (!Array.isArray(chapters)) continue
      chapters.forEach((chapter, index) => {
        const paragraphs = (chapter?.paragraphs ?? []).map(p => typeof p === 'string' ? p : (p as { text?: string })?.text ?? '')
        if (transcriptTurns(paragraphs)) hits.push(`${file}#${index}`)
      })
    }
    expect(hits.length).toBeGreaterThan(0)
    expect(hits.filter(hit => !hit.startsWith('bold-conjectures-'))).toEqual([])
  })
})
