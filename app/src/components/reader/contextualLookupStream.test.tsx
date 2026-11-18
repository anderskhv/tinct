// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DefinitionFallback } from './DefinitionFallback'
import { CONTEXTUAL_LOOKUP_PROMPT, parseContextualLookup, parsePartialContextualLookup } from './contextualLookup'

vi.mock('../../lab/LabSuperMenu.tsx', () => ({ RowIcon: () => null }))

afterEach(() => cleanup())

const person = '{"kind":"person","name":"Pedaiah","importance":"minor","subtitle":"ancestor of Sallu in the genealogy of Benjamin\'s settlers","body":"Pedaiah appears in the lineage of Sallu."}'

describe('streaming lookups', () => {
  it('reads a person card while it is still arriving', () => {
    expect(parsePartialContextualLookup('{"kind":"per')).toBeNull()
    expect(parsePartialContextualLookup('{"kind":"person","name":"Peda')).toBeNull()
    expect(parsePartialContextualLookup('{"kind":"person","name":"Pedaiah","importance":"min')).toEqual({ kind: 'person', name: 'Pedaiah', subtitle: '', body: '' })
    expect(parsePartialContextualLookup('{"kind":"person","name":"Pedaiah","importance":"minor","subtitle":"ancestor of Sal')).toEqual({ kind: 'person', name: 'Pedaiah', importance: 'minor', subtitle: 'ancestor of Sal', body: '' })
    expect(parsePartialContextualLookup(person.slice(0, -10))).toMatchObject({ kind: 'person', body: 'Pedaiah appears in the lineage o' })
    expect(parsePartialContextualLookup('{"kind":"person","name":"A","importance":"minor","subtitle":"says \\"hi\\" and \\u00e6')).toMatchObject({ subtitle: 'says "hi" and æ' })
    expect(parsePartialContextualLookup('{"kind":"person","name":"A","importance":"minor","subtitle":"cut \\u00')).toMatchObject({ subtitle: 'cut' })
  })

  it('knows places and describes them, not as a part of speech', () => {
    expect(CONTEXTUAL_LOOKUP_PROMPT).toContain('"kind":"place"')
    expect(CONTEXTUAL_LOOKUP_PROMPT).toMatch(/place[^\n]*Do not give a part of speech/)
    expect(parseContextualLookup('{"kind":"place","name":"Kiriath-arba","description":"A town in the hill country of Judah."}')).toEqual({ kind: 'place', name: 'Kiriath-arba', description: 'A town in the hill country of Judah.' })
    expect(parsePartialContextualLookup('{"kind":"place","name":"Kiriath-arba","description":"A town in')).toEqual({ kind: 'place', name: 'Kiriath-arba', description: 'A town in' })
  })
})

describe('DefinitionFallback', () => {
  it('fills the card in as the answer streams, then offers Chat and Talk', async () => {
    let push: (text: string) => void = () => {}
    let finish: (text: string) => void = () => {}
    const request = vi.fn((onDelta: (text: string) => void) => { push = onDelta; return new Promise<string>(resolve => { finish = resolve }) })
    render(<DefinitionFallback word="Pedaiah" request={request} onChat={() => {}} onTalk={() => {}} />)
    expect(screen.getByRole('status').textContent).toBe('Looking up…')
    act(() => push('{"kind":"person","name":"Pedaiah","importance":"minor","subtitle":"ancestor of Sallu'))
    expect(screen.getByTestId('popup-contextual-character').textContent).toContain('Minor character')
    expect(screen.getByText('ancestor of Sallu')).toBeTruthy()
    expect(screen.queryByLabelText('Chat about Pedaiah')).toBeNull()
    await act(async () => { push(person); finish(person) })
    expect(screen.getByText('Pedaiah appears in the lineage of Sallu.')).toBeTruthy()
    expect(screen.getByLabelText('Chat about Pedaiah')).toBeTruthy()
  })

  it('shows a place as a place', async () => {
    const answer = '{"kind":"place","name":"Kiriath-arba","description":"A town in the hill country of Judah."}'
    render(<DefinitionFallback word="Kiriath-arba" request={async onDelta => { onDelta(answer); return answer }} />)
    await act(async () => {})
    const card = screen.getByTestId('popup-contextual-place')
    expect(card.textContent).toContain('Place')
    expect(card.textContent).toContain('A town in the hill country of Judah.')
    expect(card.textContent).not.toMatch(/noun/i)
  })

  it('shows dictionary senses for an ordinary word at once', () => {
    render(<DefinitionFallback word="satraps" request={() => new Promise(() => {})} dictionaryDefinitions={['A provincial governor in ancient Persia.']} />)
    expect(screen.getByText('A provincial governor in ancient Persia.')).toBeTruthy()
  })
})
