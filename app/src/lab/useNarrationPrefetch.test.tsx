// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useNarrationPrefetch, NARRATION_PREFETCH_PARAGRAPHS } from './useNarrationPrefetch'
import type { NarrationParagraphResult, NarrationParagraphState } from './labNarration'

function ready(index: number, readyChunks: number, chunkCount = 2): NarrationParagraphState {
  return {
    paragraph: index, status: readyChunks >= chunkCount ? 'ready' : readyChunks > 0 ? 'partial' : 'pending',
    textHash: `h${index}`, chunkCount, readyChunks,
    chunks: Array.from({ length: chunkCount }, (_, c) => ({ index: c, wordFrom: c * 5, wordTo: c * 5 + 5, ready: c < readyChunks })),
  }
}

function harness(overrides: Partial<Parameters<typeof useNarrationPrefetch>[0]> = {}) {
  const calls: Array<{ chapter: number; indexes: number[]; mode?: string; token?: string | null }> = []
  const progress = new Map<number, number>()
  const ensureImpl = vi.fn(async (request: { chapter: number; paragraphs: Array<{ index: number }>; mode?: 'next' | 'all' }, options?: { authToken?: string | null }) => {
    calls.push({ chapter: request.chapter, indexes: request.paragraphs.map(p => p.index), mode: request.mode, token: options?.authToken })
    // Each round lands one chunk of the first incomplete paragraph.
    const key = (index: number) => request.chapter * 100 + index
    const first = request.paragraphs.find(p => (progress.get(key(p.index)) ?? 0) < 2)
    if (first) progress.set(key(first.index), (progress.get(key(first.index)) ?? 0) + 1)
    return request.paragraphs.map(p => ready(p.index, progress.get(key(p.index)) ?? 0)) as NarrationParagraphResult[]
  })
  const base = {
    active: true, voice: 'a', bookId: 'odyssey', editionKey: 'original-en', chapter: 1, nextChapter: 2,
    paragraphCount: 32, currentParagraph: 0, authToken: 'tok', ensureImpl: ensureImpl as never,
    ...overrides,
  }
  const hook = renderHook((props: typeof base) => useNarrationPrefetch(props), { initialProps: base })
  return { ...hook, calls, ensureImpl, base }
}

afterEach(() => cleanup())

describe('useNarrationPrefetch', () => {
  it('does not warm the current chapter during silent reading', async () => {
    const h = harness()
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(h.calls.length).toBe(0)
  })

  it('warms the next chapter only when the reader nears the end, once', async () => {
    const h = harness({ currentParagraph: 10 })
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(h.calls.length).toBe(0)
    h.rerender({ ...h.base, currentParagraph: 30 })
    await waitFor(() => expect(h.calls.filter(call => call.chapter === 2).length).toBe(6))
    h.rerender({ ...h.base, currentParagraph: 31 })
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(h.calls.filter(call => call.chapter === 2).length).toBe(6)
  })

  it('does nothing when the pilot is off or no voice is known', async () => {
    const off = harness({ active: false })
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(off.calls.length).toBe(0)
    const noVoice = harness({ voice: null })
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(noVoice.calls.length).toBe(0)
  })

  it('does not call the Worker for a reader without a session token', async () => {
    const h = harness({ authToken: null, readToken: async () => null } as never)
    await new Promise(resolve => setTimeout(resolve, 30))
    expect(h.calls.length).toBe(0)
  })

  it('stops on a failure and aborts on unmount', async () => {
    const calls: number[] = []
    const failing = vi.fn(async (request: { paragraphs: Array<{ index: number }> }) => {
      calls.push(request.paragraphs.length)
      return [{ paragraph: 0, status: 'failed', reason: 'budget_exhausted' }] as NarrationParagraphResult[]
    })
    const h = harness({ currentParagraph: 31, ensureImpl: failing as never })
    await waitFor(() => expect(calls.length).toBe(1))
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(calls.length).toBe(1)
    h.unmount()
  })
})
