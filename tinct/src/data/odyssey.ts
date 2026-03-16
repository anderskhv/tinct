import type { Book } from '../types'

// Project Gutenberg URLs for The Odyssey
const BUTLER_URL = 'https://www.gutenberg.org/cache/epub/1727/pg1727.txt'
const POPE_URL = 'https://www.gutenberg.org/cache/epub/3160/pg3160.txt'

// Minimal placeholder text shown while loading
const LOADING_TEXT = 'Loading text from Project Gutenberg...'

export const odyssey: Book = {
  id: 'odyssey',
  title: 'The Odyssey',
  author: 'Homer',
  translations: {
    butler: {
      translator: 'Samuel Butler',
      year: 1900,
      type: 'prose',
      chapters: [
        { number: 1, title: 'Book I', text: LOADING_TEXT },
      ],
    },
    pope: {
      translator: 'Alexander Pope',
      year: 1726,
      type: 'verse',
      chapters: [
        { number: 1, title: 'Book I', text: LOADING_TEXT },
      ],
    },
  },
}

// Parse Gutenberg plain text into chapters
function parseButlerText(raw: string): { number: number; title: string; text: string }[] {
  const chapters: { number: number; title: string; text: string }[] = []

  // Remove Gutenberg header/footer
  const startMarker = '*** START OF THE PROJECT GUTENBERG EBOOK'
  const endMarker = '*** END OF THE PROJECT GUTENBERG EBOOK'
  let startIdx = raw.indexOf(startMarker)
  if (startIdx !== -1) {
    startIdx = raw.indexOf('\n', startIdx) + 1
  } else {
    startIdx = 0
  }
  let endIdx = raw.indexOf(endMarker)
  if (endIdx === -1) endIdx = raw.length

  const body = raw.slice(startIdx, endIdx).trim()

  // Split by "BOOK " pattern (Butler uses "BOOK I", "BOOK II", etc.)
  const bookPattern = /\n\s*BOOK\s+([IVXLC]+)\s*[.\n]/gi
  const matches = [...body.matchAll(bookPattern)]

  if (matches.length === 0) {
    // Fallback: treat entire text as one chapter
    chapters.push({ number: 1, title: 'The Odyssey', text: body.slice(0, 15000) })
    return chapters
  }

  const romanToNum: Record<string, number> = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6,
    'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12,
    'XIII': 13, 'XIV': 14, 'XV': 15, 'XVI': 16, 'XVII': 17, 'XVIII': 18,
    'XIX': 19, 'XX': 20, 'XXI': 21, 'XXII': 22, 'XXIII': 23, 'XXIV': 24,
  }

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const nextMatch = matches[i + 1]
    const startPos = (match.index || 0) + match[0].length
    const endPos = nextMatch ? (nextMatch.index || body.length) : body.length
    const chapterText = body.slice(startPos, endPos).trim()
    const roman = match[1].toUpperCase()
    const num = romanToNum[roman] || (i + 1)

    // Find subtitle if any (usually first line after BOOK heading)
    const lines = chapterText.split('\n')
    let title = `Book ${roman}`
    let textStart = 0

    // Look for a subtitle line (short, often in caps)
    for (let j = 0; j < Math.min(5, lines.length); j++) {
      const line = lines[j].trim()
      if (line.length > 0 && line.length < 120 && line === line.toUpperCase()) {
        title = `Book ${roman} — ${line.charAt(0) + line.slice(1).toLowerCase()}`
        textStart = j + 1
        break
      }
    }

    chapters.push({
      number: num,
      title,
      text: lines.slice(textStart).join('\n').trim(),
    })
  }

  return chapters
}

function parsePopeText(raw: string): { number: number; title: string; text: string }[] {
  const chapters: { number: number; title: string; text: string }[] = []

  const startMarker = '*** START OF THE PROJECT GUTENBERG EBOOK'
  const endMarker = '*** END OF THE PROJECT GUTENBERG EBOOK'
  let startIdx = raw.indexOf(startMarker)
  if (startIdx !== -1) {
    startIdx = raw.indexOf('\n', startIdx) + 1
  } else {
    startIdx = 0
  }
  let endIdx = raw.indexOf(endMarker)
  if (endIdx === -1) endIdx = raw.length

  const body = raw.slice(startIdx, endIdx).trim()

  // Pope's text uses "BOOK I." or "BOOK I" patterns
  const bookPattern = /\n\s*BOOK\s+([IVXLC]+)\.?\s*\n/gi
  const matches = [...body.matchAll(bookPattern)]

  const romanToNum: Record<string, number> = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6,
    'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12,
    'XIII': 13, 'XIV': 14, 'XV': 15, 'XVI': 16, 'XVII': 17, 'XVIII': 18,
    'XIX': 19, 'XX': 20, 'XXI': 21, 'XXII': 22, 'XXIII': 23, 'XXIV': 24,
  }

  if (matches.length === 0) {
    chapters.push({ number: 1, title: 'The Odyssey', text: body.slice(0, 15000) })
    return chapters
  }

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const nextMatch = matches[i + 1]
    const startPos = (match.index || 0) + match[0].length
    const endPos = nextMatch ? (nextMatch.index || body.length) : body.length
    const chapterText = body.slice(startPos, endPos).trim()
    const roman = match[1].toUpperCase()
    const num = romanToNum[roman] || (i + 1)

    const lines = chapterText.split('\n')
    let title = `Book ${roman}`
    let textStart = 0

    for (let j = 0; j < Math.min(5, lines.length); j++) {
      const line = lines[j].trim()
      if (line.length > 0 && line.length < 120 && /^[A-Z]/.test(line)) {
        if (line === line.toUpperCase() && line.length < 80) {
          title = `Book ${roman} — ${line.charAt(0) + line.slice(1).toLowerCase()}`
          textStart = j + 1
          break
        }
      }
    }

    chapters.push({
      number: num,
      title,
      text: lines.slice(textStart).join('\n').trim(),
    })
  }

  return chapters
}

export async function fetchOdysseyText(translation: 'butler' | 'pope'): Promise<{ number: number; title: string; text: string }[]> {
  const url = translation === 'butler' ? BUTLER_URL : POPE_URL

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const text = await response.text()

    if (translation === 'butler') {
      return parseButlerText(text)
    } else {
      return parsePopeText(text)
    }
  } catch (err) {
    console.error(`Failed to fetch ${translation} translation:`, err)
    return [{ number: 1, title: 'Book I', text: `Failed to load text. Please check your internet connection.\n\nError: ${err}` }]
  }
}
