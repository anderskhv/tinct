#!/usr/bin/env node
// Pre-deploy guard. Reads the latest dist/assets/index-*.js and confirms the
// production env vars baked in at build time. Exits non-zero if any are missing
// — prevents the "Auth not configured" outage that hit prod when a build ran
// without .env present (or with SKIP_ENV_CHECK=1).
const fs = require('fs')
const path = require('path')

const assetsDir = path.join(__dirname, '..', 'dist', 'assets')
const files = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : []
const bundle = files.find(n => n.startsWith('index-') && n.endsWith('.js'))
if (!bundle) {
  console.error('✗ no dist/assets/index-*.js bundle found — run `npm run build` first')
  process.exit(1)
}

// Vite can factor shared client code into an imported chunk when the build has
// more than one browser entry (the Lab auth surfaces are deliberately separate
// from the reader SPA). Verify the complete reachable app graph rather than
// assuming every public env value remains textually inside index-*.js.
const visited = new Set()
function readBundleGraph(filePath) {
  const resolved = path.resolve(filePath)
  if (visited.has(resolved) || !fs.existsSync(resolved)) return ''
  visited.add(resolved)
  const source = fs.readFileSync(resolved, 'utf8')
  const imports = [...source.matchAll(/(?:from\s*|import\s*)["']([^"']+\.js)["']/g)]
    .map(match => path.resolve(path.dirname(resolved), match[1]))
  return [source, ...imports.map(readBundleGraph)].join('\n')
}

const content = readBundleGraph(path.join(assetsDir, bundle))

const checks = [
  ['supabase URL',       'yazjyiqsxjystvpkyouk'],
  ['supabase anon JWT',  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'],
  ['Worker audio route', '/api/audio-file'],
]

const missing = checks.filter(([, needle]) => !content.includes(needle))
if (missing.length) {
  console.error(`\n✗ BUNDLE VERIFICATION FAILED — ${bundle} is missing:`)
  for (const [label] of missing) console.error('  •', label)
  console.error('\nThis bundle would deploy a broken app (auth/audio dead).')
  console.error('Re-run `npm run build` with .env present. Do NOT deploy.\n')
  process.exit(1)
}

// SECURITY GUARD — fail loud if a secret-shaped string slipped into the
// client bundle. Added 2026-04-27 after Poetry Editor leaked an Anthropic
// key via VITE_ANTHROPIC_API_KEY. Tinct uses a Worker proxy so this
// shouldn't happen, but a defensive grep is free insurance against a
// future regression where someone adds VITE_*ANTHROPIC*, dangerouslyAllowBrowser,
// or otherwise pulls a secret into client code.
const secretPatterns = [
  ['Anthropic API key (sk-ant-)',     /sk-ant-[A-Za-z0-9_-]{20,}/],
  ['OpenAI API key (sk-proj- / sk-)', /sk-(proj-)?[a-zA-Z0-9_-]{40,}/],
  ['Google API key (AIza...)',         /AIza[A-Za-z0-9_-]{35}/],
  ['dangerouslyAllowBrowser flag',     /dangerouslyAllowBrowser/],
  ['anthropic-dangerous-direct hdr',   /anthropic-dangerous-direct-browser-access/],
]

const leaks = []
for (const [label, pattern] of secretPatterns) {
  const m = content.match(pattern)
  if (m) leaks.push({ label, snippet: m[0].slice(0, 24) + (m[0].length > 24 ? '…' : '') })
}
if (leaks.length) {
  console.error(`\n✗ SECURITY: ${bundle} contains potential secret leaks:`)
  for (const { label, snippet } of leaks) console.error('  •', label, '→', snippet)
  console.error('\nDO NOT DEPLOY. Move the secret behind worker.ts or revoke it.')
  console.error('See SECURITY-AUDIT-2026-04-27.md for the audit pattern.\n')
  process.exit(1)
}

console.log(`✓ bundle ${bundle} contains all expected env vars and no leaked secrets`)
