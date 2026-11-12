// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'
import { CONTEXTUAL_LOOKUP_DEFINITION_LINE, CONTEXTUAL_LOOKUP_PROMPT, contextualLookupPreview, splitDefinition } from './contextualLookup'
import { ContextualLookupView, DefinitionWithHeadword } from './DefinitionFallback'

afterEach(cleanup)

// The answer cached before 12 Nov 2026 (Anders's "tetrarch" card) and one in the new, shorter shape.
const OLD = "Noun. A ruler of one quarter of a region or kingdom, typically under a larger empire. Here, Herod's title under Roman authority."
const NEW = "Noun. A ruler of part of a province. Here, Herod's title under Rome."

describe('a word card: "tetrarch (noun)" over one short sense and its sense here (Anders, 12 Nov 2026)', () => {
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
    const { container } = render(<ContextualLookupView answer={{ kind: 'definition', definition: OLD }} posInTitle />)
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
    expect(document.querySelector('.lab-pcard-headword')?.textContent).toBe('tetrarch (noun)')
    expect(screen.getByText('A ruler of one quarter of a region or kingdom, typically under a larger empire.')).toBeTruthy()
  })
})
