/**
 * The margin reader's answer parsers. Every case runs against both copies:
 * the app's (src/companion/marginParse.ts) and the PDF reader's static-page
 * twin (public/lab/margin/margin-parse.js), so the two never drift apart.
 */
import { describe, expect, it } from 'vitest'
import * as appCopy from './companion/marginParse'
import * as pageCopy from '../public/lab/margin/margin-parse.js'
import { PASSAGE_IMAGE_LINE, PDF_EXPLAIN_FORMAT, PDF_EXPLAIN_FORMAT_BEFORE } from './companion/marginPrompts'

const copies = [['src/companion/marginParse.ts', appCopy], ['public/lab/margin/margin-parse.js', pageCopy]] as const

describe.each(copies)('margin parsers (%s)', (_name, m) => {
  describe('citation tokens', () => {
    it('reads every printed form the prompt allows', () => {
      const parts = m.parseCitations('A {p. 12} B {pp. 12–13} C {eq. 1.2} D {fig. 1.3} E {table 2} F {sec. 2.4}.')
      expect(parts.filter(part => part.type === 'cite')).toEqual([
        { type: 'cite', kind: 'p', label: '12', raw: '{p. 12}' },
        { type: 'cite', kind: 'pp', label: '12', to: '13', raw: '{pp. 12–13}' },
        { type: 'cite', kind: 'eq', label: '1.2', raw: '{eq. 1.2}' },
        { type: 'cite', kind: 'fig', label: '1.3', raw: '{fig. 1.3}' },
        { type: 'cite', kind: 'table', label: '2', raw: '{table 2}' },
        { type: 'cite', kind: 'sec', label: '2.4', raw: '{sec. 2.4}' },
      ])
      expect(parts[0]).toEqual({ type: 'text', text: 'A ' })
      expect(parts.at(-1)).toEqual({ type: 'text', text: '.' })
    })

    it('tolerates case, spacing, hyphen ranges and roman page labels', () => {
      expect(m.citationTokens('{P.12}')).toEqual([{ type: 'cite', kind: 'p', label: '12', raw: '{P.12}' }])
      expect(m.citationTokens('{ pp. 9 - 10 }')[0]).toMatchObject({ kind: 'pp', label: '9', to: '10' })
      expect(m.citationTokens('{pp. 12-13}')[0]).toMatchObject({ kind: 'pp', label: '12', to: '13' })
      expect(m.citationTokens('{p. 12–13}')[0]).toMatchObject({ kind: 'pp', label: '12', to: '13' })
      expect(m.citationTokens('{p. xii}')[0]).toMatchObject({ kind: 'p', label: 'xii' })
      expect(m.citationTokens('{Table 2}')[0]).toMatchObject({ kind: 'table', label: '2' })
    })

    // FIXES-2026-10-15 PR C: {p. 12-13} with a plain hyphen is a page range; a printed label with a hyphen is one page.
    it('reads {p. 12-13} with a plain hyphen as a page range, and keeps a label such as A-3 one page', () => {
      expect(m.citationTokens('{p. 12-13}')).toEqual([{ type: 'cite', kind: 'pp', label: '12', to: '13', raw: '{p. 12-13}' }])
      expect(m.citationTokens('{p. xii-xiv}')[0]).toMatchObject({ kind: 'pp', label: 'xii', to: 'xiv' })
      expect(m.citationTokens('{p. A-3}')).toEqual([{ type: 'cite', kind: 'p', label: 'A-3', raw: '{p. A-3}' }])
    })

    // FIXES-2026-10-15, second paper: "{p. 4, p. 5}" leaked raw.
    it('reads a list in one pair of braces as one tag per item, the kind carried over', () => {
      expect(m.parseCitations('See {p. 4, p. 5}.')).toEqual([
        { type: 'text', text: 'See ' },
        { type: 'cite', kind: 'p', label: '4', raw: '{p. 4}' },
        { type: 'text', text: ', ' },
        { type: 'cite', kind: 'p', label: '5', raw: '{p. 5}' },
        { type: 'text', text: '.' },
      ])
      expect(m.citationTokens('{pp. 4, 6}').map(t => [t.kind, t.label, t.to])).toEqual([['p', '4', undefined], ['p', '6', undefined]])
      expect(m.citationTokens('{pp. 12–13; 15}').map(t => [t.kind, t.label, t.to])).toEqual([['pp', '12', '13'], ['p', '15', undefined]])
      expect(m.citationTokens('{eq. 1.2 and eq. 1.3}').map(t => [t.kind, t.label])).toEqual([['eq', '1.2'], ['eq', '1.3']])
      expect(m.citationTokens('{table 2, 3}').map(t => [t.kind, t.label])).toEqual([['table', '2'], ['table', '3']])
      // Not wholly a list of citations: as written.
      for (const text of ['{a, b}', '{p. 12, which shows}', '{x, p. 3}']) expect(m.parseCitations(text)).toEqual([{ type: 'text', text }])
    })

    it('leaves anything else in braces as text, exactly as written', () => {
      for (const text of ['\\frac{a}{b}', '{x}', '{p.}', '{pp. 12}', '{eq. 1–2}', '{page 12}', '{p. 12', 'p. 12}', '{p. "12"}', '{p. <b>1</b>}', '{}', '{p. 1234567890123456789}']) {
        const parts = m.parseCitations(text)
        expect(parts.every(part => part.type === 'text')).toBe(true)
        expect(parts.map(part => (part.type === 'text' ? part.text : '')).join('')).toBe(text)
      }
      expect(m.parseCitations('')).toEqual([])
      expect(m.parseCitations(null)).toEqual([])
    })

    it('keeps a token the client cannot resolve as plain text', () => {
      const parts = m.parseCitations('See {p. 12} and {p. 99}.', token => token.label !== '99')
      expect(parts).toEqual([
        { type: 'text', text: 'See ' },
        { type: 'cite', kind: 'p', label: '12', raw: '{p. 12}' },
        { type: 'text', text: ' and {p. 99}.' },
      ])
    })
  })

  describe('bottom line', () => {
    it('is the first sentence of the first paragraph; the rest keeps its paragraphs', () => {
      expect(m.splitBottomLine('It defines entropy. Then it uses it.\n\nSecond paragraph.')).toEqual({
        lead: 'It defines entropy.', rest: 'Then it uses it.\n\nSecond paragraph.',
      })
      expect(m.splitBottomLine('One sentence only.\n\nMore.')).toEqual({ lead: 'One sentence only.', rest: 'More.' })
      expect(m.splitBottomLine('No full stop at all')).toEqual({ lead: 'No full stop at all', rest: '' })
      expect(m.splitBottomLine('')).toEqual({ lead: '', rest: '' })
      expect(m.splitBottomLine('\n\n  \n')).toEqual({ lead: '', rest: '' })
    })

    it('is not cut by decimals, abbreviations, initials or a citation inside the sentence', () => {
      expect(m.splitBottomLine('Eq. 1.2 gives 3.5 m/s, e.g. for J. Smith on p. 4 {p. 4}, not more. Next.').lead)
        .toBe('Eq. 1.2 gives 3.5 m/s, e.g. for J. Smith on p. 4 {p. 4}, not more.')
    })

    it('takes the citation that follows the sentence, and a closing quote or bracket', () => {
      expect(m.splitBottomLine('The bound is tight. {p. 12} It follows.')).toEqual({ lead: 'The bound is tight. {p. 12}', rest: 'It follows.' })
      expect(m.splitBottomLine('He calls it "the law." Then more.').lead).toBe('He calls it "the law."')
      expect(m.splitBottomLine('Is it true? Mostly.').lead).toBe('Is it true?')
      expect(m.splitBottomLine('A line\nwith a break. Then.').lead).toBe('A line\nwith a break.')
    })

    it('never parses Markdown bold', () => {
      expect(m.splitBottomLine('**Bold** claim here. Rest.').lead).toBe('**Bold** claim here.')
    })
  })

  describe('fact-check', () => {
    const answer = [
      'Partly holds. The 1990 figure was right, but it has since doubled. {p. 3}',
      '',
      'Holds. Water boils at 100 °C at sea level.',
      '',
      'Outdated. The population was 5.3 billion in 1990; it is 8.1 billion now.',
      '',
      'Note. The author writes as an economist.',
      '',
      'Sources: [UN World Population Prospects](https://population.un.org/wpp/) · [Britannica (boiling point)](https://www.britannica.com/science/boiling-point_(physics)) · [bad](javascript:alert(1)) · [ftp](ftp://example.com/x)',
    ].join('\n')

    it('reads the overall verdict, a verdict per paragraph and the sources', () => {
      const parsed = m.parseFactcheck(answer)
      expect(parsed.verdict).toBe('Partly holds.')
      expect(parsed.lead).toBe('Partly holds. The 1990 figure was right, but it has since doubled. {p. 3}')
      expect(parsed.claims).toEqual([
        { verdict: 'Holds.', text: 'Water boils at 100 °C at sea level.' },
        { verdict: 'Outdated.', text: 'The population was 5.3 billion in 1990; it is 8.1 billion now.' },
        { verdict: 'Note.', text: 'The author writes as an economist.' },
      ])
      expect(parsed.sources).toEqual([
        { title: 'UN World Population Prospects', url: 'https://population.un.org/wpp/' },
        { title: 'Britannica (boiling point)', url: 'https://www.britannica.com/science/boiling-point_(physics)' },
      ])
    })

    it("accepts Can't check. with either apostrophe, and verdict words wrapped in emphasis", () => {
      expect(m.parseFactcheck('Can’t check. Nothing reliable covers this.\n\nSources:').verdict).toBe("Can't check.")
      expect(m.parseFactcheck('*Disputed.* Economists disagree.').verdict).toBe('Disputed.')
      expect(m.parseFactcheck('**Holds.** It does.').lead).toBe('**Holds.** It does.')
    })

    it('copes with no verdict, no sources line, an empty sources line and a claim without a verdict word', () => {
      const parsed = m.parseFactcheck('This is opinion, not a factual claim.\n\nThe author argues for it.')
      expect(parsed).toEqual({ verdict: null, lead: 'This is opinion, not a factual claim.', claims: [{ verdict: null, text: 'The author argues for it.' }], sources: [] })
      expect(m.parseFactcheck('Holds. Yes.\nSources:').sources).toEqual([])
      expect(m.parseFactcheck('Holds. Yes.\nSources: none').sources).toEqual([])
      expect(m.parseFactcheck('')).toEqual({ verdict: null, lead: '', claims: [], sources: [] })
      // A verdict-looking word that is not one stays text.
      expect(m.parseFactcheck('Holds up well. It does.').verdict).toBeNull()
    })

    it('keeps only http(s) links, de-duplicated, and falls back to bare URLs', () => {
      expect(m.parseSourcesLine('Sources: [A](https://a.org/x) · [A again](https://a.org/x) · [B](http://b.org)')).toEqual([
        { title: 'A', url: 'https://a.org/x' }, { title: 'B', url: 'http://b.org/' },
      ])
      expect(m.parseSourcesLine('Sources: https://www.nature.com/articles/x1. · https://c.org/y')).toEqual([
        { title: 'nature.com', url: 'https://www.nature.com/articles/x1' }, { title: 'c.org', url: 'https://c.org/y' },
      ])
      expect(m.parseSourcesLine('Sources: [x](data:text/html,hi) [y](JAVASCRIPT:alert(1)) [z](//evil.example)')).toEqual([])
      const long = 'Sources: ' + Array.from({ length: 6 }, (_, i) => `[Source ${i}](https://s${i}.example/${'a'.repeat(60)})`).join(' · ')
      expect(m.parseSourcesLine(long)).toHaveLength(6)
    })
  })

  describe('quiz', () => {
    const quiz = { questions: [
      { q: 'What does eq. 1.2 state?', answer: 'Energy is conserved.', why: 'It sets the change in energy to zero.', cite: '{eq. 1.2}' },
      { q: 'Why does it hold?', answer: 'No external work.', why: 'The system is closed.', cite: '{p. 4}' },
      { q: 'Apply it to a pendulum.', answer: 'Height trades for speed.', why: 'Potential becomes kinetic.', cite: '' },
    ] }

    it('reads three questions from bare JSON, a code fence or stray text', () => {
      expect(m.parseQuiz(JSON.stringify(quiz))).toEqual(quiz)
      expect(m.parseQuiz('```json\n' + JSON.stringify(quiz, null, 2) + '\n```')).toEqual(quiz)
      expect(m.parseQuiz('Here is your quiz:\n' + JSON.stringify(quiz) + '\nGood luck {p. 1}!')).toEqual(quiz)
    })

    it('tolerates one to three valid questions and drops broken ones', () => {
      const one = m.parseQuiz(JSON.stringify({ questions: [{ q: 'Q?', answer: 'A.' }, { q: '', answer: 'x' }, { q: 'No answer' }, 'junk', null] }))
      expect(one).toEqual({ questions: [{ q: 'Q?', answer: 'A.', why: '', cite: '' }] })
      const five = m.parseQuiz(JSON.stringify({ questions: Array.from({ length: 5 }, (_, i) => ({ q: `Q${i}`, answer: `A${i}` })) }))
      expect(five!.questions.map(item => item.q)).toEqual(['Q0', 'Q1', 'Q2'])
    })

    it('keeps a cite only when it is one citation token', () => {
      const parsed = m.parseQuiz(JSON.stringify({ questions: [
        { q: 'a', answer: 'b', cite: 'p. 12' }, { q: 'c', answer: 'd', cite: '{p. 12} {p. 13}' }, { q: 'e', answer: 'f', cite: ' {pp. 9–10} ' },
      ] }))
      expect(parsed!.questions.map(item => item.cite)).toEqual(['', '', '{pp. 9–10}'])
    })

    it('refuses what is not a quiz', () => {
      for (const text of ['', 'No JSON here.', '{"questions": []}', '{"questions": "three"}', '[{"q":"a","answer":"b"}]', '{"questions":[{"q":"a","answer":"b"}', '{"q":"a"}']) {
        expect(m.parseQuiz(text)).toBeNull()
      }
    })

    it('survives braces and quotes inside strings and a broken object before the real one', () => {
      const tricky = { questions: [{ q: 'What is {x | x > 0}?', answer: 'The "positive" reals \\ {0}.', why: '}', cite: '' }] }
      expect(m.parseQuiz('{ not json } ' + JSON.stringify(tricky))).toEqual(tricky)
    })
  })

  describe('quiz_check', () => {
    it('reads the mark and the feedback', () => {
      expect(m.parseQuizCheck('{"verdict":"right","feedback":"Yes: the work is zero."}')).toEqual({ verdict: 'right', feedback: 'Yes: the work is zero.' })
      expect(m.parseQuizCheck('```json\n{"verdict":"nearly","feedback":"Say why."}\n```')).toEqual({ verdict: 'nearly', feedback: 'Say why.' })
      expect(m.parseQuizCheck('Mark: {"verdict":"Not yet","feedback":"Reread the second step."}')).toEqual({ verdict: 'not_yet', feedback: 'Reread the second step.' })
      expect(m.parseQuizCheck('{"verdict":"not-yet"}')).toEqual({ verdict: 'not_yet', feedback: '' })
      expect(m.QUIZ_VERDICT_LINE).toEqual({ right: 'Right.', nearly: 'Nearly.', not_yet: 'Not yet.' })
    })

    it('refuses an unknown mark or no JSON', () => {
      for (const text of ['', 'right', '{"verdict":"wrong","feedback":"x"}', '{"verdict":1}', '{"feedback":"x"}']) expect(m.parseQuizCheck(text)).toBeNull()
    })
  })

  describe('define_sense', () => {
    it('reads the fitting sense, or 0 for none', () => {
      expect(m.parseDefineSense('{"sense": 2}', 3)).toBe(2)
      expect(m.parseDefineSense('{"sense": 0}', 3)).toBe(0)
      expect(m.parseDefineSense('```json\n{"sense":"1"}\n```', 3)).toBe(1)
      expect(m.parseDefineSense('The answer is {"sense": 3}.', 3)).toBe(3)
      expect(m.parseDefineSense('{"sense": 3}')).toBe(3)
    })

    it('keeps the dictionary order (null) for anything else', () => {
      for (const text of ['', 'two', '{"sense": 4}', '{"sense": -1}', '{"sense": 1.5}', '{"sense": "first"}', '{"sense": null}', '{}']) {
        expect(m.parseDefineSense(text, 3)).toBeNull()
      }
    })
  })
})

