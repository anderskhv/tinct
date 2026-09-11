// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'
import { LAB_TEE_CROSS, LAB_TEE_MORPH_FRAMES, LAB_TEE_REST } from './labSuperGlyph'
import { labSuperMenuRows } from './labSuperMenu'

// Transport geometry uses a synthetic Bible fixture; availability has its own regression.
vi.mock('../data/audioAvailability', async importOriginal => ({ ...await importOriginal<typeof import('../data/audioAvailability')>(), isAudioHeld: () => false }))

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  try { localStorage.clear() } catch { /* jsdom */ }
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

function reducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? matches : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  }))
}

/** Enough of an audio element and a manifest for playback to actually start. */
class FakeAudio {
  src = ''
  currentTime = 0
  duration = 20
  playbackRate = 1
  paused = true
  preload = 'auto'
  listeners = new Map<string, Set<() => void>>()
  addEventListener(type: string, fn: () => void) {
    const set = this.listeners.get(type) ?? new Set<() => void>()
    set.add(fn)
    this.listeners.set(type, set)
  }
  removeEventListener(type: string, fn: () => void) { this.listeners.get(type)?.delete(fn) }
  play() { this.paused = false; return Promise.resolve() }
  pause() { this.paused = true }
  load() { /* jsdom */ }
  removeAttribute() { /* jsdom */ }
}

function stubAudio() {
  const audio = new FakeAudio()
  vi.stubGlobal('Audio', class { constructor() { return audio } })
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    if (String(input).includes('audio-manifest')) {
      return {
        ok: true,
        json: async () => ({
          version: 1,
          paragraphs: [
            { paragraph: 0, file: 'p0.mp3', duration: 20, words: [] },
            { paragraph: 1, file: 'p1.mp3', duration: 20, words: [] },
          ],
        }),
      }
    }
    return { ok: false, json: async () => ({}) }
  }))
  return audio
}

function renderPhone(search = '?chrome=v2', props: Record<string, unknown> = {}) {
  return render(<LabApp pathname="/lab/phone" search={search} source={fallbackLabSource()} authToken={null} {...props} />)
}

const root = () => screen.getByTestId('lab-root')

describe('the chrome V2 flag', () => {
  it('stamps the new shell only on a reader route carrying the flag', () => {
    const { unmount } = renderPhone('?chrome=v2')
    expect(root().getAttribute('data-chrome-version')).toBe('v2')
    expect(screen.getByTestId('lab-super')).toBeTruthy()
    unmount()

    render(<LabApp pathname="/lab/reader" search="?chrome=v2" source={fallbackLabSource()} authToken={null} />)
    expect(root().getAttribute('data-chrome-version')).toBe('v2')
  })

  it('leaves the reader on today’s chrome without the flag', () => {
    renderPhone('')
    expect(root().getAttribute('data-chrome-version')).toBeNull()
    expect(root().getAttribute('data-transport')).toBeNull()
    expect(root().getAttribute('data-super-menu')).toBeNull()
    expect(screen.queryByTestId('lab-super')).toBeNull()
    expect(screen.queryByTestId('lab-v2-play')).toBeNull()
    expect(screen.queryByTestId('lab-super-menu')).toBeNull()
    // The gear is still the phone's only top-right control.
    expect(screen.getByTestId('lab-gear')).toBeTruthy()
  })

  it('uses the tested voice experience by default with the new chrome', () => {
    renderPhone('?chrome=v2')
    expect(root().getAttribute('data-voice-version')).toBe('v2')
    expect(root().getAttribute('data-chrome-version')).toBe('v2')
  })
})

