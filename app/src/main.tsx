import { initializeNativeBooks } from './utils/nativeBooks'
import { nativeEntryDestination } from './utils/nativeEntry'
import { registerReaderOffline } from './utils/registerReaderOffline'
import { readEinkProfile } from '../public/lab/display-profile.js'
import React from 'react'
import ReactDOM from 'react-dom/client'
import AdminApp from './AdminApp'
import { LabApp } from './lab/LabApp'
import { isNativeCapacitor } from './utils/nativePlatform'
import { warmLibraryPreview } from './utils/libraryPreviewWarmup'
import { startReaderLoadTrace } from './utils/readerLoadTrace'
import { storedContentMigrations } from './lab/labStoredContentMigrations'
import './index.css'
import { prepareBeforeBeginDesign } from './lab/beforeBeginDesign'
import { loadDesktopExperience } from './desktopCommands'
prepareBeforeBeginDesign()
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
if (Root === LabApp) void registerReaderOffline(isCapacitor)
if (pathname === '/reader') {
  startReaderLoadTrace()
  warmLibraryPreview()
}

const render = () => ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)

// Saved places and highlights written against text a structural edition
// release has since replaced move before the reader first reads them. Only a
// reader holding such data waits, and never for more than a few seconds.
async function begin() {
  if (nativeDestination) { window.location.replace(nativeDestination); return }
  if (isCapacitor) await initializeNativeBooks()
  const contentMigrations = Root === LabApp ? storedContentMigrations() : null
  if (contentMigrations) await Promise.race([contentMigrations, new Promise(resolve => setTimeout(resolve, 4000))])
  render()
}
void begin().catch(() => {
  // Render the ordinary reader error/retry flow; never clear its saved data.
  render()
})

