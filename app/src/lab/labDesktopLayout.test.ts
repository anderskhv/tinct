// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { clearLocalUserData } from '../services/storage'
import { defaultDesktopReaderLayout, initialDesktopReaderLayout, isIpadLandscape, marginReaderRoom, readDesktopReaderLayout, readerDeviceClass, readsMarginOnHandheld, storeDesktopReaderLayout } from './labDesktopLayout'
import { storeCompareView } from './labPrefs'

afterEach(() => { localStorage.clear(); vi.restoreAllMocks() })
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'
const desktopMouse = { userAgent: MAC, platform: 'MacIntel', maxTouchPoints: 0, landscape: true }
const ipadLandscape = { userAgent: MAC, platform: 'MacIntel', maxTouchPoints: 5, landscape: true }
// Anders, 4 Nov 2026: Margin on the desktop for every kind of book; Two-page on an iPad in landscape.
it('defaults catalogue, EPUB, pasted text and PDF text to Margin on a desktop', () => {
  expect(initialDesktopReaderLayout({ bookId: 'frankenstein' })).toBe('margin')
  for (const kind of ['epub', 'text', 'pdf']) {
    expect(initialDesktopReaderLayout({ bookId: 'own', hex: 'abc', kind })).toBe('margin')
    expect(initialDesktopReaderLayout({ bookId: 'own', hex: 'abc', kind, device: desktopMouse })).toBe('margin')
  }
  expect(initialDesktopReaderLayout({ bookId: 'frankenstein', device: desktopMouse })).toBe('margin')
})
it('defaults an iPad in landscape to Two-page, whether it reports a Mac or an iPad user agent', () => {
  expect(initialDesktopReaderLayout({ bookId: 'frankenstein', device: ipadLandscape })).toBe('two-page')
  expect(isIpadLandscape(ipadLandscape)).toBe(true)
  expect(isIpadLandscape({ userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)', maxTouchPoints: 5, landscape: true })).toBe(true)
  expect(isIpadLandscape({ ...ipadLandscape, landscape: false })).toBe(false)
  expect(isIpadLandscape({ ...ipadLandscape, maxTouchPoints: 1 })).toBe(false)
  expect(isIpadLandscape({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', platform: 'Win32', maxTouchPoints: 10, landscape: true })).toBe(false)
  expect(defaultDesktopReaderLayout(desktopMouse)).toBe('margin')
  expect(defaultDesktopReaderLayout({})).toBe('margin')
})
it('keeps every explicit choice and link over the device default', () => {
  for (const device of [desktopMouse, ipadLandscape]) {
    for (const layout of ['margin', 'two-page', 'compare'] as const) {
      expect(initialDesktopReaderLayout({ bookId: 'x', search: `?view=${layout}`, device })).toBe(layout)
      storeDesktopReaderLayout('x', layout)
      expect(initialDesktopReaderLayout({ bookId: 'x', device })).toBe(layout)
    }
    localStorage.clear()
    expect(initialDesktopReaderLayout({ bookId: 'x', savedMode: 'compare', device })).toBe('compare')
    localStorage.setItem('tinct-addbook:epub-view:abc', JSON.stringify('text'))
    expect(initialDesktopReaderLayout({ bookId: 'own', hex: 'abc', kind: 'epub', device })).toBe('two-page')
    localStorage.setItem('tinct-addbook:epub-view:abc', JSON.stringify('margin'))
    expect(initialDesktopReaderLayout({ bookId: 'own', hex: 'abc', kind: 'epub', device })).toBe('margin')
    localStorage.clear()
  }
})
it('keeps each explicit layout per book and gives an explicit link precedence', () => {
  for (const layout of ['margin', 'two-page', 'compare'] as const) {
    storeDesktopReaderLayout('a', layout)
    expect(initialDesktopReaderLayout({ bookId: 'a' })).toBe(layout)
  }
  expect(initialDesktopReaderLayout({ bookId: 'b' })).toBe('margin')
  expect(initialDesktopReaderLayout({ bookId: 'a', search: '?view=two-page' })).toBe('two-page')
})
it('migrates legacy explicit choices without letting saved Compare override a newer choice', () => {
  storeCompareView('desktop', 'a', true)
  expect(initialDesktopReaderLayout({ bookId: 'a' })).toBe('compare')
  storeCompareView('desktop', 'a', false)
  expect(initialDesktopReaderLayout({ bookId: 'a', savedMode: 'compare' })).toBe('margin')
  localStorage.setItem('tinct-addbook:epub-view:abc', JSON.stringify('margin'))
  expect(initialDesktopReaderLayout({ bookId: 'own', hex: 'abc', kind: 'epub' })).toBe('margin')
  storeDesktopReaderLayout('own', 'two-page')
  expect(initialDesktopReaderLayout({ bookId: 'own', hex: 'abc', kind: 'epub' })).toBe('two-page')
})
it('rejects damaged preferences and clears book choices on sign-out', () => {
  localStorage.setItem('tinct:reader-desktop-layout', '{broken')
  expect(readDesktopReaderLayout('a')).toBeNull()
  storeDesktopReaderLayout('a', 'margin')
  expect(readDesktopReaderLayout('a')).toBe('margin')
  localStorage.removeItem('tinct:reader-desktop-layout')
  storeDesktopReaderLayout('a', 'margin')
  clearLocalUserData()
  expect(readDesktopReaderLayout('a')).toBeNull()
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw Error('blocked') })
  expect(initialDesktopReaderLayout({ bookId: 'a' })).toBe('margin')
  expect(() => storeDesktopReaderLayout('a', 'margin')).not.toThrow()
})

// Anders, 4 Nov 2026: a phone sideways and an iPad upright read the Margin reader by default.
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
const ANDROID_PHONE = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36'
const ANDROID_TABLET = 'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
const devices = {
  desktop: { ...desktopMouse, width: 1440 },
  ipadLandscape: { ...ipadLandscape, width: 1180, screenShortSide: 820 },
  ipadPortrait: { ...ipadLandscape, landscape: false, width: 820, screenShortSide: 820 },
  phoneLandscape: { userAgent: IPHONE, platform: 'iPhone', maxTouchPoints: 5, landscape: true, width: 844, screenShortSide: 390 },
  phonePortrait: { userAgent: IPHONE, platform: 'iPhone', maxTouchPoints: 5, landscape: false, width: 390, screenShortSide: 390 },
}
it('names the five device classes from the browser', () => {
  expect(readerDeviceClass(devices.desktop)).toBe('desktop')
  expect(readerDeviceClass({ ...devices.desktop, landscape: false })).toBe('desktop')
  expect(readerDeviceClass(devices.ipadLandscape)).toBe('ipad-landscape')
  expect(readerDeviceClass(devices.ipadPortrait)).toBe('ipad-portrait')
  expect(readerDeviceClass({ userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)', maxTouchPoints: 5, landscape: false })).toBe('ipad-portrait')
  expect(readerDeviceClass(devices.phoneLandscape)).toBe('phone-landscape')
  expect(readerDeviceClass(devices.phonePortrait)).toBe('phone-portrait')
  expect(readerDeviceClass({ userAgent: ANDROID_PHONE, maxTouchPoints: 5, landscape: true, width: 915, screenShortSide: 412 })).toBe('phone-landscape')
  expect(readerDeviceClass({ userAgent: ANDROID_PHONE, maxTouchPoints: 5, landscape: false })).toBe('phone-portrait')
  // A touch screen with a phone's short side is a phone whatever it reports; an Android tablet is not.
  expect(readerDeviceClass({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', maxTouchPoints: 5, landscape: true, screenShortSide: 412 })).toBe('phone-landscape')
  expect(readerDeviceClass({ userAgent: ANDROID_TABLET, maxTouchPoints: 10, landscape: false, screenShortSide: 800 })).toBe('desktop')
  expect(readerDeviceClass({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', platform: 'Win32', maxTouchPoints: 10, landscape: true, screenShortSide: 1080 })).toBe('desktop')
})
it('defaults Margin everywhere but an iPad in landscape', () => {
  expect(defaultDesktopReaderLayout(devices.desktop)).toBe('margin')
  expect(defaultDesktopReaderLayout(devices.ipadLandscape)).toBe('two-page')
  expect(defaultDesktopReaderLayout(devices.ipadPortrait)).toBe('margin')
  expect(defaultDesktopReaderLayout(devices.phoneLandscape)).toBe('margin')
  expect(initialDesktopReaderLayout({ bookId: 'frankenstein', device: devices.ipadPortrait })).toBe('margin')
  expect(initialDesktopReaderLayout({ bookId: 'frankenstein', device: devices.phoneLandscape })).toBe('margin')
})
it('reads the Margin reader on a phone sideways and an iPad upright, and nowhere else the phone reader is', () => {
  expect(readsMarginOnHandheld(devices.phoneLandscape, 'margin')).toBe(true)
  expect(readsMarginOnHandheld(devices.ipadPortrait, 'margin')).toBe(true)
  for (const width of [768, 834, 1024]) expect(readsMarginOnHandheld({ ...devices.ipadPortrait, width }, 'margin')).toBe(true)
  for (const width of [932, 915]) expect(readsMarginOnHandheld({ ...devices.phoneLandscape, width }, 'margin')).toBe(true)
  // A phone upright keeps the phone reader; the desktop and an iPad in landscape are the desktop surface already.
  expect(readsMarginOnHandheld(devices.phonePortrait, 'margin')).toBe(false)
  expect(readsMarginOnHandheld(devices.desktop, 'margin')).toBe(false)
  expect(readsMarginOnHandheld(devices.ipadLandscape, 'margin')).toBe(false)
  // Too narrow for a card beside the text: an iPhone SE sideways, an iPad window in Split View.
  expect(readsMarginOnHandheld({ ...devices.phoneLandscape, width: 667 }, 'margin')).toBe(false)
  expect(readsMarginOnHandheld({ ...devices.ipadPortrait, width: 507 }, 'margin')).toBe(false)
})
it('keeps the phone reader on a handheld for a reader who chose Two-page or Compare', () => {
  for (const device of [devices.phoneLandscape, devices.ipadPortrait]) {
    expect(readsMarginOnHandheld(device, 'two-page')).toBe(false)
    expect(readsMarginOnHandheld(device, 'compare')).toBe(false)
    expect(readsMarginOnHandheld(device, 'margin', true)).toBe(false)
    storeDesktopReaderLayout('x', 'two-page')
    expect(readsMarginOnHandheld(device, initialDesktopReaderLayout({ bookId: 'x', device }))).toBe(false)
    expect(readsMarginOnHandheld(device, initialDesktopReaderLayout({ bookId: 'x', search: '?view=margin', device }))).toBe(true)
    localStorage.clear()
  }
})
it('gives the text more room only on an iPad upright in the Margin reader', () => {
  expect(marginReaderRoom(devices.ipadPortrait, true)).toBe('tablet-portrait')
  expect(marginReaderRoom(devices.ipadPortrait, false)).toBeUndefined()
  expect(marginReaderRoom(devices.phoneLandscape, true)).toBeUndefined()
  expect(marginReaderRoom(devices.desktop, false)).toBeUndefined()
})
