/**
 * The account cards' numbers, as cards.html writes them (docs/social/cards.html
 * on claude/dreamy-faraday-30zl0v, approved 9 October 2026). Pure functions.
 *
 *   "6 h 10 m"   the Your reading row on You
 *   "6 h 10"     facts, book rows and the leaderboard
 *   "96 h"       whole hours
 *   "41h20m"     the big figure (units drawn small by the card)
 *   "3rd of 5"   the Leaderboard row
 *   "Sep · 5 h 40"  a finished book
 */

function wholeMinutes(seconds: number): number {
  return Math.floor(Math.max(0, Number.isFinite(seconds) ? seconds : 0) / 60)
}

export function hoursAndMinutes(seconds: number): { hours: number; minutes: number } {
  const minutes = wholeMinutes(seconds)
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 }
}

/** "6 h 10 m", "45 m", "3 h". */
export function durationLong(seconds: number): string {
  const { hours, minutes } = hoursAndMinutes(seconds)
  if (!hours) return `${minutes} m`
  return minutes ? `${hours} h ${minutes} m` : `${hours} h`
}

/** "6 h 10", "1 h 05", "96 h", "45 m". */
export function durationShort(seconds: number): string {
  const { hours, minutes } = hoursAndMinutes(seconds)
  if (!hours) return `${minutes} m`
  return minutes ? `${hours} h ${String(minutes).padStart(2, '0')}` : `${hours} h`
}

/** The big figure's parts: [["41","h"],["20","m"]]; under an hour only minutes. */
export function figureParts(seconds: number): Array<[string, string]> {
  const { hours, minutes } = hoursAndMinutes(seconds)
  return hours ? [[String(hours), 'h'], [String(minutes), 'm']] : [[String(minutes), 'm']]
}

/**
 * Every reading-time figure the cards show, from one readingTimeStats and one
 * rounding (whole minutes, rounded down). cards.html: the You row "Your
 * reading" is the last 7 days ("6 h 10 m"), the same figure as the Your
 * reading card's "last 7 days" fact ("6 h 10"); the big figure is the total.
 * Both cards call this, so the two can never disagree (44 m against 45 m).
 */
export function readingFigures(stats: { totalSeconds: number; last7Seconds: number }): { youRow: string; last7: string; total: Array<[string, string]> } {
  return { youRow: durationLong(stats.last7Seconds), last7: durationShort(stats.last7Seconds), total: figureParts(stats.totalSeconds) }
}

export function ordinal(n: number): string {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  const suffix = n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th'
  return `${n}${suffix}`
}

/** "3rd of 5"; null without a rank. */
export function rankOf(rank: number | null | undefined, total: number): string | null {
  if (!rank || rank < 1 || total < 1) return null
  return `${ordinal(rank)} of ${total}`
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** "Sep" from "2026-09-14" or an ISO time; '' when unreadable. */
export function monthShort(value: string | null | undefined): string {
  const match = /^(\d{4})-(\d{2})/.exec(String(value || ''))
  if (!match) return ''
  return MONTHS_SHORT[Number(match[2]) - 1] ?? ''
}

/** "14 July" from "2026-07-14"; '' when unreadable. */
export function dayMonth(value: string | null | undefined): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''))
  if (!match) return ''
  const month = MONTHS_LONG[Number(match[2]) - 1]
  return month ? `${Number(match[3])} ${month}` : ''
}

/** "6 days", "1 day". */
export function streakText(days: number): string {
  const n = Math.max(0, Math.floor(days || 0))
  return `${n} ${n === 1 ? 'day' : 'days'}`
}

/** A finished book's value: "Sep · 5 h 40", or "Sep" when the time is not shared. */
export function finishedValue(finishedAt: string | null | undefined, seconds?: number | null): string {
  const month = monthShort(finishedAt)
  const time = typeof seconds === 'number' ? durationShort(seconds) : ''
  return [month, time].filter(Boolean).join(' · ')
}

/** Bar heights (percent) for the 12 weeks: the busiest week is 100%; empty weeks keep a sliver. */
export function weekHeights(weeks: Array<{ seconds: number }>): number[] {
  const most = Math.max(0, ...weeks.map(week => Math.max(0, week.seconds || 0)))
  return weeks.map(week => {
    const s = Math.max(0, week.seconds || 0)
    if (!most || !s) return 4
    return Math.max(6, Math.round(s / most * 100))
  })
}

/** "anders@…": the address is never spelled out on screen. */
export function shortEmail(email: string | null | undefined): string {
  const value = String(email || '')
  const at = value.indexOf('@')
  return at > 0 ? `${value.slice(0, at)}@…` : value
}

/** A progress fraction (0..1 or 0..100) as a whole percent. */
export function percent(progress: number | null | undefined): number {
  const value = Number(progress) || 0
  const fraction = value > 1 ? value / 100 : value
  return Math.max(0, Math.min(100, Math.round(fraction * 100)))
}

/** "5 Nov" from an ISO time, in the reader's own time zone; '' when unreadable. */
export function dayMonthShort(iso: string | null | undefined): string {
  const date = new Date(String(iso || ''))
  if (!iso || !Number.isFinite(date.getTime())) return ''
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`
}
