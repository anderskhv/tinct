import { Chat } from './Chat'
import type { ChatMessage } from '../types'

interface SidePanelProps {
  isOpen: boolean
  messages: ChatMessage[]
  isLoading: boolean
  onSendMessage: (content: string, highlightedText?: string) => void
  onClear: () => void
  pendingHighlight: string | null
  onClearHighlight: () => void
}

export function SidePanel({
  isOpen,
  messages,
  isLoading,
  onSendMessage,
  onClear,
  pendingHighlight,
  onClearHighlight,
}: SidePanelProps) {
  return (
    <aside className={`side-panel ${isOpen ? 'side-panel-open' : 'side-panel-closed'}`}>
      {isOpen && (
        <Chat
          messages={messages}
          isLoading={isLoading}
          onSendMessage={onSendMessage}
          onClear={onClear}
          pendingHighlight={pendingHighlight}
          onClearHighlight={onClearHighlight}
        />
      )}
    </aside>
  )
}
