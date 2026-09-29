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
 return (await next).page()
}
