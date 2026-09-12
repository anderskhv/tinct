import { describe, expect, it } from 'vitest'
import { labPageTurnAffordance, labTapPageDirection, labTapTurnAllowed } from './labChrome'

/**
 * Width decides layout; the pointer decides interaction. A half-screen
 * desktop window is still a mouse, and must keep the visible page buttons.
 */
describe('page-turn affordance', () => {
  it('keeps the buttons for a mouse at every width, and gives it no tap zones', () => {
    const mouse = labPageTurnAffordance({ finePointer: true, hover: true, coarsePointer: false })
    expect(mouse.buttons).toBe(true)
    expect(mouse.tapZones).toBe('none')
  })

  it('gives a finger the tap zones and no buttons', () => {
    const finger = labPageTurnAffordance({ finePointer: false, hover: false, coarsePointer: true })
    expect(finger.buttons).toBe(false)
    expect(finger.tapZones).toBe('all')
  })

  it('gives a touchscreen laptop both — buttons for the mouse, taps for the finger', () => {
    const both = labPageTurnAffordance({ finePointer: true, hover: true, coarsePointer: true })
    expect(both.buttons).toBe(true)
    expect(both.tapZones).toBe('touch')
    expect(labTapTurnAllowed(both.tapZones, 'mouse')).toBe(false)
    expect(labTapTurnAllowed(both.tapZones, 'touch')).toBe(true)
    expect(labTapTurnAllowed(both.tapZones, 'pen')).toBe(true)
  })

  it('offers both when the browser reports nothing, rather than neither', () => {
    const unknown = labPageTurnAffordance({})
    expect(unknown.buttons).toBe(true)
    expect(unknown.tapZones).toBe('all')
  })

  it('honours the /lab/phone override', () => {
    expect(labPageTurnAffordance({ override: 'phone', finePointer: true })).toEqual({
      buttons: false,
      tapZones: 'all',
    })
  })

  it('never lets a mouse click in the turn zone reach a word lookup', () => {
    // The zone still exists geometrically; what changes is who may use it.
    expect(labTapPageDirection(20, 0, 800)).toBe(-1)
    expect(labTapTurnAllowed('none', 'mouse')).toBe(false)
    expect(labTapTurnAllowed('all', 'mouse')).toBe(true)
    expect(labTapTurnAllowed('all', 'touch')).toBe(true)
  })
})
