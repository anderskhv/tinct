import { fetchExplainResponse } from './explainFetch'
import { parseContextualLookup } from '../components/reader/contextualLookup'
import type { CompanionRequest } from '../companion/companionRequest'
import { withAuthorship, type Authorship } from '../companion/authorship'
import { LAB_VOICE_HISTORY_INSTRUCTIONS, PERSONAL_HISTORY_TOOL, personalHistoryEvidence, requestsPersonalHistory } from './labPersonalHistory'
import { CHAPTER_CHAT_MESSAGES, chapterChatHistoryContent, loadChapterChatTarget, type ChapterChatRequest } from './labChapterChat'
import { VOICE_RESEARCH_TOOL, researchVoiceQuestion, voiceSourceLinks, type VoiceSource } from './labVoiceResearch'
import { labVoiceRequestsAudio } from './labVoiceControls'
import { BOOK_PASSAGE_TOOL, buildLabTalkReference, retrieveVoicePassage } from './labDirectVoice'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChatMessage } from '../types'
import { useAuth } from '../hooks/useAuth'
import { useTinctVoiceTools } from '../hooks/useTinctVoiceTools'
import { useVoiceSession } from '../hooks/useVoiceSession'
import { COMPANION_MODEL } from '../companionModel'
import { apiUrl } from '../utils/apiUrl'
import { trackEvent } from '../utils/analytics'
import { trackFunnel, trackFunnelOnce } from '../utils/funnel'
import { migrateWithheldEdition } from '../data/withheldEditions'
import type { TinctVoiceToolAdapter } from '../voice/tinctTools'
import {
  affirmativeAnswersLookupOffer,
  applyLabVoiceTurn,
  isResumeListenCommand,
  typedTextAsksToMove,
  LAB_VOICE_TOOLS,
  labConversationState,
  labReadingAngle,
  labTypedPace,
  labTypedResume,
  labTypedSkip,
  labTypedSpeed,
  separateShownExplanations,
  type AssistantPace,
  ASSISTANT_PACE_SPEED,
  clampTalkSpeed,
  type LabAskContext,
  type LabAskTurn,
  type LabPlaybackSkip,
} from './labAsk'
import {
  LabChatError,
  labChatErrorType,
  readAnthropicResponse,
} from './labCompanion'
import { buildLabReadingTrail, openingLineOf, recordTrailVisit, type LabReadingTrailEntry, type LabTrailVisit } from './labReadingTrail'
import { labConversationStateV2 } from './labVoiceV2'
import type { LabVoiceVersion } from './labRoute'
import { readSupabaseAccessToken, resolveLabVoiceToken } from './labAuth'
import { LAB_COPY } from './labCopy'
import { gateLabAiAction, markTalkTrialUsed, talkTrialUsedToday, type LabAccountPromptRequest, type LabAiAction } from './labAccountPrompt'
import { dumpLabTalkTurns, fetchLabChatHistoryCloud, LAB_CHAT_BOOK_ID } from './labTalkHistory'
import {
  appendLabChatTurn,
  appendLabChatTurnTo,
  createLabChatCloudWriter,
  LAB_CHAT_COMMIT_COALESCE_MS,
  labChatHistoryKey,
  createLabChatHistoryCloud,
  mergeChatConversations,
  migrateLegacyLabChatHistoryCloud,
  migrateLegacyLabChatHistoryLocal,
  readLabBookChat,
  writeLabBookChat,
  reconcileTurns,
  turnsFromConversations,
} from './labChatHistory'
import type { ChatConversation } from '../types'
import {
  labVoiceActionEntry,
  mergeLabVoiceTools,
  shouldResumePlaybackAfterNavigation,
  type LabPlaybackNavigationOutcome,
  type LabVoiceActionEntry,
  type LabVoiceViewSnapshot,
} from './labVoiceControls'
import { internalTrafficHeaders } from '../utils/internalTraffic'
import { isUserBookId } from './userBook/userBookId'
import { chapterWindow, passageWindow } from './userBook/userBookContext'
import { catalogueCardConversation, upsertCatalogueCard, tombstoneCatalogueCard, type SharedReaderCard } from './sharedReader/sharedReaderCards'
import type { OwnTextCardsSync } from './userBook/ownTextCardsSync'

let labAskId = 0
/** Visible + focus fire together on a tab switch; one refresh serves both. */
export const LAB_CHAT_REFRESH_DEBOUNCE_MS = 400
/**
 * Explain gives up after this long without progress (response headers or new
 * text). A normal answer starts within a few seconds; the Worker bounds its
 * own upstream waits at 30 s, which is too long to stare at a skeleton.
 */
export const EXPLAIN_STALL_MS = 20_000

function nextId() {
  return `lab_ask_${Date.now()}_${++labAskId}`
}

/** What a question carries beside its text: a highlighted passage, or a figure's picture. */
export interface LabAskAttachment {
  conversationId?: string
  highlightedText?: string
  onAccepted?: () => void
  /** The picture to send with the question (signed in only), drawn as the companion takes pictures. */
  image?: () => Promise<unknown | null>
}

export interface UseLabAskOptions {
  bookTitle: string
  bookAuthor: string
  /** An essay collection's or anthology's authorship at a chapter (companion/authorship.ts); absent for one author's book. Keep it stable. */
  authorshipOf?: (chapterNumber: number | undefined) => Authorship | undefined
  /** Biblical book / registry title; display only. History is keyed by `bookId`. */
  headerBook?: string
  chapterLabel: string
  chapterNumber?: number
  editionLabel?: string
  paragraphs: string[]
  paragraphIndex: number
  authToken?: string | null
  /** Signed-in override (host / tests). Defaults to a live token or a likely Supabase session. */
  signedIn?: boolean
  /** The account policy held back an anonymous reader's AI action; the host shows the sheet. The turn is not sent. */
  onAccountPrompt?: (request: LabAccountPromptRequest) => void
  /**
   * A signed-out guest's Talk trial ran out mid-call (two minutes). The host
   * closes the call and shows the account sheet; without it, the sheet alone.
   */
  onTalkTrialEnded?: () => void
  /** Registry book id + edition key. Both present → requests carry `book` and the worker can read other chapters. */
  bookId?: string
  /** Explicit V2 continuation chosen in contents; never a cross-book thread. */
  conversationId?: string | null
  editionKey?: string
  /** Signed-in user id for the versioned cloud row; defaults to the live Supabase user. `null` = signed out. */
  userId?: string | null
  /** Owner-qualified private Talk mirror and source-word cards. */
  ownCardController?: OwnTextCardsSync | null
  /** Shared private entry fails closed when owner storage cannot be verified. */
  privateChatGuard?: boolean
  /** A shared-reader card needs an end-turn response before it can be saved. */
  sharedReader?: boolean
  chapterCount?: number
  /** Rendered page for the trail's "Now:" line; read at send time. */
  getPage?: () => { pageNumber: number; totalPages: number } | null
  /** True when opening this companion paused a playing audiobook (the session started from playback). */
  playbackInterrupted?: () => boolean
  onResumeListen?: (forceAudio?: boolean) => void
  onSetPlaybackSpeed?: (rate: number) => void
  onPlaybackSkip?: (kind: LabPlaybackSkip) => void | LabPlaybackNavigationOutcome | Promise<void | LabPlaybackNavigationOutcome>
  voiceToolAdapter: TinctVoiceToolAdapter<LabVoiceViewSnapshot>
  onVoiceToolAction?: (entry: LabVoiceActionEntry) => void
  onVoiceToolSessionStart?: () => void
  /** `'v2'` only from `/reader?voice=v2` and Chrome V2. Defaults to Voice V1. */
  voiceVersion?: LabVoiceVersion
  voicePersona?: 'female' | 'male'
  /** Talk's saved speaking speed (0.7-1.5). The host persists changes. */
  talkSpeed?: number
  /** A new Talk speed, from the control or a spoken / typed pace request. */
  onTalkSpeedChange?: (speed: number) => void
  /** Load Talk's session code now (default); the reader waits for its first page. */
  voiceWarm?: boolean
}

