/** Production desktop still uses the vertical Chat / Feed / Cast rails. */
export const PRODUCTION_DESKTOP_PANES = ['Chat', 'Feed', 'Cast'] as const

/** The lab desktop right pane is Ask only. */
export const LAB_DESKTOP_PANES = ['Ask'] as const

export type ProductionDesktopPane = typeof PRODUCTION_DESKTOP_PANES[number]
export type LabDesktopPane = typeof LAB_DESKTOP_PANES[number]

/** One lab surface at a time. The ears cannot hear and talk together. */
export type LabChromeState = 'reading' | 'hearing' | 'talking'
export type LabReturnTo = 'reading' | 'hearing'

export function isProductionDesktopPane(label: string): label is ProductionDesktopPane {
  return (PRODUCTION_DESKTOP_PANES as readonly string[]).includes(label)
}

export function isLabDesktopPane(label: string): label is LabDesktopPane {
  return (LAB_DESKTOP_PANES as readonly string[]).includes(label)
}

export type LabSurface = 'desktop' | 'phone'

export type LabPageGeometry = { width: number; height: number }

/** A settled page list is valid only for the box it was painted into. */
export function labPageGeometryChanged(
  previous: LabPageGeometry | null,
  next: LabPageGeometry,
  tolerance = 1,
): boolean {
  if (!previous) return false
  return Math.abs(previous.width - next.width) > tolerance
    || Math.abs(previous.height - next.height) > tolerance
}

export function labVisibleChrome(state: LabChromeState, peekBook: boolean): LabChromeState {
  return peekBook ? 'reading' : state
}

export function labStatusLine(
  state: LabChromeState,
  chapterLabel: string,
  surface: LabSurface = 'desktop',
): string {
  if (state === 'talking') {
    return surface === 'phone'
      ? 'Talking · tap the circle to stop'
      : 'Talking · tap × to stop'
  }
  if (state === 'hearing') return `Hearing · ${chapterLabel}`
  return `Reading · ${chapterLabel}`
}

export function labAfterTalk(returnTo: LabReturnTo): LabChromeState {
  return returnTo
}

export const LAB_CONNECTING_FAIL_MS = 8000

export type LabVoiceGatePhase = 'off' | 'connecting' | 'ready'

export function nextLabVoiceGate(
  current: LabVoiceGatePhase,
  conversationState: 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking',
  voiceActive: boolean,
  notice?: string | null,
  _userSpeechStarted?: boolean,
): LabVoiceGatePhase {
  if (notice || conversationState === 'idle') return 'off'
  if (!voiceActive && conversationState !== 'connecting' && conversationState !== 'listening' && conversationState !== 'thinking') {
    return 'off'
  }
  // The gate describes transport setup only. Once the live voice machine
  // reports listening, thinking, or speaking, reveal that exact state rather
  // than holding a synthetic startup label over it.
  if (conversationState !== 'connecting') return 'off'
  if (current === 'off' || current === 'connecting') return 'connecting'
  return current
}

export function labVoicePhaseLabel(phase: 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking'): string | null {
  if (phase === 'connecting') return 'Connecting'
  if (phase === 'listening') return 'Listening'
  if (phase === 'thinking') return 'Thinking'
  if (phase === 'speaking') return 'Speaking'
  return null
}

export type LabLayoutHint = 'phone' | 'desktop' | null

/** iPhone Safari can report a wide layout-viewport (desktop site / 980px). */
export function isIosHandheldUserAgent(userAgent: string): boolean {
  return /iPhone|iPod/i.test(userAgent)
}

export function isLabPhoneSurface(input: {
  override?: LabLayoutHint
  matchMediaPhone?: boolean
  userAgent?: string
  innerWidth?: number
  maxTouchPoints?: number
  screenWidth?: number
}): boolean {
  if (input.override === 'phone') return true
  if (input.override === 'desktop') return false
  if (input.userAgent && isIosHandheldUserAgent(input.userAgent)) return true
  const touch = (input.maxTouchPoints ?? 0) > 0
  if (touch && typeof input.screenWidth === 'number' && input.screenWidth <= 430) return true
  if (typeof input.innerWidth === 'number' && input.innerWidth <= 430) return true
  if (input.matchMediaPhone) return true
  return false
}

