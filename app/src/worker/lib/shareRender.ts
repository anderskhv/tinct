/**
 * Rasterise a share page to PNG in the Worker: our own layout
 * (src/share/shareLayout.ts) drawn as SVG and rendered by resvg (WASM) with
 * EB Garamond. Loaded with a dynamic import so only share image requests pay
 * for the WASM module.
 */

import { initWasm, Resvg } from '@resvg/resvg-wasm'
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm'
import { parseFontMetrics } from '../../share/fontMetrics'
import { composeSharePage, type ShareContent, type ShareFonts, type ShareOptions, type SharePage } from '../../share/shareLayout'
import { renderShareSvg } from '../../share/shareSvg'

type Assets = { fetch: (request: Request) => Promise<Response> }

const FONT_FILES = ['EBGaramond-Regular', 'EBGaramond-SemiBold', 'EBGaramond-Italic'] as const

let ready: Promise<{ fonts: ShareFonts; buffers: Uint8Array[] }> | null = null

function load(assets: Assets, origin: string) {
  if (!ready) {
    ready = (async () => {
      const [buffers] = await Promise.all([
        Promise.all(FONT_FILES.map(async name => {
          const response = await assets.fetch(new Request(`${origin}/fonts/share/${name}.ttf`))
          if (!response.ok) throw new Error(`share font ${name} unavailable (${response.status})`)
          return new Uint8Array(await response.arrayBuffer())
        })),
        initWasm(resvgWasm),
      ])
      return {
        buffers,
        fonts: { regular: parseFontMetrics(buffers[0]), semibold: parseFontMetrics(buffers[1]), italic: parseFontMetrics(buffers[2]) },
      }
    })()
    ready.catch(() => { ready = null })
  }
  return ready
}

export async function renderSharePng(assets: Assets, origin: string, content: ShareContent, options: ShareOptions): Promise<{ png: Uint8Array; page: SharePage }> {
  const { fonts, buffers } = await load(assets, origin)
  const page = composeSharePage(content, options, fonts)
  const svg = renderShareSvg(page, fonts)
  const resvg = new Resvg(svg, { font: { fontBuffers: buffers, defaultFontFamily: 'EB Garamond', loadSystemFonts: false } })
  try {
    return { png: resvg.render().asPng(), page }
  } finally {
    resvg.free()
  }
}
