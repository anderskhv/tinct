import { describe, expect, it } from 'vitest'
import { labSuperMenuRows } from './labSuperMenu'

const compareRow = (input: Parameters<typeof labSuperMenuRows>[0]) =>
  labSuperMenuRows(input).find(row => row.id === 'compare')

describe('labSuperMenuRows compare row', () => {
  it('offers the compare version when compare is not showing', () => {
    expect(compareRow({ compare: true, compareActive: false, phone: true })?.label).toBe('Compare Version')
    expect(compareRow({ compare: true, compareActive: false })?.label).toBe('Compare Version')
  })

  it('puts the main version back on the phone, where compare swaps the page', () => {
    expect(compareRow({ compare: true, compareActive: true, phone: true })?.label).toBe('Main Version')
  })

  it('turns the second pane off on the desktop, where nothing is swapped', () => {
    expect(compareRow({ compare: true, compareActive: true })?.label).toBe('Compare off')
    expect(compareRow({ compare: true, compareActive: true, phone: false })?.label).toBe('Compare off')
  })

  it('omits the row entirely when no compare edition is chosen', () => {
    expect(compareRow({ compare: false, compareActive: false })).toBeUndefined()
  })
})
