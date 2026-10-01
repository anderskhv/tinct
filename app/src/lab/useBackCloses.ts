import { useEffect, useRef } from 'react'

/**
 * Back closes the reader's open panel instead of leaving the reader.
 *
 * Each open panel (Contents, a menu, a settings sheet...) owns one history
 * entry. Back pops that entry and closes the panel on top; closing a panel by
 * its own button removes its entry, so the next Back is not swallowed.
 *
 * Panels open and close in the same render (the menu hands over to a sheet),
 * so history is reconciled once per tick against the number of open panels:
 * a swap nets out to no history change at all. Calling history.back() and
 * then pushState() in one tick would otherwise let the queued Back pop the
 * new panel's entry.
 */

interface Layer { id: number; close: () => void }

const open: Layer[] = []
let pushed = 0
let skipPop = false
let scheduled = false
let listening = false
let nextId = 0
// Leaving the page (Library, a book switch) closes panels on the way out; a
// history step then could cancel that navigation, so none is taken.
let leaving = false

function reconcile(): void {
  scheduled = false
  if (typeof window === 'undefined' || leaving) return
  try {
    while (pushed < open.length) {
      history.pushState({ ...(history.state || {}), tinctReaderLayer: pushed + 1 }, '')
      pushed += 1
    }
    if (pushed > open.length) {
      const extra = pushed - open.length
      pushed = open.length
      skipPop = true
      history.go(-extra)
    }
  } catch { /* history unavailable: Back keeps its old behaviour */ }
}

function schedule(): void {
  if (scheduled) return
  scheduled = true
  setTimeout(reconcile, 0)
}

function onPopState(): void {
  if (skipPop) { skipPop = false; return }
  if (pushed === 0) return
  pushed -= 1
  // The entry is gone; closing the top panel unregisters it, which leaves
  // open.length === pushed and nothing more to reconcile.
  open[open.length - 1]?.close()
}

/** Register `open` as a reader panel that Back closes by calling `close`. */
export function useBackCloses(isOpen: boolean, close: () => void): void {
  const closeRef = useRef(close)
  closeRef.current = close
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return
    if (!listening) {
      window.addEventListener('popstate', onPopState)
      window.addEventListener('beforeunload', () => { leaving = true })
      // Restored from the back/forward cache: whatever entries remain are the
      // new baseline, so nothing is popped behind the reader's back.
      window.addEventListener('pageshow', event => { if (event.persisted) { leaving = false; pushed = open.length } })
      listening = true
    }
    const layer: Layer = { id: nextId++, close: () => closeRef.current() }
    open.push(layer)
    schedule()
    return () => {
      const index = open.findIndex(item => item.id === layer.id)
      if (index >= 0) open.splice(index, 1)
      schedule()
    }
  }, [isOpen])
}

/** Test seam. */
export function resetBackCloses(): void {
  open.length = 0
  pushed = 0
  skipPop = false
  scheduled = false
  leaving = false
}
