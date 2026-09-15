import type { ChatConversation, ChatMessage } from '../types'

function validConversation(value: unknown, bookId: string): value is ChatConversation {
  if (!value || typeof value !== 'object') return false
  const conversation = value as ChatConversation
  return (
    typeof conversation.id === 'string' &&
    (!conversation.bookId || conversation.bookId === bookId) &&
    Array.isArray(conversation.messages) &&
    conversation.messages.every(message => !message.bookId || message.bookId === bookId)
  )
}

function messageKey(message: ChatMessage): string {
  if (message.id) return `id:${message.id}`
  return `legacy:${message.role}:${message.timestamp}:${message.chapterNumber ?? ''}:${message.content}`
}

function preferredMessage(first: ChatMessage, second: ChatMessage): ChatMessage {
  if (first.isComplete === false && second.isComplete !== false) return second
  if (second.isComplete === false && first.isComplete !== false) return first
  if ((second.content || '').length > (first.content || '').length) return second
  return first
}

function mergeMessages(first: ChatMessage[], second: ChatMessage[]): ChatMessage[] {
  const messages = new Map<string, ChatMessage>()
  for (const message of [...first, ...second]) {
    const key = messageKey(message)
    const existing = messages.get(key)
    messages.set(key, existing ? preferredMessage(existing, message) : message)
  }
  return Array.from(messages.values()).sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * Merge two revision-conflicting copies of one book's chat history.
 *
 * Chat rows are whole-history blobs. A stale second device must therefore
 * union its new messages with the current cloud row before retrying a
 * versioned commit; simply adopting either blob loses the other device's
 * messages. Explicit cross-book data fails closed instead of being copied
 * into the target key.
 */
export function mergeChatHistoryValues(
  remoteValue: unknown,
  localValue: unknown,
  bookId: string,
): ChatConversation[] | null {
  if (!Array.isArray(remoteValue) || !Array.isArray(localValue)) return null
  if (!remoteValue.every(value => validConversation(value, bookId))) return null
  if (!localValue.every(value => validConversation(value, bookId))) return null

  const merged = new Map<string, ChatConversation>()
  for (const conversation of remoteValue as ChatConversation[]) {
    merged.set(conversation.id, { ...conversation, messages: [...conversation.messages] })
  }
  for (const local of localValue as ChatConversation[]) {
    const remote = merged.get(local.id)
    if (!remote) {
      merged.set(local.id, { ...local, messages: [...local.messages] })
      continue
    }
    const localIsLater = local.endTimestamp >= remote.endTimestamp
    const newerSummary = (local.summaryCreatedAt ?? 0) >= (remote.summaryCreatedAt ?? 0) ? local : remote
    merged.set(local.id, {
      ...(localIsLater ? remote : local),
      ...(localIsLater ? local : remote),
      startTimestamp: Math.min(remote.startTimestamp, local.startTimestamp),
      endTimestamp: Math.max(remote.endTimestamp, local.endTimestamp),
      messages: mergeMessages(remote.messages, local.messages),
      summary: newerSummary.summary,
      summaryPrompt: newerSummary.summaryPrompt,
      summaryCreatedAt: newerSummary.summaryCreatedAt,
    })
  }
  return Array.from(merged.values()).sort((a, b) => a.startTimestamp - b.startTimestamp)
}
