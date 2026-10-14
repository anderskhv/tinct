/**
 * Before you start: the primer parser. Every case runs against both copies,
 * the Worker's (src/companion/primerParse.ts) and the PDF reader's
 * static-page twin (public/lab/margin/primer-parse.js), so they never drift.
 */
import { describe, expect, it } from 'vitest'
import * as appCopy from './companion/primerParse'
import * as pageCopy from '../public/lab/margin/primer-parse.js'

const copies = [['src/companion/primerParse.ts', appCopy], ['public/lab/margin/primer-parse.js', pageCopy]] as const

const answer = {
  gist: 'The chapter builds the rate equations from first principles. Later chapters rely on them throughout.',
  claims: [
    { text: 'Rates depend on concentrations.', cite: '{p. 12}' },
    { text: 'Order is found by experiment, not stoichiometry.', cite: '{pp. 13–14}' },
    { text: 'Half-life is constant for first order.', cite: '{eq. 1.2}' },
  ],
  keepInMind: ['Units of k change with the order.'],
  map: [
    { title: '1.1 Rates', pages: 'pp. 9–10' },
    { title: '1.2 Order', pages: 'pp. 11–14' },
    { title: '1.3 Half-life', pages: 'p. 15' },
  ],
}

describe.each(copies)('primer parser (%s)', (_name, m) => {
  it('reads a bare JSON answer exactly, cite tokens kept as text', () => {
    expect(m.parsePrimer(JSON.stringify(answer))).toEqual(answer)
  })

  it('reads an answer in a code fence, or with prose around it', () => {
    expect(m.parsePrimer('```json\n' + JSON.stringify(answer, null, 2) + '\n```')).toEqual(answer)
    expect(m.parsePrimer('```\n' + JSON.stringify(answer) + '\n```')).toEqual(answer)
    expect(m.parsePrimer('Here is the orientation:\n' + JSON.stringify(answer) + '\nHope it helps.')).toEqual(answer)
  })

  it('is null for anything that is not a primer', () => {
    for (const text of ['', 'No JSON here.', '{not json}', '[1,2,3]', 'null', JSON.stringify({ gist: 'Only a gist.' })]) {
      expect(m.parsePrimer(text), text).toBeNull()
    }
    expect(m.parsePrimer(null)).toBeNull()
    expect(m.parsePrimer(undefined)).toBeNull()
    expect(m.normalizePrimer([answer])).toBeNull()
    expect(m.normalizePrimer({ ...answer, gist: '   ' })).toBeNull()
    expect(m.normalizePrimer({ ...answer, keepInMind: 'One caution.' })).toBeNull()
  })

  it('holds each list to its counts: claims 3–5, keepInMind 1–3, map 3–8', () => {
    const claim = (i: number) => ({ text: `Claim ${i}.`, cite: `{p. ${i}}` })
    const section = (i: number) => ({ title: `Section ${i}`, pages: `p. ${i}` })
    expect(m.normalizePrimer({ ...answer, claims: [claim(1), claim(2)] })).toBeNull()
    expect(m.normalizePrimer({ ...answer, claims: Array.from({ length: 7 }, (_, i) => claim(i + 1)) })!.claims).toEqual([1, 2, 3, 4, 5].map(claim))
    expect(m.normalizePrimer({ ...answer, keepInMind: [] })).toBeNull()
    expect(m.normalizePrimer({ ...answer, keepInMind: ['a', 'b', 'c', 'd'] })!.keepInMind).toEqual(['a', 'b', 'c'])
    expect(m.normalizePrimer({ ...answer, map: [section(1), section(2)] })).toBeNull()
    expect(m.normalizePrimer({ ...answer, map: Array.from({ length: 10 }, (_, i) => section(i + 1)) })!.map).toHaveLength(8)
    expect(m.PRIMER_LIMITS.claims).toEqual({ min: 3, max: 5 })
    expect(m.PRIMER_LIMITS.keepInMind).toEqual({ min: 1, max: 3 })
    expect(m.PRIMER_LIMITS.map).toEqual({ min: 3, max: 8 })
  })

  it('drops malformed items before counting, and keeps a claim without a cite', () => {
    const primer = m.normalizePrimer({
      ...answer,
      claims: [null, 7, { cite: '{p. 1}' }, { text: '  ' }, 'A bare claim.', ...answer.claims],
      keepInMind: [3, '', '  Mind the units.  '],
      map: [{ pages: 'p. 1' }, 'Section', ...answer.map],
    })!
    expect(primer.claims[0]).toEqual({ text: 'A bare claim.', cite: '' })
    expect(primer.claims).toHaveLength(4)
    expect(primer.keepInMind).toEqual(['Mind the units.'])
    expect(primer.map).toEqual(answer.map)
    expect(m.normalizePrimer({ ...answer, claims: answer.claims.map(c => ({ text: c.text })) })!.claims.every(c => c.cite === '')).toBe(true)
    expect(m.normalizePrimer({ ...answer, map: answer.map.map(s => ({ title: s.title })) })!.map.every(s => s.pages === '')).toBe(true)
  })

  it('trims, folds whitespace and caps every string at whole characters', () => {
    const long = 'é'.repeat(5_000)
    const primer = m.normalizePrimer({
      gist: `  ${'w '.repeat(1_000)}  `,
      claims: [{ text: long, cite: `{p. ${'1'.repeat(100)}}` }, ...answer.claims],
      keepInMind: [`Line one\n\n  line two\t${'😀'.repeat(500)}`],
      map: [{ title: long, pages: 'p'.repeat(100) }, ...answer.map],
    })!
    expect(primer.gist.length).toBeLessThanOrEqual(m.PRIMER_LIMITS.gistChars)
    expect(primer.gist).not.toMatch(/^\s|\s$|\s\s/)
    expect(primer.claims[0].text).toBe('é'.repeat(m.PRIMER_LIMITS.itemChars))
    expect(primer.claims[0].cite).toHaveLength(m.PRIMER_LIMITS.citeChars)
    expect(primer.keepInMind[0].startsWith('Line one line two ')).toBe(true)
    expect(Array.from(primer.keepInMind[0])).toHaveLength(m.PRIMER_LIMITS.itemChars)
    expect(primer.keepInMind[0]).not.toMatch(/[\uD800-\uDBFF]$/)
    expect(primer.map[0].title).toHaveLength(m.PRIMER_LIMITS.titleChars)
    expect(primer.map[0].pages).toHaveLength(m.PRIMER_LIMITS.pagesChars)
  })

  it('drops extra fields, and reads a stored primer only with its time and unit', () => {
    const primer = m.normalizePrimer({ ...answer, extra: 'x', claims: answer.claims.map(c => ({ ...c, note: 'y' })) })!
    expect(primer).toEqual(answer)
    const stored = { ...answer, madeAt: '2026-10-14T09:30:00.000Z', unitKey: 'outline-3' }
    expect(m.normalizeStoredPrimer(stored)).toEqual(stored)
    expect(m.normalizeStoredPrimer({ ...stored, madeAt: 'yesterday' })).toBeNull()
    expect(m.normalizeStoredPrimer({ ...stored, madeAt: '2026-13-45T99:00:00Z' })).toBeNull()
    expect(m.normalizeStoredPrimer({ ...stored, unitKey: '../x' })).toBeNull()
    expect(m.normalizeStoredPrimer(answer)).toBeNull()
  })

  it('accepts only short, path-safe unit keys', () => {
    for (const key of ['all', 'outline-3', 'o.12_a', 'A'.repeat(64)]) expect(m.PRIMER_UNIT_KEY_RE.test(key), key).toBe(true)
    for (const key of ['', '-a', '.x', 'a/b', '../a', 'a b', 'A'.repeat(65), 'ü']) expect(m.PRIMER_UNIT_KEY_RE.test(key), key).toBe(false)
  })
})

it('the two copies agree on every case above, value for value', () => {
  const inputs = [JSON.stringify(answer), '```json\n' + JSON.stringify({ ...answer, claims: [...answer.claims, ...answer.claims] }) + '\n```', 'nothing']
  for (const input of inputs) expect(pageCopy.parsePrimer(input)).toEqual(appCopy.parsePrimer(input))
  expect(pageCopy.PRIMER_LIMITS).toEqual(appCopy.PRIMER_LIMITS)
  expect(pageCopy.PRIMER_UNIT_KEY_RE.source).toBe(appCopy.PRIMER_UNIT_KEY_RE.source)
})
