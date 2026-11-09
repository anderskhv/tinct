// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, cleanup, render, screen } from '@testing-library/react'
import { LabPhoneCard } from './LabPhoneCard'
import { PHONE_CARD_EXPECTED_SHARE, phoneCardExpectedHeight, phoneCardExpectedShare, phoneCardHoldStep } from './phoneCardHeight'

const css = readFileSync(resolve(__dirname, 'marginPhone.css'), 'utf8')
afterEach(cleanup)

describe('the expected height table (Anders, 9 Nov 2026)', () => {
  it('opens Define small, Explain and Ask mid, the chapter cards tall, never past the card\'s 70% cap', () => {
    expect(phoneCardExpectedShare('define')).toBe(0.4)
    expect(phoneCardExpectedShare('explain')).toBe(0.55)
    expect(phoneCardExpectedShare('ask')).toBe(0.6)
    expect(phoneCardExpectedShare('counterpoint')).toBe(0.6)
    expect(phoneCardExpectedShare('factcheck')).toBe(0.6)
    expect(phoneCardExpectedShare('quiz')).toBe(0.55)
    for (const kind of ['chapter-notes-primer', 'chapter-notes-end', 'chapter-notes-sofar']) expect(phoneCardExpectedShare(kind)).toBe(0.7)
    for (const share of Object.values(PHONE_CARD_EXPECTED_SHARE.standard)) expect(share).toBeLessThanOrEqual(0.7)
    expect(phoneCardExpectedHeight('explain', 844)).toBe(464)
  })
  it('holds Chat (Ask on the phone) like Ask; leaves Talk, notes and characters sized by their content', () => {
    expect(phoneCardExpectedShare('chat')).toBe(0.6)
    for (const kind of ['talk', 'note', 'chapter-note', 'character', 'ask-compose']) expect(phoneCardExpectedShare(kind)).toBeNull()
    expect(phoneCardExpectedHeight('explain', 0)).toBeNull()
  })
})

describe('the held height never shrinks while an answer streams', () => {
  it('opens at the expected height and holds it however the content grows or shrinks', () => {
    let held: number | null = null
    held = phoneCardHoldStep(held, { expected: 464, busy: true, current: 120 }).held
    expect(held).toBe(464)
    for (const current of [464, 300, 464, 590]) {
      held = phoneCardHoldStep(held, { expected: 464, busy: true, current }).held
      expect(held).toBe(464)
    }
  })
  it('never lowers a card already taller than expected when an answer begins (a follow-up)', () => {
    expect(phoneCardHoldStep(null, { expected: 464, busy: true, current: 520 }).held).toBe(520)
    expect(phoneCardHoldStep(520, { expected: 464, busy: true, current: 520 }).held).toBe(520)
  })
  it('a larger screen (the keyboard going) may raise the expected height, never lower it', () => {
    expect(phoneCardHoldStep(400, { expected: 464, busy: true, current: 400 }).held).toBe(464)
    expect(phoneCardHoldStep(464, { expected: 300, busy: true, current: 300 }).held).toBe(464)
  })
  it('settles once to fit when the finished answer is shorter, and keeps the height when it is longer', () => {
    expect(phoneCardHoldStep(464, { expected: 464, busy: false, current: 464, natural: 300 })).toEqual({ held: null, settle: 300 })
    expect(phoneCardHoldStep(464, { expected: 464, busy: false, current: 464, natural: 700 })).toEqual({ held: 464 })
    expect(phoneCardHoldStep(464, { expected: 464, busy: false, current: 464, natural: 462 })).toEqual({ held: 464 })
    // Content-sized cards stay content-sized when nothing is on its way.
    expect(phoneCardHoldStep(null, { expected: 464, busy: false, current: 200, natural: 200 })).toEqual({ held: null })
    expect(phoneCardHoldStep(464, { expected: null, busy: true, current: 464 })).toEqual({ held: null })
  })
})

describe('the card holds its height in the page', () => {
  it('an Explain on its way opens at 55% of the screen, holds it, and fits without motion under reduced motion', () => {
    const real = window.matchMedia
    window.matchMedia = ((query: string) => ({ matches: /reduce/.test(query), media: query, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
    try {
      const view = (busy: boolean) => <div className="lab"><LabPhoneCard label="Explain" kind="explain" onClose={() => {}}><div aria-busy={busy}><p>Text</p></div></LabPhoneCard></div>
      const { rerender } = render(view(true))
      const card = screen.getByTestId('lab-phone-card')
      expect(card.style.height).toBe(`${Math.round(window.innerHeight * 0.55)}px`)
      expect(card.hasAttribute('data-held')).toBe(true)
      act(() => { rerender(view(false)) })
      expect(card.style.height).toBe('')
      expect(card.hasAttribute('data-held')).toBe(false)
    } finally { window.matchMedia = real }
  })
  it('a busy prop holds a PDF card; a card that opens with its answer is content-sized', () => {
    render(<div className="lab"><LabPhoneCard label="Ask" kind="ask" busy onClose={() => {}} testId="pdf"><p>x</p></LabPhoneCard></div>)
    expect(screen.getByTestId('pdf').style.height).toBe(`${Math.round(window.innerHeight * 0.6)}px`)
    render(<div className="lab"><LabPhoneCard label="Explain" kind="explain" onClose={() => {}} testId="saved"><p>A saved answer.</p></LabPhoneCard></div>)
    expect(screen.getByTestId('saved').style.height).toBe('')
  })
  it('desktop cards and Talk are left alone; the settle is one transition, off without motion', () => {
    render(<div className="lab is-desktop"><LabPhoneCard label="Explain" kind="explain" busy onClose={() => {}}><p>x</p></LabPhoneCard></div>)
    expect(screen.getByTestId('lab-phone-card').style.height).toBe('')
    expect(css).toMatch(/\.lab \.lab-pcard\.is-settling \{ transition: height/)
    expect(css).toMatch(/prefers-reduced-motion: reduce\) \{[^\n]*\.lab \.lab-pcard\.is-settling \{ transition: none; \}/)
  })
})
