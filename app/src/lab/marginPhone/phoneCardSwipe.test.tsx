// @vitest-environment jsdom
// Closing a phone card (Anders, 17 Nov 2026): a downward swipe anywhere on the card closes it, as iOS sheets do, but
// only while what is under the finger is scrolled to its top; the whole header row drags like the grip; a tap on the
// dimmed page above closes it.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { LabPhoneCard, PhoneFollow, phoneCardSwipeCloses } from './LabPhoneCard'

let now = 0
beforeEach(() => { now = 1000; vi.spyOn(performance, 'now').mockImplementation(() => now) })
afterEach(() => { cleanup(); vi.restoreAllMocks() })

function card(onClose = vi.fn()) {
  render(
    <div className="lab is-phone has-phone-chrome is-margin-phone">
      <LabPhoneCard label="Define · Luke 24" kind="define" onClose={onClose}
        foot={<PhoneFollow value="" onChange={() => {}} onSend={() => {}} />}>
        <p data-testid="answer">Joanna. One of the women at the tomb.</p>
      </LabPhoneCard>
    </div>,
  )
  return { onClose, card: screen.getByTestId('lab-phone-card'), body: screen.getByTestId('lab-phone-card-body'), answer: screen.getByTestId('answer') }
}
const at = (y: number) => ({ touches: [{ clientX: 180, clientY: y, identifier: 1 }], changedTouches: [{ clientX: 180, clientY: y, identifier: 1 }] })
/** A finger down at y0 and moved to each y in turn, `ms` apart; returns whether each move was taken from the browser. */
function swipe(target: Element, y0: number, ys: number[], ms = 16, lift = true) {
  fireEvent.touchStart(target, at(y0))
  const taken = ys.map(y => { now += ms; return !fireEvent.touchMove(target, at(y)) })
  now += ms
  if (lift) fireEvent.touchEnd(target, { touches: [], changedTouches: [{ clientX: 180, clientY: ys[ys.length - 1], identifier: 1 }] })
  return taken
}

describe('a downward swipe on the card closes it (iOS sheet)', () => {
  it('anywhere on the card while its content is at the top: it follows the finger, then closes past the threshold', () => {
    const { onClose, card: el, answer } = card()
    fireEvent.touchStart(answer, at(500))
    now += 16
    const taken = !fireEvent.touchMove(answer, at(540))
    expect(taken).toBe(true)
    expect(el.style.transform).toBe('translateY(40px)')
    expect(onClose).not.toHaveBeenCalled()
    now += 200
    fireEvent.touchMove(answer, at(640))
    now += 200
    fireEvent.touchEnd(answer, { touches: [], changedTouches: [{ clientX: 180, clientY: 640, identifier: 1 }] })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('when the content is scrolled down, a downward swipe scrolls it as normal', () => {
    const { onClose, body, answer, card: el } = card()
    body.scrollTop = 120
    Object.defineProperty(body, 'scrollTop', { configurable: true, value: 120 })
    const taken = swipe(answer, 400, [440, 520, 600])
    expect(taken).toEqual([false, false, false])
    expect(el.style.transform).toBe('')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('a short slow pull springs back and leaves the card open', () => {
    const { onClose, card: el, answer } = card()
    swipe(answer, 400, [410, 420, 430], 120)
    expect(onClose).not.toHaveBeenCalled()
    expect(el.style.transform).toBe('')
  })

  it('a quick flick closes it before the distance threshold', () => {
    const { onClose, answer } = card()
    swipe(answer, 400, [415, 435], 10)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('an upward swipe is the card\'s own scroll', () => {
    const { onClose, answer, card: el } = card()
    expect(swipe(answer, 500, [480, 420, 300])).toEqual([false, false, false])
    expect(el.style.transform).toBe('')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('never from the follow-up field, nor from a long press (a text selection)', () => {
    const { onClose, answer } = card()
    swipe(screen.getByTestId('lab-phone-card-input'), 700, [760, 840, 900])
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.touchStart(answer, at(400))
    now += 600
    expect(fireEvent.touchMove(answer, at(480))).toBe(true)
    now += 16
    fireEvent.touchMove(answer, at(600))
    fireEvent.touchEnd(answer, { touches: [], changedTouches: [{ clientX: 180, clientY: 600, identifier: 1 }] })
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('the header row drags like the grip', () => {
  it('a drag down that starts on the title closes the card', () => {
    const { onClose } = card()
    const label = screen.getByTestId('lab-phone-card-label')
    fireEvent.pointerDown(label, { pointerId: 3, pointerType: 'touch', clientY: 300 })
    now += 16
    fireEvent.pointerMove(label, { pointerId: 3, pointerType: 'touch', clientY: 340 })
    now += 200
    fireEvent.pointerMove(label, { pointerId: 3, pointerType: 'touch', clientY: 420 })
    now += 200
    fireEvent.pointerUp(label, { pointerId: 3, pointerType: 'touch', clientY: 420 })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('the header row and the grip are one drag area with no browser panning', () => {
    card()
    const drag = screen.getByTestId('lab-phone-card-drag')
    expect(drag.contains(screen.getByTestId('lab-phone-card-label'))).toBe(true)
    expect(drag.querySelector('.lab-pcard-head')).toBeTruthy()
  })
})

describe('a tap on the dimmed page above closes the card', () => {
  it('closes on a press outside the card', () => {
    const { onClose } = card()
    const page = document.createElement('p')
    document.body.append(page)
    fireEvent.pointerDown(page, { pointerId: 5, pointerType: 'touch', clientY: 100 })
    expect(onClose).toHaveBeenCalledTimes(1)
    page.remove()
  })
})

describe('when a pull closes (phoneCardSwipeCloses)', () => {
  it('past a fifth of the card (60 to 120px), or a downward flick', () => {
    expect(phoneCardSwipeCloses(59, 0.1, 0)).toBe(false)
    expect(phoneCardSwipeCloses(61, 0.1, 0)).toBe(true)
    expect(phoneCardSwipeCloses(90, 0.1, 500)).toBe(false)
    expect(phoneCardSwipeCloses(101, 0.1, 500)).toBe(true)
    expect(phoneCardSwipeCloses(119, 0.1, 900)).toBe(false)
    expect(phoneCardSwipeCloses(121, 0.1, 900)).toBe(true)
    expect(phoneCardSwipeCloses(30, 0.9, 900)).toBe(true)
    expect(phoneCardSwipeCloses(10, 2, 900)).toBe(false)
  })
})
