// Only optional library background work uses this boundary. Reader saves and
// presence flushes must still be allowed to finish when a document departs.
let leaving = false
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('beforeunload', () => { leaving = true })
  window.addEventListener('pagehide', () => { leaving = true })
  window.addEventListener('pageshow', () => { leaving = false })
}
export const libraryPageIsLeaving = (): boolean => leaving
