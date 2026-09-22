// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { isShakespearePhone } from './labShakespeare'
import { parseLabPrefs, readLabPrefs, writeLabPrefs, restoreLabAppearance } from './labPrefs'

afterEach(() => localStorage.clear())
it('allows phones but excludes iPad, desktop-mode iPad, and desktop at narrow widths', () => {
  const device = { maxTouchPoints: 5, screenWidth: 390, screenHeight: 844 }
  expect(isShakespearePhone({ ...device, userAgent: 'iPhone' })).toBe(true)
  expect(isShakespearePhone({ ...device, userAgent: 'Android 15; Mobile' })).toBe(true)
  expect(isShakespearePhone({ ...device, userAgent: 'iPad' })).toBe(false)
  expect(isShakespearePhone({ ...device, userAgent: 'Macintosh' })).toBe(false)
  expect(isShakespearePhone({ ...device, userAgent: 'Windows NT', maxTouchPoints: 0 })).toBe(false)
  expect(isShakespearePhone({ ...device, userAgent: 'Android 15', screenWidth: 800 })).toBe(false)
})
it('distinguishes fresh alignment defaults and preserves ambiguous legacy choices', () => {
  expect(parseLabPrefs(null)).toMatchObject({ alignmentExplicit: false, shakespeareLayout: 'verse' })
  for (const alignment of ['left', 'justify']) expect(parseLabPrefs({ alignment })).toMatchObject({ alignment, alignmentExplicit: true })
  expect(restoreLabAppearance(parseLabPrefs({ alignment: 'justify' }))).toMatchObject({ alignmentExplicit: false, shakespeareLayout: 'verse' })
})
it('stores layout locally in its appearance profile and leaves it alone on font changes', () => {
  writeLabPrefs({ ...readLabPrefs('phone'), shakespeareLayout: 'flowing' }, 'phone')
  expect(readLabPrefs('phone').shakespeareLayout).toBe('flowing')
  expect(readLabPrefs('desktop').shakespeareLayout).toBe('verse')
  writeLabPrefs({ ...readLabPrefs('phone'), fontSize: 2 }, 'phone')
  expect(readLabPrefs('phone').shakespeareLayout).toBe('flowing')
  expect(readLabPrefs('phone').alignmentExplicit).toBe(false)
})
