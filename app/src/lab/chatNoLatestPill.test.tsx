// @vitest-environment jsdom
// No "Latest" pill over a chat answer (Anders, 17 Nov 2026: "Why would I need that pill… it just popped up in my
// face"). The sent question is held near the top and its answer grows under it; the reader scrolls on their own.
// Neither the phone Chat card, the desktop chat panel nor the PDF reader's chat draws one.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LabAskPane } from './LabAskPane'
import * as thread from '../../public/lab/chat-thread.js'

afterEach(() => cleanup())

describe('no Latest pill in the chat', () => {
  // Each turn is 100px plus 30px per 40 characters, stacked from the thread's top (as LabAskPane.test.tsx models it).
  const CLIENT = 600
  const heightOf = (node: Element) => 100 + Math.floor((node.textContent || '').length / 40) * 30
  const saved = {
    scrollHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight'),
    clientHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight'),
    rect: HTMLElement.prototype.getBoundingClientRect,
  }
  const isThread = (node: HTMLElement) => node.getAttribute('data-testid') === 'lab-ask-thread'
  const rows = (node: Element) => Array.from(node.querySelectorAll('.tc-turn, .tc-pending'))
  const spacerOf = (node: Element) => parseFloat((node.querySelector('.tc-spacer') as HTMLElement | null)?.style.height || '0') || 0
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get(this: HTMLElement) {
      return isThread(this) ? rows(this).reduce((sum, row) => sum + heightOf(row), 0) + spacerOf(this) : 0
    } })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get(this: HTMLElement) { return isThread(this) ? CLIENT : 0 } })
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      const host = this.closest('[data-testid="lab-ask-thread"]') as HTMLElement | null
      let top = 0
      if (host && !isThread(this) && this.matches('.tc-turn, .tc-pending')) {
        const all = rows(host)
        top = all.slice(0, all.indexOf(this)).reduce((sum, row) => sum + heightOf(row), 0) - host.scrollTop
      }
      return { top, bottom: top + 100, left: 0, right: 0, width: 0, height: 100, x: 0, y: top, toJSON: () => ({}) } as DOMRect
    }
  })
  afterEach(() => {
    if (saved.scrollHeight) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', saved.scrollHeight)
    if (saved.clientHeight) Object.defineProperty(HTMLElement.prototype, 'clientHeight', saved.clientHeight)
    HTMLElement.prototype.getBoundingClientRect = saved.rect
  })

  const history = Array.from({ length: 20 }, (_, i) => ({ id: `t${i}`, role: (i % 2 ? 'assistant' : 'user') as 'user' | 'assistant', content: `Turn ${i}.`, source: 'typed' as const }))
  const ask = { id: 'u-ask', role: 'user' as const, content: 'Why does Luke name Joanna?', source: 'typed' as const }
  const reply = (n: number) => ({ id: 'a-reply', role: 'assistant' as const, content: 'Joanna was the wife of Chuza, Herod’s steward. '.repeat(n), source: 'typed' as const })
  const base = {
    conversationState: 'idle' as const, voiceActive: false, draft: '',
    onDraftChange: () => {}, onSubmit: () => {}, onMic: () => {}, onVoiceMode: () => {},
  }
  const pill = () => document.querySelector('[data-testid="lab-ask-latest"], .tc-latest')

  for (const [where, props] of [
    ['the phone Chat card', { phoneSheet: true, embeddedPhoneCard: true }],
    ['the desktop chat panel', { desktopCompanion: 'chat' as const, onDone: () => {} }],
  ] as const) {
    it(`${where}: scrolling up while the answer streams in never brings a pill; the question was held near the top`, () => {
      const { rerender } = render(<LabAskPane {...base} {...props} typedLoading={false} turns={history} />)
      expect(pill()).toBeNull()
      const node = screen.getByTestId('lab-ask-thread')
      rerender(<LabAskPane {...base} {...props} typedLoading turns={[...history, ask]} />)
      const questionAt = node.scrollTop
      // The question sits near the top of the thread (20 turns of 100px above it).
      expect(questionAt).toBeGreaterThan(1800)
      expect(questionAt).toBeLessThan(2000)
      rerender(<LabAskPane {...base} {...props} typedLoading turns={[...history, ask, reply(20)]} />)
      expect(pill()).toBeNull()
      // The reader scrolls up, and more of the answer arrives below them: still no pill, and they stay put.
      node.scrollTop = 900
      fireEvent.scroll(node)
      rerender(<LabAskPane {...base} {...props} typedLoading turns={[...history, ask, reply(40)]} />)
      expect(node.scrollTop).toBe(900)
      expect(pill()).toBeNull()
      rerender(<LabAskPane {...base} {...props} typedLoading={false} turns={[...history, ask, reply(40)]} />)
      expect(pill()).toBeNull()
    })
  }

  it('the shared thread module has no pill rule and the PDF reader draws no pill', () => {
    expect('latestPill' in thread).toBe(false)
    expect('scrollToLatest' in thread).toBe(false)
    const reader = readFileSync(resolve(__dirname, '../../public/lab/addbook/js/reader.js'), 'utf8')
    expect(reader).not.toMatch(/tc-latest|latestPill|scrollToLatest|>Latest</)
    const css = readFileSync(resolve(__dirname, '../../public/lab/chat-thread.css'), 'utf8')
    expect(css).not.toMatch(/tc-latest/)
  })
})
