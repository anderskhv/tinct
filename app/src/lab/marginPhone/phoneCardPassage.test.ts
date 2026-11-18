// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { markPhoneCardPassage } from './phoneCardPassage'
afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks() })
it.each(['is-desktop', 'is-phone'])('joins selected words across spaces in %s without changing word targets or content', layout => {
  document.body.innerHTML = `<div class="lab ${layout}"><div data-testid="lab-page-wrap"><p class="lab-hearing-line">${[0,1,2,3,4].map(i => `<span data-testid="lab-word" data-paragraph-index="0" data-word-index="${i}">word${i}</span>`).join(' ')}</p></div></div>`
  const root = document.querySelector('.lab')!, paragraph = root.querySelector('p')!
  const words = [...root.querySelectorAll<HTMLElement>('[data-testid="lab-word"]')]
  const box = (left: number, top: number, width: number) => ({ left, top, right: left+width, bottom: top+24, width, height: 24 } as DOMRect)
  vi.spyOn(paragraph, 'getBoundingClientRect').mockReturnValue(box(100,100,300))
  words.forEach((word,i) => vi.spyOn(word,'getClientRects').mockReturnValue([box(i<3?100+i*60:100+(i-3)*70,i<3?100:130,40)] as unknown as DOMRectList))
  const text = paragraph.textContent
  const off = markPhoneCardPassage(root,[{chapterNumber:1,range:{paragraphIndex:0,fromWord:1,toWord:5}}],1)
  const lines = [...root.querySelectorAll<HTMLElement>('.lab-card-passage-line')]
  expect(lines.map(line => [line.style.left,line.style.top,line.style.width])).toEqual([['60px','23px','100px'],['0px','53px','110px']])
  expect(paragraph.textContent).toBe(text)
  expect([...root.querySelectorAll('[data-testid="lab-word"]')]).toEqual(words)
  expect(words[0].classList.contains('is-card-passage')).toBe(false)
  off()
  expect(root.querySelector('.lab-card-passage-line')).toBeNull()
  expect(root.querySelector('.is-card-passage')).toBeNull()
})
it('does not create visible rules before phone words have layout', () => {
  document.body.innerHTML='<div class="lab is-phone"><div data-testid="lab-page-wrap"><p class="lab-hearing-line"><span data-testid="lab-word" data-paragraph-index="0" data-word-index="0">source</span></p></div></div>'
  const off=markPhoneCardPassage(document.querySelector('.lab'),[{chapterNumber:1,range:{paragraphIndex:0,fromWord:0,toWord:1}}],1)
  expect(document.querySelector('.is-card-passage')).not.toBeNull()
  expect(document.querySelector('.lab-card-passage-line')).toBeNull()
  off()
})
