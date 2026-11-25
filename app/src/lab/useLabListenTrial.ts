import { useEffect, useRef } from 'react'
import { trackFunnel } from '../utils/funnel'
import { endsListeningSentence, tokenizeHearingWords } from './labHearing'
import { addListenTrialSeconds, listenTrialSeconds, listenTrialUsedToday, markListenTrialUsed, LISTEN_TRIAL_SECONDS } from './labListenTrial'

/** How often playback time is added to the day mark while audio plays. */
export const LISTEN_TRIAL_TICK_MS = 1000
/** At the limit, the sentence being read may finish; a sentence longer than this stops here. */
export const LISTEN_TRIAL_SENTENCE_GRACE_MS = 20_000

type Follow =
  | { kind: 'none' }
  | { kind: 'paragraph'; paragraphIndex: number }
  | { kind: 'word'; paragraphIndex: number; wordIndex: number }

export interface ListenTrialOptions {
  /** A signed-out reader on a book that can be heard: the trial counts. Signed in: nothing is counted. */
  active: boolean
  /** Audio is actually playing (not paused, preparing or buffering): only this time counts. */
  playing: boolean
  /** The word being read, to stop at the end of its sentence. */
  follow: Follow
  /** The paragraphs being heard (the follow's indexes point into them). */
  paragraphs: readonly string[]
  /** Five minutes are up and the sentence is read: pause and open the account sheet. */
  onEnd: () => void
  now?: () => number
}

/**
 * Counts a signed-out reader's playback against today's five minutes
 * (labListenTrial.ts) and, at the limit, lets the sentence being read finish
 * before `onEnd`. Playback that starts with today's trial already used ends
 * at once (a lock-screen Play reaches the player without the reader's button).
 */
export function useLabListenTrial({ active, playing, follow, paragraphs, onEnd, now = Date.now }: ListenTrialOptions): void {
  const onEndRef = useRef(onEnd)
  onEndRef.current = onEnd
  const nowRef = useRef(now)
  nowRef.current = now
  const endingRef = useRef(false)
  const endedRef = useRef(false)
  const graceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousFollowRef = useRef<Follow>({ kind: 'none' })

  const finish = useRef(() => {})
  finish.current = () => {
    if (endedRef.current) return
    endedRef.current = true
    endingRef.current = false
    if (graceRef.current) { clearTimeout(graceRef.current); graceRef.current = null }
    markListenTrialUsed(undefined, nowRef.current())
    trackFunnel('listen_trial_ended', { seconds: LISTEN_TRIAL_SECONDS })
    onEndRef.current()
  }

  const reachLimit = useRef(() => {})
  reachLimit.current = () => {
    if (endingRef.current || endedRef.current) return
    endingRef.current = true
    graceRef.current = setTimeout(() => finish.current(), LISTEN_TRIAL_SENTENCE_GRACE_MS)
  }

  useEffect(() => {
    if (!active) {
      // Signed in (or nothing to hear): a pending stop is called off.
      if (graceRef.current) { clearTimeout(graceRef.current); graceRef.current = null }
      endingRef.current = false
      return
    }
    if (!playing) {
      // Paused while the last sentence was being read: the trial ends here.
      if (endingRef.current) finish.current()
      return
    }
    const startedAt = nowRef.current()
    if (listenTrialUsedToday(undefined, startedAt)) {
      // A new Play after the trial ended (or another tab used it): no grace.
      endedRef.current = false
      finish.current()
      return
    }
    // A new day (or the first Play of the trial).
    endedRef.current = false
    if (listenTrialSeconds(undefined, startedAt) === 0) trackFunnel('listen_trial_started', { seconds: LISTEN_TRIAL_SECONDS })
    let last = startedAt
    const tick = () => {
      const at = nowRef.current()
      const total = addListenTrialSeconds((at - last) / 1000, undefined, at)
      last = at
      if (total >= LISTEN_TRIAL_SECONDS) reachLimit.current()
    }
    const timer = setInterval(tick, LISTEN_TRIAL_TICK_MS)
    return () => {
      clearInterval(timer)
      if (!endedRef.current) tick()
    }
  }, [active, playing])

  // At the limit: stop once the word being read has moved past a sentence's last word, or into another paragraph.
  useEffect(() => {
    const previous = previousFollowRef.current
    previousFollowRef.current = follow
    if (!endingRef.current || follow.kind === 'none' || previous.kind === 'none') return
    if (follow.paragraphIndex !== previous.paragraphIndex) { finish.current(); return }
    if (follow.kind !== 'word' || previous.kind !== 'word' || follow.wordIndex <= previous.wordIndex) return
    const words = tokenizeHearingWords(paragraphs[follow.paragraphIndex] ?? '')
    for (let index = previous.wordIndex; index < follow.wordIndex; index += 1) {
      if (words[index] && endsListeningSentence(words[index].text)) { finish.current(); return }
    }
  }, [follow, paragraphs])

  useEffect(() => () => { if (graceRef.current) clearTimeout(graceRef.current) }, [])
}
