// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
// @ts-expect-error -- shared browser module
import { showAddedToast, takeAddedNote } from '../public/lab/added-toast.js'
// @ts-expect-error -- shared browser module
import { noteAdded, ADDED_KEY } from '../public/lab/library_2/own-add.js'

// "Added to your shelf" (approved paste-flow mockup 05, 5 Nov 2026): once, only on the added book's page.
describe('Added to your shelf', () => {
  afterEach(() => { sessionStorage.clear(); document.body.replaceChildren() })
  const hex = 'b'.repeat(24)
  it('shows once on the added book, never on another', () => {
    noteAdded('epub:' + hex)
    expect(takeAddedNote('?userBook=' + 'c'.repeat(24))).toBe(false)
    expect(sessionStorage.getItem(ADDED_KEY)).not.toBeNull()
    expect(takeAddedNote(`?userBook=${hex}&sharedReader=1`)).toBe(true)
    expect(takeAddedNote(`?userBook=${hex}&sharedReader=1`)).toBe(false)
  })
  it('is forgotten when the reader opens much later', () => {
    noteAdded('pdf:' + hex)
    expect(takeAddedNote(`?userBook=${hex}`, Date.now() + 3 * 60 * 1000)).toBe(false)
    expect(sessionStorage.getItem(ADDED_KEY)).toBeNull()
  })
  it('is a quiet status line with the approved words', () => {
    const toast = showAddedToast(document)
    expect(toast.getAttribute('role')).toBe('status')
    expect(toast.textContent).toBe('Added to your shelf')
  })
})