describe('the V2 top bar', () => {
  it('carries a Play and the super button, and a drawn t rather than a glyph', () => {
    renderPhone()
    expect(screen.getByTestId('lab-v2-play')).toBeTruthy()
    const mark = screen.getByTestId('lab-super').querySelector('svg.lab-super-mark')!
    expect(mark.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(mark.getAttribute('stroke')).toBe('currentColor')
    expect(mark.getAttribute('stroke-width')).toBe('1.6')
    expect(mark.getAttribute('stroke-linecap')).toBe('round')
    // The morph is a ladder of pre-drawn frames; only the first is showing.
    const frames = [...mark.querySelectorAll('.lab-super-frame')] as HTMLElement[]
    expect(frames).toHaveLength(LAB_TEE_MORPH_FRAMES.length)
    expect(frames.filter(frame => frame.style.opacity === '1')).toHaveLength(1)
    expect(frames[0].style.opacity).toBe('1')
    const paths = frames[0].querySelectorAll('path')
    expect(paths).toHaveLength(2)
    expect(paths[0].getAttribute('d')).toBe(LAB_TEE_REST.stemPath)
    expect(paths[1].getAttribute('d')).toBe(LAB_TEE_REST.barPath)
    // The 11° lean, applied about y = 12.
    expect(frames[0].querySelector('g')!.getAttribute('transform')).toBe(LAB_TEE_REST.skewTransform)
    // And the far end of the ladder is the ×.
    const cross = frames[frames.length - 1].querySelectorAll('path')
    expect(cross[0].getAttribute('d')).toBe(LAB_TEE_CROSS.stemPath)
    expect(cross[1].getAttribute('d')).toBe(LAB_TEE_CROSS.barPath)
    // No container at rest.
    expect(screen.getByTestId('lab-super').classList.contains('is-open')).toBe(false)
    // 15% larger than the grid, on the same targets: 27.6px and 20.7px.
    expect(mark.getAttribute('width')).toBe('27.599999999999998')
    expect(screen.getByTestId('lab-v2-play').querySelector('svg')!.getAttribute('width')).toBe('20.7')
  })

  it('leaves the title as plain dimmed text and no buttons when the chrome hides', () => {
    renderPhone()
    const stage = screen.getByTestId('lab-reading-stage')
    fireEvent.pointerDown(stage, { clientX: 195, clientY: 400, pointerId: 1 })
    fireEvent.pointerUp(stage, { clientX: 195, clientY: 400, pointerId: 1 })

    expect(root().getAttribute('data-reader-controls')).toBe('hidden')
    // Absent, not dimmed.
    expect(screen.queryByTestId('lab-super')).toBeNull()
    expect(screen.queryByTestId('lab-v2-play')).toBeNull()
    expect(document.querySelectorAll('.lab-header-controls button')).toHaveLength(0)
    // The title and its chapter are still there to read.
    expect(screen.getByTestId('lab-header-work').textContent).toBeTruthy()
    expect(screen.getByTestId('lab-header-chapter')).toBeTruthy()
  })
})

describe('reveal', () => {
  it('reveals on a press in the top bar without also opening what sits under it', () => {
    renderPhone()
    const chapter = screen.getByTestId('lab-header-chapter')

    // Hide the chrome the way a centre tap does.
    const stage = screen.getByTestId('lab-reading-stage')
    fireEvent.pointerDown(stage, { clientX: 195, clientY: 400, pointerId: 1 })
    fireEvent.pointerUp(stage, { clientX: 195, clientY: 400, pointerId: 1 })
    expect(root().getAttribute('data-reader-controls')).toBe('hidden')
    expect(screen.queryByTestId('lab-super')).toBeNull()
    expect(screen.queryByTestId('lab-v2-play')).toBeNull()

    // A press on the chapter pill reveals — and does not open the contents.
    fireEvent.pointerDown(chapter, { pointerId: 2 })
    fireEvent.click(chapter)
    expect(root().getAttribute('data-reader-controls')).toBe('visible')
    expect(screen.queryByTestId('lab-contents-v2')).toBeNull()
    expect(screen.getByTestId('lab-super')).toBeTruthy()

    // Now that the chrome is up, the pill is a control again.
    fireEvent.click(screen.getByTestId('lab-header-chapter'))
    expect(screen.getByTestId('lab-contents-v2')).toBeTruthy()
  })

  it('still opens the picker after a press that revealed but never became a click', () => {
    renderPhone()
    const chapter = screen.getByTestId('lab-header-chapter')
    const stage = screen.getByTestId('lab-reading-stage')
    fireEvent.pointerDown(stage, { clientX: 195, clientY: 400, pointerId: 1 })
    fireEvent.pointerUp(stage, { clientX: 195, clientY: 400, pointerId: 1 })
    expect(root().getAttribute('data-reader-controls')).toBe('hidden')

    // A finger lands on the pill and slides off: the browser sends no click.
    fireEvent.pointerDown(chapter, { pointerId: 2 })
    fireEvent.pointerCancel(chapter, { pointerId: 2 })
    expect(root().getAttribute('data-reader-controls')).toBe('visible')
    expect(screen.queryByTestId('lab-contents-v2')).toBeNull()
    // The next tap on the pill is a tap on the pill.
    fireEvent.pointerDown(screen.getByTestId('lab-header-chapter'), { pointerId: 3 })
    fireEvent.click(screen.getByTestId('lab-header-chapter'))
    expect(screen.getByTestId('lab-contents-v2')).toBeTruthy()
  })

  it('opens the picker from the pill whenever the chrome is already up', () => {
    renderPhone()
    expect(root().getAttribute('data-reader-controls')).toBe('visible')
    fireEvent.pointerDown(screen.getByTestId('lab-header-chapter'), { pointerId: 1 })
    fireEvent.click(screen.getByTestId('lab-header-chapter'))
    expect(screen.getByTestId('lab-contents-v2')).toBeTruthy()
  })

  it('keeps the progress line live and tappable while the chrome is hidden', () => {
    renderPhone()
    const stage = screen.getByTestId('lab-reading-stage')
    fireEvent.pointerDown(stage, { clientX: 195, clientY: 400, pointerId: 1 })
    fireEvent.pointerUp(stage, { clientX: 195, clientY: 400, pointerId: 1 })
    expect(root().getAttribute('data-reader-controls')).toBe('hidden')

    const tracker = screen.getByTestId('lab-chapter-progress')
    const before = tracker.textContent
    fireEvent.click(tracker)
    expect(screen.getByTestId('lab-chapter-progress').textContent).not.toBe(before)
    // Cycling the tracker is all it did.
    expect(root().getAttribute('data-reader-controls')).toBe('hidden')
  })
})

describe('the super-menu', () => {
  it('opens from the t, morphs it to an ×, and closes again', async () => {
    renderPhone()
    const button = screen.getByTestId('lab-super')
    expect(button.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(button)
    expect(screen.getByTestId('lab-super-menu')).toBeTruthy()
    expect(root().getAttribute('data-super-menu')).toBe('open')
    expect(screen.getByTestId('lab-super').getAttribute('aria-expanded')).toBe('true')

    // The × is the way back out: pressing the mark again closes it.
    fireEvent.click(screen.getByTestId('lab-super'))
    await waitFor(() => expect(screen.queryByTestId('lab-super-menu')).toBeNull())
    expect(screen.getByTestId('lab-super').getAttribute('aria-expanded')).toBe('false')

    // So is the page behind it.
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-scrim'))
    await waitFor(() => expect(screen.queryByTestId('lab-super-menu')).toBeNull())
  })

  it('lists Chat, Talk, Library, Reading settings and Account — and no Play row', () => {
    renderPhone()
    fireEvent.click(screen.getByTestId('lab-super'))
    const labels = [...screen.getByTestId('lab-super-menu').querySelectorAll('.lab-super-row-label')]
      .map(node => node.textContent)
    expect(labels).toEqual(['Chat', 'Talk', 'Library', 'Reading settings', 'Account'])
    expect(labels).not.toContain('Play')
    // No section headers and no sub-labels: a row is an icon and a word.
    expect(screen.getByTestId('lab-super-menu').querySelectorAll('h1, h2, h3, h4')).toHaveLength(0)
  })

  it('has no Compare row at all when no compare edition is chosen', () => {
    expect(labSuperMenuRows({ compare: false }).map(row => row.id))
      .toEqual(['chat', 'talk', 'library', 'settings', 'account'])
    expect(labSuperMenuRows({ compare: true }).map(row => row.id))
      .toEqual(['chat', 'talk', 'compare', 'library', 'settings', 'account'])

    renderPhone()
    fireEvent.click(screen.getByTestId('lab-super'))
    expect(screen.queryByTestId('lab-super-row-compare')).toBeNull()
  })

  it('shows Compare once a second version is picked', () => {
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ compareOpen: true }))
    render(<LabApp
      pathname="/lab/phone"
      search="?chrome=v2"
      authToken={null}
      source={{
        ...fallbackLabSource(),
        paragraphs: ['Old wording begins here and continues through the original passage.'],
        compareParagraphs: ['Modern wording starts here and continues through the comparison passage.'],
      }}
    />)
    fireEvent.click(screen.getByTestId('lab-super'))
    expect(screen.getByTestId('lab-super-row-compare')).toBeTruthy()
  })

  it('opens the reading settings sheet from its row', () => {
    renderPhone()
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-settings'))
    expect(screen.queryByTestId('lab-super-menu')).toBeNull()
    expect(screen.getByTestId('lab-v2-sheet').getAttribute('data-layer')).toBe('reading')
  })

  it('opens Account on the same sheet rather than leaving the book', () => {
    renderPhone()
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-account'))
    expect(screen.getByTestId('lab-v2-sheet').getAttribute('data-layer')).toBe('account')
  })
})

