import { describe, expect, it } from 'vitest'
import {
  isPdfPageNumber, pdfBodySize, pdfEdgeKeys, pdfGraphicBoxes, pdfNarrationPlan, pdfNarrationRenderedWord, pdfRunningKeys,
  type PdfNarrationBox, type PdfNarrationItem, type PdfNarrationPageInput,
} from './pdfNarration'

// A synthetic A4-ish page in PDF points: pdf.js's viewport at scale 1 flips y (top-left origin).
const W = 600, H = 800
const view = { width: W, height: H, transform: [1, 0, 0, -1, 0, H] }
/** A text item whose baseline sits `top` points below the page top, `size` points tall, at `x`. */
const item = (str: string, x: number, top: number, size = 10, width = str.length * size * 0.5): PdfNarrationItem =>
  ({ str, transform: [size, 0, 0, size, x, H - top], width })
const page = (items: PdfNarrationItem[], graphics: PdfNarrationBox[] = []): PdfNarrationPageInput => ({ items, view, graphics })
const words = (text: string) => text.split(/\s+/).filter(Boolean)
const body = (top: number, lines: string[], x = 50, size = 10, leading = 13) => lines.map((line, i) => item(line, x, top + i * leading, size))
const footer = (n: number) => [item('ANNUAL REPORT | WHAT WE LEARNED', 50, 780, 7), item(String(n), 540, 780, 7)]
const prose = ['The first line of the main text runs on here,', 'and the second line carries the thought on', 'to a third line that ends the paragraph.']

/** The rendered word each spoken token maps to, as pdfOriginalFollowRect counts words: /\S+/ per item, in item order. */
const renderedWords = (input: PdfNarrationPageInput) => input.items.flatMap(it => it.str ? it.str.match(/\S+/gu) ?? [] : [])
function expectFaithfulMapping(input: PdfNarrationPageInput) {
  const plan = pdfNarrationPlan(input)
  const tokens = words(plan.text), rendered = renderedWords(input)
  expect(plan.words).toHaveLength(tokens.length)
  plan.words.forEach((index, i) => {
    if (index < 0) return
    // A heading's added full stop is the only change a spoken token may carry.
    expect(tokens[i].replace(/\.$/, '')).toBe(rendered[index].replace(/\.$/, ''))
  })
  expect(new Set(plan.words.filter(n => n >= 0)).size).toBe(plan.words.filter(n => n >= 0).length)
}

describe('rule 1: running headers and footers', () => {
  const pages = (count: number) => Array.from({ length: count }, (_, i) => page([...body(100, prose), ...footer(i + 1)]))

  it('skips an edge line that repeats on three or more pages, digits normalised', () => {
    const doc = pages(9)
    const running = pdfRunningKeys(doc.map(pdfEdgeKeys))
    const plan = pdfNarrationPlan(doc[4], { running })
    expect(plan.text).toBe(prose.join(' '))
    expect(plan.skipped).toEqual([
      { text: 'ANNUAL REPORT | WHAT WE LEARNED', reason: 'running header/footer' },
      { text: '5', reason: 'page number' },
    ])
  })

  it('keeps an edge line seen on only two of nine pages', () => {
    const doc = pages(9)
    for (let i = 2; i < 9; i++) doc[i] = page(body(100, prose))
    const plan = pdfNarrationPlan(doc[0], { running: pdfRunningKeys(doc.map(pdfEdgeKeys)) })
    expect(plan.text).toContain('ANNUAL REPORT')
  })

  it('needs 30% of a short document (at least two pages)', () => {
    expect(pdfRunningKeys(pages(2).map(pdfEdgeKeys)).size).toBe(1)
    expect(pdfRunningKeys(pages(1).map(pdfEdgeKeys)).size).toBe(0)
    const five = pages(5)
    for (let i = 2; i < 5; i++) five[i] = page(body(100, prose))
    expect(pdfRunningKeys(five.map(pdfEdgeKeys)).size).toBe(1) // 2 of 5 pages = 40%
  })

  it('treats a header whose number changes per page ("Chapter 3 · 41") as the same running head', () => {
    const doc = Array.from({ length: 4 }, (_, i) => page([item(`Chapter 3 · ${40 + i}`, 50, 30, 8), ...body(100, prose)]))
    const plan = pdfNarrationPlan(doc[1], { running: pdfRunningKeys(doc.map(pdfEdgeKeys)) })
    expect(plan.skipped).toEqual([{ text: 'Chapter 3 · 41', reason: 'running header/footer' }])
  })

  it('never takes the same words in body text, or a larger title at the top, for the running head', () => {
    const doc = Array.from({ length: 4 }, () => page([item('ANNUAL REPORT', 50, 30, 8), ...body(100, prose)]))
    doc[2] = page([item('ANNUAL REPORT', 50, 60, 24), ...body(100, prose), item('ANNUAL REPORT', 50, 400)])
    const plan = pdfNarrationPlan(doc[2], { running: pdfRunningKeys(doc.map(pdfEdgeKeys)) })
    expect(plan.skipped).toEqual([])
    expect(words(plan.text).filter(w => /^REPORT/.test(w))).toHaveLength(2)
  })
})