/** Footer chrome even if isPhone class is wrong on a narrow/iPhone surface. */
export function shouldShowLabPhoneFooter(input: {
  isPhone?: boolean
  override?: LabLayoutHint
  userAgent?: string
  innerWidth?: number
  maxTouchPoints?: number
  screenWidth?: number
}): boolean {
  if (input.override === 'desktop') return false
  if (input.isPhone) return true
  return isLabPhoneSurface({
    override: input.override,
    userAgent: input.userAgent,
    innerWidth: input.innerWidth,
    maxTouchPoints: input.maxTouchPoints,
    screenWidth: input.screenWidth,
  })
}

/** Paused chrome is page-turn; playing chrome is transport. */
export function labBottomSlot(playing: boolean): 'page-turn' | 'transport' {
  return playing ? 'transport' : 'page-turn'
}

/** Previous/Next only while paused (Reading, or Hearing paused). */
export function labShowPageTurn(input: {
  playing: boolean
  phoneAsk: boolean
  pageCount: number
  canPrevChapter?: boolean
  canNextChapter?: boolean
}): boolean {
  if (input.playing || input.phoneAsk) return false
  return input.pageCount > 1 || !!input.canPrevChapter || !!input.canNextChapter
}

/** The reader rail keeps the same progress geometry in Read and Listen. */
export function labShowReaderRail(input: {
  phoneAsk: boolean
  phoneChrome: boolean
  pageCount: number
  playing: boolean
  canPrevChapter?: boolean
  canNextChapter?: boolean
}): boolean {
  if (input.phoneAsk) return false
  if (input.phoneChrome) return true
  return !input.playing && (input.pageCount > 1 || !!input.canPrevChapter || !!input.canNextChapter)
}

export type LabPhoneBarMode = 'reading' | 'hearing' | 'talking'

export const LAB_PHONE_BAR_ITEMS = ['Play', 'Chat', 'Talk'] as const
export const LAB_GEAR_ITEMS = ['Library', 'Reading', 'Layout'] as const
/** Phone footer / sheet mode. The Play | Chat | Talk bar stays on. */
export function labPhoneBarMode(
  state: LabChromeState,
  peekBook: boolean,
  phoneAskOpen: boolean,
): LabPhoneBarMode {
  if (phoneAskOpen || state === 'talking') return 'talking'
  if (state === 'hearing' && !peekBook) return 'hearing'
  return 'reading'
}

export const LAB_CHROME_GAP_PX = 8

/** CSS var: visible viewport height on phone (iOS visualViewport, not 100dvh). */
export const LAB_VVH_VAR = '--lab-vvh'

/** Prefer visualViewport.height (visible iOS chrome) over innerHeight. */
export function labVisualViewportHeightPx(
  viewportHeight?: number,
  innerHeight?: number,
): number {
  const vv = typeof viewportHeight === 'number' && viewportHeight > 0 ? viewportHeight : 0
  const inner = typeof innerHeight === 'number' && innerHeight > 0 ? innerHeight : 0
  return Math.round(vv || inner)
}

/**
 * Pin the phone shell to the visible viewport so the in-flow footer
 * sits above the iOS Safari toolbar. 100vh/100dvh are the large viewport
 * and push the footer below the fold.
 */
export function bindLabVisualViewportHeight(host: HTMLElement): () => void {
  const apply = () => {
    const vv = typeof window !== 'undefined' ? window.visualViewport?.height : undefined
    const inner = typeof window !== 'undefined' ? window.innerHeight : undefined
    const px = labVisualViewportHeightPx(vv, inner)
    if (px > 0) host.style.setProperty(LAB_VVH_VAR, `${px}px`)
  }
  apply()
  const viewport = typeof window !== 'undefined' ? window.visualViewport : null
  viewport?.addEventListener('resize', apply)
  viewport?.addEventListener('scroll', apply)
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', apply)
    window.addEventListener('orientationchange', apply)
  }
  return () => {
    viewport?.removeEventListener('resize', apply)
    viewport?.removeEventListener('scroll', apply)
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', apply)
      window.removeEventListener('orientationchange', apply)
    }
    host.style.removeProperty(LAB_VVH_VAR)
  }
}

/**
 * Legacy measure helpers. Phone overflow is structural flex now;
 * these are not the overflow strategy.
 */
export function labChromeInsetPx(chromeHeightPx: number, gap = LAB_CHROME_GAP_PX): number {
  return Math.max(0, chromeHeightPx) + gap
}

