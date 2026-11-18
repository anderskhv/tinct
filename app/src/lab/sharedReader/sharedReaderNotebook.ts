import type { ChatConversation } from '../../types'
import type { LabHighlight } from '../labHighlights'
import { highlightCreatedAt } from '../labHighlightOrder'
import { isCardTombstone } from '../labChatHistory'
import type { LegacyOwnEpubNotebookItem } from '../LabContentsV2'

export interface NotebookExportInput {
  title: string
  bookId: string
  editionKey: string
  highlights: LabHighlight[]
  chapterNotes: LabHighlight[]
  conversations: ChatConversation[]
  legacyOwnEpubItems?: LegacyOwnEpubNotebookItem[]
  chapterTitle: (number: number) => string
  quote: (highlight: LabHighlight) => string | null
}

const quoted = (text: string) => text.split('\n').map(line => '> ' + line).join('\n')
const heading = (text: string) => text.replace(/[\r\n]+/g, ' ').trim()

/** All of this book's saved Notebook rows, including original-page records that have no converted-text anchor. */
export function sharedNotebookMarkdown(input: NotebookExportInput): string {
  const rows: Array<{ at: number; lines: string[] }> = []
  for (const mark of [...input.highlights, ...input.chapterNotes]) {
    if (mark.bookId !== input.bookId || (mark.kind !== 'chapter' && mark.editionKey !== input.editionKey)) continue
    const isNote = mark.kind === 'chapter' || !!mark.note?.trim()
    const passage = mark.kind === 'chapter' ? '' : input.quote(mark)?.trim() || mark.text?.trim() || ''
    const lines = [`## ${isNote ? 'Note' : 'Highlight'} · ${heading(input.chapterTitle(mark.chapterNumber))}`]
    if (passage) lines.push('', quoted(passage))
    if (mark.note?.trim()) lines.push('', mark.note.trim())
    rows.push({ at: highlightCreatedAt(mark), lines })
  }
  for (const chat of input.conversations) {
    if (chat.bookId !== input.bookId || isCardTombstone(chat) || !chat.messages.length) continue
    const lines = [`## ${heading(chat.card?.kind || 'Conversation')} · ${heading(input.chapterTitle(chat.chapterNumber))}`]
    if (chat.card?.text?.trim()) lines.push('', quoted(chat.card.text.trim()))
    for (const message of chat.messages) if (message.content?.trim()) lines.push('', `**${message.role === 'assistant' ? 'A' : 'Q'}.** ${message.content.trim()}`)
    rows.push({ at: chat.card?.at ?? chat.endTimestamp, lines })
  }
  for (const item of input.legacyOwnEpubItems ?? []) {
    const lines = [`## Saved ${item.kind === 'card' ? 'AI card' : 'highlight'} · Original EPUB page ${item.page}`]
    if (item.text.trim()) lines.push('', quoted(item.text.trim()))
    if (item.note?.trim()) lines.push('', item.note.trim())
    for (const turn of item.turns ?? []) if (turn.content.trim()) lines.push('', `**${turn.role === 'assistant' ? 'A' : 'Q'}.** ${turn.content.trim()}`)
    let details = ''
    try { details = item.data ? JSON.stringify(item.data, null, 2) || '' : '' } catch { /* Malformed local state stays in its raw owner backup. */ }
    if (details) lines.push('', '**Saved card details:**', '', ...details.split('\n').map(line => '    ' + line))
    rows.push({ at: item.at, lines })
  }
  rows.sort((a, b) => b.at - a.at)
  return [`# ${heading(input.title)}: notebook`, '', `${rows.length} ${rows.length === 1 ? 'entry' : 'entries'}`, ...rows.flatMap(row => ['', ...row.lines])].join('\n') + '\n'
}

export function sharedNotebookFilename(title: string): string {
  return `${title.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || 'Notebook'} notebook.md`
}
