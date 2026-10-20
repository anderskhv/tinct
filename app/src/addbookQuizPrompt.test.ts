/**
 * Quiz me's prompt (Anders, 20 Oct 2026): key ideas first, one why/how question per idea (so the count follows the
 * text, at most eight), no recall questions, no page citations for a book without pages, and a retry that never
 * repeats a question and aims at the ideas the reader missed. The model is never called: the request is built here.
 */
import { describe, expect, it } from 'vitest'
import { buildCompanionSystem, companionSelectionMessage, parseCompanionRequest, QUIZ_ASKED_MAX } from './companion/companionRequest'
import { QUIZ_CHECK_FRAMING_RULE, QUIZ_CHECK_NO_REREAD_RULE, QUIZ_WHOSE_VIEW_RULE, QUIZ_CHECK_ADDITION_RULE, QUIZ_CHECK_CREDIT_RULE, QUIZ_CHECK_GRADES_RULE, QUIZ_CHECK_PROMPT, QUIZ_CITE_NONE, QUIZ_CITE_PDF, QUIZ_KEY_IDEAS_RULE, QUIZ_MAX_IDEAS, QUIZ_NO_REPEAT_RULE, QUIZ_ONE_PER_IDEA_RULE, QUIZ_WHY_HOW_RULE, quizPrompt } from './companion/marginPrompts'
import * as pageCopy from '../public/lab/margin/margin-parse.js'

const context = (kind: 'pdf' | 'epub') => ({ bookTitle: 'Lamplit Conjectures', bookAuthor: 'Gale Editor', chapterLabel: '1 The Fate of Lamplight', kind, paragraphs: ['One.', 'Two.'], paragraphIndex: 0 })

describe('Quiz me: understanding, covering the text', () => {
  const prompt = quizPrompt('passage', { pdf: true })
  it('asks for the key ideas first, then exactly one question per idea, in the text\'s order', () => {
    expect(prompt.indexOf(QUIZ_KEY_IDEAS_RULE)).toBeGreaterThan(-1)
    expect(prompt.indexOf(QUIZ_ONE_PER_IDEA_RULE)).toBeGreaterThan(prompt.indexOf(QUIZ_KEY_IDEAS_RULE))
    expect(prompt).toContain('"ideas":["…"],"thesis":"…","questions":[{"idea":0')
    expect(prompt).toContain('Return only JSON, the key ideas first, then the author\'s own position')
  })
  it('scales the count with the text, at most eight, never a fixed three', () => {
    expect(QUIZ_KEY_IDEAS_RULE).toMatch(/one or two for a sentence or a short passage, more for a long passage or a whole chapter, at most eight; never a fixed three/)
    expect(QUIZ_MAX_IDEAS).toBe(8)
    expect(pageCopy.QUIZ_MAX_QUESTIONS).toBe(QUIZ_MAX_IDEAS)
    expect(prompt).not.toMatch(/three (short )?questions/i)
  })
  it('is biased to why and how, and names the recall questions to avoid', () => {
    expect(QUIZ_WHY_HOW_RULE).toMatch(/^Test understanding, not memory: ask why or how\./)
    for (const kind of ['why the author argues', 'what follows from it', 'how two ideas connect', 'what would change if an assumption failed', 'applies to a new case']) expect(QUIZ_WHY_HOW_RULE).toContain(kind)
    for (const recall of ['"How many…"', '"What does X explain…"', '"Name the…"']) expect(QUIZ_WHY_HOW_RULE).toContain(recall)
    expect(prompt).not.toContain('checks a fact stated in the text')
  })
  it('never repeats a question and aims a retry at the missed ideas', () => {
    expect(prompt).toContain(QUIZ_NO_REPEAT_RULE)
    expect(QUIZ_NO_REPEAT_RULE).toMatch(/never repeat one of them or a close variant/)
    expect(QUIZ_NO_REPEAT_RULE).toMatch(/Aim first at the key ideas marked missed/)
    expect(QUIZ_NO_REPEAT_RULE).toMatch(/when none was missed, ask about the same key ideas from new angles/)
  })
  it('is one prompt for every kind of text; only the citation line differs (a book has no pages)', () => {
    expect(quizPrompt('passage', { pdf: true })).toContain(QUIZ_CITE_PDF)
    expect(quizPrompt('passage')).toContain(QUIZ_CITE_NONE)
    expect(quizPrompt('passage')).not.toContain('{p. 12}')
    expect(quizPrompt('passage').replace(QUIZ_CITE_NONE, '').replace('"cite":""', '')).toBe(quizPrompt('passage', { pdf: true }).replace(QUIZ_CITE_PDF, '').replace('"cite":"{p. 12}"', ''))
    // An EPUB of the reader's own goes through the same prompt, without page citations.
    const epub = parseCompanionRequest({ intent: 'quiz', context: context('epub'), selection: 'The lamp explains itself.' })!
    expect(buildCompanionSystem(epub)).toContain(quizPrompt('passage'))
    const pdf = parseCompanionRequest({ intent: 'quiz', context: context('pdf'), selection: 'The lamp explains itself.' })!
    expect(buildCompanionSystem(pdf)).toContain(quizPrompt('passage', { pdf: true }))
  })
  it('marks the reasoning, not the wording, in brief feedback', () => {
    expect(QUIZ_CHECK_PROMPT).toContain('Judge the reasoning, not the wording')
    expect(QUIZ_CHECK_PROMPT).toContain('The feedback is short, at most three sentences')
  })
  it('credits first and judges an addition on its merits, never marking it down for not being in the passage', () => {
    const lines = QUIZ_CHECK_PROMPT.split('\n')
    expect(lines.indexOf(QUIZ_CHECK_CREDIT_RULE)).toBe(1)
    expect(lines.indexOf(QUIZ_CHECK_ADDITION_RULE)).toBe(2)
    expect(QUIZ_CHECK_ADDITION_RULE).toContain('using the passage and reliable general knowledge')
    expect(QUIZ_CHECK_ADDITION_RULE).toContain('whether it is true, partly true or wrong, and why')
    expect(QUIZ_CHECK_ADDITION_RULE).toContain('Never lower a grade only because something is not in the passage.')
    expect(QUIZ_CHECK_GRADES_RULE).toContain('"right" when the core idea is right and any addition is defensible or partly true')
    expect(QUIZ_CHECK_GRADES_RULE).toContain('"nearly" only when the core idea is incomplete or partly wrong')
    expect(QUIZ_CHECK_GRADES_RULE).toContain('"not_yet" (shown as "Not quite.") when the core idea is wrong')
    expect(pageCopy.QUIZ_VERDICT_LINE.not_yet).toBe('Not quite.')
  })
  it('Anders\'s superposition answer: the marking request carries the rules and his addition as the reader\'s data', () => {
    const check = parseCompanionRequest({ intent: 'quiz_check', context: context('pdf'), quiz: {
      question: 'Why can a quantum system that may be in state A or state B be in both at once?',
      expected: 'The superposition principle: any combination of allowed states is also an allowed state.',
      answer: 'be in both positions at once as long as it doesn\'t get entangled',
    } })!
    const system = buildCompanionSystem(check)
    expect(system.endsWith(QUIZ_CHECK_PROMPT)).toBe(true)
    expect(system).toContain(QUIZ_CHECK_ADDITION_RULE)
    expect(system).toContain(QUIZ_CHECK_GRADES_RULE)
    expect(companionSelectionMessage(check)).toContain('<reader_answer>be in both positions at once as long as it doesn&#39;t get entangled</reader_answer>'.replace('&#39;', "'"))
  })
})

