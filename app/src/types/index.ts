// === Languages & Styles ===

export type Language = 'en' | 'da' | 'de' | 'fr'
export type Style = 'original' | 'modern' | 'verse' | 'kjv' | 'web'

/** Composite key identifying an edition, e.g. 'modern-en', 'kids-da' */
export type EditionKey = string

export function makeEditionKey(style: Style, language: Language): EditionKey {
  return `${style}-${language}`
}

// === Books & Editions ===

export interface Edition {
  key: EditionKey
  language: Language
  style: Style
  label: string
  translator?: string
  year?: number
  /** Whether paragraphs align 1:1 with the canonical (Butler) edition */
  aligned: boolean
  /** Whether audiobook is available for this edition */
  hasAudio?: boolean
}

export interface Chapter {
  number: number
  title: string
  paragraphs: string[]
  /** Section path this chapter belongs to, e.g. "Old Testament — Genesis" */
  section?: string
  /** Known paragraph total when a chapter's text is not loaded yet. */
  paragraphCount?: number
}

/** Hierarchical section for table of contents (e.g., Testament → Book → Chapter) */
export interface Section {
  title: string
  /** Nested sub-sections */
  sections?: Section[]
  /** Leaf sections reference chapter numbers */
  chapters?: number[]
}

export interface EditionData {
  chapters: Chapter[]
  /** Optional hierarchical section structure for ToC (e.g., Bible) */
  sections?: Section[]
  /** Present when only a chapter window is loaded for fast initial render. */
  windowed?: {
    complete: false
    centerChapter: number
    loadedChapters: number[]
  }
}

export interface Book {
  id: string
  title: string
  author: string
  editions: Edition[]
  /** Short description for the store */
  description?: string
  /** Year of original publication */
  year?: number
  /** Word count (approximate) for reading time estimates */
  wordCount?: number
  /** CSS cover: background color */
  coverColor?: string
  /** CSS cover: accent/text color */
  coverAccent?: string
  /**
   * Local-only books are never committed to git, never deployed, never uploaded to R2.
   * They exist only on the local dev machine for personal reading.
   * Edition files for local-only books are listed in .gitignore.
   */
  localOnly?: boolean
}

// === Chat ===

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  highlightedText?: string
  /** Track token usage for future billing */
  tokenCount?: number
  /** Book where this message was sent */
  bookId?: string
  /** Chapter number where this message was sent */
  chapterNumber?: number
  /** First visible paragraph index when message was sent */
  paragraphIndex?: number
  /** Show a "Refresh page" action button on this message */
  refreshAction?: boolean
  /** Chapter divider marker — if set, this message renders as a divider, not a chat bubble */
  chapterDivider?: number
  /** Streaming assistant message is complete and safe to persist */
  isComplete?: boolean
}

/** A group of chat messages from a single session/chapter */
export interface ChatConversation {
  id: string
  bookId: string
  chapterNumber: number
  paragraphIndex?: number
  startTimestamp: number
  endTimestamp: number
  messages: ChatMessage[]
  /** First user message, truncated for preview */
  preview: string
  /** AI-generated summary (replaces full messages in display when present) */
  summary?: string
  /** Prompt/transcript sent to generate the summary, shown for auditability. */
  summaryPrompt?: string
  /** Epoch ms when the summary was generated. */
  summaryCreatedAt?: number
}

// === Highlights & Annotations ===

export type HighlightColor = 'gold' | 'rose' | 'sage' | 'sky' | 'lavender'

export const HIGHLIGHT_COLORS: { key: HighlightColor; label: string; hex: string }[] = [
  { key: 'gold', label: 'Gold', hex: '#f5e6c8' },
  { key: 'rose', label: 'Rose', hex: '#f5d0d0' },
  { key: 'sage', label: 'Sage', hex: '#d0e8d0' },
  { key: 'sky', label: 'Sky', hex: '#d0e0f5' },
  { key: 'lavender', label: 'Lavender', hex: '#e0d0f5' },
]

export interface Highlight {
  id: string
  bookId: string
  editionKey: EditionKey
  chapterNumber: number
  paragraphIndex: number
  startOffset: number
  endOffset: number
  text: string
  color: HighlightColor
  note?: string
  timestamp: number
}

// === Notes ===

export interface Note {
  id: string
  bookId: string
  chapterNumber: number
  /** Stable passage anchor. Page numbers are viewport/font-dependent. */
  paragraphIndex?: number
  editionKey?: EditionKey
  quote?: string
  content: string
  sourceType: 'freeform' | 'from-chat' | 'from-highlight'
  sourceId?: string
  timestamp: number
}

// === Panel Tabs ===

export type PanelTab = 'chat' | 'notes' | 'threads'

// === Threads (Character Tracker) ===

export interface ThreadCharacter {
  id: string
  name: Record<string, string>
  epithet: Record<string, string>
  role: string
  /** Display tier. Defaults to 'supporting' when omitted. Minor entries
   *  may omit per-chapter summaries and rely on `description` instead. */
  prominence?: 'major' | 'supporting' | 'minor'
  /** Standalone bio for entries without per-chapter summaries (typically minors). */
  description?: Record<string, string>
  wikipediaUrl?: string
  searchNames: string[]
  chapters: Record<string, Record<string, string>>
}

export interface ThreadsData {
  bookId: string
  characters: ThreadCharacter[]
}

export interface CharacterMention {
  chapter: number
  paragraphIndex: number
  excerpt: string
}

// === Tiers & Features ===

export type Tier = 'none' | 'free' | 'premium'

