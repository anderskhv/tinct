// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { isIosHandheldUserAgent, isLabPhoneSurface, labAfterTalk, labBottomSlot, labChromeInsetPx, LAB_GEAR_ITEMS, LAB_PHONE_BAR_ITEMS, labPhoneBarMode, labReadablePageHeightPx, labShowPageTurn, labShowPhoneBar, labShowReaderRail, labShowSlimTransport, labStatusLine, labVisibleChrome, labVisualViewportHeightPx, labVisibleBottomPx, labVoicePhaseLabel, lastContentClearsChrome, labPageFitsPaint, labScrollportOverflows, labChromeJumped, labBarMoved, lastPaintedTextBottom, measureLabBarTop, measureLabOnScreenBarTop, measureLabPageMetrics, measurePaintedOverflow, preferVisiblePaintedOverflow, nextLabVoiceGate, nextPaintShrinkTo, settlePageTotal, stabilizeLabPageMetrics } from './labChrome'

describe('lab chrome states', () => {
  it('keeps one status line per state', () => {
    expect(labStatusLine('reading', 'Book 1')).toBe('Reading · Book 1')
    expect(labStatusLine('hearing', 'Book 1')).toBe('Hearing · Book 1')
    expect(labStatusLine('talking', 'Book 1')).toBe('Talking · tap × to stop')
    expect(labStatusLine('talking', 'Book 1', 'desktop')).toBe('Talking · tap × to stop')
    expect(labStatusLine('talking', 'Book 1', 'phone')).toBe('Talking · tap the circle to stop')
  })

  it('shows Reading when the book is peeked over Hearing', () => {
    expect(labVisibleChrome('hearing', true)).toBe('reading')
    expect(labVisibleChrome('hearing', false)).toBe('hearing')
    expect(labVisibleChrome('talking', false)).toBe('talking')
  })

  it('returns Talk to Hearing only when that is where they came from', () => {
    expect(labAfterTalk('hearing')).toBe('hearing')
    expect(labAfterTalk('reading')).toBe('reading')
  })

  it('names Starting / Listening / Thinking / Speaking for the composer status', () => {
    expect(labVoicePhaseLabel('connecting')).toBe('Starting')
    expect(labVoicePhaseLabel('listening')).toBe('Listening')
    expect(labVoicePhaseLabel('thinking')).toBe('Thinking')
    expect(labVoicePhaseLabel('speaking')).toBe('Speaking')
    expect(labVoicePhaseLabel('idle')).toBeNull()
  })

  it('holds Starting until her greeting audio begins, not when the session is listening', () => {
    expect(nextLabVoiceGate('off', 'connecting', true)).toBe('connecting')
    expect(nextLabVoiceGate('connecting', 'connecting', true)).toBe('connecting')
    expect(nextLabVoiceGate('connecting', 'listening', true)).toBe('connecting')
    expect(nextLabVoiceGate('connecting', 'thinking', true)).toBe('connecting')
    expect(nextLabVoiceGate('connecting', 'speaking', true)).toBe('off')
    expect(nextLabVoiceGate('off', 'listening', true)).toBe('off')
    expect(nextLabVoiceGate('off', 'thinking', true)).toBe('off')
    expect(nextLabVoiceGate('connecting', 'idle', false)).toBe('off')
    expect(nextLabVoiceGate('connecting', 'idle', true)).toBe('off')
    expect(nextLabVoiceGate('connecting', 'connecting', true, 'Sign in to ask by voice.')).toBe('off')
    expect(nextLabVoiceGate('connecting', 'connecting', false)).toBe('connecting')
  })

  it('does not dismiss Starting just because the mic heard a blip', () => {
    expect(nextLabVoiceGate('connecting', 'listening', true, null, true)).toBe('connecting')
    expect(nextLabVoiceGate('connecting', 'speaking', true, null, true)).toBe('off')
    expect(nextLabVoiceGate('ready', 'speaking', true, null, true)).toBe('off')
  })
})

