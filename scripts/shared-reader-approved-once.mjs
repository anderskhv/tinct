// One approved recovery sequence. No checkout, dependency installation, secrets,
// content writes, failed-run retries, or changes to the existing release guards.
export const APPROVED_RELEASE = Object.freeze({
  repo: 'anderskhv/tinct', pr: 607,
  branch: 'codex/shared-reader-acceptance-corrections-20261023',
  base: 'fafc518d8d6284c2e9406aba68c478ff0ad37980',
  correctedSource: 'cacc0b3c029d8c19212fbf07561e2a114d1dac57',
  correctedTree: 'c24426fb58bf090101899a0f984763f463965316',
  floorCommit: 'dcc2dca562b9c05f252a532f6d5e6a839aa5199b',
  floorVersion: 'f9521101-aa25-4d2c-ab44-b0d1c9e149bf',
  floorRun: 40024003699, failedReaderRun: 40028070875,
  approvedAt: '2026-10-23T21:01:25Z', deadline: '2026-10-24T03:01:25Z',
})
const orchestrationFiles = [
  '.github/workflows/shared-reader-approved-once.yml',
  'app/src/scripts.sharedReaderApprovedOnce.test.ts',
  'scripts/shared-reader-approved-once.mjs',
].sort()
const groups = ['audio-smoke', 'library', 'page-layout', 'production', 'publication', 'reader-panels']
const voiceStep = 'Verify current production voices and delayed lookup acknowledgement'
const insist = (condition, message) => { if (!condition) throw Error(message) }
const textLog = value => typeof value === 'string' ? value : Buffer.from(value).toString('utf8')

