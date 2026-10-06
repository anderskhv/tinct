// First: applies and strips ?internal=1|0 before anything reads the address, and shows the badge.
import './utils/internalTraffic'
import { initializeNativeBooks } from './utils/nativeBooks'
import { preloadPublicBooksForReader } from './utils/publicBooks'
import { nativeEntryDestination } from './utils/nativeEntry'
import { registerReaderOffline } from './utils/registerReaderOffline'
import { readEinkProfile } from '../public/lab/display-profile.js'
import React from 'react'
import ReactDOM from 'react-dom/client'
import AdminApp from './AdminApp'
import { LabApp } from './lab/LabApp'
import { userBookFromSearch } from './lab/userBook/userBookId'
import { readCachedSupabaseUser } from './lab/labLibraryBoot'
import { isNativeCapacitor } from './utils/nativePlatform'
import { warmLibraryPreview } from './utils/libraryPreviewWarmup'
import { startReaderLoadTrace } from './utils/readerLoadTrace'
import { storedContentMigrations } from './lab/labStoredContentMigrations'
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
const Root = pathname === '/admin/metrics' ? AdminApp : LabApp
// A reader's own EPUB from Add a book: /reader?userBook=<hex> (lab/userBook/),
// loaded only on that page.
const userBookHex = pathname === '/reader' ? userBookFromSearch(window.location.search) : null
// Read now, before the auth client can drop a lapsed session: Add a book tags
// files with the account even when its sign-in has lapsed.
const userBookOwner = userBookHex ? (readCachedSupabaseUser()?.id ?? null) : null
const UserBookReader = React.lazy(() => import('./lab/userBook/UserBookReader').then(module => ({ default: module.UserBookReader })))
if (Root === LabApp) void registerReaderOffline(isCapacitor)
if (pathname === '/reader') {
  startReaderLoadTrace()
  warmLibraryPreview()
}

const render = () => ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {userBookHex ? <React.Suspense fallback={null}><UserBookReader hex={userBookHex} owner={userBookOwner} /></React.Suspense> : <Root />}
  </React.StrictMode>,
)

// Saved places and highlights written against text a structural edition
// release has since replaced move before the reader first reads them. Only a
// reader holding such data waits, and never for more than a few seconds.
async function begin() {
  if (nativeDestination) { window.location.replace(nativeDestination); return }
  if (isCapacitor) await initializeNativeBooks()
  // Books readers added (pd-…) are registered before the reader reads the registry; bounded wait.
  if (Root === LabApp && !userBookHex) await Promise.race([preloadPublicBooksForReader(), new Promise(resolve => setTimeout(resolve, 4000))])
  const contentMigrations = Root === LabApp ? storedContentMigrations() : null
  if (contentMigrations) await Promise.race([contentMigrations, new Promise(resolve => setTimeout(resolve, 4000))])
  render()
}
void begin().catch(() => {
  // Render the ordinary reader error/retry flow; never clear its saved data.
  render()
})

