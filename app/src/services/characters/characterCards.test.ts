import { beforeAll, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { loadCharacters, comparePoint, releasedCard, resolveCharacter, verifyCharacters, wordSelectionOffsets, type CharacterAsset, type VerifiedCharacters } from './characterCards'
const asset: CharacterAsset = JSON.parse(readFileSync('public/data/characters/the-awakening.v1.json', 'utf8'))
const verified: Record<string, VerifiedCharacters> = {}
beforeAll(async () => {
  for (const key of ['original-en', 'modern-en']) {
    const raw = readFileSync(`public/data/editions/the-awakening-${key}.json`)
    verified[key] = (await verifyCharacters(asset, 'the-awakening', key, Uint8Array.from(raw).buffer))!
    expect(verified[key]).not.toBeNull()
  }
})
describe.each(['original-en', 'modern-en'])('%s', key => {
  it('resolves all reviewed spans, preserves highlights and rejects changed text', () => {
    const data = verified[key]
    for (const m of data.edition.mentions) {
      const text = data.paragraphs[m.chapterNumber][m.paragraphIndex]
      const args = [data, m.chapterNumber, m.paragraphIndex, m.startOffset, m.endOffset, text] as const
      expect(resolveCharacter(...args)?.card.id).toBe(m.characterId)
      expect(resolveCharacter(...args, true)).toBeNull()
      expect(resolveCharacter(data, m.chapterNumber, m.paragraphIndex, m.startOffset, m.endOffset, text + ' changed')).toBeNull()
    }
  })
  it('releases snapshots precisely at their own boundary, including earlier return and role gates', () => {
    const { edition } = verified[key]
    for (const c of edition.characters) {
      for (const s of c.snapshots) {
        const at = s.availableAt
        const latest = c.snapshots.filter(s => comparePoint(s.availableAt, at) <= 0).slice(-1)[0]!
        expect(releasedCard(edition, c.id, at)?.body).toBe(latest.body)
        const prior = c.snapshots.filter(s => comparePoint(s.availableAt, at) < 0).slice(-1)[0]
        expect(releasedCard(edition, c.id, { ...at, offset: at.offset - 1 })?.body).toBe(prior?.body)
      }
      const first = releasedCard(edition, c.id, c.firstMention)
      releasedCard(edition, c.id, { chapterNumber: 39, paragraphIndex: 999, offset: 999 })
      expect(releasedCard(edition, c.id, c.firstMention)).toEqual(first)
    }
    const arobin = edition.characters.find(c => c.id === 'arobin')!
    expect(releasedCard(edition, 'arobin', arobin.firstMention)?.role).toBeNull()
    expect(releasedCard(edition, 'arobin', arobin.roleVisibleAt)?.role).toBe('major')
  })
  it('handles nested relationships, token selections, and ambiguous crossings', () => {
    const data = verified[key]
    for (const id of ['edna', 'leonce', 'sylvano', 'sylvano-wife', 'celina', 'celina-husband', 'philomel', 'philomel-mother']) {
      const m = data.edition.mentions.find(m => m.characterId === id)!
      expect(resolveCharacter(data, m.chapterNumber, m.paragraphIndex, m.startOffset, m.endOffset, data.paragraphs[m.chapterNumber][m.paragraphIndex])?.card.id).toBe(id)
    }
    const m = data.edition.mentions.find(m => m.characterId === 'leonce')!
    const text = data.paragraphs[m.chapterNumber][m.paragraphIndex]
    expect(resolveCharacter(data, m.chapterNumber, m.paragraphIndex, m.endOffset - 10, m.endOffset, text)?.card.id).toBe('leonce')
    expect(resolveCharacter(data, m.chapterNumber, m.paragraphIndex, m.startOffset, text.length, text)).toBeNull()
    const ambiguous = { ...data, edition: { ...data.edition, mentions: [...data.edition.mentions, { ...m, characterId: 'edna' }] } }
    expect(resolveCharacter(ambiguous, m.chapterNumber, m.paragraphIndex, m.startOffset, m.endOffset, text)).toBeNull()
  })
  it('gallery carries only released fields and passage relevance', () => {
    const data = verified[key], m = data.edition.mentions[0]
    const result = resolveCharacter(data, m.chapterNumber, m.paragraphIndex, m.startOffset, m.endOffset, data.paragraphs[m.chapterNumber][m.paragraphIndex])!
    expect(result.cutoff.offset).toBe(m.endOffset)
    expect(result.gallery.some(e => e.card.id === 'arobin')).toBe(false)
    for (const entry of result.gallery) expect(Object.keys(entry.card).sort()).toEqual(['id','kind','role','name','subtitle','body'].sort())
    expect(result.gallery.find(e => e.card.id === m.characterId)?.inPassage).toBe(true)
  })
})
it('rejects stale source/hash, unsupported schema/edition/book, and preserves modern omission', async () => {
  const raw = Uint8Array.from(readFileSync('public/data/editions/the-awakening-original-en.json')).buffer
  expect(await verifyCharacters(asset, 'the-awakening', 'modern-da', raw)).toBeNull()
  expect(await verifyCharacters(asset, 'odyssey', 'original-en', raw)).toBeNull()
  expect(await verifyCharacters({ ...asset, normalization: 'other' }, 'the-awakening', 'original-en', raw)).toBeNull()
  expect(await verifyCharacters(asset, 'the-awakening', 'original-en', new TextEncoder().encode('{}').buffer)).toBeNull()
  const changed = structuredClone(asset); changed.editions['original-en'].paragraphHashes['1'][0] = 'changed'
  expect(await verifyCharacters(changed, 'the-awakening', 'original-en', raw)).toBeNull()
  expect(verified['modern-en'].edition.characters.some(c => c.id === 'holy-ghost')).toBe(false)
})
it('maps punctuation and UTF16 word anchors without surname search', () => {
  const text = '😀 Mrs. Pontellier, and Mrs. Pontellier.'
  expect(wordSelectionOffsets(text, 2, 3)).toEqual([8, 18])
  expect(wordSelectionOffsets(text, 5, 6)).toEqual([29, 39])
  expect(wordSelectionOffsets(text, 8, 9)).toBeNull()
  expect(wordSelectionOffsets('Mrs. Pontellier’s.', 0, 2)).toEqual([0, 15])
  expect(wordSelectionOffsets('Sylvano’s wife', 0, 2)).toEqual([0, 14])
})

it('requests the current content revision instead of an immutable old URL', async () => {
  const fetcher = vi.fn(async (url: string) => url.includes('/characters/')
    ? { ok: true, json: async () => asset }
    : { ok: true, arrayBuffer: async () => Uint8Array.from(readFileSync('public/data/editions/the-awakening-original-en.json')).buffer })
  vi.stubGlobal('fetch', fetcher)
  try {
    expect(await loadCharacters('the-awakening', 'original-en')).not.toBeNull()
    const url = new URL(fetcher.mock.calls[0][0], 'https://tinct.app')
    expect(url.searchParams.get('v')).toBe(asset.contentVersion)
  } finally { vi.unstubAllGlobals() }
})

describe.each(['kjv-en', 'web-en', 'modern-en'])('Bible Baruch %s', key => {
  it('resolves Jeremiah 45, excludes other Baruchs and preserves explicit highlights', async () => {
    const bible = JSON.parse(readFileSync('public/data/characters/bible.v1.json', 'utf8'))
    const raw = readFileSync(`public/data/editions/bible-${key}.json`)
    const data = (await verifyCharacters(bible, 'bible', key, Uint8Array.from(raw).buffer))!
    expect(data).not.toBeNull()
    const mention = data.edition.mentions.find(m => m.chapterNumber === 790)!
    const text = data.paragraphs[790][mention.paragraphIndex]
    const args = [data, 790, mention.paragraphIndex, mention.startOffset, mention.endOffset, text] as const
    expect(resolveCharacter(...args)?.card.subtitle).toContain('Jeremiah’s scribe')
    expect(resolveCharacter(...args, true)).toBeNull()
    expect(data.edition.mentions.every(m => m.chapterNumber >= 746 && m.chapterNumber <= 797)).toBe(true)
    for (const m of data.edition.mentions) expect(resolveCharacter(data, m.chapterNumber, m.paragraphIndex, m.startOffset, m.endOffset, data.paragraphs[m.chapterNumber][m.paragraphIndex])?.card.id).toBe('baruch-neriah')
  })
})

describe.each(['original-en', 'modern-en'])('Hamlet runtime %s', key => {
  it('verifies every mention and releases only passage-appropriate identity', async () => {
    const asset = JSON.parse(readFileSync('public/data/characters/hamlet.v1.json', 'utf8'))
    const raw = readFileSync(`public/data/editions/hamlet-${key}.json`)
    const data = (await verifyCharacters(asset, 'hamlet', key, Uint8Array.from(raw).buffer))!
    expect(data).not.toBeNull()
    for (const m of data.edition.mentions) {
      const text = data.paragraphs[m.chapterNumber][m.paragraphIndex]
      expect(resolveCharacter(data, m.chapterNumber, m.paragraphIndex, m.startOffset, m.endOffset, text)?.card.id).toBe(m.characterId)
      expect(resolveCharacter(data, m.chapterNumber, m.paragraphIndex, m.startOffset, m.endOffset, text, true)).toBeNull()
    }
    for (const character of data.edition.characters) {
      for (const snapshot of character.snapshots) {
        const at = snapshot.availableAt
        expect(releasedCard(data.edition, character.id, at)?.body).toBe(snapshot.body)
        const earlier = character.snapshots.filter(s => comparePoint(s.availableAt, at) < 0).at(-1)
        expect(releasedCard(data.edition, character.id, { ...at, offset: at.offset - 1 })?.body).toBe(earlier?.body)
      }
    }
    const father = data.edition.mentions.filter(m => m.chapterNumber === 1 && m.paragraphIndex === 52 && m.text === 'Hamlet')
    expect(father.length).toBeGreaterThan(0)
    expect(father.every(m => m.characterId === 'king-hamlet')).toBe(true)
  })
})

describe.each(['original-en', 'modern-en'])('Macbeth runtime %s', key => {
  it('verifies every mention and releases only passage-appropriate identity', async () => {
    const asset = JSON.parse(readFileSync('public/data/characters/macbeth.v1.json', 'utf8'))
    const raw = readFileSync(`public/data/editions/macbeth-${key}.json`)
    const data = (await verifyCharacters(asset, 'macbeth', key, Uint8Array.from(raw).buffer))!
    expect(data).not.toBeNull()
    for (const m of data.edition.mentions) {
      const text = data.paragraphs[m.chapterNumber][m.paragraphIndex]
      expect(resolveCharacter(data, m.chapterNumber, m.paragraphIndex, m.startOffset, m.endOffset, text)?.card.id).toBe(m.characterId)
      expect(resolveCharacter(data, m.chapterNumber, m.paragraphIndex, m.startOffset, m.endOffset, text, true)).toBeNull()
    }
    for (const character of data.edition.characters) {
      for (const snapshot of character.snapshots) {
        const at = snapshot.availableAt
        expect(releasedCard(data.edition, character.id, at)?.body).toBe(snapshot.body)
        const earlier = character.snapshots.filter(s => comparePoint(s.availableAt, at) < 0).at(-1)
        expect(releasedCard(data.edition, character.id, { ...at, offset: at.offset - 1 })?.body).toBe(earlier?.body)
      }
    }
  })
})

describe.each(['crito', 'apology', 'the-manual', 'the-art-of-war'])('complete reviewed package %s', bookId => {
  it.each(['original-en', 'modern-en'])('validates every paragraph and mention in %s, with release boundaries', async editionKey => {
    const asset: CharacterAsset = JSON.parse(readFileSync(`public/data/characters/${bookId}.v1.json`, 'utf8'))
    const raw = Uint8Array.from(readFileSync(`public/data/editions/${bookId}-${editionKey}.json`)).buffer
    const data = (await verifyCharacters(asset, bookId, editionKey, raw))!
    expect(data).not.toBeNull()
    for (const mention of data.edition.mentions) {
      const text = data.paragraphs[mention.chapterNumber][mention.paragraphIndex]
      expect(resolveCharacter(data, mention.chapterNumber, mention.paragraphIndex, mention.startOffset, mention.endOffset, text)?.card.id).toBe(mention.characterId)
      expect(resolveCharacter(data, mention.chapterNumber, mention.paragraphIndex, mention.startOffset, mention.endOffset, text, true)).toBeNull()
    }
    for (const character of data.edition.characters) {
      expect(releasedCard(data.edition, character.id, { ...character.firstMention, offset: character.firstMention.offset - 1 })).toBeNull()
      const first = releasedCard(data.edition, character.id, character.firstMention)
      releasedCard(data.edition, character.id, { chapterNumber: 9999, paragraphIndex: 9999, offset: 9999 })
      expect(releasedCard(data.edition, character.id, character.firstMention)).toEqual(first)
    }
  })
})
