import { readAccountNoticeSeen, writeAccountNoticeSeen } from './findableNoticeAccount'
export const WHATS_NEW_PREF = 'profileFlowOctober2026Seen'
export const WHATS_NEW_TITLE = 'Tinct has grown up a lot'
export const WHATS_NEW_BULLETS = [
  ['Your own books and PDFs.', 'Open your PDFs and EPUBs with the same companion.'],
  ['Read with friends.', 'Follow people you know and see who has read most this week.'],
  ['AI in the text.', 'You can now explain, simplify and fact-check as you read, by highlighting the text.'],
] as const
export function returningAccount(createdAt: string | null | undefined, now = Date.now()): boolean {
  const created = Date.parse(createdAt ?? '')
  return Number.isFinite(created) && now - created > 30 * 86_400_000
}
/** Reserve the one showing in the account's versioned preferences, before display. */
export async function claimWhatsNew(userId: string): Promise<boolean> {
  try {
    if (await readAccountNoticeSeen(userId, WHATS_NEW_PREF)) return false
    return await writeAccountNoticeSeen(userId, WHATS_NEW_PREF, true)
  } catch { return false }
}