/** Painted last ink must sit far enough above chrome to preserve a calm gutter. */
export const LAB_OVERFLOW_CLEAR_PX = 24

/** Extra slack when measuring phone hearing pages — descenders + highlight box. */
export const LAB_HEARING_MEASURE_SLACK_PX = 8

/** Play/Chat/Talk, page-turn rail, or in-flow audio — never 100vh. */
export const LAB_BAR_SELECTORS = [
  '.lab-phone-bar',
  '.lab-page-turn',
  '.lab-phone-transport',
  '.lab-hearing-transport',
] as const

/** Visible layout bottom from visualViewport + offsetTop. Never 100vh. */
export function labVisibleBottomPx(
  viewport?: { height?: number; offsetTop?: number } | null,
  innerHeight?: number,
): number {
  const height = labVisualViewportHeightPx(viewport?.height, innerHeight)
  if (height <= 0) return 0
  const offset = typeof viewport?.offsetTop === 'number' && viewport.offsetTop > 0 ? viewport.offsetTop : 0
  return Math.round(height + offset)
}

/** Highest on-screen bar top (smallest top). Fallback chrome if no bar is visible. */
export function measureLabBarTop(
  scope?: ParentNode | null,
  fallback?: HTMLElement | null,
): number {
  let top = 0
  const consider = (el: Element | null | undefined) => {
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.height <= 1 || rect.top <= 0) return
    if (top === 0 || rect.top < top) top = rect.top
  }
  const root = scope ?? (typeof document !== 'undefined' ? document : null)
  if (root) {
    for (const selector of LAB_BAR_SELECTORS) {
      root.querySelectorAll(selector).forEach(consider)
    }
  }
  consider(fallback ?? null)
  return top
}

/**
 * Bar top clamped to the visible viewport so last ink must clear the
 * on-screen bar (phone / page-turn / transport), not a below-fold layout box.
 */
export function measureLabOnScreenBarTop(
  scope?: ParentNode | null,
  fallback?: HTMLElement | null,
): number {
  const barTop = measureLabBarTop(scope, fallback)
  const vv = typeof window !== 'undefined' ? window.visualViewport : null
  const inner = typeof window !== 'undefined' ? window.innerHeight : undefined
  const visibleBottom = labVisibleBottomPx(vv, inner)
  if (visibleBottom <= 0) return barTop
  if (barTop <= 0) return visibleBottom
  return Math.min(barTop, visibleBottom)
}

function paintFromMeasureHost(root: HTMLElement): boolean {
  return root.classList.contains('lab-page-measure') || !!root.closest('.lab-page-measure')
}

function paintQueryAll(root: HTMLElement, selector: string): Element[] {
  const inHost = paintFromMeasureHost(root)
  return [...root.querySelectorAll(selector)].filter(node => inHost || !node.closest('.lab-page-measure'))
}

/** Inner scroll on the page wrap or passage — even 1px is an invalid page. */
export function labScrollportOverflows(root: HTMLElement): boolean {
  const inHost = paintFromMeasureHost(root)
  const nodes: Element[] = []
  if (root.classList.contains('lab-page-wrap') || root.classList.contains('lab-passage')) {
    nodes.push(root)
  }
  root.querySelectorAll('.lab-page-wrap, .lab-passage').forEach((el) => {
    if (!inHost && el.closest('.lab-page-measure')) return
    nodes.push(el)
  })
  for (const el of nodes) {
    if (el.scrollHeight > el.clientHeight) return true
  }
  return false
}

export function lastContentClearsChrome(lastContentBottom: number, chromeTop: number): boolean {
  return lastContentBottom < chromeTop - LAB_OVERFLOW_CLEAR_PX
}

/** Page is invalid if last ink is at/below the bar or the scrollport scrolls. */
export function labPageFitsPaint(input: {
  lastBottom: number
  chromeTop: number
  scrollOverflow?: boolean
}): boolean {
  if (input.scrollOverflow) return false
  return lastContentClearsChrome(input.lastBottom, input.chromeTop)
}

export function canMeasurePaintedOverflow(lastBottom: number, chromeTop: number): boolean {
  return lastBottom > 0 && chromeTop > 0
}

