import { describe, expect, it } from 'vitest'
import { desktopCardPlace, type CardBox } from './desktopCardPlace'
const frame = { left: 20, right: 1420, top: 76, bottom: 876 }
function clear(a: ReturnType<typeof desktopCardPlace>, ink: CardBox) {
  return a.left + a.width <= ink.left || a.left >= ink.right || a.top + a.maxHeight <= ink.top || a.top >= ink.bottom
}
describe('desktop response placement', () => {
  it('uses the reserved right margin without moving the reading column', () => {
    const ink = { left: 150, right: 850, top: 300, bottom: 450 }
    const at = desktopCardPlace(ink, frame)
    expect(at.left).toBeGreaterThan(ink.right)
    expect(clear(at, ink)).toBe(true)
    expect(at.left + at.width).toBeLessThanOrEqual(frame.right)
  })
  it('keeps the selected Compare column clear, using the other side', () => {
    const ink = { left: 780, right: 1300, top: 220, bottom: 530 }
    const at = desktopCardPlace(ink, frame)
    expect(at.left + at.width).toBeLessThan(ink.left)
    expect(clear(at, ink)).toBe(true)
  })
  it('uses available vertical room when neither side fits a card', () => {
    const ink = { left: 50, right: 1000, top: 300, bottom: 500 }
    const at = desktopCardPlace(ink, { ...frame, right: 1040 })
    expect(clear(at, ink)).toBe(true)
    expect(at.top + at.maxHeight).toBeLessThanOrEqual(frame.bottom)
  })
})

it('keeps a long full-spread selection and its response usable when no empty slot exists', () => {
  const at = desktopCardPlace({ left: 30, right: 1410, top: 80, bottom: 870 }, frame)
  expect(at.maxHeight).toBeGreaterThanOrEqual(180)
  expect(at.maxHeight).toBeLessThanOrEqual((frame.bottom - frame.top) * .55)
  expect(at.top).toBeGreaterThan(frame.top + (frame.bottom - frame.top) * .4)
  expect(at.top + at.maxHeight).toBe(frame.bottom)
})
