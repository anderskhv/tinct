import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type MutableRefObject } from 'react'
import type { LabAskTurn } from '../labAsk'
import { isAiRestingError } from '../labCompanion'
import { LAB_COPY } from '../labCopy'
import { PhoneAnswer, PhoneFollow, PhoneWait, type PhoneFollowProps } from './LabPhoneCard'
import type { PhoneCardRange } from './phoneCardPassage'
import type { NamesakeNotice } from '../../services/characters/characterCards'

/** The passage a card is about: the words, where they are, and the chapter around them. */
export interface PhonePassage {
  text: string
  paragraphIndex: number
  chapterNumber: number
  chapterLabel: string
  editionKey: string
  paragraphs: string[]
  /** Where the words are, underlined on the page while the card is open (phoneCardPassage.ts). */
  ranges?: PhoneCardRange[]
  /** Chosen in Compare's column. */
  compare?: boolean
}

export type PhoneAnswerKind = 'explain' | 'simplify' | 'factcheck' | 'counterpoint'

export type PhoneCard =
  | { kind: PhoneAnswerKind; passage: PhonePassage; openedAt: number }
  | { kind: 'define'; passage: PhonePassage; word: string; namesakes?: NamesakeNotice; openedAt: number }
  | { kind: 'ask'; passage: PhonePassage; openedAt: number }
  | { kind: 'quiz'; passage: PhonePassage | null; chapterNumber: number; chapterLabel: string; openedAt: number }
  | { kind: 'note'; passage: PhonePassage; highlightId: string; created: boolean }
  | { kind: 'chapter-note'; chapterNumber: number; chapterLabel: string }

/** The card's name in its label (the margin reader's KINDS). */
export const PHONE_CARD_NAMES: Record<PhoneCard['kind'], string> = {
  explain: 'Explain', simplify: 'Simplify', factcheck: 'Fact-check', counterpoint: 'Counterpoint',
  define: 'Define', ask: 'Ask', quiz: 'Quiz me', note: 'Note', 'chapter-note': 'Note',
}

/**
 * An answer that streams in from the companion, shown as it arrives. `onReady`
 * hears the whole answer once (it is then carried into a follow-up).
 */
export function PhoneStreamAnswer({ request, onReady }: { request: (onDelta: (text: string) => void) => Promise<string>; onReady?: (answer: string) => void }) {
  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState<'loading' | 'streaming' | 'ready' | 'error' | 'resting'>('loading')
  const [attempt, setAttempt] = useState(0)
  const requestRef = useRef(request)
  requestRef.current = request
  const readyRef = useRef(onReady)
  readyRef.current = onReady
  useEffect(() => {
    let active = true
    setStatus('loading'); setAnswer('')
    void requestRef.current(text => { if (active && text) { setAnswer(text); setStatus('streaming') } }).then(text => {
      if (!active) return
      setAnswer(text); setStatus('ready'); readyRef.current?.(text)
    }).catch(error => { if (active) setStatus(isAiRestingError(error) ? 'resting' : 'error') })
    return () => { active = false }
  }, [attempt])
  return (
    <div className="lab-pcard-stream" data-state={status} data-testid="lab-phone-card-stream" aria-live="polite" aria-busy={status === 'loading' || status === 'streaming'}>
      {answer ? <PhoneAnswer text={answer} /> : status === 'loading' ? <PhoneWait /> : null}
      {status === 'resting' && <p className="lab-pcard-status">{LAB_COPY.aiResting}</p>}
      {status === 'error' && <p className="lab-pcard-status"><button type="button" className="lab-pcard-link" data-testid="lab-phone-card-retry" onClick={() => setAttempt(value => value + 1)}>Retry</button></p>}
    </div>
  )
}

/** The follow-up questions asked from this card and their answers (the chat's own turns). */
export function PhoneThread({ turns, pending }: { turns: LabAskTurn[]; pending: boolean }) {
  const shown = turns.filter(turn => !turn.shownExplanation && !turn.cancelled)
  const waiting = pending && shown[shown.length - 1]?.role !== 'assistant'
  return (
    <>
      {shown.map(turn => turn.role === 'user'
        ? <p key={turn.id} className="lab-pcard-you" data-testid="lab-phone-card-question">{turn.content}</p>
        : <PhoneAnswer key={turn.id} text={turn.content} />)}
      {waiting && <PhoneWait />}
    </>
  )
}

