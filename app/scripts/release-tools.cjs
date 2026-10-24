#!/usr/bin/env node
// Helpers for the staged release flow (.github/workflows/deploy.yml).
// Subcommands (all print `key=value` lines, safe to append to $GITHUB_OUTPUT):
//   migrations-changed <baseSha>   whether wrangler.jsonc "migrations" differ from <baseSha>
//   parse-upload <ndjsonFile>      version_id / preview_url from WRANGLER_OUTPUT_FILE_PATH
//   parse-deploy <ndjsonFile>      exact new version_id from a direct Wrangler deploy
//   current-version                version id serving 100% of production traffic
//   validate-version <id>          require an explicit Worker Version UUID
//   assert-current-version <id>     require production to still serve the recorded version
//   rollback-decision <prev> <current> <new>  decide whether an exact rollback is safe after a deploy attempt
//   assert-release-command         gate npm deploy/upload when a rollout is pending
//   assert-floor-source           require old reader UI and the reviewed storage proof before floor deployment
//   verify-reader-floor <id>      require checked-in floor manifest and exact current production version
//   verify-repair-predecessor <id> require the accepted reader still serving production
//   assert-repair-live            recheck the accepted predecessor immediately before Worker mutation
//   assert-normal-release         refuse an accidental push while the shared reader rollout is pending
// Read-only: nothing here changes Cloudflare state.
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const VERSION_ID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i
const FLOOR_PROOF = 'src/worker.rollbackFloor.test.ts'
const releaseDir = path.join(__dirname, '..', 'release')
const floorManifest = path.join(releaseDir, 'shared-reader-floor.json')
const rolloutState = path.join(releaseDir, 'shared-reader-rollout.json')
const ACCEPTED_READER_VERSION = '1bdaf83e-e30f-44bf-954c-46dc2edf66db'

function validatedVersion(value, label) {
  if (!VERSION_ID.test(value || '')) throw new Error(`${label} must be an explicit Worker Version UUID`)
  return value
}

function rollbackDecision(previous, current, expectedNew) {
  const target = validatedVersion(previous, 'rollback target')
  const serving = validatedVersion(current, 'currently serving production version')
  if (serving.toLowerCase() === target.toLowerCase()) return false
  if (serving.toLowerCase() !== validatedVersion(expectedNew, 'deployed version').toLowerCase()) {
    throw new Error(`production serves ${serving}, not the recorded previous version or promoted ${expectedNew}; refusing to guess a rollback`)
  }
  return true
}

function rolloutPhase() {
  if (!fs.existsSync(rolloutState)) return 'none'
  const state = JSON.parse(fs.readFileSync(rolloutState, 'utf8'))
  if (Object.keys(state).length !== 1 || !['floor-pending', 'pending', 'repair-pending', 'released'].includes(state.phase)) {
    throw new Error('shared reader rollout state must have one recognized phase')
  }
  return state.phase
}

function assertNormalRelease() {
  if (['floor-pending', 'pending', 'repair-pending'].includes(rolloutPhase())) {
    throw new Error('shared reader rollout is pending; use an explicitly approved floor, reader, or repair dispatch')
  }
}

function assertReleaseCommand() {
  const phase = rolloutPhase()
  if (phase !== 'pending' && phase !== 'floor-pending' && phase !== 'repair-pending') return
  const requested = phase === 'floor-pending' ? 'floor' : phase === 'pending' ? 'reader' : 'repair'
  if (process.env.GITHUB_ACTIONS !== 'true' || process.env.GITHUB_EVENT_NAME !== 'workflow_dispatch' ||
      process.env.TINCT_RELEASE_PHASE !== requested || process.env.TINCT_RELEASE_APPROVED !== 'true') {
    throw new Error(`${phase} blocks deploy/upload outside an explicitly approved ${requested} workflow dispatch`)
  }
  if (process.env.VITE_SHARED_READER_DEFAULT !== (requested === 'floor' ? '0' : '1')) {
    throw new Error(`${requested} release requires VITE_SHARED_READER_DEFAULT=${requested === 'floor' ? '0' : '1'} for the built bundle`)
  }
  if (requested === 'repair') {
    const expected = process.env.TINCT_RELEASE_EXPECTED_SHA || ''
    const actual = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    if (!/^[0-9a-f]{40}$/.test(expected) || actual !== expected || process.env.GITHUB_SHA !== expected) {
      throw new Error('repair requires the exact approved merge SHA in the checkout and dispatch')
    }
  }
}

function assertFloorSource() {
  if (rolloutPhase() !== 'floor-pending') throw new Error('floor requires the gated old-UI backend-only checkout')
  const root = path.join(__dirname, '..')
  const entry = fs.readFileSync(path.join(root, 'src', 'main.tsx'), 'utf8')
  const ownReader = fs.readFileSync(path.join(root, 'src', 'lab', 'userBook', 'UserBookReader.tsx'), 'utf8')
  if (fs.existsSync(path.join(root, 'src', 'sharedReaderActivation.ts')) ||
      fs.existsSync(path.join(root, 'src', 'lab', 'sharedReader')) ||
      /sharedReader/.test(entry) || /sharedReader/.test(ownReader)) {
    throw new Error('floor source contains the new shared reader; only old UI with write-old backend policy can establish the floor')
  }
  if (!fs.existsSync(path.join(root, FLOOR_PROOF))) throw new Error(`missing required floor format proof ${FLOOR_PROOF}`)
  console.log(`proof=${FLOOR_PROOF}`)
}

