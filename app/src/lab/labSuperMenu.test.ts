import { describe, expect, it } from 'vitest'
import { labSuperMenuRows } from './labSuperMenu'

describe('labSuperMenuRows', () => {
  it('groups chapter actions, book preferences and navigation on both chromes', () => {
    expect(labSuperMenuRows({ phone: true }).map(row => row.id)).toEqual(['chat', 'talk', 'summarize', 'catchup', 'editions', 'settings', 'library', 'account'])
  })

  it('leaves Library to the back arrow on desktop', () => {
    const desktop = labSuperMenuRows({ phone: false })
    expect(desktop.map(row => row.id)).toEqual(['chat', 'talk', 'summarize', 'catchup', 'editions', 'settings', 'account'])
    expect(desktop.find(row => row.id === 'account')?.ruleBefore).toBe(true)
    expect(labSuperMenuRows().map(row => row.id)).toEqual(desktop.map(row => row.id))
  })
})
