/**
 * Before you start: the primer parser, per kind (paper, textbook, narrative,
 * practical, other) and for primers stored before kinds. Every case runs against both copies,
 * the Worker's (src/companion/primerParse.ts) and the PDF reader's
 * static-page twin (public/lab/margin/primer-parse.js), so they never drift.
 */
import { describe, expect, it } from 'vitest'
import * as appCopy from './companion/primerParse'
import * as pageCopy from '../public/lab/margin/primer-parse.js'

const copies = [['src/companion/primerParse.ts', appCopy], ['public/lab/margin/primer-parse.js', pageCopy]] as const

const map = [
  { title: '1.1 Rates', pages: 'pp. 9–10' },
  { title: '1.2 Order', pages: 'pp. 11–14' },
  { title: '1.3 Half-life', pages: 'p. 15' },
]
const claims = [
  { text: 'Rates depend on concentrations.', cite: '{p. 12}' },
  { text: 'Order is found by experiment, not stoichiometry.', cite: '{pp. 13–14}' },
  { text: 'Half-life is constant for first order.', cite: '{eq. 1.2}' },
]
const gist = 'The chapter builds the rate equations from first principles. Later chapters rely on them throughout.'
/** A model's answer for each kind (PROMPTS.md, chapter action `primer`), each with its own sections. */
const answers = {
  paper: { kind: 'paper', gist, sections: [{ title: 'Key claims', items: claims }, { title: 'Keep in mind', items: [{ text: 'Units of k change with the order.', cite: '' }] }], map },
  textbook: { kind: 'textbook', gist, sections: [
    { title: 'What you’ll learn', items: claims },
    { title: 'Ideas to hold onto', items: [{ text: 'A rate law is measured, not derived.', cite: '{p. 13}' }] },
    { title: 'Terms', items: [{ term: 'Rate constant', meaning: 'The k in a rate law; its units depend on the order.' }, { term: 'Half-life', meaning: 'The time for half the reactant to go.' }] },
  ], map },
  narrative: { kind: 'narrative', gist, sections: [
    { title: 'Where we are', items: [{ text: 'A lab in 1889, on the eve of a demonstration.', cite: '{p. 9}' }] },
    { title: 'People', items: [{ term: 'Arrhenius', meaning: 'A young chemist with a disputed idea.' }, { term: 'Ostwald', meaning: 'His older ally.' }] },
    { title: 'Threads to watch', items: [{ text: 'Whether the committee will listen.', cite: '{p. 11}' }] },
  ], map },
  practical: { kind: 'practical', gist, sections: [
    { title: 'What it covers', items: [{ text: 'Measuring a rate with a spectrometer.', cite: '{p. 9}' }] },
    { title: 'Steps or topics', items: [{ text: 'Calibrate.', cite: '{p. 10}' }, { text: 'Mix and time.', cite: '{p. 11}' }, { text: 'Fit the curve.', cite: '{p. 12}' }] },
  ], map },
  other: { kind: 'other', gist, sections: [{ title: 'Key points', items: claims }, { title: 'Keep in mind', items: [{ text: 'A draft.', cite: '' }] }], map },
} as const
const answer = answers.textbook
/** A primer made before kinds: the shape stored until 15 Oct 2026. */
const oldAnswer = { gist, claims, keepInMind: ['Units of k change with the order.'], map }
const oldAsRead = { kind: 'paper', gist, sections: [{ title: 'Key claims', items: claims }, { title: 'Keep in mind', items: [{ text: 'Units of k change with the order.', cite: '' }] }], map }

