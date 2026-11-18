import { useCallback, useEffect, useRef, useState } from 'react'
import { apiUrl } from '../utils/apiUrl'
import { internalTrafficHeaders } from '../utils/internalTraffic'

/**
 * Chat dictation. It only edits the draft: it never sends a message or opens a call.
 *
 * Signed in, the microphone records one clip with MediaRecorder while it is on;
 * stopping posts the clip to /api/dictation (xAI speech-to-text with the
 * book's names as vocabulary hints) and the text is added to the draft.
 * Signed out, or where MediaRecorder is missing, the browser's own speech
 * recognition is used as before, so no anonymous audio reaches Tinct.
 *
 * `stop()` cancels: a recording that has not been sent is discarded and a
 * transcription that comes back late is ignored. The mic toggle finishes.
 */
export type LabDictationState = 'idle' | 'starting' | 'listening' | 'transcribing'

export interface LabDictationOptions {
  /** True when the reader is signed in: dictation goes through xAI. */
  signedIn?: boolean
  /** Resolves the Supabase access token at upload time. */
  getAuthToken?: () => Promise<string | null | undefined> | string | null | undefined
  /** Vocabulary hints for the open book, read when the clip is sent. */
  getKeyterms?: () => string[]
  /** BCP-47 language of the edition; xAI defaults to English. */
  language?: string
}

/** The longest clip: recording finishes on its own after this. */
export const DICTATION_MAX_SECONDS = 60
/** Chrome and Firefox record Opus in WebM; Safari records AAC in MP4. xAI reads both. */
export const DICTATION_MIME_TYPES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'] as const

export const DICTATION_COPY = {
  unavailable: 'Dictation is unavailable in this browser. Use your keyboard microphone or type your question.',
  denied: 'Microphone access was denied. Allow it in your browser to dictate.',
  noSpeech: 'No speech heard. Tap the microphone to try again.',
  stopped: 'Dictation stopped. Tap the microphone to try again.',
  noStart: 'The microphone could not start. Please try again.',
  failed: 'Dictation could not be turned into text. Tap the microphone to try again.',
} as const

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

type Recording = {
  recorder: MediaRecorder
  stream: MediaStream
  chunks: Blob[]
  timer: ReturnType<typeof setTimeout> | null
  abort: AbortController
  prefix: string
}

export function pickDictationMimeType(): string | undefined {
  const Recorder = typeof MediaRecorder === 'undefined' ? undefined : MediaRecorder
  if (!Recorder || typeof Recorder.isTypeSupported !== 'function') return undefined
  return DICTATION_MIME_TYPES.find(type => { try { return Recorder.isTypeSupported(type) } catch { return false } })
}

function canRecord(): boolean {
  return typeof MediaRecorder !== 'undefined' && typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function'
}

function releaseStream(stream: MediaStream | null | undefined) {
  try { stream?.getTracks().forEach(track => track.stop()) } catch { /* already released */ }
}

