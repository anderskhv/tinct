import { Chat } from './Chat'
import { Feed } from './Feed'
import { Threads } from './Threads'
import { UpgradePrompt } from './UpgradePrompt'
import { useTierContext } from '../contexts/TierContext'
import type { ChatMessage, ChatConversation, Note, Highlight, PanelTab, ThreadCharacter, CharacterMention, Language, BookReadingLog, Section } from '../types'

interface SidePanelProps {
  isOpen: boolean
  activeTab: PanelTab
  onTabChange: (tab: PanelTab) => void
  /** Called when the user clicks the spine of the active rail to collapse it into reading mode. */
  onClosePanel?: () => void
  /** Called when the user clicks a collapsed rail and the panel is currently closed. */
  onOpenPanel?: () => void
  /** Use the mobile layout (no rails — render active tab content only). */
  isMobile?: boolean
  /** Per-feature hide toggles from Settings. */
  chatHidden?: boolean
  feedHidden?: boolean
  castHidden?: boolean
  // Chat
  messages: ChatMessage[]
  isChatLoading: boolean
  onSendMessage: (content: string, highlightedText?: string) => void
  onClearChat: () => void
  pendingHighlight: string | null
  onClearHighlight: () => void
  // Chat welcome context
  bookTitle?: string
  bookId?: string
  chapterTitle?: string
  readingObjective?: string
  onEditObjective?: () => void
  // Feed (replaces Notes)
  notes: Note[]
  highlights: Highlight[]
  onAddNote: (content: string, sourceType?: Note['sourceType'], sourceId?: string) => void
  onDeleteNote: (id: string) => void
  onDeleteHighlight?: (id: string) => void
  onUpdateNote: (id: string, content: string) => void
  onCopyToNotes: (content: string) => void
  allBookHighlights: Highlight[]
  allBookNotes: Note[]
  chapterLabels: string[]
  readingLog: BookReadingLog
  totalChapters: number
  /** Hierarchical sections for Feed grouping (e.g., Bible sections) */
  sections?: Section[]
  // Threads
  threadCharacters: ThreadCharacter[]
  currentChapter: number
  editionKey: string
  language: Language
  getMentions: (char: ThreadCharacter, upToChapter?: number) => CharacterMention[]
  onNavigateToChapter: (chapter: number, paragraphIndex?: number, editionKey?: string) => void
  visibleParagraphs?: string[]
  // Balance (shown in chat welcome)
  messagesRemaining?: number
  hasBalance?: boolean
  isAnonymous?: boolean
  onTopUp?: () => void
  onSignIn?: () => void
  // Pricing
  onShowPricing?: () => void
  // Chat history
  chatConversations?: ChatConversation[]
  onSummarizeChat?: (convId: string) => void
  summarizingId?: string | null
}

type RailKey = 'chat' | 'feed' | 'cast'

const TAB_TO_RAIL: Record<PanelTab, RailKey> = {
  chat: 'chat',
  notes: 'feed',
  threads: 'cast',
}

const RAIL_TO_TAB: Record<RailKey, PanelTab> = {
  chat: 'chat',
  feed: 'notes',
  cast: 'threads',
}

