/** Following you never lists a blocked reader or a removed follower, even from a stale answer (16 Nov 2026). */
import { describe, expect, it } from 'vitest'
import { followingYouRows } from './cardsRules'

describe('followingYouRows', () => {
  it('keeps requests and friends, in order', () => {
    const rows = [{ handle: 'a', relation: 'followed' as const }, { handle: 'b', relation: 'friend' as const }]
    expect(followingYouRows(rows).map(row => row.handle)).toEqual(['a', 'b'])
  })

  it('leaves out blocked readers, removed followers and anyone who does not follow you', () => {
    const rows = [
      { handle: 'blk', relation: 'blocked' as const },
      { handle: 'gone', relation: 'stranger' as const },
      { handle: 'mine', relation: 'follower' as const },
      { handle: 'me', relation: 'self' as const },
      { handle: 'a', relation: 'followed' as const },
    ]
    expect(followingYouRows(rows).map(row => row.handle)).toEqual(['a'])
    expect(followingYouRows(null)).toEqual([])
  })
})
