// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { flashNotebookPassage } from './flashNotebookPassage'
it('marks only the exact source range, follows mounted words, and removes only its temporary cue', async () => {
  const root = document.createElement('div')
  root.innerHTML = '<p data-chapter-number="2">' + [0,1,2].map(i => `<span class="is-card-passage" data-testid="lab-word" data-paragraph-index="0" data-word-index="${i}">word</span>`).join(' ') + '</p><p data-chapter-number="1"><span data-testid="lab-word" data-paragraph-index="0" data-word-index="1">other chapter</span></p>'
  const text = root.textContent
  const off = flashNotebookPassage(root, { chapterNumber: 2, range: { paragraphIndex: 0, fromWord: 1, endParagraphIndex: 0, toWord: 2 } }, 2)
  expect(root.querySelectorAll('.is-notebook-passage')).toHaveLength(1)
  expect(root.querySelector('.is-notebook-passage')?.getAttribute('data-word-index')).toBe('1')
  const later = root.querySelector('.is-notebook-passage')!.cloneNode(true) as Element
  later.classList.remove('is-notebook-passage')
  root.firstElementChild!.appendChild(later)
  await Promise.resolve()
  expect(root.querySelectorAll('.is-notebook-passage')).toHaveLength(2)
  off()
  expect(root.querySelectorAll('.is-notebook-passage')).toHaveLength(0)
  expect(root.querySelectorAll('.is-card-passage')).toHaveLength(4)
  expect(root.textContent).toBe(text?.replace('other chapter', 'wordother chapter'))
})
