// @vitest-environment jsdom
import { useState } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { PhoneQuizBody } from './LabPhoneCards'
import type { QuizTurn } from '../../companion/companionRequest'
afterEach(cleanup)
const quiz = JSON.stringify({ questions: [{ q: 'Why does the ship stop?', answer: 'It is trapped in ice.', why: 'Ice surrounds it.' }] })
function Harness({ mark }: { mark: (question: unknown, answer: string, turns?: QuizTurn[]) => Promise<string> }) {
  const [draft, setDraft] = useState('')
  return <PhoneQuizBody request={async () => quiz} mark={mark} draft={draft} setDraft={setDraft} />
}
async function answer(label: string, text: string) {
  const field = screen.getByRole('textbox', { name: label })
  fireEvent.change(field, { target: { value: text } })
  await act(async () => fireEvent.keyDown(field, { key: 'Enter' }))
}
it('keeps the original answer and markings through three bounded graded follow-ups', async () => {
  const mark = vi.fn(async (_question: unknown, _answer: string, _turns?: QuizTurn[]) => JSON.stringify({ verdict: 'nearly', feedback: 'Think about the ice.' }))
  render(<Harness mark={mark} />)
  await act(async () => {})
  await answer('Your answer', 'The weather.')
  expect(screen.getByRole('textbox', { name: 'Ask about your answer' })).toBeTruthy()
  await answer('Ask about your answer', 'Is it the ice?')
  expect(mark.mock.calls[1][2]).toEqual([{ role: 'reader', text: 'The weather.' }, { role: 'grader', text: 'Think about the ice.', verdict: 'nearly' }])
  await answer('Ask about your answer', 'Around the ship?')
  await answer('Ask about your answer', 'So it cannot move?')
  expect(mark).toHaveBeenCalledTimes(4)
  expect(screen.queryByRole('textbox')).toBeNull()
  // Its only question, so the last: the score and Try another quiz are there (no "See your score", 13 Nov 2026).
  expect(screen.getByTestId('lab-phone-quiz-score').textContent).toBe('0 of 1')
  expect(screen.getByTestId('lab-phone-quiz-again')).toBeTruthy()
})
it('does not invent a grade when the response is malformed and retains the answer for retry', async () => {
  const mark = vi.fn(async () => 'not JSON')
  render(<Harness mark={mark} />)
  await act(async () => {})
  await answer('Your answer', 'Ice.')
  expect(screen.getByRole('status').textContent).toContain('Couldn’t check')
  expect((screen.getByRole('textbox', { name: 'Your answer' }) as HTMLTextAreaElement).value).toBe('Ice.')
  expect(screen.queryByTestId('lab-phone-quiz-next')).toBeNull()
  expect(screen.queryByTestId('lab-phone-quiz-score')).toBeNull()
})

it.each(['is-desktop', 'is-phone'])('clears a submitted quiz answer immediately while retaining its exchange on %s', async profile => {
  let resolve!: (result: string) => void
  const mark = vi.fn(() => new Promise<string>(done => { resolve = done }))
  render(<div className={`lab ${profile}`}><Harness mark={mark} /></div>)
  await act(async () => {})
  await answer('Your answer', 'The surrounding ice.')
  expect((screen.getByRole('textbox', { name: 'Your answer' }) as HTMLTextAreaElement).value).toBe('')
  expect(screen.getByTestId('lab-phone-quiz-pending-answer').textContent).toBe('The surrounding ice.')
  expect(screen.getByRole('button', { name: 'Send' }).hasAttribute('disabled')).toBe(true)
  expect(mark).toHaveBeenCalledOnce()
  expect(screen.queryByText(/esc(?:ape)? to/i)).toBeNull()
  await act(async () => { resolve(JSON.stringify({ verdict: 'nearly', feedback: 'Think about why it cannot move.' })) })
  expect(screen.getByTestId('lab-phone-quiz-history').textContent).toContain('The surrounding ice.')
  expect(screen.queryByTestId('lab-phone-quiz-pending-answer')).toBeNull()
  expect((screen.getByRole('textbox', { name: 'Ask about your answer' }) as HTMLTextAreaElement).value).toBe('')
  expect(screen.queryByText(/esc(?:ape)? to/i)).toBeNull()
})

it.each(['reject', 'malformed'])('restores a submitted answer after a %s grading failure for retry', async failure => {
  let resolve!: (result: string) => void, reject!: (error: Error) => void
  const mark = vi.fn(() => new Promise<string>((done, fail) => { resolve = done; reject = fail }))
  render(<Harness mark={mark} />)
  await act(async () => {})
  await answer('Your answer', 'Ice blocks the ship.')
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('')
  await act(async () => { if (failure === 'reject') reject(new Error('Synthetic failure')); else resolve('not a grade') })
  expect((screen.getByRole('textbox', { name: 'Your answer' }) as HTMLTextAreaElement).value).toBe('Ice blocks the ship.')
  expect(screen.getByRole('status').textContent).toContain('Couldn’t check')
  expect(screen.getByRole('button', { name: 'Send' }).hasAttribute('disabled')).toBe(false)
})

