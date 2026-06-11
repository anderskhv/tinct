// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import {
  appendReaderSessionShadow,
  clearReaderSessionShadowLog,
  installReaderSessionShadowDebug,
  isReaderSessionShadowEnabled,
  loadReaderSessionShadowLog,
  setReaderSessionShadowEnabled,
} from './shadow'

describe('reader session shadow logging', () => {
  afterEach(() => {
    clearReaderSessionShadowLog()
    localStorage.removeItem('tinct:reader-session-v2-shadow')
  })

  it('is on by default and records locally', () => {
    expect(isReaderSessionShadowEnabled()).toBe(true)
    appendReaderSessionShadow({ kind: 'event', event: 'OPEN_BOOK', detail: { bookId: 'bible' } })
    expect(loadReaderSessionShadowLog()).toHaveLength(1)
  })

  it('can be disabled per browser', () => {
    setReaderSessionShadowEnabled(false)
    expect(isReaderSessionShadowEnabled()).toBe(false)
    appendReaderSessionShadow({ kind: 'event', event: 'OPEN_BOOK', detail: { bookId: 'bible' } })
    expect(loadReaderSessionShadowLog()).toEqual([])
  })

  it('can be enabled at runtime in deployed builds', () => {
    setReaderSessionShadowEnabled(true)
    expect(isReaderSessionShadowEnabled()).toBe(true)
    appendReaderSessionShadow({ kind: 'event', event: 'OPEN_BOOK', detail: { bookId: 'bible' } })

    expect(loadReaderSessionShadowLog()).toHaveLength(1)
    expect(loadReaderSessionShadowLog()[0]).toMatchObject({
      kind: 'event',
      event: 'OPEN_BOOK',
      detail: { bookId: 'bible' },
    })
  })

  it('installs a window debug helper', () => {
    setReaderSessionShadowEnabled(true)
    installReaderSessionShadowDebug()

    expect(window.__tinctReaderSessionV2?.enabled).toBe(true)
    window.__tinctReaderSessionV2?.clear()
    expect(window.__tinctReaderSessionV2?.entries).toEqual([])
  })
})