function paintedNodeBottom(el: Element): number {
  // Prefer ink rects. The line box can flex-stretch to the cream hole;
  // using that bottom makes after-paint shrink think nothing fits.
  try {
    const range = document.createRange()
    range.selectNodeContents(el)
    const rects = range.getClientRects()
    let bottom = 0
    for (let i = 0; i < rects.length; i++) {
      if (rects[i].height > 1) bottom = Math.max(bottom, rects[i].bottom)
    }
    if (bottom > 0) return bottom
  } catch {
    /* jsdom */
  }
  return el.getBoundingClientRect().bottom
}

/** Last visible text bottom, including the page-1 headline and descenders. */
export function lastPaintedTextBottom(root: HTMLElement): number {
  let last = 0
  // Word tokens are ink. A stretched .lab-hearing-line box is not.
  paintQueryAll(root, '.lab-hearing-line > span, .lab-hearing-word').forEach((node) => {
    const rect = node.getBoundingClientRect()
    if (rect.height > 1) last = Math.max(last, rect.bottom)
  })
  if (last > 0) {
    const headline = paintQueryAll(root, '.lab-passage-headline')[0]
    if (headline) last = Math.max(last, paintedNodeBottom(headline))
    return last
  }
  paintQueryAll(root, '.lab-passage-headline, .lab-hearing-line').forEach((node) => {
    last = Math.max(last, paintedNodeBottom(node))
  })
  return last
}

/** Words whose boxes sit on the last painted line of the last paragraph. */
export function lastPaintedLineWordCount(root: HTMLElement): number {
  const lines = paintQueryAll(root, '.lab-hearing-line')
  const line = lines[lines.length - 1]
  if (!line) return 0
  try {
    const range = document.createRange()
    range.selectNodeContents(line)
    const rects = [...range.getClientRects()].filter(rect => rect.height > 1)
    if (rects.length === 0) return 0
    const lastRect = rects[rects.length - 1]
    // Direct word tokens only — verse <sup> / mark buttons are not a line of text.
    const words = line.querySelectorAll(':scope > span')
    let count = 0
    words.forEach((word) => {
      const r = word.getBoundingClientRect()
      if (r.height > 0 && Math.abs(r.bottom - lastRect.bottom) < 8) count += 1
    })
    return count
  } catch {
    return 0
  }
}

export interface LabPaintedOverflow {
  lastBottom: number
  chromeTop: number
  lineHeight: number
  lastLineWords: number
  scrollOverflow: boolean
}

export function measurePaintedOverflow(
  root: HTMLElement,
  chrome?: HTMLElement | null,
): LabPaintedOverflow | null {
  const scope = root.ownerDocument ?? (typeof document !== 'undefined' ? document : null)
  // Authority: getBoundingClientRect of Play/Chat/Talk / page-turn / transport.
  // Never 100vh, never dvh, never visualViewport as a stand-in for the bar.
  const chromeTop = measureLabBarTop(scope, chrome ?? null)
  const lastBottom = lastPaintedTextBottom(root)
  if (!canMeasurePaintedOverflow(lastBottom, chromeTop)) return null
  const line = root.querySelector('.lab-hearing-line')
  const lineHeight = line ? labLineHeightPx(line) : 0
  return {
    lastBottom,
    chromeTop,
    lineHeight,
    lastLineWords: lastPaintedLineWordCount(root),
    scrollOverflow: labScrollportOverflows(root),
  }
}

/** Compare mirrors one page map; only the primary column may resize it. */
export function labPaginationPaintRoot(root: HTMLElement): HTMLElement {
  if (!root.querySelector('.lab-book-col-compare')) return root
  return root.querySelector<HTMLElement>('.lab-book-col:not(.lab-book-col-compare)') ?? root
}

/** After document.fonts.ready + first paint (rAF). Never a pre-paint guess. */
export function afterLabPaint(run: () => void): () => void {
  let cancelled = false
  const raf: (cb: FrameRequestCallback) => number = typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame
    : ((cb: FrameRequestCallback) => window.setTimeout(() => cb(0), 0) as unknown as number)
  const fonts = typeof document !== 'undefined' ? document.fonts : undefined
  const ready = fonts?.ready ?? Promise.resolve()
  void Promise.resolve(ready).then(() => {
    raf(() => {
      raf(() => {
        if (!cancelled) run()
      })
    })
  })
  return () => { cancelled = true }
}

export function labChromeJumped(
  prev: { viewportHeight: number; barTop: number },
  next: { viewportHeight: number; barTop: number },
): boolean {
  return prev.viewportHeight !== next.viewportHeight || prev.barTop !== next.barTop
}

