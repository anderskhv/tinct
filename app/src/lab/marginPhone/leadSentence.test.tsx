// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PhoneAnswer, splitLead } from './LabPhoneCard'
import { answerLead } from '../sharedReader/cardPreview'

const lead = (text: string) => splitLead(text).lead

describe('an answer\'s bold lead ends only at a real sentence end (Anders, 12 Nov 2026)', () => {
  it('reads past initials inside brackets: "That saying (R.C. Sproul\'s) …"', () => {
    const text = 'That saying (R.C. Sproul\'s) argues nothing escapes God\'s sovereign control — no event, however random-seeming, is outside providence. "By chance" here isn\'t making that metaphysical claim.'
    expect(splitLead(text)).toEqual({
      lead: 'That saying (R.C. Sproul\'s) argues nothing escapes God\'s sovereign control — no event, however random-seeming, is outside providence.',
      tail: '"By chance" here isn\'t making that metaphysical claim.',
    })
  })
  it('reads past initials outside brackets', () => {
    expect(lead('R.C. Sproul said it first. Others followed.')).toBe('R.C. Sproul said it first.')
    expect(lead('J. R. R. Tolkien wrote it. Then more.')).toBe('J. R. R. Tolkien wrote it.')
    expect(lead('C. S. Lewis agreed. Then more.')).toBe('C. S. Lewis agreed.')
  })
  it('reads past common abbreviations', () => {
    expect(lead('Some readers, e.g. Augustine, read it so. Others not.')).toBe('Some readers, e.g. Augustine, read it so.')
    expect(lead('It is figurative, i.e. Not literal at all. Next.')).toBe('It is figurative, i.e. Not literal at all.')
    expect(lead('Compare the Sermon on the Mount, cf. Matt. 5:3. Next.')).toBe('Compare the Sermon on the Mount, cf. Matt. 5:3.')
    expect(lead('Dr. Watson notices it. Holmes does not.')).toBe('Dr. Watson notices it.')
    expect(lead('St. Paul says so. Then more.')).toBe('St. Paul says so.')
    expect(lead('It is Jacob vs. Esau again. Then more.')).toBe('It is Jacob vs. Esau again.')
    expect(lead('See v. 27 for the promise. Then more.')).toBe('See v. 27 for the promise.')
    expect(lead('See vv. 23–27 together. Then more.')).toBe('See vv. 23–27 together.')
    expect(lead('As ch. 8 showed, he heals. Then more.')).toBe('As ch. 8 showed, he heals.')
  })
  it('reads past a decimal and a stop inside a word', () => {
    expect(lead('About 3.5 million people lived there. Then more.')).toBe('About 3.5 million people lived there.')
    expect(lead('It came to the U.S.A. Later than Europe. Next.')).toBe('It came to the U.S.A. Later than Europe.')
  })
  it('reads past a stop inside an open bracket or quotation', () => {
    expect(lead('He quotes the line ("All is well. All is well.") and moves on. Then more.')).toBe('He quotes the line ("All is well. All is well.") and moves on.')
    expect(lead('He says “Go. Now.” and leaves. Then more.')).toBe('He says “Go. Now.” and leaves.')
    expect(lead('The note [see above. It matters] stands. Then more.')).toBe('The note [see above. It matters] stands.')
  })
  it('keeps the closing quote or bracket with the sentence', () => {
    expect(splitLead('“Quoted.” And after.')).toEqual({ lead: '“Quoted.”', tail: 'And after.' })
    expect(lead('(An aside.) Then the point.')).toBe('(An aside.)')
    expect(lead('Is it literal? Not quite.')).toBe('Is it literal?')
    expect(lead('**The point.** Then more.')).toBe('**The point.**')
  })
  it('a stop followed by a lower-case word does not end the sentence', () => {
    expect(lead('It runs approx. ten miles. Then more.')).toBe('It runs approx. ten miles.')
  })
  it('a plain "no." still ends; "no. 5" does not', () => {
    expect(lead('The answer is no. He stays.')).toBe('The answer is no.')
    expect(lead('Psalm no. 23 is meant. Then more.')).toBe('Psalm no. 23 is meant.')
  })
  it('one sentence with no end is the whole lead; a bracket left open means no lead', () => {
    expect(splitLead('One sentence only')).toEqual({ lead: 'One sentence only', tail: '' })
    expect(splitLead('He says (R.C. Sproul. And then it never closes')).toEqual({ lead: '', tail: 'He says (R.C. Sproul. And then it never closes' })
  })
  it('bolds nothing when no clean first sentence is found, and the folded line still reads', () => {
    const text = 'He says (R.C. Sproul. And then it never closes\n\nA second paragraph.'
    const { container } = render(<PhoneAnswer text={text} />)
    expect(container.querySelector('.lab-pcard-lead')).toBeNull()
    expect(container.querySelector('p')?.textContent).toBe('He says (R.C. Sproul. And then it never closes')
    expect(answerLead(text)).toBe('He says (R.C. Sproul. And then it never closes')
  })
  it('bolds the whole first sentence of the reported answer', () => {
    const { container } = render(<PhoneAnswer text={'That saying (R.C. Sproul\'s) argues nothing escapes. Luke is just describing it.'} />)
    expect(container.querySelector('.lab-pcard-lead')?.textContent).toBe('That saying (R.C. Sproul\'s) argues nothing escapes.')
  })
})
