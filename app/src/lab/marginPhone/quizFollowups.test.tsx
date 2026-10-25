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
  expect(screen.getByTestId('lab-phone-quiz-next')).toBeTruthy()
})
it('does not invent a grade when the response is malformed and retains the answer for retry', async () => {
  const mark = vi.fn(async () => 'not JSON')
  render(<Harness mark={mark} />)
  await act(async () => {})
  await answer('Your answer', 'Ice.')
  expect(screen.getByRole('status').textContent).toContain('Couldn’t check')
  expect((screen.getByRole('textbox', { name: 'Your answer' }) as HTMLTextAreaElement).value).toBe('Ice.')
  expect(screen.queryByTestId('lab-phone-quiz-next')).toBeNull()
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
