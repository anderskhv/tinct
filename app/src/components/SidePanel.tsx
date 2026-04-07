import { Chat } from './Chat'
import { Feed } from './Feed'
import { Threads } from './Threads'
import { UpgradePrompt } from './UpgradePrompt'
import { useTierContext } from '../contexts/TierContext'
import type { ChatMessage, ChatConversation, Note, Highlight, PanelTab, ThreadCharacter, CharacterMention, Language, BookReadingLog } from '../types'

interface SidePanelProps {
  isOpen: boolean
  activeTab: PanelTab
  onTabChange: (tab: PanelTab) => void
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

export function SidePanel({
  isOpen,
  activeTab,
  onTabChange,
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
}: SidePanelProps) {
  const { canUse } = useTierContext()
  const canChat = canUse('ai-chat')
  const canCast = canUse('cast')

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

          {activeTab === 'chat' ? (
            canChat ? (
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
          ) : activeTab === 'notes' ? (
            <Feed
              readingLog={readingLog}
              totalChapters={totalChapters}
              currentChapter={currentChapter}
              chapterLabels={chapterLabels}
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
          ) : (
            canCast ? (
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
          )}
        </div>
      )}
    </aside>
  )
}
