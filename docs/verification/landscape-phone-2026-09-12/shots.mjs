/**
 * Landscape-phone verification shots.
 *
 * Usage: node shots.mjs <outDir> <set>      set = landscape | unchanged | all
 * Zero network: the voice layer is stubbed the way scripts/voice-surface-shots.cjs
 * stubs it, and nothing reaches api.anthropic.com or api.openai.com.
 */
import { chromium } from '/home/user/tinct/app/node_modules/playwright/index.mjs'
import { mkdirSync } from 'node:fs'
import sharp from '/home/user/tinct/app/node_modules/sharp/dist/index.mjs'

const OUT = process.argv[2]
const SET = process.argv[3] || 'all'
const BASE = 'http://127.0.0.1:4206'
const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

const IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const AND = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/604.1'
const DESK = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

const LANDSCAPE = [
  { name: 'ios-852x393', width: 852, height: 393, dpr: 3, ua: IOS, mobile: true },
  { name: 'ios-932x430', width: 932, height: 430, dpr: 3, ua: IOS, mobile: true },
  { name: 'android-780x360', width: 780, height: 360, dpr: 3, ua: AND, mobile: true },
]
const UNCHANGED = [
  { name: 'portrait-393x852', width: 393, height: 852, dpr: 3, ua: IOS, mobile: true },
  { name: 'tablet-768x1024', width: 768, height: 1024, dpr: 2, ua: IPAD, mobile: true },
  { name: 'tablet-1024x768', width: 1024, height: 768, dpr: 2, ua: IPAD, mobile: true },
  { name: 'desktop-1440x900', width: 1440, height: 900, dpr: 1, ua: DESK, mobile: false },
]

const ALL = [...LANDSCAPE, ...UNCHANGED]

const STUB = () => {
  const realFetch = window.fetch.bind(window)
  const stub = {
    dc: null, pc: null,
    openDataChannel() {
      const dc = stub.dc
      if (!dc) return false
      dc.readyState = 'open'; dc.dispatch('open', {})
      if (stub.pc) { stub.pc.connectionState = 'connected'; stub.pc.onconnectionstatechange && stub.pc.onconnectionstatechange() }
      return true
    },
    attachAssistantTrack() {
      const ctx = new AudioContext(); const dest = ctx.createMediaStreamDestination()
      const osc = ctx.createOscillator(); const gain = ctx.createGain()
      gain.gain.value = 0; osc.connect(gain); gain.connect(dest); osc.start()
      if (stub.pc && stub.pc.ontrack) stub.pc.ontrack({ streams: [dest.stream] })
      return true
    },
    realtime(event) { const dc = stub.dc; if (!dc) return false; dc.dispatch('message', { data: JSON.stringify(event) }); return true },
  }
  window.__voiceStub = stub
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : (input && input.url) || String(input)
    if (url.includes('voice-session')) return new Response(JSON.stringify({ value: 'stub-key' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    if (url.includes('api.openai.com')) return new Response('v=0\r\n', { status: 200, headers: { 'Content-Type': 'application/sdp' } })
    if (url.includes('/api/chat') || url.includes('api.anthropic.com')) return new Response(JSON.stringify({ text: 'stubbed' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    return realFetch(input, init)
  }
  const silentStream = () => {
    const ctx = new AudioContext(); const dest = ctx.createMediaStreamDestination()
    const osc = ctx.createOscillator(); const gain = ctx.createGain()
    gain.gain.value = 0.0001; osc.connect(gain); gain.connect(dest); osc.start()
    return dest.stream
  }
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => silentStream() } })
  class StubDataChannel {
    constructor() { this.readyState = 'connecting'; this.listeners = new Map() }
    addEventListener(t, f) { const s = this.listeners.get(t) || new Set(); s.add(f); this.listeners.set(t, s) }
    removeEventListener(t, f) { this.listeners.get(t) && this.listeners.get(t).delete(f) }
    dispatch(t, e) { (this.listeners.get(t) || new Set()).forEach(f => f(e)) }
    send() {}
    close() { this.readyState = 'closed'; this.dispatch('close', {}) }
  }
  class StubPeerConnection {
    constructor() { this.connectionState = 'new'; this.ontrack = null; this.onconnectionstatechange = null; this.senders = []; stub.pc = this }
    createDataChannel() { stub.dc = new StubDataChannel(); return stub.dc }
    addTrack(track) { this.senders.push({ track }); return this.senders[this.senders.length - 1] }
    getSenders() { return this.senders }
    async createOffer() { return { type: 'offer', sdp: 'v=0\r\n' } }
    async setLocalDescription() {}
    async setRemoteDescription() {}
    close() {}
  }
  window.RTCPeerConnection = StubPeerConnection
}

const problems = []
function flag(vp, name, detail) { problems.push(`${vp} ${name}: ${detail}`); console.log(`  !! ${vp} ${name} — ${detail}`) }

async function audit(page, vp, name) {
  const r = await page.evaluate(() => {
    const de = document.documentElement
    const over = []
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue
      const b = el.getBoundingClientRect()
      if (b.width === 0 || b.height === 0) continue
      if (b.right > de.clientWidth + 1 || b.left < -1) {
        over.push(`${el.tagName.toLowerCase()}.${(el.className && String(el.className).slice(0, 40)) || ''} l=${Math.round(b.left)} r=${Math.round(b.right)}`)
      }
    }
    return { hscroll: de.scrollWidth - de.clientWidth, clientW: de.clientWidth, over: over.slice(0, 6) }
  })
  if (r.hscroll > 0) flag(vp, name, `horizontal scroll ${r.hscroll}px`)
  return r
}

async function shot(page, vpName, name) {
  const buf = await page.screenshot()
  const vp = ALL.find(v => v.name === vpName)
  await sharp(buf).resize(vp.width, vp.height, { fit: 'fill' }).png({ compressionLevel: 9 }).toFile(`${OUT}/${vpName}__${name}.png`)
  await audit(page, vpName, name)
}

async function staticPages(ctx, vp) {
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log('  [err]', e.message))
  const pages = [['landing', '/'], ['library', '/library'], ['sign-in', '/lab/sign-in'], ['app', '/app'], ['book-page', '/library?book=odyssey'], ['about', '/about']]
  for (const [name, path] of pages) {
    try {
      await page.goto(BASE + path, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2200)
      await shot(page, vp, name)
    } catch (e) { console.log('  [skip]', name, e.message) }
  }
  await page.close()
}