describe('rule 2: lone page numbers', () => {
  it('recognises page-number forms', () => {
    for (const text of ['4', '17', 'iv', 'XII', 'Page 4', 'p. 12', '4 / 48', '4 of 48', '- 4 -', '— 12 —', '1 9']) expect(isPdfPageNumber(text), text).toBe(true)
    for (const text of ['Page four', 'Chapter 4', '4.2 Results', 'vivid', '2026-11', 'Figure 4']) expect(isPdfPageNumber(text), text).toBe(false)
  })

  it('skips a number alone at the top or bottom edge, not one in the text', () => {
    const plan = pdfNarrationPlan(page([item('12', 290, 30, 9), ...body(100, prose), item('42', 50, 400), item('Page 12 of 30', 260, 785, 8)]))
    expect(plan.text).toBe(`${prose.join(' ')} 42`)
    expect(plan.skipped.map(s => s.reason)).toEqual(['page number', 'page number'])
  })
})

describe('rule 3: two columns', () => {
  const left = ['Left column opens the argument', 'and carries it down the page', 'to the end of its first part.']
  const right = ['Right column picks it up again', 'and finishes the whole thought', 'before the page comes to an end.']
  // pdf.js often gives the lines across the page, left and right interleaved.
  const interleaved = () => [
    item('A HEADING OVER BOTH COLUMNS OF THE PAGE', 50, 80, 16),
    ...left.flatMap((line, i) => [item(line, 50, 120 + i * 13), item(right[i], 320, 120 + i * 13)]),
    ...left.flatMap((line, i) => [item(line, 50, 170 + i * 13), item(right[i], 320, 170 + i * 13)]),
  ]

  it('reads the heading first, then the left column top to bottom, then the right', () => {
    const plan = pdfNarrationPlan(page(interleaved()))
    expect(plan.text).toBe(['A HEADING OVER BOTH COLUMNS OF THE PAGE.', ...left, ...left, ...right, ...right].join(' '))
    expectFaithfulMapping(page(interleaved()))
  })

  it('reads a section heading set after its text in the PDF where it stands on the page', () => {
    const plan = pdfNarrationPlan(page([...body(140, prose), item('THE CONTEXT', 50, 120, 12)]))
    expect(plan.text).toBe(`THE CONTEXT. ${prose.join(' ')}`)
  })

  it('reads a full-width paragraph between two column bands in place', () => {
    const items = [
      ...left.flatMap((line, i) => [item(line, 50, 100 + i * 13), item(right[i], 320, 100 + i * 13)]),
      item('A full-width sentence crosses the gutter between the two columns of text.', 50, 160, 10, 470),
      ...left.flatMap((line, i) => [item(line, 50, 190 + i * 13), item(right[i], 320, 190 + i * 13)]),
    ]
    const plan = pdfNarrationPlan(page(items))
    expect(plan.text).toBe([...left, ...right, 'A full-width sentence crosses the gutter between the two columns of text.', ...left, ...right].join(' '))
  })

  it('leaves a single column in its line order', () => {
    expect(pdfNarrationPlan(page(body(100, prose))).text).toBe(prose.join(' '))
  })
})

