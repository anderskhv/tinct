import { describe, expect, it } from 'vitest'
import {
  LAB_AI_ACTIONS_KEY,
  LAB_FREE_AI_ACTIONS,
  LAB_PAID_FEATURES,
  LAB_SECOND_BOOK_NUDGE_KEY,
  clearLabAiActionCount,
  decideLabAiAction,
  gateLabAiAction,
  hasSeenSecondBookNudge,
  isLabPaidFeature,
  labBooksReadOnDevice,
  labCurrentPath,
  labSignInHref,
  markSecondBookNudgeShown,
  readLabAiActionCount,
  recordLabAiAction,
  shouldShowSecondBookNudge,
  type LabPromptStorage,
} from './labAccountPrompt'

function memoryStorage(seed: Record<string, string> = {}): LabPromptStorage & { keys(): string[] } {
  const map = new Map(Object.entries(seed))
  return {
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => { map.set(key, value) },
    removeItem: key => { map.delete(key) },
    keys: () => [...map.keys()],
  }
}

describe('lab account prompt: AI action gate', () => {
  it('lets the first anonymous AI action through and spends it', () => {
    const storage = memoryStorage()
    expect(decideLabAiAction({ signedIn: false, storage })).toEqual({ allowed: true, reason: 'free' })
    expect(gateLabAiAction({ signedIn: false, storage })).toEqual({ allowed: true, reason: 'free' })
    expect(readLabAiActionCount(storage)).toBe(LAB_FREE_AI_ACTIONS)
    expect(storage.getItem(LAB_AI_ACTIONS_KEY)).toBe('1')
  })

  it('gates the second anonymous action and keeps gating after a dismiss', () => {
    const storage = memoryStorage()
    gateLabAiAction({ signedIn: false, storage })
    expect(gateLabAiAction({ signedIn: false, storage })).toEqual({ allowed: false, reason: 'account-required' })
    // A dismissed sheet sends nothing and spends nothing: the count is unchanged.
    expect(readLabAiActionCount(storage)).toBe(1)
    expect(gateLabAiAction({ signedIn: false, storage })).toEqual({ allowed: false, reason: 'account-required' })
    expect(readLabAiActionCount(storage)).toBe(1)
  })

  it('never gates or counts a signed-in reader, whatever the device count says', () => {
    const storage = memoryStorage({ [LAB_AI_ACTIONS_KEY]: '7' })
    expect(decideLabAiAction({ signedIn: true, storage })).toEqual({ allowed: true, reason: 'signed-in' })
    expect(gateLabAiAction({ signedIn: true, storage })).toEqual({ allowed: true, reason: 'signed-in' })
    expect(readLabAiActionCount(storage)).toBe(7)
  })

  it('treats a wiped or garbage counter as zero (clearLocalUserData semantics)', () => {
    const storage = memoryStorage({ [LAB_AI_ACTIONS_KEY]: 'not-a-number' })
    expect(readLabAiActionCount(storage)).toBe(0)
    recordLabAiAction(storage)
    expect(readLabAiActionCount(storage)).toBe(1)
    clearLabAiActionCount(storage)
    expect(storage.keys()).toEqual([])
    expect(decideLabAiAction({ signedIn: false, storage }).allowed).toBe(true)
  })

  it('keeps the counter in the tinct: namespace so sign-out wipes it', () => {
    expect(LAB_AI_ACTIONS_KEY.startsWith('tinct:')).toBe(true)
    expect(LAB_SECOND_BOOK_NUDGE_KEY.startsWith('tinct:')).toBe(true)
  })

  it('survives a storage that throws', () => {
    const broken: LabPromptStorage = {
      getItem: () => { throw new Error('private mode') },
      setItem: () => { throw new Error('private mode') },
      removeItem: () => { throw new Error('private mode') },
    }
    expect(readLabAiActionCount(broken)).toBe(0)
    expect(() => recordLabAiAction(broken)).not.toThrow()
    expect(gateLabAiAction({ signedIn: false, storage: broken }).allowed).toBe(true)
  })

  it('blocks without a storage only after the free action, never for reading', () => {
    // No storage at all (SSR / blocked): every action reads as the first one.
    expect(gateLabAiAction({ signedIn: false, storage: null }).allowed).toBe(true)
    expect(gateLabAiAction({ signedIn: false, storage: null }).allowed).toBe(true)
  })
})

