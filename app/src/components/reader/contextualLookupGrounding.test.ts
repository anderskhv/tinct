import { describe, expect, it } from 'vitest'
import { CONTEXTUAL_LOOKUP_GROUNDING_LINE, CONTEXTUAL_LOOKUP_PROMPT } from './contextualLookup'
import { PDF_CONTEXTUAL_LOOKUP_PROMPT } from '../../companion/marginPrompts'
import { companionSelectionMessage, parseCompanionRequest } from '../../companion/companionRequest'

const count = (text: string, part: string) => text.split(part).length - 1

// Anders, 21 Oct 2026: a tapped "Jonathan the son of Absalom" (1 Maccabees 13:11) got Jonathan Maccabeus's card.
describe('the contextual lookup names the person at the tapped occurrence', () => {
  it('holds the grounding line once, after the identity rules and before the card format', () => {
    expect(count(CONTEXTUAL_LOOKUP_PROMPT, CONTEXTUAL_LOOKUP_GROUNDING_LINE)).toBe(1)
    const lines = CONTEXTUAL_LOOKUP_PROMPT.split('\n')
    expect(lines[1]).toBe(CONTEXTUAL_LOOKUP_GROUNDING_LINE)
    expect(lines[2].startsWith('For a person, give')).toBe(true)
  })

  it('ties identity to the occurrence and its own qualifiers, and prefers "unclear" to the famous namesake', () => {
    expect(CONTEXTUAL_LOOKUP_GROUNDING_LINE).toContain('from the selected occurrence itself, in the current paragraph')
    expect(CONTEXTUAL_LOOKUP_GROUNDING_LINE).toContain('its own qualifiers ("son of X", a title, an epithet)')
    expect(CONTEXTUAL_LOOKUP_GROUNDING_LINE).toContain('never from another person of that name nearby or from fame')
    expect(CONTEXTUAL_LOOKUP_GROUNDING_LINE).toContain('say the identity is unclear and use uncertain rather than name the famous namesake')
  })

  it('reaches the PDF reader\'s lookup and the define turn the Worker builds', () => {
    expect(count(PDF_CONTEXTUAL_LOOKUP_PROMPT, CONTEXTUAL_LOOKUP_GROUNDING_LINE)).toBe(1)
    const define = parseCompanionRequest({
      intent: 'define', selection: 'Jonathan',
      context: { bookTitle: 'The Bible', bookAuthor: 'Various', chapterLabel: '1 Maccabees 13', paragraphs: ['¹⁰ He gathered together all the men of war. ¹¹ He sent Jonathan the son of Absalom, and with him a great army, to Joppa.'], paragraphIndex: 0 },
    })!
    expect(count(companionSelectionMessage(define)!, CONTEXTUAL_LOOKUP_GROUNDING_LINE)).toBe(1)
  })
})
