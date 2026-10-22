import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetLanguagesColumnProbe, supabaseProfileStore } from './profileStore'

const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
const ID = '11111111-1111-4111-8111-111111111111'

/** reader_profiles before 20261023_reading_languages.sql has run: PostgREST refuses the column. */
function withoutColumn(log: { url: string; method: string; body?: unknown }[]) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = decodeURIComponent(String(input))
    const method = init?.method ?? 'GET'
    log.push({ url, method, body: init?.body ? JSON.parse(String(init.body)) : undefined })
    if (method === 'GET' && url.includes('reading_languages')) return Response.json({ code: '42703', message: 'column reader_profiles.reading_languages does not exist' }, { status: 400 })
    if (method === 'PATCH' && String(init?.body).includes('reading_languages')) return Response.json({ code: 'PGRST204', message: "Could not find the 'reading_languages' column of 'reader_profiles' in the schema cache" }, { status: 400 })
    if (method === 'GET') return Response.json([{ id: ID, display_name: 'Reader' }])
    return new Response(null, { status: 204 })
  })
}

beforeEach(() => resetLanguagesColumnProbe())
afterEach(() => vi.unstubAllGlobals())

describe('reading_languages before its SQL has run', () => {
  it('reads the profile without the column, and then stops asking for it', async () => {
    const log: { url: string; method: string }[] = []
    vi.stubGlobal('fetch', withoutColumn(log))
    const store = supabaseProfileStore(env)
    expect(await store.getOwn(ID)).toMatchObject({ id: ID })
    expect(await store.getOwn(ID)).toMatchObject({ id: ID })
    expect(log.map(entry => entry.url.includes('reading_languages'))).toEqual([true, false, false])
  })

  it('saves everything else when the column is missing', async () => {
    const log: { url: string; method: string; body?: unknown }[] = []
    vi.stubGlobal('fetch', withoutColumn(log))
    const store = supabaseProfileStore(env)
    expect(await store.update(ID, { reading_languages: ['en', 'da'], new_books_open_in: 'human' })).toBe('ok')
    const patches = log.filter(entry => entry.method === 'PATCH').map(entry => entry.body as Record<string, unknown>)
    expect(patches).toHaveLength(2)
    expect(patches[1]).toMatchObject({ new_books_open_in: 'human' })
    expect(patches[1]).not.toHaveProperty('reading_languages')
  })

  it('a new row never sends the column (its default fills it)', async () => {
    const log: { url: string; method: string; body?: unknown }[] = []
    vi.stubGlobal('fetch', withoutColumn(log))
    const store = supabaseProfileStore(env)
    await store.create({ id: ID, reading_languages: ['en'] } as never)
    expect(log[0].body).not.toHaveProperty('reading_languages')
  })

  it('another 400 is not taken for the missing column', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ code: '23514', message: 'violates check constraint "reader_profiles_name_length"' }, { status: 400 })))
    const store = supabaseProfileStore(env)
    await expect(store.update(ID, { reading_languages: ['en'], display_name: '' })).rejects.toThrow('profiles unavailable')
  })
})
