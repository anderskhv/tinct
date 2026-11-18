// @vitest-environment jsdom
/** The one-time findable-profiles notice (Anders, 19 and 21 Oct 2026): once per account, kept in the account's preferences. */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FakeRow } from './fakeUserData.test-helpers'

const { rows } = vi.hoisted(() => ({ rows: new Map<string, FakeRow>() }))
vi.mock('../services/supabase', async () => {
  const { fakeUserData: fake } = await import('./fakeUserData.test-helpers')
  return { supabase: fake(rows) }
})

import { FINDABLE_NOTICE_COPY, FINDABLE_NOTICE_KEY_PREFIX, FINDABLE_NOTICE_PREF, checkFindableNoticeAccount, dismissFindableNotice, findableNoticeDue, findableNoticeText, markFindableNoticeShown, recordFindableNoticeSeen, resetFindableNoticeVisit } from './findableNotice'
import { clearLocalUserData } from '../services/storage'

const A = '11111111-1111-4111-8111-111111111111'
const B = '22222222-2222-4222-8222-222222222222'
/** Profiles set up before findable profiles (19 Oct 2026), the only ones it is for. */
const FRIENDS = { visibility: 'friends', setUpBeforeFindable: true } as const
const EVERYONE = { visibility: 'everyone', setUpBeforeFindable: true } as const
const settle = async () => { for (let i = 0; i < 10; i++) await new Promise(resolve => setTimeout(resolve, 0)) }
/** Another device, browser or private window: nothing on this device, a fresh page. */
const anotherDevice = () => { localStorage.clear(); resetFindableNoticeVisit() }

beforeEach(() => { rows.clear(); anotherDevice() })

describe('the findable-profiles notice', () => {
  it('is for Friends and Everyone profiles only, in Anders\'s words for Friends, with no capitals-only line', () => {
    expect(findableNoticeText('friends')).toBe('Readers can now find you by name and picture. Your reading stays private until you accept a follower. Change it in Settings.')
    expect(findableNoticeText('everyone')).toContain('Change it in Settings.')
    expect(findableNoticeText('only_me')).toBeNull()
    expect(findableNoticeText(null)).toBeNull()
    for (const text of Object.values(FINDABLE_NOTICE_COPY)) expect(text).not.toMatch(/\b[A-Z]{3,}\b/)
  })

  it('waits for the account before it is due, and is never due signed out or for Only me', async () => {
    expect(findableNoticeDue(FRIENDS, A)).toBe(false)
    await checkFindableNoticeAccount(A)
    expect(findableNoticeDue(FRIENDS, A)).toBe(true)
    expect(findableNoticeDue({ visibility: 'only_me', setUpBeforeFindable: true } as const, A)).toBe(false)
    expect(findableNoticeDue(FRIENDS, null)).toBe(false)
    expect(findableNoticeDue(null, A)).toBe(false)
  })

  it('is never for a profile set up since findable profiles shipped: it saw the choice when choosing', async () => {
    await checkFindableNoticeAccount(A)
    expect(findableNoticeDue({ visibility: 'friends', setUpBeforeFindable: false }, A)).toBe(false)
    expect(findableNoticeDue({ visibility: 'everyone' }, A)).toBe(false)
    expect(findableNoticeDue(FRIENDS, A)).toBe(true)
  })

  it('shown once: the account is marked seen on show, the copy stays until dismissed, and no other device shows it', async () => {
    rows.set(`${A}:preferences`, { value: { voicePersona: 'male', voicePersonaChosen: true }, rev: 4 })
    await checkFindableNoticeAccount(A)
    markFindableNoticeShown(A)
    await settle()
    // Written on show, merged into the existing preferences (the voice choice is kept).
    expect(rows.get(`${A}:preferences`)).toEqual({ value: { voicePersona: 'male', voicePersonaChosen: true, [FINDABLE_NOTICE_PREF]: true }, rev: 5 })
    expect(localStorage.getItem(FINDABLE_NOTICE_KEY_PREFIX + A)).toBe('2')
    // Still on screen this visit, until the reader ends it.
    expect(findableNoticeDue(FRIENDS, A)).toBe(true)
    document.body.innerHTML = '<div data-findable-notice></div><p id="keep"></p>'
    dismissFindableNotice(A)
    expect(document.querySelector('[data-findable-notice]')).toBeNull()
    expect(document.getElementById('keep')).toBeTruthy()
    expect(findableNoticeDue(EVERYONE, A)).toBe(false)
    // A new device or private window, never dismissed there: not again.
    anotherDevice()
    await checkFindableNoticeAccount(A)
    expect(findableNoticeDue(FRIENDS, A)).toBe(false)
    expect(localStorage.getItem(FINDABLE_NOTICE_KEY_PREFIX + A)).toBe('2')
    // Another account is its own.
    await checkFindableNoticeAccount(B)
    expect(findableNoticeDue(FRIENDS, B)).toBe(true)
  })

  it('shown and closed without a tap still counts: the next visit does not show it', async () => {
    await checkFindableNoticeAccount(A)
    markFindableNoticeShown(A)
    await settle()
    anotherDevice()
    await checkFindableNoticeAccount(A)
    expect(findableNoticeDue(FRIENDS, A)).toBe(false)
  })

  it('opening Settings marks it seen for the account; a dismissal kept only on this device is told to the account once', async () => {
    await recordFindableNoticeSeen(A)
    expect(rows.get(`${A}:preferences`)?.value).toEqual({ [FINDABLE_NOTICE_PREF]: true })
    localStorage.setItem(FINDABLE_NOTICE_KEY_PREFIX + B, '1')
    await checkFindableNoticeAccount(B)
    expect(rows.get(`${B}:preferences`)?.value).toEqual({ [FINDABLE_NOTICE_PREF]: true })
    expect(localStorage.getItem(FINDABLE_NOTICE_KEY_PREFIX + B)).toBe('2')
  })

  it('a failed account read shows nothing this visit', async () => {
    const { supabase } = await import('../services/supabase')
    const from = supabase!.from
    ;(supabase as unknown as { from: unknown }).from = () => ({ select() { return this }, eq() { return this }, maybeSingle: async () => ({ data: null, error: { message: 'offline' } }) })
    try {
      await checkFindableNoticeAccount(A)
      expect(findableNoticeDue(FRIENDS, A)).toBe(false)
    } finally { (supabase as unknown as { from: unknown }).from = from }
  })

  it('sign-out clears the device copy with the rest of the reader data; the account keeps it', async () => {
    dismissFindableNotice(A)
    await settle()
    expect(localStorage.getItem(FINDABLE_NOTICE_KEY_PREFIX + A)).toBe('2')
    clearLocalUserData()
    expect(localStorage.getItem(FINDABLE_NOTICE_KEY_PREFIX + A)).toBeNull()
    resetFindableNoticeVisit()
    await checkFindableNoticeAccount(A)
    expect(findableNoticeDue(FRIENDS, A)).toBe(false)
  })
})
