// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LAB_KEYBOARD_SHEET_HOLD_MS, bindLabVisualViewportHeight, labPageMapFitsShell, labShellHeightPx, measureLabOnScreenBarTop } from './labChrome'
import { shrinkNativePageAfterPaint } from './LabNativePaginator'
import type { ChapterHearingPage } from './labHearing'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

it.each(['focused sheet', 'closed sheet'])('does not cut a full reader page to the keyboard height with a %s', state => {
  document.body.innerHTML = '<main id="shell"><footer class="lab-phone-bar"></footer></main><section data-lab-keyboard-sheet><input></section>'
  const shell = document.getElementById('shell')!
  const bar = document.querySelector<HTMLElement>('.lab-phone-bar')!
  bar.getBoundingClientRect = () => ({top:760,bottom:844,height:84,width:390,left:0,right:390,x:0,y:760,toJSON(){}})
  const viewport = Object.assign(new EventTarget(), {height:844,offsetTop:0,scale:1})
  vi.stubGlobal('visualViewport', viewport)
  vi.stubGlobal('innerHeight', 844)
  const unbind = bindLabVisualViewportHeight(shell)
  try {
    const paragraphs = [Array.from({length:60}, (_, i) => `word${i}`).join(' ')]
    const pages: ChapterHearingPage[] = [{paragraphIndex:0,from:0,to:40}, {paragraphIndex:0,from:40,to:60}]
    const paintedPage = () => shrinkNativePageAfterPaint(paragraphs, pages, 0, {
      lastBottom:700, chromeTop:measureLabOnScreenBarTop(document), lineHeight:40, lastLineWords:6,
    })
    expect(paintedPage()).toBe(pages)
    document.querySelector('input')!.focus()
    viewport.height = 514
    viewport.dispatchEvent(new Event('resize'))
    if (state === 'closed sheet') {
      document.querySelector('section')!.remove()
      // iOS may send this before its visual viewport has returned to full height.
      viewport.dispatchEvent(new Event('resize'))
    }
    // A docked card overlays the reader; the existing shell keeps its full leaf.
    expect(shell.style.getPropertyValue('--lab-vvh')).toBe('844px')
    // The correction must use that same leaf, not persistently move source words
    // to later pages because the keyboard temporarily covers its lower half.
    expect(paintedPage()).toBe(pages)
  } finally { unbind() }
})

/**
 * The window's own height can drop with the keyboard too (iPhone, 26 and 27 Nov 2026: half the page blank after a
 * card with follow-ups). iOS pans the window past the document's end to show the field, and innerHeight then
 * reports only what is left of the document; other browsers resize the window. The shell followed it, the chapter
 * was laid out again in half-height pages behind the card, and a follow-up that opened Chat kept such a page.
 */
