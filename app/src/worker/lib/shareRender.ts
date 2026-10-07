/**
 * Rasterise a share page to PNG in the Worker: our own layout
 * (src/share/shareLayout.ts) drawn as SVG and rendered by resvg (WASM) with
 * EB Garamond. Loaded with a dynamic import so only share image requests pay
 * for the WASM module.
 */

import { initWasm, Resvg } from '@resvg/resvg-wasm'
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm'
import { parseFontMetrics } from '../../share/fontMetrics'
import { composeShareCards, type ShareContent, type ShareFonts, type ShareOptions, type SharePage } from '../../share/shareLayout'
import { englishShareBreaks } from '../../share/shareHyphenate'
import { renderShareSvg } from '../../share/shareSvg'

type Assets = { fetch: (request: Request) => Promise<Response> }

const FONT_FILES = ['EBGaramond-Regular', 'EBGaramond-SemiBold', 'EBGaramond-Italic'] as const

let fontsReady: Promise<{ fonts: ShareFonts; buffers: Uint8Array[] }> | null = null
let wasmReady: Promise<void> | null = null

function loadFonts(assets: Assets, origin: string) {
  if (!fontsReady) {
    fontsReady = (async () => {
      const buffers = await Promise.all(FONT_FILES.map(async name => {
        const response = await assets.fetch(new Request(`${origin}/fonts/share/${name}.ttf`))
        if (!response.ok) throw new Error(`share font ${name} unavailable (${response.status})`)
        return new Uint8Array(await response.arrayBuffer())
      }))
      return {
        buffers,
        fonts: { regular: parseFontMetrics(buffers[0]), semibold: parseFontMetrics(buffers[1]), italic: parseFontMetrics(buffers[2]) },
      }
    })()
    fontsReady.catch(() => { fontsReady = null })
  }
  return fontsReady
}

function loadWasm() {
  if (!wasmReady) {
    wasmReady = initWasm(resvgWasm)
    wasmReady.catch(() => { wasmReady = null })
  }
  return wasmReady
}

async function compose(assets: Assets, origin: string, content: ShareContent, options: ShareOptions) {
  const loaded = await loadFonts(assets, origin)
  // Justified pages are hyphenated as the phone reader's (English only; shareLayout decides where).
  return { ...loaded, pages: composeShareCards(content, options, loaded.fonts, englishShareBreaks) }
}

/** How many images the share is: more than one for a quote set as a series of cards. */
export async function shareCardCount(assets: Assets, origin: string, content: ShareContent, options: ShareOptions): Promise<number> {
  return (await compose(assets, origin, content, options)).pages.length
}

/** Card `card` (1-based, clamped) of the share as PNG, and how many cards the share has. */
export async function renderSharePng(assets: Assets, origin: string, content: ShareContent, options: ShareOptions, card = 1): Promise<{ png: Uint8Array; page: SharePage; cards: number }> {
  const [{ fonts, buffers, pages }] = await Promise.all([compose(assets, origin, content, options), loadWasm()])
  const page = pages[Math.min(Math.max(1, card), pages.length) - 1]
  const svg = renderShareSvg(page, fonts)
  const resvg = new Resvg(svg, { font: { fontBuffers: buffers, defaultFontFamily: 'EB Garamond', loadSystemFonts: false } })
  try {
    return { png: resvg.render().asPng(), page, cards: pages.length }
  } finally {
    resvg.free()
  }
}
