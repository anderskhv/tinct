// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { LabChapterHeading } from '../LabChapterHeading'
import { LabChapterEnd } from '../LabChapterEnd'
import { MarginPhoneContext, catchUpAvailable, isFrontMatter } from './marginPhoneContext'
import { labSuperMenuRows } from '../labSuperMenu'
import { LabPhoneCard, phoneCardRoom, splitLead } from './LabPhoneCard'
import { LabPhoneBar, PHONE_MORE_ROWS, phoneMorePlace } from './LabPhoneBar'
import { PhoneNoteBody, PhonePassageBody, parsePhoneQuiz, parsePhoneQuizMark } from './LabPhoneCards'
import { PHONE_CARD_PASSAGE_CLASS, markPhoneCardPassage } from './phoneCardPassage'

const css = readFileSync(resolve(__dirname, 'marginPhone.css'), 'utf8')
const appSource = readFileSync(resolve(__dirname, '../LabApp.tsx'), 'utf8')

afterEach(cleanup)

describe('the chapter pills in the phone margin mode', () => {
  it('without the mode the heading keeps its Primer chip and the end its Recap and Note', () => {
    const { container } = render(<><LabChapterHeading title="Chapter 1" preview onPreview={() => {}} /><LabChapterEnd chapterTitle="Chapter 1" hasNext onDiscuss={() => {}} onNote={() => {}} /></>)
    expect(container.querySelector('.lab-passage-header > .lab-chapter-preview')).not.toBeNull()
    expect(container.querySelector('.lab-unit-pills, .lab-unit-k')).toBeNull()
    expect(screen.queryByText('Quiz me')).toBeNull()
  })

  it('at a chapter start: ✧ Primer and ✧ Catch me up on the heading\u2019s own line, no "Starting" line, in place of the chip', () => {
    const onCatchUp = vi.fn(), onPreview = vi.fn()
    const { container } = render(<MarginPhoneContext.Provider value={{ onCatchUp }}><LabChapterHeading title="Chapter 3 — The Storm" preview onPreview={onPreview} /></MarginPhoneContext.Provider>)
    expect(container.querySelector('.lab-passage-header > .lab-chapter-preview')).toBeNull()
    expect(screen.getByTestId('lab-unit-start').textContent).toBe('✧Primer✧Catch me up')
    expect(container.textContent).not.toMatch(/Starting/)
    // A sibling of the headline in the heading's flex row (it wraps under only a title too long to share it).
    const header = container.querySelector('.lab-passage-header')!
    expect(screen.getByTestId('lab-unit-start').parentElement).toBe(header)
    expect(header.classList.contains('has-preview')).toBe(true)
    expect(css).toMatch(/\.lab-unit-pills\.is-start \{ flex: 0 1 auto; display: flex;/)
    expect(css).not.toMatch(/lab-unit-pills\.is-start \{[^}]*100%/)
    fireEvent.click(screen.getByTestId('lab-unit-primer'))
    fireEvent.click(screen.getByTestId('lab-unit-catchup'))
    expect(onPreview).toHaveBeenCalledTimes(1)
    expect(onCatchUp).toHaveBeenCalledTimes(1)
  })

  it('at a chapter end: ✧ Recap, ✧ Quiz me and Note, with no "End of" label', () => {
    const onQuiz = vi.fn()
    render(<MarginPhoneContext.Provider value={{ onQuiz }}><LabChapterEnd chapterTitle="Chapter 3" hasNext onDiscuss={() => {}} onNote={() => {}} /></MarginPhoneContext.Provider>)
    expect(screen.getByTestId('lab-chapter-end').textContent).toMatch(/^✧Recap✧Quiz meNoteNext chapter/)
    expect(screen.queryByTestId('lab-unit-end')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-unit-quiz'))
    expect(onQuiz).toHaveBeenCalledTimes(1)
  })

  it('measuring copies lay out the same pills (pagination) and never act', () => {
    const onQuiz = vi.fn(), onCatchUp = vi.fn()
    const painted = render(<MarginPhoneContext.Provider value={{ onQuiz, onCatchUp }}><LabChapterHeading title="Chapter 3" preview /><LabChapterEnd chapterTitle="Chapter 3" hasNext /></MarginPhoneContext.Provider>)
    const measured = render(<MarginPhoneContext.Provider value={{ onQuiz, onCatchUp }}><LabChapterHeading title="Chapter 3" preview measuring /><LabChapterEnd chapterTitle="Chapter 3" hasNext measuring /></MarginPhoneContext.Provider>)
    const text = (root: HTMLElement) => root.textContent
    expect(text(measured.container)).toBe(text(painted.container))
    measured.container.querySelectorAll('button').forEach(button => fireEvent.click(button))
    expect(onQuiz).not.toHaveBeenCalled()
    expect(onCatchUp).not.toHaveBeenCalled()
  })
})

describe('no Catch me up before there is anything to catch up on', () => {
  const chapters = [{ number: 0, title: 'Preface' }, { number: 1, title: 'Introduction' }, { number: 2, title: 'Chapter 1' }, { number: 3, title: 'Chapter 2' }]
  it('the first chapter and front matter have none; a chapter after a real one has it', () => {
    expect(catchUpAvailable(chapters, 0)).toBe(false)
    expect(catchUpAvailable(chapters, 1)).toBe(false)
    expect(catchUpAvailable(chapters, 2)).toBe(false)
    expect(catchUpAvailable(chapters, 3)).toBe(true)
    expect(catchUpAvailable([{ number: 1, title: 'Letter 1' }, { number: 2, title: 'Letter 2' }], 1)).toBe(false)
    expect(catchUpAvailable([{ number: 1, title: 'Letter 1' }, { number: 2, title: 'Letter 2' }], 2)).toBe(true)
    expect(isFrontMatter("Translator's Note")).toBe(true)
    expect(isFrontMatter('Prologue')).toBe(false)
  })
  it('the start pill shows only ✧ Primer, and the t menu has no Catch me up row', () => {
    render(<MarginPhoneContext.Provider value={{ catchUp: false }}><LabChapterHeading title="Chapter 1" preview onPreview={() => {}} /></MarginPhoneContext.Provider>)
    expect(screen.getByTestId('lab-unit-start').textContent).toBe('✧Primer')
    expect(labSuperMenuRows({ phone: true, noCatchUp: true }).some(row => row.id === 'catchup')).toBe(false)
    expect(labSuperMenuRows({ phone: true }).some(row => row.id === 'catchup')).toBe(true)
  })
})

describe('the cards', () => {
  it('an answer leads with its first sentence', () => {
    expect(splitLead('The point is simple. Then more follows.')).toEqual({ lead: 'The point is simple.', tail: 'Then more follows.' })
    expect(splitLead('One sentence only')).toEqual({ lead: 'One sentence only', tail: '' })
    expect(splitLead('“Quoted.” And after.')).toEqual({ lead: '“Quoted.”', tail: 'And after.' })
  })
  it('Quiz me reads its questions and a marked answer', () => {
    expect(parsePhoneQuiz('```json\n{"questions":[{"q":"Q1","answer":"A1","why":"W"},{"q":2}]}\n```')).toEqual([{ q: 'Q1', answer: 'A1', why: 'W' }])
    expect(parsePhoneQuiz('{"questions":[')).toBeNull()
    expect(parsePhoneQuizMark('{"verdict":"nearly","feedback":"Close."}')).toEqual({ verdict: 'nearly', feedback: 'Close.' })
    expect(parsePhoneQuizMark('{"verdict":"maybe"}')).toBeNull()
  })
})

describe('the selection bar (iPhone feedback, 20 Oct 2026)', () => {
  const bar = () => render(<div className="lab"><LabPhoneBar text="some words" fallbackY={300} onAsk={() => {}} onExplain={() => {}} onSimplify={() => {}}
    onMore={() => {}} onHighlight={() => {}} onNote={() => {}} onRemove={() => {}} onDismiss={() => {}} /></div>)

  it('Ask is the word alone: no blinking line after it', () => {
    bar()
    expect(screen.getByTestId('lab-pbar-ask').textContent).toBe('Ask')
    expect(screen.getByTestId('lab-pbar-ask').children).toHaveLength(0)
    expect(css).not.toMatch(/lab-pbar-caret|lab-pbar-blink/)
  })

  it('••• lists Define, Fact-check, Counterpoint, Quiz me and Copy (not "Copy quote")', () => {
    expect(PHONE_MORE_ROWS.map(([, name]) => name)).toEqual(['Define', 'Fact-check', 'Counterpoint', 'Quiz me', 'Copy'])
    bar()
    fireEvent.click(screen.getByTestId('lab-pbar-more'))
    expect(screen.getByTestId('lab-phone-more').textContent).toBe('DefineFact-checkCounterpointQuiz meCopy')
    // As wide as its longest name: no fixed width.
    expect(css).toMatch(/\.lab \.lab-pmore \{[^}]*width: max-content/)
    expect(css).not.toMatch(/\.lab \.lab-pmore \{[^}]*width: 210px/)
  })
})

describe('the ••• menu stays whole on screen', () => {
  const view = { top: 0, bottom: 844, width: 390 }
  const menu = { width: 150, height: 210 }
  it('opens below the bar, under the •••, when it fits', () => {
    expect(phoneMorePlace({ left: 10, top: 300, bottom: 348 }, { left: 190 }, menu, view)).toEqual({ left: 180, above: false })
  })
  it('flips above the bar when there is no room below', () => {
    expect(phoneMorePlace({ left: 10, top: 600, bottom: 648 }, { left: 190 }, menu, view)).toEqual({ left: 180, above: true })
  })
  it('moves in from the right edge', () => {
    const place = phoneMorePlace({ left: 10, top: 300, bottom: 348 }, { left: 300 }, menu, view)
    expect(10 + place.left + menu.width).toBeLessThanOrEqual(390 - 10)
  })
  it('counts only what the keyboard leaves visible', () => {
    expect(phoneMorePlace({ left: 10, top: 300, bottom: 348 }, { left: 190 }, menu, { top: 0, bottom: 500, width: 390 }).above).toBe(true)
  })
  it('takes the side with more room when it fits on neither', () => {
    expect(phoneMorePlace({ left: 10, top: 100, bottom: 148 }, { left: 20 }, { width: 150, height: 600 }, view).above).toBe(false)
  })
})

describe('the cards', () => {
  it('no field takes the focus by itself: no cursor and no keyboard until the reader taps it', () => {
    render(<div className="lab"><LabPhoneCard label="Note · Letter 1" kind="note" onClose={() => {}}><PhoneNoteBody value="" onChange={() => {}} /></LabPhoneCard></div>)
    expect(document.activeElement).toBe(document.body)
    // LabApp no longer focuses a card's field when Ask, a note or a chapter note opens.
    expect(appSource).not.toMatch(/phoneFieldRef\.current\?\.focus/)
  })

  it('do not quote the passage: the card starts with its title row, then the answer', () => {
    render(<div className="lab"><LabPhoneCard label="Simplify · Letter 1" kind="simplify" onClose={() => {}}>
      <PhonePassageBody lead={<p data-testid="answer">The answer.</p>} turns={[]} pending={false} />
    </LabPhoneCard></div>)
    expect(screen.queryByTestId('lab-phone-card-quote')).toBeNull()
    const card = screen.getByTestId('lab-phone-card')
    expect(card.querySelector('[data-testid="lab-phone-card-label"]')?.textContent).toBe('Simplify · Letter 1')
    expect(screen.getByTestId('lab-phone-card-body').firstElementChild).toBe(screen.getByTestId('answer'))
    expect(css).not.toMatch(/lab-pcard-quote/)
  })

  it('dim the page behind them', () => {
    render(<div className="lab"><LabPhoneCard label="Explain" kind="explain" onClose={() => {}}><p>x</p></LabPhoneCard></div>)
    expect(screen.getByTestId('lab-phone-card-scrim')).toBeTruthy()
    expect(css).toMatch(/\.lab \.lab-pcard-scrim \{[^}]*position: fixed[^}]*pointer-events: none/)
  })

  it('fit the visible window above the keyboard', () => {
    expect(phoneCardRoom({ height: 844, offsetTop: 0 }, 844)).toEqual({ height: 844, keyboard: false })
    expect(phoneCardRoom({ height: 480, offsetTop: 120 }, 844)).toEqual({ height: 480, keyboard: true })
    expect(phoneCardRoom(null, 700)).toEqual({ height: 700, keyboard: false })
    expect(css).toMatch(/max-height: calc\(var\(--lab-pcard-room, 100dvh\) - var\(--lab-pcard-gap\)\)/)
  })
})

describe('the open card\u2019s passage stays underlined on the page', () => {
  it('marks the words in its range, keeps the mark as the page renders again, and takes it off when the card closes', async () => {
    document.body.innerHTML = `<div data-testid="lab-root"><div data-testid="lab-page-wrap"><article class="lab-passage">
      ${[0, 1, 2, 3, 4].map(i => `<span class="lab-hearing-word" data-testid="lab-word" data-paragraph-index="2" data-word-index="${i}">w${i}</span>`).join(' ')}
      <div class="lab-opening-passage" data-chapter-number="4"><span class="lab-hearing-word" data-testid="lab-opening-word" data-paragraph-index="2" data-word-index="1">n1</span></div>
    </article></div></div>`
    const root = document.querySelector('[data-testid="lab-root"]')!
    const marked = () => [...root.querySelectorAll('.' + PHONE_CARD_PASSAGE_CLASS)].map(node => node.textContent)
    const off = markPhoneCardPassage(root, [{ chapterNumber: 3, range: { paragraphIndex: 2, fromWord: 1, endParagraphIndex: 2, toWord: 4 } }], 3)
    expect(marked()).toEqual(['w1', 'w2', 'w3'])
    // React writes a word's class again (a highlight made from the card): the mark comes back.
    const word = root.querySelector('[data-word-index="2"]')!
    word.className = 'lab-hearing-word is-hl-warm'
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 40)) })
    expect(marked()).toEqual(['w1', 'w2', 'w3'])
    off()
    expect(marked()).toEqual([])
    expect(css).toMatch(/\.is-card-passage \{[^}]*text-decoration: underline/)
    document.body.innerHTML = ''
  })
})