/**
 * The body every passage card shares: what the card shows, then the follow-ups. The passage is not quoted: it
 * stays underlined on the page (LabApp, phoneCardPassage) and the card starts with its title row.
 */
export function PhonePassageBody({ lead, turns, pending }: { lead?: ReactNode; turns: LabAskTurn[]; pending: boolean }) {
  const end = useRef<HTMLDivElement | null>(null)
  const count = turns.length
  useEffect(() => { if (count) end.current?.scrollIntoView?.({ block: 'end' }) }, [count])
  return (
    <>
      {lead}
      <PhoneThread turns={turns} pending={pending} />
      <div ref={end} />
    </>
  )
}

export function PhoneFollowField(props: PhoneFollowProps) {
  return <PhoneFollow {...props} />
}

interface QuizQuestion { q: string; answer: string; why?: string }
const quizQuestionsOf = (list: unknown[]): QuizQuestion[] => list.flatMap(item => {
  const q = item as Record<string, unknown>
  return typeof q?.q === 'string' && typeof q.answer === 'string' ? [{ q: q.q, answer: q.answer, why: typeof q.why === 'string' ? q.why : undefined }] : []
})
/** Quiz me's JSON (companion `quiz`): its questions, or null while it is not whole. */
export function parsePhoneQuiz(text: string): QuizQuestion[] | null {
  const start = text.indexOf('{'), end = text.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as { questions?: unknown }
    const questions = quizQuestionsOf(Array.isArray(parsed.questions) ? parsed.questions : [])
    return questions.length ? questions : null
  } catch { return null }
}
/**
 * The questions whole so far in a quiz that is still being written (the stream): each `{…}` in the "questions" array
 * that has closed. The first question shows as soon as it is whole, not when the last one is (iPhone feedback,
 * 21 Oct 2026: Quiz me took long to arrive).
 */
export function parsePhoneQuizPartial(text: string): QuizQuestion[] {
  const key = /"questions"\s*:\s*\[/.exec(text)
  if (!key) return []
  const found: unknown[] = []
  let depth = 0, from = -1, inString = false, escaped = false
  for (let i = key.index + key[0].length; i < text.length; i++) {
    const c = text[i]
    if (inString) {
      if (escaped) escaped = false
      else if (c === '\\') escaped = true
      else if (c === '"') inString = false
      continue
    }
    if (c === '"') inString = true
    else if (c === '{') { if (depth++ === 0) from = i }
    else if (c === '}') {
      if (--depth === 0 && from >= 0) { try { found.push(JSON.parse(text.slice(from, i + 1))) } catch { /* not whole yet */ } from = -1 }
      if (depth < 0) break
    } else if (c === ']' && depth === 0) break
  }
  return quizQuestionsOf(found)
}
/** A marked answer (companion `quiz_check`). */
export function parsePhoneQuizMark(text: string): { verdict: 'right' | 'nearly' | 'not_yet'; feedback: string } | null {
  const start = text.indexOf('{'), end = text.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as { verdict?: unknown; feedback?: unknown }
    const verdict = parsed.verdict === 'right' || parsed.verdict === 'nearly' || parsed.verdict === 'not_yet' ? parsed.verdict : null
    return verdict ? { verdict, feedback: typeof parsed.feedback === 'string' ? parsed.feedback : '' } : null
  } catch { return null }
}

type QuizResult = { verdict: 'right' | 'nearly' | 'not_yet' | 'shown'; feedback: string }
const VERDICT_WORD: Record<QuizResult['verdict'], string> = { right: 'Right.', nearly: 'Nearly.', not_yet: 'Not yet.', shown: '' }

/** The questions a phone quiz asks (the companion may write more; the rest are not waited for). */
export const PHONE_QUIZ_LENGTH = 3

