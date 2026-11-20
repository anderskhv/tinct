// @vitest-environment node
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { APPROVED_REPAIR, releaseRepairOnce } from '../../scripts/shared-reader-repair-once.mjs'

const head = 'f'.repeat(40), branchHead = 'e'.repeat(40), tree = '9'.repeat(40)
const cfg = { ...APPROVED_REPAIR, pr: 608, correctedSource: 'a'.repeat(40), correctedTree: 'b'.repeat(40) }
const files = ['.github/workflows/shared-reader-repair-once.yml', 'app/src/scripts.sharedReaderRepairOnce.test.ts', 'scripts/shared-reader-repair-once.mjs']
function fixture(override?: (request: any) => any) {
  const state: any = { now: Date.parse('2026-10-24T12:00:00Z'), deploy: null, mainReads: 0 }
  const requests: any[] = []
  const row = (id: number) => ({ id, head_sha: head, event: 'workflow_dispatch' })
  const run = (id: number, workflow: string) => ({ ...row(id), path: `.github/workflows/${workflow}`, status: 'completed', conclusion: 'success', run_attempt: 1 })
  const api = async (method: string, fullPath: string, body?: any) => {
    const path = fullPath.replace(`/repos/${cfg.repo}`, '')
    if (path === '/git/ref/heads/main') state.mainReads++
    const request = { method, path, body, state, row, run }
    requests.push(request)
    const replacement = override?.(request)
    if (replacement !== undefined) return replacement
    if (method === 'POST') {
      if (path === '/actions/workflows/deploy.yml/dispatches') state.deploy = row(900)
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
    if (path.startsWith('/contents/app/release/shared-reader-rollout.json')) return { content: Buffer.from('{"phase":"repair-pending"}').toString('base64') }
    if (path.startsWith('/contents/app/release/shared-reader-floor.json')) return { content: Buffer.from(JSON.stringify({ v: 1, floorVersionId: cfg.floorVersion, floorCommit: cfg.floorCommit, proof: 'src/worker.rollbackFloor.test.ts' })).toString('base64') }
    if (path.includes('/actions/workflows/deploy.yml/runs')) return { total_count: state.deploy ? 1 : 0, workflow_runs: state.deploy ? [state.deploy] : [] }
    if (path === '/actions/runs/900') return run(900, 'deploy.yml')
    if (path === '/actions/runs/900/jobs?per_page=100') {
      const jobs = [
        { id: 90, name: 'deploy', conclusion: 'success', steps: [{ name: 'Deploy to Cloudflare Workers (direct mode)', conclusion: 'success' }] },
        ...['audio-smoke', 'library', 'page-layout', 'production', 'publication', 'reader-panels'].map((group, index) => ({ id: 500 + index, name: `checks (${group})`, conclusion: 'success', steps: group === 'production' ? [{ name: 'Smoke test production', conclusion: 'success' }] : group === 'page-layout' ? [{ name: 'Verify every Shakespeare edition and reported passage', conclusion: 'success' }, { name: 'Verify repaired emitted ON reader and synthetic PDF Original', conclusion: 'success' }] : group === 'library' ? [{ name: 'Verify repaired own EPUB isolation on the handed-off build', conclusion: 'success' }] : group === 'reader-panels' ? [{ name: 'Verify repaired live Aa, layout, and source position with mocked API', conclusion: 'success' }] : [] })),
      ]
      return { total_count: jobs.length, jobs }
    }
    if (path === '/actions/jobs/502/logs') return Array.from({ length: 120 }, (_, index) => `PASS ${index < 60 ? 'chromium' : 'webkit'}-speaker-${index}`).join('\n')
    if (path === '/actions/jobs/90/logs') return `repair_predecessor_version=${cfg.predecessorVersion}\nCurrent Version ID: 11111111-1111-4111-8111-111111111111\nserving verified /assets/index-repair.js at https://tinct.app`
    throw Error(`Unhandled test API ${method} ${path}`)
  }
  let liveReads = 0
  const deps = { api, now: () => state.now, sleep: async (ms: number) => { state.now += ms }, fetchLive: async () => ({ status: 200, text: `<script src="${liveReads++ < 1 ? cfg.predecessorBundle : '/assets/index-repair.js'}"></script>` }) }
  return { state, requests, deps, execute: () => releaseRepairOnce(deps, { verifyRunId: 1, headSha: head, continuationAttempt: 1 }, cfg), posts: () => requests.filter(request => request.method === 'POST') }
}

describe('one-time approved reader repair continuation', () => {
  it('dispatches only a direct reader-ON repair and requires exact predecessor, six groups, full 120, and final bundle', async () => {
    const f = fixture()
    await expect(f.execute()).resolves.toMatchObject({ repairRunId: 900, predecessorVersion: cfg.predecessorVersion, bundle: '/assets/index-repair.js' })
    expect(f.posts().map(request => request.body)).toEqual([
      { ref: 'main', inputs: { mode: 'direct', release_phase: 'repair', approved_repair_release: 'true', approved_source_sha: head } },
    ])
    expect(f.requests.some(request => request.path.includes('voice-lab-acceptance'))).toBe(false)
  })

  it('remains inert until PR and baseline source/tree pins are filled', async () => {
    const f = fixture()
    await expect(releaseRepairOnce(f.deps, { verifyRunId: 1, headSha: head, continuationAttempt: 1 },
      { ...cfg, pr: 0 })).rejects.toThrow('source pins are required')
    await expect(releaseRepairOnce(f.deps, { verifyRunId: 1, headSha: head, continuationAttempt: 1 },
      { ...cfg, correctedSource: '0'.repeat(40) })).rejects.toThrow('source pins are required')
    expect(f.posts()).toHaveLength(0)
  })

  it('rejects a verify rerun, failed CI, main drift, changed baseline, or extra runtime source before dispatch', async () => {
    for (const override of [
      ({ path, run }: any) => path === '/actions/runs/1' ? { ...run(1, 'verify.yml'), event: 'push', head_branch: 'main', run_attempt: 2 } : undefined,
      ({ path, run }: any) => path === '/actions/runs/1' ? { ...run(1, 'verify.yml'), event: 'push', head_branch: 'main', conclusion: 'failure' } : undefined,
      ({ path }: any) => path === '/git/ref/heads/main' ? { object: { sha: 'c'.repeat(40) } } : undefined,
      ({ path }: any) => path === `/git/commits/${cfg.correctedSource}` ? { tree: { sha: 'd'.repeat(40) } } : undefined,
      ({ path }: any) => path.startsWith('/compare/') ? { merge_base_commit: { sha: cfg.correctedSource }, files: [...files, 'app/src/main.tsx'].map(filename => ({ filename, status: 'added' })) } : undefined,
    ]) {
      const f = fixture(override)
      await expect(f.execute()).rejects.toThrow()
      expect(f.posts()).toHaveLength(0)
    }
  })

  it('rejects changed rollout and changed floor manifest before dispatch', async () => {
    for (const pathPart of ['shared-reader-rollout', 'shared-reader-floor']) {
      const f = fixture(({ path }: any) => path.includes(pathPart) ? { content: Buffer.from('{}').toString('base64') } : undefined)
      await expect(f.execute()).rejects.toThrow()
      expect(f.posts()).toHaveLength(0)
    }
  })

  it('refuses a different predecessor bundle, duplicate runs, and a failed existing run', async () => {
    const wrong = fixture(); wrong.deps.fetchLive = async () => ({ status: 200, text: '<script src="/assets/index-wrong.js"></script>' })
    await expect(wrong.execute()).rejects.toThrow('Production changed before repair dispatch')
    expect(wrong.posts()).toHaveLength(0)
    const duplicate = fixture(({ path, row }: any) => path.includes('/actions/workflows/deploy.yml/runs') ? { total_count: 2, workflow_runs: [row(900), row(901)] } : undefined)
    await expect(duplicate.execute()).rejects.toThrow('Multiple deploy runs')
    expect(duplicate.posts()).toHaveLength(0)
    const failed = fixture(({ path, run }: any) => path === '/actions/runs/900' ? { ...run(900, 'deploy.yml'), conclusion: 'failure' } : undefined)
    failed.state.deploy = { id: 900, head_sha: head, event: 'workflow_dispatch' }
    await expect(failed.execute()).rejects.toThrow('no retry')
    expect(failed.posts()).toHaveLength(0)
  })

  it('adopts one existing successful run without dispatch', async () => {
    const f = fixture(); f.state.deploy = { id: 900, head_sha: head, event: 'workflow_dispatch' }
    // An existing completed repair already serves its new bundle.
    f.deps.fetchLive = async () => ({ status: 200, text: '<script src="/assets/index-repair.js"></script>' })
    await expect(f.execute()).resolves.toMatchObject({ repairRunId: 900, bundle: '/assets/index-repair.js' })
    expect(f.posts()).toHaveLength(0)
  })

  it('accepts GitHub’s skipped conditional rollback job, but rejects an executed rollback', async () => {
    const withRollback = (conclusion: string) => fixture(({ path, state }: any) => {
      if (path !== '/actions/runs/900/jobs?per_page=100') return undefined
      const jobs = [
        { id: 90, name: 'deploy', conclusion: 'success', steps: [{ name: 'Deploy to Cloudflare Workers (direct mode)', conclusion: 'success' }] },
        ...['audio-smoke', 'library', 'page-layout', 'production', 'publication', 'reader-panels'].map((group, index) => ({ id: 500 + index, name: `checks (${group})`, conclusion: 'success', steps: group === 'production' ? [{ name: 'Smoke test production', conclusion: 'success' }] : group === 'page-layout' ? [{ name: 'Verify every Shakespeare edition and reported passage', conclusion: 'success' }, { name: 'Verify repaired emitted ON reader and synthetic PDF Original', conclusion: 'success' }] : group === 'library' ? [{ name: 'Verify repaired own EPUB isolation on the handed-off build', conclusion: 'success' }] : group === 'reader-panels' ? [{ name: 'Verify repaired live Aa, layout, and source position with mocked API', conclusion: 'success' }] : [] })),
        { id: 99, name: 'rollback', conclusion },
      ]
      return { total_count: jobs.length, jobs }
    })
    await expect(withRollback('skipped').execute()).resolves.toMatchObject({ repairRunId: 900 })
    await expect(withRollback('success').execute()).rejects.toThrow('without rollback')
  })

  it('never dispatches from a continuation workflow rerun', async () => {
    const f = fixture()
    await expect(releaseRepairOnce(f.deps, { verifyRunId: 1, headSha: head, continuationAttempt: 2 }, cfg)).rejects.toThrow('Continuation rerun')
    expect(f.posts()).toHaveLength(0)
  })

  it('never retries an uncertain POST or a repair missing a live acceptance step', async () => {
    const uncertain = fixture(({ method }: any) => { if (method === 'POST') throw Error('Connection ended after submission') })
    await expect(uncertain.execute()).rejects.toThrow('submission uncertain')
    expect(uncertain.posts()).toHaveLength(1)
    const missing = fixture(({ path }: any) => path === '/actions/runs/900/jobs?per_page=100' ? { total_count: 0, jobs: [] } : undefined)
    await expect(missing.execute()).rejects.toThrow('all six live groups')
    expect(missing.posts()).toHaveLength(1)
    const no120 = fixture(({ path }: any) => path === '/actions/jobs/502/logs' ? 'PASS chromium-one' : undefined)
    await expect(no120.execute()).rejects.toThrow('All 120')
    expect(no120.posts()).toHaveLength(1)
  })

  it('stops at the bounded approval deadline, including immediately before POST', async () => {
    const expired = fixture(); expired.state.now = Date.parse(cfg.deadline)
    await expect(expired.execute()).rejects.toThrow('expired')
    expect(expired.posts()).toHaveLength(0)
    const during = fixture(({ path, state }: any) => { if (path.includes('/actions/workflows/deploy.yml/runs') && state.mainReads === 2) state.now = Date.parse(cfg.deadline) })
    await expect(during.execute()).rejects.toThrow('expired')
    expect(during.posts()).toHaveLength(0)
  })

  it('keeps workflow authority narrow and requires the final reviewed helper blob pin', () => {
    const workflow = readFileSync('../.github/workflows/shared-reader-repair-once.yml', 'utf8')
    const module = readFileSync('../scripts/shared-reader-repair-once.mjs')
    const blob = createHash('sha1').update(`blob ${module.length}\0`).update(module).digest('hex')
    if (APPROVED_REPAIR.pr === 0) {
      expect(workflow).toContain("file.sha !== '0000000000000000000000000000000000000000'")
      expect(workflow).toContain('const repairPR = 0')
    } else {
      expect(workflow).toContain(`file.sha !== '${blob}'`)
      expect(workflow).toContain(`const repairPR = ${APPROVED_REPAIR.pr}`)
      expect(APPROVED_REPAIR.correctedSource).not.toBe('0'.repeat(40))
      expect(APPROVED_REPAIR.correctedTree).not.toBe('0'.repeat(40))
    }
    expect(blob).toMatch(/^[a-f0-9]{40}$/)
    expect(workflow).toContain('permissions: {}')
    expect(workflow).toContain('contents: read\n      actions: write')
    expect(workflow).not.toMatch(/uses:\s*actions\/checkout|secrets\.|contents:\s*write|voice-lab-acceptance|persist-credentials:\s*true/)
  })
})