/** Remesure only when the painted bar actually moved. */
export function labBarMoved(prevTop: number, nextTop: number): boolean {
  return prevTop > 0 && nextTop > 0 && prevTop !== nextTop
}

/** Clear space between last ink and the chrome top. */
export function labPageSlackPx(lastBottom: number, chromeTop: number): number {
  return Math.max(0, chromeTop - LAB_OVERFLOW_CLEAR_PX - lastBottom)
}

export type LabPageAdjust = 'peel' | 'grow' | 'polish' | null

/** Room for at least one more line below the last painted ink. */
export function labPaintHasGrowableSlack(
  lastBottom: number,
  chromeTop: number,
  lineHeight: number,
): boolean {
  const slack = labPageSlackPx(lastBottom, chromeTop)
  const line = lineHeight > 8 ? lineHeight : 24
  return slack > line
}

/** After a peel, only grow when slack is clearly more than one line. */
export function shouldGrowPaintedPage(
  lastAdjust: LabPageAdjust,
  slackPx: number,
  lineHeight: number,
): boolean {
  const line = lineHeight > 8 ? lineHeight : 24
  if (slackPx <= line) return false
  // A typographic cleanup may intentionally leave a line or two. If a resize
  // leaves substantially more space than that, refill instead of freezing a
  // nearly empty page; the next overflow trial can still revert to the clean end.
  if (lastAdjust === 'polish') return slackPx > line * 2.5
  if (lastAdjust !== 'peel') return true
  return slackPx > line * 1.1
}

/** Words to pull from the next page when slack allows growth. */
export function growWordsFromSlack(
  lastLineWords = 0,
  slackPx = 0,
  lineHeight = 0,
): number {
  const trusted = lastLineWords > 0 && lastLineWords <= 16
  // Pull at most half a painted line per trial. Word widths vary enough that a
  // whole-row estimate can unexpectedly wrap onto two rows on narrow phones.
  let words = trusted ? Math.max(1, Math.floor(lastLineWords / 2)) : 4
  if (slackPx > 40 && lineHeight > 8) {
    const lines = Math.max(1, Math.floor(slackPx / lineHeight))
    words = Math.max(words, Math.min(lines * (trusted ? Math.max(1, Math.floor(lastLineWords / 2)) : 4), 24))
  }
  return Math.max(1, words)
}

/**
 * How far to pull `to` back so the next paint is one line (or a binary half) shorter.
 * Always leaves at least one word on the page.
 */
export function nextPaintShrinkTo(
  from: number,
  to: number,
  lastLineWords = 0,
  overflowPx = 0,
  lineHeight = 0,
): number {
  const span = to - from
  if (span <= 1) return from + 1
  // A last-line count of "almost every word" is a bad measure (stretched box /
  // verse spans). Never eat the page down to the first verse number.
  const trusted = lastLineWords > 0 && lastLineWords < span && lastLineWords <= 16
  let cut = trusted ? lastLineWords : Math.max(1, Math.min(12, Math.ceil(span / 8)))
  if (overflowPx > 40 && lineHeight > 8) {
    const lines = Math.max(1, Math.ceil(overflowPx / lineHeight))
    const perLine = trusted ? lastLineWords : Math.max(6, Math.min(12, Math.ceil(span / 16)))
    cut = Math.max(cut, Math.min(span - 1, lines * perLine))
  }
  return Math.max(from + 1, to - cut)
}

/**
 * M is the current complete page-list length.
 * Never freeze an underestimate (that is how 9/8 happens).
 */
export function settlePageTotal(currentTotal: number, _previousSettled?: number | null): number {
  return Math.max(1, currentTotal)
}

/** Readable page height: chrome top is the bottom edge of the page. */
export function labReadablePageHeightPx(input: {
  scrollportTop: number
  scrollportBottom: number
  chromeTop: number
}): number {
  const bottom = Math.min(input.scrollportBottom, input.chromeTop)
  return Math.max(0, Math.round(bottom - input.scrollportTop))
}

export function labLineHeightPx(line: Element): number {
  const style = typeof getComputedStyle === 'function' ? getComputedStyle(line) : null
  const lh = style?.lineHeight ?? ''
  if (lh.endsWith('px')) {
    const px = parseFloat(lh)
    if (Number.isFinite(px) && px > 8) return px
  }
  try {
    const range = document.createRange()
    range.selectNodeContents(line)
    const rects = range.getClientRects()
    if (rects.length > 0 && rects[0].height > 8) return rects[0].height
  } catch {
    /* jsdom */
  }
  const height = line.getBoundingClientRect().height
  return height > 8 ? height : 0
}

