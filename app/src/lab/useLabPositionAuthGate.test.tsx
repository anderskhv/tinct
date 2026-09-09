// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useLabPositionSync } from './useLabPositionSync'
import { bibleFallbackSource } from './labSource'
const auth = vi.hoisted(() => ({ session: null as unknown, likelyAuthenticated: false, isLoading: true }))
vi.mock('../hooks/useAuth', () => ({ useAuth: () => auth }))
afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals() })
it('waits for account resolution even without a cached sign-in hint', async () => {
  let ready = true
  const placeRef = { current: { paragraphIndex: 0, wordIndex: 0 } }
  const book = bibleFallbackSource()
  function Reader() { ready = useLabPositionSync({ book, placeRef, sourceLocked: false, resolveBeforePaint: true }).initialPositionResolved; return null }
  const view = render(<Reader />)
  expect(ready).toBe(false)
  auth.isLoading = false
  view.rerender(<Reader />)
  await waitFor(() => expect(ready).toBe(true))
})
