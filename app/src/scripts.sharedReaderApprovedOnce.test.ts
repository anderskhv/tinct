// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { APPROVED_RELEASE as cfg, releaseApprovedOnce } from '../../scripts/shared-reader-approved-once.mjs'

const head = 'f'.repeat(40), branchHead = 'e'.repeat(40), tree = '9'.repeat(40)
const files = ['.github/workflows/shared-reader-approved-once.yml', 'app/src/scripts.sharedReaderApprovedOnce.test.ts', 'scripts/shared-reader-approved-once.mjs']
const voiceStep = 'Verify current production voices and delayed lookup acknowledgement'
function fixture(override?: (request: any) => any) {
  const state: any = { now: Date.parse('2026-10-23T22:00:00Z'), reader: null, voice: null, mainReads: 0 }
  const requests: any[] = []
  const row = (id: number) => ({ id, head_sha: head, event: 'workflow_dispatch', created_at: '2026-10-23T22:01:00Z' })
  const run = (id: number, workflow: string) => ({ ...row(id), path: `.github/workflows/${workflow}`, status: 'completed', conclusion: 'success', run_attempt: 1 })
  const api = async (method: string, fullPath: string, body?: any) => {
    const path = fullPath.replace(`/repos/${cfg.repo}`, '')
    if (path === '/git/ref/heads/main') state.mainReads++
    const request = { method, path, body, state, row, run }
    requests.push(request)
    const replacement = override?.(request)
    if (replacement !== undefined) return replacement
    if (method === 'POST') {
      if (path.includes('/deploy.yml/')) state.reader = row(900)
      else if (path.includes('/voice-lab-acceptance.yml/')) state.voice = row(901)
      else throw Error('Unexpected mutation')
      return undefined
    }
    if (path === '/actions/runs/1') return { ...run(1, 'verify.yml'), event: 'push', head_branch: 'main' }
    if (path === '/git/ref/heads/main') return { object: { sha: head } }
    if (path === `/pulls/${cfg.pr}`) return { merged: true, merge_commit_sha: head, base: { ref: 'main' }, head: { sha: branchHead, ref: cfg.branch, repo: { full_name: cfg.repo } } }
    if (path === `/git/commits/${head}`) return { tree: { sha: tree }, parents: [{ sha: cfg.base }, { sha: branchHead }] }
    if (path === `/git/commits/${branchHead}`) return { tree: { sha: tree } }
    if (path === `/git/commits/${cfg.correctedSource}`) return { tree: { sha: cfg.correctedTree } }
    if (path.startsWith('/compare/')) return { merge_base_commit: { sha: cfg.correctedSource }, files: files.map(filename => ({ filename, status: 'added' })) }
    if (path.startsWith('/contents/')) return { content: Buffer.from(JSON.stringify({ v: 1, floorVersionId: cfg.floorVersion, floorCommit: cfg.floorCommit, proof: 'src/worker.rollbackFloor.test.ts' })).toString('base64') }
    if (path === `/actions/runs/${cfg.floorRun}`) return { status: 'completed', conclusion: 'success', head_sha: cfg.floorCommit }
    if (path === `/actions/runs/${cfg.failedReaderRun}`) return { ...run(cfg.failedReaderRun, 'deploy.yml'), head_sha: cfg.base, conclusion: 'failure' }
    if (path === `/actions/runs/${cfg.failedReaderRun}/jobs?per_page=100`) return { jobs: [{ id: 88, name: 'rollback', conclusion: 'success' }] }
    if (path === '/actions/jobs/88/logs') return `Current Version ID: ${cfg.floorVersion}`
    if (path.includes('/actions/workflows/deploy.yml/runs')) return { total_count: state.reader ? 1 : 0, workflow_runs: state.reader ? [state.reader] : [] }
    if (path.includes('/actions/workflows/voice-lab-acceptance.yml/runs')) return { total_count: state.voice ? 1 : 0, workflow_runs: state.voice ? [state.voice] : [] }
    if (path === '/actions/runs/900') return run(900, 'deploy.yml')
    if (path === '/actions/runs/901') return run(901, 'voice-lab-acceptance.yml')
    if (path === '/actions/runs/900/jobs?per_page=100') return { jobs: [
      { id: 90, name: 'deploy', conclusion: 'success', steps: [{ name: 'Deploy to Cloudflare Workers (direct mode)', conclusion: 'success' }] },
      ...['audio-smoke', 'library', 'page-layout', 'production', 'publication', 'reader-panels'].map((group, index) => ({ id: 500 + index, name: `checks (${group})`, conclusion: 'success', steps: group === 'production' ? [{ name: 'Smoke test production', conclusion: 'success' }] : group === 'page-layout' ? [{ name: 'Verify every Shakespeare edition and reported passage', conclusion: 'success' }] : [] })),
    ] }
    if (path === '/actions/jobs/502/logs') return Array.from({ length: 120 }, (_, index) => `PASS ${index < 60 ? 'chromium' : 'webkit'}-speaker-${index}`).join('\n')
    if (path === '/actions/jobs/90/logs') return `floor_version_id=${cfg.floorVersion}\nCurrent Version ID: 11111111-1111-4111-8111-111111111111\nserving verified /assets/index-test.js at https://tinct.app`
    if (path === '/actions/runs/901/jobs?per_page=100') return { jobs: [{ id: 91, name: 'voice', conclusion: 'success', steps: [{ name: voiceStep, conclusion: 'success' }] }] }
    if (path === '/actions/jobs/91/logs') return JSON.stringify({ passed: true, sessionUpdated: true, requestedVoice: 'ara', acknowledgedRequestVoice: 'ara', appMaleVoice: 'helios', switchedVoice: { acknowledgedRequestVoice: 'helios', providerErrors: [] }, verifyForceMessage: true, forceMessage: { done: true, audioBytes: 120, transcript: 'One moment.' }, errors: [], providerErrors: [] })
    throw Error(`Unhandled test API ${method} ${path}`)
  }
  const deps = { api, now: () => state.now, sleep: async (ms: number) => { state.now += ms }, fetchLive: async () => ({ status: 200, text: '<script src="/assets/index-test.js"></script>' }) }
  return { state, requests, deps, execute: () => releaseApprovedOnce(deps, { verifyRunId: 1, headSha: head }), posts: () => requests.filter(request => request.method === 'POST') }
}

