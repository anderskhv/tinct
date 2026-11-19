/**
 * resvg's WASM may be initialised only once per isolate, and two features use
 * it (share images, painted-cover spines), so both start it here. Imported
 * dynamically by each, so only those requests pay for the module.
 */
import { initWasm } from '@resvg/resvg-wasm'
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm'

let ready: Promise<void> | null = null

export function ensureResvg(): Promise<void> {
  if (!ready) {
    ready = initWasm(resvgWasm)
    ready.catch(() => { ready = null })
  }
  return ready
}