describe('lab phone surface', () => {
  it('treats iPhone Safari as phone even when the layout viewport is wide', () => {
    expect(isIosHandheldUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1')).toBe(true)
    expect(isLabPhoneSurface({
      matchMediaPhone: false,
      innerWidth: 980,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X)',
    })).toBe(true)
    expect(isLabPhoneSurface({ override: 'desktop', userAgent: 'Mozilla/5.0 (iPhone)' })).toBe(false)
    expect(isLabPhoneSurface({ matchMediaPhone: true, userAgent: 'Mozilla/5.0 (Macintosh)' })).toBe(true)
    expect(isLabPhoneSurface({ matchMediaPhone: false, innerWidth: 390, userAgent: 'Mozilla/5.0 (Macintosh)' })).toBe(true)
    expect(isLabPhoneSurface({ matchMediaPhone: false, innerWidth: 1280, userAgent: 'Mozilla/5.0 (Macintosh)' })).toBe(false)
    expect(isLabPhoneSurface({
      matchMediaPhone: false,
      innerWidth: 980,
      maxTouchPoints: 5,
      screenWidth: 390,
      userAgent: 'Mozilla/5.0 (Macintosh)',
    })).toBe(true)
    expect(isLabPhoneSurface({
      matchMediaPhone: false,
      innerWidth: 980,
      maxTouchPoints: 0,
      screenWidth: 390,
      userAgent: 'Mozilla/5.0 (Macintosh)',
    })).toBe(false)
  })
})

describe('lab phone bar mode', () => {
  it('keeps Hearing transport off the talk sheet', () => {
    expect(labPhoneBarMode('reading', false, false)).toBe('reading')
    expect(labPhoneBarMode('hearing', false, false)).toBe('hearing')
    expect(labPhoneBarMode('hearing', true, false)).toBe('reading')
    expect(labPhoneBarMode('hearing', false, true)).toBe('talking')
    expect(labPhoneBarMode('talking', false, false)).toBe('talking')
    expect(labPhoneBarMode('talking', false, true)).toBe('talking')
  })
})

describe('lab visual viewport height', () => {
  it('prefers visualViewport.height so 100dvh cannot hide the footer', () => {
    expect(labVisualViewportHeightPx(667, 844)).toBe(667)
    expect(labVisualViewportHeightPx(undefined, 844)).toBe(844)
    expect(labVisualViewportHeightPx(0, 390)).toBe(390)
    expect(labVisualViewportHeightPx()).toBe(0)
  })
})

