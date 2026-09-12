#!/usr/bin/env node
/**
 * Scope-measurement script for the underscore-italics bug.
 *
 * Scans app/public/data/editions/*.json (whole-edition files) and the
 * per-chapter shards under app/public/data/editions-chapters/ (the lab
 * reader's actual source for chapter-sharded editions — see
 * src/data/editionShardRegistry.ts and src/data/editionLoader.ts) for
 * paragraphs carrying Project Gutenberg's `_..._` emphasis markup.
 *
 * "Matched pair" here uses the same word-boundary rule the render-time fix
 * uses (src/lab/labEmphasis.ts): an underscore counts as an emphasis
 * delimiter only when it sits at a token edge, so snake_case identifiers and
 * lone/unmatched underscores are not counted.
 *
 * Read-only. Never writes to any edition JSON.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const EDITIONS_DIR = path.join(ROOT, 'public', 'data', 'editions')
const CHAPTERS_DIR = path.join(ROOT, 'public', 'data', 'editions-chapters')

// Same rule as src/lab/labEmphasis.ts: \b immediately before/after the
// delimiter relies on `_` being a \w character, so a transition from a
// word char lands inside a token (snake_case) and is excluded.
const UNDERSCORE_EMPHASIS_RE = /\b_([^_\n]+)_\b/g

function countMatches(text) {
  if (typeof text !== 'string' || !text.includes('_')) return 0
  UNDERSCORE_EMPHASIS_RE.lastIndex = 0
  let count = 0
  while (UNDERSCORE_EMPHASIS_RE.exec(text)) count += 1
  return count
}

function scanParagraphs(paragraphs, bucket) {
  if (!Array.isArray(paragraphs)) return
  for (const paragraph of paragraphs) {
    const matches = countMatches(paragraph)
    if (matches > 0) {
      bucket.paragraphs += 1
      bucket.pairs += matches
    }
  }
}

function editionIdFromFilename(filename) {
  // "{bookId}-{original-en|modern-en|modern-da}.json" — bookId itself may
  // contain hyphens, so strip the known edition-key suffix instead of
  // splitting on the first hyphen.
  const base = filename.replace(/\.json$/, '')
  const match = base.match(/^(.*)-(original-en|modern-en|modern-da|kjv-en|web-en)$/)
  if (!match) return null
  return { bookId: match[1], editionKey: match[2] }
}

function newBucket() {
  return { paragraphs: 0, pairs: 0 }
}

function addBucket(target, source) {
  target.paragraphs += source.paragraphs
  target.pairs += source.pairs
}

function scanWholeEditionFiles() {
  const results = new Map() // key: bookId-editionKey -> bucket
  if (!fs.existsSync(EDITIONS_DIR)) return results
  for (const filename of fs.readdirSync(EDITIONS_DIR)) {
    if (!filename.endsWith('.json')) continue
    const parsed = editionIdFromFilename(filename)
    if (!parsed) continue // e.g. "*-threads.json" — not reader paragraph text
    const filePath = path.join(EDITIONS_DIR, filename)
    let data
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    } catch (err) {
      console.error(`Skipping unparsable ${filename}: ${err.message}`)
      continue
    }
    const bucket = newBucket()
    const chapters = Array.isArray(data?.chapters) ? data.chapters : []
    for (const chapter of chapters) {
      scanParagraphs(chapter?.paragraphs, bucket)
    }
    if (bucket.paragraphs > 0) {
      results.set(`${parsed.bookId}-${parsed.editionKey}`, { ...parsed, ...bucket })
    }
  }
  return results
}

function scanChapterShards() {
  const results = new Map() // key: bookId-editionKey -> bucket
  if (!fs.existsSync(CHAPTERS_DIR)) return results
  for (const editionDir of fs.readdirSync(CHAPTERS_DIR)) {
    const dirPath = path.join(CHAPTERS_DIR, editionDir)
    if (!fs.statSync(dirPath).isDirectory()) continue
    const parsed = editionIdFromFilename(editionDir)
    if (!parsed) continue
    const bucket = newBucket()
    for (const filename of fs.readdirSync(dirPath)) {
      if (!/^ch\d+\.json$/.test(filename)) continue // skip manifest.json etc.
      let data
      try {
        data = JSON.parse(fs.readFileSync(path.join(dirPath, filename), 'utf8'))
      } catch (err) {
        console.error(`Skipping unparsable ${editionDir}/${filename}: ${err.message}`)
        continue
      }
      scanParagraphs(data?.paragraphs, bucket)
    }
    if (bucket.paragraphs > 0) {
      results.set(`${parsed.bookId}-${parsed.editionKey}`, { ...parsed, ...bucket })
    }
  }
  return results
}

function main() {
  const wholeFile = scanWholeEditionFiles()
  const shard = scanChapterShards()

  // The lab reader (src/lab/labSource.ts -> data/editionLoader.ts) reads the
  // chapter shard for any edition registered in CHAPTER_SHARDED_EDITION_IDS,
  // and the whole-edition file otherwise. Report combined "as read by the
  // reader" numbers (shard wins where both exist, since the reader would use
  // the shard) alongside the two raw scans, so a divergence between the two
  // copies of the same edition is visible rather than silently averaged away.
  const allKeys = new Set([...wholeFile.keys(), ...shard.keys()])
  const perEdition = []
  const totals = { wholeFile: newBucket(), shard: newBucket(), asRead: newBucket() }
  for (const key of [...allKeys].sort()) {
    const w = wholeFile.get(key)
    const s = shard.get(key)
    if (w) addBucket(totals.wholeFile, w)
    if (s) addBucket(totals.shard, s)
    const asRead = s || w
    if (asRead) addBucket(totals.asRead, asRead)
    perEdition.push({
      edition: key,
      bookId: (w || s).bookId,
      editionKey: (w || s).editionKey,
      wholeFile: w ? { paragraphs: w.paragraphs, pairs: w.pairs } : null,
      shard: s ? { paragraphs: s.paragraphs, pairs: s.pairs } : null,
      divergent: !!(w && s && (w.paragraphs !== s.paragraphs || w.pairs !== s.pairs)),
    })
  }

  const perBook = new Map()
  for (const row of perEdition) {
    const asRead = row.shard || row.wholeFile
    const existing = perBook.get(row.bookId) || { bookId: row.bookId, paragraphs: 0, pairs: 0, editions: [] }
    existing.paragraphs += asRead.paragraphs
    existing.pairs += asRead.pairs
    existing.editions.push(row.editionKey)
    perBook.set(row.bookId, existing)
  }
  const perBookSorted = [...perBook.values()].sort((a, b) => b.pairs - a.pairs)

  const report = {
    generatedAt: new Date().toISOString(),
    note: 'Read-only scope scan for the _underscore_ emphasis render bug. Counts use word-boundary matching (see src/lab/labEmphasis.ts) so snake_case / unmatched underscores are excluded.',
    totals,
    affectedBookCount: perBookSorted.length,
    affectedEditionCount: perEdition.length,
    perBook: perBookSorted,
    perEdition,
  }

  const outDir = path.join(ROOT, '..', 'docs', 'verification', 'underscore-italics-2026-09-12')
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'scope-report.json'), JSON.stringify(report, null, 2) + '\n')

  console.log(`Affected books: ${perBookSorted.length}`)
  console.log(`Affected editions: ${perEdition.length}`)
  console.log(`Paragraphs with markup (as read by the reader): ${totals.asRead.paragraphs}`)
  console.log(`Emphasis pairs (as read by the reader): ${totals.asRead.pairs}`)
  console.log('')
  console.log('Per book (paragraphs / pairs, editions affected):')
  for (const book of perBookSorted) {
    console.log(`  ${book.bookId}: ${book.paragraphs} paragraphs / ${book.pairs} pairs [${book.editions.join(', ')}]`)
  }
  const divergent = perEdition.filter(e => e.divergent)
  if (divergent.length > 0) {
    console.log('')
    console.log('Whole-file vs shard count mismatches (reader uses the shard when both exist):')
    for (const row of divergent) {
      console.log(`  ${row.edition}: wholeFile=${JSON.stringify(row.wholeFile)} shard=${JSON.stringify(row.shard)}`)
    }
  }
  console.log('')
  console.log(`Full report written to docs/verification/underscore-italics-2026-09-12/scope-report.json`)
}

main()