function verifyReaderFloor(serving, manifestPath = floorManifest) {
  const current = validatedVersion(serving, 'currently serving production version')
  if (rolloutPhase() !== 'pending') throw new Error('reader release requires the pending rollout state')
  if (!fs.existsSync(manifestPath)) throw new Error('reader release requires a reviewed shared-reader-floor.json with the real compatible floor version')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  if (Object.keys(manifest).sort().join(',') !== 'floorCommit,floorVersionId,proof,v' ||
      manifest.v !== 1 || !/^[0-9a-f]{40}$/.test(manifest.floorCommit || '') ||
      manifest.proof !== FLOOR_PROOF) {
    throw new Error('compatible floor manifest must name the reviewed commit and exact format proof')
  }
  const floor = validatedVersion(manifest.floorVersionId, 'compatible floor version')
  if (floor.toLowerCase() !== current.toLowerCase()) {
    throw new Error(`production serves ${current}, not the pinned compatible floor ${floor}; abort before changing traffic`)
  }
  console.log(`floor_version_id=${floor}`)
}

function verifyRepairPredecessor(serving) {
  const current = validatedVersion(serving, 'currently serving production version')
  if (rolloutPhase() !== 'repair-pending') throw new Error('repair requires the gated repair-pending rollout state')
  if (current.toLowerCase() !== ACCEPTED_READER_VERSION) {
    throw new Error(`production serves ${current}, not the pinned accepted reader ${ACCEPTED_READER_VERSION}; abort before changing traffic`)
  }
  console.log(`repair_predecessor_version=${ACCEPTED_READER_VERSION}`)
}

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

function parseDeploy(file) {
  const entries = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line))
  const deploy = entries.filter(e => e.type === 'deploy').pop()
  return validatedVersion(deploy?.version_id, 'direct deployment version')
}

function currentVersion() {
  const raw = execFileSync('npx', ['wrangler', 'deployments', 'list', '--json'], { encoding: 'utf8' })
  const deployments = JSON.parse(raw.slice(raw.indexOf('[')))
  const latest = deployments.sort((a, b) => a.created_on.localeCompare(b.created_on)).pop()
  const versions = (latest && latest.versions) || []
  if (versions.length !== 1 || versions[0].percentage !== 100) {
    throw new Error('production is not serving a single version at 100%; resolve manually before releasing')
  }
  return validatedVersion(versions[0].version_id, 'production version')
}

const [cmd, arg, current, expectedNew] = process.argv.slice(2)
try {
  if (cmd === 'migrations-changed') console.log(`changed=${migrationsChanged(arg)}`)
  else if (cmd === 'parse-upload') {
    const r = parseUpload(arg)
    console.log(`version_id=${r.version_id}\npreview_url=${r.preview_url}`)
  } else if (cmd === 'current-version') console.log(`version_id=${currentVersion()}`)
  else if (cmd === 'parse-deploy') console.log(`version_id=${parseDeploy(arg)}`)
  else if (cmd === 'validate-version') console.log(`version_id=${validatedVersion(arg, 'rollback target')}`)
  else if (cmd === 'assert-release-command') assertReleaseCommand()
  else if (cmd === 'assert-normal-release') assertNormalRelease()
  else if (cmd === 'assert-floor-source') assertFloorSource()
  else if (cmd === 'verify-reader-floor') verifyReaderFloor(arg, current || floorManifest)
  else if (cmd === 'verify-repair-predecessor') verifyRepairPredecessor(arg)
  else if (cmd === 'assert-repair-live') {
    if (process.env.TINCT_RELEASE_PHASE === 'repair') verifyRepairPredecessor(currentVersion())
  }
  else if (cmd === 'assert-current-version') {
    const expected = validatedVersion(arg, 'recorded previous version')
    const actual = currentVersion()
    if (actual.toLowerCase() !== expected.toLowerCase()) throw new Error(`production changed from recorded version ${expected} to ${actual}; abort before changing traffic`)
    console.log(`version_id=${actual}`)
  }
  else if (cmd === 'rollback-decision') console.log(`rollback=${rollbackDecision(arg, current, expectedNew)}`)
  else {
    console.error('usage: release-tools.cjs migrations-changed <baseSha> | parse-upload <file> | parse-deploy <file> | current-version | validate-version <id> | assert-current-version <id> | rollback-decision <prev> <current> <new> | assert-release-command | assert-floor-source | verify-reader-floor <id> | verify-repair-predecessor <id> | assert-repair-live | assert-normal-release')
    process.exit(2)
  }
} catch (error) {
  console.error(`release-tools: ${error.message}`)
  process.exit(1)
}