describe('lab chrome inset invariant', () => {
  it('keeps typography samples stable while only page text changes', () => {
    const current = { height: 674, width: 354, lineHeight: 52, headlineHeight: 66, avgCharWidth: 17 }
    const nextPageSample = { height: 674, width: 354, lineHeight: 52, headlineHeight: 0, avgCharWidth: 12 }
    expect(stabilizeLabPageMetrics(current, nextPageSample, 66)).toEqual(current)
    expect(stabilizeLabPageMetrics(current, { ...nextPageSample, height: 773 }, 66)).toEqual({
      ...nextPageSample,
      height: 773,
      headlineHeight: 66,
      avgCharWidth: 17,
    })
  })

  it('insets by the measured chrome height plus 8px, never a guessed rem', () => {
    expect(labChromeInsetPx(112)).toBe(120)
    expect(labChromeInsetPx(0)).toBe(8)
    expect(labChromeInsetPx(-4)).toBe(8)
  })

  it('keeps last content bottom strictly above chrome top', () => {
    // Invariant: last content bottom y < chrome top y - LAB_OVERFLOW_CLEAR_PX.
    expect(lastContentClearsChrome(583, 600)).toBe(true)
    expect(lastContentClearsChrome(584, 600)).toBe(false)
    expect(lastContentClearsChrome(599, 600)).toBe(false)
    expect(lastContentClearsChrome(600, 600)).toBe(false)
    expect(lastContentClearsChrome(640, 600)).toBe(false)
  })

  it('shrinks a painted page by the last line, never below one word', () => {
    expect(nextPaintShrinkTo(0, 80, 8)).toBe(72)
    expect(nextPaintShrinkTo(0, 80, 0)).toBe(70)
    expect(nextPaintShrinkTo(0, 2, 8)).toBe(1)
    expect(nextPaintShrinkTo(10, 11, 4)).toBe(11)
  })

  it('does not eat Genesis page 1 down to the verse number when last-line count is the whole pack', () => {
    expect(nextPaintShrinkTo(0, 80, 80)).toBe(70)
    expect(nextPaintShrinkTo(0, 80, 79)).toBe(70)
    expect(nextPaintShrinkTo(0, 95, 95)).toBeGreaterThan(80)
  })

  it('treats a visualViewport or bar.top change as one Safari chrome jump', () => {
    expect(labChromeJumped({ viewportHeight: 667, barTop: 560 }, { viewportHeight: 667, barTop: 560 })).toBe(false)
    expect(labChromeJumped({ viewportHeight: 667, barTop: 560 }, { viewportHeight: 628, barTop: 560 })).toBe(true)
    expect(labChromeJumped({ viewportHeight: 667, barTop: 560 }, { viewportHeight: 667, barTop: 520 })).toBe(true)
  })

  it('remesures only when the painted bar actually moved', () => {
    expect(labBarMoved(560, 560)).toBe(false)
    expect(labBarMoved(560, 520)).toBe(true)
    expect(labBarMoved(0, 560)).toBe(false)
    expect(labBarMoved(560, 0)).toBe(false)
  })

  it('ignores the hidden measure host when reading last ink on the wrap', () => {
    document.body.innerHTML = `
      <div class="lab-page-wrap">
        <article class="lab-passage">
          <p class="lab-hearing-line"><span class="vis">Visible</span></p>
        </article>
        <div class="lab-page-measure">
          <article class="lab-passage">
            <p class="lab-hearing-line"><span class="hid">Hidden</span></p>
          </article>
        </div>
      </div>
    `
    const wrap = document.querySelector('.lab-page-wrap') as HTMLElement
    const host = document.querySelector('.lab-page-measure') as HTMLElement
    const vis = document.querySelector('.vis') as HTMLElement
    const hid = document.querySelector('.hid') as HTMLElement
    vis.getBoundingClientRect = () => ({ top: 380, bottom: 400, height: 20, width: 40, left: 15, right: 55, x: 15, y: 380, toJSON() {} })
    hid.getBoundingClientRect = () => ({ top: 880, bottom: 900, height: 20, width: 40, left: 15, right: 55, x: 15, y: 880, toJSON() {} })
    expect(lastPaintedTextBottom(wrap)).toBe(400)
    expect(lastPaintedTextBottom(host)).toBe(900)
  })

  it('reads the last painted text bottom from headline and lines', () => {
    document.body.innerHTML = `
      <div class="lab-page-wrap">
        <h1 class="lab-passage-headline">Book 1</h1>
        <p class="lab-hearing-line">Tell me, O Muse</p>
      </div>
    `
    const wrap = document.querySelector('.lab-page-wrap') as HTMLElement
    const headline = document.querySelector('.lab-passage-headline') as HTMLElement
    const line = document.querySelector('.lab-hearing-line') as HTMLElement
    headline.getBoundingClientRect = () => ({ top: 80, bottom: 160, height: 80, width: 360, left: 15, right: 375, x: 15, y: 80, toJSON() {} })
    line.getBoundingClientRect = () => ({ top: 160, bottom: 520, height: 360, width: 360, left: 15, right: 375, x: 15, y: 160, toJSON() {} })
    expect(lastPaintedTextBottom(wrap)).toBe(520)
  })

  it('uses the higher on-screen bar, not 100vh or a lower in-flow wrapper', () => {
    document.body.innerHTML = `
      <div class="lab-page-wrap">
        <p class="lab-hearing-line"><span>In</span><span> the</span></p>
      </div>
      <div class="lab-bottom-chrome" style="position:relative">
        <nav class="lab-page-turn"></nav>
        <footer class="lab-phone-bar"></footer>
      </div>
    `
    const wrap = document.querySelector('.lab-page-wrap') as HTMLElement
    const chrome = document.querySelector('.lab-bottom-chrome') as HTMLElement
    const rail = document.querySelector('.lab-page-turn') as HTMLElement
    const phone = document.querySelector('.lab-phone-bar') as HTMLElement
    const line = document.querySelector('.lab-hearing-line') as HTMLElement
    const word = line.querySelector('span') as HTMLElement
    chrome.getBoundingClientRect = () => ({ top: 620, bottom: 720, height: 100, width: 1024, left: 0, right: 1024, x: 0, y: 620, toJSON() {} })
    rail.getBoundingClientRect = () => ({ top: 620, bottom: 656, height: 36, width: 1024, left: 0, right: 1024, x: 0, y: 620, toJSON() {} })
    phone.getBoundingClientRect = () => ({ top: 560, bottom: 620, height: 60, width: 1024, left: 0, right: 1024, x: 0, y: 560, toJSON() {} })
    line.getBoundingClientRect = () => ({ top: 80, bottom: 600, height: 520, width: 700, left: 15, right: 715, x: 15, y: 80, toJSON() {} })
    word.getBoundingClientRect = () => ({ top: 560, bottom: 590, height: 30, width: 40, left: 15, right: 55, x: 15, y: 560, toJSON() {} })
    expect(measureLabBarTop(document, chrome)).toBe(560)
    const painted = measurePaintedOverflow(wrap, chrome)
    expect(painted).not.toBeNull()
    expect(painted!.chromeTop).toBe(560)
    expect(lastContentClearsChrome(painted!.lastBottom, painted!.chromeTop)).toBe(false)
  })

  it('keeps last ink above the bar after a shrink step', () => {
    expect(nextPaintShrinkTo(0, 80, 8, 121, 36)).toBeLessThan(72)
    expect(lastContentClearsChrome(543, 560)).toBe(true)
    expect(settlePageTotal(15, 14)).toBe(15)
    expect(settlePageTotal(14, 15)).toBe(14)
    expect(settlePageTotal(12, 12)).toBe(12)
    expect(settlePageTotal(1, null)).toBe(1)
  })

  it('treats inner passage/wrap scroll or last ink on the bar as an invalid page', () => {
    expect(labPageFitsPaint({ lastBottom: 543, chromeTop: 560 })).toBe(true)
    expect(labPageFitsPaint({ lastBottom: 544, chromeTop: 560 })).toBe(false)
    expect(labPageFitsPaint({ lastBottom: 547, chromeTop: 560, scrollOverflow: true })).toBe(false)
    document.body.innerHTML = `
      <div class="lab-page-wrap">
        <article class="lab-passage">
          <p class="lab-hearing-line"><span>In</span></p>
        </article>
      </div>
    `
    const wrap = document.querySelector('.lab-page-wrap') as HTMLElement
    const passage = document.querySelector('.lab-passage') as HTMLElement
    Object.defineProperty(wrap, 'scrollHeight', { configurable: true, value: 520 })
    Object.defineProperty(wrap, 'clientHeight', { configurable: true, value: 520 })
    Object.defineProperty(passage, 'scrollHeight', { configurable: true, value: 520 })
    Object.defineProperty(passage, 'clientHeight', { configurable: true, value: 513 })
    expect(labScrollportOverflows(wrap)).toBe(true)
    Object.defineProperty(passage, 'scrollHeight', { configurable: true, value: 513 })
    expect(labScrollportOverflows(wrap)).toBe(false)
  })

  it('clamps chrome top to the visible visualViewport, never 100vh', () => {
    expect(labVisibleBottomPx({ height: 628, offsetTop: 0 }, 844)).toBe(628)
    expect(labVisibleBottomPx({ height: 628, offsetTop: 12 }, 844)).toBe(640)
    expect(labVisibleBottomPx(undefined, 844)).toBe(844)
    document.body.innerHTML = `
      <footer class="lab-phone-bar"></footer>
    `
    const phone = document.querySelector('.lab-phone-bar') as HTMLElement
    phone.getBoundingClientRect = () => ({ top: 720, bottom: 800, height: 80, width: 390, left: 0, right: 390, x: 0, y: 720, toJSON() {} })
    const original = window.visualViewport
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: { height: 628, offsetTop: 0, addEventListener() {}, removeEventListener() {} },
    })
    try {
      expect(measureLabBarTop(document)).toBe(720)
      expect(measureLabOnScreenBarTop(document)).toBe(628)
    } finally {
      Object.defineProperty(window, 'visualViewport', { configurable: true, value: original })
    }
  })

  it('measurePaintedOverflow uses pager wrapper top clamped to visualViewport', () => {
    document.body.innerHTML = `
      <div class="lab-page-wrap">
        <p class="lab-hearing-line"><span>word</span></p>
      </div>
      <div class="lab-bottom-chrome">
        <nav class="lab-page-turn"></nav>
        <footer class="lab-phone-bar"></footer>
      </div>
    `
    const wrap = document.querySelector('.lab-page-wrap') as HTMLElement
    const chrome = document.querySelector('.lab-bottom-chrome') as HTMLElement
    const word = document.querySelector('span') as HTMLElement
    chrome.getBoundingClientRect = () => ({ top: 560, bottom: 720, height: 160, width: 390, left: 0, right: 390, x: 0, y: 560, toJSON() {} })
    word.getBoundingClientRect = () => ({ top: 600, bottom: 640, height: 40, width: 40, left: 15, right: 55, x: 15, y: 600, toJSON() {} })
    const original = window.visualViewport
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: { height: 628, offsetTop: 0, addEventListener() {}, removeEventListener() {} },
    })
    try {
      const painted = measurePaintedOverflow(wrap, chrome)
      expect(painted).not.toBeNull()
      expect(painted!.chromeTop).toBe(560)
      expect(labPageFitsPaint(painted!)).toBe(false)
    } finally {
      Object.defineProperty(window, 'visualViewport', { configurable: true, value: original })
    }
  })

  it('prefers visible paint when the measure host falsely fits', () => {
    document.body.innerHTML = `
      <div class="lab-page-measure"><p class="lab-hearing-line"><span>host</span></p></div>
      <article class="lab-passage"><p class="lab-hearing-line"><span>visible</span></p></article>
      <div class="lab-bottom-chrome"></div>
    `
    const visible = document.querySelector('.lab-passage') as HTMLElement
    const chrome = document.querySelector('.lab-bottom-chrome') as HTMLElement
    const hostWord = document.querySelector('.lab-page-measure span') as HTMLElement
    const visibleWord = visible.querySelector('span') as HTMLElement
    chrome.getBoundingClientRect = () => ({ top: 560, bottom: 720, height: 160, width: 390, left: 0, right: 390, x: 0, y: 560, toJSON() {} })
    hostWord.getBoundingClientRect = () => ({ top: 500, bottom: 540, height: 40, width: 40, left: 0, right: 40, x: 0, y: 500, toJSON() {} })
    visibleWord.getBoundingClientRect = () => ({ top: 610, bottom: 650, height: 40, width: 40, left: 0, right: 40, x: 0, y: 610, toJSON() {} })
    const hostPainted = { lastBottom: 540, chromeTop: 560, lineHeight: 40, lastLineWords: 1, scrollOverflow: false }
    const merged = preferVisiblePaintedOverflow(hostPainted, visible, chrome, true)
    expect(merged).not.toBeNull()
    expect(labPageFitsPaint(merged!)).toBe(false)
  })

  it('uses ink rects so a stretched hearing line does not look like overflow', () => {
    document.body.innerHTML = `
      <div class="lab-page-wrap">
        <h1 class="lab-passage-headline">Genesis 1</h1>
        <p class="lab-hearing-line"><span>¹</span><span> In</span><span> the</span></p>
      </div>
    `
    const wrap = document.querySelector('.lab-page-wrap') as HTMLElement
    const headline = document.querySelector('.lab-passage-headline') as HTMLElement
    const line = document.querySelector('.lab-hearing-line') as HTMLElement
    headline.getBoundingClientRect = () => ({ top: 80, bottom: 130, height: 50, width: 360, left: 15, right: 375, x: 15, y: 80, toJSON() {} })
    line.getBoundingClientRect = () => ({ top: 130, bottom: 520, height: 390, width: 360, left: 15, right: 375, x: 15, y: 130, toJSON() {} })
    const rangeProto = Range.prototype as Range & { getClientRects: () => DOMRectList }
    const original = rangeProto.getClientRects
    rangeProto.getClientRects = function getClientRects() {
      const host = this.commonAncestorContainer as Node
      const el = host.nodeType === 1 ? host as Element : host.parentElement
      if (el && (el as Element).classList?.contains('lab-hearing-line')) {
        const rect = { top: 130, bottom: 172, height: 42, width: 200, left: 15, right: 215, x: 15, y: 130, toJSON() {} } as DOMRect
        return [rect] as unknown as DOMRectList
      }
      return [] as unknown as DOMRectList
    }
    try {
      expect(lastPaintedTextBottom(wrap)).toBe(172)
    } finally {
      rangeProto.getClientRects = original
    }
  })
})


