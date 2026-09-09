// Check the reachable static import graph, as verify-bundle does locally.
// Public configuration may live in a shared chunk, not the reader entry file.
const entry = new URL(process.argv[2])
const visited = new Set()
async function readGraph(url) {
  if (visited.has(url.href)) return ''
  if (url.origin !== entry.origin || !url.pathname.startsWith('/assets/')) throw new Error('Unexpected bundle import')
  visited.add(url.href)
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 Tinct-Smoke-Test' } })
  if (!response.ok) throw new Error(`Bundle request failed: ${response.status}`)
  const source = await response.text()
  if (/^\s*</.test(source)) throw new Error('Bundle request returned HTML')
  const imports = [...source.matchAll(/(?:from\s*|import\s*)["']([^"']+\.js)["']/g)]
  const children = await Promise.all(imports.map(match => readGraph(new URL(match[1], url))))
  return [source, ...children].join('\n')
}
readGraph(entry).then(source => {
  if (source.includes('supabase.co')) console.log('supabase-url')
  if (source.includes('eyJhbGciOi')) console.log('supabase-key')
}).catch(error => { console.error(error.message); process.exitCode = 1 })
