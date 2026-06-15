import { describe, expect, it } from 'vitest'
import { handleFixesCount, handleReportStatus } from './worker/routes/issueStatus'

const configuredEnv = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
}

describe('issue status routes', () => {
  it('returns unknown report status when Supabase is not configured', async () => {
    const response = await handleReportStatus(
      new Request('https://tinct.app/api/report-status?id=018f1fdb-3e20-7fe3-9e73-fb2b2af4c001'),
      {},
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'unknown' })
  })

  it('returns unknown report status for invalid ids without querying', async () => {
    const response = await handleReportStatus(
      new Request('https://tinct.app/api/report-status?id=not-a-uuid'),
      configuredEnv,
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'unknown' })
  })

  it('returns zero fixes for anonymous users', async () => {
    const response = await handleFixesCount(
      new Request('https://tinct.app/api/fixes-count'),
      configuredEnv,
      async () => null,
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ count: 0 })
  })

  it('returns zero fixes when the count query fails', async () => {
    const response = await handleFixesCount(
      new Request('https://tinct.app/api/fixes-count'),
      configuredEnv,
      async () => ({ id: '018f1fdb-3e20-7fe3-9e73-fb2b2af4c001', email: 'reader@example.com' }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ count: 0 })
  })
})