describe('the foot', () => {
  it('has no reading bar under V2 — only the progress line, and the transport while audio plays', async () => {
    renderPhone()
    expect(screen.queryByTestId('lab-phone-bar')).toBeNull()
    expect(screen.queryByTestId('lab-phone-chat')).toBeNull()
    expect(screen.queryByTestId('lab-phone-talk')).toBeNull()
    // The progress line is there, live, with the chrome up.
    expect(screen.getByTestId('lab-chapter-progress')).toBeTruthy()
    expect(root().getAttribute('data-transport')).toBe('closed')

    stubAudio()
    fireEvent.click(screen.getByTestId('lab-v2-play'))
    await waitFor(() => expect(root().getAttribute('data-transport')).toBe('open'))
    expect(screen.getByTestId('lab-phone-bar')).toBeTruthy()
    expect(screen.getByTestId('lab-chapter-progress')).toBeTruthy()
  })

  it('keeps the bar without the flag', () => {
    renderPhone('')
    expect(screen.getByTestId('lab-phone-bar')).toBeTruthy()
    expect(screen.getByTestId('lab-phone-chat')).toBeTruthy()
  })
})

describe('the desktop', () => {
  it('gets the same two controls, and the same menu and sheet behind them', () => {
    render(<LabApp pathname="/lab/desktop" search="?chrome=v2" source={fallbackLabSource()} authToken={null} />)
    expect(root().getAttribute('data-chrome-version')).toBe('v2')
    expect(screen.getByTestId('lab-v2-play')).toBeTruthy()
    expect(screen.getByTestId('lab-super')).toBeTruthy()
    // Desktop chrome does not hide, so the two controls are never gated on a
    // reveal the desktop reader has no way to ask for.
    expect(screen.queryByTestId('lab-gear')).toBeNull()
    // And no rail: Play is in the top bar, the rest is in the menu.
    expect(screen.queryByTestId('lab-desktop-action-rail')).toBeNull()

    fireEvent.click(screen.getByTestId('lab-super'))
    expect(screen.getByTestId('lab-super-menu')).toBeTruthy()
    fireEvent.click(screen.getByTestId('lab-super-row-settings'))
    expect(screen.getByTestId('lab-v2-sheet').getAttribute('data-layer')).toBe('reading')
  })

  it('closes the Chat panel on Escape, like the menu and the sheet', () => {
    render(<LabApp pathname="/lab/desktop" search="?chrome=v2" source={fallbackLabSource()} authToken={null} />)
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-chat'))
    expect(root().getAttribute('data-desktop-panel')).toBe('chat')
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(root().getAttribute('data-desktop-panel')).toBe('none')
  })

  it('keeps today\u2019s desktop chrome without the flag', () => {
    render(<LabApp pathname="/lab/desktop" search="" source={fallbackLabSource()} authToken={null} />)
    expect(root().getAttribute('data-chrome-version')).toBeNull()
    expect(screen.getByTestId('lab-gear')).toBeTruthy()
    expect(screen.getByTestId('lab-desktop-action-rail')).toBeTruthy()
    expect(screen.queryByTestId('lab-super')).toBeNull()
  })
})

