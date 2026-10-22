// The book ids on OFFERED_DANISH_EDITIONS (app/src/data/editionAvailability.ts),
// read from the source so the acceptance scripts never keep their own copy of
// the allowlist. Only exact `bookId/modern-da` identities are listed there.
const fs = require('node:fs')
const path = require('node:path')

function offeredDanishBooks() {
  const source = fs.readFileSync(path.join(__dirname, '../../src/data/editionAvailability.ts'), 'utf8')
  const body = source.split('OFFERED_DANISH_EDITIONS: ReadonlySet<string> = new Set([')[1]?.split('])')[0]
  if (!body) throw new Error('OFFERED_DANISH_EDITIONS not found in editionAvailability.ts')
  const books = [...body.matchAll(/^\s*'([a-z0-9-]+)\/modern-da',/gm)].map(match => match[1])
  if (books.length === 0) throw new Error('OFFERED_DANISH_EDITIONS lists no modern-da edition')
  return books
}

module.exports = { offeredDanishBooks }
