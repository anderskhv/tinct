// One approved reader-ON repair from the accepted reader. No checkout, dependencies,
// secrets, paid provider calls, retry after uncertain submission, or release-gate bypass.
// The baseline source and tree are pinned after the reviewed UI/release repair is frozen;
// only this module, its workflow, and its test may be added afterwards.
export const APPROVED_CHARACTER_REPAIR = Object.freeze({
  repo: 'anderskhv/tinct', pr: 610,
  branch: 'codex/reader-character-repair-20261024',
  base: '817acf97c24f5cc438e380d38c8e138889052dff',
  correctedSource: '8d8f1ceef1ce782ac474b9aa4594433ec7db425f',
  correctedTree: 'b2e61af8269220b69f2a613b614aa46a3542c5eb',
  predecessorVersion: '1bdaf83e-e30f-44bf-954c-46dc2edf66db',
  predecessorBundle: '/assets/index-B_Jdu6u2.js',
  failedRepairRun: 40074986118,
  failedRepairSource: '817acf97c24f5cc438e380d38c8e138889052dff',
  floorVersion: 'f9521101-aa25-4d2c-ab44-b0d1c9e149bf',
  floorCommit: 'dcc2dca562b9c05f252a532f6d5e6a839aa5199b',
  deadline: '2026-10-24T22:00:00Z',
})
const orchestrationFiles = [
  '.github/workflows/shared-reader-character-repair-once.yml',
  'app/src/scripts.sharedReaderCharacterRepairOnce.test.ts',
  'scripts/shared-reader-character-repair-once.mjs',
].sort()
const groups = ['audio-smoke', 'library', 'page-layout', 'production', 'publication', 'reader-panels']
const insist = (condition, message) => { if (!condition) throw Error(message) }
const textLog = value => typeof value === 'string' ? value : Buffer.from(value).toString('utf8')
const servedBundle = html => [...html.matchAll(/\/assets\/index-[\w-]+\.js/g)].map(match => match[0])

