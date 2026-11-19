// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, cleanup, render, screen } from '@testing-library/react'
import { LabPhoneCard } from './LabPhoneCard'
import {
  PHONE_CARD_CALIBRATION_PAD, PHONE_CARD_EXPECTED_SHARE, PHONE_CARD_HEIGHTS_KEY, phoneCardCalibrated, phoneCardExpectedHeight, phoneCardExpectedShare,
  phoneCardHeightKey, phoneCardHoldStep, phoneCardLength, phoneCardLengthRow, phoneCardOpeningShare, readPhoneCardHeights, recordPhoneCardHeight,
} from './phoneCardHeight'
import { defaultAiSettings } from '../../aiSettings'
import { writeAiSettings } from '../labAiPrefs'

const css = readFileSync(resolve(__dirname, 'marginPhone.css'), 'utf8')
afterEach(() => { cleanup(); localStorage.clear() })

describe('the expected height table (Anders, 9 Nov 2026)', () => {
  it('opens Define small, Explain and Ask mid, the chapter cards tall, never past the card\'s 70% cap', () => {
    expect(phoneCardExpectedShare('define')).toBe(0.45)
    expect(phoneCardExpectedShare('explain')).toBe(0.62)
    expect(phoneCardExpectedShare('ask')).toBe(0.66)
    expect(phoneCardExpectedShare('counterpoint')).toBe(0.66)
    expect(phoneCardExpectedShare('factcheck')).toBe(0.66)
    expect(phoneCardExpectedShare('quiz')).toBe(0.6)
    for (const kind of ['chapter-notes-primer', 'chapter-notes-end', 'chapter-notes-sofar']) expect(phoneCardExpectedShare(kind)).toBe(0.7)
    for (const share of Object.values(PHONE_CARD_EXPECTED_SHARE.standard)) expect(share).toBeLessThanOrEqual(0.7)
    expect(phoneCardExpectedHeight('explain', 844)).toBe(523)
  })
  it('holds Chat (Ask on the phone) like Ask; leaves Talk, notes and characters sized by their content', () => {
    expect(phoneCardExpectedShare('chat')).toBe(0.66)
    for (const kind of ['talk', 'note', 'chapter-note', 'character', 'ask-compose']) expect(phoneCardExpectedShare(kind)).toBeNull()
    expect(phoneCardExpectedHeight('explain', 0)).toBeNull()
  })
})

describe('the card keeps the height it opened at until it closes (Anders, 14 Nov 2026)', () => {
  it('opens at the expected height, or its content if taller, never past its cap', () => {
    expect(phoneCardHoldStep(null, { expected: 464, busy: true, current: 120 }).held).toBe(464)
    expect(phoneCardHoldStep(null, { expected: 464, busy: false, current: 520, natural: 520, cap: 590 }).held).toBe(520)
    expect(phoneCardHoldStep(null, { expected: 464, busy: false, current: 590, natural: 700, cap: 590 }).held).toBe(590)
    // A saved card opened with nothing on its way takes the kind's height too, so a follow-up never raises it.
    expect(phoneCardHoldStep(null, { expected: 464, busy: false, current: 200, natural: 200 }).held).toBe(464)
  })
  it('a whole stream, a longer answer, a follow-up and its end: the height never changes', () => {
    let held: number | null = null
    const seen: number[] = []
    const steps = [
      { busy: true, current: 120, natural: 120 }, { busy: true, current: 270, natural: 150 }, { busy: true, current: 270, natural: 400 },
      { busy: false, current: 270, natural: 590 }, { busy: true, current: 270, natural: 590 }, { busy: false, current: 270, natural: 202 },
    ]
    for (const step of steps) { held = phoneCardHoldStep(held, { expected: 270, ...step, cap: 590 }).held; seen.push(held!) }
    expect(seen).toEqual([270, 270, 270, 270, 270, 270])
  })
  it('a changed expected height (the device learnt a shorter answer, the screen changed) does not move an open card', () => {
    expect(phoneCardHoldStep(464, { expected: 200, busy: true, current: 464, natural: 150 })).toEqual({ held: 464 })
    expect(phoneCardHoldStep(400, { expected: 600, busy: true, current: 400, natural: 700, cap: 800 })).toEqual({ held: 400 })
  })
  it('an empty Chat stays as small as its field until its first question', () => {
    expect(phoneCardHoldStep(null, { expected: 506, busy: false, current: 163, natural: 163, empty: true })).toEqual({ held: null })
    expect(phoneCardHoldStep(null, { expected: 506, busy: true, current: 163, empty: true })).toEqual({ held: 506 })
    expect(phoneCardHoldStep(506, { expected: 506, busy: false, current: 506, natural: 300, empty: false })).toEqual({ held: 506 })
  })
  it('content-sized kinds stay content-sized', () => {
    expect(phoneCardHoldStep(null, { expected: null, busy: true, current: 464 })).toEqual({ held: null })
    expect(phoneCardHoldStep(464, { expected: null, busy: false, current: 464 })).toEqual({ held: null })
  })
})