export interface LabPageMetrics {
  height: number
  width: number
  lineHeight: number
  headlineHeight: number
  avgCharWidth: number
}

/**
 * Text changes on every page turn, but the typography does not. Keep the
 * measured glyph width and chapter-title allowance stable until the actual
 * page geometry or line height changes.
 */
export function stabilizeLabPageMetrics(
  current: LabPageMetrics | null,
  measured: LabPageMetrics,
  knownHeadlineHeight = 0,
): LabPageMetrics {
  const headlineHeight = measured.headlineHeight > 0
    ? measured.headlineHeight
    : Math.max(0, knownHeadlineHeight)
  if (
    current
    && current.width === measured.width
    && current.lineHeight === measured.lineHeight
  ) {
    return {
      ...measured,
      headlineHeight: Math.max(current.headlineHeight, headlineHeight),
      avgCharWidth: current.avgCharWidth,
    }
  }
  return { ...measured, headlineHeight }
}

export function canUseLabPageMetrics(metrics: LabPageMetrics): boolean {
  return metrics.height >= metrics.lineHeight
    && metrics.width > 40
    && metrics.lineHeight > 8
    && metrics.avgCharWidth > 0
}

/** After layout: page height is chrome.getBoundingClientRect().top minus content top. */
export function measureLabPageMetrics(
  scrollport: HTMLElement,
  chrome: HTMLElement | null,
): LabPageMetrics | null {
  const wrapRect = scrollport.getBoundingClientRect()
  const chromeRect = chrome?.getBoundingClientRect()
  const passage = scrollport.querySelector('.lab-passage') as HTMLElement | null
  const line = scrollport.querySelector('.lab-hearing-line')
  const headline = scrollport.querySelector('.lab-passage-headline')
  const style = passage && typeof getComputedStyle === 'function' ? getComputedStyle(passage) : null
  const padTop = parseFloat(style?.paddingTop || '0') || 0
  const padBottom = parseFloat(style?.paddingBottom || '0') || 0
  const padLeft = parseFloat(style?.paddingLeft || '0') || 0
  const padRight = parseFloat(style?.paddingRight || '0') || 0
  const scope = scrollport.ownerDocument ?? (typeof document !== 'undefined' ? document : null)
  const chromeTopFromRect = chromeRect && chromeRect.height > 0 ? chromeRect.top : wrapRect.bottom
  const onScreenBarTop = measureLabOnScreenBarTop(scope, chrome)
  const chromeTop = onScreenBarTop > 0
    ? Math.min(chromeTopFromRect, onScreenBarTop)
    : chromeTopFromRect
  const rawHeight = labReadablePageHeightPx({
    scrollportTop: wrapRect.top + padTop,
    scrollportBottom: wrapRect.bottom - padBottom,
    chromeTop,
  })
  const height = Math.max(0, rawHeight - LAB_HEARING_MEASURE_SLACK_PX)
  const lineRect = line?.getBoundingClientRect()
  const passageWidth = passage?.getBoundingClientRect().width ?? wrapRect.width
  const width = lineRect && lineRect.width > 0
    ? lineRect.width
    : Math.max(0, passageWidth - padLeft - padRight)
  let lineHeight = line ? labLineHeightPx(line) : 0
  // A flex-stretched paragraph can report the whole reading window as its
  // line height. Prefer the median painted text row in that case.
  if (line && lineHeight > height && height > 0) {
    try {
      const range = document.createRange()
      range.selectNodeContents(line)
      const heights = [...range.getClientRects()]
        .map(rect => rect.height)
        .filter(value => value > 8 && value < 160)
        .sort((a, b) => a - b)
      if (heights.length > 0) {
        lineHeight = heights[Math.floor(heights.length / 2)]
      } else {
        const lineStyle = typeof getComputedStyle === 'function' ? getComputedStyle(line) : null
        const fontSize = parseFloat(lineStyle?.fontSize || '0')
        if (fontSize > 8) lineHeight = fontSize * 1.45
      }
    } catch {
      /* jsdom */
    }
  }
  const headlineHeight = headline ? headline.getBoundingClientRect().height : 0
  const avgCharWidth = labAvgCharWidth(line)
  const metrics = { height, width, lineHeight, headlineHeight, avgCharWidth }
  return canUseLabPageMetrics(metrics) ? metrics : null
}

