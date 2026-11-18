// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'
import { CONTEXTUAL_LOOKUP_DEFINITION_LINE, CONTEXTUAL_LOOKUP_PROMPT, contextualLookupPreview, splitDefinition } from './contextualLookup'
import { ContextualLookupView, DefinitionWithHeadword, headwordLabel } from './DefinitionFallback'

afterEach(cleanup)

// The answer cached before 12 Nov 2026 (Anders's "tetrarch" card) and one in the new, shorter shape.
const OLD = "Noun. A ruler of one quarter of a region or kingdom, typically under a larger empire. Here, Herod's title under Roman authority."
const NEW = "Noun. A ruler of part of a province. Here, Herod's title under Rome."

describe('a word card: "tetrarch · Noun" over one short sense and its sense here (Anders, 12 Nov 2026)', () => {
  it('asks for the part of speech, one short sentence and a "Here," line', () => {
    expect(CONTEXTUAL_LOOKUP_PROMPT).toContain('{"kind":"definition","definition":"Part of speech. One short sentence of meaning. Here, its sense in this passage."}')
    expect(CONTEXTUAL_LOOKUP_PROMPT.split('\n')).toContain(CONTEXTUAL_LOOKUP_DEFINITION_LINE)
    expect(CONTEXTUAL_LOOKUP_DEFINITION_LINE).toMatch(/at most 25 words/)
  })
  it('splits an old cached answer and a new one the same way', () => {
    expect(splitDefinition(OLD)).toEqual({ pos: 'noun', label: 'Noun. ', sense: 'A ruler of one quarter of a region or kingdom, typically under a larger empire.', here: "Here, Herod's title under Roman authority." })
    expect(splitDefinition(NEW)).toEqual({ pos: 'noun', label: 'Noun. ', sense: 'A ruler of part of a province.', here: "Here, Herod's title under Rome." })
    expect(splitDefinition('Verb (archaic): To go. In this verse, to depart.')).toMatchObject({ pos: 'verb (archaic)', sense: 'To go.', here: 'In this verse, to depart.' })
    // Not a part of speech: a term's own opening, and a label with nothing after it.
    expect(splitDefinition('Parzen window: a way to estimate a density.')).toMatchObject({ pos: '', sense: 'Parzen window: a way to estimate a density.' })
    expect(splitDefinition('Noun.')).toMatchObject({ pos: '', sense: 'Noun.' })
    expect(splitDefinition('A meaning.')).toEqual({ pos: '', label: '', sense: 'A meaning.', here: '' })
  })
  it('a folded card reads the meaning, not the label', () => {
    expect(contextualLookupPreview(JSON.stringify({ kind: 'definition', definition: OLD }))).toBe('A ruler of one quarter of a region or kingdom, typically under a larger empire.')
  })
  it('shows one sense unnumbered: the meaning, then its sense here', () => {
    const { container } = render(<ContextualLookupView answer={{ kind: 'definition', definition: OLD }} labelInTitle />)
    expect(container.querySelector('ol')).toBeNull()
    expect([...container.querySelectorAll('.popup-define-result p')].map(p => p.textContent)).toEqual([
      'A ruler of one quarter of a region or kingdom, typically under a larger empire.', "Here, Herod's title under Roman authority.",
    ])
  })
  it('a card without a headword keeps the part of speech where the answer wrote it', () => {
    const { container } = render(<ContextualLookupView answer={{ kind: 'definition', definition: OLD }} />)
    expect(container.querySelector('.popup-define-result p')?.textContent).toBe('Noun. A ruler of one quarter of a region or kingdom, typically under a larger empire.')
  })
  it('several dictionary senses stay numbered', () => {
    const { container } = render(<ContextualLookupView answer={null} dictionaryDefinitions={['first sense', 'second sense']} />)
    expect(container.querySelectorAll('ol li')).toHaveLength(2)
  })
  it('the headword carries the part of speech once the answer is in', async () => {
    let finish: (text: string) => void = () => {}
    render(<DefinitionWithHeadword className="lab-pcard-headword" headword="tetrarch" word="tetrarch"
      request={() => new Promise<string>(resolve => { finish = resolve })} />)
    expect(document.querySelector('.lab-pcard-headword')?.textContent).toBe('tetrarch')
    await act(async () => { finish(JSON.stringify({ kind: 'definition', definition: OLD })) })
    // Was "tetrarch (noun)" until 17 Nov 2026; Anders approved "tetrarch · Noun" for every Define card.
    expect(document.querySelector('.lab-pcard-headword')?.textContent).toBe('tetrarch · Noun')
    expect(screen.getByText('A ruler of one quarter of a region or kingdom, typically under a larger empire.')).toBeTruthy()
  })
})

