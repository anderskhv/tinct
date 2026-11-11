import { useEffect, useRef, useState } from 'react'

/** How long after the last change "Saved" shows, and how long it stays. */
export const SAVED_NOTE_AFTER_MS = 500
export const SAVED_NOTE_FOR_MS = 2200

/**
 * Fields that save as they are typed (the reading angle, AI settings) say so, quietly: "Saved" a moment after the
 * last change, then gone (Anders, 11 Nov 2026: "not clear when it's saved"). `signature` is the saved value as text;
 * nothing shows until it changes.
 */
export function useSavedNote(signature: string): boolean {
  const [shown, setShown] = useState(false)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    setShown(false)
    let hide: ReturnType<typeof setTimeout> | undefined
    const show = setTimeout(() => { setShown(true); hide = setTimeout(() => setShown(false), SAVED_NOTE_FOR_MS) }, SAVED_NOTE_AFTER_MS)
    return () => { clearTimeout(show); if (hide) clearTimeout(hide) }
  }, [signature])
  return shown
}

/** The word itself; it keeps its place in the row while hidden, so nothing moves when it shows. */
export function SavedNote({ shown, testId = 'lab-saved-note' }: { shown: boolean; testId?: string }) {
  return <span className="lab-saved-note" role="status" aria-live="polite" data-shown={shown ? 'true' : 'false'} data-testid={testId}>{shown ? 'Saved' : ''}</span>
}
