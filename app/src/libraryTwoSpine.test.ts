import { describe, expect, it } from 'vitest'
// @ts-expect-error -- plain browser module of the library page
import { PAPER_SPINE, coverToneFor, hasPaperSpine, hasStoredSpineTone } from '../public/lab/library_2/spine.js'

const lesMis = 'pd-pg-135'
const cover = '/api/public-books/pd-pg-135/cover'
const paperEntry = { id: lesMis, title: 'Les Misérables', author: 'Victor Hugo', paper: true, art: null, cover: { kind: 'generated', background: '#33241c', accent: '#e9dfc4' } }
const lightness = (hex: string) => { const n = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); return (Math.max(...n) + Math.min(...n)) / 510 }

describe('spines of added books (library_2/spine.js)', () => {
  it('a paper cover gets a paper spine with ink lettering, never the dark import tone', () => {
    expect(hasPaperSpine(lesMis, null)).toBe(true)
    expect(hasPaperSpine(lesMis, cover)).toBe(false)
    // Registry books keep their leather bindings, with or without artwork.
    expect(hasPaperSpine('frankenstein', null)).toBe(false)
    expect(lightness(PAPER_SPINE.colour)).toBeGreaterThan(0.8)
    expect(lightness(PAPER_SPINE.ink)).toBeLessThan(0.25)
    // The opened book shows paper boards for the paper cover…
    expect(coverToneFor(paperEntry)).toBe(PAPER_SPINE.board)
    expect(lightness(PAPER_SPINE.board)).toBeGreaterThan(0.6)
    // …the painting's stored spine tone once painted, and registry books their own tone.
    expect(coverToneFor({ ...paperEntry, art: { src: cover }, cover: { ...paperEntry.cover, background: '#1d1c17', spine: '#1d1c17' } })).toBe('#1d1c17')
    expect(coverToneFor({ id: 'frankenstein', art: null, cover: { background: '#0a1a0a' } })).toBe('#0a1a0a')
  })

  it('a painted cover uses the spine tone the Worker stored from the painting', () => {
    const painted = { bookId: lesMis, cover, tone: '#1d1c17' }
    expect(hasStoredSpineTone(painted)).toBe(true)
    expect(hasStoredSpineTone({ ...painted, cover: null })).toBe(false)
    // Registry books are sampled from their artwork, as before.
    expect(hasStoredSpineTone({ ...painted, bookId: 'frankenstein' })).toBe(false)
    expect(hasStoredSpineTone({ ...painted, tone: null })).toBe(false)
  })
})
