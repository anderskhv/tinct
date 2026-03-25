// === Languages & Styles ===

export type Language = 'en' | 'da'
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
  role: 'mortal' | 'god' | 'creature'
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
  subscription_status: 'active' | 'canceled' | null
  subscription_period_end: string | null
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

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge'
export type FontFamily = 'garamond' | 'baskerville' | 'sourceserif'

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
  fontSize: 'medium',
  fontFamily: 'garamond',
  accountDecisionSeen: false,
}

export interface ReadingPosition {
  bookId: string
  chapterNumber: number
  currentPage: number
  totalPages: number
  scrollFraction: number // 0.0–1.0, viewport-independent canonical position
}

export interface ReadingProgress {
  bookId: string
  /** Highest chapter number fully completed (reached last page) */
  highestCompletedChapter: number
  /** Total chapters in book */
  totalChapters: number
  /** Percentage 0-100 */
  percent: number
}
