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
