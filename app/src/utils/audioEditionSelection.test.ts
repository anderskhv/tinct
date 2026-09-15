import { describe, expect, it } from 'vitest'
import type { Edition } from '../types'
import { HEART_OF_DARKNESS, NIELS_LYHNE } from '../data/bookRegistry'
import { matchingAudioEditions, resolveAudioEditionKey, resolvedAudioIsAvailable } from './audioEditionSelection'

const editions: Edition[] = [
  { key: 'original-da', language: 'da', style: 'original', label: 'Original Danish', aligned: true },
  { key: 'modern-da', language: 'da', style: 'modern', label: 'Modern Danish', aligned: true },
  { key: 'original-en', language: 'en', style: 'original', label: 'Original English', aligned: true, hasAudio: true },
  { key: 'modern-en', language: 'en', style: 'modern', label: 'Modern English', aligned: true, hasAudio: true },
]

describe('audio edition selection', () => {
  it('never carries an English audiobook into a Danish reading edition', () => {
    expect(resolveAudioEditionKey('original-en', 'original-da', editions)).toBe('original-da')
    expect(matchingAudioEditions('original-da', editions)).toEqual([])
    expect(resolvedAudioIsAvailable('original-da', 'original-da', editions)).toBe(false)
  })

  it('keeps an explicit same-language fallback when the text edition has no audio', () => {
    const withoutOriginalAudio = editions.map(edition => (
      edition.key === 'original-en' ? { ...edition, hasAudio: false } : edition
    ))
    expect(resolveAudioEditionKey('modern-en', 'original-en', withoutOriginalAudio)).toBe('modern-en')
  })

  it('locks narration to the selected edition when that edition has audio', () => {
    expect(resolveAudioEditionKey('original-en', 'modern-en', editions)).toBe('modern-en')
  })

  it('keeps the reported books in the selected language', () => {
    expect(resolveAudioEditionKey('original-en', 'original-da', NIELS_LYHNE.editions)).toBe('original-da')
    expect(resolvedAudioIsAvailable('original-da', 'original-da', NIELS_LYHNE.editions)).toBe(false)
    expect(resolveAudioEditionKey('modern-da', 'original-en', HEART_OF_DARKNESS.editions)).toBe('original-en')
    expect(resolvedAudioIsAvailable('original-en', 'original-en', HEART_OF_DARKNESS.editions)).toBe(true)
  })
})
