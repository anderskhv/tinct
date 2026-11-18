// @vitest-environment jsdom
/** The t menu's follow request row (Anders, 16 Nov 2026): who it names, how it counts, who never shows. */
import { beforeEach, describe, expect, it } from 'vitest'
import { markRequestsSeen, menuRequest, readSeenRequests, requestDotDue, withRelation } from './followRequests'

const A = '11111111-1111-4111-8111-111111111111'
type Rel = 'followed' | 'friend' | 'follower' | 'stranger' | 'blocked'
const row = (handle: string, name: string, relation: Rel) => ({ handle, name, relation })

beforeEach(() => localStorage.clear())

describe('menuRequest', () => {
  it('names the one requester', () => {
    const found = menuRequest([row('anna', 'Anna Berg', 'followed')])
    expect(found).toEqual({ first: row('anna', 'Anna Berg', 'followed'), others: 0, line: 'Anna Berg wants to follow you' })
  })

  it('counts the others, singular and plural', () => {
    expect(menuRequest([row('anna', 'Anna', 'followed'), row('bo', 'Bo', 'followed')])?.line).toBe('Anna and 1 other want to follow you')
    expect(menuRequest([row('anna', 'Anna', 'followed'), row('bo', 'Bo', 'followed'), row('cy', 'Cy', 'followed')])?.line).toBe('Anna and 2 others want to follow you')
  })

  it('names a request this device has not shown before one it has', () => {
    const rows = [row('anna', 'Anna', 'followed'), row('bo', 'Bo', 'followed')]
    expect(menuRequest(rows, new Set(['anna']))?.first.handle).toBe('bo')
    expect(menuRequest(rows, new Set(['anna', 'bo']))?.first.handle).toBe('anna')
  })

  it('never names or counts a blocked or removed follower, a friend, or a row without a handle', () => {
    const rows = [row('blk', 'Blocked Reader', 'blocked'), row('gone', 'Removed', 'stranger'), row('fr', 'Friend', 'friend'), row('me', 'Mine', 'follower'), row('', 'No handle', 'followed'), row('anna', 'Anna', 'followed')]
    const found = menuRequest(rows)
    expect(found?.first.handle).toBe('anna')
    expect(found?.others).toBe(0)
    expect(found?.line).not.toMatch(/Blocked|Removed/)
    expect(menuRequest([row('blk', 'Blocked Reader', 'blocked'), row('gone', 'Removed', 'stranger')])).toBeNull()
    expect(menuRequest(null)).toBeNull()
  })

  it('falls back to the handle for an empty name', () => {
    expect(menuRequest([row('anna', '  ', 'followed')])?.line).toBe('anna wants to follow you')
  })
})

describe('withRelation (a follow back answered)', () => {
  it('takes the reader out of the waiting requests, so the dot does not come back', () => {
    const rows = [row('anna', 'Anna', 'followed')]
    expect(requestDotDue(A, rows)).toBe(true)
    const after = withRelation(rows, 'anna', 'friend')
    expect(after[0].relation).toBe('friend')
    expect(rows[0].relation).toBe('followed')
    expect(requestDotDue(A, after)).toBe(false)
    expect(menuRequest(after)).toBeNull()
  })

  it('marks seen as the menu does, so the next open shows no row', () => {
    const rows = [row('anna', 'Anna', 'followed'), row('bo', 'Bo', 'followed')]
    markRequestsSeen(A, rows)
    expect(readSeenRequests(A)).toEqual(new Set(['anna', 'bo']))
    expect(requestDotDue(A, rows)).toBe(false)
  })
})
