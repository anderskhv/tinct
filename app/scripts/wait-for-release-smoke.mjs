import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

// A pending rollout deliberately rejects its ordinary push deploy. Its approved
// manual deploy is a separate run of the same workflow and exact source commit.
export async function waitForReleaseSmoke(get, {
  commitSha, attempts = 360, delay = () => new Promise(done => setTimeout(done, 10_000)),
}) {
  if (!/^[0-9a-f]{40}$/.test(commitSha || '')) throw Error('A full release commit SHA is required')
  for (let attempt = 0; attempt < attempts; attempt++) {
    const { workflow_runs = [] } = await get(`/actions/runs?head_sha=${commitSha}&per_page=30`)
    const releases = workflow_runs.filter(run => run.head_sha === commitSha &&
      run.path === '.github/workflows/deploy.yml' && ['push', 'workflow_dispatch'].includes(run.event))
    for (const release of releases) {
      if (release.status !== 'completed' || release.conclusion !== 'success') continue
      const { jobs = [] } = await get(`/actions/runs/${release.id}/jobs`)
      if (jobs.some(job => job.steps?.some(step => step.name === 'Smoke test production' && step.conclusion === 'success'))) {
        return release.id
      }
    }
    // Do not fail on the intentionally blocked push while the independently
    // approved workflow is still queued, running, or not yet dispatched.
    if (attempt + 1 < attempts) await delay()
  }
  throw Error('Matching push or approved manual release has not passed its production smoke check')
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const base = `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}`
  const headers = { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json' }
  const get = async path => {
    const response = await fetch(base + path, { headers })
    if (!response.ok) throw Error(`GitHub release check: HTTP ${response.status}`)
    return response.json()
  }
  const id = await waitForReleaseSmoke(get, { commitSha: process.env.GITHUB_SHA })
  console.log(`Matching release ${id} completed successfully and passed production smoke`)
}
