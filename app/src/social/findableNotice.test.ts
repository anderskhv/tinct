// @vitest-environment jsdom
/** The one-time findable-profiles notice (Anders, 19 Oct 2026): once per account, cleared on sign-out. */
import { beforeEach, describe, expect, it } from 'vitest'
import { FINDABLE_NOTICE_COPY, FINDABLE_NOTICE_KEY_PREFIX, dismissFindableNotice, findableNoticeDue, findableNoticeText } from './findableNotice'
import { clearLocalUserData } from '../services/storage'

const A = '11111111-1111-4111-8111-111111111111'
const B = '22222222-2222-4222-8222-222222222222'

beforeEach(() => localStorage.clear())

describe('the findable-profiles notice', () => {
  it('is for Friends and Everyone profiles only, in Anders\'s words for Friends, with no capitals-only line', () => {
    expect(findableNoticeText('friends')).toBe('Readers can now find you by name and picture. Your reading stays private until you accept a follower. Change it in Settings.')
    expect(findableNoticeText('everyone')).toContain('Change it in Settings.')
    expect(findableNoticeText('only_me')).toBeNull()
    expect(findableNoticeText(null)).toBeNull()
    for (const text of Object.values(FINDABLE_NOTICE_COPY)) expect(text).not.toMatch(/\b[A-Z]{3,}\b/)
  })

  it('shows until dismissed, then stays dismissed for that account only', () => {
    expect(findableNoticeDue({ visibility: 'friends' }, A)).toBe(true)
    expect(findableNoticeDue({ visibility: 'only_me' }, A)).toBe(false)
    expect(findableNoticeDue({ visibility: 'friends' }, null)).toBe(false)
    expect(findableNoticeDue(null, A)).toBe(false)
    document.body.innerHTML = '<div data-findable-notice></div><p id="keep"></p>'
    dismissFindableNotice(A)
    expect(document.querySelector('[data-findable-notice]')).toBeNull()
    expect(document.getElementById('keep')).toBeTruthy()
    expect(findableNoticeDue({ visibility: 'friends' }, A)).toBe(false)
    expect(findableNoticeDue({ visibility: 'everyone' }, A)).toBe(false)
    expect(findableNoticeDue({ visibility: 'friends' }, B)).toBe(true)
  })

  it('sign-out clears the dismissal with the rest of the reader data', () => {
    dismissFindableNotice(A)
    expect(localStorage.getItem(FINDABLE_NOTICE_KEY_PREFIX + A)).toBe('1')
    clearLocalUserData()
    expect(localStorage.getItem(FINDABLE_NOTICE_KEY_PREFIX + A)).toBeNull()
  })
})
