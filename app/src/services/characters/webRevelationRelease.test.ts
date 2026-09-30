import { describe, expect, it } from 'vitest'
import { resolveCharacter } from './characterCards'
import { bibleEditions, loadBible, paragraphScoped } from './bibleTestSupport'

describe.each(bibleEditions)('Bible character links resolve one-to-one: %s', key => {
 it('resolves every mention to its own card, with no ambiguous or overlapping spans, and keeps the final Jesus reference', async () => {
  const data = await loadBible(key)
  const scoped = paragraphScoped(data)
  let ambiguousMentions = 0
  for (const m of data.edition.mentions) {
   const text = data.paragraphs[m.chapterNumber][m.paragraphIndex]
   // Whole-Bible sweep: the resolver must return the mention's own card. Since the
   // 2026-09-30 package no span is identical to another (the old five conflicting
   // Luke/Acts/Matthew spans are single, correct cards), so nothing may resolve to null.
   const result = resolveCharacter(scoped(m.chapterNumber, m.paragraphIndex), m.chapterNumber, m.paragraphIndex, m.startOffset, m.endOffset, text)
   if (result?.card.id !== m.characterId) { ambiguousMentions++; expect(result?.card.id, JSON.stringify(m)).toBe(m.characterId) }
  }
  expect(ambiguousMentions).toBe(0)
  if (key === 'web-en') {
   expect(data.paragraphs[1189][4]).toBe('²¹ The grace of the Lord Jesus Christ be with all the saints. Amen.')
   const last = data.edition.mentions.filter(m => m.chapterNumber === 1189)
   expect(data.paragraphs[1189]).toHaveLength(5)
   expect(last).toHaveLength(15)
   expect(last.filter(m => m.characterId === 'god-the-lord')).toHaveLength(7)
   expect(last.filter(m => m.paragraphIndex === 4).map(m => [m.characterId, m.text])).toEqual([['jesus', 'Jesus'], ['jesus', 'Christ']])
  }
 }, 300_000)
})
