import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { resolveCharacter, verifyCharacters, type CharacterAsset } from './characterCards'
describe.each(['kjv-en', 'web-en'])('Revelation cleanup compatibility: %s', key => {
 it('verifies every Bible mention and retains the final Jesus reference', async () => {
  const asset: CharacterAsset = JSON.parse(readFileSync('public/data/characters/bible.v1.json', 'utf8'))
  const data = (await verifyCharacters(asset, 'bible', key, Uint8Array.from(readFileSync(`public/data/editions/bible-${key}.json`)).buffer))!
  expect(data).not.toBeNull()
  for (const m of data.edition.mentions) {
   const text = data.paragraphs[m.chapterNumber][m.paragraphIndex]
   expect(resolveCharacter(data, m.chapterNumber, m.paragraphIndex, m.startOffset, m.endOffset, text)?.card.id).toBe(m.characterId)
  }
  if (key === 'web-en') {
   expect(data.paragraphs[1189]).toHaveLength(5)
   expect(data.paragraphs[1189][4]).toBe('²¹ The grace of the Lord Jesus Christ be with all the saints. Amen.')
   expect(data.edition.mentions.filter(m => m.chapterNumber === 1189)).toHaveLength(4)
  }
 })
})
