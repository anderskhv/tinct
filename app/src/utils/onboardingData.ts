import type { Edition, EditionKey, Language } from '../types'

export type OnboardingLanguage = 'en' | 'da'

export interface OnboardingLoadResult<T> {
  data: T | null
  language: OnboardingLanguage
  danishAvailable: boolean
}

function editionLanguage(editions: Edition[], editionKey?: EditionKey): Language | undefined {
  if (!editionKey) return undefined
  return editions.find(edition => edition.key === editionKey)?.language
}

export function inferOnboardingLanguage(
  editions: Edition[],
  editionKey: EditionKey | undefined,
  readingLanguages: Language[]
): OnboardingLanguage {
  if (editionLanguage(editions, editionKey) === 'da') return 'da'
  if (readingLanguages.includes('da') && !readingLanguages.includes('en')) return 'da'
  return 'en'
}

async function fetchOnboardingJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(path)
    if (!response.ok) return null
    const json = await response.json()
    if (!json || typeof json !== 'object') return null
    return json as T
  } catch {
    return null
  }
}

export async function loadOnboardingData<T>(
  bookId: string,
  requestedLanguage: OnboardingLanguage
): Promise<OnboardingLoadResult<T>> {
  if (requestedLanguage === 'da') {
    const danish = await fetchOnboardingJson<T>(`/data/onboarding/${bookId}.da.json?v=2`)
    if (danish) return { data: danish, language: 'da', danishAvailable: true }
  }

  const english = await fetchOnboardingJson<T>(`/data/onboarding/${bookId}.json?v=2`)
  return {
    data: english,
    language: 'en',
    danishAvailable: requestedLanguage === 'da' ? false : true,
  }
}