export async function releaseApprovedOnce({ api, fetchLive, now = Date.now,
  sleep = ms => new Promise(done => setTimeout(done, ms)), log = () => {} },
  { verifyRunId, headSha }, cfg = APPROVED_RELEASE) {
  const base = `/repos/${cfg.repo}`
  const get = path => api('GET', base + path)
  const deadline = Date.parse(cfg.deadline)
  const withinDeadline = () => insist(now() < deadline, 'Original approval window expired; no further dispatch')
  const pause = async () => { withinDeadline(); await sleep(Math.min(20_000, deadline - now())); withinDeadline() }
  insist(cfg.repo === 'anderskhv/tinct' && /^[a-f0-9]{40}$/.test(headSha || ''), 'Unknown repository or source')
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
      pr.head.ref === cfg.branch && pr.head.repo.full_name === cfg.repo, 'Source is not the reviewed correction PR merge')
    const merge = await get(`/git/commits/${headSha}`)
    insist(merge.parents.length === 2 && merge.parents[0].sha === cfg.base &&
      merge.parents[1].sha === pr.head.sha, 'Unexpected merge ancestry')
    const reviewedHead = await get(`/git/commits/${pr.head.sha}`)
    const corrected = await get(`/git/commits/${cfg.correctedSource}`)
    insist(merge.tree.sha === reviewedHead.tree.sha && corrected.tree.sha === cfg.correctedTree,
      'Reviewed tree changed')
    const diff = await get(`/compare/${cfg.correctedSource}...${headSha}`)
    insist(diff.merge_base_commit.sha === cfg.correctedSource && diff.files?.length === 3 &&
      JSON.stringify(diff.files.map(file => file.filename).sort()) === JSON.stringify(orchestrationFiles) &&
      diff.files.every(file => file.status === 'added'), 'Runtime or corrected acceptance source changed')
    const manifest = await get(`/contents/app/release/shared-reader-floor.json?ref=${headSha}`)
    const floor = JSON.parse(Buffer.from(manifest.content, 'base64').toString('utf8'))
    insist(floor.v === 1 && floor.floorVersionId === cfg.floorVersion && floor.floorCommit === cfg.floorCommit &&
      floor.proof === 'src/worker.rollbackFloor.test.ts', 'Accepted floor pin changed')
  }
  await assertReviewedMain()
  const floorRun = await get(`/actions/runs/${cfg.floorRun}`)
  insist(floorRun.status === 'completed' && floorRun.conclusion === 'success' &&
    floorRun.head_sha === cfg.floorCommit, 'Compatible floor was not accepted')
  const failed = await get(`/actions/runs/${cfg.failedReaderRun}`)
  insist(failed.status === 'completed' && failed.conclusion === 'failure' && failed.head_sha === cfg.base &&
    failed.run_attempt === 1, 'Original Mac-watched reader run must be permanently failed')
  const oldJobs = await get(`/actions/runs/${cfg.failedReaderRun}/jobs?per_page=100`)
  const rollback = oldJobs.jobs.find(job => job.name === 'rollback' && job.conclusion === 'success')
  insist(rollback, 'Original reader rollback has not succeeded')
  const rollbackLog = textLog(await get(`/actions/jobs/${rollback.id}/logs`))
  insist(rollbackLog.includes(`Current Version ID: ${cfg.floorVersion}`), 'Rollback did not restore the accepted floor')
  // The old Mac watcher waits for that immutable failed run and exits on failure;
  // it cannot reach another reader or paid dispatch for this new merge SHA.

  async function matchingRuns(workflow) {
    const data = await get(`/actions/workflows/${workflow}/runs?head_sha=${headSha}&event=workflow_dispatch&per_page=100`)
    insist(data.total_count <= 100, 'Run list requires review before dispatch')
    insist(data.workflow_runs.every(run => run.head_sha === headSha && run.event === 'workflow_dispatch'), 'Unexpected run list')
    insist(data.workflow_runs.length <= 1, `Multiple ${workflow} runs; no duplicate dispatch`)
    return data.workflow_runs[0]
  }
  async function checkVoiceBudget() {
    const recent = []
    let previousDate = Infinity
    for (let page = 1; page <= 10; page++) {
      const data = await get(`/actions/workflows/voice-lab-acceptance.yml/runs?event=workflow_dispatch&per_page=100&page=${page}`)
      for (const run of data.workflow_runs) {
        const created = Date.parse(run.created_at)
        insist(Number.isFinite(created) && created <= previousDate, 'Voice history order requires review')
        previousDate = created
        if (created >= Date.parse(cfg.approvedAt)) recent.push(run)
      }
      insist(recent.every(run => run.head_sha === headSha) && recent.length <= 1,
        'A voice attempt already exists in this approval window')
      if (previousDate < Date.parse(cfg.approvedAt) || data.workflow_runs.length < 100 || page * 100 >= data.total_count) return
    }
    throw Error('Voice history requires review before spending')
  }
  await checkVoiceBudget()
  async function launchOnce(workflow, inputs) {
    let run = await matchingRuns(workflow)
    if (!run) {
      await assertReviewedMain()
      withinDeadline() // Immediately before the only mutation; reads may have taken time.
      try {
        await api('POST', base + `/actions/workflows/${workflow}/dispatches`, { ref: 'main', inputs })
      } catch {
        throw Error(`${workflow} submission uncertain; inspect Actions, never automatically retry`)
      }
      for (let attempt = 0; attempt < 6; attempt++) {
        run = await matchingRuns(workflow)
        if (run) break
        await pause()
      }
      insist(run, 'Submitted run is not visible; no retry')
    }
    log(`Using ${workflow} run ${run.id}; no duplicate launch`)
    return run.id
  }
  async function waitRun(id, workflow) {
    for (;;) {
      withinDeadline()
      const run = await get(`/actions/runs/${id}`)
      insist(run.head_sha === headSha && run.event === 'workflow_dispatch' &&
        run.path === `.github/workflows/${workflow}` && run.run_attempt === 1, 'Unexpected run identity or retry')
      if (run.status === 'completed') {
        insist(run.conclusion === 'success', `${workflow} finished as ${run.conclusion}; no retry or next stage`)
        return run
      }
      await pause()
    }
  }
  const readerRunId = await launchOnce('deploy.yml', {
    mode: 'direct', release_phase: 'reader', approved_reader_release: 'true',
  })
  await waitRun(readerRunId, 'deploy.yml')
  const accepted = await get(`/actions/runs/${readerRunId}/jobs?per_page=100`)
  const deploy = accepted.jobs.find(job => job.name === 'deploy' && job.conclusion === 'success')
  insist(deploy?.steps?.some(step => step.name === 'Deploy to Cloudflare Workers (direct mode)' && step.conclusion === 'success') &&
    groups.every(group => accepted.jobs.some(job => job.name === `checks (${group})` && job.conclusion === 'success')) &&
    accepted.jobs.some(job => job.steps?.some(step => step.name === 'Smoke test production' && step.conclusion === 'success')),
    'Reader direct deployment and all six live groups must actually pass')
  const pageAudit = accepted.jobs.find(job => job.name === 'checks (page-layout)' &&
    job.steps?.some(step => step.name === 'Verify every Shakespeare edition and reported passage' && step.conclusion === 'success'))
  insist(pageAudit, 'Full live Shakespeare audit did not run successfully')
  const pageLog = textLog(await get(`/actions/jobs/${pageAudit.id}/logs`))
  insist(pageLog.split('\n').filter(line => /\bPASS (?:chromium|webkit)-/.test(line)).length === 120,
    'All 120 exact-bundle speaker cases must pass before voice')
  const deploymentLog = textLog(await get(`/actions/jobs/${deploy.id}/logs`))
  const versions = [...deploymentLog.matchAll(/Current Version ID: ([a-f0-9-]{36})/g)]
  const workerVersionId = versions.at(-1)?.[1]
  const bundle = [...deploymentLog.matchAll(/serving verified (\/assets\/index-[\w-]+\.js) at https:\/\/tinct\.app/g)].at(-1)?.[1]
  insist(workerVersionId && workerVersionId !== cfg.floorVersion && bundle &&
    deploymentLog.includes(`floor_version_id=${cfg.floorVersion}`), 'Exact reader deployment proof is missing')
  await assertReviewedMain()
  await waitRun(readerRunId, 'deploy.yml')
  const live = await fetchLive('https://tinct.app/reader')
  const served = [...live.text.matchAll(/\/assets\/index-[\w-]+\.js/g)]
  insist(live.status === 200 && served.length === 1 && served[0][0] === bundle,
    'Production no longer serves the accepted reader bundle; no voice call')
  await checkVoiceBudget()
  const voiceRunId = await launchOnce('voice-lab-acceptance.yml', { approved_paid_voice_qa: 'true' })
  await waitRun(voiceRunId, 'voice-lab-acceptance.yml')
  const voiceJobs = await get(`/actions/runs/${voiceRunId}/jobs?per_page=100`)
  const voice = voiceJobs.jobs.find(job => job.name === 'voice' && job.conclusion === 'success' &&
    job.steps?.some(step => step.name === voiceStep && step.conclusion === 'success'))
  insist(voice, 'The real voice verification step did not run successfully')
  const voiceLog = textLog(await get(`/actions/jobs/${voice.id}/logs`))
  const reports = voiceLog.split('\n').flatMap(line => {
    const start = line.indexOf('{')
    try { return start < 0 ? [] : [JSON.parse(line.slice(start))] } catch { return [] }
  })
  insist(reports.some(report => report.passed === true && report.sessionUpdated === true &&
    report.requestedVoice === 'ara' && report.acknowledgedRequestVoice === 'ara' &&
    report.appMaleVoice === 'helios' && report.switchedVoice?.acknowledgedRequestVoice === 'helios' &&
    report.verifyForceMessage === true && report.forceMessage?.done === true && report.forceMessage.audioBytes > 0 &&
    Array.isArray(report.errors) && report.errors.length === 0 &&
    Array.isArray(report.providerErrors) && report.providerErrors.length === 0 &&
    Array.isArray(report.switchedVoice.providerErrors) && report.switchedVoice.providerErrors.length === 0),
    'Successful provider acknowledgement and audio evidence is missing')
  const result = { readerRunId, voiceRunId, workerVersionId, bundle, voiceVerified: true }
  log(JSON.stringify(result))
  return result
}