// Anders, 13 Nov 2026 ("I think we should skip 'see your score'"): the last question's result shows the score at once.
const three = JSON.stringify({ questions: [{ q: 'First?', answer: 'One.' }, { q: 'Second?', answer: 'Two.' }, { q: 'Last?', answer: 'Three.' }] })
function Ended({ mark, onComplete, request = async () => three }: { mark: (question: unknown, answer: string, turns?: QuizTurn[]) => Promise<string>; onComplete: (summary: string) => void; request?: (onDelta: (text: string) => void) => Promise<string> }) {
  const [draft, setDraft] = useState('')
  return <PhoneQuizBody request={request} mark={mark} draft={draft} setDraft={setDraft} onComplete={onComplete}
    follow={() => <p data-testid="end-follow">Ask a follow-up</p>} />
}
it('shows the score and Try another quiz under the last question once it is marked, and records completion once', async () => {
  const mark = vi.fn(async (_question: unknown, answer: string) => JSON.stringify(answer === 'Three.' ? { verdict: 'right', feedback: 'Exactly.' } : { verdict: 'not_yet', feedback: 'No.' }))
  const onComplete = vi.fn()
  render(<Ended mark={mark} onComplete={onComplete} />)
  await act(async () => {})
  fireEvent.click(screen.getByTestId('lab-phone-quiz-show'))
  expect(screen.getByTestId('lab-phone-quiz-next').textContent).toBe('Next question →')
  fireEvent.click(screen.getByTestId('lab-phone-quiz-next'))
  await answer('Your answer', 'Two.')
  expect(screen.getByTestId('lab-phone-quiz-next').textContent).toBe('Next question →')
  expect(screen.queryByTestId('lab-phone-quiz-score')).toBeNull()
  fireEvent.click(screen.getByTestId('lab-phone-quiz-next'))
  expect(onComplete).not.toHaveBeenCalled()
  await answer('Your answer', 'Three.')
  expect(screen.getByTestId('lab-phone-quiz-question').textContent).toBe('Last?')
  expect(screen.getByText('Exactly.')).toBeTruthy()
  expect(screen.getByTestId('lab-phone-quiz-score').textContent).toBe('1 of 2')
  expect(screen.getByTestId('lab-phone-quiz-again')).toBeTruthy()
  expect(screen.getByTestId('end-follow')).toBeTruthy()
  expect(screen.queryByTestId('lab-phone-quiz-next')).toBeNull()
  expect(screen.queryByText(/See your score/)).toBeNull()
  expect(onComplete).toHaveBeenCalledOnce()
  expect(onComplete.mock.calls[0][0]).toMatch(/^1\. First\?\nExpected: One\.\nReader: answer shown\n\n2\. Second\?[\s\S]*Reader: Not yet\. No\.[\s\S]*3\. Last\?\nExpected: Three\.\nReader: Right\. Exactly\./)
  // A new quiz completes once more.
  await act(async () => fireEvent.click(screen.getByTestId('lab-phone-quiz-again')))
  expect(screen.queryByTestId('lab-phone-quiz-score')).toBeNull()
  expect(screen.getByTestId('lab-phone-quiz-question').textContent).toBe('First?')
  expect(onComplete).toHaveBeenCalledOnce()
})
it('keeps "Ask about your answer" above the score after a wrong last answer, without completing again', async () => {
  const mark = vi.fn(async () => JSON.stringify({ verdict: 'nearly', feedback: 'Closer.' }))
  const onComplete = vi.fn()
  const one = JSON.stringify({ questions: [{ q: 'Only?', answer: 'Yes.' }] })
  render(<Ended mark={mark} onComplete={onComplete} request={async () => one} />)
  await act(async () => {})
  await answer('Your answer', 'Maybe.')
  const field = screen.getByRole('textbox', { name: 'Ask about your answer' })
  const score = screen.getByTestId('lab-phone-quiz-score')
  expect(score.textContent).toBe('0 of 1')
  expect(field.compareDocumentPosition(score) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(score.compareDocumentPosition(screen.getByTestId('lab-phone-quiz-again')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  // One field at a time: the end's follow-up waits until the answer can no longer be discussed.
  expect(screen.queryByTestId('end-follow')).toBeNull()
  expect(onComplete).toHaveBeenCalledOnce()
  await answer('Ask about your answer', 'Is it yes?')
  expect(mark).toHaveBeenCalledTimes(2)
  expect(screen.getByRole('textbox', { name: 'Ask about your answer' })).toBeTruthy()
  expect(screen.getByTestId('lab-phone-quiz-score').textContent).toBe('0 of 1')
  expect(onComplete).toHaveBeenCalledOnce()
})
it('ends a quiz whose writing stopped early with the questions it has', async () => {
  let push: (text: string) => void = () => {}
  let fail: (error: Error) => void = () => {}
  const partial = three.slice(0, three.indexOf('{"q":"Second?"'))
  const request = (onDelta: (text: string) => void) => { push = onDelta; return new Promise<string>((_resolve, reject) => { fail = reject }) }
  const onComplete = vi.fn()
  render(<Ended mark={vi.fn()} onComplete={onComplete} request={request} />)
  act(() => push(partial))
  fireEvent.click(screen.getByTestId('lab-phone-quiz-show'))
  // Still being written: there may be more, so it goes on.
  expect(screen.getByTestId('lab-phone-quiz-next').textContent).toBe('Next question →')
  expect(onComplete).not.toHaveBeenCalled()
  fireEvent.click(screen.getByTestId('lab-phone-quiz-next'))
  await act(async () => fail(new Error('stopped')))
  expect(screen.getByTestId('lab-phone-quiz-question').textContent).toBe('First?')
  expect(screen.getByTestId('lab-phone-quiz-score').textContent).toBe('1 of 1 shown')
  expect(screen.queryByTestId('lab-phone-quiz-next')).toBeNull()
  expect(onComplete).toHaveBeenCalledOnce()
})
