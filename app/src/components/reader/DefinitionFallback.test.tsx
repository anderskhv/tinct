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
