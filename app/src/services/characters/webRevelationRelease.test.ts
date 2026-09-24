import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { resolveCharacter, verifyCharacters, type CharacterAsset } from './characterCards'
describe.each(['kjv-en', 'web-en'])('Revelation cleanup compatibility: %s', key => {
 it('preserves Bible resolution, including existing ambiguous names, and the final Jesus reference', async () => {
  const asset: CharacterAsset = JSON.parse(readFileSync('public/data/characters/bible.v1.json', 'utf8'))
  const data = (await verifyCharacters(asset, 'bible', key, Uint8Array.from(readFileSync(`public/data/editions/bible-${key}.json`)).buffer))!
  expect(data).not.toBeNull()
  // These five conflicting names already exist in pinned main c9ff3d7.
  // Keep the resolver's safe null result; this trailer cleanup changes no identities.
  const ambiguous = new Set((key === 'kjv-en'
   ? [[975,3,39,43],[983,7,364,368],[1019,2,480,485],[1039,3,276,281],[931,0,64,69]]
   : [[975,3,40,44],[983,7,355,359],[1019,2,481,486],[1039,3,246,251],[931,0,63,68]]
  ).map(span => span.join('.')))
  let ambiguousMentions = 0
  for (const m of data.edition.mentions) {
   const text = data.paragraphs[m.chapterNumber][m.paragraphIndex]
   const result = resolveCharacter(data, m.chapterNumber, m.paragraphIndex, m.startOffset, m.endOffset, text)
   if (ambiguous.has([m.chapterNumber,m.paragraphIndex,m.startOffset,m.endOffset].join('.'))) {
    expect(result).toBeNull()
    ambiguousMentions++
   } else expect(result?.card.id, JSON.stringify(m)).toBe(m.characterId)
  }
  expect(ambiguousMentions).toBe(10)
  if (key === 'web-en') {
   expect(data.paragraphs[1189]).toHaveLength(5)
   expect(data.paragraphs[1189][4]).toBe('²¹ The grace of the Lord Jesus Christ be with all the saints. Amen.')
   expect(data.edition.mentions.filter(m => m.chapterNumber === 1189)).toHaveLength(4)
  }
 })
})
