// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { LabChapterHeading } from '../LabChapterHeading'
import { LabChapterEnd } from '../LabChapterEnd'
import { MarginPhoneContext } from './marginPhoneContext'
import { splitLead } from './LabPhoneCard'
import { parsePhoneQuiz, parsePhoneQuizMark } from './LabPhoneCards'

afterEach(cleanup)

describe('the chapter pills in the phone margin mode', () => {
  it('without the mode the heading keeps its Primer chip and the end its Recap and Note', () => {
    const { container } = render(<><LabChapterHeading title="Chapter 1" preview onPreview={() => {}} /><LabChapterEnd chapterTitle="Chapter 1" hasNext onDiscuss={() => {}} onNote={() => {}} /></>)
    expect(container.querySelector('.lab-passage-header > .lab-chapter-preview')).not.toBeNull()
    expect(container.querySelector('.lab-unit-pills, .lab-unit-k')).toBeNull()
    expect(screen.queryByText('Quiz me')).toBeNull()
  })

  it('at a chapter start: "Starting <chapter>" with ✧ Primer and ✧ Catch me up, in place of the chip', () => {
    const onCatchUp = vi.fn(), onPreview = vi.fn()
    const { container } = render(<MarginPhoneContext.Provider value={{ onCatchUp }}><LabChapterHeading title="Chapter 3 — The Storm" preview onPreview={onPreview} /></MarginPhoneContext.Provider>)
    expect(container.querySelector('.lab-passage-header > .lab-chapter-preview')).toBeNull()
    expect(screen.getByTestId('lab-unit-start').textContent).toBe('Starting Chapter 3✧Primer✧Catch me up')
    fireEvent.click(screen.getByTestId('lab-unit-primer'))
    fireEvent.click(screen.getByTestId('lab-unit-catchup'))
    expect(onPreview).toHaveBeenCalledTimes(1)
    expect(onCatchUp).toHaveBeenCalledTimes(1)
  })

  it('at a chapter end: "End of <chapter>" with ✧ Recap, ✧ Quiz me and Note', () => {
    const onQuiz = vi.fn()
    render(<MarginPhoneContext.Provider value={{ onQuiz }}><LabChapterEnd chapterTitle="Chapter 3" hasNext onDiscuss={() => {}} onNote={() => {}} /></MarginPhoneContext.Provider>)
    expect(screen.getByTestId('lab-chapter-end').textContent).toMatch(/^End of Chapter 3✧Recap✧Quiz meNoteNext chapter/)
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
