#!/usr/bin/env node
/**
 * Validate a words.json sidecar against TimedWord rules and optional token counts.
 *
 * Usage:
 *   node scripts/validate-words-sidecar.cjs path/to/words.json
 *   node scripts/validate-words-sidecar.cjs path/to/words.json --edition bible-kjv-en --chapter 768
 */
const fs = require('node:fs')
const path = require('node:path')

const repoRoot = path.resolve(__dirname, '..', '..')

const romanToArabic = {
  I: '1', II: '2', III: '3', IV: '4', V: '5', VI: '6', VII: '7', VIII: '8',
  IX: '9', X: '10', XI: '11', XII: '12', XIII: '13', XIV: '14', XV: '15',
  XVI: '16', XVII: '17', XVIII: '18', XIX: '19', XX: '20', XXI: '21',
  XXII: '22', XXIII: '23', XXIV: '24',
}

function cleanText(text) {
  return text
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, '')
    .replace(/\b(Act|Scene|Book|Chapter|Part|Canto|Volume)\s+([IVX]+)\b/g,
      (match, prefix, roman) => romanToArabic[roman] ? `${prefix} ${romanToArabic[roman]}` : match)
    .replace(/\b([A-Z]{2,})\b/g, (word) => word.charAt(0) + word.slice(1).toLowerCase())
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/ {2,}/g, ' ')
    .trim()
}

function chapterWordsFromText(text) {
  return text.split(/\s+/).map((part) => part.trim()).filter(Boolean)
}

function isTimedWord(word) {
  return word
    && typeof word.text === 'string'
    && typeof word.start === 'number'
    && Number.isFinite(word.start)
    && typeof word.end === 'number'
    && Number.isFinite(word.end)
    && word.end >= word.start
}

function loadExpectedParagraphs(bookEdition, chapterNumber) {
  const shard = path.join(
    repoRoot,
    'app/public/data/editions-chapters',
    bookEdition,
    `ch${String(chapterNumber).padStart(4, '0')}.json`,
  )
  let chapter = null
  if (fs.existsSync(shard)) {
    chapter = JSON.parse(fs.readFileSync(shard, 'utf8'))
  } else {
    const fullEdition = path.join(repoRoot, 'app/public/data/editions', `${bookEdition}.json`)
    if (!fs.existsSync(fullEdition)) return null
    const data = JSON.parse(fs.readFileSync(fullEdition, 'utf8'))
    chapter = (data.chapters || []).find((item) => item.number === chapterNumber)
  }
  if (!chapter) return null
  return (chapter.paragraphs || []).map((paragraph) => (
    chapterWordsFromText(cleanText(paragraph.replace(/\n/g, ' ')))
  ))
}

function validate(sidecar, expectedParagraphs) {
  const errors = []
  const paragraphs = sidecar.paragraphs
  if (!Array.isArray(paragraphs)) {
    return ['paragraphs must be an array']
  }
  const seen = new Set()
  for (const entry of paragraphs) {
    const pidx = entry.paragraph
    const words = entry.words
    if (!Number.isInteger(pidx)) errors.push('paragraph index missing')
    if (seen.has(pidx)) errors.push(`paragraph ${pidx}: duplicate entry`)
    seen.add(pidx)
    if (!Array.isArray(words) || words.length === 0) {
      errors.push(`paragraph ${pidx}: empty words`)
      continue
    }
    for (let i = 0; i < words.length; i++) {
      if (!isTimedWord(words[i])) errors.push(`paragraph ${pidx} word ${i}: invalid`)
      if (i > 0 && words[i].start < words[i - 1].start) {
        errors.push(`paragraph ${pidx}: non-monotonic start at word ${i}`)
      }
    }
    if (expectedParagraphs && pidx >= 0 && pidx < expectedParagraphs.length) {
      const exp = expectedParagraphs[pidx]
      if (words.length !== exp.length) {
        errors.push(`paragraph ${pidx}: ${words.length} words != expected ${exp.length}`)
      } else {
        const mismatch = words.findIndex((word, index) => word.text !== exp[index])
        if (mismatch >= 0) {
          errors.push(`paragraph ${pidx} word ${mismatch}: text does not match edition token`)
        }
      }
    }
  }
  if (expectedParagraphs) {
    expectedParagraphs.forEach((words, index) => {
      if (words.length > 0 && !seen.has(index)) errors.push(`paragraph ${index}: missing sidecar entry`)
    })
  }
  return errors
}

function main() {
  const args = process.argv.slice(2)
  const file = args.find((a) => !a.startsWith('--'))
  if (!file) {
    console.error('Usage: node validate-words-sidecar.cjs <words.json> [--edition bible-kjv-en --chapter N]')
    process.exit(1)
  }
  const editionArg = args.find((a) => a.startsWith('--edition='))?.slice(10)
    || (args.includes('--edition') ? args[args.indexOf('--edition') + 1] : null)
  const chapterArg = args.find((a) => a.startsWith('--chapter='))?.slice(10)
    || (args.includes('--chapter') ? args[args.indexOf('--chapter') + 1] : null)

  const sidecar = JSON.parse(fs.readFileSync(file, 'utf8'))
  let expected = null
  if (editionArg && chapterArg) {
    expected = loadExpectedParagraphs(editionArg, Number(chapterArg))
  }
  const errors = validate(sidecar, expected)
  if (errors.length) {
    console.error('INVALID words.json:')
    errors.forEach((e) => console.error(`  - ${e}`))
    process.exit(1)
  }
  console.log(`OK: ${file} (${sidecar.paragraphs?.length ?? 0} paragraphs)`)
}

if (require.main === module) main()

module.exports = { chapterWordsFromText, cleanText, isTimedWord, loadExpectedParagraphs, validate }