function firstLineInk(line: Element): { width: number; top: number } | null {
  try {
    const range = document.createRange()
    range.selectNodeContents(line)
    const rects = [...range.getClientRects()].filter(rect => rect.height > 1 && rect.width > 1)
    if (rects.length === 0) return null
    const top = rects[0].top
    const row = rects.filter(rect => Math.abs(rect.top - top) < 8)
    const left = Math.min(...row.map(rect => rect.left))
    const right = Math.max(...row.map(rect => rect.right))
    return { width: Math.max(0, right - left), top }
  } catch {
    return null
  }
}

function firstLineCharCount(line: Element, firstTop: number): number {
  const words = line.querySelectorAll(':scope > span')
  if (words.length > 0) {
    let chars = 0
    let count = 0
    words.forEach((word) => {
      const rect = word.getBoundingClientRect()
      if (rect.height > 0 && Math.abs(rect.top - firstTop) < 8) {
        chars += (word.textContent || '').replace(/\s+/g, ' ').length
        count += 1
      }
    })
    chars += Math.max(0, count - 1)
    if (chars > 0) return chars
  }
  return 0
}

function canvasSampleCharWidth(line: Element): number {
  try {
    if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return 0
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return 0
    const style = typeof getComputedStyle === 'function' ? getComputedStyle(line) : null
    if (style?.font) context.font = style.font
    const sample = 'abcdefghijklmnopqrstuvwxyz'
    const width = context.measureText(sample).width
    return width > 0 ? width / sample.length : 0
  } catch {
    return 0
  }
}

/** Real glyph width from one painted row; never divide by a wrapped paragraph. */
export function labAvgCharWidth(line: Element | null | undefined): number {
  if (!line) return 0
  const lineRect = line.getBoundingClientRect()
  if (lineRect.width <= 0) return 0
  const first = firstLineInk(line)
  if (first && first.width > 0) {
    const chars = firstLineCharCount(line, first.top)
    if (chars > 0) {
      const avg = first.width / chars
      // Verse superscripts and proper names are wider than a typical first row.
      if (avg >= 3) return avg * 1.12
    }
  }
  const sampled = canvasSampleCharWidth(line)
  if (sampled >= 3) return sampled
  const text = (line.textContent || '').replace(/\s+/g, ' ').trim()
  const lineHeight = labLineHeightPx(line)
  const wrapped = lineHeight > 8 && lineRect.height > lineHeight * 1.5
  return !wrapped && text.length > 0 ? lineRect.width / text.length : 0
}

export function bindLabChromeInsetVar(
  host: HTMLElement,
  chrome: HTMLElement,
  varName: string,
): () => void {
  const apply = () => {
    const inset = labChromeInsetPx(chrome.getBoundingClientRect().height)
    host.style.setProperty(varName, `${inset}px`)
  }
  apply()
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(apply) : null
  ro?.observe(chrome)
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', apply)
    window.addEventListener('orientationchange', apply)
  }
  return () => {
    ro?.disconnect()
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', apply)
      window.removeEventListener('orientationchange', apply)
    }
  }
}


export function labShowPhoneBar(input: {
  phoneChrome: boolean
  fullscreen: boolean
  phoneAsk: boolean
}): boolean {
  if (!input.phoneChrome) return false
  if (input.phoneAsk) return true
  return !input.fullscreen
}

export type LabPageTurnDirection = -1 | 1

/** Horizontal swipes turn one page only when horizontal intent is unambiguous. */
export function labSwipePageDirection(
  deltaX: number,
  deltaY: number,
  threshold = 44,
): LabPageTurnDirection | null {
  if (Math.abs(deltaX) < threshold) return null
  if (Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return null
  return deltaX < 0 ? 1 : -1
}

/** Short taps in the outer thirds turn pages; the centre remains selection-safe. */
export function labTapPageDirection(
  clientX: number,
  left: number,
  width: number,
  edgeFraction = 0.34,
): LabPageTurnDirection | null {
  if (width <= 0) return null
  const x = clientX - left
  if (x < 0 || x > width) return null
  if (x <= width * edgeFraction) return -1
  if (x >= width * (1 - edgeFraction)) return 1
  return null
}
