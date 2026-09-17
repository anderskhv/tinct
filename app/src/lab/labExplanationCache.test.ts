// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest'
import { cachedExplanation, explanationCacheKey, rememberExplanation } from './labExplanationCache'
beforeEach(() => { localStorage.clear(); vi.useRealTimers() })
it('reuses only the same context and account', async () => {
 const key = await explanationCacheKey(['book', 'edition', 'passage'])
 rememberExplanation('alice', key, 'Answer')
 expect(cachedExplanation('alice', key)).toBe('Answer')
 expect(cachedExplanation('bob', key)).toBeUndefined()
 expect(cachedExplanation('alice', await explanationCacheKey(['book', 'other edition', 'passage']))).toBeUndefined()
 expect(cachedExplanation('alice', await explanationCacheKey(['book', 'edition', 'overlapping passage']))).toBeUndefined()
})
it('expires old entries and bounds storage', () => {
 vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-17'))
 for (let i=0; i<40; i++) rememberExplanation(null, String(i), 'Answer')
 expect(cachedExplanation(null, '0')).toBeUndefined()
 expect(cachedExplanation(null, '39')).toBe('Answer')
 vi.advanceTimersByTime(8*24*60*60*1000)
 expect(cachedExplanation(null, '39')).toBeUndefined()
})