describe('rule 4: figures', () => {
  const labels = ['Input', 'Model', 'Output', 'Feedback loop', 'Step 1', 'Step 2']
  const figure = (extra: PdfNarrationItem[] = []) => page([
    ...body(80, prose),
    ...labels.map((label, i) => item(label, 120 + (i % 3) * 120, 220 + Math.floor(i / 3) * 60, 8)),
    ...extra,
    ...body(400, ['After the figure the text goes on', 'for another line or two.']),
  ], [{ x: 100, y: 200, w: 400, h: 120 }])

  it('does not read the labels inside an image or graphics region', () => {
    const plan = pdfNarrationPlan(figure())
    expect(plan.text).toBe([...prose, 'After the figure the text goes on', 'for another line or two.'].join(' '))
    expect(plan.skipped).toEqual([{ text: labels.join(' '), reason: 'figure labels' }])
  })

  it('reads a "Figure" caption as it is printed', () => {
    const plan = pdfNarrationPlan(figure([item('Figure 2: How the loop feeds back', 100, 340, 9)]))
    expect(plan.text).toContain('the paragraph. Figure 2: How the loop feeds back After the figure')
  })

  it('announces a lone short caption line as "Figure: <caption>", the inserted word mapped to nothing', () => {
    const input = figure([item('How the loop feeds back', 100, 340, 9)])
    const plan = pdfNarrationPlan(input)
    expect(plan.text).toContain('Figure: How the loop feeds back After')
    const at = words(plan.text).indexOf('Figure:')
    expect(plan.words[at]).toBe(-1)
    expect(pdfNarrationRenderedWord(plan, at)).toBeNull()
    expect(renderedWords(input)[pdfNarrationRenderedWord(plan, at + 1)!]).toBe('How')
    expectFaithfulMapping(input)
  })

  it('says nothing for a figure without a caption, and reads the labels when no graphics are known', () => {
    const noGraphics = { ...figure(), graphics: [] }
    expect(pdfNarrationPlan(noGraphics).text).toContain('Input Model Output')
  })

  it('reads sentences set in a diagram\'s boxes: only labels are left out', () => {
    const sentences = ['Interviews with the companies to', 'understand the challenges they face', 'and to uncover examples of practice']
    const input = page([...body(80, prose), ...sentences.map((line, i) => item(line, 120, 220 + i * 10, 8))], [{ x: 100, y: 200, w: 300, h: 60 }])
    expect(pdfNarrationPlan(input).text).toContain(sentences.join(' '))
  })

  it('does not take a framed panel of text (a line of eight words or more) for a picture', () => {
    const input = page([...body(220, ['A boxed note with a full sentence of body text in it.', 'Short', 'Bits', 'More']), ...body(80, prose)],
      [{ x: 40, y: 200, w: 520, h: 80 }])
    expect(pdfNarrationPlan(input).skipped).toEqual([])
  })
})

describe('rule 5: tables', () => {
  const cells = [['Method', 'Focus', 'Users'], ['ROSI', 'Financial return', 'Retail'], ['VBA', 'Accounting', 'Industry'], ['True Cost', 'Full spectrum', 'Food']]
  const table = (caption?: PdfNarrationItem) => page([
    ...body(80, prose),
    ...(caption ? [caption] : []),
    ...cells.flatMap((row, r) => row.map((cell, c) => item(cell, 60 + c * 170, 200 + r * 30, 9))),
    ...body(360, ['The text after the table.']),
  ])

  it('skips a grid of short, aligned cells', () => {
    const plan = pdfNarrationPlan(table())
    expect(plan.text).toBe(`${prose.join(' ')} The text after the table.`)
    expect(plan.skipped).toEqual([{ text: cells.flat().join(' '), reason: 'table cells' }])
  })

  it('reads its caption: "Table 3 …" as printed, a lone short line as "Table: …"', () => {
    expect(pdfNarrationPlan(table(item('Table 3. Valuation methods', 60, 175, 9))).text).toContain('paragraph. Table 3. Valuation methods The text')
    expect(pdfNarrationPlan(table(item('Valuation methods compared', 60, 175, 9))).text).toContain('paragraph. Table: Valuation methods compared The text')
  })

  it('reads a grid whose cells are sentences instead of dropping it', () => {
    const long = ['Incorporating colleagues’ perspectives can', 'forge stronger partnerships and soften', 'barriers to collaboration across teams.']
    const input = page(['Strategy', 'Insight', 'Action'].flatMap((head, c) => [item(head, 60 + c * 170, 100, 9),
      ...long.map((line, i) => item(line, 60 + c * 170, 120 + i * 11, 9, 150))]))
    expect(pdfNarrationPlan(input).skipped).toEqual([])
  })
})