async function readerPages(ctx, vp) {
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log('  [err]', e.message))
  const go = async () => {
    await page.goto(BASE + '/reader', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="lab-root"][data-reader-ready="true"]', { timeout: 20000 })
    await page.waitForTimeout(900)
  }
  try {
    await go()
    await shot(page, vp, 'reader')

    // Contents
    try {
      await page.click('[data-testid="lab-header-chapter"]')
      await page.waitForTimeout(700)
      await shot(page, vp, 'reader-contents')
      await page.keyboard.press('Escape'); await page.waitForTimeout(400)
    } catch (e) { console.log('  [skip] contents', e.message) }

    // Super menu
    await go()
    await page.click('[data-testid="lab-super"]'); await page.waitForTimeout(600)
    await shot(page, vp, 'reader-supermenu')

    // Settings sheet
    try {
      await page.click('[data-testid="lab-super-row-settings"]'); await page.waitForTimeout(700)
      await shot(page, vp, 'reader-settings')
    } catch (e) { console.log('  [skip] settings', e.message) }

    // Account sheet
    await go()
    await page.click('[data-testid="lab-super"]'); await page.waitForTimeout(500)
    try {
      await page.click('[data-testid="lab-super-row-account"]'); await page.waitForTimeout(700)
      await shot(page, vp, 'reader-account')
    } catch (e) { console.log('  [skip] account', e.message) }

    // Chat
    await go()
    await page.click('[data-testid="lab-super"]'); await page.waitForTimeout(500)
    try {
      await page.click('[data-testid="lab-super-row-chat"]'); await page.waitForTimeout(900)
      await shot(page, vp, 'reader-chat')
    } catch (e) { console.log('  [skip] chat', e.message) }

    // Voice call
    await go()
    await page.click('[data-testid="lab-super"]'); await page.waitForTimeout(500)
    try {
      await page.click('[data-testid="lab-super-row-talk"]'); await page.waitForTimeout(900)
      await shot(page, vp, 'reader-call-connecting')
      await page.waitForFunction(() => !!window.__voiceStub && !!window.__voiceStub.dc, null, { timeout: 6000 })
      await page.evaluate(() => window.__voiceStub.openDataChannel())
      await page.evaluate(() => window.__voiceStub.attachAssistantTrack())
      await page.waitForTimeout(900)
      await shot(page, vp, 'reader-call-listening')
    } catch (e) { console.log('  [skip] call', e.message) }
  } catch (e) { console.log('  [skip] reader', e.message) }
  await page.close()
}

const sets = SET === 'landscape' ? LANDSCAPE : SET === 'unchanged' ? UNCHANGED : [...LANDSCAPE, ...UNCHANGED]
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: EXEC })
for (const vp of sets) {
  console.log('==', vp.name)
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dpr,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    userAgent: vp.ua,
    permissions: ['microphone'],
  })
  await ctx.addInitScript(STUB)
  await staticPages(ctx, vp.name)
  await readerPages(ctx, vp.name)
  await ctx.close()
}
await browser.close()
console.log(problems.length ? `\nPROBLEMS:\n${problems.join('\n')}` : '\nno overflow problems')
