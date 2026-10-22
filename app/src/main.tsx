// First: applies and strips ?internal=1|0 before anything reads the address, and shows the badge.
import './utils/internalTraffic'
import { initializeNativeBooks } from './utils/nativeBooks'
import { READER_HANDOFF_KEY, preparePublicBooksForReader } from './utils/publicBooks'
import { nativeEntryDestination } from './utils/nativeEntry'
import { registerReaderOffline } from './utils/registerReaderOffline'
import { readEinkProfile } from '../public/lab/display-profile.js'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { LabApp } from './lab/LabApp'
import { userBookFromSearch } from './lab/userBook/userBookId'
import { marginPreviewMountForPage } from './lab/marginPreview/marginPreviewMount'
import { isLabPhoneSurface, labPhoneSurfaceInput } from './lab/labChrome'
import { labLayoutOverride } from './lab/labRoute'
import { isMarginPreviewBook } from './lab/marginPreview/marginPreviewModel'
import { getBook } from './data/bookRegistry'
import { readCachedSupabaseUser } from './lab/labLibraryBoot'
import { isNativeCapacitor } from './utils/nativePlatform'
import { warmLibraryPreview } from './utils/libraryPreviewWarmup'
import { warmAccountCards } from './cards/warmCards'
import { startReaderLoadTrace } from './utils/readerLoadTrace'
import { storedContentMigrations } from './lab/labStoredContentMigrations'
import { continueLatestDestination } from './lab/continueLatest'
import './index.css'
import { loadDesktopExperience } from './desktopCommands'
import { installStaleChunkRecovery } from './utils/staleChunkRecovery'
installStaleChunkRecovery()
loadDesktopExperience()

// Detect Capacitor (Android/iOS native app) and E-ink devices.
// `window.Capacitor` exists in the web bundle too; only the native shell counts.
const isCapacitor = isNativeCapacitor()
const isAndroid = /android/i.test(navigator.userAgent)
// E-ink is an explicit shared display choice, never every Android phone.
const isEink = readEinkProfile()

// Expose platform info globally
;(window as Record<string, unknown>).__TINCT_PLATFORM = {
  isCapacitor,
  isEink,
  isAndroid,
}

// Apply the explicit display profile before the reader paints.
if (isEink) {
  document.documentElement.setAttribute('data-eink', 'true')
  document.documentElement.setAttribute('data-theme', 'light')
}

const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
const nativeDestination = nativeEntryDestination(isCapacitor, pathname, window.location.search, window.location.hash)
// The reader is the only public app surface; /admin/metrics is the private
// dashboard. The Worker serves this bundle at no other path.
// The dashboard's code loads only on its own page, never with the reader.
const AdminApp = React.lazy(() => import('./AdminApp'))
const isAdmin = pathname === '/admin/metrics'
const Root = isAdmin ? AdminApp : LabApp
// A reader's own EPUB from Add a book: /reader?userBook=<hex> (lab/userBook/),
// loaded only on that page.
const userBookHex = pathname === '/reader' ? userBookFromSearch(window.location.search) : null
// Read now, before the auth client can drop a lapsed session: Add a book tags
// files with the account even when its sign-in has lapsed.
const userBookOwner = userBookHex ? (readCachedSupabaseUser()?.id ?? null) : null
// The margin preview (/reader?book=<id>&margin=1, or this device's opt-in): a registered
// book in the margin reader instead of the book reader; loaded only on that page.
const MarginPreview = React.lazy(() => import('./lab/marginPreview/MarginPreview').then(module => ({ default: module.MarginPreview })))
const UserBookReader = React.lazy(() => import('./lab/userBook/UserBookReader').then(module => ({ default: module.UserBookReader })))
if (Root === LabApp) void registerReaderOffline(isCapacitor)
if (pathname === '/reader') {
  startReaderLoadTrace()
  warmLibraryPreview()
  warmAccountCards()
}

// The reader's surface (phone or desktop), as Tinct's books are decided below: an own book's phone reader or margin frame.
const phoneSurface = () => isLabPhoneSurface(labPhoneSurfaceInput(labLayoutOverride(pathname, window.location.search)))
/**
 * The reader inside the margin reader's frame (an own book's or a Tinct book's, MarginPreview.tsx): a navigation
 * the frame made itself (a link, the switcher) that should have gone through the top window. It goes there now,
 * before anything is drawn or kept here, so the reader is never mounted twice.
 */
function framedByMarginHost(): boolean {
  try { return window.parent !== window && Boolean((window.parent as Window).TinctMarginPreview) } catch { return false }
}

const render = (marginPhone = false) => ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {userBookHex ? <React.Suspense fallback={null}><UserBookReader hex={userBookHex} owner={userBookOwner} phone={phoneSurface()} /></React.Suspense> : isAdmin ? <React.Suspense fallback={null}><AdminApp /></React.Suspense> : <LabApp marginPhone={marginPhone || undefined} />}
  </React.StrictMode>,
)

// Saved places and highlights written against text a structural edition
// release has since replaced move before the reader first reads them. Only a
// reader holding such data waits, and never for more than a few seconds.
async function begin() {
  if (nativeDestination) { window.location.replace(nativeDestination); return }
  if (pathname === '/reader' && framedByMarginHost()) { window.top!.location.replace(window.location.href); return }
  if (isCapacitor) await initializeNativeBooks()
  // Desktop /reader with no book: an own PDF/EPUB read later than the registered
  // book opens instead, decided before anything paints (lab/continueLatest.ts).
  // Phones and the native app keep today's reader.
  if (Root === LabApp && !userBookHex && !isCapacitor) {
    const latest = await continueLatestDestination({ pathname, search: window.location.search }).catch(() => null)
    if (latest) { window.location.replace(latest); return }
  }
  // Books readers added (pd-…) are registered before the reader reads the registry; bounded wait.
  if (Root === LabApp && !userBookHex) {
    const missing = await preparePublicBooksForReader()
    // The hand-off opens a book that could not be registered: the library shows that book
    // (its ?book= link) rather than the reader silently opening another one.
    if (missing) {
      try { sessionStorage.removeItem(READER_HANDOFF_KEY) } catch { /* the library still opens */ }
      window.location.replace(`/library?book=${encodeURIComponent(missing)}`)
      return
    }
  }
  // Decided once the added books are registered. On a desktop the book reader is not mounted; the
  // margin view keeps the place, highlights and notes through the book reader's stores (MarginPreviewSync),
  // so the stored-data migrations run first, as they do for the book reader. On a phone the preview is
  // the book reader itself with the new bar, cards and pills (marginPreviewMount.ts).
  const phone = phoneSurface()
  const preview = pathname === '/reader' && !userBookHex ? marginPreviewMountForPage(id => isMarginPreviewBook(getBook(id)), phone) : null
  const contentMigrations = Root === LabApp ? storedContentMigrations() : null
  if (contentMigrations) await Promise.race([contentMigrations, new Promise(resolve => setTimeout(resolve, 4000))])
  if (preview?.mount === 'frame' && preview.bookId) {
    const previewBookId = preview.bookId
    ReactDOM.createRoot(document.getElementById('root')!).render(<React.Suspense fallback={null}><MarginPreview bookId={previewBookId} /></React.Suspense>)
    return
  }
  render(preview?.mount === 'phone')
}
void begin().catch(() => {
  // Render the ordinary reader error/retry flow; never clear its saved data.
  render()
})

