import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleScheduled } from './emails'

afterEach(() => { vi.unstubAllGlobals() })

describe('lifecycle emails respect consent', () => {
  it('asks only for profiles that opted in to email', async () => {
    const urls: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      urls.push(String(url))
      return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))
    await handleScheduled({ SUPABASE_URL: 'https://db.example', SUPABASE_SERVICE_ROLE_KEY: 'service', BREVO_API_KEY: 'brevo' } as never)
    const profileQueries = urls.filter(url => url.includes('/rest/v1/profiles?'))
    expect(profileQueries.length).toBeGreaterThan(0)
    for (const url of profileQueries) expect(url).toContain('email_opt_in=is.true')
    expect(urls.some(url => url.includes('brevo'))).toBe(false)
  })
})
