import {markInternal} from '../lib/internalTraffic.cjs'

/** Observe the new process; webView({pkg}) alone can return the retiring one. */
export async function restartNativePage(device, packageId, launch) {
 const next = device.waitForEvent('webview', {
  predicate: view => view.pkg() === packageId,
  timeout: 60000,
 })
 // Attach a rejection handler immediately if the shell command itself fails.
 next.catch(() => {})
 await device.shell('am force-stop ' + packageId)
 await launch()
 // Tinct's own check: keep its traffic marked internal in the new WebView process.
 return markInternal(await (await next).page())
}
