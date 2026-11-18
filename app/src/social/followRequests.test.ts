// @vitest-environment jsdom
/** Follow requests made visible (Anders, 20 Oct 2026): which wait, which this device has shown, sign-out clears it. */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FOLLOW_REQUESTS_SEEN_EVENT, FOLLOW_REQUESTS_SEEN_KEY_PREFIX, markRequestsSeen, pendingRequests, readSeenRequests, requestDotDue, requestsLine, unseenRequests } from './followRequests'
import { clearLocalUserData } from '../services/storage'

const A = '11111111-1111-4111-8111-111111111111'
const B = '22222222-2222-4222-8222-222222222222'
const row = (handle: string, name: string, relation: 'followed' | 'friend' | 'follower' | 'stranger' | 'blocked') => ({ handle, name, relation })

beforeEach(() => localStorage.clear())

describe('pending follow requests', () => {
  it('are the readers who follow you whom you do not follow back', () => {
    const rows = [row('anna', 'Anna', 'followed'), row('bo', 'Bo', 'friend'), row('cy', 'Cy', 'followed'), row('di', 'Di', 'stranger'), row('', 'No handle', 'followed')]
    expect(pendingRequests(rows).map(r => r.handle)).toEqual(['anna', 'cy'])
    expect(pendingRequests(null)).toEqual([])
  })

  it('read as one line naming the first and counting the rest', () => {
    expect(requestsLine([row('anna', 'Anna', 'followed')])).toBe('Anna wants to be friends')
    expect(requestsLine([row('anna', 'Anna', 'followed'), row('bo', 'Bo', 'followed')])).toBe('Anna and 1 other want to be friends')
    expect(requestsLine([row('anna', 'Anna', 'followed'), row('bo', 'Bo', 'followed'), row('cy', 'Cy', 'followed')])).toBe('Anna and 2 others want to be friends')
    expect(requestsLine([row('bo', 'Bo', 'friend')])).toBeNull()
    expect(requestsLine([row('anna', ' ', 'followed')])).toBe('anna wants to be friends')
  })
})

describe('the seen state on this device', () => {
  it('starts unseen, clears once shown, and is kept per account', () => {
    const rows = [row('anna', 'Anna', 'followed'), row('bo', 'Bo', 'friend')]
    expect(requestDotDue(A, rows)).toBe(true)
    const heard = vi.fn()
    window.addEventListener(FOLLOW_REQUESTS_SEEN_EVENT, heard)
    markRequestsSeen(A, rows)
    window.removeEventListener(FOLLOW_REQUESTS_SEEN_EVENT, heard)
    expect(heard).toHaveBeenCalledTimes(1)
    expect([...readSeenRequests(A)]).toEqual(['anna'])
    expect(requestDotDue(A, rows)).toBe(false)
    // Another account on the same device has its own.
    expect(requestDotDue(B, rows)).toBe(true)
    // No account, no dot.
    expect(requestDotDue(null, rows)).toBe(false)
  })

  it('a new request brings the dot back; one that stopped asking is forgotten, so asking again is new', () => {
    markRequestsSeen(A, [row('anna', 'Anna', 'followed')])
    expect(unseenRequests([row('anna', 'Anna', 'followed'), row('cy', 'Cy', 'followed')], readSeenRequests(A)).map(r => r.handle)).toEqual(['cy'])
    markRequestsSeen(A, [row('cy', 'Cy', 'followed')])
    expect([...readSeenRequests(A)]).toEqual(['cy'])
    expect(requestDotDue(A, [row('anna', 'Anna', 'followed')])).toBe(true)
    markRequestsSeen(A, [])
    expect(localStorage.getItem(FOLLOW_REQUESTS_SEEN_KEY_PREFIX + A)).toBeNull()
  })

  it('tolerates storage that is broken or blocked', () => {
    localStorage.setItem(FOLLOW_REQUESTS_SEEN_KEY_PREFIX + A, '{not json')
    expect(readSeenRequests(A).size).toBe(0)
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    expect(() => markRequestsSeen(A, [row('anna', 'Anna', 'followed')])).not.toThrow()
    expect(requestDotDue(A, [row('anna', 'Anna', 'followed')])).toBe(true)
    get.mockRestore()
    set.mockRestore()
  })

  it('sign-out clears it with the rest of the reader data', () => {
    markRequestsSeen(A, [row('anna', 'Anna', 'followed')])
    expect(localStorage.getItem(FOLLOW_REQUESTS_SEEN_KEY_PREFIX + A)).toBe('["anna"]')
    clearLocalUserData()
    expect(localStorage.getItem(FOLLOW_REQUESTS_SEEN_KEY_PREFIX + A)).toBeNull()
  })
})
