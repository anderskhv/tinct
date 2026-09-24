import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { releasedCard, resolveCharacter, verifyCharacters, type CharacterAsset } from './characterCards'
const asset: CharacterAsset = JSON.parse(readFileSync('public/data/characters/crime-and-punishment.v1.json', 'utf8'))
describe.each(['original-en', 'modern-en'])('Crime spoiler boundaries: %s', key => {
  it('keeps every accepted identity and releases only claims known at the selected passage', async () => {
    const raw = Uint8Array.from(readFileSync(`public/data/editions/crime-and-punishment-${key}.json`)).buffer
    const data = (await verifyCharacters(asset, 'crime-and-punishment', key, raw))!
    expect(data).not.toBeNull()
    if (key === 'modern-en') expect(data.edition.mentions).toHaveLength(3663)
    for (const m of data.edition.mentions) {
      const text = data.paragraphs[m.chapterNumber][m.paragraphIndex]
      expect(resolveCharacter(data, m.chapterNumber, m.paragraphIndex, m.startOffset, m.endOffset, text)?.card.id).toBe(m.characterId)
      expect(resolveCharacter(data, m.chapterNumber, m.paragraphIndex, m.startOffset, m.endOffset, text, true)).toBeNull()
    }
    const nameEnd = key === 'original-en' ? 2855 : 2536
    const letterEnd = key === 'original-en' ? 15515 : 13789
    const first = { chapterNumber: 3, paragraphIndex: 38, offset: nameEnd }
    const body = (point: typeof first) => releasedCard(data.edition, 'svidrigailov', point)?.body
    const early = "Dunya worked as a governess in his household, where she had a hard time."
    const pursuit = "Unsettling, he pursued Dunya while she worked in his household."
    expect(body(first)).toBe(early)
    expect(body({ ...first, offset: letterEnd - 1 })).toBe(early)
    expect(body({ ...first, offset: letterEnd })).toBe(pursuit)
    expect(body({ chapterNumber: 22, paragraphIndex: 34, offset: 86 })).toBe(pursuit)
    const later = body({ chapterNumber: 22, paragraphIndex: 34, offset: 87 })
    expect(later).toContain('recently widowed')
    expect(later).toContain('St. Petersburg')
    expect(later).not.toContain('Wealthy')
    // Returning to an early mention must not leak a later card from reader history.
    expect(body(first)).toBe(early)
    const mention = data.edition.mentions.find(m => m.characterId === 'svidrigailov' && m.chapterNumber === 3 && m.paragraphIndex === 38 && m.endOffset === nameEnd)!
    expect(mention).toBeDefined()
    expect(resolveCharacter(data, 3, 38, mention.startOffset, mention.endOffset, data.paragraphs[3][38])?.card.body).toBe(early)
  })
})