describe('lab account prompt: paid lines (not enforced)', () => {
  it('records the decided paid features and leaves the undecided ones open', () => {
    expect(isLabPaidFeature('chat')).toBe(true)
    expect(isLabPaidFeature('voice')).toBe(true)
    expect(isLabPaidFeature('recap')).toBe(true)
    expect(LAB_PAID_FEATURES.audiobook).toBeNull()
    expect(LAB_PAID_FEATURES.compare).toBeNull()
    expect(isLabPaidFeature('audiobook')).toBe(false)
    expect(isLabPaidFeature('compare')).toBe(false)
  })
})

describe('lab account prompt: sign-in links', () => {
  it('builds create and sign-in links that return to the reader', () => {
    expect(labSignInHref('create', '/lab/reader')).toBe('/lab/sign-in?mode=create&returnTo=%2Flab%2Freader')
    expect(labSignInHref('signin', '/lab/reader?voice=v2')).toBe('/lab/sign-in?returnTo=%2Flab%2Freader%3Fvoice%3Dv2')
    expect(labSignInHref('signin', '')).toBe('/lab/sign-in?returnTo=%2Flab%2Flibrary')
  })

  it('reads the current path with its query', () => {
    expect(labCurrentPath({ pathname: '/lab/reader', search: '?voice=v2' })).toBe('/lab/reader?voice=v2')
    expect(labCurrentPath(null)).toBe('/lab/library')
  })
})

describe('lab account prompt: second-book nudge', () => {
  const memoryWith = (...bookIds: string[]) => ({
    sessions: Object.fromEntries(bookIds.map((bookId, index) => [`s${index}`, { anchor: { bookId } }])),
  })

  it('collects library book ids from reading memory and finished chapters, not biblical pins', () => {
    const books = labBooksReadOnDevice({
      memory: memoryWith('bible', 'odyssey'),
      position: { finished: { frankenstein: [1], empty: [] } },
    })
    expect([...books].sort()).toEqual(['bible', 'frankenstein', 'odyssey'])
    expect(labBooksReadOnDevice({}).size).toBe(0)
  })

  it('shows once for an anonymous reader opening a different book, then never again', () => {
    const storage = memoryStorage()
    const booksRead = new Set(['bible'])
    expect(shouldShowSecondBookNudge({ signedIn: false, bookId: 'bible', booksRead, storage })).toBe(false)
    expect(shouldShowSecondBookNudge({ signedIn: false, bookId: 'odyssey', booksRead, storage })).toBe(true)
    markSecondBookNudgeShown(storage)
    expect(hasSeenSecondBookNudge(storage)).toBe(true)
    expect(storage.getItem(LAB_SECOND_BOOK_NUDGE_KEY)).toBe('1')
    expect(shouldShowSecondBookNudge({ signedIn: false, bookId: 'odyssey', booksRead, storage })).toBe(false)
    expect(shouldShowSecondBookNudge({ signedIn: false, bookId: 'frankenstein', booksRead, storage })).toBe(false)
  })

  it('never nudges a signed-in reader or a first book', () => {
    const storage = memoryStorage()
    expect(shouldShowSecondBookNudge({ signedIn: true, bookId: 'odyssey', booksRead: new Set(['bible']), storage })).toBe(false)
    expect(shouldShowSecondBookNudge({ signedIn: false, bookId: 'odyssey', booksRead: new Set(), storage })).toBe(false)
    expect(storage.keys()).toEqual([])
  })
})
