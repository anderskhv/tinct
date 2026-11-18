// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'
import { CONTEXTUAL_LOOKUP_DEFINITION_LINE, CONTEXTUAL_LOOKUP_PROMPT, contextualLookupPreview, splitDefinition } from './contextualLookup'
import { ContextualLookupView, DefinitionWithHeadword, SavedDefineAnswer, headwordLabel, headwordRepeatsSelection, savedDefineHeadword } from './DefinitionFallback'

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

describe('a saved Define card in the desktop margin or notebook carries its headword (Anders, 18 Nov 2026)', () => {
  const person = JSON.stringify({ kind: 'person', name: 'Joanna', importance: 'minor', subtitle: 'One of the women at the tomb', body: 'Named here among the women who found the tomb empty.' })
  const place = { kind: 'place', name: 'Galilee', description: 'The northern region of Palestine.' } as const
  const word = JSON.stringify({ kind: 'definition', definition: 'Noun. A tomb cut in rock. Here, the tomb where Jesus’ body had been laid.' })
  const saved = (selection: string, content: string, first = true) => render(<SavedDefineAnswer selection={selection} content={content} first={first} />).container

  it('a person: the answer’s name and role on one line, no role line in the body', () => {
    const card = saved('Joanna,', person)
    const head = card.querySelector('.lab-pcard-headword.popup-define-word')!
    expect(head.textContent).toBe('Joanna · Minor character')
    expect(head.querySelector('.popup-define-pos')?.lastElementChild?.textContent).toBe('Minor character')
    expect(card.querySelector('small')).toBeNull()
    expect(screen.getByTestId('popup-contextual-character').textContent).not.toContain('Minor character')
  })

  it('a word: the selection without punctuation or possessive, and its part of speech; the sense drops "Noun."', () => {
    const card = saved('sepulchre,', word)
    expect(card.querySelector('.lab-pcard-headword')?.textContent).toBe('sepulchre · Noun')
    expect(card.querySelector('.popup-define-sense')?.textContent).toBe('A tomb cut in rock.')
    cleanup()
    expect(saved('“Peter’s', word).querySelector('.lab-pcard-headword')?.textContent).toBe('Peter · Noun')
  })

  it('several words: a person or place shows its name; anything else has no headword and keeps its label in the body', () => {
    expect(savedDefineHeadword('the women from Galilee', place)).toBe('Galilee')
    expect(saved('Mary the mother of James', person).querySelector('.lab-pcard-headword')?.textContent).toBe('Joanna · Minor character')
    cleanup()
    const card = saved('rolled away', word)
    expect(card.querySelector('.lab-pcard-headword')).toBeNull()
    expect(card.querySelector('.popup-define-sense')?.textContent).toBe('Noun. A tomb cut in rock.')
  })

  it('a follow-up answer reads as it always has: no headword, its own text whole', () => {
    const card = saved('sepulchre,', 'Only in Luke. Mark names Salome among the women.', false)
    expect(card.querySelector('.lab-pcard-headword')).toBeNull()
    expect(card.querySelector('.popup-define-sense')?.textContent).toBe('Only in Luke. Mark names Salome among the women.')
    cleanup()
    const again = saved('Joanna', person, false)
    expect(again.querySelector('.lab-pcard-headword')).toBeNull()
    expect(again.querySelector('small')?.textContent).toBe('Minor character')
  })

  it('no label to give: the headword alone', () => {
    const head = saved('sepulchre', JSON.stringify({ kind: 'definition', definition: 'A tomb.' })).querySelector('.lab-pcard-headword')!
    expect(head.textContent).toBe('sepulchre')
    expect(head.querySelector('.popup-define-pos')).toBeNull()
  })

  it('no answer to read: no headword', () => {
    expect(savedDefineHeadword('sepulchre', null)).toBe('')
  })

  it('the notebook drops a source line the headword repeats, whatever its case or punctuation, and keeps any other', () => {
    expect(headwordRepeatsSelection('Joanna,', person)).toBe(true)
    expect(headwordRepeatsSelection('sepulchre,', word)).toBe(true)
    expect(headwordRepeatsSelection('Sepulchre', word)).toBe(true)
    expect(headwordRepeatsSelection('“Peter’s', word)).toBe(true)
    expect(headwordRepeatsSelection('Mary the mother of James', person)).toBe(false)
    expect(headwordRepeatsSelection('rolled away', word)).toBe(false)
    expect(headwordRepeatsSelection('sepulchre', undefined)).toBe(false)
  })
})
