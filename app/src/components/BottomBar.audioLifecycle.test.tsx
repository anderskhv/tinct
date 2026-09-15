// @vitest-environment jsdom
import { createRef } from 'react'
import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BottomBar, type BottomBarHandle } from './BottomBar'

class FakeAudio {
  src = ''
  preload = ''
  paused = true
  ended = false
  currentTime = 0
  duration = 20
  readyState = 4
  networkState = 1
  playbackRate = 1
  defaultPlaybackRate = 1
  preservesPitch = true
  mozPreservesPitch = true
  webkitPreservesPitch = true
  readonly NETWORK_LOADING = 2
  private listeners = new Map<string, Set<EventListenerOrEventListenerObject>>()

  addEventListener(name: string, listener: EventListenerOrEventListenerObject) {
    const listeners = this.listeners.get(name) ?? new Set<EventListenerOrEventListenerObject>()
    listeners.add(listener)
    this.listeners.set(name, listeners)
  }

  removeEventListener(name: string, listener: EventListenerOrEventListenerObject) {
    this.listeners.get(name)?.delete(listener)
  }

  play = vi.fn(async () => { this.paused = false })
  pause = vi.fn(() => { this.paused = true })
  load = vi.fn()
  removeAttribute = vi.fn((name: string) => { if (name === 'src') this.src = '' })
}

const baseProps = {
  percentComplete: 1,
  timeRemainingLabel: '1 min',
  isLearned: false,
  currentPage: 0,
  totalPages: 2,
  bookId: 'bible',
  editionKey: 'web-en',
  chapterNumber: 437,
}

describe('BottomBar audio lifecycle', () => {
  const instances: FakeAudio[] = []

  beforeEach(() => {
    instances.length = 0
    vi.stubGlobal('Audio', class {
      constructor() {
        const audio = new FakeAudio()
        instances.push(audio)
        return audio
      }
    })
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        chapter: 437,
        title: 'Job',
        paragraphs: [{ paragraph: 0, duration: 20, file: 'p0.mp3' }],
      }),
    })))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('keeps the same media element when the chapter changes', async () => {
    const ref = createRef<BottomBarHandle>()
    const view = render(<BottomBar ref={ref} {...baseProps} />)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    expect(instances).toHaveLength(1)

    view.rerender(<BottomBar ref={ref} {...baseProps} chapterNumber={438} />)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))

    expect(instances).toHaveLength(1)
  })
})
