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

it('puts the name and its role on one line, as the desktop popup does (Anders, 18 Nov 2026)', () => {
  const card = { id: 'mary', kind: 'person', role: 'major', name: 'Mary Magdalene', subtitle: 'Follower of Jesus', body: 'First at the empty tomb.' }
  const character: CharacterSelection = { card, cutoff: { chapterNumber: 1, paragraphIndex: 0, offset: 10 }, gallery: [{ card, inPassage: true }] }
  render(<PhoneCharacterBody character={character} renderFollow={() => null} />)
  const title = screen.getByRole('heading', { level: 2 })
  expect(title.className).toBe('popup-character-name')
  expect(title.textContent).toBe('Mary Magdalene · Major figure')
  expect(screen.getByTestId('lab-phone-character-body').querySelector('small')).toBeNull()
})

it('a name without a role is the name alone', () => {
  const card = { id: 'x', kind: 'person', role: null, name: 'Cleopas', subtitle: '', body: 'On the road to Emmaus.' }
  const character = { card, cutoff: { chapterNumber: 1, paragraphIndex: 0, offset: 10 }, gallery: [{ card, inPassage: true }] } as unknown as CharacterSelection
  render(<PhoneCharacterBody character={character} renderFollow={() => null} />)
  expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Cleopas')
})

it('keeps Character gallery and Back to selected name apart once another person is shown (Anders, 26 Nov 2026)', () => {
  const card = { id: 'ananias', kind: 'person', role: 'reference', name: 'Ananias', subtitle: 'Disciple in Damascus', body: 'Restores Saul’s sight.' }
  const adam = { ...card, id: 'adam', role: 'major', name: 'Adam', subtitle: 'The first man', body: 'Formed from the dust.' }
  const character: CharacterSelection = { card, cutoff: { chapterNumber: 1, paragraphIndex: 0, offset: 10 }, gallery: [{ card, inPassage: true }, { card: adam, inPassage: false }] }
  render(<PhoneCharacterBody character={character} renderFollow={() => null} />)
  fireEvent.click(screen.getByText('Character gallery'))
  fireEvent.click(screen.getByText('Adam'))
  const gallery = screen.getByRole('button', { name: 'Character gallery' })
  const back = screen.getByRole('button', { name: 'Back to selected name' })
  // Both links sit in one row laid out with a gap (marginPhone.css), never as bare adjacent inline buttons.
  const row = gallery.parentElement!
  expect(row.className).toBe('lab-pcard-character-links')
  expect(back.parentElement).toBe(row)
  fireEvent.click(back)
  expect(screen.getByRole('heading', { level: 2 }).textContent).toContain('Ananias')
  expect(screen.queryByRole('button', { name: 'Back to selected name' })).toBeNull()
})
