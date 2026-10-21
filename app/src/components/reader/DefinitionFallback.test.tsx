// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { DefinitionFallback } from './DefinitionFallback'
afterEach(cleanup)
it('ignores a late lookup after selecting another word', async () => {
  let finish!: (value: string) => void
  const request = vi.fn().mockImplementationOnce(() => new Promise<string>(resolve => { finish = resolve })).mockResolvedValueOnce('noun. New selection.')
  const view = render(<DefinitionFallback word="First" request={request} />)
  view.rerender(<DefinitionFallback word="Second" request={request} />)
  await screen.findByText('noun. New selection.')
  await act(async () => { finish(JSON.stringify({kind:'person',name:'First',importance:'major',subtitle:'Role',body:'Old selection.'})) })
  expect(screen.queryByText('Old selection.')).toBeNull()
  expect(screen.getByText('noun. New selection.')).toBeTruthy()
})

it('names a looked-up person once: the panel head carries the name, the card does not repeat it', async () => {
  const request = vi.fn().mockResolvedValue(JSON.stringify({ kind: 'person', name: 'Sanballat', importance: 'minor', subtitle: 'An opponent of the rebuilding', body: 'He mocks the work on the wall.' }))
  render(<DefinitionFallback word="Sanballat" request={request} />)
  const card = await screen.findByTestId('popup-contextual-character')
  expect(card.textContent).not.toContain('Sanballat')
  expect(card.textContent).not.toContain('At this passage')
  expect(card.textContent).toContain('An opponent of the rebuilding')
})

it('offers Chat and Talk under a person card, carrying the card into the conversation', async () => {
  const request = vi.fn().mockResolvedValue(JSON.stringify({ kind: 'person', name: 'Sanballat', importance: 'minor', subtitle: 'An opponent of the rebuilding', body: 'He mocks the work on the wall.' }))
  const onChat = vi.fn(), onTalk = vi.fn()
  render(<DefinitionFallback word="Sanballat" request={request} onChat={onChat} onTalk={onTalk} />)
  await screen.findByTestId('popup-contextual-character')
  screen.getByRole('button', { name: 'Chat about Sanballat' }).click()
  screen.getByRole('button', { name: 'Talk about Sanballat' }).click()
  expect(onChat).toHaveBeenCalledWith('Sanballat: An opponent of the rebuilding\n\nHe mocks the work on the wall.')
  expect(onTalk).toHaveBeenCalledTimes(1)
})

it('says a shared name is shared and lists the namesakes instead of asking for a guess', async () => {
  const request = vi.fn().mockResolvedValue(JSON.stringify({ kind: 'person', name: 'John', importance: 'major', subtitle: 'Wrong namesake', body: 'A confident guess.' }))
  const card = (id: string, name: string, subtitle: string) => ({ id, kind: 'person', role: null, name, subtitle, body: '' })
  const namesakes = { name: 'John', candidates: [card('john-the-baptist', 'John the Baptist', 'Prophet in the wilderness'), card('john-apostle', 'John', 'Son of Zebedee')] }
  render(<DefinitionFallback word="John," request={request} namesakes={namesakes} />)
  const notice = screen.getByTestId('popup-namesakes')
  expect(notice.textContent).toContain('Several people are called John in this book.')
  expect(notice.textContent).toContain('John the Baptist')
  expect(notice.textContent).toContain('Son of Zebedee')
  expect(request).not.toHaveBeenCalled()
  expect(screen.queryByTestId('popup-contextual-character')).toBeNull()
})

it('looks the word up as usual once the reader types a different word', async () => {
  const request = vi.fn().mockResolvedValue('noun. Something else.')
  const namesakes = { name: 'John', candidates: [] }
  render(<DefinitionFallback word="Joppa" request={request} namesakes={namesakes} />)
  await screen.findByText('noun. Something else.')
  expect(screen.queryByTestId('popup-namesakes')).toBeNull()
})