export async function releaseCharacterRepairOnce({ api, fetchLive, now = Date.now,
  sleep = ms => new Promise(done => setTimeout(done, ms)), log = () => {} },
{ verifyRunId, headSha, continuationAttempt }, cfg = APPROVED_CHARACTER_REPAIR) {
  const base = `/repos/${cfg.repo}`
  const get = path => api('GET', base + path)
  const deadline = Date.parse(cfg.deadline)
  const withinDeadline = () => insist(Number.isFinite(deadline) && now() < deadline, 'Repair approval window expired; no further dispatch')
  const pause = async () => { withinDeadline(); await sleep(Math.min(20_000, deadline - now())); withinDeadline() }
  insist(cfg.repo === 'anderskhv/tinct' && Number.isInteger(cfg.pr) && cfg.pr > 0 &&
    /^[a-f0-9]{40}$/.test(headSha || '') && /^[a-f0-9]{40}$/.test(cfg.correctedSource) &&
    cfg.correctedSource !== '0'.repeat(40) && /^[a-f0-9]{40}$/.test(cfg.correctedTree) &&
    cfg.correctedTree !== '0'.repeat(40), 'Repair PR and reviewed source pins are required')
  insist(continuationAttempt === 1, 'Continuation rerun cannot dispatch')
  withinDeadline()
  const verify = await get(`/actions/runs/${verifyRunId}`)
  insist(verify.path === '.github/workflows/verify.yml' && verify.event === 'push' &&
    verify.head_branch === 'main' && verify.head_sha === headSha && verify.status === 'completed' &&
    verify.conclusion === 'success' && verify.run_attempt === 1, 'Exact first-attempt push/main verify must succeed')

  async function assertReviewedMain() {
    withinDeadline()
    const current = await get('/git/ref/heads/main')
    insist(current.object.sha === headSha, 'main changed; refusing another source')
    const pr = await get(`/pulls/${cfg.pr}`)
    insist(pr.merged && pr.merge_commit_sha === headSha && pr.base.ref === 'main' &&
      pr.head.ref === cfg.branch && pr.head.repo.full_name === cfg.repo, 'Source is not the reviewed repair PR merge')
    const merge = await get(`/git/commits/${headSha}`)
    insist(merge.parents.length === 2 && merge.parents[0].sha === cfg.base &&
      merge.parents[1].sha === pr.head.sha, 'Unexpected merge ancestry')
    const reviewedHead = await get(`/git/commits/${pr.head.sha}`)
    const corrected = await get(`/git/commits/${cfg.correctedSource}`)
    insist(merge.tree.sha === reviewedHead.tree.sha && corrected.tree.sha === cfg.correctedTree,
      'Reviewed repair tree changed')
    const diff = await get(`/compare/${cfg.correctedSource}...${headSha}`)
    insist(diff.merge_base_commit.sha === cfg.correctedSource && diff.files?.length === 3 &&
      JSON.stringify(diff.files.map(file => file.filename).sort()) === JSON.stringify(orchestrationFiles) &&
      diff.files.every(file => file.status === 'added'), 'Reviewed repair source changed after its pin')
    const rollout = await get(`/contents/app/release/shared-reader-rollout.json?ref=${headSha}`)
    const state = JSON.parse(Buffer.from(rollout.content, 'base64').toString('utf8'))
    insist(Object.keys(state).length === 1 && state.phase === 'repair-pending', 'Repair gate state changed')
    const manifest = await get(`/contents/app/release/shared-reader-floor.json?ref=${headSha}`)
    const floor = JSON.parse(Buffer.from(manifest.content, 'base64').toString('utf8'))
    insist(floor.v === 1 && floor.floorVersionId === cfg.floorVersion && floor.floorCommit === cfg.floorCommit &&
      floor.proof === 'src/worker.rollbackFloor.test.ts', 'Compatible floor pin changed')
  }
  await assertReviewedMain()

  const failed = await get(`/actions/runs/${cfg.failedRepairRun}`)
  insist(failed.head_sha === cfg.failedRepairSource && failed.path === '.github/workflows/deploy.yml' &&
    failed.run_attempt === 1 && failed.status === 'completed' && failed.conclusion === 'failure',
  'First repair must finish failed without a rerun before another dispatch')
  const failedJobs = await get(`/actions/runs/${cfg.failedRepairRun}/jobs?per_page=100`)
  insist(failedJobs.total_count <= 100 && failedJobs.jobs?.length === failedJobs.total_count,
    'First repair job list requires review')
  const rollback = failedJobs.jobs.find(job => job.name === 'rollback' && job.conclusion === 'success' &&
    job.steps?.some(step => step.name === 'Roll production back to the previous version' && step.conclusion === 'success'))
  insist(rollback, 'First repair automatic rollback did not succeed')
  const rollbackLog = textLog(await get(`/actions/jobs/${rollback.id}/logs`))
  insist(rollbackLog.includes(`Current Version ID: ${cfg.predecessorVersion}`),
    'First repair rollback did not restore the pinned reader UUID')

  async function matchingRuns() {
    const data = await get(`/actions/workflows/deploy.yml/runs?head_sha=${headSha}&event=workflow_dispatch&per_page=100`)
    insist(data.total_count <= 100 && data.workflow_runs?.length === data.total_count, 'Deploy run list requires review')
    insist(data.workflow_runs.every(run => run.head_sha === headSha && run.event === 'workflow_dispatch'), 'Unexpected deploy run list')
    insist(data.workflow_runs.length <= 1, 'Multiple deploy runs; no duplicate dispatch')
    return data.workflow_runs[0]
  }
  let run = await matchingRuns()
  if (!run) {
    await assertReviewedMain()
    const latest = await fetchLive('https://tinct.app/reader')
    insist(latest.status === 200 && JSON.stringify(servedBundle(latest.text)) === JSON.stringify([cfg.predecessorBundle]),
      'Production changed before repair dispatch')
    run = await matchingRuns()
    if (!run) {
      withinDeadline() // Immediately before the only mutation. No automatic POST retry.
      try {
        await api('POST', base + '/actions/workflows/deploy.yml/dispatches', {
          ref: 'main', inputs: { mode: 'direct', release_phase: 'repair', approved_repair_release: 'true', approved_source_sha: headSha },
        })
      } catch {
        throw Error('Repair submission uncertain; inspect Actions, never automatically retry')
      }
      for (let attempt = 0; attempt < 6; attempt++) {
        run = await matchingRuns()
        if (run) break
        await pause()
      }
      insist(run, 'Submitted repair run is not visible; no retry')
    }
  }
  log(`Using repair deploy run ${run.id}; no duplicate launch`)
  for (;;) {
    withinDeadline()
    const current = await get(`/actions/runs/${run.id}`)
    insist(current.head_sha === headSha && current.event === 'workflow_dispatch' &&
      current.path === '.github/workflows/deploy.yml' && current.run_attempt === 1,
    'Unexpected deploy run identity or retry')
    if (current.status === 'completed') {
      insist(current.conclusion === 'success', `Repair deploy finished as ${current.conclusion}; no retry`)
      break
    }
    await pause()
  }
  const accepted = await get(`/actions/runs/${run.id}/jobs?per_page=100`)
  insist(accepted.total_count <= 100 && accepted.jobs?.length === accepted.total_count, 'Deploy job list requires review')
  const deploy = accepted.jobs.find(job => job.name === 'deploy' && job.conclusion === 'success')
  insist(deploy?.steps?.some(step => step.name === 'Deploy to Cloudflare Workers (direct mode)' && step.conclusion === 'success') &&
    groups.every(group => accepted.jobs.some(job => job.name === `checks (${group})` && job.conclusion === 'success')) &&
    accepted.jobs.some(job => job.steps?.some(step => step.name === 'Smoke test production' && step.conclusion === 'success')) &&
    !accepted.jobs.some(job => job.name === 'rollback' && job.conclusion !== 'skipped'),
  'Repair direct deployment and all six live groups must pass without rollback')
  const passedStep = (group, name) => accepted.jobs.some(job => job.name === `checks (${group})` &&
    job.steps?.some(step => step.name === name && step.conclusion === 'success'))
  insist(passedStep('reader-panels', 'Verify repaired live Aa, layout, and source position with mocked API') &&
    passedStep('page-layout', 'Verify repaired emitted ON reader and synthetic PDF Original') &&
    passedStep('library', 'Verify repaired own EPUB isolation on the handed-off build'),
  'Repaired menu, position, PDF, and own EPUB acceptance did not run successfully')
  const pageAudit = accepted.jobs.find(job => job.name === 'checks (page-layout)' &&
    job.steps?.some(step => step.name === 'Verify every Shakespeare edition and reported passage' && step.conclusion === 'success'))
  insist(pageAudit, 'Full live Shakespeare audit did not run successfully')
  const pageLog = textLog(await get(`/actions/jobs/${pageAudit.id}/logs`))
  insist(pageLog.split('\n').filter(line => /\bPASS (?:chromium|webkit)-/.test(line)).length === 120,
    'All 120 exact-bundle speaker cases must pass')
  const deploymentLog = textLog(await get(`/actions/jobs/${deploy.id}/logs`))
  const versions = [...deploymentLog.matchAll(/Current Version ID: ([a-f0-9-]{36})/g)]
  const workerVersionId = versions.at(-1)?.[1]
  const bundle = [...deploymentLog.matchAll(/serving verified (\/assets\/index-[\w-]+\.js) at https:\/\/tinct\.app/g)].at(-1)?.[1]
  insist(workerVersionId && workerVersionId !== cfg.predecessorVersion && bundle &&
    deploymentLog.includes(`repair_predecessor_version=${cfg.predecessorVersion}`),
  'Exact repaired deployment and accepted predecessor proof are missing')
  await assertReviewedMain()
  const live = await fetchLive('https://tinct.app/reader')
  insist(live.status === 200 && JSON.stringify(servedBundle(live.text)) === JSON.stringify([bundle]),
    'Production no longer serves the accepted repaired bundle')
  const result = { repairRunId: run.id, predecessorVersion: cfg.predecessorVersion, workerVersionId, bundle }
  log(JSON.stringify(result))
  return result
}