describe('the shell under a keyboard-docked card when the window itself reports less', () => {
  const mount = () => {
    document.body.innerHTML = '<main id="shell"></main><section data-lab-keyboard-sheet><textarea></textarea></section><input id="plain">'
    const viewport = Object.assign(new EventTarget(), { height: 844, offsetTop: 0, scale: 1 })
    vi.stubGlobal('visualViewport', viewport)
    vi.stubGlobal('innerHeight', 844)
    vi.stubGlobal('innerWidth', 390)
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const shell = document.getElementById('shell')!
    const field = document.querySelector('textarea')!
    const height = () => shell.style.getPropertyValue('--lab-vvh')
    /** The keyboard comes: 330px of it, and the window reports as much less. */
    const keyboardUp = () => { viewport.height = 514; vi.stubGlobal('innerHeight', 514); viewport.dispatchEvent(new Event('resize')) }
    const keyboardDown = () => { viewport.height = 844; vi.stubGlobal('innerHeight', 844); viewport.dispatchEvent(new Event('resize')) }
    return { viewport, shell, field, height, keyboardUp, keyboardDown, scrollTo }
  }

  it('keeps its height while the card field has the focus', () => {
    const { field, height, keyboardUp, keyboardDown } = mount()
    const unbind = bindLabVisualViewportHeight(document.getElementById('shell')!)
    try {
      expect(height()).toBe('844px')
      field.focus()
      keyboardUp()
      expect(height()).toBe('844px')
      keyboardDown()
      expect(height()).toBe('844px')
    } finally { unbind() }
  })

  it('still undoes the pan that made the window report less', () => {
    const { field, height, viewport, scrollTo } = mount()
    const unbind = bindLabVisualViewportHeight(document.getElementById('shell')!)
    try {
      field.focus()
      viewport.height = 514
      vi.stubGlobal('innerHeight', 514)
      vi.stubGlobal('scrollY', 330)
      viewport.dispatchEvent(new Event('resize'))
      expect(height()).toBe('844px')
      expect(scrollTo).toHaveBeenCalledWith(0, 0)
    } finally { unbind() }
  })

  it('keeps its height while the keyboard goes down after Send, then takes the true height', () => {
    vi.useFakeTimers()
    const { field, height, keyboardUp } = mount()
    const unbind = bindLabVisualViewportHeight(document.getElementById('shell')!)
    try {
      field.focus()
      keyboardUp()
      // Send: the field gives up the focus before the window has its height back.
      field.blur()
      expect(height()).toBe('844px')
      vi.advanceTimersByTime(700)
      expect(height()).toBe('844px')
      // The window really is this short now (the browser's bars came back): the last measurement takes it.
      vi.stubGlobal('innerHeight', 780)
      ;(window.visualViewport as unknown as { height: number }).height = 780
      vi.advanceTimersByTime(600)
      expect(LAB_KEYBOARD_SHEET_HOLD_MS).toBeLessThan(1200)
      expect(height()).toBe('780px')
    } finally { unbind() }
  })

  it('follows the window again once no card field has the focus', () => {
    const { height, viewport } = mount()
    const unbind = bindLabVisualViewportHeight(document.getElementById('shell')!)
    try {
      // A field that is not in a docked sheet: the shell stands on its keyboard, as before.
      document.getElementById('plain')!.focus()
      viewport.height = 514
      viewport.dispatchEvent(new Event('resize'))
      expect(height()).toBe('514px')
    } finally { unbind() }
  })

  it('takes the measured height after a rotation, card field or not', () => {
    const { field, height, viewport } = mount()
    const unbind = bindLabVisualViewportHeight(document.getElementById('shell')!)
    try {
      field.focus()
      vi.stubGlobal('innerWidth', 844)
      vi.stubGlobal('innerHeight', 390)
      viewport.height = 390
      viewport.dispatchEvent(new Event('resize'))
      expect(height()).toBe('390px')
    } finally { unbind() }
  })
})

describe('labShellHeightPx', () => {
  const held = { px: 664, width: 390 }
  it('is the measured height when nothing holds it', () => {
    expect(labShellHeightPx(328, held, 390, false)).toBe(328)
    expect(labShellHeightPx(328, null, 390, true)).toBe(328)
    expect(labShellHeightPx(328, { px: 0, width: 390 }, 390, true)).toBe(328)
  })
  it('never drops below the held height while a docked sheet holds it', () => {
    expect(labShellHeightPx(328, held, 390, true)).toBe(664)
    expect(labShellHeightPx(664, held, 390, true)).toBe(664)
  })
  it('may grow (the browser put its bars away)', () => {
    expect(labShellHeightPx(745, held, 390, true)).toBe(745)
  })
  it('lets a new width through: a rotation is a new window', () => {
    expect(labShellHeightPx(300, held, 844, true)).toBe(300)
    expect(labShellHeightPx(328, held, 390.5, true)).toBe(664)
  })
})

describe('labPageMapFitsShell', () => {
  it('fits the shell it was laid out in, to the pixel', () => {
    expect(labPageMapFitsShell(664, 664)).toBe(true)
    expect(labPageMapFitsShell(664, 664.6)).toBe(true)
  })
  it('does not fit a taller or a shorter shell', () => {
    // Laid out while the keyboard was up; the shell has its height back.
    expect(labPageMapFitsShell(328, 664)).toBe(false)
    expect(labPageMapFitsShell(664, 328)).toBe(false)
    expect(labPageMapFitsShell(664, 745)).toBe(false)
  })
  it('says nothing about a height that was never measured', () => {
    expect(labPageMapFitsShell(0, 664)).toBe(true)
    expect(labPageMapFitsShell(664, 0)).toBe(true)
    expect(labPageMapFitsShell(null, 664)).toBe(true)
    expect(labPageMapFitsShell(664, undefined)).toBe(true)
  })
})
