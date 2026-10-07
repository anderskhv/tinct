import { factsLine, hoursMinutes } from '../readingTime/model'
import type { SheetReadingTime } from './useLabReadingTime'

const WEEKDAY = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

/** Your reading's public URL, returning to the reader page the sheet was opened from. */
export function yourReadingUrl(returnTo?: string): string {
  const back = returnTo && returnTo.startsWith('/reader') ? returnTo : '/reader'
  return `/your-reading?return=${encodeURIComponent(back)}`
}

function weekdayOf(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  return WEEKDAY[(new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7]
}

/** "6h 10m" in large type: figures large, units small. */
function Hours({ seconds }: { seconds: number }) {
  const { hours, minutes } = hoursMinutes(seconds)
  return (
    <span className="lab-v2-time-figure" data-testid="lab-v2-time-figure">
      {hours > 0 && <>{hours}<small>h</small> </>}{minutes}<small>m</small>
    </span>
  )
}

/**
 * The account sheet's reading time (social ship 1): the last 7 days in large
 * type with a 7-day bar, a facts line and the Your reading row; signed out,
 * the hours on this device and the invitation to keep them.
 */
export function LabReadingTimeBlock({ state, yourReadingHref }: { state: SheetReadingTime; yourReadingHref: string }) {
  if (state.mode === 'device') {
    return (
      <div className="lab-v2-time" data-testid="lab-v2-reading-time" data-mode="device">
        <p className="lab-v2-time-label">On this device</p>
        <div className="lab-v2-time-row"><Hours seconds={state.seconds} /></div>
        <p className="lab-v2-time-facts" data-testid="lab-v2-reading-time-invite">Create a free account to keep your reading time and join the leaderboard.</p>
      </div>
    )
  }
  if (state.mode !== 'ledger' && state.mode !== 'loading') return null
  const stats = state.mode === 'ledger' ? state.stats : null
  const days = stats?.last7 ?? []
  const most = Math.max(1, ...days.map(day => day.seconds))
  const facts = stats ? factsLine(stats) : ''
  return (
    <div className="lab-v2-time" data-testid="lab-v2-reading-time" data-mode={state.mode}>
      <p className="lab-v2-time-label">Last 7 days</p>
      <div className="lab-v2-time-row">
        {stats ? <Hours seconds={stats.last7Seconds} /> : <span className="lab-v2-time-figure" aria-hidden="true">–</span>}
        <div className="lab-v2-time-bars" role="img" aria-label={stats ? `Reading time on each of the last 7 days` : undefined} aria-hidden={stats ? undefined : true}>
          {(stats ? days : Array.from({ length: 7 }, () => ({ day: '', seconds: 0 }))).map((day, index) => (
            <span key={day.day || index} className={`lab-v2-time-bar${index === 6 ? ' is-today' : ''}`}>
              <span className="lab-v2-time-bar-track"><span className="lab-v2-time-bar-fill" style={{ height: `${day.seconds > 0 ? Math.max(8, Math.round(day.seconds / most * 100)) : 4}%` }} /></span>
              <span className="lab-v2-time-bar-day">{day.day ? weekdayOf(day.day) : ''}</span>
            </span>
          ))}
        </div>
      </div>
      {facts && <p className="lab-v2-time-facts" data-testid="lab-v2-reading-time-facts">{facts}</p>}
      <div className="lab-v2-rows">
        <a className="lab-v2-row is-link" data-testid="lab-v2-your-reading" href={yourReadingHref}>
          <span className="lab-v2-row-label">Your reading</span>
          <span className="lab-v2-value"><span className="lab-v2-value-chevron" aria-hidden="true">›</span></span>
        </a>
      </div>
    </div>
  )
}