describe('Quiz me: a retry carries the questions asked before', () => {
  const asked = [
    { q: 'Why does the room need a source?', idea: 'Light needs a source', missed: true },
    { q: 'How does a shade change the room?', idea: 'Shades redirect light' },
  ]
  it('sends them, with their ideas and which were missed, after the passage', () => {
    const quiz = parseCompanionRequest({ intent: 'quiz', context: context('epub'), selection: 'The lamp explains itself.', asked })!
    expect(quiz.asked).toEqual(asked)
    const message = companionSelectionMessage(quiz)!
    expect(message.startsWith('<selected_passage>\nThe lamp explains itself.\n</selected_passage>\n\n<earlier_questions>')).toBe(true)
    expect(message).toContain('1. Why does the room need a source? (key idea: Light needs a source) [missed]')
    expect(message).toContain('2. How does a shade change the room? (key idea: Shades redirect light)')
    expect(message).not.toContain('2. How does a shade change the room? (key idea: Shades redirect light) [missed]')
  })
  it('a unit quiz too; a first quiz has none; junk and overflow are dropped', () => {
    const unit = parseCompanionRequest({ intent: 'quiz', context: context('pdf'), asked })!
    expect(companionSelectionMessage(unit)).toContain('Quiz me on 1 The Fate of Lamplight.\n\n<earlier_questions>')
    expect(companionSelectionMessage(parseCompanionRequest({ intent: 'quiz', context: context('pdf') })!)).toBe('Quiz me on 1 The Fate of Lamplight.')
    const many = parseCompanionRequest({ intent: 'quiz', context: context('pdf'), asked: [null, 'x', { q: '' }, ...Array.from({ length: 40 }, (_, i) => ({ q: `Q${i}?`, missed: 'yes' }))] })!
    expect(many.asked).toHaveLength(QUIZ_ASKED_MAX - 3)
    expect(many.asked!.every(item => !('missed' in item))).toBe(true)
  })
})

