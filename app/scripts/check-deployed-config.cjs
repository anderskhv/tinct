// Check the reachable static import graph, as verify-bundle does locally.
// Public configuration may live in a shared chunk, not the reader entry file.
const entry = new URL(process.argv[2])
const visited = new Set()

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// A Workers assets deploy can expose the new HTML before every hashed import
// is reachable at every edge. The caller has already waited for the entry
// bytes, but this graph walk performs fresh requests and must tolerate the
// same short propagation window for the entry and its static imports.
async function fetchJavaScript(url, attempts = 12) {
  let last = 'unavailable'
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 Tinct-Smoke-Test' } })
      const source = response.ok ? await response.text() : ''
      if (response.ok && !/^\s*</.test(source)) return source
      last = response.ok ? 'returned HTML' : `failed: ${response.status}`
    } catch (error) {
      last = error instanceof Error ? error.message : String(error)
    }
    if (attempt < attempts) await wait(5_000)
  }
  throw new Error(`Bundle request ${last} after ${attempts} attempts`)
}

async function readGraph(url) {
  if (visited.has(url.href)) return ''
  if (url.origin !== entry.origin || !url.pathname.startsWith('/assets/')) throw new Error('Unexpected bundle import')
  visited.add(url.href)
  const source = await fetchJavaScript(url)
  const imports = [...source.matchAll(/(?:from\s*|import\s*)["']([^"']+\.js)["']/g)]
  const children = await Promise.all(imports.map(match => readGraph(new URL(match[1], url))))
  return [source, ...children].join('\n')
}
readGraph(entry).then(source => {
  if (source.includes('/api/audio-file')) console.log('audio-route')
  if (source.includes('supabase.co')) console.log('supabase-url')
  if (source.includes('eyJhbGciOi')) console.log('supabase-key')
}).catch(error => { console.error(error.message); process.exitCode = 1 })
