#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const appDir = path.resolve(__dirname, '..')
const editionsDir = path.join(appDir, 'public/data/editions')
const outRoot = path.join(appDir, 'public/data/editions-chapters')

const targets = process.argv.slice(2)
if (targets.length === 0) {
  console.error('Usage: node scripts/split-edition-chapters.cjs <bookId-editionKey> [...]')
  process.exit(1)
}

function assertSafeId(id) {
  if (!/^[a-z0-9-]+$/.test(id)) {
    throw new Error(`Unsafe edition id: ${id}`)
  }
}

for (const id of targets) {
  assertSafeId(id)
  const input = path.join(editionsDir, `${id}.json`)
  if (!fs.existsSync(input)) {
    throw new Error(`Missing edition file: ${input}`)
  }
  const data = JSON.parse(fs.readFileSync(input, 'utf8'))
  if (!data || !Array.isArray(data.chapters) || data.chapters.length === 0) {
    throw new Error(`Invalid edition file: ${input}`)
  }

  const outDir = path.join(outRoot, id)
  fs.rmSync(outDir, { recursive: true, force: true })
  fs.mkdirSync(outDir, { recursive: true })

  const lastDash = id.lastIndexOf('-')
  const secondLastDash = id.lastIndexOf('-', lastDash - 1)
  if (secondLastDash < 0) throw new Error(`Cannot infer edition key from ${id}`)
  const bookId = id.slice(0, secondLastDash)
  const editionKey = id.slice(secondLastDash + 1)

  const manifest = {
    format: 'tinct-edition-chapters-v1',
    manifestRevision: 1,
    bookId,
    editionKey,
    chapters: data.chapters.map(ch => {
      const file = `ch${String(ch.number).padStart(4, '0')}.json`
      const chapter = {
        number: ch.number,
        title: ch.title || `Chapter ${ch.number}`,
        ...(ch.section ? { section: ch.section } : {}),
        paragraphs: ch.paragraphs,
      }
      fs.writeFileSync(path.join(outDir, file), `${JSON.stringify(chapter)}\n`)
      return {
        number: ch.number,
        title: chapter.title,
        ...(ch.section ? { section: ch.section } : {}),
        path: file,
        paragraphCount: Array.isArray(ch.paragraphs) ? ch.paragraphs.length : 0,
      }
    }),
    ...(data.sections ? { sections: data.sections } : {}),
  }

  fs.writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest)}\n`)
  console.log(`[split-edition] ${id}: ${manifest.chapters.length} chapters`)
}