describe('approved one-time shared reader continuation', () => {
  it('dispatches the exact reader then one voice check with the approved inputs and requires provider proof', async () => {
    const f = fixture()
    await expect(f.execute()).resolves.toMatchObject({ readerRunId: 900, voiceRunId: 901, bundle: '/assets/index-test.js', voiceVerified: true })
    expect(f.posts().map(request => request.body)).toEqual([
      { ref: 'main', inputs: { mode: 'direct', release_phase: 'reader', approved_reader_release: 'true' } },
      { ref: 'main', inputs: { approved_paid_voice_qa: 'true' } },
    ])
  })
  it('adopts existing successful runs without a second deploy or paid call', async () => {
    const f = fixture(); f.state.reader = { id: 900, head_sha: head, event: 'workflow_dispatch' }; f.state.voice = { id: 901, head_sha: head, event: 'workflow_dispatch', created_at: cfg.approvedAt }
    await expect(f.execute()).resolves.toMatchObject({ voiceVerified: true })
    expect(f.posts()).toHaveLength(0)
  })
  it('rejects a PR, manual verify, or verify rerun before any dispatch', async () => {
    for (const change of [{ event: 'pull_request' }, { event: 'workflow_dispatch' }, { run_attempt: 2 }]) {
      const f = fixture(({ path, run }) => path === '/actions/runs/1' ? { ...run(1, 'verify.yml'), head_branch: 'main', event: 'push', ...change } : undefined)
      await expect(f.execute()).rejects.toThrow('push/main verify')
      expect(f.posts()).toHaveLength(0)
    }
  })
  it('rejects main drift and an extra runtime change', async () => {
    for (const override of [
      ({ path }: any) => path === '/git/ref/heads/main' ? { object: { sha: 'a'.repeat(40) } } : undefined,
      ({ path }: any) => path.startsWith('/compare/') ? { merge_base_commit: { sha: cfg.correctedSource }, files: [...files, 'app/src/worker.ts'].map(filename => ({ filename, status: 'added' })) } : undefined,
    ]) {
      const f = fixture(override)
      await expect(f.execute()).rejects.toThrow()
      expect(f.posts()).toHaveLength(0)
    }
  })
  it('requires completed original rollback before replacing the failed Mac sequence', async () => {
    const f = fixture(({ path }) => path === `/actions/runs/${cfg.failedReaderRun}/jobs?per_page=100` ? { jobs: [{ name: 'rollback', conclusion: 'in_progress' }] } : undefined)
    await expect(f.execute()).rejects.toThrow('rollback has not succeeded')
    expect(f.posts()).toHaveLength(0)
  })
  it('refuses duplicate reader runs and never retries a failed existing run', async () => {
    const duplicate = fixture(({ path, row }) => path.includes('/actions/workflows/deploy.yml/runs') ? { total_count: 2, workflow_runs: [row(900), row(902)] } : undefined)
    await expect(duplicate.execute()).rejects.toThrow('Multiple')
    expect(duplicate.posts()).toHaveLength(0)
    const failed = fixture(({ path, run }) => path === '/actions/runs/900' ? { ...run(900, 'deploy.yml'), conclusion: 'failure' } : undefined)
    failed.state.reader = { id: 900, head_sha: head, event: 'workflow_dispatch' }
    await expect(failed.execute()).rejects.toThrow('no retry or next stage')
    expect(failed.posts()).toHaveLength(0)
  })
  it('stops after exactly one uncertain POST', async () => {
    const f = fixture(({ method }) => { if (method === 'POST') throw Error('Connection ended after submission') })
    await expect(f.execute()).rejects.toThrow('submission uncertain')
    expect(f.posts()).toHaveLength(1)
  })
  it('rejects expired approval, including expiry during the last reads before dispatch', async () => {
    const expired = fixture(); expired.state.now = Date.parse(cfg.deadline)
    await expect(expired.execute()).rejects.toThrow('expired')
    expect(expired.posts()).toHaveLength(0)
    const duringReads = fixture(({ path, state }) => { if (path.startsWith('/contents/') && state.mainReads === 2) state.now = Date.parse(cfg.deadline) })
    await expect(duringReads.execute()).rejects.toThrow('expired')
    expect(duringReads.posts()).toHaveLength(0)
  })
  it('does not buy voice when the deadline expires during its final source reads', async () => {
    const f = fixture(({ path, state }) => { if (path.startsWith('/contents/') && state.mainReads === 4) state.now = Date.parse(cfg.deadline) })
    await expect(f.execute()).rejects.toThrow('expired')
    expect(f.posts()).toHaveLength(1)
  })
  it('rejects an earlier voice attempt in the same approval window', async () => {
    const f = fixture(({ path, row }) => path.includes('/voice-lab-acceptance.yml/runs?event=') ? { total_count: 1, workflow_runs: [{ ...row(901), head_sha: cfg.base }] } : undefined)
    await expect(f.execute()).rejects.toThrow('voice attempt already exists')
    expect(f.posts()).toHaveLength(0)
  })
  it('requires all six real acceptance groups and the current exact bundle before voice', async () => {
    const missingGroup = fixture(({ path }) => path === '/actions/runs/900/jobs?per_page=100' ? { jobs: [] } : undefined)
    await expect(missingGroup.execute()).rejects.toThrow('all six live groups')
    expect(missingGroup.posts()).toHaveLength(1)
    const wrongBundle = fixture(); wrongBundle.deps.fetchLive = async () => ({ status: 200, text: '<script src="/assets/index-floor.js"></script>' })
    await expect(wrongBundle.execute()).rejects.toThrow('no longer serves')
    expect(wrongBundle.posts()).toHaveLength(1)
  })
  it('does not treat a green skipped voice workflow as paid acceptance', async () => {
    const f = fixture(({ path }) => path === '/actions/runs/901/jobs?per_page=100' ? { jobs: [{ name: 'voice', conclusion: 'skipped', steps: [] }] } : undefined)
    await expect(f.execute()).rejects.toThrow('real voice verification step')
    expect(f.posts()).toHaveLength(2)
  })
  it('requires all 120 actual speaker cases before any voice dispatch', async () => {
    const f = fixture(({ path }) => path === '/actions/jobs/502/logs' ? 'PASS chromium-one-case' : undefined)
    await expect(f.execute()).rejects.toThrow('All 120')
    expect(f.posts()).toHaveLength(1)
  })
  it('requires provider acknowledgement and actual audio evidence after a successful step', async () => {
    const f = fixture(({ path }) => path === '/actions/jobs/91/logs' ? '{"passed":true}' : undefined)
    await expect(f.execute()).rejects.toThrow('provider acknowledgement')
    expect(f.posts()).toHaveLength(2)
  })
  it('keeps workflow authority narrow and binds the fetched module to its reviewed blob', () => {
    const workflow = readFileSync('../.github/workflows/shared-reader-approved-once.yml', 'utf8')
    const module = readFileSync('../scripts/shared-reader-approved-once.mjs')
    const blob = createHash('sha1').update(`blob ${module.length}\0`).update(module).digest('hex')
    expect(workflow).toContain(`file.sha !== '${blob}'`)
    expect(workflow).toContain('permissions: {}')
    expect(workflow).toContain('contents: read\n      actions: write')
    expect(workflow).not.toMatch(/uses:\s*actions\/checkout|secrets\.|contents:\s*write|persist-credentials:\s*true/)
  })
})
