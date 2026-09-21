export const COVER_TRANSITION_KEY = 'tinct:cover-transition'
export function captureCoverTransition(bookId, element) {
  const img = element?.querySelector('img'), box = img?.getBoundingClientRect()
  if (!box || !box.width || !box.height) return
  img.style.viewTransitionName = 'tinct-book-cover'
  try { sessionStorage.setItem(COVER_TRANSITION_KEY, JSON.stringify({bookId,at:Date.now(),left:box.left,top:box.top,width:box.width,height:box.height,viewportWidth:innerWidth,viewportHeight:innerHeight})) } catch {}
}
export function readCoverTransition(bookId) {
  try {
    const value=JSON.parse(sessionStorage.getItem(COVER_TRANSITION_KEY) || 'null')
    if (value?.bookId!==bookId || Date.now()-value.at>15000 || !['left','top','width','height','viewportWidth','viewportHeight'].every(key=>Number.isFinite(value[key])) || value.width<=0 || value.height<=0) return null
    return value
  } catch { return null }
}
