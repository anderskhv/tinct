// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { bindLabVisualViewportHeight, measureLabOnScreenBarTop } from './labChrome'
import { shrinkNativePageAfterPaint } from './LabNativePaginator'
import type { ChapterHearingPage } from './labHearing'

afterEach(() => {
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
