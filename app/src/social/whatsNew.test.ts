import { beforeEach, expect, it, vi } from 'vitest'
const { read, write } = vi.hoisted(() => ({ read: vi.fn(), write: vi.fn() }))
vi.mock('./findableNoticeAccount', () => ({ readAccountNoticeSeen: read, writeAccountNoticeSeen: write }))
import { claimWhatsNew, returningAccount, WHATS_NEW_PREF } from './whatsNew'
beforeEach(() => { read.mockReset(); write.mockReset() })
it('is only for known accounts older than thirty days', () => {
  const now = Date.parse('2026-10-26T12:00:00Z')
  expect(returningAccount('2026-09-26T12:00:00Z', now)).toBe(false)
  expect(returningAccount('2026-09-26T11:59:59Z', now)).toBe(true)
  expect(returningAccount(null, now)).toBe(false)
  expect(returningAccount('2026-10-26T11:00:00Z', now)).toBe(false)
})
it('does not redisplay after either button or on another device', async () => {
  read.mockResolvedValue(true)
  expect(await claimWhatsNew('reader')).toBe(false)
  expect(write).not.toHaveBeenCalled()
})
it('claims the account preference before showing and fails closed on conflict', async () => {
  read.mockResolvedValue(false); write.mockResolvedValue(false)
  expect(await claimWhatsNew('reader')).toBe(false)
  expect(write).toHaveBeenCalledWith('reader', WHATS_NEW_PREF, true)
  write.mockResolvedValue(true)
  expect(await claimWhatsNew('reader')).toBe(true)
})
