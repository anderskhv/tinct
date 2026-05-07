/**
 * Entry-source detection — identifies how the user arrived at the app so the
 * onboarding flow can branch accordingly.
 *
 * Three sources:
 *   - 'landing'    → the marketing landing page (links append ?from=landing)
 *   - 'seo'        → an SEO page like /read/{book}/summary or /read/{book}/chapter-N
 *                    (referrer includes /read/.../{summary|themes|cast|chapters|chapter-N})
 *   - 'deep-link'  → everything else, including a direct /read/{book}/{chapter}
 *                    URL paste, share link, or a deep link with ?chapter=N
 *
 * The result is determined ONCE per session at app boot and cached in
 * sessionStorage so within-session navigation doesn't change the source.
 *
 * Used to drive:
 *   - Whether the book preface fires (landing + SEO yes; deep-link no)
 *   - Whether the mid-flow account prompt fires (landing yes; others no)
 *   - The "first completed chapter" prompt fires on all paths (still useful
 *     after deep-link to chapter 10 → fires when user finishes chapter 10).
 */

export type EntrySource = 'landing' | 'seo' | 'deep-link' | 'signed-in'

const SESSION_KEY = 'tinct:entry-source'

export function detectEntrySource(): EntrySource {
  if (typeof window === 'undefined') return 'deep-link'

  // Cached from earlier in this session — once decided, stick with it.
  try {
    const cached = sessionStorage.getItem(SESSION_KEY)
    if (cached === 'landing' || cached === 'seo' || cached === 'deep-link' || cached === 'signed-in') {
      return cached
    }
  } catch { /* ignore */ }

  let source: EntrySource = 'deep-link'

  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('from') === 'landing') {
      source = 'landing'
    } else {
      // Check referrer for SEO origin. Tinct's SEO pages live under /read/{book}/
      // with these terminal segments: summary, themes, cast, chapters, chapter-N.
      const ref = document.referrer
      if (ref) {
        try {
          const refUrl = new URL(ref)
          const refPath = refUrl.pathname
          // Match same-origin /read/{bookId}/{seo-page}
          if (refUrl.host === window.location.host) {
            if (/\/read\/[^/]+\/(summary|themes|cast|chapters|chapter-\d+)\/?$/.test(refPath)) {
              source = 'seo'
            } else if (refPath === '/' || refPath === '/index.html') {
              // Direct landing-page click without ?from=landing query param —
              // fall back to detection by referrer.
              source = 'landing'
            }
          }
        } catch { /* ignore malformed referrer */ }
      }
    }
  } catch { /* ignore */ }

  try { sessionStorage.setItem(SESSION_KEY, source) } catch { /* ignore */ }
  return source
}

/** Override the cached source — used by App.tsx when we detect a signed-in user. */
export function setEntrySource(source: EntrySource): void {
  try { sessionStorage.setItem(SESSION_KEY, source) } catch { /* ignore */ }
}
