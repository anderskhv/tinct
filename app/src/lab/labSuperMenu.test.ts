import { describe, expect, it } from 'vitest'
import { labSuperMenuRows } from './labSuperMenu'

describe('labSuperMenuRows', () => {
  it('groups chapter actions, book preferences and navigation on both chromes', () => {
    expect(labSuperMenuRows({ phone: true }).map(row => row.id)).toEqual(['chat', 'talk', 'summarize', 'editions', 'settings', 'library', 'account'])
    expect(labSuperMenuRows({ phone: false }).map(row => row.id)).toEqual(['chat', 'talk', 'summarize', 'editions', 'settings', 'library', 'account'])
    expect(labSuperMenuRows().map(row => row.id)).toEqual(['chat', 'talk', 'summarize', 'editions', 'settings', 'library', 'account'])
  })
})