export function useLabDictation(bookId: string, onDraft: (text: string) => void, options: LabDictationOptions = {}) {
  const [state, setState] = useState<LabDictationState>('idle')
  const [notice, setNotice] = useState<string | null>(null)
  const recognitionRef = useRef<DictationRecognition | null>(null)
  const recordingRef = useRef<Recording | null>(null)
  // Every start or stop moves the session on; anything from an older session is ignored.
  const sessionRef = useRef(0)
  const onDraftRef = useRef(onDraft)
  onDraftRef.current = onDraft
  const optionsRef = useRef(options)
  optionsRef.current = options
  const bookIdRef = useRef(bookId)
  bookIdRef.current = bookId

  const stop = useCallback(() => {
    sessionRef.current += 1
    const recognition = recognitionRef.current
    recognitionRef.current = null
    if (recognition) {
      recognition.onstart = recognition.onresult = recognition.onerror = recognition.onend = null
      try { recognition.stop() } catch { /* already stopped */ }
    }
    const recording = recordingRef.current
    recordingRef.current = null
    if (recording) {
      if (recording.timer) clearTimeout(recording.timer)
      recording.recorder.ondataavailable = recording.recorder.onstop = recording.recorder.onerror = recording.recorder.onstart = null
      try { if (recording.recorder.state !== 'inactive') recording.recorder.stop() } catch { /* already stopped */ }
      releaseStream(recording.stream)
      recording.abort.abort()
    }
    setState('idle')
  }, [])
  useEffect(() => { stop(); setNotice(null); return stop }, [bookId, stop])

  const transcribe = useCallback(async (session: number, recording: Recording, blob: Blob) => {
    const current = () => sessionRef.current === session
    const fail = (message: string) => {
      if (!current()) return
      recordingRef.current = null
      setNotice(message)
      setState('idle')
    }
    if (!blob.size) { fail(DICTATION_COPY.noSpeech); return }
    try {
      const opts = optionsRef.current
      const token = await opts.getAuthToken?.()
      if (!current()) return
      if (!token) { fail(DICTATION_COPY.failed); return }
      const form = new FormData()
      form.append('language', opts.language || 'en')
      const keyterms = opts.getKeyterms?.() ?? []
      if (keyterms.length) form.append('keyterms', JSON.stringify(keyterms))
      form.append('bookId', bookIdRef.current)
      form.append('audio', blob, 'dictation')
      const response = await fetch(apiUrl('/api/dictation'), {
        method: 'POST',
        body: form,
        headers: { ...internalTrafficHeaders(), Authorization: `Bearer ${token}` },
        signal: recording.abort.signal,
      })
      const data = await response.json().catch(() => ({})) as { text?: unknown }
      if (!current()) return
      if (!response.ok || typeof data.text !== 'string') { fail(DICTATION_COPY.failed); return }
      const text = data.text.trim()
      if (!text) { fail(DICTATION_COPY.noSpeech); return }
      recordingRef.current = null
      onDraftRef.current([recording.prefix, text].filter(Boolean).join(' '))
      setState('idle')
    } catch {
      fail(DICTATION_COPY.failed)
    }
  }, [])

  const finishRecording = useCallback(() => {
    const recording = recordingRef.current
    if (!recording || recording.recorder.state === 'inactive') return
    if (recording.timer) { clearTimeout(recording.timer); recording.timer = null }
    setState('transcribing')
    try {
      // The final chunk and then `onstop` follow, which sends the clip.
      recording.recorder.stop()
    } catch {
      stop()
      setNotice(DICTATION_COPY.stopped)
    }
  }, [stop])

  const startRecording = useCallback((prefix: string) => {
    const session = ++sessionRef.current
    setNotice(null)
    setState('starting')
    void (async () => {
      let stream: MediaStream | null = null
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (error) {
        if (sessionRef.current !== session) return
        const name = error && typeof error === 'object' && 'name' in error ? String((error as { name?: unknown }).name) : ''
        setNotice(name === 'NotAllowedError' || name === 'SecurityError' ? DICTATION_COPY.denied : DICTATION_COPY.noStart)
        setState('idle')
        return
      }
      if (sessionRef.current !== session) { releaseStream(stream); return }
      let recorder: MediaRecorder
      try {
        const mimeType = pickDictationMimeType()
        recorder = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 32_000 })
      } catch {
        releaseStream(stream)
        setNotice(DICTATION_COPY.noStart)
        setState('idle')
        return
      }
      const recording: Recording = { recorder, stream, chunks: [], timer: null, abort: new AbortController(), prefix }
      recordingRef.current = recording
      recorder.ondataavailable = event => { if (event.data && event.data.size) recording.chunks.push(event.data) }
      recorder.onstart = () => { if (sessionRef.current === session) setState('listening') }
      recorder.onerror = () => {
        if (sessionRef.current !== session) return
        stop()
        setNotice(DICTATION_COPY.stopped)
      }
      recorder.onstop = () => {
        releaseStream(recording.stream)
        if (sessionRef.current !== session) return
        const type = recorder.mimeType || recording.chunks[0]?.type || 'audio/webm'
        void transcribe(session, recording, new Blob(recording.chunks, { type }))
      }
      recording.timer = setTimeout(() => { if (sessionRef.current === session) finishRecording() }, DICTATION_MAX_SECONDS * 1000)
      try { recorder.start() } catch { stop(); setNotice(DICTATION_COPY.noStart) }
    })()
  }, [finishRecording, stop, transcribe])

  const startRecognition = useCallback((prefix: string) => {
    const host = window as unknown as RecognitionWindow
    const Recognition = host.SpeechRecognition || host.webkitSpeechRecognition
    if (!Recognition) { setNotice(DICTATION_COPY.unavailable); return }
    sessionRef.current += 1
    const recognition = new Recognition()
    recognitionRef.current = recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = navigator.language || 'en-US'
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
        ? DICTATION_COPY.denied
        : event.error === 'no-speech' ? DICTATION_COPY.noSpeech : DICTATION_COPY.stopped)
      stop()
    }
    recognition.onend = () => { if (recognitionRef.current === recognition) stop() }
    try { recognition.start() } catch { stop(); setNotice(DICTATION_COPY.noStart) }
  }, [stop])

  const toggle = useCallback((draft: string) => {
    if (recognitionRef.current) { stop(); return }
    if (recordingRef.current) {
      // Recording: the mic button finishes and sends. While it is being
      // transcribed there is nothing more to finish.
      if (recordingRef.current.recorder.state === 'recording') finishRecording()
      return
    }
    // The microphone is still being opened: tapping again cancels.
    if (state === 'starting') { stop(); return }
    const prefix = draft.trim()
    if (optionsRef.current.signedIn && canRecord()) startRecording(prefix)
    else startRecognition(prefix)
  }, [finishRecording, startRecognition, startRecording, state, stop])

  return { state, notice, toggle, stop }
}
