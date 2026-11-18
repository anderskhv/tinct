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

    // Retest after train 2 (15 Oct, evening): raw "{pp. 5}" and "(p. 2)" in Define and Explain, and a merged "p. 5p. 6".
    it('reads {pp. N} as one page, and (p. N) or (pp. N–M) as tags; never runs two tags together', () => {
      expect(m.citationTokens('{pp. 5}')).toEqual([{ type: 'cite', kind: 'p', label: '5', raw: '{pp. 5}' }])
      expect(m.parseCitations('as the decoder does (p. 2), and later (pp. 5–6).')).toEqual([
        { type: 'text', text: 'as the decoder does ' },
        { type: 'cite', kind: 'p', label: '2', raw: '(p. 2)' },
        { type: 'text', text: ', and later ' },
        { type: 'cite', kind: 'pp', label: '5', to: '6', raw: '(pp. 5–6)' },
        { type: 'text', text: '.' },
      ])
      expect(m.citationTokens('(p. xii)')[0]).toMatchObject({ kind: 'p', label: 'xii' })
      for (const text of ['cross validation {p. 5}{p. 6}.', 'cross validation {p. 5} {p. 6}.']) {
        expect(m.parseCitations(text)).toEqual([
          { type: 'text', text: 'cross validation ' },
          { type: 'cite', kind: 'p', label: '5', raw: '{p. 5}' },
          { type: 'text', text: ', ' },
          { type: 'cite', kind: 'p', label: '6', raw: '{p. 6}' },
          { type: 'text', text: '.' },
        ])
      }
      // Turned down by resolve: as written, parentheses and all.
      expect(m.parseCitations('see (p. 99).', () => false)).toEqual([{ type: 'text', text: 'see (p. 99).' }])
    })

    it('leaves anything else in braces as text, exactly as written', () => {
      // '{pp. 12}' was here: since the retest after train 2 it is one page ({p. 12}), see below.
      for (const text of ['\\frac{a}{b}', '{x}', '{p.}', '(p. value)', '(see p. 2)', '{eq. 1–2}', '{page 12}', '{p. 12', 'p. 12}', '{p. "12"}', '{p. <b>1</b>}', '{}', '{p. 1234567890123456789}']) {
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

    it('the doc-first opening (15 Oct): paragraphs before the verdict are the opening; the verdict is still the bottom line', () => {
      const parsed = m.parseFactcheck('The passage claims 28.4 BLEU; the paper offers Table 2 {p. 8}.\n\nPartly holds. The score stands, but later systems beat it.\n\nNote. A landmark result.\n\nSources: [NLP-progress](https://nlpprogress.com/)')
      expect(parsed.opening).toEqual(['The passage claims 28.4 BLEU; the paper offers Table 2 {p. 8}.'])
      expect(parsed.verdict).toBe('Partly holds.')
      expect(parsed.lead).toBe('Partly holds. The score stands, but later systems beat it.')
      expect(parsed.claims).toEqual([{ verdict: 'Note.', text: 'A landmark result.' }])
      expect(parsed.sources).toEqual([{ title: 'NLP-progress', url: 'https://nlpprogress.com/' }])
      // An answer written before the opening (verdict first) has none.
      expect(m.parseFactcheck(answer).opening).toEqual([])
      // Nor one whose overall verdict is followed by a colon (production, 15 Oct): it stays the bottom line.
      const colon = m.parseFactcheck('Partly holds: the score was right in 2017.\n\nHolds. The paper reports 28.4 BLEU.')
      expect(colon.opening).toEqual([])
      expect(colon.lead).toBe('Partly holds: the score was right in 2017.')
    })

    it("accepts Can't check. with either apostrophe, and verdict words wrapped in emphasis", () => {
      expect(m.parseFactcheck('Can’t check. Nothing reliable covers this.\n\nSources:').verdict).toBe("Can't check.")
      expect(m.parseFactcheck('*Disputed.* Economists disagree.').verdict).toBe('Disputed.')
      expect(m.parseFactcheck('**Holds.** It does.').lead).toBe('**Holds.** It does.')
    })

    it('copes with no verdict, no sources line, an empty sources line and a claim without a verdict word', () => {
      const parsed = m.parseFactcheck('This is opinion, not a factual claim.\n\nThe author argues for it.')
      expect(parsed).toEqual({ opening: [], verdict: null, lead: 'This is opinion, not a factual claim.', claims: [{ verdict: null, text: 'The author argues for it.' }], sources: [] })
      expect(m.parseFactcheck('Holds. Yes.\nSources:').sources).toEqual([])
      expect(m.parseFactcheck('Holds. Yes.\nSources: none').sources).toEqual([])
      expect(m.parseFactcheck('')).toEqual({ opening: [], verdict: null, lead: '', claims: [], sources: [] })
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

    it('while streaming, gives each question as soon as its object is complete', () => {
      const full = JSON.stringify(quiz)
      const at = (needle: string) => full.indexOf(needle)
      expect(m.parseQuizPartial('')).toEqual([])
      expect(m.parseQuizPartial(full.slice(0, at('"why"')))).toEqual([])
      const firstEnd = at('{"q":"Why')
      expect(m.parseQuizPartial(full.slice(0, firstEnd))).toEqual([quiz.questions[0]])
      expect(m.parseQuizPartial(full.slice(0, firstEnd + 12))).toEqual([quiz.questions[0]])
      expect(m.parseQuizPartial(full.slice(0, at('{"q":"Apply')))).toEqual(quiz.questions.slice(0, 2))
      expect(m.parseQuizPartial(full)).toEqual(quiz.questions)
      // In a code fence, with braces inside strings, and with an invalid object skipped.
      expect(m.parseQuizPartial('```json\n{"questions": [{"q":"A {b}?","answer":"c"}, {"q":"","answer":"x"}, {"q":"D?","answer":"e"')).toEqual([{ q: 'A {b}?', answer: 'c', why: '', cite: '' }])
      // Every streamed prefix agrees with the final parse.
      for (let n = 0; n <= full.length; n += 7) expect(quiz.questions.slice(0, m.parseQuizPartial(full.slice(0, n)).length)).toEqual(m.parseQuizPartial(full.slice(0, n)))
    })

    it('reads three questions from bare JSON, a code fence or stray text', () => {
      expect(m.parseQuiz(JSON.stringify(quiz))).toEqual(quiz)
      expect(m.parseQuiz('```json\n' + JSON.stringify(quiz, null, 2) + '\n```')).toEqual(quiz)
      expect(m.parseQuiz('Here is your quiz:\n' + JSON.stringify(quiz) + '\nGood luck {p. 1}!')).toEqual(quiz)
    })

    it('tolerates one to eight valid questions (one per key idea) and drops broken ones', () => {
      const one = m.parseQuiz(JSON.stringify({ questions: [{ q: 'Q?', answer: 'A.' }, { q: '', answer: 'x' }, { q: 'No answer' }, 'junk', null] }))
      expect(one).toEqual({ questions: [{ q: 'Q?', answer: 'A.', why: '', cite: '' }] })
      // Anders, 20 Oct 2026: the count follows the text's key ideas, at most eight.
      const five = m.parseQuiz(JSON.stringify({ questions: Array.from({ length: 5 }, (_, i) => ({ q: `Q${i}`, answer: `A${i}` })) }))
      expect(five!.questions.map(item => item.q)).toEqual(['Q0', 'Q1', 'Q2', 'Q3', 'Q4'])
      const ten = m.parseQuiz(JSON.stringify({ questions: Array.from({ length: 10 }, (_, i) => ({ q: `Q${i}`, answer: `A${i}` })) }))
      expect(ten!.questions).toHaveLength(m.QUIZ_MAX_QUESTIONS)
      expect(m.QUIZ_MAX_QUESTIONS).toBe(8)
    })

    it('keeps the key ideas first and each question\'s idea (by index)', () => {
      const text = JSON.stringify({ ideas: ['Light needs a source', 'Shades redirect it'], questions: [{ idea: 0, q: 'Why does a room need a source?', answer: 'x' }, { idea: 1, q: 'How does a shade change the room?', answer: 'y' }, { idea: 'z', q: 'Odd?', answer: 'w' }] })
      expect(m.parseQuiz(text)).toEqual({ ideas: ['Light needs a source', 'Shades redirect it'], questions: [{ q: 'Why does a room need a source?', answer: 'x', why: '', cite: '', idea: 0 }, { q: 'How does a shade change the room?', answer: 'y', why: '', cite: '', idea: 1 }, { q: 'Odd?', answer: 'w', why: '', cite: '' }] })
      expect(m.parseQuizIdeas(text.slice(0, text.indexOf('"questions"')))).toEqual(['Light needs a source', 'Shades redirect it'])
      expect(m.parseQuizIdeas('{"ideas":["Light ] needs", "Sha')).toBeNull()
      expect(m.parseQuizPartial(text).map(item => item.idea)).toEqual([0, 1, undefined])
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
      expect(m.QUIZ_VERDICT_LINE).toEqual({ right: 'Right.', nearly: 'Nearly.', not_yet: 'Not quite.' })
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

// Retest after train 2 (15 Oct, evening, GAN paper): one Simplify repeated the passage word for word as its
// first paragraph, one ended "The rewrite is a restatement of…". Both copies.
describe.each(copies)('Simplify answers as the card shows them (%s)', (_name, m) => {
  it('drops a paragraph that is the passage again when a rewrite follows it', () => {
    const passage = 'procedure for G is to maximize the probability of D making a mistake'
    const reply = 'The training procedure for G is to maximize the probability of D making a mistake.\n\nThe generator G is trained to make the discriminator D get things wrong as often as possible.'
    expect(m.wordSimilarity(reply.split('\n\n')[0], passage)).toBeGreaterThanOrEqual(m.SIMPLIFY_SAME)
    expect(m.simplifyAnswer(reply, passage)).toEqual({ text: 'The generator G is trained to make the discriminator D get things wrong as often as possible.', unchanged: false })
  })
  it('drops a closing note about the rewrite', () => {
    const passage = 'This objective function results in the same fixed point of the dynamics of G and D but provides much stronger gradients early in learning'
    const reply = 'This objective gives the same final result for G and D, but it gives much stronger learning signals early on.\n\nThe rewrite is a restatement of the selected sentence, which only says the alternative objective reaches the same fixed point.'
    expect(m.simplifyAnswer(reply, passage)).toEqual({ text: 'This objective gives the same final result for G and D, but it gives much stronger learning signals early on.', unchanged: false })
    for (const note of ['This simplified version keeps every claim.', 'Note: the rewrite keeps the order.', "I've kept the equation as written."]) {
      expect(m.simplifyAnswer(`A plain line.\n\n${note}`, passage).text).toBe('A plain line.')
    }
  })
  it('says so when nothing but the passage came back, and leaves a real rewrite alone', () => {
    expect(m.simplifyAnswer('G must not be trained too much without updating D.', 'G must not be trained too much without updating D')).toEqual({ text: '', unchanged: true })
    // Citation tags and punctuation do not make a copy look new.
    expect(m.simplifyAnswer('G must not be trained too much, without updating D {p. 7}.', 'G must not be trained too much without updating D').unchanged).toBe(true)
    const real = 'The generator should not get many training steps in a row while the discriminator stays the same.'
    expect(m.simplifyAnswer(real, 'G must not be trained too much without updating D')).toEqual({ text: real, unchanged: false })
    // A one-paragraph answer is never taken for a note; an empty answer is not "unchanged".
    expect(m.simplifyAnswer('The rewrite of this is simple.', 'x y z').text).toBe('The rewrite of this is simple.')
    expect(m.simplifyAnswer('', 'x')).toEqual({ text: '', unchanged: false })
  })
})

// Production re-run after train 3 (15 Oct, evening): a four-word selection got two paragraphs repeating
// the whole sentence; some answers quoted the passage back. Both copies.
describe.each(copies)('Simplify after the train-3 re-run (%s)', (_name, m) => {
  it('a selection of a few words keeps one short restatement, never a second paragraph', () => {
    const reply = 'Where each word sits.\n\nWe must inject some information about the relative or absolute position of the tokens in the sequence.'
    expect(m.simplifyAnswer(reply, 'position of the tokens')).toEqual({ text: 'Where each word sits.', unchanged: false })
    // A longer passage keeps its rewrite: one paragraph for a one-paragraph passage since round 3 (16 Oct), two for two.
    const long = 'we must inject some information about the relative or absolute position of the tokens in the sequence'
    expect(m.simplifyAnswer('The model must be told where each token is.\n\nIt needs some signal of order.', long).text).toBe('The model must be told where each token is.')
    expect(m.simplifyAnswer('The model must be told where each token is.\n\nIt needs some signal of order.', `${long}.\n\nThe encodings have the same dimension as the embeddings.`).text).toBe('The model must be told where each token is.\n\nIt needs some signal of order.')
  })
  it('drops a sentence that quotes the passage back, its citation with it', () => {
    const passage = 'Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions'
    const reply = 'Multi-head attention lets the model look at several kinds of information at once. The passage\'s own words on this are: "Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions." {p. 5}\n\nEach head can focus on something different.'
    // One paragraph for a one-sentence passage since round 3 (16 Oct); the quoting sentence goes either way.
    expect(m.simplifyAnswer(reply, passage).text).toBe('Multi-head attention lets the model look at several kinds of information at once.')
    // A short quotation of a term stays.
    expect(m.simplifyAnswer('Here "subspaces" means separate views of the input.', passage).text).toBe('Here "subspaces" means separate views of the input.')
  })
})

// Full battery on train 3 (15 Oct, night): fiction pasted the passage and the sentences after it back,
// Metamorphosis printed one line twice, and an Explain said "The image confirms this passage reads as printed".
describe.each(copies)('after the full battery on train 3 (%s)', (_name, m) => {
  const page = 'The front pattern does move, and no wonder! The woman behind shakes it! Sometimes I think there are a great many women behind, and sometimes only one, and she crawls around fast, and her crawling shakes it all over.'
  it('Simplify never shows the sentences after the passage pasted back from the page', () => {
    const reply = 'The pattern on the wallpaper really does move.\n\nThe woman behind shakes it. Sometimes I think there are a great many women behind, and sometimes only one, and she crawls around fast.'
    expect(m.copiedShare(reply.split('\n\n')[1], page)).toBeGreaterThanOrEqual(m.SIMPLIFY_COPIED)
    expect(m.simplifyAnswer(reply, 'The front pattern does move, and no wonder!', page).text).toBe('The pattern on the wallpaper really does move.')
    // Its own plain words are kept, whatever the page says.
    expect(m.copiedShare('The narrator thinks a woman is trapped behind the pattern and is shaking it.', page)).toBeLessThan(m.SIMPLIFY_COPIED)
    // Only the page's copy came back: said so.
    expect(m.simplifyAnswer('The woman behind shakes it! Sometimes I think there are a great many women behind.', 'The woman behind shakes it!', page).unchanged).toBe(true)
  })
  it('Simplify never shows the same line or paragraph twice', () => {
    const passage = 'a gigantic, bony charwoman with white hair flying round her head'
    expect(m.simplifyAnswer('A huge, heavy-boned cleaning woman with white hair.\n\nA huge, heavy-boned cleaning woman with white hair.', passage).text).toBe('A huge, heavy-boned cleaning woman with white hair.')
    expect(m.simplifyAnswer('A big cleaning woman.\nA big cleaning woman.\nHer hair flew about.', passage).text).toBe('A big cleaning woman.\nHer hair flew about.')
  })
  it('drops a sentence about the passage picture, and nothing else', () => {
    expect(m.withoutPictureTalk('The image confirms this passage reads as printed. The sentence says the model drops recurrence.')).toBe('The sentence says the model drops recurrence.')
    expect(m.withoutPictureTalk('It drops recurrence. The attached image matches the text.\n\nMore here.')).toBe('It drops recurrence.\n\nMore here.')
    for (const text of ['The picture of a yellow room recurs through the story.', 'The image of the wallpaper shows her state of mind.', 'Printed words matter here.']) expect(m.withoutPictureTalk(text)).toBe(text)
  })
})

// Night smoke run (15 Oct): a Simplify answer ended with a bare "p. 1." (no braces). Both copies.
describe.each(copies)('a bare page at the end of a line or an answer (%s)', (_name, m) => {
  it('is a tag; the same words mid-sentence stay text', () => {
    expect(m.parseCitations('G tries to make D get things wrong p. 1.')).toEqual([
      { type: 'text', text: 'G tries to make D get things wrong ' },
      { type: 'cite', kind: 'p', label: '1', raw: 'p. 1' },
      { type: 'text', text: '.' },
    ])
    expect(m.citationTokens('One line p. 2\nThe next.').map(t => t.label)).toEqual(['2'])
    expect(m.citationTokens('Ends p.12')[0]).toMatchObject({ kind: 'p', label: '12' })
    expect(m.citationTokens('Ends pp. 5–6.')[0]).toMatchObject({ kind: 'pp', label: '5', to: '6' })
    for (const text of ['See p. 3 for more.', 'pp. 5–6.', 'a p. value of 0.05', 'p. 1']) expect(m.parseCitations(text).every(part => part.type === 'text')).toBe(true)
  })
})


// recheck-1 (16 Oct, train 4 on production): Simplify repeated its first line on 4 of 8 documents, gave two
// renderings of one sentence, and on the phone gave the passage back with a few words added. The answers as
// they came back, from night/out/recheck-1/tinct.jsonl. Both copies.
describe.each(copies)('Simplify after recheck-1: one rewrite (%s)', (_name, m) => {
  const cases: Array<[string, string, string, string]> = [
    ['gan', 'procedure for G is to maximize the probability of D making a mistake',
      'The training goal for G is to make D as likely as possible to get things wrong.\n\nThe training goal for G is to make D as likely as possible to get things wrong. Here G is the generator, which makes fake samples, and D is the discriminator, which tries to tell real samples from fake ones p. 1.',
      'The training goal for G is to make D as likely as possible to get things wrong.'],
    ['resnet', 'The entire network can still be trained end-to-end by SGD with backpropagation',
      'The whole network can still be trained from start to finish using stochastic gradient descent with backpropagation.\n\nThe whole network can still be trained from start to finish using stochastic gradient descent, a standard training method, together with backpropagation, which adjusts the weights by sending error signals backward through the layers. p. 2',
      'The whole network can still be trained from start to finish using stochastic gradient descent with backpropagation.'],
    ['attention', 'Self-attention, sometimes called intra-attention is an attention mechanism relating different positions of a single sequence',
      'Self-attention, also called intra-attention, lets the positions within one sequence look at each other to build a representation of that sequence.\n\nSelf-attention is a way for a sentence to relate its own words to one another. Each position is compared with the others in the same sequence, so the result describes the whole sequence.',
      'Self-attention, also called intra-attention, lets the positions within one sequence look at each other to build a representation of that sequence.'],
    ['yellow-wallpaper', 'He says that with my imaginative power and habit of story-making',
      'He says my imagination and habit of making up stories could lead to a nervous weakness like mine.\n\nHe says that with my imaginative power and my habit of making up stories, a nervous weakness like mine is sure to lead to all sorts of excited fancies.',
      'He says my imagination and habit of making up stories could lead to a nervous weakness like mine.'],
    ['epa-mold', 'Molds reproduce by means of tiny spores',
      'Molds spread by making tiny spores.\n\nMold spores are very small seeds that molds use to make new mold.',
      'Molds spread by making tiny spores.'],
  ]
  it.each(cases)('%s: one rendering, never the first line again', (_doc, passage, reply, shown) => {
    expect(m.simplifyAnswer(reply, passage)).toEqual({ text: shown, unchanged: false })
  })
  it('the answers that were already one rewrite are left alone', () => {
    const mackay = 'In a linear block code, the extra bits are formed by adding up some of the original bits. There are N minus K of them, where N is the total length and K is the number of original bits.'
    expect(m.simplifyAnswer(mackay, 'In a linear block code, the extra N − K bits are linear functions of the original K bits')).toEqual({ text: mackay, unchanged: false })
    expect(m.simplifyAnswer('In the end, Gregor saw that he had no other option.', 'Eventually, though, Gregor realised that he had no choice')).toEqual({ text: 'In the end, Gregor saw that he had no other option.', unchanged: false })
  })
  it('a sentence said again later in the same paragraph is dropped too', () => {
    expect(m.simplifyAnswer('The generator tries to fool the judge. It wants the judge to be wrong. The generator tries to fool the judge.', 'procedure for G is to maximize the probability of D making a mistake').text).toBe('The generator tries to fool the judge. It wants the judge to be wrong.')
  })
  it('the phone answer that held the passage word for word is the passage again', () => {
    expect(m.simplifyAnswer('Experiments on two machine translation tasks are run to test the new model.', 'Experiments on two machine translation tasks')).toEqual({ text: '', unchanged: true })
    // Three words in a row are not a copy.
    expect(m.simplifyAnswer('Two translation tests show the model works.', 'two translation tests').unchanged).toBe(false)
  })
})

// recheck-1 (16 Oct): Explain's template lines, and a bare "eq. 1" in the scan's answer. Both copies.
describe.each(copies)('Explain after recheck-1 (%s)', (_name, m) => {
  it('drops a sentence saying there is no notation, or that the passage is cut off, and nothing else', () => {
    const resnet = 'Here the term introduces the design the authors build on {p. 2}. No notation appears in this sentence beyond the bracketed reference numbers, which point to the reference list {p. 9}.'
    expect(m.withoutTemplateTalk(resnet)).toBe('Here the term introduces the design the authors build on {p. 2}.')
    expect(m.withoutTemplateTalk('Her phrase suggests she has accepted it. There is no notation in this passage.')).toBe('Her phrase suggests she has accepted it.')
    const mackay = 'The symbol f is the noise level {p. 3}.\n\nThe passage is cut off mid-sentence here, so the rest of the model appears on the following lines {p. 4}.'
    expect(m.withoutTemplateTalk(mackay)).toBe('The symbol f is the noise level {p. 3}.')
    expect(m.withoutTemplateTalk("The reader's selection stops before the claim. It defines entropy.")).toBe('It defines entropy.')
    // Notation explained, and content that happens to use the words, stay.
    for (const text of ['The notation H(X) means the entropy of X.', 'The proof here is incomplete, as the author admits {p. 5}.', 'The narrator stops short of naming it.', 'G is not trained to look real.']) expect(m.withoutTemplateTalk(text)).toBe(text)
  })
  it('a bare "eq. 1" is a tag when the PDF has that equation, otherwise plain text', () => {
    const answer = 'D maximises it and G minimises it, as formalised in equation (1) eq. 1. Here it means a contest.'
    const has = (token: { kind: string; label: string }) => token.kind === 'eq' && token.label === '1'
    expect(m.parseCitations(answer, has)).toEqual([
      { type: 'text', text: 'D maximises it and G minimises it, as formalised in equation (1) ' },
      { type: 'cite', kind: 'eq', label: '1', raw: 'eq. 1' },
      { type: 'text', text: '. Here it means a contest.' },
    ])
    expect(m.parseCitations(answer, () => false)).toEqual([{ type: 'text', text: answer }])
    expect(m.parseCitations(answer)).toEqual([{ type: 'text', text: answer }])
    expect(m.parseCitations('By eq. 4.6 the two add.', (token: { label: string }) => token.label === '4.6').filter(part => part.type === 'cite')).toEqual([{ type: 'cite', kind: 'eq', label: '4.6', raw: 'eq. 4.6' }])
    // Inside a word or braces as before.
    expect(m.parseCitations('freq. 1 is not one', () => true)).toEqual([{ type: 'text', text: 'freq. 1 is not one' }])
    expect(m.citationTokens('{eq. 2}')).toEqual([{ type: 'cite', kind: 'eq', label: '2', raw: '{eq. 2}' }])
  })
})
