// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { waitForReleaseSmoke } from '../scripts/wait-for-release-smoke.mjs'

const sha = 'a'.repeat(40)
const release = (id: number, event = 'workflow_dispatch', head_sha = sha) => ({
  id, event, head_sha, path: '.github/workflows/deploy.yml', status: 'completed', conclusion: 'success',
})
const smoke = { jobs: [{ steps: [{ name: 'Smoke test production', conclusion: 'success' }] }] }

describe('release smoke gate for live acceptance', () => {
  it('accepts an exact-source manual release beside its deliberately blocked push', async () => {
    const get = vi.fn(async (path: string) => path.includes('/jobs')
      ? path.includes('/22/') ? smoke : { jobs: [] }
      : { workflow_runs: [{ ...release(11, 'push'), conclusion: 'failure' }, release(22)] })
    await expect(waitForReleaseSmoke(get, { commitSha: sha, attempts: 1 })).resolves.toBe(22)
  })
  it('waits for the approved run instead of failing as soon as the push guard stops', async () => {
    let approved = false
    const delay = vi.fn(async () => { approved = true })
    const get = async (path: string) => path.includes('/jobs')
      ? path.includes('/22/') ? smoke : { jobs: [] }
      : { workflow_runs: approved ? [release(22)] : [{ ...release(11, 'push'), conclusion: 'failure' }] }
    await expect(waitForReleaseSmoke(get, { commitSha: sha, attempts: 2, delay })).resolves.toBe(22)
    expect(delay).toHaveBeenCalledTimes(1)
  })
  it('does not accept another commit, unrelated workflow, or a non-production smoke', async () => {
    const candidates = [release(1, 'push', 'b'.repeat(40)), { ...release(2), path: '.github/workflows/verify.yml' }, release(3)]
    const get = vi.fn(async (path: string) => path.includes('/jobs')
      ? { jobs: [{ steps: [{ name: 'Smoke test', conclusion: 'success' }] }] }
      : { workflow_runs: candidates })
    await expect(waitForReleaseSmoke(get, { commitSha: sha, attempts: 1 })).rejects.toThrow('production smoke')
    expect(get.mock.calls.filter(([path]) => path.includes('/jobs')).map(([path]) => path)).toEqual(['/actions/runs/3/jobs'])
  })
  it('remains compatible with an ordinary automatic deployment', async () => {
    const get = async (path: string) => path.includes('/jobs') ? smoke : { workflow_runs: [release(1, 'push')] }
    await expect(waitForReleaseSmoke(get, { commitSha: sha, attempts: 1 })).resolves.toBe(1)
  })
  it('rejects a failed or unfinished release even if production smoke passed', async () => {
    for (const state of [{ status: 'completed', conclusion: 'failure' }, { status: 'in_progress', conclusion: null }]) {
      const get = vi.fn(async (path: string) => path.includes('/jobs') ? smoke : { workflow_runs: [{ ...release(1), ...state }] })
      await expect(waitForReleaseSmoke(get, { commitSha: sha, attempts: 1 })).rejects.toThrow('production smoke')
      expect(get).toHaveBeenCalledTimes(1)
    }
  })
  it('stops on API failure and rejects an unknown source without making a request', async () => {
    const get = vi.fn(async () => { throw Error('GitHub unavailable') })
    await expect(waitForReleaseSmoke(get, { commitSha: 'unknown' })).rejects.toThrow('full release commit')
    expect(get).not.toHaveBeenCalled()
    await expect(waitForReleaseSmoke(get, { commitSha: sha })).rejects.toThrow('GitHub unavailable')
  })
})
