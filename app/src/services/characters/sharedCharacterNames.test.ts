import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { normalizeParagraph, type CharacterAsset } from './characterCards'
import { auditSharedNames, type SharedNameAccepted } from './sharedNameAudit'

/**
 * Names shared by two or more cards in one book, in every character package
 * (not only released ones). A kin phrase next to a mention that names someone
 * the linked card does not know fails the build: that is how "Jonathan the son
 * of Absalom" pointing at Jonathan Maccabeus would show up. Mentions with no
 * telling context are counted against a baseline that may only shrink: lower
 * the counts when a review adds evidence, and argue any increase in the diff.
 *
 *   WRITE_SHARED_NAME_BASELINE=1 npx vitest run src/services/characters/sharedCharacterNames.test.ts
 */
const DIR = 'public/data/characters'
const BASELINE = 'src/services/characters/sharedNameBaseline.json'
const accepted: Record<string, SharedNameAccepted> = JSON.parse(readFileSync('src/services/characters/sharedNameQualifiers.json', 'utf8'))
const baseline: Record<string, Record<string, number>> = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : {}

const packages = readdirSync(DIR).filter(name => name.endsWith('.json')).sort().flatMap(file => {
  const asset: CharacterAsset = JSON.parse(readFileSync(`${DIR}/${file}`, 'utf8'))
  return Object.keys(asset.editions).filter(key => existsSync(`public/data/editions/${asset.bookId}-${key}.json`)).map(key => ({ file, asset, key }))
})
const run = () => Object.fromEntries(packages.map(({ asset, key }) => {
  const source = JSON.parse(readFileSync(`public/data/editions/${asset.bookId}-${key}.json`, 'utf8')) as { chapters: { number: number; paragraphs: string[] }[] }
  const paragraphs = Object.fromEntries(source.chapters.map(c => [c.number, c.paragraphs.map(normalizeParagraph)]))
  return [`${asset.bookId}/${key}`, auditSharedNames(key, asset.editions[key], paragraphs, accepted[asset.bookId])]
}))

describe('names shared by several cards', () => {
  const reports = run()
  if (process.env.WRITE_SHARED_NAME_BASELINE) {
    const counts = Object.fromEntries(Object.entries(reports).filter(([, r]) => Object.keys(r.unresolved).length).map(([k, r]) => [k, Object.fromEntries(Object.entries(r.unresolved).sort())]))
    writeFileSync(BASELINE, JSON.stringify(counts, null, 1) + '\n')
  }

  it('reads every package against its edition text', () => {
    expect(packages.length).toBeGreaterThan(100)
    expect(Object.keys(reports)).toEqual(expect.arrayContaining(['bible/webc-en', 'hamlet/original-en']))
  })

  it('never links a name to a card its kin phrase contradicts', () => {
    const found = Object.values(reports).flatMap(r => r.contradictions)
    expect(found.map(c => `${c.key} ${c.characterId}: ${c.context}`)).toEqual([])
  })

  it('keeps unresolved shared-name mentions within the baseline (it may only shrink)', () => {
    const over: string[] = []
    const slack: string[] = []
    for (const [book, report] of Object.entries(reports)) {
      for (const [bucket, count] of Object.entries(report.unresolved)) {
        const allowed = baseline[book]?.[bucket] ?? 0
        if (count > allowed) over.push(`${book} ${bucket}: ${count} > ${allowed}`)
        if (count < allowed) slack.push(`${book} ${bucket}: ${count} < ${allowed}`)
      }
      for (const [bucket, allowed] of Object.entries(baseline[book] ?? {})) if (!(bucket in report.unresolved)) slack.push(`${book} ${bucket}: 0 < ${allowed}`)
    }
    for (const book of Object.keys(baseline)) if (!(book in reports)) slack.push(`${book}: no longer audited`)
    expect(over, 'new unresolved shared-name mentions').toEqual([])
    expect(slack, 'fewer unresolved mentions than the baseline: lower it').toEqual([])
  })
})