describe('lab paused vs playing chrome slot', () => {
  it('shows page-turn only while paused', () => {
    expect(labBottomSlot(false)).toBe('page-turn')
    expect(labBottomSlot(true)).toBe('transport')
    expect(labShowPageTurn({ playing: false, phoneAsk: false, pageCount: 3 })).toBe(true)
    expect(labShowPageTurn({ playing: true, phoneAsk: false, pageCount: 3 })).toBe(false)
    expect(labShowPageTurn({ playing: false, phoneAsk: true, pageCount: 3 })).toBe(false)
    expect(labShowPageTurn({ playing: false, phoneAsk: false, pageCount: 1 })).toBe(false)
    expect(labShowPageTurn({ playing: false, phoneAsk: false, pageCount: 1, canNextChapter: true })).toBe(true)
    expect(labShowReaderRail({ phoneAsk: false, phoneChrome: false, pageCount: 1, playing: false, canNextChapter: true })).toBe(true)
    expect(labShowSlimTransport({ playing: true, phoneAsk: false })).toBe(true)
    expect(labShowSlimTransport({ playing: false, phoneAsk: false })).toBe(false)
    expect(labShowSlimTransport({ playing: true, phoneAsk: true })).toBe(false)
    expect(labShowReaderRail({ phoneAsk: false, phoneChrome: true, pageCount: 3, playing: false })).toBe(true)
    expect(labShowReaderRail({ phoneAsk: false, phoneChrome: true, pageCount: 3, playing: true })).toBe(true)
    expect(labShowReaderRail({ phoneAsk: true, phoneChrome: true, pageCount: 3, playing: false })).toBe(false)
    expect(labShowReaderRail({ phoneAsk: false, phoneChrome: false, pageCount: 3, playing: false })).toBe(true)
    expect(labShowReaderRail({ phoneAsk: false, phoneChrome: false, pageCount: 3, playing: true })).toBe(false)
  })

  it('keeps the phone bar as Play | Chat | Talk and the gear as Library / Reading / Layout', () => {
    expect(LAB_PHONE_BAR_ITEMS).toEqual(['Play', 'Chat', 'Talk'])
    expect(LAB_GEAR_ITEMS).toEqual(['Library', 'Reading', 'Layout'])
    expect(LAB_GEAR_ITEMS).not.toContain('This book')
    expect(LAB_GEAR_ITEMS).not.toContain('Compare')
    expect(LAB_GEAR_ITEMS).not.toContain('Home')
    expect(LAB_GEAR_ITEMS).not.toContain('Saved')
    expect(LAB_GEAR_ITEMS).not.toContain('Profile')
  })
})