/**
 * Quiz me (the margin reader's quiz card): three questions, one at a time.
 * The reader answers in the field (marked by the companion) or shows the
 * answer, then goes on; the end line counts the right answers. The card opens
 * at once ("Writing questions…") and the first question shows as soon as it
 * is whole in the stream. The end ends with the follow-up field, as every card.
 */
export function PhoneQuizBody({ request, mark, draft, setDraft, onMic, micOn, inputRef, follow, thread, onComplete }: {
  request: (onDelta: (text: string) => void) => Promise<string>
  mark: (question: QuizQuestion, answer: string) => Promise<string>
  draft: string
  setDraft: (text: string) => void
  onMic?: () => void
  micOn?: boolean
  inputRef?: MutableRefObject<HTMLTextAreaElement | null>
  /** The end's follow-up field, given the quiz as text (its questions, answers and marks). */
  follow?: (summary: string) => ReactNode
  /** The follow-ups asked from the end and their answers. */
  thread?: ReactNode
  /** One completed result, after the reader has marked or revealed every question. */
  onComplete?: (summary: string) => void
}) {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null)
  const [status, setStatus] = useState<'loading' | 'streaming' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<(QuizResult | null)[]>([])
  const [marking, setMarking] = useState(false)
  const requestRef = useRef(request)
  requestRef.current = request
  useEffect(() => {
    let active = true
    let shown = 0
    setStatus('loading'); setQuestions(null); setIndex(0); setResults([])
    void requestRef.current(text => {
      if (!active) return
      const partial = parsePhoneQuizPartial(text).slice(0, PHONE_QUIZ_LENGTH)
      if (partial.length > shown) { shown = partial.length; setQuestions(partial); setStatus(partial.length >= PHONE_QUIZ_LENGTH ? 'ready' : 'streaming') }
    }).then(text => {
      if (!active) return
      const parsed = (parsePhoneQuiz(text) ?? parsePhoneQuizPartial(text)).slice(0, PHONE_QUIZ_LENGTH)
      if (parsed.length) { setQuestions(parsed); setStatus('ready') } else setStatus('error')
    }).catch(() => { if (active) setStatus(current => (current === 'streaming' || current === 'ready') && shown ? 'ready' : 'error') })
    return () => { active = false }
  }, [attempt])
  const writing = status === 'streaming'
  // While the quiz is still being written its length is the one it will have.
  const total = writing ? PHONE_QUIZ_LENGTH : questions?.length ?? 0
  const waitingNext = !!questions && writing && index >= questions.length
  const done = !!questions && !writing && index >= questions.length
  const result = results[index] ?? null
  const right = results.filter(item => item?.verdict === 'right').length
  const answered = results.filter(item => item && item.verdict !== 'shown').length
  const submit = (answer: string) => {
    const question = questions?.[index]
    if (!question || marking) return
    setMarking(true)
    void mark(question, answer).then(text => {
      const parsed = parsePhoneQuizMark(text)
      setResults(current => { const next = [...current]; next[index] = parsed ?? { verdict: 'nearly', feedback: '' }; return next })
      setDraft('')
    }).catch(() => {}).finally(() => setMarking(false))
  }
  const summary = () => (questions ?? []).map((question, i) => {
    const item = results[i]
    const mark = !item ? 'not answered' : item.verdict === 'shown' ? 'answer shown' : VERDICT_WORD[item.verdict].replace('.', '')
    return `${i + 1}. ${question.q}\nExpected: ${question.answer}${question.why ? ` ${question.why}` : ''}\nReader: ${mark}${item?.feedback ? `. ${item.feedback}` : ''}`
  }).join('\n\n')
  const completedAttempt = useRef(-1)
  useEffect(() => {
    if (!done || completedAttempt.current === attempt) return
    completedAttempt.current = attempt
    onComplete?.(summary())
  // Completion has one summary per attempt. A new callback does not resave it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, attempt])
  const body = status === 'loading' || waitingNext
    ? <div className="lab-pcard-quiz-writing" data-testid="lab-phone-quiz-writing"><p className="lab-pcard-status">Writing questions…</p><PhoneWait /></div>
    : status === 'error' || !questions ? <p className="lab-pcard-status"><button type="button" className="lab-pcard-link" data-testid="lab-phone-card-retry" onClick={() => setAttempt(value => value + 1)}>Retry</button></p>
    : done ? <div className="lab-pcard-answer"><p><strong className="lab-pcard-lead">{answered ? `${right} of ${answered}` : `${questions.length} of ${questions.length} shown`}</strong></p></div>
    : (
      <div className="lab-pcard-quiz" data-testid="lab-phone-quiz">
        <p className="lab-pcard-count">{index + 1} of {total}</p>
        <p className="lab-pcard-question" data-testid="lab-phone-quiz-question">{questions[index].q}</p>
        {result && <div className="lab-pcard-answer">
          {result.verdict === 'shown'
            ? <p><strong className="lab-pcard-lead">{questions[index].answer}</strong>{questions[index].why ? ` ${questions[index].why}` : ''}</p>
            : <p><strong className="lab-pcard-lead">{VERDICT_WORD[result.verdict]}</strong>{result.feedback ? ` ${result.feedback}` : ''}</p>}
        </div>}
        {marking && <PhoneWait />}
      </div>
    )
  const asking = (status === 'ready' || writing) && !!questions && index < questions.length
  return (
    <>
      <div className="lab-pcard-body-inner">
        {body}
        {done && thread}
      </div>
      {asking && (
        <div className="lab-pcard-quiz-foot">
          {!result
            ? <>
                <PhoneFollow value={draft} onChange={setDraft} onSend={submit} onMic={onMic} micOn={micOn} placeholder="Your answer" label="Your answer" inputRef={inputRef} disabled={marking} />
                <button type="button" className="lab-pcard-link" data-testid="lab-phone-quiz-show" onClick={() => setResults(current => { const next = [...current]; next[index] = { verdict: 'shown', feedback: '' }; return next })}>Show answer</button>
              </>
            : <button type="button" className="lab-pcard-link" data-testid="lab-phone-quiz-next" onClick={() => setIndex(value => value + 1)}>{index + 1 < total ? 'Next question →' : 'See your score →'}</button>}
        </div>
      )}
      {done && <div className="lab-pcard-quiz-foot">
        {follow?.(summary())}
        <button type="button" className="lab-pcard-link" data-testid="lab-phone-quiz-again" onClick={() => setAttempt(value => value + 1)}>Try another quiz</button>
      </div>}
    </>
  )
}

/** A note: the reader's words in an always editable field (the passage stays underlined on the page). */
export function PhoneNoteBody({ value, onChange, inputRef, chapter = false }: { value: string; onChange: (text: string) => void; inputRef?: MutableRefObject<HTMLTextAreaElement | null>; chapter?: boolean }) {
  const own = useRef<HTMLTextAreaElement | null>(null)
  const field = inputRef ?? own
  useEffect(() => {
    const el = field.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(72, el.scrollHeight)}px`
  }, [value, field])
  return (
    <>
      <textarea ref={field} className="lab-pcard-note" data-testid="lab-phone-card-note" rows={3} placeholder={chapter ? 'A note on this chapter' : 'Add a note…'} aria-label={chapter ? 'Chapter note' : 'Highlight note'}
        value={value} onChange={event => onChange(event.target.value)} />
    </>
  )
}

/** The room the call's status line, its controls and their gaps take under the orb in the Talk card. */
const TALK_BELOW_ORB_PX = 190
/**
 * Talk in the card: the call's own view, its orb sized from the card's box (not the window), so the orb, the
 * status line and the controls all show whole, the orb centred.
 */
export function PhoneTalkFrame({ children }: { children: (orbSize: number) => ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [orb, setOrb] = useState(120)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return
      setOrb(Math.round(Math.max(64, Math.min(176, width * 0.6, height - TALK_BELOW_ORB_PX))))
    }
    fit()
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null
    observer?.observe(el)
    return () => observer?.disconnect()
  }, [])
  return <div ref={ref} className="lab-pcard-talk" data-testid="lab-phone-talk" data-orb={orb}>{children(orb)}</div>
}
