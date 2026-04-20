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
  // Chat
  messages: ChatMessage[]
  isChatLoading: boolean
  onSendMessage: (content: string, highlightedText?: string) => void
  onClearChat: () => void
  pendingHighlight: string | null
  onClearHighlight: () => void
  // Chat welcome context
  bookTitle?: string
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
  } = props

  const { canUse } = useTierContext()
  const canChat = canUse('ai-chat')
  const canCast = canUse('cast')

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
      messagesRemaining={messagesRemaining}
      hasBalance={hasBalance}
      isAnonymous={isAnonymous}
      onTopUp={onTopUp}
      onSignIn={onSignIn}
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
  if (isMobile) {
    return (
      <aside className={`side-panel ${isOpen ? 'side-panel-open' : 'side-panel-closed'}`}>
        {isOpen && (
          <div className="side-panel-inner">
            <div className="panel-tabs">
              <button
                className={`panel-tab ${activeTab === 'chat' ? 'panel-tab-active' : ''} ${!canChat ? 'panel-tab-locked' : ''}`}
                onClick={() => onTabChange('chat')}
              >
                Chat {!canChat && <span className="panel-tab-lock">&#9733;</span>}
              </button>
              <button
                className={`panel-tab ${activeTab === 'notes' ? 'panel-tab-active' : ''}`}
                onClick={() => onTabChange('notes')}
              >
                Feed
                {(notes.length + allBookHighlights.length) > 0 && (
                  <span className="panel-tab-badge">{notes.length + allBookHighlights.length}</span>
                )}
              </button>
              <button
                className={`panel-tab ${activeTab === 'threads' ? 'panel-tab-active' : ''} ${!canCast ? 'panel-tab-locked' : ''}`}
                onClick={() => onTabChange('threads')}
              >
                Cast {!canCast && <span className="panel-tab-lock">&#9733;</span>}
              </button>
            </div>

            {activeTab === 'chat' ? renderChat() : activeTab === 'notes' ? renderFeed() : renderCast()}
          </div>
        )}
      </aside>
    )
  }

  // Desktop: card-stack pattern — three rails, one expanded, others collapsed.
  const activeRail: RailKey | null = isOpen ? TAB_TO_RAIL[activeTab] : null

  const rails: { key: RailKey; label: string; badge?: number | null }[] = [
    { key: 'chat', label: 'Chat', badge: null },
    {
      key: 'feed',
      label: 'Feed',
      badge: notes.length + allBookHighlights.length > 0 ? notes.length + allBookHighlights.length : null,
    },
    { key: 'cast', label: 'Cast', badge: null },
  ]

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
    <aside className="side-panel side-panel-stack">
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
