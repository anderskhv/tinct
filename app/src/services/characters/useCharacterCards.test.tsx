// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useCharacterCards } from './useCharacterCards'
import { loadCharacters, type VerifiedCharacters } from './characterCards'
vi.mock('./characterCards', () => ({ loadCharacters: vi.fn() }))
afterEach(() => { cleanup(); vi.resetAllMocks() })
it('rejects a late preload after switching book and never carries the old edition', async () => {
  let release!: (data: VerifiedCharacters) => void
  vi.mocked(loadCharacters).mockImplementation(book => book === 'the-awakening' ? new Promise(resolve => { release = resolve }) : Promise.resolve(null))
  const hook = renderHook(({ book, edition }) => useCharacterCards(book, edition), { initialProps: { book: 'the-awakening', edition: 'original-en' } })
  expect(hook.result.current).toBeNull()
  hook.rerender({ book: 'odyssey', edition: 'original-en' })
  await act(async () => { release({ edition: {} as VerifiedCharacters['edition'], paragraphs: {} }) })
  expect(hook.result.current).toBeNull()
})
it('immediately hides old edition data before the next effect completes', async () => {
  const data = { edition: {} as VerifiedCharacters['edition'], paragraphs: {} }
  vi.mocked(loadCharacters).mockResolvedValue(data)
  const hook = renderHook(({ edition }) => useCharacterCards('the-awakening', edition), { initialProps: { edition: 'original-en' } })
  await act(async () => {})
  expect(hook.result.current).toBe(data)
  vi.mocked(loadCharacters).mockImplementation(() => new Promise(() => {}))
  hook.rerender({ edition: 'modern-en' })
  expect(hook.result.current).toBeNull()
})