export { LAB_EXPLAIN_PROMPT } from '../companion/companionRequest'

export function useLabAsk(options: UseLabAskOptions) {
  const { session, likelyAuthenticated } = useAuth()
  const voiceVersion: LabVoiceVersion = options.voiceVersion === 'v2' ? 'v2' : 'v1'
  const isVoiceV2 = voiceVersion === 'v2'
  // History is one row per registry book, shared with the classic reader
  // (`chat-history:{bookId}`). The Bible is one book, as in the registry.
  const chatBookId = options.bookId || ''
  const privateBook = isUserBookId(chatBookId)
  const readBookChat = (bookId: string) => options.privateChatGuard && isUserBookId(bookId)
    ? options.ownCardController?.read() ?? [] : readLabBookChat(bookId)
  const [typedLoading, setTypedLoading] = useState(false)
  /** What the companion is looking up before its answer begins ("Reading Jeremiah 32…"), or null. */
  const [typedStatus, setTypedStatus] = useState<string | null>(null)
  const [historyStatus, setHistoryStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')
  // `conversations` is this book's stored history (classic shape, for the
  // chapter picker); `turns` is the displayed thread: the stored history on
  // open, then the live turns as they stream. Storage writes run alongside.
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    migrateLegacyLabChatHistoryLocal()
    return readBookChat(chatBookId)
  })
  const [turns, setTurns] = useState<LabAskTurn[]>(() => turnsFromConversations(conversations))
  // The thread as this page last knew it, for recordTurn: a turn whose local
  // write failed must still be in the value the next turn commits.
  const conversationsRef = useRef(conversations)
  const loadedForBookRef = useRef(chatBookId)
  if (loadedForBookRef.current !== chatBookId) {
    loadedForBookRef.current = chatBookId
    const stored = readBookChat(chatBookId)
    const hydrated = turnsFromConversations(stored)
    conversationsRef.current = stored
    setConversations(stored)
    setTurns(hydrated)
    dumpLabTalkTurns(hydrated)
  }
  const [notice, setNotice] = useState<string | null>(null)
  const dismissNotice = useCallback(() => setNotice(null), [])
  const [starting, setStarting] = useState(false)
  const voiceStartRequestRef = useRef(0)
  // A Talk start still awaiting its token or session when the reader unmounts ends as cancelled, never setting state after.
  useEffect(() => () => { voiceStartRequestRef.current++ }, [])
  /** The guest trial was refused or ran out: the account sheet, not a failure notice. */
  const guestTrialClosedRef = useRef(false)
  // Talk's speaking speed: the host's saved value when it keeps one, else
  // this hook's own. Every change lands in both and reaches the live session.
  const [localTalkSpeed, setLocalTalkSpeed] = useState(() => clampTalkSpeed(options.talkSpeed ?? 1))
  const talkSpeed = options.talkSpeed != null ? clampTalkSpeed(options.talkSpeed) : localTalkSpeed
  const rememberTalkSpeed = useCallback((speed: number) => {
    const next = clampTalkSpeed(speed)
    setLocalTalkSpeed(next)
    optionsRef.current.onTalkSpeedChange?.(next)
    return next
  }, [])
  const rememberAssistantPace = useCallback((pace: AssistantPace) => { rememberTalkSpeed(ASSISTANT_PACE_SPEED[pace]) }, [rememberTalkSpeed])
  const sendingRef = useRef(false)
  const gatedChapterRef = useRef<ChapterChatRequest | undefined>(undefined)
  const [failedTyped, setFailedTyped] = useState<{
    text: string
    chapterRequest?: ChapterChatRequest
    context: LabAskContext
    userTurn: LabAskTurn
    attachment?: LabAskAttachment
  } | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options
  useEffect(() => {
    const controller = options.ownCardController
    if (!controller || !privateBook) return
    const receive = (rows: ChatConversation[]) => {
      conversationsRef.current = rows
      setConversations(rows)
      setTurns(current => reconcileTurns(current, turnsFromConversations(rows)))
    }
    receive(controller.read())
    return controller.subscribe(receive)
  }, [options.ownCardController, privateBook])
  const chatBookIdRef = useRef(chatBookId)
  chatBookIdRef.current = chatBookId

  const sessionToken = session?.access_token ?? null
  const viewerId = options.userId !== undefined ? options.userId : (session?.user?.id ?? null)
  const viewerRef = useRef(viewerId)
  viewerRef.current = viewerId
  // What this page holds belongs to the account it was had under: another
  // account starts from its own device copy, never from this one's turns.
  const baseViewerRef = useRef(viewerId)
  if (baseViewerRef.current !== viewerId) {
    baseViewerRef.current = viewerId
    conversationsRef.current = readBookChat(chatBookId)
  }

  // Chapters the reader visited during this session, with their opening
  // lines, for the companion's reading trail. Read-only observation of the
  // rendered tuple; nothing here changes position logic.
  const trailVisitsRef = useRef<LabTrailVisit[]>([])
  const trailBookRef = useRef(options.bookId)
  if (trailBookRef.current !== options.bookId) {
    trailBookRef.current = options.bookId
    trailVisitsRef.current = []
  }
  useEffect(() => {
    if (options.chapterNumber == null || options.paragraphs.length === 0) return
    trailVisitsRef.current = recordTrailVisit(trailVisitsRef.current, {
      chapterNumber: options.chapterNumber,
      label: options.chapterLabel,
      openingLine: openingLineOf(options.paragraphs),
      at: Date.now(),
    })
  }, [options.bookId, options.chapterNumber, options.chapterLabel, options.paragraphs])

  const readTrail = useCallback(async (): Promise<LabReadingTrailEntry[]> => {
    const current = optionsRef.current
    if (!current.bookId || !current.editionKey || isUserBookId(current.bookId)) return []
    try {
      return await buildLabReadingTrail({
        bookId: current.bookId,
        editionKey: migrateWithheldEdition(current.bookId, current.editionKey),
        currentChapter: current.chapterNumber,
        visits: trailVisitsRef.current,
        viewer: viewerId,
      })
    } catch {
      return []
    }
  }, [viewerId])

  /**
   * Warm the trail's opening-line cache when the chat pane opens, so the
   * first question's trail is usually ready at once. Read-only; the send
   * still builds its own trail from the state at that moment.
   */
  const warmTrail = useCallback(() => { void readTrail() }, [readTrail])

  // A reader's own book sends a window around the place, or the (capped)
  // chapter for a question about the whole chapter (userBook/userBookContext.ts).
  const wholeChapterRef = useRef(false)
  const askContextNow = useCallback((readingTrail: LabReadingTrailEntry[]): LabAskContext => {
    const current = optionsRef.current
    const page = current.getPage?.() ?? null
    const scoped = privateBook
      ? (wholeChapterRef.current ? chapterWindow : passageWindow)(current.paragraphs, current.paragraphIndex)
      : { paragraphs: current.paragraphs, paragraphIndex: current.paragraphIndex }
    return {
      bookTitle: current.bookTitle,
      bookAuthor: current.bookAuthor,
      ...withAuthorship(current.authorshipOf?.(current.chapterNumber)),
      chapterLabel: current.chapterLabel,
      chapterNumber: current.chapterNumber,
      editionLabel: current.editionLabel,
      paragraphs: scoped.paragraphs,
      paragraphIndex: scoped.paragraphIndex,
      readingAngle: labReadingAngle(),
      // A reader's own book is named by its text only: no id, no edition, so
      // the Worker never looks it up (or meters it) and answers from the
      // paragraphs sent here, as Add a book does.
      bookId: privateBook ? undefined : current.bookId,
      // Last line of defence: whatever the reader carries, a withdrawn edition
      // never leaves the client. The worker cannot retrieve text for one, and
      // the failed tool round is what kills the whole answer.
      editionKey: privateBook ? undefined : current.bookId && current.editionKey
        ? migrateWithheldEdition(current.bookId, current.editionKey)
        : current.editionKey,
      chapterCount: current.chapterCount,
      pageNumber: page?.pageNumber,
      totalPages: page?.totalPages,
      readingTrail,
    }
  }, [privateBook])
  const liveToken = options.authToken !== undefined ? options.authToken : sessionToken
  const signedIn = options.signedIn ?? (Boolean(liveToken) || likelyAuthenticated)
  // Account policy (labAccountPrompt.ts), in one place, before any network
  // call or mic session: an anonymous reader gets ten free AI interactions,
  // chat and voice spending the same allowance, and the eleventh shows the
  // account sheet and is not sent. Signed in: never gated.
  const gateAiAction = useCallback((action: LabAiAction, text?: string): boolean => {
    const decision = gateLabAiAction({ signedIn })
    if (!decision.allowed) optionsRef.current.onAccountPrompt?.({ action, text })
    return decision.allowed
  }, [signedIn])
  // Signed in: the same versioned `user_data` row the classic reader
  // writes (commit_user_data with an expected rev). One writer per account.
  const cloudWriter = useMemo(() => {
    if (!viewerId || privateBook) return null
    const cloud = createLabChatHistoryCloud(viewerId)
    return cloud ? createLabChatCloudWriter(cloud, undefined, { coalesceMs: LAB_CHAT_COMMIT_COALESCE_MS }) : null
  }, [viewerId, privateBook])
  const cloudWriterRef = useRef(cloudWriter)
  cloudWriterRef.current = cloudWriter
  // Turns waiting for their shared commit leave with the page: hide, pagehide,
  // and the writer being replaced (account change) or unmounted.
  useEffect(() => {
    if (!cloudWriter) return
    const flush = () => cloudWriter.flush()
    const onVisibility = () => { if (document.visibilityState === 'hidden') flush() }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [cloudWriter])

  const voiceSourcesRef = useRef<VoiceSource[]>([])
  const voiceResearchTurnRef = useRef(0)
  const withVoiceSources = (message: ChatMessage): ChatMessage => {
    const links = message.role === 'assistant' && message.source === 'voice' ? voiceSourceLinks(voiceSourcesRef.current) : ''
    return links ? { ...message, content: `${message.content}\n\nSources: ${links}` } : message
  }

  /** Record a finalized turn: local mirror first, then the cloud row when signed in. */
  const recordTurn = useCallback((message: ChatMessage, chapterNumber: number, paragraphIndex?: number, conversationId = optionsRef.current.conversationId) => {
    const bookId = chatBookIdRef.current
    if (!bookId || (message.bookId && message.bookId !== bookId && !(message.bookId === 'lab' && message.source === 'voice'))) return
    const owned = optionsRef.current.ownCardController
    if (isUserBookId(bookId) && optionsRef.current.privateChatGuard && !owned?.isTrusted()) return
    const base = loadedForBookRef.current === bookId ? conversationsRef.current : undefined
    const next = owned && isUserBookId(bookId)
      ? appendLabChatTurnTo(base ?? owned.read(), bookId, withVoiceSources(message), chapterNumber, paragraphIndex, conversationId || undefined)
      : appendLabChatTurn(bookId, withVoiceSources(message), chapterNumber, paragraphIndex, conversationId || undefined, base)
    if (owned && isUserBookId(bookId) && !owned.persist(next)) {
      setNotice('This reply could not be saved on this device. Copy it before leaving the reader.')
      return
    }
    if (loadedForBookRef.current === bookId) {
      conversationsRef.current = next
      setConversations(next)
    }
    // A turn the device could not store (a full localStorage on a phone) has
    // no other copy: it goes to the account row at once.
    let stored = false
    try { stored = localStorage.getItem(`tinct:${labChatHistoryKey(bookId)}`) === JSON.stringify(next) } catch { stored = false }
    cloudWriterRef.current?.push(bookId, next, { now: !stored })
  }, [])

  /** Cards share this hook's local mirror and cloud writer with ordinary chat turns. */
  const storeCardHistory = useCallback((bookId: string, next: ChatConversation[], retainUnsaved = false) => {
    if (bookId !== chatBookIdRef.current) return false
    // The local writer rejects mixed-book rows. Apply the same boundary before
    // retaining an unsaved value or offering it to the account writer.
    if (next.some(row => row.bookId !== bookId || row.messages.some(message => message.bookId && message.bookId !== bookId))) return false
    const owned = optionsRef.current.ownCardController
    if (isUserBookId(bookId) && optionsRef.current.privateChatGuard && !owned?.isTrusted()) return false
    let saved = false
    if (owned && isUserBookId(bookId)) saved = owned.persist(next)
    else {
      writeLabBookChat(bookId, next)
      try { saved = localStorage.getItem(`tinct:${labChatHistoryKey(bookId)}`) === JSON.stringify(next) } catch { saved = false }
    }
    if (!saved && !retainUnsaved) {
      setNotice('This card could not be saved on this device. Copy it before leaving the reader.')
      return false
    }
    // A completed catalogue answer still belongs in this page's history when
    // storage is full. Like ordinary turns, offer its only copy to the account
    // writer immediately. Neither memory nor a queued write proves it is saved.
    // saveCard's caller owns the contextual failure notice; delete/undo keep
    // their prior state on failure and use the hook notice above.
    conversationsRef.current = next
    loadedForBookRef.current = bookId
    setConversations(next)
    cloudWriterRef.current?.push(bookId, next, { now: !saved })
    return saved
  }, [])
  const saveCard = useCallback((card: SharedReaderCard): boolean => {
    const bookId = chatBookIdRef.current
    const owned = optionsRef.current.ownCardController
    if (owned && card.source.kind === 'own-text' && card.source.bookId === bookId) {
      const next = owned.saveCard(card)
      if (!next) return false
      conversationsRef.current = next; setConversations(next)
      return true
    }
    if (card.source.kind !== 'catalogue' || card.source.bookId !== bookId || !bookId || isUserBookId(bookId) || !catalogueCardConversation(card)) return false
    const current = loadedForBookRef.current === bookId ? conversationsRef.current : readBookChat(bookId)
    const next = upsertCatalogueCard(current, card)
    if (!next.some(item => item.card?.id === card.id && !item.card.gone && item.card.u >= card.u)) return false
    // An identical in-memory card may be a failed write. Retry persistence
    // instead of reporting success merely because the upsert was a no-op.
    return storeCardHistory(bookId, next, true)
  }, [storeCardHistory])
  const revealConversation = useCallback((id: string) => {
    const row = conversationsRef.current.find(item => item.id === id && item.bookId === chatBookIdRef.current)
    if (!row) return null
    setTurns(current => reconcileTurns(current, turnsFromConversations([row])))
    return row
  }, [])
  const deleteCard = useCallback((conversationId: string): (() => boolean) | null => {
    const bookId = chatBookIdRef.current
    const owned = optionsRef.current.ownCardController
    if (owned && isUserBookId(bookId)) return owned.deleteCard(conversationId)
    if (!bookId || isUserBookId(bookId)) return null
    const current = loadedForBookRef.current === bookId ? conversationsRef.current : readBookChat(bookId)
    const prior = current.find(item => item.id === conversationId && item.card && !item.card.gone)
    if (!prior?.card) return null
    const next = tombstoneCatalogueCard(current, prior.card.id, Date.now())
    if (next === current) return null
    if (!storeCardHistory(bookId, next)) return null
    return () => {
      if (bookId !== chatBookIdRef.current) return false
      const now = loadedForBookRef.current === bookId ? conversationsRef.current : readBookChat(bookId)
      const deleted = now.find(item => item.id === conversationId)
      const { gone: _gone, ...card } = prior.card!
      const restored = mergeChatConversations(now, [{ ...prior, card: { ...card, u: Math.max(Date.now(), (deleted?.card?.u || 0) + 1) } }])
      return storeCardHistory(bookId, restored)
    }
  }, [storeCardHistory])

  // Open / sign-in / book change: fold the retired KV blob in once per
  // account, then merge this book's cloud row with the local mirror. The
  // same refresh runs again whenever the tab comes back (visible, focus,
  // online), so turns another device committed meanwhile appear without a
  // reload. Bursts of those events coalesce into one refresh; one arriving
  // while a refresh is in flight runs once more after it. Every cloud call
  // is time-bounded (labChatHistory.ts), so the guard can never stick.
  useEffect(() => {
    if (!viewerId || !cloudWriter || !chatBookId) { setHistoryStatus('ready'); return }
    let cancelled = false
    let running = false
    let again = false
    let debounce: ReturnType<typeof setTimeout> | undefined
    // Only the first read for this book and account is "loading" (the device
    // copy on screen may be months old). A refresh when the tab comes back is
    // quiet: the thread stays as it is and only gains what is new.
    let first = true
    const run = async (): Promise<void> => {
      if (cancelled) return
      if (running) { again = true; return }
      running = true
      try {
      if (first) setHistoryStatus('loading')
      first = false
      await migrateLegacyLabChatHistoryCloud({
        userId: viewerId,
        fetchLegacy: () => fetchLabChatHistoryCloud(liveToken),
      })
      if (cancelled) return
      let unavailable = false
      const merged = await cloudWriter.sync(chatBookId, () => { unavailable = true }, () => !cancelled)
      if (cancelled || loadedForBookRef.current !== chatBookId) return
      setHistoryStatus(unavailable ? 'unavailable' : 'ready')
      // Never lose what this page holds that the read did not (a turn saved
      // after the read began, or one whose save failed).
      const kept = mergeChatConversations(merged, conversationsRef.current)
      conversationsRef.current = kept
      setConversations(kept)
      const hydrated = turnsFromConversations(kept)
      // A reply still streaming (not stored yet) survives the re-hydration,
      // and every turn keeps its place by time: a read never reorders the thread.
      setTurns((current) => {
        const next = reconcileTurns(current, hydrated)
        dumpLabTalkTurns(next)
        return next
      })
      } finally {
        running = false
        if (again && !cancelled) { again = false; void run().catch(failed) }
      }
    }
    const failed = () => { if (!cancelled) setHistoryStatus('unavailable') }
    void run().catch(failed)
    const onOnline = () => {
      clearTimeout(debounce)
      debounce = setTimeout(() => { void run().catch(failed) }, LAB_CHAT_REFRESH_DEBOUNCE_MS)
    }
    const onVisible = () => { if (document.visibilityState === 'visible') onOnline() }
    window.addEventListener('online', onOnline)
    window.addEventListener('focus', onVisible)
    window.addEventListener('pageshow', onVisible)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      clearTimeout(debounce)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('focus', onVisible)
      window.removeEventListener('pageshow', onVisible)
      document.removeEventListener('visibilitychange', onVisible)
    }
    // liveToken only feeds the one-time legacy fetch; a token refresh must not re-sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatBookId, cloudWriter, viewerId])

  /** The reader's edition, with any withdrawn edition already resolved to its successor. */
  const askEditionKey = options.bookId && options.editionKey
    ? migrateWithheldEdition(options.bookId, options.editionKey)
    : options.editionKey
  const askContext = useMemo(() => ({
    bookTitle: options.bookTitle,
    bookAuthor: options.bookAuthor,
    ...withAuthorship(options.authorshipOf?.(options.chapterNumber)),
    chapterLabel: options.chapterLabel,
    chapterNumber: options.chapterNumber,
    editionLabel: options.editionLabel,
    paragraphs: options.paragraphs,
    paragraphIndex: options.paragraphIndex,
    readingAngle: labReadingAngle(),
    bookId: privateBook ? undefined : options.bookId,
    editionKey: privateBook ? undefined : askEditionKey,
  }), [
    privateBook,
    options.bookAuthor,
    options.authorshipOf,
    options.bookTitle,
    options.chapterLabel,
    options.chapterNumber,
    options.editionLabel,
    options.paragraphIndex,
    options.paragraphs,
    options.bookId,
    options.editionKey,
  ])
  const selectedConversationTurns = useMemo(() => {
    const selected = options.conversationId ? conversations.find(item => item.id === options.conversationId && item.bookId === chatBookId) : null
    return selected ? turnsFromConversations([selected]) : null
  }, [options.conversationId, conversations, chatBookId])
  // Reference material only: the Tinct prompt itself lives in grokConfig.ts.
  const talkReference = useMemo(
    () => buildLabTalkReference(askContext,
      (selectedConversationTurns ?? turns).map(turn => ({ ...turn, content: chapterChatHistoryContent(turn) })),
    ),
    [askContext, selectedConversationTurns, turns],
  )
  const tinctVoiceTools = useTinctVoiceTools(options.voiceToolAdapter)
  const mergedVoiceTools = useMemo(
    () => mergeLabVoiceTools([...LAB_VOICE_TOOLS.filter(tool => tool.name !== 'ask_companion'), BOOK_PASSAGE_TOOL, VOICE_RESEARCH_TOOL, PERSONAL_HISTORY_TOOL]).map(tool =>
      tool && typeof tool === 'object' && 'name' in tool && tool.name === 'resume_audiobook'
        ? { ...tool, description: 'Return the reader to the book. Call for "back to the book", "resume", "continue reading" or "play the audiobook"; not for a bare thanks.', parameters: { type: 'object', properties: { play_audio: { type: 'boolean', description: 'True for an explicit request to play or resume audio. False to return to the page and restore its previous mode.' } }, required: ['play_audio'], additionalProperties: false } }
        : tool),
    [],
  )

  const onTinctVoiceTool = useCallback(async (
    name: string,
    arguments_: Record<string, unknown>,
    callId: string,
  ) => {
    if (name === 'search_personal_reading_history') {
      return { output: { evidence: await personalHistoryEvidence(String(arguments_.query || ''), viewerId ?? null, { openBookId: optionsRef.current.bookId }) }, responseInstructions: LAB_VOICE_HISTORY_INSTRUCTIONS }
    }
    if (name === 'search_reading_sources') {
      const turn = voiceResearchTurnRef.current
      const bookId = optionsRef.current.bookId
      const token = await resolveLabVoiceToken({ override: optionsRef.current.authToken, sessionToken, readSession: readSupabaseAccessToken })
      const result = await researchVoiceQuestion(arguments_.query, token)
      if (turn !== voiceResearchTurnRef.current || bookId !== optionsRef.current.bookId) {
        return { output: { ok: false, reason: 'superseded_question' }, responseInstructions: 'This search belongs to an earlier question. Do not answer it or say source links were added to chat. Follow the current question instead.' }
      }
      if (result.sources) voiceSourcesRef.current = result.sources
      return result
    }
    if (name === 'get_book_passage') {
      return retrieveVoicePassage(askContextNow(await readTrail()), arguments_)
    }
    const result = await tinctVoiceTools.onTool(name, arguments_, callId)
    optionsRef.current.onVoiceToolAction?.(labVoiceActionEntry(name, arguments_, callId, result))
    return result
  }, [tinctVoiceTools.onTool, askContextNow, readTrail, sessionToken, viewerId])

  const lastVoiceRequestRef = useRef('')
  const appendLocalMessage = useCallback((message: ChatMessage) => {
    if (message.role === 'user') {
      voiceResearchTurnRef.current += 1
      voiceSourcesRef.current = []
    }
    const content = (withVoiceSources(message).content || '').trim()
    if (!content) return
    if (message.role === 'user') lastVoiceRequestRef.current = content
    // Both Live and Realtime own command execution. A transcript must not
    // tear down the transport before the matching tool has run.
    const incoming: LabAskTurn = {
      id: message.id || nextId(),
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content,
      source: 'voice',
      timestamp: message.timestamp,
      chapterNumber: message.chapterNumber ?? optionsRef.current.chapterNumber,
      paragraphIndex: message.paragraphIndex ?? optionsRef.current.paragraphIndex,
      cancelled: message.isComplete === false,
    }
    setTurns(current => {
      const next = applyLabVoiceTurn(current, incoming)
      dumpLabTalkTurns(next)
      return next
    })
  }, [])

  // Same hook as App.tsx + AudioStrip. Lab supplies its own instructions
  // so production buildVoiceInstructions stays the in-car brief.
  const voice = useVoiceSession({
    authToken: liveToken,
    isAnonymous: !liveToken,
    // Signed out: the guest Talk trial (one a day, two minutes, through Tinct's relay).
    labGuest: !signedIn,
    // A reader's own book: the id stays on this device (turns are recorded
    // under it locally; the Talk usage report drops it), no edition key goes
    // out, and the session hears only the passage on screen (buildVoiceReaderContext
    // and buildLabTalkReference window it), exactly as Talk on any book.
    bookId: options.bookId || LAB_CHAT_BOOK_ID,
    editionKey: privateBook ? undefined : askEditionKey, editionLabel: options.editionLabel,
    bookTitle: options.bookTitle,
    bookAuthor: options.bookAuthor,
    authorship: askContext.authorship,
    chapterNumber: options.chapterNumber ?? 1,
    chapterTitle: options.chapterLabel,
    readingObjective: labReadingAngle(),
    chapterParagraphs: options.paragraphs,
    paragraphIndex: options.paragraphIndex,
    visibleText: '',
    isAudioPlaying: false,
    pausePlayback: () => null,
    resumePlayback: (_anchor, playAudio) => {
      setNotice(null)
      optionsRef.current.onResumeListen?.(playAudio ?? (isVoiceV2 ? labVoiceRequestsAudio(lastVoiceRequestRef.current) : true))
    },
    onEndConversation: () => optionsRef.current.onResumeListen?.(false),
    recordMessage: recordTurn,
    appendLocalMessage,
    // A guest's trial is its own allowance (one call, two minutes); its turns
    // do not spend the ten free typed actions.
    onBeforeUserTurn: () => (signedIn ? gateAiAction('voice') : true),
    onGuestTrial: (event) => {
      markTalkTrialUsed()
      if (event === 'started') return
      guestTrialClosedRef.current = true
      if (event === 'ended' && optionsRef.current.onTalkTrialEnded) optionsRef.current.onTalkTrialEnded()
      else optionsRef.current.onAccountPrompt?.({ action: 'voice' })
    },
    onNeedAuth: () => setNotice(LAB_COPY.signInVoice),
    onInsufficientBalance: () => setNotice(LAB_COPY.balanceEmpty),
    mode: 'conversation',
    reference: talkReference,
    tools: mergedVoiceTools,
    onApplicationTool: onTinctVoiceTool,
    onSessionStart: () => {
      tinctVoiceTools.resetUndo()
      optionsRef.current.onVoiceToolSessionStart?.()
    },
    setPlaybackSpeed: (rate) => optionsRef.current.onSetPlaybackSpeed?.(rate),
    skipPlayback: (kind) => optionsRef.current.onPlaybackSkip?.(kind),
    assistantSpeed: talkSpeed,
    onSetAssistantPace: rememberAssistantPace,
    voicePersona: options.voicePersona,
    // A signed-out reader downloads Talk's code only when they try it.
    warm: (options.voiceWarm ?? true) && signedIn,
  })

  // Voice V2: a mid-session failure is shown, not swallowed. The notice
  // clears the moment the reader starts a new turn. V1 keeps its own path.
  useEffect(() => {
    if (!isVoiceV2) return
    if (voice.activity === 'speaking') setNotice(null)
    else if (voice.error) setNotice(voice.error)
  }, [isVoiceV2, voice.error, voice.activity])
  useEffect(() => {
    if (!isVoiceV2 || (!voice.userSpeechStarted && voice.activity !== 'speaking')) return
    setNotice(null)
  }, [isVoiceV2, voice.userSpeechStarted, voice.activity])

  // Talk started a frame after the tap (from Explain, chapter notes, Catch me
  // up) asks for the microphone in the tap itself; startVoice takes it.
  const primeVoice = useCallback(() => {
    if (voice.isActive || starting || (!signedIn && talkTrialUsedToday())) return
    voice.prime()
  }, [signedIn, starting, voice.isActive, voice.prime])

  const startVoice = useCallback(async (greeting?: string): Promise<boolean | 'cancelled'> => {
    if (voice.isActive || starting) return true
    // Signed out: one guest Talk trial a day on this device (the Worker holds
    // the same line per IP). Used today, the host shows the account sheet (or,
    // with no host, the sign-in notice); no session is requested.
    if (!signedIn && talkTrialUsedToday()) {
      voice.releasePrimed()
      if (optionsRef.current.onAccountPrompt) optionsRef.current.onAccountPrompt({ action: 'voice' })
      else setNotice(LAB_COPY.signInVoice)
      return false
    }
    if (signedIn) {
      trackFunnelOnce('ai_first_use', { signed_in: true, feature: 'talk' })
      trackFunnel('member_ai_use', { feature: 'talk' })
    } else {
      trackFunnelOnce('ai_first_use', { signed_in: false, feature: 'talk' })
    }
    const request = ++voiceStartRequestRef.current
    guestTrialClosedRef.current = false
    // In the tap, before any await (the session token, Talk's code): the
    // microphone request and the audio unlock (useVoiceSession.prime).
    voice.prime()
    setNotice(null)
    if (!signedIn) {
      setStarting(true)
      const snapshot = await voice.start({ authToken: null, greeting })
      if (request !== voiceStartRequestRef.current) return 'cancelled'
      setStarting(false)
      // Refused by the Worker (today's trial used here): the sheet is the answer.
      if (guestTrialClosedRef.current) return false
      if (snapshot.error) { setNotice(snapshot.error); return false }
      if (!snapshot.isActive) { setNotice(current => current || LAB_COPY.voiceStartFailed); return false }
      return true
    }
    const knownToken = options.authToken !== undefined ? options.authToken : sessionToken
    if (knownToken) setStarting(true)
    const authToken = await resolveLabVoiceToken({
      override: options.authToken,
      sessionToken,
      readSession: readSupabaseAccessToken,
    })
    if (request !== voiceStartRequestRef.current) { voice.releasePrimed(); return 'cancelled' }
    if (!knownToken) setStarting(true)
    const snapshot = await voice.start({ authToken, greeting })
    if (request !== voiceStartRequestRef.current) return 'cancelled'
    setStarting(false)
    if (snapshot.error) {
      setNotice(snapshot.error)
      return false
    }
    if (!snapshot.isActive) {
      setNotice(current => current || LAB_COPY.voiceStartFailed)
      return false
    }
    return true
  }, [signedIn, options.authToken, sessionToken, starting, voice.isActive, voice.start, voice.prime, voice.releasePrimed])

  const stopVoice = useCallback(() => {
    voiceStartRequestRef.current++
    setStarting(false)
    voice.releasePrimed(true)
    voice.stop()
  }, [voice.stop, voice.releasePrimed])

  const failStart = useCallback((message?: string) => {
    voiceStartRequestRef.current++
    setStarting(false)
    voice.releasePrimed()
    voice.stop()
    setNotice(current => current || message || LAB_COPY.voiceStartFailed)
  }, [voice.stop, voice.releasePrimed])

  const toggleInChatVoice = useCallback(async () => {
    if (voice.isActive || starting) {
      stopVoice()
      return
    }
    await startVoice()
  }, [startVoice, starting, stopVoice, voice.isActive])

  const sendTyped = useCallback(async (
    content: string,
    chapterRequest?: ChapterChatRequest,
    retry?: { context: LabAskContext; userTurn: LabAskTurn; attachment?: LabAskAttachment },
    attachment?: LabAskAttachment,
  ) => {
    const text = content.trim()
    const gated = gatedChapterRef.current
    if (!chapterRequest && gated && gated.action.bookId === chatBookIdRef.current
      && text === CHAPTER_CHAT_MESSAGES[gated.action.kind]) chapterRequest = gated
    const requestBookId = chapterRequest?.action.bookId ?? retry?.userTurn.bookId ?? chatBookIdRef.current
    if (!text || sendingRef.current || requestBookId !== chatBookIdRef.current) return
    const requestConversationId = retry?.userTurn.conversationId ?? attachment?.conversationId ?? optionsRef.current.conversationId ?? null
    const discussion = requestConversationId ? conversationsRef.current.find(row => row.id === requestConversationId && row.bookId === requestBookId) : null
    const currentContext = askContextNow([])
    // Discussing saved work must not move the reader or attach an unrelated
    // currently open chapter as if it were the historical passage's context.
    const discussionContext = discussion && discussion.chapterNumber !== currentContext.chapterNumber
      ? { ...currentContext, chapterNumber: discussion.chapterNumber, chapterLabel: `Chapter ${discussion.chapterNumber}`,
          paragraphIndex: discussion.paragraphIndex ?? 0, paragraphs: [] }
      : currentContext
    const requestContext = chapterRequest?.context ?? retry?.context ?? discussionContext
    const requestChapter = requestContext.chapterNumber ?? 1
    const requestParagraph = requestContext.paragraphIndex
    const stillHere = () => requestBookId === chatBookIdRef.current && viewerId === viewerRef.current
    if (!chapterRequest && isResumeListenCommand(text)) {
      options.onResumeListen?.()
      return
    }
    // A retry is the same question again, not a new one. The account policy
    // already allowed this turn and it never produced an answer; spending one
    // of an anonymous reader's free actions on a request that failed sends
    // "Try again" into the account sheet instead of the network, with the
    // failure notice still on screen — the panel looks broken rather than
    // gated, and on the last free action it can never recover.
    if (!retry && !gateAiAction('chat', text)) { gatedChapterRef.current = chapterRequest; return }
    gatedChapterRef.current = undefined
    sendingRef.current = true
    setTypedLoading(true)
    setTypedStatus(null)
    setFailedTyped(null)

    const userTurn: LabAskTurn = retry?.userTurn ?? {
      bookId: requestBookId,
      conversationId: requestConversationId,
      chapterAction: chapterRequest?.action,
      id: nextId(),
      role: 'user',
      content: text,
      source: 'typed',
      timestamp: Date.now(),
      chapterNumber: requestChapter,
      paragraphIndex: requestParagraph,
      highlightedText: attachment?.highlightedText,
    }
    if (!retry) {
      setTurns(current => {
        if (!stillHere()) return current
        const next = [...current, userTurn]
        dumpLabTalkTurns(next)
        return next
      })
      recordTurn({
        id: userTurn.id,
        role: 'user',
        content: text,
        timestamp: Date.now(),
        bookId: requestBookId,
        chapterNumber: requestChapter,
        isComplete: true,
        source: 'text',
        highlightedText: userTurn.highlightedText,
        chapterAction: chapterRequest?.action,
      }, requestChapter, requestParagraph, requestConversationId)
    }
    if (!retry) attachment?.onAccepted?.()
    setNotice(null)

    const fail = (message: string, detail?: { type: string; status?: number; attempts?: number; partial?: boolean }) => {
      if (!stillHere()) return
      setNotice(message)
      setFailedTyped({ text, chapterRequest, context: requestContext, userTurn, attachment: attachment ?? retry?.attachment })
      if (detail) void trackEvent('chat_request_failed', {
        book_id: requestBookId,
        chapter_number: requestChapter,
        failure_type: detail.type,
        http_status: detail.status ?? null,
        attempts: detail.attempts ?? 1,
        had_partial_answer: detail.partial === true,
      }, viewerId)
    }
    // The reading trail and any personal-history evidence are read-only and do
    // not depend on the account token or the chapter target, so they start
    // now, alongside those steps, instead of after them: the question no
    // longer waits for the trail's opening-line deadline in series.
    const trailPromise = chapterRequest ? undefined : readTrail()
    const personalPromise = !chapterRequest && requestsPersonalHistory(text)
      ? personalHistoryEvidence(text, viewerId ?? null, { openBookId: optionsRef.current.bookId })
      : undefined
    // Awaited below; a send that ends early must not leave an unhandled rejection.
    personalPromise?.catch(() => {})
    try {
      let chapterTarget: string[] | undefined
      if (chapterRequest) {
        try { chapterTarget = await loadChapterChatTarget(chapterRequest) }
        catch { fail('Couldn’t load the chapter. Please try again.'); return }
      }
      if (!stillHere()) return
      const authToken = await resolveLabVoiceToken({ override: options.authToken, sessionToken, readSession: readSupabaseAccessToken })
      if (!stillHere()) return
      const selected = requestConversationId ? conversations.find(item => item.id === requestConversationId && item.bookId === chatBookIdRef.current) : null
      const contextTurns = selected ? turnsFromConversations([selected]) : requestConversationId ? turns.filter(turn => turn.conversationId === requestConversationId) : turns
      const previousAssistant = [...contextTurns].reverse().find(turn => turn.role === 'assistant' && !turn.cancelled)?.content ?? null
      // "Yes!!" after "we could go back a few chapters and have a look?" is
      // consent to the lookup. The model gets the tools; the app ignores any
      // move or resume marker it might still emit for that turn.
      const lookupConsent = affirmativeAnswersLookupOffer(text, previousAssistant)
      // The companion's window stays the last 20 turns; only the displayed history grew.
      const windowTurns = [...(chapterRequest && chapterRequest.action.kind !== 'discuss' ? [] : contextTurns.filter(turn => turn.id !== userTurn.id)), userTurn]
        .slice(-20)
      // A kept quick-model explanation goes to typed chat as unverified
      // context the reader was shown, not as the companion's own answer.
      const shownSplit = chapterRequest ? null : separateShownExplanations(windowTurns)
      const history = (shownSplit ? shownSplit.turns : windowTurns)
        .map(turn => {
          const historicalLocation = turn.id !== userTurn.id && turn.chapterNumber != null && turn.chapterNumber !== requestChapter
            ? `\n\n[Historical message location, not the current reading position: chapter ${turn.chapterNumber}.]` : ''
          const content = (turn.id === userTurn.id ? turn.content : chapterChatHistoryContent(turn)) + historicalLocation
          return {
            role: turn.role,
            content: turn.role === 'user' && turn.highlightedText
              ? `[The reader highlighted this passage:\n${turn.highlightedText}]\n\n${content}`
              : content,
          }
        })
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...internalTrafficHeaders(),
      }
      if (authToken) headers.Authorization = `Bearer ${authToken}`
      const context = { ...requestContext, readingTrail: trailPromise ? await trailPromise : undefined }
      const personalEvidence = personalPromise ? await personalPromise : ''
      if (!stillHere()) return
      let assistantId = nextId()
      // Structured context only: the Worker builds the prompt from it.
      const companion: CompanionRequest = chapterRequest
        ? {
            intent: 'chapter',
            context,
            chapter: {
              action: chapterRequest.action,
              ...(chapterRequest.action.kind === 'prepare' ? { target: chapterTarget } : {}),
              ...(chapterRequest.activity ? { activity: chapterRequest.activity } : {}),
            },
          }
        : {
            intent: 'ask',
            context: { ...context, ...(personalEvidence ? { personalHistory: personalEvidence } : {}) },
            ...(shownSplit?.shown.length ? { shownExplanations: shownSplit.shown } : {}),
          }
      const messages: Array<{ role: string; content: string | unknown[] }> = history.map((message, index) => index === history.length - 1 && !chapterRequest ? { ...message, content: `[Current reading location for this question: ${context.bookTitle}, ${context.chapterLabel}, edition ${context.editionLabel || context.editionKey}. Historical messages do not change this location.]\n\n${message.content}` } : message)
      // A figure asked about goes with the question, signed in only (the
      // Worker's picture path: images in the latest user turn; chatImages.ts).
      // Signed out the companion has its caption, in the highlighted text.
      const attached = attachment ?? retry?.attachment
      if (authToken && attached?.image && messages.length) {
        const block = await attached.image().catch(() => null)
        if (!stillHere()) return
        const last = messages[messages.length - 1]
        if (block) messages[messages.length - 1] = { ...last, content: [block, { type: 'text', text: String(last.content) }] }
      }
      const body = JSON.stringify({
        stream: true,
        companion,
        messages,
      })
      let rawReply = ''
      let firstFailureType: string | null = null
      for (let attempt = 1; attempt <= 2; attempt++) {
        let accumulated = ''
        try {
          const response = await fetch(apiUrl(authToken ? '/api/chat' : '/api/lab-chat'), { method: 'POST', headers, body })
          if (!stillHere()) return
          if (response.status === 401) {
            fail(authToken ? LAB_COPY.signInAsk : LAB_COPY.askUnavailable, { type: 'authentication', status: 401, attempts: attempt })
            return
          }
          if (response.status === 402) {
            fail(LAB_COPY.balanceEmpty, { type: 'insufficient_balance', status: 402, attempts: attempt })
            return
          }
          if (!response.ok) {
            const data = await response.json().catch(() => ({})) as { error?: { message?: string; type?: string } | string }
            const type = typeof data.error === 'object' && data.error?.type ? data.error.type : `http_${response.status}`
            const message = type === 'ai_resting' ? LAB_COPY.aiResting
              : typeof data.error === 'string' ? data.error : data.error?.message || LAB_COPY.askUnavailable
            if (attempt === 1 && (response.status === 502 || response.status === 504)) { firstFailureType = type; continue }
            fail(message, { type, status: response.status, attempts: attempt })
            return
          }
          rawReply = await readAnthropicResponse(response, (next) => {
            accumulated = next
            const content = next.trim()
            if (!content || !stillHere()) return
            setTypedStatus(null)
            setTurns(current => {
              if (!stillHere()) return current
              // By id, not "the last turn": a refresh may have added turns meanwhile.
              const at = current.findIndex(turn => turn.id === assistantId)
              const nextTurns = at >= 0
                ? current.map((turn, index) => (index === at ? { ...turn, content } : turn))
                : [...current, {
                    bookId: requestBookId,
                    chapterAction: chapterRequest?.action,
                    conversationId: requestConversationId,
                    id: assistantId,
                    role: 'assistant' as const,
                    content,
                    source: 'typed' as const,
                    // When it began: an answer that never finishes still keeps its place.
                    timestamp: Date.now(),
                    chapterNumber: requestChapter,
                    paragraphIndex: requestParagraph,
                  }]
              dumpLabTalkTurns(nextTurns)
              return nextTurns
            })
          }, { onStatus: status => { if (stillHere() && !accumulated.trim()) setTypedStatus(status) } })
          if (attempt === 2 && firstFailureType) void trackEvent('chat_request_recovered', {
            book_id: requestBookId,
            chapter_number: requestChapter,
            first_failure_type: firstFailureType,
            attempts: 2,
          }, viewerId)
          break
        } catch (error) {
          const type = error instanceof LabChatError ? error.type : 'network_error'
          // No answer was displayed or charged, so retry the same persisted
          // reader turn once. Never replay a partial answer: that could create
          // duplicate prose or a second billable provider completion.
          if (attempt === 1 && !accumulated.trim()) { firstFailureType = type; continue }
          fail(error instanceof LabChatError ? error.message : LAB_COPY.askUnavailable, {
            type,
            attempts: attempt,
            partial: Boolean(accumulated.trim()),
          })
          return
        }
      }
      if (!stillHere()) return
      const resumed = labTypedResume(rawReply)
      const parsed = labTypedSpeed(resumed.text)
      const paced = labTypedPace(parsed.text)
      const skipped = labTypedSkip(paced.text)
      if (skipped.text) {
        const assistantTurn: LabAskTurn = {
          bookId: requestBookId,
          chapterAction: chapterRequest?.action,
          conversationId: requestConversationId,
          id: assistantId || nextId(),
          role: 'assistant',
          content: skipped.text,
          source: 'typed',
          timestamp: Date.now(),
          chapterNumber: requestChapter,
          paragraphIndex: requestParagraph,
        }
        setTurns(current => {
          if (!stillHere()) return current
          const at = current.findIndex(turn => turn.id === assistantTurn.id)
          const next = at >= 0
            ? current.map((turn, index) => (index === at ? assistantTurn : turn))
            : [...current, assistantTurn]
          dumpLabTalkTurns(next)
          return next
        })
        recordTurn({
          id: assistantTurn.id,
          role: 'assistant',
          content: skipped.text,
          timestamp: Date.now(),
          bookId: requestBookId,
          chapterNumber: requestChapter,
          isComplete: true,
          source: 'text',
          chapterAction: chapterRequest?.action,
        }, requestChapter, requestParagraph, requestConversationId)
      }
      if (!chapterRequest && parsed.speed != null) {
        optionsRef.current.onSetPlaybackSpeed?.(parsed.speed)
      }
      if (!chapterRequest && paced.pace) {
        rememberAssistantPace(paced.pace)
        voice.setAssistantPace(paced.pace)
      }
      const skip = (lookupConsent || chapterRequest || !typedTextAsksToMove(text)) ? null : skipped.skip
      const resume = (lookupConsent || chapterRequest) ? false : resumed.resume
      let resumeAfterNavigation = false
      if (skip) {
        // A move opens the reader at the new place. It plays only when this
        // companion session began from playback or the reader asked to hear
        // the book; a move made to look something up never starts audio.
        const outcome = await optionsRef.current.onPlaybackSkip?.(skip)
        resumeAfterNavigation = outcome && typeof outcome === 'object'
          ? outcome.resumePlayback
          : shouldResumePlaybackAfterNavigation({
              sessionStartedFromPlayback: optionsRef.current.playbackInterrupted?.() === true,
              explicitPlayRequest: resume,
            })
      }
      if (resume || resumeAfterNavigation) {
        // Let a chapter skip commit (header + listen chapter) before Play.
        window.setTimeout(() => optionsRef.current.onResumeListen?.(), 0)
      }
    } catch (error) {
      fail(error instanceof LabChatError ? error.message : LAB_COPY.askUnavailable)
    } finally {
      sendingRef.current = false
      setTypedLoading(false)
      setTypedStatus(null)
    }
  }, [askContextNow, gateAiAction, options.authToken, options.conversationId, options.chapterNumber, options.paragraphIndex, readTrail, recordTurn, sessionToken, turns, conversations, viewerId])

  const recordedExplanationsRef = useRef(new Set<string>())
  const keepExplanation = useCallback((passage: string, answer: string, paragraphIndex: number, origin?: { bookId: string; chapterNumber: number }) => {
    if (!answer.trim()) return
    if (origin && (origin.bookId !== chatBookIdRef.current || origin.chapterNumber !== optionsRef.current.chapterNumber)) return
    const bookId = chatBookIdRef.current
    const chapterNumber = optionsRef.current.chapterNumber ?? 1
    const identity = JSON.stringify([viewerRef.current, bookId, chapterNumber, paragraphIndex, passage, answer])
    if (recordedExplanationsRef.current.has(identity)) return
    recordedExplanationsRef.current.add(identity)
    const timestamp = Date.now()
    const added: LabAskTurn[] = [
      { id: nextId(), bookId, chapterNumber, paragraphIndex, timestamp, role: 'user', source: 'typed', content: 'Explain this passage.', highlightedText: passage, shownExplanation: true },
      { id: nextId(), bookId, chapterNumber, paragraphIndex, timestamp: timestamp + 1, role: 'assistant', source: 'typed', content: answer, shownExplanation: true },
    ]
    setTurns(current => [...current, ...added])
    for (const turn of added) recordTurn({ ...turn, timestamp: turn.timestamp!, source: 'text', isComplete: true }, chapterNumber, paragraphIndex)
  }, [recordTurn])

  const explanationRef = useRef<{ key: string; time: number; text: string; promise: Promise<string>; listeners: Set<(text: string) => void>; speculative: boolean; abort: AbortController } | null>(null)
  /** Drop a prefetch nobody asked to see: the popup closed on Highlight,
   *  Copy or a dismiss. A fetch the reader did open is left to finish. */
  const discardSpeculativeExplanation = useCallback(() => {
    const entry = explanationRef.current
    if (!entry || !entry.speculative) return
    entry.abort.abort()
    explanationRef.current = null
  }, [])
  const explainSelection = useCallback(async (input: {
    text: string
    editionKey: string
    editionLabel?: string
    paragraphs: string[]
    paragraphIndex: number
    chapterNumber?: number
    chapterLabel?: string
    speculative?: boolean
    /**
     * Define, or one of the margin's passage actions on the same routes (the phone's
     * margin mode, marginPhone/): Simplify, Fact-check, Counterpoint, Quiz me (no text:
     * the whole chapter) and a quiz answer marked (`quiz`).
     */
    intent?: 'define' | 'simplify' | 'factcheck' | 'counterpoint' | 'quiz' | 'quiz_check'
    quiz?: { question: string; expected: string; why?: string; answer: string; turns?: import('../companion/companionRequest').QuizTurn[] }
  }, onDelta: (text: string) => void): Promise<string> => {
    const text = input.text.trim()
    const textless = input.intent === 'quiz' || input.intent === 'quiz_check'
    if ((!text && !textless) || (input.speculative && !signedIn)) throw new LabChatError('unavailable')
    const requestBookId = chatBookIdRef.current
    const requestChapter = input.chapterNumber ?? optionsRef.current.chapterNumber
    const key = JSON.stringify([viewerId, COMPANION_MODEL, labReadingAngle(), requestBookId, requestChapter, input.editionKey, input.paragraphIndex, input.paragraphs, text, input.intent, input.quiz])
    const cached = explanationRef.current
    if (cached?.key === key && Date.now() - cached.time < 60_000) {
      // The reader asked for it: this is the moment the action is charged,
      // whether or not the answer was already fetched on speculation.
      if (!input.speculative && cached.speculative) {
        if (!gateAiAction('chat')) throw new LabChatError('unavailable')
        cached.speculative = false
      }
      if (cached.text) onDelta(cached.text)
      cached.listeners.add(onDelta)
      try { return await cached.promise } finally { cached.listeners.delete(onDelta) }
    }
    // Speculation is on the house: it fires as a selection settles and is
    // never charged. Only a tap on Explain goes through the gate.
    if (!input.speculative && !gateAiAction('chat')) throw new LabChatError('unavailable')
    if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new LabChatError('unavailable')
    if (explanationRef.current?.speculative) explanationRef.current.abort.abort()
    const entry = { key, time: Date.now(), text: '', promise: Promise.resolve(''), listeners: new Set([onDelta]), speculative: !!input.speculative, abort: new AbortController() }
    explanationRef.current = entry
    // A request that stops making progress (no headers, no new text) is
    // given up: aborted and rejected, so the card shows Try again and the
    // retry fetches afresh instead of joining the stalled one (15 Oct 2026).
    let stallTimer: ReturnType<typeof setTimeout> | undefined
    let stalled: (error: LabChatError) => void = () => {}
    const stall = new Promise<never>((_, reject) => { stalled = reject })
    const progress = () => {
      clearTimeout(stallTimer)
      stallTimer = setTimeout(() => { stalled(new LabChatError('timeout')); entry.abort.abort() }, EXPLAIN_STALL_MS)
    }
    progress()
    const work = (async () => {
      const context: LabAskContext = {
        ...askContextNow([]),
        // A passage from another chapter of a collection is by that chapter's writer.
        authorship: optionsRef.current.authorshipOf?.(requestChapter),
        chapterNumber: requestChapter,
        chapterLabel: input.chapterLabel ?? optionsRef.current.chapterLabel,
        editionKey: privateBook ? undefined : input.editionKey,
        editionLabel: input.editionLabel,
        ...(privateBook
          ? passageWindow(input.paragraphs, input.paragraphIndex)
          : { paragraphs: input.paragraphs, paragraphIndex: input.paragraphIndex }),
        // Explain answers the selected passage from the chapter supplied in
        // the prompt. Without book lookups the worker streams the answer as
        // it is written instead of holding the whole round (see chat.ts).
        lookups: false,
      }
      const authToken = await resolveLabVoiceToken({ override: optionsRef.current.authToken, sessionToken, readSession: readSupabaseAccessToken })
      if (requestBookId !== chatBookIdRef.current) throw new LabChatError('unavailable')
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...internalTrafficHeaders() }
      if (authToken) headers.Authorization = `Bearer ${authToken}`
      const response = await fetchExplainResponse(apiUrl(authToken ? '/api/chat' : '/api/lab-chat'), {
        method: 'POST',
        headers,
        signal: entry.abort.signal,
        // The Worker builds the prompt and the question from this context.
        body: JSON.stringify({
          stream: true,
          companion: input.intent && input.intent !== 'define'
            // The margin's actions: the Worker builds each prompt from its intent (companionRequest.ts).
            ? { intent: input.intent, context, ...(text && input.intent !== 'quiz_check' ? { selection: text } : {}), ...(input.intent === 'quiz_check' && input.quiz ? { quiz: input.quiz } : {}) }
            : { intent: input.intent === 'define' ? 'define' : 'explain', context, selection: text, ...(input.speculative ? { speculative: true } : {}) } satisfies CompanionRequest,
        }),
      })
      progress()
      if (!response.ok) throw new LabChatError(await labChatErrorType(response))
      const answer = await readAnthropicResponse(response, value => { progress(); entry.text = value; entry.listeners.forEach(listener => listener(value)) },
        { requireComplete: !!optionsRef.current.sharedReader })
      // Reject before caching so Try again makes a fresh request.
      if (input.intent === 'define' && !parseContextualLookup(answer)) throw new LabChatError('unavailable')
      return answer
    })()
    work.catch(() => { /* settled through the race below */ })
    entry.promise = Promise.race([work, stall]).finally(() => clearTimeout(stallTimer))
    try {
      return await entry.promise
    } catch (error) {
      if (explanationRef.current === entry) explanationRef.current = null
      throw error
    } finally { entry.listeners.clear() }
  }, [askContextNow, gateAiAction, privateBook, sessionToken, signedIn, viewerId])

  /** A question about the whole chapter on screen (a recap): for a reader's own book its context is the chapter, capped. */
  const askAboutChapter = useCallback((text: string) => {
    wholeChapterRef.current = true
    // sendTyped reads its context before its first await.
    try { return sendTyped(text) } finally { wholeChapterRef.current = false }
  }, [sendTyped])

  return {
    turns,
    discardSpeculativeExplanation,
    askAboutChapter,
    /** This book's stored history (classic shape), for the chapter picker. */
    conversations,
    saveCard,
    revealConversation,
    deleteCard,
    historyStatus,
    notice,
    dismissNotice,
    typedLoading,
    typedStatus,
    conversationState: isVoiceV2
      ? labConversationStateV2({ activity: voice.activity, starting })
      : labConversationState({
        voiceState: voice.state,
        error: voice.error,
        starting,
      }),
    voiceVersion,
    voiceActive: voice.isActive || starting,
    /** Transport truth, reported apart from microphone/assistant activity. */
    voiceConnection: starting && voice.connection === 'idle' ? 'connecting' as const : voice.connection,
    micMuted: voice.micMuted,
    setMicMuted: voice.setMicMuted,
    /** Talk's speaking speed, saved and applied live to a running session. */
    talkSpeed,
    setTalkSpeed: (speed: number) => {
      voice.setAssistantSpeed?.(rememberTalkSpeed(speed))
    },
    getAssistantLevel: voice.getAssistantLevel,
    userSpeechStarted: voice.userSpeechStarted,
    startVoice,
    primeVoice,
    stopVoice,
    failStart,
    toggleInChatVoice,
    sendTyped,
    warmTrail,
    explainSelection,
    keepExplanation,
    retryTyped: failedTyped && failedTyped.userTurn.bookId === chatBookId ? () => {
      void sendTyped(failedTyped.text, failedTyped.chapterRequest, failedTyped, failedTyped.attachment)
    } : undefined,
  }
}