describe('the opening height follows the length setting and calibrates from this device\'s answers', () => {
  it('reads the Length row of each kind; Simplify, Define and the passage actions have none', () => {
    expect(phoneCardLengthRow('explain')).toBe('explain')
    expect(phoneCardLengthRow('chat')).toBe('ask')
    expect(phoneCardLengthRow('chapter-notes-primer')).toBe('primer')
    expect(phoneCardLengthRow('recap')).toBe('summary')
    for (const kind of ['simplify', 'define', 'factcheck', 'counterpoint', 'quiz']) expect(phoneCardLengthRow(kind)).toBeNull()
    expect(phoneCardLength('explain')).toBe('standard')
    const settings = defaultAiSettings()
    writeAiSettings({ ...settings, length: { ...settings.length, explain: 'brief', ask: 'detailed' } })
    expect(phoneCardLength('explain')).toBe('brief')
    expect(phoneCardLength('ask')).toBe('detailed')
    expect(phoneCardLength('simplify')).toBeNull()
  })
  it('opens Brief small (about three lines), Detailed taller, Simplify small at every length', () => {
    expect(phoneCardExpectedShare('explain', 'brief')).toBe(0.38)
    expect(phoneCardExpectedShare('explain', 'detailed')).toBe(0.7)
    expect(phoneCardExpectedShare('simplify', null)).toBe(0.42)
    for (const length of ['brief', 'standard', 'detailed'] as const) {
      for (const share of Object.values(PHONE_CARD_EXPECTED_SHARE[length])) expect(share).toBeLessThanOrEqual(0.7)
      expect(phoneCardExpectedShare('explain', length)! >= phoneCardExpectedShare('explain', 'brief')!).toBe(true)
    }
    expect(phoneCardExpectedShare('note', 'brief')).toBeNull()
  })
  it('folds each answer into a moving average per kind and length, kept on this device', () => {
    let store = phoneCardCalibrated({}, 'simplify:any', 0.24)
    expect(store['simplify:any']).toEqual({ share: 0.24, n: 1 })
    store = phoneCardCalibrated(store, 'simplify:any', 0.3)
    expect(store['simplify:any']).toEqual({ share: 0.27, n: 2 })
    for (let i = 0; i < 20; i++) store = phoneCardCalibrated(store, 'simplify:any', 0.5)
    expect(store['simplify:any'].share).toBeGreaterThan(0.49)
    expect(phoneCardCalibrated(store, 'x:any', 2)['x:any'].share).toBe(0.7)
    expect(phoneCardCalibrated(store, 'x:any', 0)).toBe(store)
    recordPhoneCardHeight('explain', 'brief', 0.25)
    expect(JSON.parse(localStorage.getItem(`tinct:${PHONE_CARD_HEIGHTS_KEY}`)!)).toEqual({ 'explain:brief': { share: 0.25, n: 1 } })
    expect(readPhoneCardHeights()).toEqual({ 'explain:brief': { share: 0.25, n: 1 } })
    expect(phoneCardHeightKey('simplify', null)).toBe('simplify:any')
  })
  it('opens at the learnt share plus a line, within the card\'s bounds; the table until something is learnt', () => {
    expect(phoneCardOpeningShare('simplify', null, {})).toBe(0.42)
    expect(phoneCardOpeningShare('simplify', null, { 'simplify:any': { share: 0.24, n: 1 } })).toBeCloseTo(0.24 + PHONE_CARD_CALIBRATION_PAD)
    expect(phoneCardOpeningShare('simplify', null, { 'simplify:any': { share: 0.05, n: 1 } })).toBe(0.25)
    expect(phoneCardOpeningShare('explain', 'brief', { 'explain:standard': { share: 0.6, n: 3 } })).toBe(0.38)
    expect(phoneCardOpeningShare('note', null, { 'note:any': { share: 0.3, n: 1 } })).toBeNull()
    expect(phoneCardExpectedHeight('simplify', 844, null, { 'simplify:any': { share: 0.24, n: 1 } })).toBe(270)
    localStorage.setItem(`tinct:${PHONE_CARD_HEIGHTS_KEY}`, '{"a:any":{"share":"x","n":1},"b:any":{"share":0.3,"n":0},"c:any":{"share":0.3,"n":2}}')
    expect(readPhoneCardHeights()).toEqual({ 'c:any': { share: 0.3, n: 2 } })
  })
})

