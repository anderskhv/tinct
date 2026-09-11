/**
 * Whether this page runs inside the Capacitor native shell (the Android APK).
 *
 * `@capacitor/core` defines `window.Capacitor` on every platform as soon as it
 * is imported — the web bundle included — so `!!window.Capacitor` is true in
 * plain mobile Chrome too. That misread put every Android phone browser into
 * the e-ink profile and sent its API calls cross-origin (2026-09-11 phone QA).
 * The global's own `isNativePlatform()` is the reliable answer.
 */
export function isNativeCapacitor(): boolean {
  if (typeof window === 'undefined') return false
  const cap = (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
  if (!cap) return false
  return typeof cap.isNativePlatform === 'function' ? cap.isNativePlatform() : true
}
