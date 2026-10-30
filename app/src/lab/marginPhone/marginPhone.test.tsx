// @vitest-environment jsdom
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { LabChapterHeading } from '../LabChapterHeading'
import { LabChapterEnd } from '../LabChapterEnd'
import { MarginPhoneContext, catchUpAvailable, isFrontMatter } from './marginPhoneContext'
import { labSuperMenuRows } from '../labSuperMenu'
import { LabPhoneCard, PHONE_CARD_TYPING_ATTR, phoneCardRoom, splitLead } from './LabPhoneCard'
import { LabPhoneBar, PHONE_MORE_ROWS, phoneBarLeft, phoneMorePlace } from './LabPhoneBar'
import { PhoneFollowField, PhoneNoteBody, PhonePassageBody, PhoneQuizBody, parsePhoneQuiz, parsePhoneQuizMark, parsePhoneQuizPartial } from './LabPhoneCards'
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
    const trigger = screen.getByTestId('lab-unit-quiz')
    const anchor = { left: 500, right: 590, top: 640, bottom: 670 } as DOMRect
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(anchor)
    fireEvent.click(trigger)
    expect(onQuiz).toHaveBeenCalledExactlyOnceWith(anchor)
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
  it('the start pill shows only ✧ Primer, while the t menu keeps Catch me up', () => {
    render(<MarginPhoneContext.Provider value={{ catchUp: false }}><LabChapterHeading title="Chapter 1" preview onPreview={() => {}} /></MarginPhoneContext.Provider>)
    expect(screen.getByTestId('lab-unit-start').textContent).toBe('✧Primer')
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

  it('••• lists Evaluate, Counterpoint, Quiz me and Copy (no Define: a tap defines; not "Copy quote")', () => {
    expect(PHONE_MORE_ROWS.map(([, name]) => name)).toEqual(['Evaluate', 'Counterpoint', 'Quiz me', 'Copy'])
    bar()
    fireEvent.click(screen.getByTestId('lab-pbar-more'))
    expect(screen.getByTestId('lab-phone-more').textContent).toBe('EvaluateCounterpointQuiz meCopy')
    // As wide as its longest name: no fixed width.
    expect(css).toMatch(/\.lab \.lab-pmore \{[^}]*width: max-content/)
    expect(css).not.toMatch(/\.lab \.lab-pmore \{[^}]*width: 210px/)
  })

  it('keeps Show page available for a selected PDF passage and an existing mark', () => {
    const onShowPage = vi.fn()
    const props = { text: 'passage', fallbackY: 300, onAsk: vi.fn(), onExplain: vi.fn(), onSimplify: vi.fn(),
      onMore: vi.fn(), onHighlight: vi.fn(), onNote: vi.fn(), onRemove: vi.fn(), onDismiss: vi.fn(), onShowPage }
    const view = render(<div className="lab"><LabPhoneBar {...props} /></div>)
    fireEvent.click(screen.getByTestId('lab-pbar-more'))
    fireEvent.click(screen.getByTestId('lab-pmore-page'))
    expect(onShowPage).toHaveBeenCalledTimes(1)
    view.rerender(<div className="lab"><LabPhoneBar {...props} text="saved passage" existingColor="gold" /></div>)
    fireEvent.click(screen.getByTestId('lab-pbar-more'))
    expect(screen.queryByTestId('lab-pmore-define')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-pmore-page'))
    expect(onShowPage).toHaveBeenCalledTimes(2)
  })
})

// Anders, iPhone, Frankenstein 6 (21 Oct 2026): "Pop up didn't fit the content - still too broad - cut the black space".
describe('the selection bar fits its buttons', () => {
  it('is only as wide as its buttons: no stretch, no spacer', () => {
    expect(css).toMatch(/\.lab \.lab-pbar \{[^}]*width: max-content/)
    expect(css).not.toMatch(/\.lab \.lab-pbar \{[^}]*right: 10px/)
    expect(css).not.toMatch(/lab-pbar-grow/)
  })
  it('sits at the selection, its tip over the first word', () => {
    expect(phoneBarLeft(150, 300, 390)).toEqual({ left: 80, tip: 70 })
  })
  it('stays whole inside the window at either side', () => {
    expect(phoneBarLeft(40, 300, 390)).toEqual({ left: 10, tip: 30 })
    const right = phoneBarLeft(370, 300, 390)
    expect(right.left + 300).toBeLessThanOrEqual(380)
    expect(right.left + right.tip).toBe(364)
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
    expect(phoneCardRoom({ height: 844, offsetTop: 0 }, 844)).toEqual({ top: 0, height: 844, keyboard: false })
    expect(phoneCardRoom({ height: 480, offsetTop: 120 }, 844)).toEqual({ top: 120, height: 480, keyboard: true })
    expect(phoneCardRoom(null, 700)).toEqual({ top: 0, height: 700, keyboard: false })
    // iOS may report innerHeight already shrunk to the visible part: the layout's height or a focused field still say
    // the keyboard is up, and the card stands on offsetTop + height either way.
    expect(phoneCardRoom({ height: 420, offsetTop: 260 }, 420, 844)).toEqual({ top: 260, height: 420, keyboard: true })
    expect(phoneCardRoom({ height: 420, offsetTop: 0 }, 420, 420, true)).toEqual({ top: 0, height: 420, keyboard: true })
    // The dock spans the visual viewport; the card is as tall as its content, at most 70% of it.
    expect(css).toMatch(/\.lab \.lab-pcard-dock \{[^}]*position: fixed[^}]*top: var\(--lab-pcard-top, 0px\); height: var\(--lab-pcard-room, 100dvh\)[^}]*justify-content: flex-end/)
    expect(css).toMatch(/\.lab \.lab-pcard \{[^}]*position: relative[^}]*max-height: calc\(var\(--lab-pcard-room, 100dvh\) \* \.7\)/)
    expect(css).not.toMatch(/\.lab \.lab-pcard \{[^}]*bottom: var\(--lab-keyboard-inset/)
  })

  it('stand on what the reader sees: the dock follows visualViewport offsetTop and height', () => {
    let height = 844, offsetTop = 0
    const viewport = Object.assign(new EventTarget(), {})
    Object.defineProperty(viewport, 'height', { get: () => height })
    Object.defineProperty(viewport, 'offsetTop', { get: () => offsetTop })
    const real = Object.getOwnPropertyDescriptor(window, 'visualViewport')
    Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => viewport })
    try {
      render(<div className="lab"><LabPhoneCard label="Ask" kind="ask" onClose={() => {}} foot={<textarea data-testid="field" />}><p>x</p></LabPhoneCard></div>)
      const dock = screen.getByTestId('lab-phone-card-dock')
      expect(dock.style.getPropertyValue('--lab-pcard-top')).toBe('0px')
      expect(dock.style.getPropertyValue('--lab-pcard-room')).toBe('844px')
      act(() => { height = 430; offsetTop = 250; viewport.dispatchEvent(new Event('resize')) })
      expect(dock.style.getPropertyValue('--lab-pcard-top')).toBe('250px')
      expect(dock.style.getPropertyValue('--lab-pcard-room')).toBe('430px')
      act(() => { viewport.dispatchEvent(new Event('scroll')); offsetTop = 300; viewport.dispatchEvent(new Event('scroll')) })
      expect(dock.style.getPropertyValue('--lab-pcard-top')).toBe('300px')
      // A field in the card has the focus: the keyboard is up and the narration bar is put away.
      act(() => { screen.getByTestId('field').focus() })
      expect(document.documentElement.hasAttribute(PHONE_CARD_TYPING_ATTR)).toBe(true)
      expect(screen.getByTestId('lab-phone-card').hasAttribute('data-keyboard')).toBe(true)
      expect(css).toMatch(/html\[data-pcard-typing\] \.lab \.lab-phone-bar \{ visibility: hidden; \}/)
      cleanup()
      expect(document.documentElement.hasAttribute(PHONE_CARD_TYPING_ATTR)).toBe(false)
    } finally {
      if (real) Object.defineProperty(window, 'visualViewport', real)
      else delete (window as { visualViewport?: unknown }).visualViewport
    }
  })

  it('end with the follow-up field: mic, Talk and send', () => {
    const onTalk = vi.fn(), onMic = vi.fn(), onSend = vi.fn()
    const { rerender } = render(<div className="lab"><PhoneFollowField value="" onChange={() => {}} onSend={onSend} onMic={onMic} onTalk={onTalk} /></div>)
    expect(screen.getByTestId('lab-phone-card-input').getAttribute('placeholder')).toBe('Ask a follow-up')
    fireEvent.click(screen.getByTestId('lab-phone-card-talk'))
    fireEvent.click(screen.getByTestId('lab-phone-card-mic'))
    rerender(<div className="lab"><PhoneFollowField value="Why?" onChange={() => {}} onSend={onSend} onMic={onMic} onTalk={onTalk} /></div>)
    expect(screen.queryByTestId('lab-phone-card-talk')).toBeNull()
    expect(screen.queryByTestId('lab-phone-card-mic')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-phone-card-send'))
    expect(onTalk).toHaveBeenCalledTimes(1)
    expect(onMic).toHaveBeenCalledTimes(1)
    expect(onSend).toHaveBeenCalledWith('Why?')
    // 16px or more, so iOS does not zoom into the field.
    expect(css).toMatch(/\.lab-pcard-follow-input \{[^}]*font: 400 16px/)
  })
})

