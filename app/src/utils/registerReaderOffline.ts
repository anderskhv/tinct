/** Start the existing audio cache for direct reader entries; never reload a reading page. */
export async function registerReaderOffline(native: boolean): Promise<boolean> {
  if (native || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return false
  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    void registration.update().catch(() => {})
    registration.waiting?.postMessage({type:'SKIP_WAITING'})
    return true
  } catch { return false }
}
