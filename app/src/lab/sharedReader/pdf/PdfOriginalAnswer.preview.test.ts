// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { pdfOriginalAnswerPreview } from './PdfOriginalAnswer'
it('keeps folded structured previews readable without changing saved answer bytes', () => {
  const primer = JSON.stringify({ gist: 'The printed argument in brief.', claims: ['A claim.', 'Second claim.', 'Third claim.'], keepInMind: ['A caution.', 'Another caution.'], map: [{ title: 'Opening', pages: 'p. 1' }, { title: 'Middle', pages: 'p. 2' }, { title: 'End', pages: 'p. 3' }] })
  expect(pdfOriginalAnswerPreview('primer', primer)).toBe('The printed argument in brief.')
  expect(pdfOriginalAnswerPreview('define', JSON.stringify({ kind: 'place', name: 'Rome', description: 'The city named here.' }))).toBe('The city named here.')
  expect(pdfOriginalAnswerPreview('primer', '{bad')).toBe('Open saved Primer')
  expect(pdfOriginalAnswerPreview('quiz', '{"questions":[]}')).toBe('Open saved answer')
  expect(pdfOriginalAnswerPreview('explain', 'An ordinary answer.')).toBe('An ordinary answer.')
  expect(JSON.parse(primer).gist).toBe('The printed argument in brief.')
})
