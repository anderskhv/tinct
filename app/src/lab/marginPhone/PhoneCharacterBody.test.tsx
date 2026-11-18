// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { PhoneCharacterBody } from './LabPhoneCards'
import type { CharacterSelection } from '../../services/characters/characterCards'
afterEach(cleanup)
it('offers a follow-up for the displayed person, including a gallery choice', () => {
  const card = { id: 'first', kind: 'person', role: 'supporting', name: 'First person', subtitle: 'First role', body: 'First body.' }
  const other = { ...card, id: 'second', name: 'Second person', body: 'Second body.' }
  const character: CharacterSelection = { card, cutoff: {chapterNumber:1,paragraphIndex:0,offset:10}, gallery: [{card,inPassage:true},{card:other,inPassage:true}] }
  render(<PhoneCharacterBody character={character} renderFollow={shown => <textarea aria-label="Ask a follow-up" data-context={shown.body} />} />)
  expect(screen.queryByRole('button', {name:'More actions'})).toBeNull()
  expect(screen.getByLabelText('Ask a follow-up').getAttribute('data-context')).toBe('First body.')
  fireEvent.click(screen.getByText('Character gallery'))
  expect(screen.queryByLabelText('Ask a follow-up')).toBeNull()
  fireEvent.click(screen.getByText('Second person'))
  expect(screen.getByLabelText('Ask a follow-up').getAttribute('data-context')).toBe('Second body.')
})
