export type TranslationKey = 'butler' | 'pope'

export interface BookChapter {
  number: number
  title: string
  text: string
}

export interface Book {
  id: string
  title: string
  author: string
  translations: Record<TranslationKey, {
    translator: string
    year: number
    type: 'prose' | 'verse'
    chapters: BookChapter[]
  }>
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  highlightedText?: string
}

export interface Annotation {
  id: string
  chapterNumber: number
  startOffset: number
  endOffset: number
  text: string
  note: string
  color: string
  timestamp: number
}
