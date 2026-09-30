#!/usr/bin/env node
// Helpers for the staged release flow (.github/workflows/deploy.yml).
// Subcommands (all print `key=value` lines, safe to append to $GITHUB_OUTPUT):
//   migrations-changed <baseSha>   whether wrangler.jsonc "migrations" differ from <baseSha>
//   parse-upload <ndjsonFile>      version_id / preview_url from WRANGLER_OUTPUT_FILE_PATH
//   current-version                version id serving 100% of production traffic
// Read-only: nothing here changes Cloudflare state.
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

// wrangler.jsonc allows comments and trailing commas; strip them outside strings.
function parseJsonc(text) {
  let out = ''
  let inString = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    const n = text[i + 1]
    if (inString) {
      out += c
      if (c === '\\') out += text[++i]
      else if (c === '"') inString = false
    } else if (c === '"') {
      inString = true
      out += c
    } else if (c === '/' && n === '/') {
      while (i < text.length && text[i] !== '\n') i++
      out += '\n'
    } else if (c === '/' && n === '*') {
      i += 2
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++
      i++
    } else out += c
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'))
}

function migrationsOf(text) {
  return JSON.stringify(parseJsonc(text).migrations ?? [])
}

function migrationsChanged(base) {
  if (!base || /^0+$/.test(base)) return 'unknown'
  const current = fs.readFileSync(path.join(__dirname, '..', 'wrangler.jsonc'), 'utf8')
  try {
    const before = execFileSync('git', ['show', `${base}:app/wrangler.jsonc`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    return migrationsOf(before) === migrationsOf(current) ? 'false' : 'true'
  } catch {
    return 'unknown' // base commit unavailable: caller must take the conservative path
  }
}

function parseUpload(file) {
  const entries = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line))
  const upload = entries.filter(e => e.type === 'version-upload').pop()
  if (!upload || !upload.version_id) throw new Error('no version-upload entry in wrangler output')
  return { version_id: upload.version_id, preview_url: upload.preview_url || '' }
}

function currentVersion() {
  const raw = execFileSync('npx', ['wrangler', 'deployments', 'list', '--json'], { encoding: 'utf8' })
  const deployments = JSON.parse(raw.slice(raw.indexOf('[')))
  const latest = deployments.sort((a, b) => a.created_on.localeCompare(b.created_on)).pop()
  const versions = (latest && latest.versions) || []
  if (versions.length !== 1 || versions[0].percentage !== 100) {
    throw new Error('production is not serving a single version at 100%; resolve manually before releasing')
  }
  return versions[0].version_id
}

const [cmd, arg] = process.argv.slice(2)
try {
  if (cmd === 'migrations-changed') console.log(`changed=${migrationsChanged(arg)}`)
  else if (cmd === 'parse-upload') {
    const r = parseUpload(arg)
    console.log(`version_id=${r.version_id}\npreview_url=${r.preview_url}`)
  } else if (cmd === 'current-version') console.log(`version_id=${currentVersion()}`)
  else {
    console.error('usage: release-tools.cjs migrations-changed <baseSha> | parse-upload <file> | current-version')
    process.exit(2)
  }
} catch (error) {
  console.error(`release-tools: ${error.message}`)
  process.exit(1)
}
