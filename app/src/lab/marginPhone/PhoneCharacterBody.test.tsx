// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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
  fireEvent.click(screen.getByRole('button', { name: 'People so far' }))
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

// Design B (Anders, 27 Nov 2026). It replaces the two links of 26 Nov ("Character gallery", "Back to selected name"),
// which sat side by side under the text: the way back is now above the name, so the two can never run together.
function ananiasAndAdam() {
  const card = { id: 'ananias', kind: 'person', role: 'reference', name: 'Ananias', subtitle: 'Disciple in Damascus', body: 'Restores Saul’s sight.' }
  const adam = { ...card, id: 'adam', role: 'major', name: 'Adam', subtitle: 'The first man', body: 'Formed from the dust.' }
  const character: CharacterSelection = { card, cutoff: { chapterNumber: 1, paragraphIndex: 0, offset: 10 }, gallery: [{ card, inPassage: true }, { card: adam, inPassage: false }] }
  return render(<PhoneCharacterBody character={character} renderFollow={() => <textarea aria-label="Ask a follow-up" />} />)
}
const follows = (first: Element, second: Element) => !!(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)

it('the tapped person: no way back, and one link under the text, "People so far →"', () => {
  ananiasAndAdam()
  const body = screen.getByTestId('lab-phone-character-body')
  expect(screen.queryByRole('button', { name: /^Back to/ })).toBeNull()
  const links = [...body.querySelectorAll('button')]
  expect(links.map(link => link.textContent)).toEqual(['People so far →'])
  // The arrow is drawn, not read out.
  expect(screen.getByRole('button', { name: 'People so far' })).toBe(links[0])
  // Chrome: the cards' own link style (system UI, marginPhone.css), under the text and above the follow-up field.
  expect(links[0].className).toBe('lab-pcard-link')
  expect(links[0].parentElement!.className).toBe('lab-pcard-character-links')
  expect(follows(screen.getByText('Restores Saul’s sight.'), links[0])).toBe(true)
  expect(follows(links[0], screen.getByLabelText('Ask a follow-up'))).toBe(true)
  expect(body.textContent).not.toMatch(/Character gallery|Back to selected name/)
})

it('the gallery is headed "People so far", with the way back to the tapped person above the heading', () => {
  ananiasAndAdam()
  fireEvent.click(screen.getByRole('button', { name: 'People so far' }))
  const heading = screen.getByRole('heading', { level: 2 })
  expect(heading.textContent).toBe('People so far')
  const back = screen.getByRole('button', { name: 'Back to Ananias' })
  expect(back.textContent).toBe('← Ananias')
  expect(follows(back, heading)).toBe(true)
  // The gallery's own link is not repeated inside it, and nothing follows its list.
  expect(screen.queryByRole('button', { name: 'People so far' })).toBeNull()
  expect(screen.getByTestId('lab-phone-character-body').lastElementChild!.className).toBe('popup-character-gallery')
  fireEvent.click(back)
  expect(screen.getByRole('heading', { level: 2 }).textContent).toContain('Ananias')
  expect(screen.queryByRole('button', { name: /^Back to/ })).toBeNull()
})

it('another person from the gallery: "← Ananias" above the name returns to the tapped person', () => {
  ananiasAndAdam()
  fireEvent.click(screen.getByRole('button', { name: 'People so far' }))
  fireEvent.click(screen.getByText('Adam'))
  const name = screen.getByRole('heading', { level: 2 })
  expect(name.textContent).toBe('Adam · Major figure')
  const back = screen.getByRole('button', { name: 'Back to Ananias' })
  expect(back.textContent).toBe('← Ananias')
  expect(back.className).toBe('lab-pcard-link lab-pcard-character-back')
  // Above the name, and apart from the gallery link, which stays under the text.
  expect(back.nextElementSibling).toBe(name)
  const gallery = screen.getByRole('button', { name: 'People so far' })
  expect(follows(name, gallery)).toBe(true)
  expect(gallery.parentElement).not.toBe(back.parentElement)
  fireEvent.click(back)
  expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Ananias · Minor figure')
  expect(screen.queryByRole('button', { name: /^Back to/ })).toBeNull()
  expect(screen.getByRole('button', { name: 'People so far' })).toBeTruthy()
})

it('the tapped person chosen again in the gallery shows no way back to themselves', () => {
  ananiasAndAdam()
  fireEvent.click(screen.getByRole('button', { name: 'People so far' }))
  fireEvent.click(screen.getByText('Ananias', { selector: 'strong' }))
  expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Ananias · Minor figure')
  expect(screen.queryByRole('button', { name: /^Back to/ })).toBeNull()
})

it('the links are chrome: system UI as the cards’ other links, sentence case, no rule lines', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/lab/marginPhone/marginPhone.css'), 'utf8')
  expect(css).toMatch(/\.lab \.lab-pcard-link \{ font: 14px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif !important;/)
  const rules = css.split('\n').filter(line => /lab-pcard-character-(back|links)/.test(line) && line.includes('{'))
  expect(rules.length).toBeGreaterThan(0)
  for (const rule of rules) expect(rule).not.toMatch(/border|text-transform|font-family|letter-spacing/)
})
