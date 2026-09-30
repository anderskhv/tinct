import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { characterAssetPath, characterReleases, comparePoint, releasedCard, resolveCharacter } from './characterCards'
import { bibleEditions, loadBible, paragraphScoped } from './bibleTestSupport'

const sha = (data: string | Buffer) => createHash('sha256').update(data).digest('hex')
const pkg = '../books/wip/bible-characters-full/package'
const manifest = JSON.parse(readFileSync(`${pkg}/MANIFEST.json`, 'utf8'))

describe('Bible character release', () => {
  it('serves one sidecar per edition and lists all four editions', () => {
    expect(characterReleases.bible.editions).toEqual([...bibleEditions])
    expect(characterReleases.bible.perEdition).toBe(true)
    expect(characterReleases.bible.revision).toBe(manifest.contentVersion)
    expect(characterAssetPath('bible', 'bsb-en')).toBe('/data/characters/bible.v1.bsb-en.json')
    expect(characterAssetPath('hamlet', 'original-en')).toBe('/data/characters/hamlet.v1.json')
  })

  it('keeps the canonical package intact and every sidecar a byte-exact slice of it', () => {
    expect(sha(readFileSync(`${pkg}/bible.v1.json`))).toBe(manifest.sha256)
    for (const key of bibleEditions) {
      const text = readFileSync(`public${characterAssetPath('bible', key)}`, 'utf8')
      const head = `"editions":{"${key}":`
      const from = text.indexOf(head)
      expect(from).toBeGreaterThan(0)
      expect(text.endsWith('}}\n')).toBe(true)
      // The slice is compared as raw text, so integer-like keys keep their package order.
      expect(sha(text.slice(from + head.length, -3))).toBe(manifest.editionSlices.sha256[key])
      expect(JSON.parse(text).editions[key].sourceSha256).toBe(manifest.perEdition[key].sourceSha256)
    }
  })
})

describe.each(bibleEditions)('Bible cards: %s', key => {
  it('opens the one god-the-lord card from God, LORD and Yahweh, with no later reveal', async () => {
    const data = await loadBible(key)
    const gods = data.edition.mentions.filter(m => m.characterId === 'god-the-lord')
    expect(gods.length).toBeGreaterThan(10000)
    expect(new Set(gods.map(m => m.text))).toContain(key === 'web-en' ? 'Yahweh' : 'LORD')
    const first = gods[0]
    expect(first).toMatchObject({ chapterNumber: 1, paragraphIndex: 0 })
    const selection = resolveCharacter(data, 1, 0, first.startOffset, first.endOffset, data.paragraphs[1][0])!
    expect(selection.card).toMatchObject({ id: 'god-the-lord', kind: 'deity', name: 'God', subtitle: 'The LORD' })
    expect(selection.card.body).not.toMatch(/Father of Jesus|Sinai|Abram/i)
    expect(selection.gallery.map(entry => entry.card.id)).toEqual(['god-the-lord'])
  })

  it('picks the narrowest containing mention when a name sits inside a longer one', async () => {
    const data = await loadBible(key)
    const scoped = paragraphScoped(data)
    let pairs = 0
    for (const inner of data.edition.mentions) {
      if (inner.characterId !== 'god-the-lord') continue
      const outer = scoped(inner.chapterNumber, inner.paragraphIndex).edition.mentions.find(o => o !== inner
        && o.startOffset <= inner.startOffset && o.endOffset >= inner.endOffset)
      if (!outer) continue
      pairs++
      const text = data.paragraphs[inner.chapterNumber][inner.paragraphIndex]
      const at = scoped(inner.chapterNumber, inner.paragraphIndex)
      expect(outer.characterId).toBe('the-temple')
      expect(resolveCharacter(at, inner.chapterNumber, inner.paragraphIndex, inner.startOffset, inner.endOffset, text)?.card.id).toBe('god-the-lord')
      expect(resolveCharacter(at, inner.chapterNumber, inner.paragraphIndex, outer.startOffset, outer.endOffset, text)?.card.id).toBe('the-temple')
    }
    expect(pairs).toBeGreaterThan(300)
  })

  it('never reveals a snapshot before its point, for every card and a sweep of mentions', { timeout: 300_000 }, async () => {
    const data = await loadBible(key)
    const scoped = paragraphScoped(data)
    for (const character of data.edition.characters) {
      // A card exists from the start of its earliest link, and its first snapshot is that moment.
      const earliest = data.edition.mentions.filter(m => m.characterId === character.id)
        .map(m => ({ chapterNumber: m.chapterNumber, paragraphIndex: m.paragraphIndex, offset: m.startOffset })).sort(comparePoint)[0]
      expect(character.firstMention, character.id).toEqual(earliest)
      expect(character.snapshots[0].availableAt, character.id).toEqual(character.firstMention)
      expect(releasedCard(data.edition, character.id, { ...character.firstMention, offset: character.firstMention.offset - 1 })).toBeNull()
      for (const snapshot of character.snapshots) {
        const at = snapshot.availableAt
        expect(releasedCard(data.edition, character.id, at)?.body).toBe(snapshot.body)
        const earlier = character.snapshots.filter(s => comparePoint(s.availableAt, at) < 0).at(-1)
        expect(releasedCard(data.edition, character.id, { ...at, offset: at.offset - 1 })?.body).toBe(earlier?.body)
      }
    }
    const characters = new Map(data.edition.characters.map(c => [c.id, c]))
    data.edition.mentions.forEach((m, index) => {
      // The full gallery build per link is the slow part, so sweep every 9th link.
      if (index % 9) return
      const text = data.paragraphs[m.chapterNumber][m.paragraphIndex]
      const selection = resolveCharacter(scoped(m.chapterNumber, m.paragraphIndex), m.chapterNumber, m.paragraphIndex, m.startOffset, m.endOffset, text)!
      const expected = characters.get(m.characterId)!.snapshots.filter(s => comparePoint(s.availableAt, selection.cutoff) <= 0).at(-1)!
      expect(selection.card.body).toBe(expected.body)
      for (const { card } of selection.gallery) expect(comparePoint(characters.get(card.id)!.firstMention, selection.cutoff)).toBeLessThanOrEqual(0)
    })
  })

  it('has the new kinds, each with a complete card', async () => {
    const data = await loadBible(key)
    const kinds = new Set(data.edition.characters.map(c => c.kind))
    for (const kind of ['deity', 'object', 'personification', 'people']) expect(kinds).toContain(kind)
    for (const c of data.edition.characters) {
      const last = releasedCard(data.edition, c.id, { chapterNumber: 9999, paragraphIndex: 0, offset: 0 })!
      expect(Boolean(last.name && last.subtitle && last.body), c.id).toBe(true)
    }
  })
})

it('adds the 46 Catholic-only cards to webc-en only', async () => {
  const [kjv, webc] = await Promise.all([loadBible('kjv-en'), loadBible('webc-en')])
  const kjvIds = new Set(kjv.edition.characters.map(c => c.id))
  expect(webc.edition.characters.filter(c => !kjvIds.has(c.id))).toHaveLength(46)
  expect(kjv.edition.characters.some(c => c.id === 'israel-the-people')).toBe(true)
})
