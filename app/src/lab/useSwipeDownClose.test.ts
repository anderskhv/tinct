import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { SWIPE_CLOSE_DISTANCE, SWIPE_SLOP, swipeCloses, swipeIntent } from './useSwipeDownClose'

describe('swipe down on the paused phone player', () => {
  it('a press stays a tap until it has travelled past the slop', () => {
    expect(swipeIntent(0, 0)).toBe('pending')
    expect(swipeIntent(3, 4)).toBe('pending')
    expect(swipeIntent(0, SWIPE_SLOP - 1)).toBe('pending')
  })

  it('mostly downward travel becomes a drag; sideways or upward is not ours', () => {
    expect(swipeIntent(2, 12)).toBe('drag')
    expect(swipeIntent(14, 2)).toBe('ignore')
    expect(swipeIntent(-14, 6)).toBe('ignore')
    expect(swipeIntent(0, -12)).toBe('ignore')
    expect(swipeIntent(10, 10)).toBe('ignore')
  })

  it('closes past the distance, or on a quick short flick, and never upward or sideways', () => {
    expect(swipeCloses(0, SWIPE_CLOSE_DISTANCE, 1000)).toBe(true)
    expect(swipeCloses(0, SWIPE_CLOSE_DISTANCE - 1, 1000)).toBe(false)
    expect(swipeCloses(0, 20, 20)).toBe(true)
    expect(swipeCloses(0, 10, 5)).toBe(false)
    expect(swipeCloses(0, -60, 50)).toBe(false)
    expect(swipeCloses(80, 50, 100)).toBe(false)
  })
})

const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')

/** Every rule body whose selector list names this class (any prefix, any state). */
function rulesFor(className: string): string[] {
  const bodies: string[] = []
  const pattern = /([^{}]+)\{([^{}]*)\}/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(css))) {
    const selectors = match[1].split(',').map(part => part.trim())
    if (selectors.some(selector => new RegExp(`\\.${className}(?![\\w-])`).test(selector))) bodies.push(match[2])
  }
  return bodies
}

describe('audio transport type and handle', () => {
  // The phone speed button read "1.25×" in a monospace face (14 Oct 2026):
  // chrome is system UI, figures tabular, never mono.
  it.each(['lab-audio-speed', 'lab-desktop-audio-speed', 'lab-audio-speed-heading', 'lab-audio-speed-scale'])('.%s is system UI with tabular figures, never mono', className => {
    const rules = rulesFor(className)
    expect(rules.length).toBeGreaterThan(0)
    for (const body of rules) expect(body).not.toMatch(/monospace|Plex Mono|Menlo/i)
    expect(rules.join('\n')).toMatch(/system-ui/)
    expect(rules.join('\n')).toMatch(/font-variant-numeric: tabular-nums/)
  })

  it('the grab handle is a 32x3 pill in a 72x9 strip inside the player, which keeps the playing bar\'s box', () => {
    const rules = rulesFor('lab-audio-handle').join('\n')
    expect(rules).toMatch(/top: -1px;/)
    expect(rules).toMatch(/width: 72px/)
    expect(rules).toMatch(/height: 9px/)
    expect(rules).toMatch(/padding: 3px 0 0/)
    expect(rules).toMatch(/width: 32px/)
    expect(rules).toMatch(/height: 3px/)
    expect(rules).toMatch(/background: var\(--lab-ink-faint\)/)
    expect(rules).not.toMatch(/bottom: (100%|calc)/)
    expect(rules).not.toMatch(/box-shadow/)
    // No extra padding on the paused player: the room comes from the controls.
    const bar = rulesFor('is-swipe-closable').join('\n')
    expect(bar).not.toMatch(/padding/)
    expect(bar).toMatch(/margin-top: 5px/)
    // Each control keeps a 44px target: 39px painted plus 5px into the foot.
    expect(bar).toMatch(/inset: 0 0 -5px/)
  })

  it('the corner close is gone from the phone player', () => {
    expect(rulesFor('lab-audio-dismiss')).toEqual([])
  })
})