describe('the card holds its height in the page', () => {
  // Was 'an Explain on its way opens at 55% of the screen, holds it, and fits without motion under reduced motion':
  // its last two lines asserted the settle down to fit, the jump Anders reported on 13 Nov 2026.
  it('an Explain on its way opens at 55% of the screen and keeps that height when its answer ends shorter', () => {
    const view = (busy: boolean) => <div className="lab"><LabPhoneCard label="Explain" kind="explain" onClose={() => {}}><div aria-busy={busy}><p>Text</p></div></LabPhoneCard></div>
    const { rerender } = render(view(true))
    const card = screen.getByTestId('lab-phone-card')
    expect(card.style.height).toBe(`${Math.round(window.innerHeight * 0.62)}px`)
    expect(card.hasAttribute('data-held')).toBe(true)
    act(() => { rerender(view(false)) })
    expect(card.style.height).toBe(`${Math.round(window.innerHeight * 0.62)}px`)
    expect(card.hasAttribute('data-held')).toBe(true)
  })
  it('remembers the first answer\'s height, and the next card of that kind opens at it', () => {
    // jsdom has no layout: a card is as tall as its inline height, or 200px when sized by its content.
    const offset = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')!
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get() { return this.classList?.contains('lab-pcard') ? (parseFloat(this.style.height) || 200) : 0 } })
    try {
      const view = (busy: boolean, key: string) => <div className="lab"><LabPhoneCard key={key} label="Simplify" kind="simplify" onClose={() => {}}><div aria-busy={busy}><p>Text</p></div></LabPhoneCard></div>
      const { rerender } = render(view(true, 'a'))
      const first = screen.getByTestId('lab-phone-card')
      const opened = Math.round(window.innerHeight * 0.42)
      expect(first.style.height).toBe(`${opened}px`)
      act(() => { rerender(view(false, 'a')) })
      expect(first.style.height).toBe(`${opened}px`)
      const learnt = readPhoneCardHeights()['simplify:any']
      expect(learnt.n).toBe(1)
      expect(learnt.share).toBeCloseTo(200 / window.innerHeight, 2)
      // A follow-up's end in the same card is not a first answer: nothing more is learnt.
      act(() => { rerender(view(true, 'a')) })
      act(() => { rerender(view(false, 'a')) })
      expect(readPhoneCardHeights()['simplify:any'].n).toBe(1)
      act(() => { rerender(view(true, 'b')) })
      expect(screen.getByTestId('lab-phone-card').style.height).toBe(`${Math.round(window.innerHeight * (learnt.share + PHONE_CARD_CALIBRATION_PAD))}px`)
    } finally { Object.defineProperty(HTMLElement.prototype, 'offsetHeight', offset) }
  })
  it('a busy prop holds a PDF card; a saved card opens at its kind\'s height too, so a follow-up never raises it (14 Nov 2026)', () => {
    render(<div className="lab"><LabPhoneCard label="Ask" kind="ask" busy onClose={() => {}} testId="pdf"><p>x</p></LabPhoneCard></div>)
    expect(screen.getByTestId('pdf').style.height).toBe(`${Math.round(window.innerHeight * 0.66)}px`)
    const { rerender } = render(<div className="lab"><LabPhoneCard label="Explain" kind="explain" onClose={() => {}} testId="saved"><div className="lab-pcard-answer">A saved answer.</div></LabPhoneCard></div>)
    const opened = `${Math.round(window.innerHeight * 0.62)}px`
    expect(screen.getByTestId('saved').style.height).toBe(opened)
    rerender(<div className="lab"><LabPhoneCard label="Explain" kind="explain" onClose={() => {}} testId="saved"><div className="lab-pcard-answer">A saved answer.</div><div aria-busy="true" /></LabPhoneCard></div>)
    expect(screen.getByTestId('saved').style.height).toBe(opened)
  })
  // Was 'desktop cards and Talk are left alone; the settle is one transition, off without motion': the settle and
  // its transition are gone (13 Nov 2026).
  it('desktop cards are left alone; nothing animates the card down', () => {
    render(<div className="lab is-desktop"><LabPhoneCard label="Explain" kind="explain" busy onClose={() => {}}><p>x</p></LabPhoneCard></div>)
    expect(screen.getByTestId('lab-phone-card').style.height).toBe('')
    expect(css).not.toMatch(/is-settling/)
  })
})
