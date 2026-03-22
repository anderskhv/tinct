import { Chat } from './Chat'
import { Notes } from './Notes'
import { Highlights } from './Highlights'
import { Threads } from './Threads'
import type { ChatMessage, Note, Highlight, PanelTab, ThreadCharacter, CharacterMention, Language } from '../types'

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
  onNavigateToChapter: (chapter: number) => void
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
}: SidePanelProps) {
  return (
    <aside className={`side-panel ${isOpen ? 'side-panel-open' : 'side-panel-closed'}`}>
      {isOpen && (
        <div className="side-panel-inner">
          <div className="panel-tabs">
            <button
              className={`panel-tab ${activeTab === 'chat' ? 'panel-tab-active' : ''}`}
              onClick={() => onTabChange('chat')}
            >
              Chat
            </button>
            <button
              className={`panel-tab ${activeTab === 'notes' ? 'panel-tab-active' : ''}`}
              onClick={() => onTabChange('notes')}
            >
              Notes
              {notes.length > 0 && (
                <span className="panel-tab-badge">{notes.length}</span>
              )}
            </button>
            <button
              className={`panel-tab ${activeTab === 'highlights' ? 'panel-tab-active' : ''}`}
              onClick={() => onTabChange('highlights')}
            >
              Highlights
              {allBookHighlights.length > 0 && (
                <span className="panel-tab-badge">{allBookHighlights.length}</span>
              )}
            </button>
            <button
              className={`panel-tab ${activeTab === 'threads' ? 'panel-tab-active' : ''}`}
              onClick={() => onTabChange('threads')}
            >
              Cast
            </button>
          </div>

          {activeTab === 'chat' ? (
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
            />
          ) : activeTab === 'notes' ? (
            <Notes
              notes={notes}
              highlights={highlights}
              onAddNote={onAddNote}
              onDeleteNote={onDeleteNote}
              onUpdateNote={onUpdateNote}
              onCleanupNotes={onCleanupNotes}
              isCleaningUp={isCleaningUp}
              onScrollToHighlight={onScrollToHighlight}
            />
          ) : activeTab === 'highlights' ? (
            <Highlights
              highlights={allBookHighlights}
              onNavigateToChapter={onNavigateToChapter}
              chapterLabels={chapterLabels}
            />
          ) : (
            <Threads
              characters={threadCharacters}
              currentChapter={currentChapter}
              editionKey={editionKey}
              language={language}
              getMentions={getMentions}
              onNavigateToChapter={onNavigateToChapter}
            />
          )}
        </div>
      )}
    </aside>
  )
}
