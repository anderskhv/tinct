#!/usr/bin/env node
// A book's painted cover in the series style (6 Nov 2026; Anders: every new book gets a cover we make).
//
//   XAI_API_KEY=… node scripts/make-book-cover.mjs --id master-and-margarita \
//     --title "The Master|and Margarita" --author "Mikhail Bulgakov" \
//     --scene "A tall Moscow apartment window at night, a full moon; a large black cat on the sill…" [--n 3] [--out dir]
//
// 1. Asks xAI's image model for --n paintings of --scene in the house style (dark painted still life, one
//    warm light, calm dark space at the top and bottom, no lettering). About $0.04 each (grok-imagine-image-2.0).
// 2. Sets the title (| breaks the line) and author over each in EB Garamond in the series layout and writes
//    <out>/<id>-<k>.webp at 540×810 plus the raw painting, for choosing. Copy the chosen one to
//    public/covers/v2/<id>.webp. Nothing is published by this script.
// Run from app/. Uses playwright (installed) to set the type and sharp for WebP.
import { chromium } from 'playwright'
import sharp from 'sharp'
import fs from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'

const { values: a } = parseArgs({ options: { id: { type: 'string' }, title: { type: 'string' }, author: { type: 'string' }, scene: { type: 'string' }, n: { type: 'string', default: '3' }, out: { type: 'string', default: 'artifacts/covers' }, model: { type: 'string', default: 'grok-imagine-image-2.0' } } })
for (const k of ['id', 'title', 'author', 'scene']) if (!a[k]) { console.error(`--${k} is required`); process.exit(1) }
if (!process.env.XAI_API_KEY) { console.error('XAI_API_KEY is not set'); process.exit(1) }

const STYLE = 'Dark, painterly, cinematic still life in the manner of an oil painting with photographic realism; deep chiaroscuro, '
  + 'a single warm or moonlit light source, rich shadows, muted palette, fine canvas texture; one quiet symbolic subject, centred low in the frame; '
  + 'the upper third and lower sixth of the picture are calm dark space (for a book title and author name added later). '
  + 'Portrait 2:3 book-cover composition. Absolutely no text, letters, words, signatures, logos or borders anywhere.'
const out = path.resolve(a.out, a.id)
await fs.mkdir(out, { recursive: true })
const font = path.resolve('public/fonts/share/EBGaramond-Regular.ttf')
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const page = img => `<!doctype html><meta charset="utf-8"><style>@font-face{font-family:EBG;src:url(file://${font})}
html,body{margin:0}.c{width:540px;height:810px;position:relative;overflow:hidden;background:#111}.c img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.s{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 30%,rgba(0,0,0,0) 78%,rgba(0,0,0,.5) 100%)}
.t{position:absolute;top:66px;left:40px;right:40px;text-align:center;font-family:EBG;color:#f1e8d6;font-size:36px;line-height:1.08;letter-spacing:.02em;text-transform:uppercase;text-shadow:0 1px 8px rgba(0,0,0,.6)}
.r{width:58px;height:1.5px;background:#c9a46a;margin:16px auto 0}.a{position:absolute;bottom:58px;left:0;right:0;text-align:center;font-family:EBG;color:#efe6d4;font-size:15px;letter-spacing:.12em;text-transform:uppercase;text-shadow:0 1px 6px rgba(0,0,0,.7)}.a .r{margin:0 auto 18px;width:22px}</style>
<div class="c" id="c"><img src="file://${img}"><div class="s"></div><div class="t">${a.title.split('|').map(esc).join('<br>')}<div class="r"></div></div><div class="a"><div class="r"></div>${esc(a.author)}</div></div>`

const browser = await chromium.launch()
for (let k = 1; k <= Number(a.n); k++) {
  const response = await fetch('https://api.x.ai/v1/images/generations', { method: 'POST', headers: { Authorization: `Bearer ${process.env.XAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: a.model, prompt: `${a.scene} ${STYLE}`, n: 1, response_format: 'b64_json', aspect_ratio: '2:3' }) })
  if (!response.ok) { console.error(`painting ${k}: ${response.status} ${(await response.text()).slice(0, 300)}`); continue }
  const art = path.join(out, `${a.id}-${k}-painting.jpg`)
  await fs.writeFile(art, Buffer.from((await response.json()).data[0].b64_json, 'base64'))
  const p = await browser.newPage({ viewport: { width: 540, height: 810 } })
  await p.setContent(page(art)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300)
  const png = await p.locator('#c').screenshot(); await p.close()
  const file = path.join(out, `${a.id}-${k}.webp`)
  await sharp(png).webp({ quality: 86 }).toFile(file)
  console.log('wrote', file)
}
await browser.close()
