/**
 * /your-reading, /you and /friends are cards now (CARDS-BRIEF.md): their old
 * links (emails included) open the matching card over the library, or over
 * the reader page they named, whatever the switches say.
 */
import { describe, expect, it } from 'vitest'
import worker from './worker'
import { accountPageRedirect, cardUrl } from './cards/cardRoutes'

const env = { ASSETS: { fetch: async () => new Response('nf', { status: 404 }) } }
const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
const get = (path: string) => new Request(`https://tinct.app${path}`)

describe('old account pages', () => {
  it.each([
    ['/your-reading', '/library?card=reading'],
    ['/your-reading?return=%2Freader%3Fbook%3Dodyssey', '/reader?book=odyssey&card=reading'],
    ['/you', '/library?card=you'],
    ['/you?view=settings&returnTo=%2Freader', '/reader?card=settings'],
    ['/you?view=visibility', '/library?card=settings'],
    ['/friends', '/library?card=leaderboard'],
    ['/friends?tab=find', '/library?card=find'],
  ])('%s opens its card at %s', async (path, target) => {
    for (const vars of [{}, { SOCIAL_READING_TIME: '1', SOCIAL_PROFILES: '1', SOCIAL_FRIENDS: '1' }]) {
      const response = await worker.fetch(get(path), { ...env, ...vars } as never, ctx)
      expect(response.status).toBe(302)
      expect(response.headers.get('Location')).toBe(target)
    }
  })

  it('never sends a reader off the site or to a page that cannot hold the cards', () => {
    expect(accountPageRedirect('/you', '?returnTo=https%3A%2F%2Fevil.example%2Freader')).toBe('/library?card=you')
    expect(accountPageRedirect('/you', '?returnTo=%2F%2Fevil.example')).toBe('/library?card=you')
    expect(accountPageRedirect('/you', '?returnTo=%2Fabout')).toBe('/library?card=you')
    expect(cardUrl('account', '/read/odyssey/3?x=1&card=you')).toBe('/read/odyssey/3?x=1&card=account')
    expect(accountPageRedirect('/library', '')).toBeNull()
  })
})
