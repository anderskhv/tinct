import { useCallback, useEffect, useRef, useState } from 'react'

type RecognitionResult = { isFinal: boolean; 0: { transcript: string } }
interface DictationRecognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onstart: (() => void) | null
  onresult: ((event: { results: ArrayLike<RecognitionResult> }) => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onend: (() => void) | null
}
type RecognitionWindow = { SpeechRecognition?: new () => DictationRecognition; webkitSpeechRecognition?: new () => DictationRecognition }

/** Dictation only edits the draft. It never sends a message or opens a call. */
export function useLabDictation(bookId: string, onDraft: (text: string) => void) {
  const [state, setState] = useState<'idle' | 'starting' | 'listening'>('idle')
  const [notice, setNotice] = useState<string | null>(null)
  const recognitionRef = useRef<DictationRecognition | null>(null)
  const onDraftRef = useRef(onDraft)
  onDraftRef.current = onDraft
  const stop = useCallback(() => {
    const recognition = recognitionRef.current
    recognitionRef.current = null
    if (recognition) {
      recognition.onstart = recognition.onresult = recognition.onerror = recognition.onend = null
      try { recognition.stop() } catch { /* already stopped */ }
    }
    setState('idle')
  }, [])
  useEffect(() => { stop(); setNotice(null); return stop }, [bookId, stop])
  const toggle = useCallback((draft: string) => {
    if (recognitionRef.current) { stop(); return }
    const host = window as unknown as RecognitionWindow
    const Recognition = host.SpeechRecognition || host.webkitSpeechRecognition
    if (!Recognition) { setNotice('Dictation is unavailable in this browser. Use your keyboard microphone or type your question.'); return }
    const recognition = new Recognition()
    recognitionRef.current = recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = navigator.language || 'en-US'
    const prefix = draft.trim()
    setNotice(null)
    setState('starting')
    recognition.onstart = () => { if (recognitionRef.current === recognition) setState('listening') }
    recognition.onresult = event => {
      if (recognitionRef.current !== recognition) return
      const text = Array.from(event.results).map(result => result[0].transcript.trim()).filter(Boolean).join(' ')
      onDraftRef.current([prefix, text].filter(Boolean).join(' '))
    }
    recognition.onerror = event => {
      if (recognitionRef.current !== recognition) return
      setNotice(event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'Microphone access was denied. Allow it in your browser to dictate.'
        : event.error === 'no-speech' ? 'No speech heard. Tap the microphone to try again.' : 'Dictation stopped. Tap the microphone to try again.')
      stop()
    }
    recognition.onend = () => { if (recognitionRef.current === recognition) stop() }
    try { recognition.start() } catch { stop(); setNotice('The microphone could not start. Please try again.') }
  }, [stop])
  return { state, notice, toggle, stop }
}