export function SidePanel(props: SidePanelProps) {
  const {
    isOpen,
    activeTab,
    onTabChange,
    onClosePanel,
    onOpenPanel,
    isMobile,
    messages,
    isChatLoading,
    onSendMessage,
    onClearChat,
    pendingHighlight,
    onClearHighlight,
    bookTitle,
    bookId,
    chapterTitle,
    readingObjective,
    onEditObjective,
    notes,
    highlights,
    onAddNote,
    onDeleteNote,
    onDeleteHighlight,
    onUpdateNote,
    onCopyToNotes,
    allBookHighlights,
    allBookNotes,
    chapterLabels,
    readingLog,
    totalChapters,
    sections,
    threadCharacters,
    currentChapter,
    editionKey,
    language,
    getMentions,
    onNavigateToChapter,
    visibleParagraphs,
    messagesRemaining,
    hasBalance,
    isAnonymous,
    onTopUp,
    onSignIn,
    onShowPricing,
    chatConversations = [],
    onSummarizeChat,
    summarizingId,
    chatHidden = false,
    feedHidden = false,
    castHidden = false,
  } = props

  const { canUse, tier } = useTierContext()
  const canChat = canUse('ai-chat')
  const canCast = canUse('cast')

  // Tab visibility:
  // - Chat / Cast: tier-gated (Premium only). User can also hide via Settings.
  // - Feed: Premium-only by default so free users get a clean reader. Feed is a
  //   Premium reading-journal; highlights and notes still work inline via the
  //   selection popup for all tiers.
  // If no tabs are visible, don't render the panel at all.
  const showChatTab = canChat && !chatHidden
  // Hide Cast tab entirely when the book has no character data — saves the
  // user from seeing an empty rail with filter pills and a "No characters"
  // message. Books without threads.json (e.g. The Awakening) shouldn't show
  // a tracker at all.
  const showCastTab = canCast && !castHidden && threadCharacters.length > 0
  const showFeedTab = tier === 'premium' && !feedHidden
  const anyTabVisible = showChatTab || showFeedTab || showCastTab
  if (!anyTabVisible) return null

  const renderChat = () => canChat ? (
    <Chat
      messages={messages}
      isLoading={isChatLoading}
      onSendMessage={onSendMessage}
      onClear={onClearChat}
      pendingHighlight={pendingHighlight}
      onClearHighlight={onClearHighlight}
      onCopyToNotes={onCopyToNotes}
      bookTitle={bookTitle}
      chapterTitle={chapterTitle}
      chapterLabels={Object.fromEntries(chapterLabels.map((label, i) => [i + 1, label]))}
      readingObjective={readingObjective}
      onEditObjective={onEditObjective}
      bookId={bookId}
      messagesRemaining={messagesRemaining}
      hasBalance={hasBalance}
      isAnonymous={isAnonymous}
      onTopUp={onTopUp}
      onSignIn={onSignIn}
      chatConversations={chatConversations}
      onNavigateToChapter={onNavigateToChapter}
    />
  ) : (
    <UpgradePrompt feature="AI chat" onCreateAccount={onSignIn} onUpgrade={onShowPricing} />
  )

  const renderFeed = () => (
    <Feed
      readingLog={readingLog}
      totalChapters={totalChapters}
      currentChapter={currentChapter}
      chapterLabels={chapterLabels}
      sections={sections}
      notes={notes}
      highlights={highlights}
      allBookHighlights={allBookHighlights}
      allBookNotes={allBookNotes}
      chatConversations={chatConversations}
      onAddNote={onAddNote}
      onDeleteNote={onDeleteNote}
      onDeleteHighlight={onDeleteHighlight}
      onUpdateNote={onUpdateNote}
      onNavigateToChapter={onNavigateToChapter}
      onSummarizeChat={onSummarizeChat}
      summarizingId={summarizingId}
    />
  )

  const renderCast = () => canCast ? (
    <Threads
      characters={threadCharacters}
      currentChapter={currentChapter}
      editionKey={editionKey}
      language={language}
      getMentions={getMentions}
      onNavigateToChapter={onNavigateToChapter}
      visibleParagraphs={visibleParagraphs}
    />
  ) : (
    <UpgradePrompt feature="Cast tracker" onCreateAccount={onSignIn} onUpgrade={onShowPricing} />
  )

  // Mobile: render only the active tab's content, full width. No rails.
  // Auto-redirect if active tab is hidden (e.g. free-tier user whose active
  // tab was Chat or Feed before tier downgrade).
  const safeActiveTab: PanelTab = (() => {
    if (activeTab === 'chat' && !showChatTab) {
      if (showFeedTab) return 'notes'
      if (showCastTab) return 'threads'
    }
    if (activeTab === 'notes' && !showFeedTab) {
      if (showChatTab) return 'chat'
      if (showCastTab) return 'threads'
    }
    if (activeTab === 'threads' && !showCastTab) {
      if (showChatTab) return 'chat'
      if (showFeedTab) return 'notes'
    }
    return activeTab
  })()

  if (isMobile) {
    return (
      <aside className={`side-panel ${isOpen ? 'side-panel-open' : 'side-panel-closed'}`} data-tour="side-panel">
        {isOpen && (
          <div className="side-panel-inner">
            <div className="panel-tabs">
              {showChatTab && (
                <button
                  className={`panel-tab ${safeActiveTab === 'chat' ? 'panel-tab-active' : ''}`}
                  data-tour="chat-tab"
                  onClick={() => onTabChange('chat')}
                >
                  Chat
                </button>
              )}
              {showFeedTab && (
                <button
                  className={`panel-tab ${safeActiveTab === 'notes' ? 'panel-tab-active' : ''}`}
                  data-tour="feed-tab"
                  onClick={() => onTabChange('notes')}
                >
                  Feed
                  {(notes.length + allBookHighlights.length) > 0 && (
                    <span className="panel-tab-badge">{notes.length + allBookHighlights.length}</span>
                  )}
                </button>
              )}
              {showCastTab && (
                <button
                  className={`panel-tab ${safeActiveTab === 'threads' ? 'panel-tab-active' : ''}`}
                  data-tour="cast-tab"
                  onClick={() => onTabChange('threads')}
                >
                  Cast
                </button>
              )}
            </div>

            {/* key on activeTab so a tab switch remounts the active content
                and re-runs its CSS fade-in animation. Makes the Chat→Feed
                transition visually obvious during the feature tour. */}
            <div className="panel-content-fade" key={safeActiveTab}>
              {safeActiveTab === 'chat' && showChatTab ? renderChat()
                : safeActiveTab === 'notes' && showFeedTab ? renderFeed()
                : safeActiveTab === 'threads' && showCastTab ? renderCast()
                : null}
            </div>
          </div>
        )}
      </aside>
    )
  }

  // Desktop: card-stack pattern — rails, one expanded, others collapsed.
  const activeRail: RailKey | null = isOpen ? TAB_TO_RAIL[activeTab] : null

  type Rail = { key: RailKey; label: string; badge: number | null }
  const rails: Rail[] = []
  if (showChatTab) rails.push({ key: 'chat', label: 'Chat', badge: null })
  if (showFeedTab) rails.push({
    key: 'feed',
    label: 'Feed',
    badge: notes.length + allBookHighlights.length > 0 ? notes.length + allBookHighlights.length : null,
  })
  if (showCastTab) rails.push({ key: 'cast', label: 'Cast', badge: null })

  const handleSpineClick = (rail: RailKey) => {
    if (rail === activeRail) {
      // Clicking active spine → collapse to reading mode.
      onClosePanel?.()
    } else {
      onTabChange(RAIL_TO_TAB[rail])
      if (!isOpen) onOpenPanel?.()
    }
  }

  return (
    <aside className="side-panel side-panel-stack" data-tour="side-panel">
      <div className="card-stack">
        {rails.map(r => {
          const isActive = r.key === activeRail
          return (
            <div
              key={r.key}
              className={`card-rail card-rail-${r.key} ${isActive ? 'card-rail-open' : 'card-rail-closed'}`}
              onClick={!isActive ? () => handleSpineClick(r.key) : undefined}
            >
              <button
                className="card-rail-spine"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSpineClick(r.key)
                }}
                title={isActive ? `Collapse ${r.label}` : `Open ${r.label}`}
              >
                {r.label}
                {r.badge && <span className="card-rail-spine-badge">{r.badge}</span>}
              </button>
              {isActive && (
                <div className="card-rail-body">
                  {r.key === 'chat' && renderChat()}
                  {r.key === 'feed' && renderFeed()}
                  {r.key === 'cast' && renderCast()}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