describe('lab readable page vs chrome rect', () => {
  it('uses chrome top as the page bottom, never a rem guess', () => {
    expect(labReadablePageHeightPx({ scrollportTop: 80, scrollportBottom: 560, chromeTop: 560 })).toBe(480)
    expect(labReadablePageHeightPx({ scrollportTop: 80, scrollportBottom: 560, chromeTop: 520 })).toBe(440)
  })

  it('measures page height from the chrome getBoundingClientRect top', () => {
    document.body.innerHTML = `
      <div class="lab-page-wrap">
        <article class="lab-passage">
          <h1 class="lab-passage-headline">Book 1</h1>
          <p class="lab-hearing-line">Tell me, O Muse</p>
        </article>
      </div>
      <div class="lab-bottom-chrome"></div>
    `
    const wrap = document.querySelector('.lab-page-wrap') as HTMLElement
    const chrome = document.querySelector('.lab-bottom-chrome') as HTMLElement
    const line = document.querySelector('.lab-hearing-line') as HTMLElement
    const headline = document.querySelector('.lab-passage-headline') as HTMLElement
    wrap.getBoundingClientRect = () => ({ top: 80, bottom: 560, height: 480, width: 390, left: 0, right: 390, x: 0, y: 80, toJSON() {} })
    chrome.getBoundingClientRect = () => ({ top: 560, bottom: 640, height: 80, width: 390, left: 0, right: 390, x: 0, y: 560, toJSON() {} })
    line.getBoundingClientRect = () => ({ top: 180, bottom: 220, height: 40, width: 360, left: 15, right: 375, x: 15, y: 180, toJSON() {} })
    headline.getBoundingClientRect = () => ({ top: 80, bottom: 160, height: 80, width: 360, left: 15, right: 375, x: 15, y: 80, toJSON() {} })
    const metrics = measureLabPageMetrics(wrap, chrome)
    expect(metrics).not.toBeNull()
    expect(metrics!.height).toBe(472)
    expect(metrics!.lineHeight).toBe(40)
    expect(metrics!.headlineHeight).toBe(80)
    expect(metrics!.avgCharWidth).toBeGreaterThan(0)
  })
})


describe('lab fullscreen', () => {
  it('hides Play/Chat/Talk in read fullscreen and keeps them for Talk', () => {
    expect(labShowPhoneBar({ phoneChrome: true, fullscreen: false, phoneAsk: false })).toBe(true)
    expect(labShowPhoneBar({ phoneChrome: true, fullscreen: true, phoneAsk: false })).toBe(false)
    expect(labShowPhoneBar({ phoneChrome: true, fullscreen: true, phoneAsk: true })).toBe(true)
    expect(labShowPhoneBar({ phoneChrome: false, fullscreen: false, phoneAsk: false })).toBe(false)
  })
})