describe('rule 6: footnotes and contents pages', () => {
  it('does not read a raised footnote mark after a word, but reads an exponent', () => {
    const input = page([item('The study found that over nine', 50, 100), item('1', 205, 96, 5, 3), item('in ten agree; the area is 40 m', 212, 100, 10, 150),
      item('2', 363, 96, 5, 3), item('in all.', 368, 100, 10, 30)])
    const plan = pdfNarrationPlan(input)
    expect(plan.text).toBe('The study found that over nine in ten agree; the area is 40 m 2 in all.')
    expect(plan.skipped).toEqual([{ text: '1', reason: 'footnote marker' }])
    expectFaithfulMapping(input)
  })

  it('skips the footnote block in small type at the page foot', () => {
    const input = page([...body(100, prose), item('1', 50, 690, 5, 3), item('The study surveyed 844 experts in 72 countries.', 54, 693, 7),
      item('Published in May 2025.', 50, 702, 7), item('2', 50, 712, 5, 3), item('A second note.', 54, 715, 7)])
    const plan = pdfNarrationPlan(input)
    expect(plan.text).toBe(prose.join(' '))
    expect(plan.skipped).toEqual([{ text: '1 The study surveyed 844 experts in 72 countries. Published in May 2025. 2 A second note.', reason: 'footnote' }])
  })

  it('keeps small type at the foot that is not a footnote (a source line)', () => {
    const plan = pdfNarrationPlan(page([...body(100, prose), item('Source: the 2025 survey of experts.', 50, 690, 7)]))
    expect(plan.text).toContain('Source: the 2025 survey')
  })

  it('reads only the titles on a contents page (numbers set apart, or after dot leaders)', () => {
    const apart = page([item('TABLE OF CONTENTS', 50, 80, 20), ...[['Executive Summary', '4'], ['Purpose and Methodology', '5'], ['Appendices', '24'], ['III – Bibliography', '44']]
      .flatMap(([title, n], i) => [item(title, 50, 130 + i * 30), item(n, 500, 130 + i * 30)])])
    expect(pdfNarrationPlan(apart).text).toBe('TABLE OF CONTENTS. Executive Summary Purpose and Methodology Appendices III – Bibliography')
    const leaders = page(['Introduction .......... 1', 'Method .......... 12', 'Results .......... 30'].map((line, i) => item(line, 50, 130 + i * 20)))
    const plan = pdfNarrationPlan(leaders)
    expect(plan.text).toBe('Introduction Method Results')
    expect(plan.skipped.every(s => s.reason === 'contents page number')).toBe(true)
  })

  it('reads a page number inside a sentence on an ordinary page', () => {
    const plan = pdfNarrationPlan(page([...body(100, prose), item('See the table on page', 50, 200), item('12', 400, 200)]))
    expect(plan.text).toContain('See the table on page 12')
  })
})

describe('follow mapping and inputs', () => {
  it('maps every spoken token to the rendered word it is, never to skipped text', () => {
    const input = page([item('', 50, 20), ...footer(3), item('INTRO', 50, 100, 16), ...body(120, prose)])
    const plan = pdfNarrationPlan(input, { running: new Set(pdfEdgeKeys(page(footer(3)))) })
    expectFaithfulMapping(input)
    // The footer's six words and its page number are rendered words 0–6; none is ever highlighted.
    expect(plan.words.some(n => n >= 0 && n <= 6)).toBe(false)
    expect(plan.source).toBe(input.items.map(it => it.str).join(' ').trim())
    expect(pdfNarrationRenderedWord(plan, 0)).toBe(7)
    expect(pdfNarrationRenderedWord(plan, 999)).toBeNull()
  })

  it('keeps rotated text, spoken after the page', () => {
    const input = page([...body(100, prose), { str: 'arXiv sidebar', transform: [0, 10, -10, 0, 20, 400], width: 60 }])
    expect(pdfNarrationPlan(input).text).toBe(`${prose.join(' ')} arXiv sidebar`)
  })

  it('finds the body size across pages', () => {
    expect(pdfBodySize([page([...body(100, prose), item('Big title', 50, 60, 30)])])).toBe(10)
  })

  it('reads image and path boxes from a pdf.js operator list in viewport units', () => {
    const ops = { save: 1, restore: 2, transform: 3, constructPath: 4, fill: 5, endPath: 6, paintImageXObject: 7, paintFormXObjectBegin: 8, paintFormXObjectEnd: 9 }
    const boxes = pdfGraphicBoxes({
      fnArray: [1, 3, 4, 5, 2, 4, 6, 1, 3, 7, 2],
      argsArray: [null, [1, 0, 0, 1, 100, 100], [[], [], [0, 50, 0, 20]], null, null, [[], [], [0, 10, 0, 10]], null, null, [200, 0, 0, 100, 300, 500], null, null],
    }, ops, view)
    expect(boxes).toEqual([{ x: 100, y: 680, w: 50, h: 20 }, { x: 300, y: 200, w: 200, h: 100 }])
  })
})