describe('Quiz me arrives fast (iPhone feedback, 21 Oct 2026)', () => {
  const quiz = '{"ideas":["a","b"],"thesis":"t","questions":[{"idea":0,"q":"Q1 {braces} \\"quoted\\"?","answer":"A1","why":"W1","cite":""},{"idea":1,"q":"Q2","answer":"A2","why":"W2","cite":""},{"idea":1,"q":"Q3","answer":"A3","cite":""},{"idea":0,"q":"Q4","answer":"A4","cite":""}]}'
  it('reads each question once it is whole in the stream', () => {
    const at = (needle: string) => quiz.slice(0, quiz.indexOf(needle))
    expect(parsePhoneQuizPartial(at('"questions"'))).toEqual([])
    expect(parsePhoneQuizPartial(at('"answer":"A1"'))).toEqual([])
    expect(parsePhoneQuizPartial(at('{"idea":1,"q":"Q2"')).map(q => q.q)).toEqual(['Q1 {braces} "quoted"?'])
    expect(parsePhoneQuizPartial(quiz).map(q => q.q)).toEqual(['Q1 {braces} "quoted"?', 'Q2', 'Q3', 'Q4'])
  })

  it('shows "Writing questions…" at once, then the first question before the rest are written', async () => {
    let push: (text: string) => void = () => {}
    let finish: (text: string) => void = () => {}
    const request = (onDelta: (text: string) => void) => { push = onDelta; return new Promise<string>(resolve => { finish = resolve }) }
    render(<div className="lab"><PhoneQuizBody request={request} mark={async () => ''} draft="" setDraft={() => {}} /></div>)
    expect(screen.getByTestId('lab-phone-quiz-writing').textContent).toMatch(/Writing questions…/)
    act(() => push(quiz.slice(0, quiz.indexOf('{"idea":1,"q":"Q2"'))))
    expect(screen.getByTestId('lab-phone-quiz-question').textContent).toBe('Q1 {braces} "quoted"?')
    expect(screen.getByText(/1 of 3/)).toBeTruthy()
    // Shown, then on: the next is still being written.
    fireEvent.click(screen.getByTestId('lab-phone-quiz-show'))
    fireEvent.click(screen.getByTestId('lab-phone-quiz-next'))
    expect(screen.getByTestId('lab-phone-quiz-writing')).toBeTruthy()
    await act(async () => { push(quiz); finish(quiz) })
    expect(screen.getByTestId('lab-phone-quiz-question').textContent).toBe('Q2')
  })

  it('the end ends with the follow-up field, the quiz as what it carries', async () => {
    const follow = vi.fn((summary: string) => <p data-testid="follow">{summary.split('\n')[0]}</p>)
    render(<div className="lab"><PhoneQuizBody request={async onDelta => { onDelta(quiz); return quiz }} mark={async () => ''} draft="" setDraft={() => {}} follow={follow} /></div>)
    await act(async () => {})
    for (let i = 0; i < 3; i++) { fireEvent.click(screen.getByTestId('lab-phone-quiz-show')); fireEvent.click(screen.getByTestId('lab-phone-quiz-next')) }
    expect(screen.getByTestId('follow').textContent).toBe('1. Q1 {braces} "quoted"?')
    expect(screen.getByTestId('lab-phone-quiz-again')).toBeTruthy()
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

it('applies the phone highlighter color immediately and opens colours only on the second press', () => {
  localStorage.setItem('tinct-highlight-color', 'lavender')
  const save = vi.fn()
  function HighlightBar() {
    const [color, setColor] = useState<'gold' | 'rose' | 'sage' | 'sky' | 'lavender' | undefined>()
    return <div className="lab"><LabPhoneBar text="Selected words" fallbackY={300} existingColor={color} onAsk={vi.fn()} onExplain={vi.fn()} onSimplify={vi.fn()} onMore={vi.fn()}
      onHighlight={next => { save(next); setColor(next) }} onNote={vi.fn()} onRemove={vi.fn()} onDismiss={vi.fn()} /></div>
  }
  render(<HighlightBar />)
  fireEvent.click(screen.getByRole('button', { name: 'Highlight in Lavender' }))
  expect(save).toHaveBeenCalledExactlyOnceWith('lavender')
  expect(screen.queryByTestId('lab-pbar-color-sage')).toBeNull()
  expect(screen.getByRole('button', { name: 'Highlight in Lavender' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Highlight in Lavender' }))
  expect(save).toHaveBeenCalledOnce()
  expect(screen.getByTestId('lab-pbar-color-lavender').getAttribute('aria-pressed')).toBe('true')
  fireEvent.click(screen.getByTestId('lab-pbar-color-sage'))
  expect(save).toHaveBeenLastCalledWith('sage')
})


it('keeps an older Chat reply in place when its composer gains focus and the keyboard resizes', () => {
  const viewport = new EventTarget() as EventTarget & { height: number; offsetTop: number }
  viewport.height = 844; viewport.offsetTop = 0
  const real = Object.getOwnPropertyDescriptor(window, 'visualViewport')
  Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => viewport })
  try {
    render(<LabPhoneCard label="Chat" kind="chat" onClose={vi.fn()}><div className="tc-thread" data-testid="history" /><textarea aria-label="Chat question" /></LabPhoneCard>)
    const history = screen.getByTestId('history')
    Object.defineProperty(history, 'scrollHeight', { configurable: true, value: 3000 })
    history.scrollTop = 120
    act(() => screen.getByLabelText('Chat question').focus())
    expect(history.scrollTop).toBe(120)
    viewport.height = 420
    act(() => { viewport.dispatchEvent(new Event('resize')) })
    expect(history.scrollTop).toBe(120)
    expect(screen.getByTestId('lab-phone-card').hasAttribute('data-keyboard')).toBe(true)
  } finally {
    if (real) Object.defineProperty(window, 'visualViewport', real)
    else delete (window as { visualViewport?: unknown }).visualViewport
  }
})
