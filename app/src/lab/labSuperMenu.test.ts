import { describe, expect, it } from 'vitest'
import { labSuperMenuRows } from './labSuperMenu'

describe('labSuperMenuRows', () => {
  it('is five rows on both chromes, with no Compare row (Compare lives in Reading settings)', () => {
    expect(labSuperMenuRows({ phone: true }).map(row => row.id)).toEqual(['chat', 'talk', 'library', 'settings', 'account'])
    expect(labSuperMenuRows({ phone: false }).map(row => row.id)).toEqual(['chat', 'talk', 'library', 'settings', 'account'])
    expect(labSuperMenuRows().map(row => row.id)).toEqual(['chat', 'talk', 'library', 'settings', 'account'])
  })
})