describe.each(copies)('Related (%s)', (_name, m) => {
  it('reads the bottom line, then one row per place with its citation and line', () => {
    const r = m.parseRelated('Self-attention is the thread that runs through the model.\n\n{p. 2} Background defines it against recurrence.\n{sec. 3.2} The encoder stacks it in six layers.\n{pp. 6-7}: Table 1 compares its cost per layer.')
    expect(r.lead).toBe('Self-attention is the thread that runs through the model.')
    expect(r.rows.map(row => [row.cite?.kind, row.cite?.label, row.text])).toEqual([
      ['p', '2', 'Background defines it against recurrence.'],
      ['sec', '3.2', 'The encoder stacks it in six layers.'],
      ['pp', '6', 'Table 1 compares its cost per layer.'],
    ])
    expect(r.rows.every(row => row.quote === null)).toBe(true)
  })

  it('takes quoted words as a book\'s place, drops bullets, and keeps a line without either as a row', () => {
    const r = m.parseRelated('The vow returns twice.\n- “I will not marry” Emma repeats it to Harriet.\n2. "a very few weeks" Mr. Knightley doubts it.\nAt the end she breaks it.')
    expect(r.lead).toBe('The vow returns twice.')
    expect(r.rows).toEqual([
      { cite: null, quote: 'I will not marry', text: 'Emma repeats it to Harriet.' },
      { cite: null, quote: 'a very few weeks', text: 'Mr. Knightley doubts it.' },
      { cite: null, quote: null, text: 'At the end she breaks it.' },
    ])
  })

  it('is only the bottom line when the idea appears nowhere else, and nothing for an empty answer', () => {
    expect(m.parseRelated('The idea appears nowhere else in the document.')).toEqual({ lead: 'The idea appears nowhere else in the document.', rows: [] })
    expect(m.parseRelated('')).toEqual({ lead: '', rows: [] })
    // Rows with no bottom line still read as rows; at most eight.
    const many = m.parseRelated(Array.from({ length: 10 }, (_, i) => `{p. ${i + 1}} Place ${i + 1}.`).join('\n'))
    expect(many.lead).toBe('')
    expect(many.rows).toHaveLength(8)
  })
})

describe('the static-page copy matches the app copy', () => {
  it('exports the same names', () => {
    const own = (mod: object) => Object.keys(mod).filter(key => !['PDF_EXPLAIN_FORMAT', 'PDF_EXPLAIN_FORMAT_BEFORE', 'PASSAGE_IMAGE_LINE'].includes(key)).sort()
    expect(own(pageCopy)).toEqual(own(appCopy))
    expect(pageCopy.VERDICTS).toEqual(appCopy.VERDICTS)
    expect(pageCopy.CITATION_KINDS).toEqual(appCopy.CITATION_KINDS)
  })

  it("carries the Worker's wording for the PDF reader's own Explain request", () => {
    expect(pageCopy.PDF_EXPLAIN_FORMAT).toBe(PDF_EXPLAIN_FORMAT)
    expect(pageCopy.PDF_EXPLAIN_FORMAT_BEFORE).toBe(PDF_EXPLAIN_FORMAT_BEFORE)
    expect(pageCopy.PASSAGE_IMAGE_LINE).toBe(PASSAGE_IMAGE_LINE)
  })
})