describe('the headword line names what the word is: "Joanna · Minor character" (Anders, 17 Nov 2026)', () => {
  const person = { kind: 'person', name: 'Joanna', importance: 'minor', subtitle: 'One of the women at the tomb', body: 'Named here among the women who found the tomb empty.' } as const
  const place = { kind: 'place', name: 'Galilee', description: 'The northern region of Palestine.' } as const
  const headwordCard = async (word: string, answer: object) => {
    let finish: (text: string) => void = () => {}
    render(<DefinitionWithHeadword className="lab-pcard-headword" headword={word} word={word}
      request={() => new Promise<string>(resolve => { finish = resolve })} />)
    await act(async () => { finish(JSON.stringify(answer)) })
    return document.querySelector('.lab-pcard-headword')!
  }

  it('labels a word by its part of speech in sentence case, a person by role and a place as a place', () => {
    expect(headwordLabel({ kind: 'definition', definition: NEW })).toBe('Noun')
    expect(headwordLabel({ kind: 'definition', definition: 'Verb (archaic): To go. In this verse, to depart.' })).toBe('Verb (archaic)')
    expect(headwordLabel({ kind: 'definition', definition: 'A meaning.' })).toBe('')
    expect(headwordLabel({ kind: 'definition', definition: NEW }, true)).toBe('')
    expect(headwordLabel(person)).toBe('Minor character')
    expect(headwordLabel({ ...person, importance: 'major' })).toBe('Major character')
    expect(headwordLabel({ ...person, importance: 'uncertain' })).toBe('Person in this passage')
    expect(headwordLabel({ ...person, importance: undefined })).toBe('')
    expect(headwordLabel(place)).toBe('Place')
    expect(headwordLabel(null)).toBe('')
  })

  it('a person card carries its role on the headword line, not as a line of its own', async () => {
    const head = await headwordCard('Joanna', person)
    expect(head.textContent).toBe('Joanna · Minor character')
    const label = head.querySelector('.popup-define-pos')!
    expect(label.querySelector('[aria-hidden="true"]')?.textContent).toBe('·')
    expect(screen.getByText('Minor character', { exact: true })).toBe(label.lastElementChild)
    const card = screen.getByTestId('popup-contextual-character')
    expect(card.querySelector('small')).toBeNull()
    expect(card.textContent).not.toContain('Minor character')
    expect(card.textContent).toContain('One of the women at the tomb')
  })

  it('a place card says "Place" on the headword line only', async () => {
    const head = await headwordCard('Galilee', place)
    expect(head.textContent).toBe('Galilee · Place')
    const card = screen.getByTestId('popup-contextual-place')
    expect(card.querySelector('small')).toBeNull()
    expect(card.textContent).toBe('The northern region of Palestine.')
  })

  it('the label sits after a space, so it can wrap below the word as one unit', async () => {
    const head = await headwordCard('Kiriath-arba', { ...person, name: 'Kiriath-arba', importance: 'uncertain' })
    expect(head.childNodes[0].textContent).toBe('Kiriath-arba')
    expect(head.childNodes[1].textContent).toBe(' ')
    expect((head.childNodes[2] as Element).className).toBe('popup-define-pos')
    expect(head.childNodes[2].textContent).toBe('· Person in this passage')
  })

  it('a saved card without a headword keeps its role and kind in the body', () => {
    const { container, unmount } = render(<ContextualLookupView answer={person} />)
    expect(container.querySelector('small')?.textContent).toBe('Minor character')
    unmount()
    const placeCard = render(<ContextualLookupView answer={place} />)
    expect(placeCard.container.querySelector('small')?.textContent).toBe('Place')
  })
})
