import { expect, it } from 'vitest'
import { primerPassageIndex, resolveBookPrimerPassage } from './passage'
const request = { bookId: 'frank', editionKey: 'original-en', chapterNumber: 1 }
const current = { ...request, paragraphs: ['First paragraph.', '<p>Dear  reader</p>'] }
const quote = { passageId: 'chapter-1:paragraph-1', text: 'Dear reader' }
it('resolves the quoted paragraph using the same text normalization as the source route', () => {
  expect(primerPassageIndex(request, current, quote)).toBe(1)
})
it('refuses stale book, edition, chapter, changed text and invalid passage addresses', () => {
  for (const change of [{ bookId: 'other' }, { editionKey: 'modern-en' }, { chapterNumber: 2 }, { paragraphs: ['Other text.'] }]) {
    expect(primerPassageIndex(request, { ...current, ...change }, quote)).toBeNull()
  }
  for (const passageId of ['chapter-2:paragraph-1', 'chapter-1:paragraph-99', 'chapter-1:paragraph--1', '1', 'chapter-1:paragraph-1junk']) {
    expect(primerPassageIndex(request, current, { ...quote, passageId })).toBeNull()
  }
  expect(primerPassageIndex(request, current, { ...quote, text: 'Invented' })).toBeNull()
})

it('resolves a whole-book quote in another chapter', async () => {
  expect(await resolveBookPrimerPassage(request, { passageId: 'chapter-2:paragraph-1', text: 'Dear reader' }, async () => current, () => true)).toEqual({ chapterNumber: 2, paragraphIndex: 1, wordIndex: 0 })
})
it('rejects stale loads, changed quotes, unavailable sources and invalid IDs', async () => {
  let active = true
  expect(await resolveBookPrimerPassage(request, quote, async () => { active = false; return current }, () => active)).toBeNull()
  for (const source of [null, { paragraphs: ['Changed text'] }]) expect(await resolveBookPrimerPassage(request, quote, async () => source, () => true)).toBeNull()
  expect(await resolveBookPrimerPassage(request, quote, async () => { throw new Error('unavailable') }, () => true)).toBeNull()
  for (const passageId of ['chapter-0:paragraph-1', 'chapter-9007199254740992:paragraph-1', 'chapter-2:paragraph-99', 'bad']) expect(await resolveBookPrimerPassage(request, { ...quote, passageId }, async () => current, () => true)).toBeNull()
})