describe('the transport', () => {
  it('opens from the top Play, which then shows a pause', async () => {
    stubAudio()
    renderPhone()
    expect(root().getAttribute('data-transport')).toBe('closed')
    expect(screen.getByTestId('lab-v2-play').getAttribute('aria-label')).toBe('Play')

    fireEvent.click(screen.getByTestId('lab-v2-play'))
    await waitFor(() => expect(root().getAttribute('data-transport')).toBe('open'))
    expect(screen.getByTestId('lab-v2-play').getAttribute('aria-label')).toBe('Pause')
    // Today's bottom bar, not a second panel.
    expect(screen.getByTestId('lab-phone-bar')).toBeTruthy()
  })

  it('reads speed · back · pause · forward · Talk', async () => {
    stubAudio()
    renderPhone()
    fireEvent.click(screen.getByTestId('lab-v2-play'))
    await waitFor(() => expect(root().getAttribute('data-transport')).toBe('open'))
    const order = [...screen.getByTestId('lab-phone-bar').querySelectorAll('.lab-audio-control')]
      .map(node => node.getAttribute('data-testid'))
    expect(order).toEqual([
      'lab-hearing-speed',
      'lab-hearing-back',
      'lab-listen',
      'lab-hearing-forward',
      'lab-phone-talk',
    ])
  })

  it('lets the chrome hide over playing audio while the transport stays', async () => {
    stubAudio()
    renderPhone()
    fireEvent.click(screen.getByTestId('lab-v2-play'))
    await waitFor(() => expect(root().getAttribute('data-transport')).toBe('open'))

    const stage = screen.getByTestId('lab-hearing-stage')
    fireEvent.pointerDown(stage, { clientX: 195, clientY: 400, pointerId: 1 })
    fireEvent.pointerUp(stage, { clientX: 195, clientY: 400, pointerId: 1 })

    // The top buttons go with the chrome; the transport does not.
    expect(root().getAttribute('data-reader-controls')).toBe('hidden')
    expect(screen.queryByTestId('lab-super')).toBeNull()
    expect(root().getAttribute('data-transport')).toBe('open')
    expect(screen.getByTestId('lab-phone-bar')).toBeTruthy()
  })
})

