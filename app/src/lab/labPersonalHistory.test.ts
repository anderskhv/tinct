// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest'
import { personalHistoryEvidence, requestsPersonalHistory } from './labPersonalHistory'
vi.mock('../data/editionLoader', () => ({ loadEditionChapterList: async () => [{ number: 777, title: 'Jeremiah 32' }] }))
beforeEach(() => localStorage.clear())
it('only requests personal evidence for personal recall', () => {
 expect(requestsPersonalHistory('Have I read Jeremiah?')).toBe(true)
 expect(requestsPersonalHistory('What did we discuss in other books about suffering?')).toBe(true)
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
