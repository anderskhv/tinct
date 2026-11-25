// @vitest-environment jsdom
// A signed-out reader's five minutes of listening a day (Anders, 25 Nov 2026):
// only playback counts, the stop waits for the sentence to end, and the day
// mark sends a second Play that day straight to the sheet.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'

const funnel = vi.hoisted(() => ({ track: vi.fn() }))
vi.mock('../utils/funnel', () => ({ trackFunnel: funnel.track }))

import { useLabListenTrial, LISTEN_TRIAL_SENTENCE_GRACE_MS, type ListenTrialOptions } from './useLabListenTrial'
import { addListenTrialSeconds, LAB_LISTEN_TRIAL_KEY, listenTrialSeconds, listenTrialUsedToday, LISTEN_TRIAL_SECONDS, markListenTrialUsed } from './labListenTrial'

const START = Date.parse('2026-11-25T20:00:00Z')
const PARAGRAPHS = ['It was dark. The storm rose over the lake. We waited by the door.', 'Morning came.']

type Props = Pick<ListenTrialOptions, 'active' | 'playing' | 'follow'>

function mount(initial: Props) {
  const onEnd = vi.fn()
  const hook = renderHook((props: Props) => useLabListenTrial({ ...props, paragraphs: PARAGRAPHS, onEnd }), { initialProps: initial })
  return { onEnd, ...hook }
}

const word = (paragraphIndex: number, wordIndex: number) => ({ kind: 'word' as const, paragraphIndex, wordIndex })
const seconds = (n: number) => act(() => { vi.advanceTimersByTime(n * 1000) })

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(START)
  localStorage.clear()
  funnel.track.mockClear()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('listening trial day mark', () => {
  it('keeps today\'s seconds per UTC day, capped at five minutes, and reads a used trial', () => {
    expect(listenTrialSeconds()).toBe(0)
    expect(addListenTrialSeconds(90)).toBe(90)
    expect(addListenTrialSeconds(250)).toBe(LISTEN_TRIAL_SECONDS)
    expect(listenTrialUsedToday()).toBe(true)
    expect(JSON.parse(localStorage.getItem(LAB_LISTEN_TRIAL_KEY)!)).toEqual({ day: '2026-11-25', seconds: 300 })
    // The next UTC day is a new trial (20:00 UTC + 4 h).
    expect(listenTrialSeconds(undefined, START + 4 * 3600_000)).toBe(0)
    expect(listenTrialUsedToday(undefined, START + 4 * 3600_000)).toBe(false)
  })

  it('reads nothing from a broken or unavailable store, and never throws', () => {
    localStorage.setItem(LAB_LISTEN_TRIAL_KEY, '{not json')
    expect(listenTrialSeconds()).toBe(0)
    const throwing = { getItem: () => { throw new Error('denied') }, setItem: () => { throw new Error('denied') } }
    expect(listenTrialSeconds(throwing)).toBe(0)
    expect(() => markListenTrialUsed(throwing)).not.toThrow()
    expect(addListenTrialSeconds(10, throwing)).toBe(10)
  })
})

describe('useLabListenTrial', () => {
  it('counts actual playback only: paused, preparing or buffering time does not count', () => {
    const view = mount({ active: true, playing: true, follow: word(0, 0) })
    expect(funnel.track).toHaveBeenCalledWith('listen_trial_started', { seconds: 300 })
    seconds(60)
    view.rerender({ active: true, playing: false, follow: word(0, 0) })
    seconds(600) // the player is open but not playing
    expect(listenTrialSeconds()).toBe(60)
    view.rerender({ active: true, playing: true, follow: word(0, 0) })
    seconds(30)
    view.rerender({ active: true, playing: false, follow: word(0, 0) })
    expect(listenTrialSeconds()).toBe(90)
    expect(view.onEnd).not.toHaveBeenCalled()
    // Started once a day, not on every Play.
    expect(funnel.track.mock.calls.filter(call => call[0] === 'listen_trial_started')).toHaveLength(1)
  })

  it('at 5:00 lets the sentence being read finish, then pauses and asks for an account', () => {
    const view = mount({ active: true, playing: true, follow: word(0, 4) }) // "storm", in the second sentence
    seconds(LISTEN_TRIAL_SECONDS)
    expect(listenTrialSeconds()).toBe(LISTEN_TRIAL_SECONDS)
    expect(view.onEnd).not.toHaveBeenCalled()
    // Still inside "The storm rose over the lake."
    view.rerender({ active: true, playing: true, follow: word(0, 6) })
    expect(view.onEnd).not.toHaveBeenCalled()
    // "lake." has been read: the next word starts a new sentence.
    view.rerender({ active: true, playing: true, follow: word(0, 9) })
    expect(view.onEnd).toHaveBeenCalledTimes(1)
    expect(funnel.track).toHaveBeenCalledWith('listen_trial_ended', { seconds: 300 })
    expect(listenTrialUsedToday()).toBe(true)
  })

  it('stops at the next paragraph, or after the grace period for a sentence that never ends', () => {
    const next = mount({ active: true, playing: true, follow: word(0, 10) })
    seconds(LISTEN_TRIAL_SECONDS)
    next.rerender({ active: true, playing: true, follow: word(1, 0) })
    expect(next.onEnd).toHaveBeenCalledTimes(1)
    cleanup()
    localStorage.clear()

    const long = mount({ active: true, playing: true, follow: word(0, 4) })
    seconds(LISTEN_TRIAL_SECONDS)
    expect(long.onEnd).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(LISTEN_TRIAL_SENTENCE_GRACE_MS) })
    expect(long.onEnd).toHaveBeenCalledTimes(1)
  })

  it('ends a second Play that day at once', () => {
    markListenTrialUsed()
    const view = mount({ active: true, playing: false, follow: { kind: 'none' } })
    view.rerender({ active: true, playing: true, follow: word(0, 0) })
    expect(view.onEnd).toHaveBeenCalledTimes(1)
    expect(funnel.track).not.toHaveBeenCalledWith('listen_trial_started', expect.anything())
  })

  it('counts nothing for a signed-in reader, and calls off a pending stop on sign-in', () => {
    const signedIn = mount({ active: false, playing: true, follow: word(0, 0) })
    seconds(LISTEN_TRIAL_SECONDS + 60)
    expect(listenTrialSeconds()).toBe(0)
    expect(signedIn.onEnd).not.toHaveBeenCalled()
    cleanup()

    const guest = mount({ active: true, playing: true, follow: word(0, 4) })
    seconds(LISTEN_TRIAL_SECONDS)
    guest.rerender({ active: false, playing: true, follow: word(0, 4) })
    act(() => { vi.advanceTimersByTime(LISTEN_TRIAL_SENTENCE_GRACE_MS * 2) })
    guest.rerender({ active: false, playing: true, follow: word(0, 9) })
    expect(guest.onEnd).not.toHaveBeenCalled()
  })
})
