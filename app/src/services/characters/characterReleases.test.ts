import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { characterReleases, verifyCharacters, type CharacterAsset } from './characterCards'

/**
 * Every released package must verify against the edition bytes the app serves,
 * the way the reader verifies it at runtime. A package whose source hash or
 * paragraph hashes drift from the published edition fails closed in the reader
 * (no cards) — this test turns that silent failure into a red build.
 */
describe.each(Object.entries(characterReleases))('%s', (bookId, release) => {
  const asset: CharacterAsset = JSON.parse(readFileSync(`public/data/characters/${bookId}.v1.json`, 'utf8'))

  it('is the package for this book', () => {
    expect(asset.bookId).toBe(bookId)
    expect(Object.keys(asset.editions).sort()).toEqual(expect.arrayContaining([...release.editions].sort()))
  })

  it.each(release.editions)('verifies against the served %s edition and binds at least one mention', async editionKey => {
    const raw = readFileSync(`public/data/editions/${bookId}-${editionKey}.json`)
    const data = await verifyCharacters(asset, bookId, editionKey, Uint8Array.from(raw).buffer)
    expect(data).not.toBeNull()
    expect(data!.edition.characters.length).toBeGreaterThan(0)
    expect(data!.edition.mentions.length).toBeGreaterThan(0)
  })
})