describe('the first view', () => {
  it('spins once per reader load, 400 ms after the page lays out, and again on the next load', async () => {
    reducedMotion(false)
    const { unmount } = renderPhone()
    await waitFor(() => expect(root().getAttribute('data-reader-ready')).toBe('true'))
    expect(screen.getByTestId('lab-super').classList.contains('is-spinning')).toBe(false)

    await waitFor(
      () => expect(screen.getByTestId('lab-super').classList.contains('is-spinning')).toBe(true),
      { timeout: 2000 },
    )
    await waitFor(
      () => expect(screen.getByTestId('lab-super').classList.contains('is-spinning')).toBe(false),
      { timeout: 2000 },
    )
    // Nothing on this mount arms it a second time.
    await new Promise(done => setTimeout(done, 700))
    expect(screen.getByTestId('lab-super').classList.contains('is-spinning')).toBe(false)
    unmount()

    // Next load: it is a per-load introduction, not a once-ever flag, so it
    // spins again.
    renderPhone()
    await waitFor(() => expect(root().getAttribute('data-reader-ready')).toBe('true'))
    await waitFor(
      () => expect(screen.getByTestId('lab-super').classList.contains('is-spinning')).toBe(true),
      { timeout: 2000 },
    )
  })

  it('does not re-arm when the account resolves after the spin on the same load', async () => {
    reducedMotion(false)
    const view = renderPhone()
    await waitFor(() => expect(root().getAttribute('data-reader-ready')).toBe('true'))
    await waitFor(
      () => expect(screen.getByTestId('lab-super').classList.contains('is-spinning')).toBe(true),
      { timeout: 2000 },
    )
    await waitFor(
      () => expect(screen.getByTestId('lab-super').classList.contains('is-spinning')).toBe(false),
      { timeout: 2000 },
    )
    // Auth resolving late used to flip the one-shot identity from device to
    // account and replay the spin. The latch is per mount now.
    view.rerender(<LabApp pathname="/lab/phone" search="?chrome=v2" source={fallbackLabSource()} authToken="late-token" />)
    await new Promise(done => setTimeout(done, 700))
    expect(screen.getByTestId('lab-super').classList.contains('is-spinning')).toBe(false)
  })

  it('fades instead of spinning under reduced motion', async () => {
    reducedMotion(true)
    renderPhone()
    await waitFor(
      () => expect(screen.getByTestId('lab-super').classList.contains('is-arriving')).toBe(true),
      { timeout: 2000 },
    )
    expect(screen.getByTestId('lab-super').classList.contains('is-spinning')).toBe(false)
    // Reduced motion cross-fades the ladder's ends instead of stepping it.
    expect(screen.getByTestId('lab-super').classList.contains('is-reduced')).toBe(true)
    const frames = [...screen.getByTestId('lab-super').querySelectorAll('.lab-super-frame')] as HTMLElement[]
    expect(frames[0].style.opacity).toBe('1')
    expect(frames[frames.length - 1].style.opacity).toBe('0')
  })

  it('never renders the teal full stop: the mark promises nothing it does not have', () => {
    renderPhone()
    const button = screen.getByTestId('lab-super')
    expect(button.querySelector('.lab-super-stop')).toBeNull()
    expect(button.hasAttribute('data-hint')).toBe(false)
    expect(button.classList.contains('has-hint')).toBe(false)
    fireEvent.click(button)
    expect(screen.getByTestId('lab-super').querySelector('.lab-super-stop')).toBeNull()
  })
})