export type Feature =
  | 'editions'
  | 'side-by-side'
  | 'highlights'
  | 'notes'
  | 'intelligent-notes'
  | 'sync'
  | 'cast'
  | 'ai-chat'
  | 'audiobook'
  | 'reading-journal'
  | 'export'
  | 'offline'

export const FEATURE_ACCESS: Record<Feature, Tier[]> = {
  'editions':          ['none', 'free', 'premium'],
  'side-by-side':      ['free', 'premium'],
  'highlights':        ['free', 'premium'],
  'notes':             ['free', 'premium'],
  'intelligent-notes': ['free', 'premium'],
  'sync':              ['free', 'premium'],
  'cast':              ['premium'],
  'ai-chat':           ['premium'],
  'audiobook':         ['premium'],
  'reading-journal':   ['premium'],
  'export':            ['premium'],
  'offline':           ['premium'],
}

// === User Profile (Supabase) ===

export interface UserProfile {
  id: string
  email: string
  stripe_customer_id: string | null
  token_balance_cents: number
  total_tokens_used: number
  created_at: string
  subscription_status: 'active' | 'canceled' | 'past_due' | null
  subscription_period_end: string | null
  messages_used_this_period: number
  message_balance: number
  period_start: string | null
}

export interface TokenUsage {
  id: string
  user_id: string
  input_tokens: number
  output_tokens: number
  cost_cents: number
  feature: string
  book_id: string | null
  chapter: number | null
  created_at: string
}

// === User State ===

/** Reader font size, stored as a rem value. Continuous slider (Kindle-style)
 * from 1.0 to 2.4 in 0.05 steps — no discrete buckets so users can
 * level-set precisely without feeling "too small" or "too big". */
export type FontSize = number
export const FONT_SIZE_MIN = 1.0
export const FONT_SIZE_MAX = 2.4
export const FONT_SIZE_STEP = 0.05
export const FONT_SIZE_DEFAULT = 1.3
export type FontFamily = 'garamond' | 'baskerville' | 'sourceserif'

export type ProgressMetric = 'percent' | 'time' | 'page' | 'location'
export type ProgressScope = 'book' | 'section' | 'chapter'

export interface ProgressDisplay {
  metric: ProgressMetric
  scope: ProgressScope
}

export interface UserPreferences {
  language: Language
  style: Style
  splitView: boolean
  splitEditionKey: EditionKey
  darkMode: boolean
  panelTab: PanelTab
  panelOpen: boolean
  readingObjective: string
  onboardingComplete: boolean
  fontSize: FontSize
  fontFamily: FontFamily
  accountDecisionSeen: boolean
  progressDisplay: ProgressDisplay
  /** Per-feature tab visibility. Only honoured for Premium users; lower tiers
   * hide Premium-gated features regardless of these flags. */
  chatHidden: boolean
  feedHidden: boolean
  castHidden: boolean
  /** Languages the reader wants to see editions in. Inferred from browser locale
   * on first visit; filterable inline in BookOnboarding; editable in Settings. */
  readingLanguages: Language[]
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'en',
  style: 'original',
  splitView: false,
  splitEditionKey: 'modern-en',
  darkMode: false,
  panelTab: 'chat',
  panelOpen: true,
  readingObjective: '',
  onboardingComplete: false,
  fontSize: FONT_SIZE_DEFAULT,
  fontFamily: 'garamond',
  accountDecisionSeen: false,
  progressDisplay: { metric: 'page', scope: 'chapter' },
  chatHidden: false,
  feedHidden: false,
  castHidden: false,
  readingLanguages: ['en'],
}

export interface ReadingPosition {
  bookId: string
  chapterNumber: number
  currentPage: number
  totalPages: number
  scrollFraction: number // 0.0–1.0, viewport-independent canonical position
  updatedAt?: number // epoch ms — used to pick most recent across devices
  lastParagraphIndex?: number // last visible paragraph (reading) or last played paragraph (audio)
}

export interface ReadingProgress {
  bookId: string
  /** Highest chapter number fully completed (reached last page) */
  highestCompletedChapter: number
  /** Total chapters in book */
  totalChapters: number
  /** Percentage 0-100 (based on completed chapters) */
  percent: number
  /** Current position percentage 0-100 (based on chapter + page) */
  positionPercent?: number
}

/** How an edition was consumed */
export interface EditionUsage {
  key: string
  mode: 'read' | 'listened'
  /** Progress 0-100 for this edition in this chapter */
  percent?: number
}

/** Per-chapter reading record for the Feed */
export interface ChapterReadingRecord {
  chapterNumber: number
  /** Edition keys the user has read this chapter in, ordered by first use */
  editions: string[]
  /** Detailed per-edition usage (mode + progress). Going forward only. */
  editionUsage?: EditionUsage[]
  /** Total number of reading sessions (each chapter visit = 1) */
  readCount: number
  /** Epoch ms of first read */
  firstReadAt: number
  /** Epoch ms of most recent read */
  lastReadAt: number
  /** Whether the user reached the last page at least once */
  completed: boolean
  /** Last paragraph the user read or listened to in this chapter */
  lastParagraphIndex?: number
  /** Total paragraphs in this chapter (for progress display) */
  totalParagraphs?: number
  /** Cumulative seconds spent reading/listening to this chapter */
  timeSpentSeconds?: number
}

/** Full reading log for a book — powers the Reading Feed */
export interface BookReadingLog {
  bookId: string
  /** Keyed by chapter number for O(1) lookup */
  chapters: Record<number, ChapterReadingRecord>
  /** Last updated timestamp for sync conflict resolution */
  updatedAt: number
}
