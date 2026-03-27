import { Chat } from './Chat'
import { Notes } from './Notes'
import { Threads } from './Threads'
import { UpgradePrompt } from './UpgradePrompt'
import { useTierContext } from '../contexts/TierContext'
import type { ChatMessage, ChatConversation, Note, Highlight, PanelTab, ThreadCharacter, CharacterMention, Language } from '../types'

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
  // Notes
  notes: Note[]
  highlights: Highlight[]
  onAddNote: (content: string, sourceType?: Note['sourceType'], sourceId?: string) => void
  onDeleteNote: (id: string) => void
  onDeleteHighlight?: (id: string) => void
  onUpdateNote: (id: string, content: string) => void
  onCopyToNotes: (content: string) => void
  onCleanupNotes: (aggressive: boolean) => void
  isCleaningUp?: boolean
  onScrollToHighlight?: (paragraphIndex: number) => void
  // Highlights (all book)
  allBookHighlights: Highlight[]
  chapterLabels: string[]
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
  onCleanupNotes,
  isCleaningUp,
  onScrollToHighlight,
  allBookHighlights,
  chapterLabels,
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
              Notes
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
            <Notes
              notes={notes}
              highlights={highlights}
              onAddNote={onAddNote}
              onDeleteNote={onDeleteNote}
              onDeleteHighlight={onDeleteHighlight}
              onUpdateNote={onUpdateNote}
              onCleanupNotes={onCleanupNotes}
              isCleaningUp={isCleaningUp}
              onScrollToHighlight={onScrollToHighlight}
              allBookHighlights={allBookHighlights}
              chapterLabels={chapterLabels}
              currentChapter={currentChapter}
              onNavigateToChapter={onNavigateToChapter}
              chatConversations={chatConversations}
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
