import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { characterAssetPath, characterReleases, verifyCharacters, type CharacterAsset } from './characterCards'

/**
 * Every released package must verify against the edition bytes the app serves,
 * the way the reader verifies it at runtime. A package whose source hash or
 * paragraph hashes drift from the published edition fails closed in the reader
 * (no cards) — this test turns that silent failure into a red build.
 */
describe.each(Object.entries(characterReleases))('%s', (bookId, release) => {
  const load = (editionKey: string): CharacterAsset => JSON.parse(readFileSync(`public${characterAssetPath(bookId, editionKey)}`, 'utf8'))

  it.each(release.editions)('is the package for this book (%s)', editionKey => {
    const asset = load(editionKey)
    expect(asset.bookId).toBe(bookId)
    expect(Object.keys(asset.editions)).toEqual(expect.arrayContaining([editionKey]))
    // A per-edition sidecar must carry only its own edition: that is the point of splitting it.
    if (release.perEdition) expect(Object.keys(asset.editions)).toEqual([editionKey])
  })

  it.each(release.editions)('verifies against the served %s edition and binds at least one mention', async editionKey => {
    const raw = readFileSync(`public/data/editions/${bookId}-${editionKey}.json`)
    const data = await verifyCharacters(load(editionKey), bookId, editionKey, Uint8Array.from(raw).buffer)
    expect(data).not.toBeNull()
    expect(data!.edition.characters.length).toBeGreaterThan(0)
    expect(data!.edition.mentions.length).toBeGreaterThan(0)
  })
})
