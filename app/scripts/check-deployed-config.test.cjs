const {test} = require('node:test')
const assert = require('node:assert/strict')
const {readGraph} = require('./check-deployed-config.cjs')

test('finds configuration across shared lab modules and cyclic asset imports', async () => {
  const files = new Map([
    ['/assets/index-reader.js', 'import "../lab/native-books.js";const audio="/api/audio-file";'],
    ['/lab/native-books.js', 'import {config} from "../assets/supabase-shared.js";'],
    ['/assets/supabase-shared.js', 'import "./index-reader.js";const config="supabase.co eyJhbGciOi";'],
  ])
  const fetched = []
  const source = await readGraph(new URL('https://tinct.app/assets/index-reader.js'), async url => {
    fetched.push(url.pathname)
    assert(files.has(url.pathname))
    return files.get(url.pathname)
  })
  assert.match(source, /supabase\.co eyJhbGciOi/)
  assert.match(source, /\/api\/audio-file/)
  assert.equal(fetched.length, 3)
})

for (const target of ['https://outside.invalid/assets/config.js', '/api/config.js', '/private/config.js', '/lab/library_2/app.js']) {
  test('rejects imports outside the public bundle directories: '+target, async () => {
    const fetched = []
    await assert.rejects(readGraph(new URL('https://tinct.app/assets/index-reader.js'), async url => {
      fetched.push(url.href)
      return 'import "'+target+'";'
    }), /Unexpected bundle import/)
    assert.deepEqual(fetched, ['https://tinct.app/assets/index-reader.js'])
  })
}

test('reads configuration from the currently published reader graph', {skip:process.env.TINCT_CONFIG_LIVE!=='1',timeout:90000}, async () => {
  const page = await fetch('https://tinct.app/reader')
  assert.equal(page.status, 200)
  const html = await page.text()
  const entry = html.match(/src="(\/assets\/index-[A-Za-z0-9_-]+\.js)"/)?.[1]
  assert(entry, 'published reader entry')
  const graph = await readGraph(new URL(entry, 'https://tinct.app'))
  for (const marker of ['/api/audio-file', 'supabase.co', 'eyJhbGciOi']) assert(graph.includes(marker), marker)
})
