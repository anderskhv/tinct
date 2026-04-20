import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Detect Capacitor (Android/iOS native app) and E-ink devices
const isCapacitor = !!(window as Record<string, unknown>).Capacitor
const isAndroid = /android/i.test(navigator.userAgent)
// E-ink: default ON for Capacitor Android (our target is Boox e-readers)
// Also check UA for known e-ink brands as fallback for web
const isEinkUA = (() => {
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes('boox') || ua.includes('onyx') || ua.includes('eink') || ua.includes('e-ink')
})()
// Query-param override: append ?eink=1 to force e-ink mode for design testing.
const isEinkQuery = new URLSearchParams(window.location.search).get('eink') === '1'
const isEink = (isCapacitor && isAndroid) || isEinkUA || isEinkQuery

// Expose platform info globally
;(window as Record<string, unknown>).__TINCT_PLATFORM = {
  isCapacitor,
  isEink,
  isAndroid,
}

// Auto-enable e-ink optimizations — Capacitor Android = e-ink by default
if (isEink) {
  document.documentElement.setAttribute('data-eink', 'true')
  document.documentElement.setAttribute('data-theme', 'light')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
