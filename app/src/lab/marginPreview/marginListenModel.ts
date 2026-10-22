/**
 * Listen in the margin preview (Anders, 21 Oct 2026: "audio playback need to
 * work there too"). Pure parts: which narration the book reader would play
 * for the edition the preview shows, the audio place as the book reader's
 * place, and the snapshot the frame draws its controls from.
 *
 * The player itself is the book reader's (useLabListen), run in the page that
 * frames the preview (useMarginListen.ts); the frame (public/lab/addbook/js/
 * tinct-listen.js) only draws the controls and the follow highlight.
 */
import { editionHold } from '../../data/editionAvailability'
import { isAudioHeld } from '../../data/audioAvailability'
import { usesRetainedBella } from '../../narration/bellaRetention'
import { resolvedAudioIsAvailable } from '../../utils/audioEditionSelection'
import { narrationPilotApplies, resolveNarrationVoice, type NarrationPilotInfo } from '../labNarration'
import { effectiveLabAudioEdition, type LabPrefs } from '../labPrefs'
import type { LabBookPlace, LabPositionState } from '../labPosition'
import type { FollowTarget } from '../labFollow'
import type { Edition } from '../../types'

/** A place in the book as both readers name it: chapter number, paragraph index, word index. */
export interface MarginListenAt {
  chapterNumber: number
  paragraphIndex: number
  wordIndex: number
}

export interface MarginNarrationPlan {
  /** The on-demand narration voice (the Worker's /api/narration route), or null: no on-demand narration. */
  voice: string | null
  /** On-demand narration plays this edition's text. */
  narration: boolean
  /** The edition whose recordings play (the shown edition for narration, else the Kokoro audio edition). */
  audioEdition: string
  /** Nothing can play for this edition: Listen says so instead of starting. */
  unavailable: boolean
}

/**
 * The narration the book reader plays for this book, edition and chapter
 * (LabApp's narrationApplies / retainedBella / playbackUnavailable), so the
 * preview hears exactly what the book reader would.
 */
export function marginNarrationPlan(input: {
  bookId: string
  editions: Edition[]
  editionKey: string
  chapterNumber: number
  prefs: LabPrefs
  info: NarrationPilotInfo | null
  signedIn: boolean
}): MarginNarrationPlan {
  const { bookId, editions, editionKey, chapterNumber, info } = input
  const prefs = { ...input.prefs, primaryEdition: editionKey }
  const voice = info ? resolveNarrationVoice(prefs, info.voices, { signedIn: input.signedIn }) : null
  const narration = info?.enabled === true && voice != null
    && narrationPilotApplies(prefs, bookId, editionKey, chapterNumber, info.provider)
  const retainedBella = info?.provider !== 'grok' && usesRetainedBella(bookId, editionKey, prefs.voicePersona)
  const kokoro = effectiveLabAudioEdition(prefs, editions)
  const held = Boolean(editionHold(bookId, editionKey))
  const kokoroHeld = Boolean(editionHold(bookId, kokoro)) || isAudioHeld(bookId, kokoro, chapterNumber)
  const kokoroUnavailable = kokoroHeld || !resolvedAudioIsAvailable(kokoro, editionKey, editions)
  const unavailable = held || (info?.provider === 'grok' && editionKey.endsWith('-en')
    ? !narration
    : narration || retainedBella ? false : kokoroUnavailable)
  return {
    voice: narration ? voice : null,
    narration,
    audioEdition: narration || retainedBella ? editionKey : kokoro,
    unavailable,
  }
}

/**
 * The audio place, written as the book reader's place for this book on this
 * device (the position record the book reader opens at): where listening
 * stopped in the preview is where the book reader resumes. Nothing else in the
 * record changes. The edition's revision is kept only while the edition is the
 * same one; a page index is the book reader's own and is dropped.
 */
export function withAudioPlace(state: LabPositionState, input: {
  bookId: string
  editionKey: string
  at: MarginListenAt
  now: number
  deviceId: string
}): LabPositionState {
  const { bookId, editionKey, at, now, deviceId } = input
  const known = state.books[bookId]
  const sameEdition = known?.primaryEditionKey === editionKey
  const base: Partial<LabBookPlace> = known ? { ...known } : {}
  delete base.pageIndex
  if (!sameEdition) {
    delete base.contentRevision
    delete base.contentRecovery
    delete base.contentMigrationStatus
  }
  const place: LabBookPlace = {
    ...base,
    bookId,
    headerBook: known?.headerBook || bookId,
    chapterNumber: at.chapterNumber,
    sequentialChapter: at.chapterNumber,
    paragraphIndex: Math.max(0, Math.floor(at.paragraphIndex)),
    wordIndex: Math.max(0, Math.floor(at.wordIndex)),
    primaryEditionKey: editionKey,
    readerMode: known?.readerMode ?? 'read',
    updatedAt: Math.max(now, (known?.updatedAt ?? 0) + 1),
    deviceId,
    rev: (known?.rev ?? 0) + 1,
  }
  return {
    ...state,
    books: { ...state.books, [bookId]: place },
    lastSettledBookId: bookId,
    lastSettledAt: Math.max(now, state.lastSettledAt + 1),
    updatedAt: Math.max(now, state.updatedAt),
  }
}

