import { describe, expect, it } from 'vitest'
import { labPageTurnAffordance, labPageTurnSurfaceEnabled, labTapPageDirection, labTapTurnAllowed } from './labChrome'

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

  it('gives a stylus phone the finger treatment, not the desktop buttons', () => {
    // A phone with stylus support answers the `any-*` union exactly as a
    // touchscreen laptop does. The primary pointer is what tells them apart.
    const stylusPhone = labPageTurnAffordance({
      finePointer: true,
      hover: true,
      coarsePointer: true,
      primaryCoarse: true,
      primaryHoverNone: true,
    })
    expect(stylusPhone.buttons).toBe(false)
    expect(stylusPhone.tapZones).toBe('all')
  })

  it('still gives a touchscreen laptop both — its primary pointer is the mouse', () => {
    const laptop = labPageTurnAffordance({
      finePointer: true,
      hover: true,
      coarsePointer: true,
      primaryCoarse: false,
      primaryHoverNone: false,
    })
    expect(laptop.buttons).toBe(true)
    expect(laptop.tapZones).toBe('touch')
  })

  it('keeps the buttons for a narrow desktop window, which has no coarse pointer', () => {
    const narrow = labPageTurnAffordance({
      finePointer: true,
      hover: true,
      coarsePointer: false,
      primaryCoarse: false,
      primaryHoverNone: false,
    })
    expect(narrow.buttons).toBe(true)
    expect(narrow.tapZones).toBe('none')
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

  it('wires tablet touch zones on a desktop spread without adding mouse tap zones', () => {
    expect(labPageTurnSurfaceEnabled({ phoneChrome: false, buttons: false, tapZones: 'all', askOpen: false, selectionOpen: false })).toBe(true)
    expect(labPageTurnSurfaceEnabled({ phoneChrome: false, buttons: true, tapZones: 'touch', askOpen: false, selectionOpen: false })).toBe(true)
    expect(labPageTurnSurfaceEnabled({ phoneChrome: false, buttons: true, tapZones: 'none', askOpen: false, selectionOpen: false })).toBe(false)
    // Unknown legacy pointer media offers fallback buttons plus zones, but does
    // not attach those zones to a desktop surface where a mouse selects text.
    expect(labPageTurnSurfaceEnabled({ phoneChrome: false, buttons: true, tapZones: 'all', askOpen: false, selectionOpen: false })).toBe(false)
    expect(labPageTurnSurfaceEnabled({ phoneChrome: false, buttons: false, tapZones: 'all', askOpen: true, selectionOpen: false })).toBe(false)
  })
})
