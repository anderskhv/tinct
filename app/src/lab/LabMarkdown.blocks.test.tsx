// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { LabMarkdown } from './LabMarkdown'
import { cardShownMessages } from './marginPreview/marginPreviewCards'

afterEach(cleanup)

it('renders headings as a bold line and numbered lists as lists, never "##" or "1." as text (30 Oct 2026)', () => {
  const { container } = render(<LabMarkdown>{'Opening line.\n\n## Two responses\n- **Recognition**: turning.\n- Hardening.\n\n### Why it matters\n\n1. It reframes judgment.\n2. It sets up chapter 3.'}</LabMarkdown>)
  expect(container.textContent).not.toMatch(/#|\b1\.\s/)
  expect([...container.querySelectorAll('.lab-md-heading')].map(node => node.textContent)).toEqual(['Two responses', 'Why it matters'])
  expect([...container.querySelectorAll('ul li')].map(node => node.textContent)).toEqual(['Recognition: turning.', 'Hardening.'])
  expect([...container.querySelectorAll('ol li')].map(node => node.textContent)).toEqual(['It reframes judgment.', 'It sets up chapter 3.'])
})

it('keeps word spans while an answer arrives', () => {
  const { container } = render(<LabMarkdown words>{'## A heading\n1. first item'}</LabMarkdown>)
  expect(container.querySelectorAll('.tc-w').length).toBe(4)
})

it("drops a saved card's own question but keeps an Ask card's question", () => {
  const messages = [{ role: 'user', content: 'Explain this passage.' }, { role: 'assistant', content: 'An answer.' }, { role: 'user', content: 'Why?' }]
  expect(cardShownMessages('explain', messages).map(message => message.content)).toEqual(['An answer.', 'Why?'])
  expect(cardShownMessages('ask', messages)).toHaveLength(3)
})
