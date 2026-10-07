// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest'
import { personalHistoryEvidence, requestsPersonalHistory } from './labPersonalHistory'
import { writeLabBookChat } from './labChatHistory'
vi.mock('../data/editionLoader', () => ({ loadEditionChapterList: async () => [{ number: 777, title: 'Jeremiah 32' }] }))
// The Bible manifest's chapter titles and biblical-book sections (Ezra and Nehemiah only).
vi.mock('./labSource', () => ({
 loadLabBibleOutline: async () => ({
  chapters: [...Array.from({ length: 10 }, (_, i) => ({ number: 404 + i, title: `Ezra ${i + 1}` })), ...Array.from({ length: 13 }, (_, i) => ({ number: 414 + i, title: `Nehemiah ${i + 1}` }))],
  sections: [{ title: 'Old Testament', sections: [{ title: 'Ezra', chapters: Array.from({ length: 10 }, (_, i) => 404 + i) }, { title: 'Nehemiah', chapters: Array.from({ length: 13 }, (_, i) => 414 + i) }] }],
 }),
 loadLabChapterList: async () => [],
}))
beforeEach(() => localStorage.clear())
it('only requests personal evidence for personal recall', () => {
 expect(requestsPersonalHistory('Have I read Jeremiah?')).toBe(true)
 expect(requestsPersonalHistory('What did we discuss in other books about suffering?')).toBe(true)
 expect(requestsPersonalHistory('Did I finish Nehemiah?')).toBe(true)
 expect(requestsPersonalHistory('How much of Ezra have I read?')).toBe(true)
 expect(requestsPersonalHistory('Explain Jeremiah’s view of suffering')).toBe(false)
 expect(requestsPersonalHistory('What does Keller say about this?')).toBe(false)
})
it('finds older activity across editions and labels the limits of legacy records', async () => {
 localStorage.setItem('tinct:reading-log:bible', JSON.stringify({ bookId: 'bible', chapters: { 777: { chapterNumber: 777, editions: ['kjv-en'], lastReadAt: 1000, completed: true } } }))
 const result = await personalHistoryEvidence('Have I read Jeremiah?', null)
 expect(result).toContain('Jeremiah 32')
 expect(result).toContain('kjv-en')
 expect(result).toContain('marked completed')
 expect(await personalHistoryEvidence('Have I read Moby Dick?', null)).toContain('No matching stored records')
 expect(result).toContain('No match does NOT prove')
})
it('answers coverage from the Contents records, not only the chats that mention a book', async () => {
 // Ezra 1–10 are sequential chapters 404–413 in the Bible manifest; old chats touch only Ezra 2, 8 and 10.
 const finishedAt = Date.UTC(2026, 9, 5, 12)
 localStorage.setItem('tinct-lab-position', JSON.stringify({
  books: { ezra: { bookId: 'ezra', headerBook: 'Ezra', chapterNumber: 10, sequentialChapter: 413, paragraphIndex: 0, wordIndex: 0, updatedAt: finishedAt, deviceId: 'phone', rev: 1 } },
  finished: { bible: [404, 405, 406, 407, 408, 409, 410, 411, 412, 413] },
  hidden: {}, lastSettledBookId: 'ezra', lastSettledAt: finishedAt, updatedAt: finishedAt, deviceId: 'phone', owner: null,
 }))
 writeLabBookChat('bible', [405, 411, 413].map(chapterNumber => ({
  id: `c${chapterNumber}`, bookId: 'bible', chapterNumber, startTimestamp: 1, endTimestamp: 2, preview: 'Ezra',
  messages: [{ id: `m${chapterNumber}`, role: 'user' as const, content: `About Ezra ${chapterNumber - 403}`, timestamp: 1, bookId: 'bible', chapterNumber }],
 })))
 const result = await personalHistoryEvidence('Have I read all of Ezra?', null, { openBookId: 'bible' })
 expect(result).toContain('The Bible, Ezra: Ezra 1–10 finished (all 10 chapters finished); last read 2026-10-05.')
 expect(result).toContain('a chapter without a record is unknown, not unread')
 // The keyword search over chats is still there for discussion questions.
 expect(result).toContain('Chat: bible')
})
it('lists named and open books without records, and never a private book', async () => {
 const result = await personalHistoryEvidence('Did I finish Nehemiah?', null, { openBookId: 'userbook-0123456789abcdef01234567' })
 expect(result).toContain('The Bible, Nehemiah: no chapter records (13 chapters).')
 expect(result).not.toContain('userbook-')
})
