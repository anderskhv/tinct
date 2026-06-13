import { afterEach, describe, expect, it, vi } from 'vitest'
import { inferOnboardingLanguage, loadOnboardingData } from './onboardingData'
import type { Edition } from '../types'

const editions = [
  { key: 'original-en', language: 'en', style: 'original', label: 'Original', aligned: true },
  { key: 'modern-da', language: 'da', style: 'modern', label: 'Modern Danish', aligned: true },
] as Edition[]

afterEach(() => {
  vi.restoreAllMocks()
})

describe('inferOnboardingLanguage', () => {
  it('prefers Danish when the primary edition is Danish', () => {
    expect(inferOnboardingLanguage(editions, 'modern-da', ['en', 'da'])).toBe('da')
  })

  it('prefers Danish for Danish-only reading languages', () => {
    expect(inferOnboardingLanguage(editions, 'original-en', ['da'])).toBe('da')
  })

  it('keeps English for mixed English/Danish readers on an English edition', () => {
    expect(inferOnboardingLanguage(editions, 'original-en', ['en', 'da'])).toBe('en')
  })
})

describe('loadOnboardingData', () => {
  it('loads Danish first when requested', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ bookId: 'hamlet', about: 'Dansk' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await loadOnboardingData<{ about: string }>('hamlet', 'da')

    expect(fetchMock).toHaveBeenCalledWith('/data/onboarding/hamlet.da.json?v=2')
    expect(result).toEqual({ data: { bookId: 'hamlet', about: 'Dansk' }, language: 'da', danishAvailable: true })
  })

  it('falls back silently to English when Danish is missing', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => null })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ bookId: 'hamlet', about: 'English' }) })
    vi.stubGlobal('fetch', fetchMock)

    const result = await loadOnboardingData<{ about: string }>('hamlet', 'da')

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/data/onboarding/hamlet.da.json?v=2')
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/data/onboarding/hamlet.json?v=2')
    expect(result).toEqual({ data: { bookId: 'hamlet', about: 'English' }, language: 'en', danishAvailable: false })
  })

  it('does not request Danish for English onboarding', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ bookId: 'hamlet', about: 'English' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await loadOnboardingData<{ about: string }>('hamlet', 'en')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/data/onboarding/hamlet.json?v=2')
  })
})
