// @vitest-environment jsdom

import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabV2Sheet } from './LabV2Sheet.tsx'
import { labPrefsForMainEdition } from './labV2Sheet'
import { DEFAULT_LAB_PREFS, type LabPrefs } from './labPrefs'
import { FRANKENSTEIN, THE_HISTORIES } from '../data/bookRegistry'

afterEach(cleanup)

const guest: LabPrefs = { ...DEFAULT_LAB_PREFS, primaryEdition: 'modern-en', compareEdition: 'original-en', compareOpen: true }

describe('choosing the main edition', () => {
  it('swaps Compare when the new main was the Compare edition of a two-edition book', () => {
    const next = labPrefsForMainEdition(guest, 'original-en', 'frankenstein', FRANKENSTEIN.editions, FRANKENSTEIN.year)
    expect(next.primaryEdition).toBe('original-en')
    expect(next.compareEdition).toBe('modern-en')
    expect(next.compareOpen).toBe(true)
  })

  it('keeps Compare off when it was off by default, but pairs it with another edition', () => {
    const next = labPrefsForMainEdition({ ...guest, compareOpen: false }, 'original-en', 'frankenstein', FRANKENSTEIN.editions, FRANKENSTEIN.year)
    expect(next.compareEdition).toBe('modern-en')
    expect(next.compareOpen).toBe(false)
  })

  it('leaves an explicit Compare None alone', () => {
    const none = { ...guest, compareOpen: false, compareChosen: true }
    const next = labPrefsForMainEdition(none, 'original-en', 'frankenstein', FRANKENSTEIN.editions, FRANKENSTEIN.year)
    expect(next).toEqual({ ...none, primaryEdition: 'original-en' })
  })

  it('leaves Compare unchanged when the new main is not the Compare edition', () => {
    const prefs = { ...guest, primaryEdition: 'original-en', compareEdition: 'modern-en' }
    const other = THE_HISTORIES.editions.find(edition => edition.key !== 'original-en' && edition.key !== 'modern-en')
    if (!other) return
    const next = labPrefsForMainEdition(prefs, other.key, 'the-histories', THE_HISTORIES.editions, THE_HISTORIES.year)
    expect(next).toEqual({ ...prefs, primaryEdition: other.key })
  })

  it('pairs with another edition (never the new main) when a book has several', () => {
    const editions = THE_HISTORIES.editions
    expect(editions.length).toBeGreaterThan(2)
    const compare = editions[1].key
    const prefs = { ...guest, primaryEdition: editions[0].key, compareEdition: compare, compareOpen: true }
    const next = labPrefsForMainEdition(prefs, compare, 'the-histories', editions, THE_HISTORIES.year)
    expect(next.primaryEdition).toBe(compare)
    expect(next.compareEdition).not.toBe(compare)
    expect(editions.some(edition => edition.key === next.compareEdition)).toBe(true)
    expect(next.compareOpen).toBe(true)
  })

  it('keeps Show compare on after Main version → Original in the sheet', () => {
    const onPrefs = vi.fn()
    const { container } = render(
      <LabV2Sheet bookId="frankenstein" layer="mainEdition" onLayer={() => {}} onClose={() => {}}
        prefs={guest} onPrefs={onPrefs} editions={FRANKENSTEIN.editions} />,
    )
    fireEvent.click(container.querySelector('[data-edition="original-en"]')!)
    expect(onPrefs).toHaveBeenCalledWith(expect.objectContaining({ primaryEdition: 'original-en', compareEdition: 'modern-en', compareOpen: true }))
  })
})