describe.each(copies)('primer parser (%s)', (_name, m) => {
  it('reads a bare JSON answer of every kind exactly, cite tokens kept as text, terms as term and meaning', () => {
    for (const [kind, a] of Object.entries(answers)) expect(m.parsePrimer(JSON.stringify(a)), kind).toEqual(a)
    expect(Object.keys(m.PRIMER_KINDS)).toEqual(['paper', 'textbook', 'narrative', 'practical', 'other'])
  })

  it('a kind it does not know is "other"; a missing one too', () => {
    expect(m.parsePrimer(JSON.stringify({ ...answer, kind: 'poem' }))!.kind).toBe('other')
    const { kind: _kind, ...noKind } = answer
    expect(m.parsePrimer(JSON.stringify(noKind))!.kind).toBe('other')
  })

  it('reads a primer made before kinds as a paper\'s: Key claims, then Keep in mind', () => {
    expect(m.parsePrimer(JSON.stringify(oldAnswer))).toEqual(oldAsRead)
    const stored = { ...oldAnswer, madeAt: '2026-10-14T09:30:00.000Z', unitKey: 'outline-3' }
    expect(m.normalizeStoredPrimer(stored)).toEqual({ ...oldAsRead, madeAt: stored.madeAt, unitKey: 'outline-3' })
    // Its old counts still hold: claims 3–5, keepInMind 1–3.
    expect(m.normalizePrimer({ ...oldAnswer, claims: claims.slice(0, 2) })).toBeNull()
    expect(m.normalizePrimer({ ...oldAnswer, keepInMind: [] })).toBeNull()
    expect(m.normalizePrimer({ ...oldAnswer, keepInMind: 'One caution.' })).toBeNull()
    expect(m.normalizePrimer({ ...oldAnswer, claims: [...claims, ...claims, ...claims] })!.sections[0].items).toHaveLength(5)
    expect(m.normalizePrimer({ ...oldAnswer, keepInMind: ['a', 'b', 'c', 'd'] })!.sections[1].items.map(i => (i as { text: string }).text)).toEqual(['a', 'b', 'c'])
    expect(m.PRIMER_LIMITS.claims).toEqual({ min: 3, max: 5 })
    expect(m.PRIMER_LIMITS.keepInMind).toEqual({ min: 1, max: 3 })
  })

  it('reads an answer in a code fence, or with prose around it', () => {
    expect(m.parsePrimer('```json\n' + JSON.stringify(answer, null, 2) + '\n```')).toEqual(answer)
    expect(m.parsePrimer('```\n' + JSON.stringify(answer) + '\n```')).toEqual(answer)
    expect(m.parsePrimer('Here is the orientation:\n' + JSON.stringify(answer) + '\nHope it helps.')).toEqual(answer)
  })

  it('reads an answer after prose with braces of its own', () => {
    expect(m.parsePrimer('The map uses {p. 9} tags as asked. ' + JSON.stringify(answer))).toEqual(answer)
    expect(m.parsePrimer('{"note": 1} then ' + JSON.stringify(answer))).toBeNull()
  })

  it('names why an answer is not a primer, for the log: empty, no JSON, cut off, wrong shape', () => {
    expect(m.primerFailure(JSON.stringify(answer))).toBeNull()
    expect(m.primerFailure(JSON.stringify(oldAnswer))).toBeNull()
    expect(m.primerFailure('')).toBe('empty')
    expect(m.primerFailure('   ')).toBe('empty')
    expect(m.primerFailure('I cannot see the document.')).toBe('no_json')
    // A reply cut off by the output limit, at any point.
    const whole = JSON.stringify(answer, null, 2)
    for (const at of [1, 40, Math.floor(whole.length / 2), whole.length - 2]) expect(m.primerFailure(whole.slice(0, at)), String(at)).toBe('invalid_json')
    expect(m.primerFailure(JSON.stringify({ gist: 'Only a gist.' }))).toBe('shape')
    expect(m.primerFailure(JSON.stringify({ ...answer, sections: [] }))).toBe('shape')
  })

  it('is null for anything that is not a primer', () => {
    for (const text of ['', 'No JSON here.', '{not json}', '[1,2,3]', 'null', JSON.stringify({ gist: 'Only a gist.' })]) {
      expect(m.parsePrimer(text), text).toBeNull()
    }
    expect(m.parsePrimer(null)).toBeNull()
    expect(m.parsePrimer(undefined)).toBeNull()
    expect(m.normalizePrimer([answer])).toBeNull()
    expect(m.normalizePrimer({ ...answer, gist: '   ' })).toBeNull()
    expect(m.normalizePrimer({ ...answer, sections: 'Key claims' })).toBeNull()
    expect(m.normalizePrimer({ ...answer, sections: [{ title: '', items: claims }] })).toBeNull()
    expect(m.normalizePrimer({ ...answer, sections: [{ title: 'Terms', items: [{ term: 'k' }] }] })).toBeNull()
  })

  it('holds each list to its counts: sections 1–4, items 1–8, map 3–8', () => {
    const section = (i: number) => ({ title: `Section ${i}`, pages: `p. ${i}` })
    const part = (i: number) => ({ title: `Part ${i}`, items: Array.from({ length: 10 }, (_, k) => ({ text: `Point ${k}.`, cite: '' })) })
    const many = m.normalizePrimer({ ...answer, sections: Array.from({ length: 6 }, (_, i) => part(i)) })!
    expect(many.sections.map(x => x.title)).toEqual(['Part 0', 'Part 1', 'Part 2', 'Part 3'])
    expect(many.sections.every(x => x.items.length === 8)).toBe(true)
    expect(m.normalizePrimer({ ...answer, sections: [] })).toBeNull()
    expect(m.normalizePrimer({ ...answer, map: [section(1), section(2)] })).toBeNull()
    expect(m.normalizePrimer({ ...answer, map: Array.from({ length: 10 }, (_, i) => section(i + 1)) })!.map).toHaveLength(8)
    expect(m.PRIMER_LIMITS.sections).toEqual({ min: 1, max: 4 })
    expect(m.PRIMER_LIMITS.items).toEqual({ min: 1, max: 8 })
    expect(m.PRIMER_LIMITS.map).toEqual({ min: 3, max: 8 })
  })

  it('drops malformed items and sections before counting; keeps a point without a cite and a bare string as a point', () => {
    const primer = m.normalizePrimer({
      ...answer,
      sections: [null, 7, { items: claims }, { title: 'Empty', items: [] }, { title: 'Mixed', items: [null, 7, { cite: '{p. 1}' }, { text: '  ' }, 'A bare point.', { term: 'k', meaning: '  ' }, { term: ' k ', meaning: ' The constant. ' }, ...claims.map(c => ({ text: c.text }))] }],
      map: [{ pages: 'p. 1' }, 'Section', ...map],
    })!
    expect(primer.sections).toHaveLength(1)
    expect(primer.sections[0].items).toEqual([{ text: 'A bare point.', cite: '' }, { term: 'k', meaning: 'The constant.' }, ...claims.map(c => ({ text: c.text, cite: '' }))])
    expect(primer.map).toEqual(map)
    expect(m.normalizePrimer({ ...answer, map: map.map(s => ({ title: s.title })) })!.map.every(s => s.pages === '')).toBe(true)
  })

  it('trims, folds whitespace and caps every string at whole characters', () => {
    const long = 'é'.repeat(5_000)
    const primer = m.normalizePrimer({
      kind: 'textbook',
      gist: `  ${'w '.repeat(1_000)}  `,
      sections: [
        { title: `  ${long}`, items: [{ text: long, cite: `{p. ${'1'.repeat(100)}}` }, `Line one\n\n  line two\t${'😀'.repeat(500)}`] },
        { title: 'Terms', items: [{ term: long, meaning: long }] },
      ],
      map: [{ title: long, pages: 'p'.repeat(100) }, ...map],
    })!
    expect(primer.gist.length).toBeLessThanOrEqual(m.PRIMER_LIMITS.gistChars)
    expect(primer.gist).not.toMatch(/^\s|\s$|\s\s/)
    expect(primer.sections[0].title).toBe('é'.repeat(m.PRIMER_LIMITS.sectionTitleChars))
    const [first, second] = primer.sections[0].items as Array<{ text: string; cite: string }>
    expect(first.text).toBe('é'.repeat(m.PRIMER_LIMITS.itemChars))
    expect(first.cite).toHaveLength(m.PRIMER_LIMITS.citeChars)
    expect(second.text.startsWith('Line one line two ')).toBe(true)
    expect(Array.from(second.text)).toHaveLength(m.PRIMER_LIMITS.itemChars)
    expect(second.text).not.toMatch(/[\uD800-\uDBFF]$/)
    expect(primer.sections[1].items[0]).toEqual({ term: 'é'.repeat(m.PRIMER_LIMITS.termChars), meaning: 'é'.repeat(m.PRIMER_LIMITS.itemChars) })
    expect(primer.map[0].title).toHaveLength(m.PRIMER_LIMITS.titleChars)
    expect(primer.map[0].pages).toHaveLength(m.PRIMER_LIMITS.pagesChars)
  })

  it('drops extra fields, and reads a stored primer only with its time and unit', () => {
    const primer = m.normalizePrimer({ ...answer, extra: 'x', sections: answer.sections.map(x => ({ ...x, note: 'y', items: x.items.map(i => ({ ...i, note: 'z' })) })) })!
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
  const inputs = [...Object.values(answers).map(a => JSON.stringify(a)), JSON.stringify(oldAnswer), '```json\n' + JSON.stringify({ ...oldAnswer, claims: [...claims, ...claims] }) + '\n```', JSON.stringify({ ...answer, kind: 'poem' }), 'nothing']
  for (const input of inputs) expect(pageCopy.parsePrimer(input)).toEqual(appCopy.parsePrimer(input))
  expect(pageCopy.PRIMER_LIMITS).toEqual(appCopy.PRIMER_LIMITS)
  expect(pageCopy.PRIMER_KINDS).toEqual(appCopy.PRIMER_KINDS)
  expect(pageCopy.PRIMER_UNIT_KEY_RE.source).toBe(appCopy.PRIMER_UNIT_KEY_RE.source)
})
