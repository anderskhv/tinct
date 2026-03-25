/**
 * Parse War and Peace (Gutenberg plain text) into Tinct edition JSON format.
 * Outputs: war-and-peace-original-en.json
 *
 * Structure: 365 chapters across 17 sections (Books 1-15 + two Epilogues).
 * Each chapter becomes a Tinct chapter with title like "Book One (1805) — Chapter I"
 */

const fs = require('fs')
const path = require('path')

const raw = fs.readFileSync(path.join(__dirname, 'raw.txt'), 'utf-8').replace(/\r\n/g, '\n').replace(/\r/g, '\n')

// Find start and end of actual content
const startMarker = '*** START OF THE PROJECT GUTENBERG EBOOK WAR AND PEACE ***'
const endMarker = '*** END OF THE PROJECT GUTENBERG EBOOK WAR AND PEACE ***'
const startIdx = raw.indexOf(startMarker) + startMarker.length
const endIdx = raw.indexOf(endMarker)
const content = raw.slice(startIdx, endIdx)

// Split into lines
const lines = content.split('\n')

// State machine to parse books and chapters
const bookPattern = /^(BOOK (?:ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|ELEVEN|TWELVE|THIRTEEN|FOURTEEN|FIFTEEN):\s*.+|FIRST EPILOGUE:\s*.+|SECOND EPILOGUE)\s*$/
const chapterPattern = /^CHAPTER ([IVXLC]+)\s*$/

const bookNames = {
  'BOOK ONE': 'Book One',
  'BOOK TWO': 'Book Two',
  'BOOK THREE': 'Book Three',
  'BOOK FOUR': 'Book Four',
  'BOOK FIVE': 'Book Five',
  'BOOK SIX': 'Book Six',
  'BOOK SEVEN': 'Book Seven',
  'BOOK EIGHT': 'Book Eight',
  'BOOK NINE': 'Book Nine',
  'BOOK TEN': 'Book Ten',
  'BOOK ELEVEN': 'Book Eleven',
  'BOOK TWELVE': 'Book Twelve',
  'BOOK THIRTEEN': 'Book Thirteen',
  'BOOK FOURTEEN': 'Book Fourteen',
  'BOOK FIFTEEN': 'Book Fifteen',
  'FIRST EPILOGUE': 'First Epilogue',
  'SECOND EPILOGUE': 'Second Epilogue',
}

let currentBook = null
let currentBookYear = ''
let currentChapterLines = []
let chapterNum = 0  // Global chapter counter
let chapters = []

function flushChapter(chapterRoman) {
  if (!currentBook || currentChapterLines.length === 0) return

  // Join lines into text, then split into paragraphs
  const text = currentChapterLines.join('\n')

  // Split on double newlines (paragraph breaks)
  const rawParagraphs = text.split(/\n\n+/)

  const paragraphs = rawParagraphs
    .map(p => {
      // Collapse single newlines within a paragraph to spaces (Gutenberg line wrapping)
      return p
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .join(' ')
    })
    .filter(p => p.length > 0)

  if (paragraphs.length === 0) return

  chapterNum++
  const yearPart = currentBookYear ? ` (${currentBookYear})` : ''
  const title = `${currentBook}${yearPart} — Chapter ${chapterRoman}`

  chapters.push({
    number: chapterNum,
    title,
    paragraphs,
  })
}

let pendingChapterRoman = null

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  const trimmed = line.trim()

  // Check for book header
  const bookMatch = trimmed.match(bookPattern)
  if (bookMatch) {
    // Extract book name and year
    const parts = trimmed.split(':')
    const bookKey = parts[0].trim()
    const year = parts[1] ? parts[1].trim() : ''

    // Find matching book name
    for (const [key, name] of Object.entries(bookNames)) {
      if (bookKey === key) {
        currentBook = name
        currentBookYear = year
        break
      }
    }
    continue
  }

  // Check for chapter header
  const chapterMatch = trimmed.match(chapterPattern)
  if (chapterMatch) {
    // Flush previous chapter
    if (pendingChapterRoman) {
      flushChapter(pendingChapterRoman)
    }
    pendingChapterRoman = chapterMatch[1]
    currentChapterLines = []
    continue
  }

  // Skip table of contents lines (before first chapter)
  if (!pendingChapterRoman) continue

  // Accumulate chapter text
  currentChapterLines.push(line)
}

// Flush last chapter
if (pendingChapterRoman) {
  flushChapter(pendingChapterRoman)
}

console.log(`Parsed ${chapters.length} chapters`)

// Show structure summary
let lastBook = ''
for (const ch of chapters) {
  const bookPart = ch.title.split(' — ')[0]
  if (bookPart !== lastBook) {
    const bookChapters = chapters.filter(c => c.title.startsWith(bookPart + ' — '))
    console.log(`  ${bookPart}: ${bookChapters.length} chapters`)
    lastBook = bookPart
  }
}

// Word count
const totalWords = chapters.reduce((sum, ch) =>
  sum + ch.paragraphs.reduce((s, p) => s + p.split(/\s+/).length, 0), 0)
console.log(`Total words: ${totalWords.toLocaleString()}`)

// Write JSON
const output = { chapters }
const outputPath = path.join(__dirname, '..', '..', 'tinct', 'src', 'data', 'editions', 'war-and-peace-original-en.json')
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
console.log(`Written to ${outputPath}`)

// Also write a markdown summary for editorial review
let md = '# War and Peace — Chapter Structure\n\n'
md += `**Translation:** Aylmer & Louise Maude (Project Gutenberg)\n`
md += `**Total chapters:** ${chapters.length}\n`
md += `**Total words:** ${totalWords.toLocaleString()}\n\n`
md += '## Chapters\n\n'
md += '| # | Title | Paragraphs | Words | First line |\n'
md += '|---|-------|-----------|-------|------------|\n'

for (const ch of chapters) {
  const words = ch.paragraphs.reduce((s, p) => s + p.split(/\s+/).length, 0)
  const firstLine = ch.paragraphs[0].slice(0, 60).replace(/\|/g, '\\|') + '...'
  md += `| ${ch.number} | ${ch.title} | ${ch.paragraphs.length} | ${words} | ${firstLine} |\n`
}

fs.writeFileSync(path.join(__dirname, 'CHAPTERS.md'), md)
console.log('Written CHAPTERS.md for editorial review')