/** The word being heard as a place, or null while nothing is heard yet. */
export function heardPlace(chapterNumber: number | null, follow: FollowTarget): MarginListenAt | null {
  if (chapterNumber == null) return null
  if (follow.kind === 'word') return { chapterNumber, paragraphIndex: follow.paragraphIndex, wordIndex: follow.wordIndex }
  if (follow.kind === 'paragraph') return { chapterNumber, paragraphIndex: follow.paragraphIndex, wordIndex: 0 }
  return null
}

export type MarginListenStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

/** What the frame draws: the top bar's Play, the transport and the highlight. Plain data, cloned across the frame. */
export interface MarginListenSnapshot {
  /** null until the narration configuration is known; false: this edition cannot be heard. */
  available: boolean | null
  status: MarginListenStatus
  playing: boolean
  /** Starting or preparing: the transport shows its loading ring. */
  pending: boolean
  buffering: boolean
  /** The transport is up (playing, starting, or paused with a recording loaded). */
  open: boolean
  speed: number
  chapterNumber: number | null
  chapterTitle: string
  /** The heard word (or paragraph, wordIndex null) in `chapterNumber`. */
  follow: { paragraphIndex: number; wordIndex: number | null; from?: number; to?: number } | null
  /** Seconds into the chapter and its length (estimated until every clip is known), at 1x. */
  chapterTime: number
  chapterDuration: number
  message: string | null
}

export function marginListenSnapshot(input: {
  available: boolean | null
  playing: boolean
  pending: boolean
  buffering: boolean
  hasSource: boolean
  speed: number
  chapterNumber: number | null
  chapterTitle: string
  follow: FollowTarget
  chapterTime: number
  chapterDuration: number
  narration: { status: 'idle' } | { status: 'loading' } | { status: 'error'; message: string }
  starting: boolean
  dismissed: boolean
}): MarginListenSnapshot {
  const error = input.narration.status === 'error' ? input.narration.message : null
  const pending = input.pending || input.starting || input.narration.status === 'loading'
  const status: MarginListenStatus = error ? 'error' : input.playing ? 'playing' : pending ? 'loading' : input.hasSource ? 'paused' : 'idle'
  const follow = input.follow.kind === 'word'
    ? { paragraphIndex: input.follow.paragraphIndex, wordIndex: input.follow.wordIndex, ...(input.follow.granularity === 'sentence' && input.follow.span ? { from: input.follow.span.from, to: input.follow.span.to } : {}) }
    : input.follow.kind === 'paragraph' ? { paragraphIndex: input.follow.paragraphIndex, wordIndex: null } : null
  return {
    available: input.available,
    status,
    playing: input.playing,
    pending,
    buffering: input.buffering,
    open: !input.dismissed && (input.playing || pending || input.hasSource || !!error),
    speed: input.speed,
    chapterNumber: input.chapterNumber,
    chapterTitle: input.chapterTitle,
    follow,
    chapterTime: input.chapterTime,
    chapterDuration: input.chapterDuration,
    message: error,
  }
}

/** Reading settings' Voice in the preview: the book reader's own choices (LabV2Sheet's voice row). */
export interface MarginVoiceChoices { value: string; options: Array<{ value: string; label: string }> }

export function marginVoiceChoices(prefs: Pick<LabPrefs, 'audiobookVoice' | 'voicePersona'>, provider: string | undefined): MarginVoiceChoices {
  if (provider !== 'grok') return { value: prefs.voicePersona, options: [{ value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }] }
  return {
    value: prefs.audiobookVoice || prefs.voicePersona,
    options: [
      { value: 'female', label: 'Ara · Female' },
      { value: 'male', label: 'Helios · Male' },
      { value: 'orion', label: 'Orion · Male' },
      { value: 'eve', label: 'Eve · Female' },
    ],
  }
}

/** The preferences with this voice chosen, as the book reader's voice row writes them. */
export function withMarginVoice<P extends LabPrefs>(prefs: P, value: string): P {
  if (value === 'orion' || value === 'eve') return { ...prefs, audiobookVoice: value, voicePersonaChosen: true }
  return { ...prefs, audiobookVoice: null, voicePersona: value === 'male' ? 'male' : 'female', voicePersonaChosen: true }
}
