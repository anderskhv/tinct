import type { ChatConversation, EditionData, Section } from '../types'
import type { LabChapter } from './labSource'
import type { LabHighlight } from './labHighlights'
import { buildLabBibleTree, type LabTreeNode } from './labBibleTree'
import { tokenizeHearingWords } from './labHearing'

export interface ContentsBook { key: string; title: string; group: string; chapters: LabChapter[] }
export interface ContentsPlace { chapterNumber: number; paragraphIndex: number; wordIndex: number }

export function contentsBooks(title: string, chapters: LabChapter[], sections?: Section[], bible = false): ContentsBook[] {
  if (!bible) return [{ key: 'book', title, group: '', chapters }]
  const result: ContentsBook[] = []
  const visit = (nodes: LabTreeNode[], group: string) => {
    for (const node of nodes) {
      if (node.kind === 'book') result.push({ key: node.key, title: node.title, group, chapters: chapters.filter(ch => node.chapterNumbers.includes(ch.number)) })
      if (node.children) visit(node.children, node.kind === 'testament' ? node.title : group)
    }
  }
  visit(buildLabBibleTree(sections, chapters), '')
  if (result.length) return result
  // Manifest loading and test fixtures can supply chapter titles before sections.
  for (const chapter of chapters) {
    const name = chapter.title.replace(/\s+\d+$/, '')
    let book = result.find(item => item.title === name)
    if (!book) { book = { key: name, title: name, group: '', chapters: [] }; result.push(book) }
    book.chapters.push(chapter)
  }
  return result
}

export function contentsChapterNumber(book: ContentsBook, localNumber: number): number | null {
  if (!Number.isInteger(localNumber) || localNumber < 1) return null
  return book.chapters[localNumber - 1]?.number ?? null
}

export function contentsQuote(highlight: LabHighlight, data: EditionData | null): string | null {
  const paragraphs = data?.chapters.find(ch => ch.number === highlight.chapterNumber)?.paragraphs
  if (!paragraphs || !paragraphs[highlight.paragraphIndex]) return null
  const parts: string[] = []
  for (let i = highlight.paragraphIndex; i <= highlight.endParagraphIndex; i++) {
    if (!paragraphs[i]) return null
    const words = tokenizeHearingWords(paragraphs[i])
    parts.push(words.slice(i === highlight.paragraphIndex ? highlight.fromWord : 0, i === highlight.endParagraphIndex ? highlight.toWord : undefined).map(word => word.text).join(' '))
  }
  return parts.join(' ')
}

export function contentsQuestion(chat: ChatConversation): string {
  return chat.messages.find(message => message.role === 'user')?.content || chat.preview || 'Conversation'
}
export function contentsExcerpt(text: string, query = '', max = 180): string {
  const at = query ? text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) : 0
  const start = Math.max(0, at - 45)
  return `${start > 0 ? '…' : ''}${text.slice(start, start + max)}${text.length > start + max ? '…' : ''}`
}

export interface ContentsSearch {
  chapters: LabChapter[]
  passages: Array<ContentsPlace & { text: string; title: string }>
  chats: ChatConversation[]
  highlights: Array<{ highlight: LabHighlight; text: string }>
}
export function searchContents(query: string, chapters: LabChapter[], data: EditionData | null, chats: ChatConversation[], highlights: LabHighlight[]): ContentsSearch {
  const q = query.trim().toLocaleLowerCase()
  const found: ContentsSearch = { chapters: [], passages: [], chats: [], highlights: [] }
  if (!q) return found
  const matches = (text: string) => text.toLocaleLowerCase().includes(q)
  const reference = q.replace(/\s+/g, '')
  found.chapters = chapters.filter(ch => matches(ch.title) || ch.title.toLocaleLowerCase().replace(/\s+/g, '') === reference)
  for (const ch of data?.chapters || []) {
    ch.paragraphs.forEach((text, paragraphIndex) => {
      const at = text.toLocaleLowerCase().indexOf(q)
      if (at < 0) return
      const wordIndex = Math.max(0, text.slice(0, at).trim().split(/\s+/).filter(Boolean).length - (/\s$/.test(text.slice(0, at)) ? 0 : 1))
      found.passages.push({ chapterNumber: ch.number, paragraphIndex, wordIndex, title: ch.title, text: contentsExcerpt(text, query) })
    })
  }
  found.chats = chats.filter(chat => chat.messages.some(message => matches(message.content)))
  found.highlights = highlights.flatMap(highlight => {
    const text = contentsQuote(highlight, data)
    return (text && matches(text)) || matches(highlight.note || '') ? [{ highlight, text: text || '' }] : []
  })
  return found
}