describe('Quiz me: whose view, and a defensible framing (Anders, 20 Oct 2026, Schrödinger\'s cat)', () => {
  it('questions name whose view they ask about, never "Why does the passage say…"', () => {
    expect(quizPrompt('passage')).toContain(QUIZ_WHOSE_VIEW_RULE)
    expect(QUIZ_WHOSE_VIEW_RULE).toContain('names whose view it asks about')
    expect(QUIZ_WHOSE_VIEW_RULE).toContain('"According to the collapse view described here, why…"')
    expect(QUIZ_WHOSE_VIEW_RULE).toContain('never "Why does the passage say…"')
    expect(quizPrompt('chapter')).toContain('"thesis":"…"')
  })
  it('grading accepts a defensible framing, above all the author\'s own, names the difference, and never says reread', () => {
    expect(QUIZ_CHECK_PROMPT).toContain(QUIZ_CHECK_FRAMING_RULE)
    expect(QUIZ_CHECK_FRAMING_RULE).toContain('Accept a correct answer in any defensible framing')
    expect(QUIZ_CHECK_FRAMING_RULE).toContain('above all the author\'s own position')
    expect(QUIZ_CHECK_FRAMING_RULE).toContain('mark it right and add one sentence naming the difference')
    expect(QUIZ_CHECK_PROMPT).toContain(QUIZ_CHECK_NO_REREAD_RULE)
    expect(QUIZ_CHECK_NO_REREAD_RULE).toBe('Never tell the reader to reread when their answer is defensible.')
  })
  it('the marking request carries the author\'s position and the key ideas (mocked: never sent to a model)', () => {
    const check = parseCompanionRequest({ intent: 'quiz_check', context: context('epub'), quiz: {
      question: 'According to the collapse view described here, why do we never see the cat both alive and dead?',
      expected: 'Observation collapses the superposition into one outcome.',
      answer: 'because we become entangled with the box when we open it so we branch into one of the positions',
      thesis: 'The author defends the many-worlds account: superpositions never collapse; observers branch.',
      ideas: ['Measurement seems to pick one outcome', 'Many worlds keeps every branch'],
    } })!
    expect(check.quizCheck!.thesis).toContain('many-worlds')
    const message = companionSelectionMessage(check)!
    expect(message.startsWith('<author_position>The author defends the many-worlds account')).toBe(true)
    expect(message).toContain('<key_ideas>\n1. Measurement seems to pick one outcome\n2. Many worlds keeps every branch\n</key_ideas>')
    expect(buildCompanionSystem(check)).toContain(QUIZ_CHECK_FRAMING_RULE)
    // The quiz's thesis is kept from the reply.
    expect(pageCopy.parseQuiz(JSON.stringify({ ideas: ['a'], thesis: 'The author defends many worlds.', questions: [{ idea: 0, q: 'Why?', answer: 'x' }] }))!.thesis).toBe('The author defends many worlds.')
  })
})

describe('never "unit" (Anders, 20 Oct 2026: "The unit recalls Everett\'s relative-state construction…")', () => {
  it('the primer names the text by what it is, with its kind and title, and forbids "unit"', async () => {
    const { CHAPTER_CHAT_INSTRUCTIONS, parseChapterChatAction } = await import('./companion/chapterChatPrompt')
    const { buildPrimerTask, buildPrimerInstructions } = await import('./companion/primerPrompt')
    expect(CHAPTER_CHAT_INSTRUCTIONS.primer).toContain('never call it a "unit"')
    const action = parseChapterChatAction({ kind: 'primer', unitKey: 'outline-1', unitTitle: 'What Many Worlds Means for Gravity', unitKind: 'chapter' }, null)!
    expect(action.unitKind).toBe('chapter')
    expect(parseChapterChatAction({ kind: 'primer', unitKey: 'outline-1', unitTitle: 'T', unitKind: 'unit' }, null)!.unitKind).toBeUndefined()
    const ctx = { bookTitle: 'Lamplit Conjectures', bookAuthor: 'Gale Editor', chapterLabel: 'T', paragraphs: ['<page n="9">\nOne.\n</page>'], paragraphIndex: 0, lookups: false } as never
    for (const text of [buildPrimerTask(action, ctx, null), buildPrimerInstructions(action, ctx)]) {
      expect(text).toContain('"kind":"chapter"')
      expect(text).toContain('What Many Worlds Means for Gravity')
      // "unit" only in the rule that forbids it.
      expect(text.replace('never call it a "unit"', '')).not.toMatch(/\bunits?\b/i)
    }
  })
  it('every margin answer rule set forbids it; the quiz prompt never says it', async () => {
    const { MARGIN_ANSWER_RULES, NAME_THE_TEXT_RULE } = await import('./companion/marginPrompts')
    expect(MARGIN_ANSWER_RULES).toContain(NAME_THE_TEXT_RULE)
    expect(NAME_THE_TEXT_RULE).toContain('never call it a "unit"')
    for (const p of [quizPrompt('passage'), quizPrompt('chapter'), quizPrompt('chapter', { pdf: true })]) expect(p).not.toMatch(/\bunits?\b/i)
    // (The marking prompt's "units" are units of measure: "equivalent wording, units and rounding".)
    expect(QUIZ_CHECK_PROMPT.replace('units and rounding', '')).not.toMatch(/\bunits?\b/i)
  })
})
