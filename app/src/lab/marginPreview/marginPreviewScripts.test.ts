import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// The preview frame needs tinct-book.js loaded after reader.js and before start.js.
// A merge dropped it once (#492) and the preview could not open a book.
describe('margin preview: the addbook page loads tinct-book.js', () => {
  for (const file of ['public/lab/addbook/index.html', '../addbooks/web/src/index.html']) {
    it(file, () => {
      const html = readFileSync(resolve(__dirname, '../../..', file), 'utf8')
      const reader = html.indexOf('src="js/reader.js')
      const book = html.indexOf('src="js/tinct-book.js')
      const start = html.indexOf('src="js/start.js')
      expect(book).toBeGreaterThan(reader)
      expect(start).toBeGreaterThan(book)
    })
  }
})
