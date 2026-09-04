// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { chapterHearingPages } from '../lab/labHearing'
import { READING_MEMORY_DEVICE_KEY, READING_MEMORY_QUEUE_KEY, deviceReadingMemoryQueue, readDeviceReadingMemory } from './deviceStore'
import { platoDialogueFixture } from './fixtures.test-helpers'
import { latestReadingSession } from './sessions'
import { useLabReadingMemory, type LabReadingMemoryInput } from './useLabReadingMemory'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

function inputFor(patch: Partial<LabReadingMemoryInput> = {}): LabReadingMemoryInput {
  const fixture = platoDialogueFixture()
  return {
    bookId: fixture.bookId,
    editionKey: fixture.editionKey,
    chapterNumber: fixture.chapterNumber,
    chapterLabel: fixture.chapterLabel,
    paragraphs: fixture.paragraphs,
    pageIndex: 0,
    pages: chapterHearingPages(fixture.paragraphs, null),
    pagesSettled: true,
    ready: true,
    pageTurnDirection: null,
    finishedChapters: new Set<number>(),
    userId: null,
    ...patch,
  }
}

describe('useLabReadingMemory (reader observer)', () => {
  it('signed out: records to the device only and never queues a cloud write', () => {
    const { rerender } = renderHook((props: LabReadingMemoryInput) => useLabReadingMemory(props), { initialProps: inputFor() })
    const session = latestReadingSession(readDeviceReadingMemory())
    expect(session?.state).toBe('started')
    expect(session?.anchor.chapterLabel).toBe('Book I')
    expect(localStorage.getItem(READING_MEMORY_QUEUE_KEY)).toBeNull()
    rerender(inputFor({ ready: false }))
    expect(deviceReadingMemoryQueue().pending()).toEqual([])
  })

  it('signed in: the same observation is queued for the versioned cloud commit', () => {
    renderHook((props: LabReadingMemoryInput) => useLabReadingMemory(props), { initialProps: inputFor({ userId: 'user-1' }) })
    const pending = deviceReadingMemoryQueue().pending()
    expect(pending).toHaveLength(1)
    expect(pending[0].seq).toBe(1)
    expect(pending[0].session.anchor.bookId).toBe('plato-republic')
    expect(localStorage.getItem(READING_MEMORY_DEVICE_KEY)).not.toBeNull()
  })

  it('does not record while pages are unsettled or a cover is up, and never completes from a visit', () => {
    const { rerender } = renderHook((props: LabReadingMemoryInput) => useLabReadingMemory(props), { initialProps: inputFor({ pagesSettled: false }) })
    expect(latestReadingSession(readDeviceReadingMemory())).toBeNull()
    rerender(inputFor({ ready: false }))
    expect(latestReadingSession(readDeviceReadingMemory())).toBeNull()
    rerender(inputFor())
    const session = latestReadingSession(readDeviceReadingMemory())
    expect(session?.state).toBe('started')
    expect(session?.completedAt).toBeNull()
  })

  it('marks completed only on the finished-chapter transition', () => {
    const { rerender } = renderHook((props: LabReadingMemoryInput) => useLabReadingMemory(props), { initialProps: inputFor() })
    act(() => rerender(inputFor({ finishedChapters: new Set([1]) })))
    const session = latestReadingSession(readDeviceReadingMemory())
    expect(session?.state).toBe('completed')
    expect(typeof session?.completedAt).toBe('number')
  })

  it('a chapter already in the finished set at mount is not treated as completed', () => {
    renderHook((props: LabReadingMemoryInput) => useLabReadingMemory(props), { initialProps: inputFor({ finishedChapters: new Set([1]) }) })
    const session = latestReadingSession(readDeviceReadingMemory())
    expect(session?.state).toBe('started')
    expect(session?.completedAt).toBeNull()
  })

  it('closes the session on pagehide with a real timestamp', () => {
    renderHook((props: LabReadingMemoryInput) => useLabReadingMemory(props), { initialProps: inputFor() })
    act(() => { window.dispatchEvent(new Event('pagehide')) })
    const session = latestReadingSession(readDeviceReadingMemory())
    expect(typeof session?.endedAt).toBe('number')
    expect(session!.endedAt! >= session!.startedAt).toBe(true)
  })
})