describe('the V2 surface', () => {
  const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')

  it('blurs in the panel and only dims the page', () => {
    expect(css).toContain('--lab-v2-panel-blur: 16px')
    expect(css).toContain('--lab-v2-panel-fill: 0.35')
    expect(css).toContain('--lab-v2-panel-fill-top: 0.44')
    expect(css).toContain('--lab-v2-panel-fill: 0.45')
    expect(css).toContain('--lab-v2-panel-fill-top: 0.54')
    expect(css).toContain('--lab-v2-page-dim: rgba(28, 24, 18, 0.08)')
    expect(css).toContain('--lab-v2-page-dim: rgba(0, 0, 0, 0.14)')
    // The blur belongs to the panel; nothing filters the page itself.
    expect(css).not.toMatch(/lab-page-wrap[^{]*\{[^}]*backdrop-filter/)
  })

  it('keeps every V2 rule behind the flag', () => {
    const v2 = css.slice(css.indexOf('Reader chrome V2'))
    const selectors = v2
      .split('\n')
      .filter(line => line.trim().startsWith('.lab') && !line.includes('--'))
    expect(selectors.length).toBeGreaterThan(20)
    for (const selector of selectors) {
      expect(selector).toContain('[data-chrome-version="v2"]')
    }
  })

  it('gives the menu its 56px gutter, 22px icons, 17px labels and 52px rows', () => {
    expect(css).toMatch(/lab-super-row-icon\s*\{[^}]*flex: 0 0 56px/)
    expect(css).toMatch(/lab-super-row-label\s*\{[^}]*font-size: 17px/)
    expect(css).toMatch(/lab-super-row\s*\{[^}]*min-height: 52px/)
    renderPhone()
    fireEvent.click(screen.getByTestId('lab-super'))
    for (const icon of screen.getByTestId('lab-super-menu').querySelectorAll('.lab-super-row-icon svg')) {
      expect(icon.getAttribute('width')).toBe('22')
    }
  })
})
