import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const helper = fileURLToPath(new URL('../scripts/release-tools.cjs', import.meta.url))
const activationCheck = fileURLToPath(new URL('../scripts/check-release-activation.mjs', import.meta.url))
const deploy = readFileSync(fileURLToPath(new URL('../../.github/workflows/deploy.yml', import.meta.url)), 'utf8')
const voice = readFileSync(fileURLToPath(new URL('../../.github/workflows/voice-lab-acceptance.yml', import.meta.url)), 'utf8')
const previous = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const promoted = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const foreign = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const acceptedReader = '5270c78c-4820-4fea-94ec-77cec017c326'
const currentSource = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
const run = (args: string[], env: Record<string, string> = {}) => spawnSync(process.execPath, [helper, ...args], {
  encoding: 'utf8', env: {
    ...process.env,
    // Each case models its own caller, including when the parent test process
    // runs inside an approved production dispatch. Never inherit its approval.
    GITHUB_ACTIONS: '', GITHUB_EVENT_NAME: '', GITHUB_SHA: '', TINCT_RELEASE_PHASE: '',
    TINCT_RELEASE_APPROVED: '', TINCT_RELEASE_EXPECTED_SHA: '', VITE_SHARED_READER_DEFAULT: '',
    ...env,
  },
})

describe('release rollback guards (offline)', () => {
  it('rejects missing and malformed recorded Worker versions before they can become rollback targets', () => {
    expect(run(['validate-version', previous]).stdout.trim()).toBe(`version_id=${previous}`)
    for (const value of ['', 'not-a-version', '0'.repeat(32)]) {
      const result = run(['validate-version', value])
      expect(result.status).toBe(1)
      expect(result.stderr).toContain('explicit Worker Version UUID')
    }
  })

  it('never lets an automatic rollback guess the previous deployment', () => {
    expect(run(['validate-version', '']).status).toBe(1)
    expect(run(['rollback-decision', '', promoted]).status).toBe(1)
    expect(run(['rollback-decision', previous, previous, promoted]).stdout.trim()).toBe('rollback=false')
    expect(run(['rollback-decision', previous, promoted, promoted]).stdout.trim()).toBe('rollback=true')
    expect(run(['rollback-decision', previous, promoted]).status).toBe(1)
    expect(run(['rollback-decision', previous, foreign, promoted]).status).toBe(1)
    expect(run(['rollback-decision', previous, 'ambiguous', promoted]).status).toBe(1)
  })

  it('captures the direct deploy UUID and refuses missing or ambiguous output', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tinct-deploy-test-'))
    const file = join(dir, 'wrangler.ndjson')
    try {
      writeFileSync(file, JSON.stringify({ type: 'deploy', version: 1, version_id: promoted }) + '\n')
      expect(run(['parse-deploy', file]).stdout.trim()).toBe(`version_id=${promoted}`)
      writeFileSync(file, JSON.stringify({ type: 'deploy', version: 1, version_id: '' }) + '\n')
      expect(run(['parse-deploy', file]).status).toBe(1)
      writeFileSync(file, JSON.stringify({ type: 'version-upload', version_id: promoted }) + '\n')
      expect(run(['parse-deploy', file]).status).toBe(1)
    } finally { rmSync(dir, { recursive: true, force: true }) }
    expect(deploy).toContain('steps.deploy.outputs.version_id || steps.upload.outputs.version_id')
    expect(deploy).toContain('parse-deploy "$WRANGLER_OUTPUT_FILE_PATH"')
  })

  it('gates local npm release entry points while the reader repair is pending', () => {
    expect(run(['assert-release-command']).stderr).toContain('blocks deploy/upload')
    expect(run(['assert-release-command'], {
      GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch', TINCT_RELEASE_PHASE: 'reader', TINCT_RELEASE_APPROVED: 'true', VITE_SHARED_READER_DEFAULT: '1',
    }).status).toBe(1)
    expect(run(['assert-release-command'], {
      GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_SHA: currentSource,
      TINCT_RELEASE_PHASE: 'repair', TINCT_RELEASE_APPROVED: 'true', TINCT_RELEASE_EXPECTED_SHA: currentSource, VITE_SHARED_READER_DEFAULT: '1',
    }).status).toBe(0)
    expect(run(['assert-release-command'], {
      GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_SHA: currentSource,
      TINCT_RELEASE_PHASE: 'repair', TINCT_RELEASE_APPROVED: 'true', TINCT_RELEASE_EXPECTED_SHA: currentSource, VITE_SHARED_READER_DEFAULT: '0',
    }).stderr).toContain('requires VITE_SHARED_READER_DEFAULT=1')
    for (const env of [
      { GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'push', TINCT_RELEASE_PHASE: 'repair', TINCT_RELEASE_APPROVED: 'true', VITE_SHARED_READER_DEFAULT: '1' },
      { GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch', TINCT_RELEASE_PHASE: 'repair', TINCT_RELEASE_APPROVED: 'false', VITE_SHARED_READER_DEFAULT: '1' },
    ]) expect(run(['assert-release-command'], env).status).toBe(1)
    expect(run(['assert-release-command'], {
      GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_SHA: currentSource,
      TINCT_RELEASE_PHASE: 'repair', TINCT_RELEASE_APPROVED: 'true', TINCT_RELEASE_EXPECTED_SHA: 'f'.repeat(40), VITE_SHARED_READER_DEFAULT: '1',
    }).stderr).toContain('exact approved merge SHA')
    const pkg = readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')
    const release = readFileSync(fileURLToPath(new URL('../scripts/release.sh', import.meta.url)), 'utf8')
    expect(JSON.parse(pkg).scripts.deploy).toMatch(/^node scripts\/release-tools.cjs assert-release-command &&/)
    expect(release).toContain('node scripts/release-tools.cjs assert-release-command')
    expect(JSON.parse(pkg).scripts.deploy).toMatch(/verify-bundle && node scripts\/check-release-activation.mjs &&.*npx wrangler deploy/)
    expect(JSON.parse(pkg).scripts.deploy).toMatch(/assert-repair-live && npx wrangler deploy/)
    expect(release.indexOf('assert-repair-live')).toBeLessThan(release.indexOf('wrangler versions upload'))
    expect(release.indexOf('check-release-activation.mjs')).toBeLessThan(release.indexOf('wrangler versions upload'))
    const promote = release.slice(release.indexOf('  promote)'), release.indexOf('  rollback)'))
    expect(promote.indexOf('assert-release-command')).toBeLessThan(promote.indexOf('wrangler versions deploy'))
    expect(promote).toContain('check-deploy-source.cjs')
    expect(promote).toContain('verify-reader-floor')
    expect(promote).toContain('assert-repair-live')
    expect(deploy).toContain('TINCT_RELEASE_PHASE: ${{ needs.deploy.outputs.release_phase }}')
    expect(deploy).toContain("VITE_SHARED_READER_DEFAULT: ${{ (inputs.release_phase == 'reader' || inputs.release_phase == 'repair') && '1' || '0' }}")
  })

  it('refuses an OFF emitted Library module before a reader Worker mutation', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tinct-activation-test-'))
    const asset = join(dir, 'dist/lab/shared-reader-activation.js')
    mkdirSync(join(dir, 'dist/lab'), { recursive: true })
    try {
      const check = (phase: string) => spawnSync(process.execPath, [activationCheck], { cwd: dir, encoding: 'utf8',
        env: { ...process.env, TINCT_RELEASE_PHASE: phase, VITE_SHARED_READER_DEFAULT: '1' } })
      writeFileSync(asset, 'export const SHARED_READER_DEFAULT=false; export const sharedReaderEnabled=()=>false;')
      expect(check('reader').status).toBe(1)
      expect(check('repair').status).toBe(1)
      writeFileSync(asset, 'export const SHARED_READER_DEFAULT=true; export const sharedReaderEnabled=s=>s!=="?sharedReader=0";')
      expect(check('reader').status).toBe(0)
      expect(check('repair').status).toBe(0)
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  it('records a rollback target before writes and treats failed post-promotion confirmation as rollback-worthy', () => {
    const capture = deploy.indexOf('id: previous'), upload = deploy.indexOf('id: upload'), direct = deploy.indexOf('id: deploy')
    expect(capture).toBeGreaterThan(0)
    expect(capture).toBeLessThan(upload)
    expect(capture).toBeLessThan(direct)
    expect(deploy.slice(capture, upload)).not.toContain('continue-on-error: true')
    expect(deploy.match(/assert-current-version "\$PREVIOUS_VERSION"/g)).toHaveLength(2)
    expect(deploy).toMatch(/confirm-promote:\s+needs: \[deploy, promote\]/)
    expect(deploy).toMatch(/rollback:\s+needs: \[deploy, checks, promote, confirm-promote, production-checks\]/)
    expect(deploy).toContain("needs.promote.result == 'success'")
    expect(deploy).toContain('rollback-decision "$PREVIOUS_VERSION" "$current" "$EXPECTED_NEW_VERSION"')
    expect(deploy).toContain('npm run rollback -- "$PREVIOUS_VERSION"')
    expect(deploy).not.toContain('rolling back to ${PREVIOUS_VERSION:-the previous deployment}')
  })

  it('runs paid voice-lab acceptance only after a manual approved opt-in', () => {
    expect(voice).toContain('workflow_dispatch:')
    expect(voice).not.toContain('workflow_run:')
    expect(voice).toContain('default: false')
    expect(voice).toContain("if: ${{ inputs.approved_paid_voice_qa == true }}")
    expect(deploy).toContain('[reader-voice-qa]') // The separate tagged deploy check is unchanged.
  })

  it('refuses a reader release without a real pinned floor, and distinguishes UUID equality from format proof', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tinct-floor-test-'))
    const file = join(dir, 'floor.json')
    const fixture = { v: 1, floorVersionId: previous, floorCommit: 'a'.repeat(40), proof: 'src/worker.rollbackFloor.test.ts' }
    try {
      mkdirSync(join(dir, 'scripts'))
      mkdirSync(join(dir, 'release'))
      writeFileSync(join(dir, 'scripts/release-tools.cjs'), readFileSync(helper))
      writeFileSync(join(dir, 'release/shared-reader-rollout.json'), '{"phase":"pending"}')
      const floorRun = (args: string[]) => spawnSync(process.execPath, [join(dir, 'scripts/release-tools.cjs'), ...args], { encoding: 'utf8' })
      expect(floorRun(['verify-reader-floor', previous, join(dir, 'missing-floor.json')]).stderr).toContain('reviewed shared-reader-floor.json')
      writeFileSync(file, JSON.stringify(fixture))
      expect(floorRun(['verify-reader-floor', previous, file]).stdout).toContain(`floor_version_id=${previous}`)
      expect(floorRun(['verify-reader-floor', promoted, file]).stderr).toContain('not the pinned compatible floor')
      for (const invalid of [
        { ...fixture, floorVersionId: 'not-a-uuid' },
        { ...fixture, proof: 'src/worker.userBooks.test.ts' },
        { ...fixture, floorCommit: 'unknown' },
        { ...fixture, extra: true },
      ]) {
        writeFileSync(file, JSON.stringify(invalid))
        expect(floorRun(['verify-reader-floor', previous, file]).status).toBe(1)
      }
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  it('pins the accepted production reader as the only automatic repair rollback predecessor', () => {
    expect(run(['verify-repair-predecessor', acceptedReader]).stdout).toContain(`repair_predecessor_version=${acceptedReader}`)
    expect(run(['verify-repair-predecessor', previous]).stderr).toContain('not the pinned accepted reader')
    expect(run(['verify-repair-predecessor', 'e6e885cd-7737-465f-8b9b-675ff37af3b9']).stderr).toContain('not the pinned accepted reader')
    expect(run(['verify-repair-predecessor', '1bdaf83e-e30f-44bf-954c-46dc2edf66db']).stderr).toContain('not the pinned accepted reader')
    expect(run(['verify-repair-predecessor', 'not-a-version']).status).toBe(1)
    expect(deploy).toContain('approved_repair_release:')
    expect(deploy).toContain('test "$EVENT_NAME" = workflow_dispatch && test "$APPROVED_REPAIR_RELEASE" = true')
    expect(deploy).toContain('test "$GITHUB_SHA" = "$EXPECTED_REPAIR_SHA"')
    expect(run(['assert-repair-live']).status).toBe(0) // The extra provider read is repair-only.
    expect(deploy.match(/verify-repair-predecessor "\$PREVIOUS_VERSION"/g)).toHaveLength(3)
    expect(deploy).toContain("needs.deploy.outputs.release_phase == 'repair'")
    expect(deploy).toContain('npm run rollback -- "$PREVIOUS_VERSION"')
  })

  it('requires an explicit approved phase and the write-old floor proof before any Worker upload', () => {
    expect(run(['assert-normal-release']).stderr).toContain('rollout is pending')
    expect(run(['assert-floor-source']).stderr).toContain('gated old-UI backend-only checkout')
    const phase = deploy.indexOf('id: release-phase')
    const previousVersion = deploy.indexOf('id: previous')
    const upload = deploy.indexOf('id: upload')
    expect(phase).toBeGreaterThan(0)
    expect(phase).toBeLessThan(previousVersion)
    expect(previousVersion).toBeLessThan(upload)
    expect(deploy).toContain('test "$EVENT_NAME" = workflow_dispatch && test "$APPROVED_READER_RELEASE" = true')
    expect(deploy).toContain('node scripts/release-tools.cjs assert-floor-source')
    expect(deploy).toContain('npx vitest run src/worker.rollbackFloor.test.ts src/worker.userBooks.test.ts src/worker.adminAccounts.test.ts')
    expect(deploy).toContain('node scripts/release-tools.cjs verify-reader-floor "$PREVIOUS_VERSION"')
    expect(deploy.match(/verify-reader-floor "\$PREVIOUS_VERSION"/g)).toHaveLength(3)
  })
})
