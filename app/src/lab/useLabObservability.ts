import { useEffect, useRef } from 'react'
import { trackEvent, trackPageview } from '../utils/analytics'

export interface LabObservabilityInput {
  pathname: string
  layout: 'phone' | 'desktop'
  bookId: string
  chapterNumber: number
  pageIndex: number
  settledPageIndex: number | null
  totalPages: number
  listening: boolean
  voiceActive: boolean
  voicePhase: string
  turnCount: number
}

/** Passive product telemetry only; this hook never controls lab state. */
export function useLabObservability(input: LabObservabilityInput): void {
  const openedRef = useRef(false)
  const previousListening = useRef(input.listening)
  const previousVoice = useRef(input.voiceActive)
  const previousTurnCount = useRef(input.turnCount)

  useEffect(() => {
    void trackPageview(`${input.pathname}/${input.bookId}/${input.chapterNumber}`)
    void trackEvent(openedRef.current ? 'lab_chapter_opened' : 'lab_reader_opened', {
      book_id: input.bookId,
      chapter_number: input.chapterNumber,
      layout: input.layout,
    })
    openedRef.current = true
  }, [input.bookId, input.chapterNumber, input.layout, input.pathname])

  useEffect(() => {
    if (input.settledPageIndex == null || input.settledPageIndex !== input.pageIndex) return
    void trackEvent('lab_page_settled', {
      book_id: input.bookId,
      chapter_number: input.chapterNumber,
      page: input.pageIndex + 1,
      total_pages: input.totalPages,
      layout: input.layout,
    })
  }, [input.bookId, input.chapterNumber, input.layout, input.pageIndex, input.settledPageIndex, input.totalPages])

  useEffect(() => {
    if (previousListening.current === input.listening) return
    previousListening.current = input.listening
    void trackEvent(input.listening ? 'lab_listen_started' : 'lab_listen_stopped', {
      book_id: input.bookId,
      chapter_number: input.chapterNumber,
    })
  }, [input.bookId, input.chapterNumber, input.listening])

  useEffect(() => {
    if (previousVoice.current === input.voiceActive) return
    previousVoice.current = input.voiceActive
    void trackEvent(input.voiceActive ? 'lab_voice_started' : 'lab_voice_stopped', {
      book_id: input.bookId,
      chapter_number: input.chapterNumber,
      phase: input.voicePhase,
    })
  }, [input.bookId, input.chapterNumber, input.voiceActive, input.voicePhase])

  useEffect(() => {
    if (input.turnCount <= previousTurnCount.current) {
      previousTurnCount.current = input.turnCount
      return
    }
    previousTurnCount.current = input.turnCount
    void trackEvent('lab_ask_turn_completed', {
      book_id: input.bookId,
      chapter_number: input.chapterNumber,
      turn_count: input.turnCount,
    })
  }, [input.bookId, input.chapterNumber, input.turnCount])
}
