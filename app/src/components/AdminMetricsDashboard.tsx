import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import { apiUrl } from '../utils/apiUrl'

interface AdminMetricsDashboardProps {
  session: Session | null
  onSignIn: () => void
}

interface AnalyticsRow {
  event_type: string
  path: string
  referrer: string | null
  duration_ms: number | null
  user_id: string | null
  session_id: string
  payload: Record<string, any> | null
  created_at: string
}

interface AccountMetricsRow {
  userId: string
  email: string
  sessions: number
  sessions2Min: number
  sessions10Min: number
  readingMinutes: number
  longestSessionMinutes: number
  pageviews: number
  books: number
  chatInteractions: number
  feedInteractions: number
  audioBookInteractions: number
  castInteractions: number
  checkoutStarts: number
  firstSeen: string
  lastSeen: string
}

interface AccountMetricsResponse {
  days: number
  generatedAt: string
  excludedAccounts: number
  excludedSessions: number
  users: AccountMetricsRow[]
}

type WindowDays = 1 | 7 | 14 | 30

const TARGETS = {
  visitors: 100,
  bookOpeners: 40,
  tenMinuteReaders: 20,
  accounts: 10,
  aiOrAudioUsers: 5,
}

function eventName(row: AnalyticsRow): string {
  return row.event_type === 'event' ? String(row.payload?.type || '') : row.event_type
}

function unique(values: Array<string | null | undefined>): number {
  return new Set(values.filter(Boolean) as string[]).size
}

function pct(value: number, total: number): string {
  if (total <= 0) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

function sourceLabel(row: AnalyticsRow): string {
  const attribution = row.payload?.attribution || {}
  const touch = attribution.last_touch || attribution.first_touch || {}
  const source = touch.utm_source
  const medium = touch.utm_medium
  const campaign = touch.utm_campaign
  if (source) return [source, medium, campaign].filter(Boolean).join(' / ')

  const referrer = row.referrer || touch.landing_referrer
  if (!referrer) return '(direct)'
  try {
    return new URL(referrer).hostname.replace(/^www\./, '')
  } catch {
    return '(direct)'
  }
}

function bookIdFromPath(path: string): string | null {
  const match = path.match(/^\/read\/([^/]+)(?:\/|$)/)
  if (!match) return null
  if (match[1] === 'undefined') return null
  return match[1]
}

function barWidth(value: number, target: number): string {
  if (target <= 0) return '0%'
  return `${Math.min(100, Math.round((value / target) * 100))}%`
}

function metricCard(label: string, value: number | string, target?: number, sub?: string) {
  const numeric = typeof value === 'number' ? value : null
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricLabel}>{label}</div>
      <div style={styles.metricValue}>{value}</div>
      {target && numeric !== null && (
        <>
          <div style={styles.progressTrack}><div style={{ ...styles.progressFill, width: barWidth(numeric, target) }} /></div>
          <div style={styles.metricSub}>{numeric} / {target}</div>
        </>
      )}
      {sub && <div style={styles.metricSub}>{sub}</div>}
    </div>
  )
}

export function AdminMetricsDashboard({ session, onSignIn }: AdminMetricsDashboardProps) {
  const [days, setDays] = useState<WindowDays>(14)
  const [rows, setRows] = useState<AnalyticsRow[]>([])
  const [accountMetrics, setAccountMetrics] = useState<AccountMetricsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [accountsLoading, setAccountsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accountsError, setAccountsError] = useState<string | null>(null)

  useEffect(() => {
    if (!session || !supabase) return
    let cancelled = false
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    setLoading(true)
    setError(null)

    supabase
      .from('analytics_events')
      .select('event_type,path,referrer,duration_ms,user_id,session_id,payload,created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(10000)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setError(error.message)
          setRows([])
        } else {
          setRows((data || []) as AnalyticsRow[])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [days, session])

  useEffect(() => {
    if (!session?.access_token) return
    let cancelled = false
    setAccountsLoading(true)
    setAccountsError(null)

    fetch(apiUrl(`/api/admin/metrics-users?days=${days}`), {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async res => {
        const body = await res.json().catch(() => null)
        if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`)
        return body as AccountMetricsResponse
      })
      .then(data => {
        if (!cancelled) setAccountMetrics(data)
      })
      .catch(err => {
        if (!cancelled) {
          setAccountsError(err instanceof Error ? err.message : 'Could not load account metrics')
          setAccountMetrics(null)
        }
      })
      .finally(() => {
        if (!cancelled) setAccountsLoading(false)
      })

    return () => { cancelled = true }
  }, [days, session?.access_token])

  const metrics = useMemo(() => {
    const pageviews = rows.filter(r => r.event_type === 'pageview')
    const durations = rows.filter(r => r.event_type === 'page_duration')
    const events = rows.filter(r => r.event_type === 'event')
    const bookPageviews = pageviews.filter(r => /^\/read\/[^/]+\/\d+$/.test(r.path))
    const bookOpenSessions = new Set(bookPageviews.map(r => r.session_id))

    const durationBySession = new Map<string, number>()
    for (const row of durations) {
      durationBySession.set(row.session_id, (durationBySession.get(row.session_id) || 0) + (row.duration_ms || 0))
    }
    const tenMinuteReaders = [...durationBySession.entries()].filter(([, ms]) => ms >= 10 * 60 * 1000).map(([sessionId]) => sessionId)

    const signupEvents = events.filter(r => eventName(r) === 'signup_completed')
    const chatEvents = events.filter(r => eventName(r) === 'chat_message_sent' || eventName(r) === 'chapter_reflection_started')
    const audioEvents = events.filter(r => eventName(r) === 'audio_started')
    const checkoutEvents = events.filter(r => eventName(r) === 'checkout_started')
    const aiOrAudioSessions = new Set([...chatEvents, ...audioEvents].map(r => r.session_id))

    const sourceCounts = new Map<string, { sessions: Set<string>; accounts: number; checkoutStarts: number }>()
    for (const row of [...pageviews, ...signupEvents, ...checkoutEvents]) {
      const label = sourceLabel(row)
      const current = sourceCounts.get(label) || { sessions: new Set<string>(), accounts: 0, checkoutStarts: 0 }
      if (row.event_type === 'pageview') current.sessions.add(row.session_id)
      if (eventName(row) === 'signup_completed') current.accounts += 1
      if (eventName(row) === 'checkout_started') current.checkoutStarts += 1
      sourceCounts.set(label, current)
    }

    const bookCounts = new Map<string, Set<string>>()
    for (const row of bookPageviews) {
      const bookId = bookIdFromPath(row.path)
      if (!bookId) continue
      const set = bookCounts.get(bookId) || new Set<string>()
      set.add(row.session_id)
      bookCounts.set(bookId, set)
    }

    return {
      visitors: unique(pageviews.map(r => r.session_id)),
      pageviews: pageviews.length,
      bookOpeners: bookOpenSessions.size,
      tenMinuteReaders: tenMinuteReaders.length,
      accounts: signupEvents.length,
      aiUsers: unique(chatEvents.map(r => r.session_id)),
      audioUsers: unique(audioEvents.map(r => r.session_id)),
      aiOrAudioUsers: aiOrAudioSessions.size,
      checkoutStarts: checkoutEvents.length,
      signedInUsers: unique(rows.map(r => r.user_id)),
      topSources: [...sourceCounts.entries()]
        .map(([source, data]) => ({ source, sessions: data.sessions.size, accounts: data.accounts, checkoutStarts: data.checkoutStarts }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 8),
      topBooks: [...bookCounts.entries()]
        .map(([bookId, sessions]) => ({ bookId, sessions: sessions.size }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 8),
    }
  }, [rows])

  if (!session) {
    return (
      <main className="admin-metrics" style={styles.shell}>
        <section style={styles.panel}>
          <h1 style={styles.title}>Beta Metrics</h1>
          <p style={styles.muted}>Sign in with an admin account to view analytics.</p>
          <button style={styles.button} onClick={onSignIn}>Sign in</button>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-metrics" style={styles.shell}>
      <style>{`
        .admin-metrics table th {
          padding: 9px 10px;
          border-bottom: 1px solid rgba(11, 11, 11, 0.18);
          color: var(--dim, #6a6555);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-align: left;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .admin-metrics table td {
          padding: 10px;
          border-bottom: 1px solid rgba(11, 11, 11, 0.09);
          vertical-align: top;
          white-space: nowrap;
        }
        .admin-metrics table tbody tr:hover {
          background: rgba(255, 255, 255, 0.28);
        }
      `}</style>
      <section style={styles.header}>
        <div>
          <h1 style={styles.title}>Beta Metrics</h1>
          <p style={styles.muted}>The 100-user learning dashboard. Source data: Supabase analytics events.</p>
        </div>
        <div style={styles.segmented}>
          {[1, 7, 14, 30].map(day => (
            <button
              key={day}
              style={day === days ? styles.segmentActive : styles.segment}
              onClick={() => setDays(day as WindowDays)}
            >
              {day}d
            </button>
          ))}
        </div>
      </section>

      {error && (
        <section style={styles.error}>
          {error.includes('permission') || error.includes('policy')
            ? 'Analytics access denied. Add your user id to public.site_admins.'
            : error}
        </section>
      )}

      <section style={styles.grid}>
        {metricCard('Visitors', metrics.visitors, TARGETS.visitors, `${metrics.pageviews} pageviews`)}
        {metricCard('Book openers', metrics.bookOpeners, TARGETS.bookOpeners, pct(metrics.bookOpeners, metrics.visitors))}
        {metricCard('10+ min readers', metrics.tenMinuteReaders, TARGETS.tenMinuteReaders, pct(metrics.tenMinuteReaders, metrics.visitors))}
        {metricCard('Accounts', metrics.accounts, TARGETS.accounts, pct(metrics.accounts, metrics.visitors))}
        {metricCard('AI/audio users', metrics.aiOrAudioUsers, TARGETS.aiOrAudioUsers, `${metrics.aiUsers} AI · ${metrics.audioUsers} audio`)}
        {metricCard('Checkout starts', metrics.checkoutStarts, undefined, `${pct(metrics.checkoutStarts, metrics.visitors)} of visitors`)}
      </section>

      <section style={styles.twoCol}>
        <div style={styles.panel}>
          <h2 style={styles.heading}>Sources</h2>
          <table style={styles.table}>
            <thead><tr><th>Source</th><th>Visitors</th><th>Accounts</th><th>Checkout</th></tr></thead>
            <tbody>
              {metrics.topSources.map(row => (
                <tr key={row.source}>
                  <td>{row.source}</td>
                  <td>{row.sessions}</td>
                  <td>{row.accounts}</td>
                  <td>{row.checkoutStarts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.panel}>
          <h2 style={styles.heading}>Books Opened</h2>
          <table style={styles.table}>
            <thead><tr><th>Book</th><th>Visitors</th></tr></thead>
            <tbody>
              {metrics.topBooks.map(row => (
                <tr key={row.bookId}>
                  <td>{row.bookId}</td>
                  <td>{row.sessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.heading}>Accounts</h2>
            <p style={styles.muted}>
              Signed-in usage, excluding Anders and tinct test accounts.
              {accountsLoading ? ' Loading accounts...' : accountMetrics ? ` ${accountMetrics.users.length} account${accountMetrics.users.length === 1 ? '' : 's'} in this window.` : ''}
            </p>
          </div>
          {accountMetrics && (
            <div style={styles.metricSub}>
              Excluded {accountMetrics.excludedAccounts} account{accountMetrics.excludedAccounts === 1 ? '' : 's'} / {accountMetrics.excludedSessions} session{accountMetrics.excludedSessions === 1 ? '' : 's'}
            </div>
          )}
        </div>
        {accountsError && <div style={styles.inlineError}>{accountsError}</div>}
        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Sessions</th>
                <th>2+ min</th>
                <th>10+ min</th>
                <th>Reading</th>
                <th>Longest</th>
                <th>Books</th>
                <th>Chat</th>
                <th>Feed</th>
                <th>Audio</th>
                <th>Cast</th>
                <th>Checkout</th>
                <th>Last seen</th>
              </tr>
            </thead>
            <tbody>
              {(accountMetrics?.users || []).map(row => (
                <tr key={row.userId}>
                  <td style={styles.emailCell}>{row.email}</td>
                  <td>{row.sessions}</td>
                  <td>{row.sessions2Min}</td>
                  <td>{row.sessions10Min}</td>
                  <td>{row.readingMinutes}m</td>
                  <td>{row.longestSessionMinutes}m</td>
                  <td>{row.books}</td>
                  <td>{row.chatInteractions}</td>
                  <td>{row.feedInteractions}</td>
                  <td>{row.audioBookInteractions}</td>
                  <td>{row.castInteractions}</td>
                  <td>{row.checkoutStarts}</td>
                  <td>{new Date(row.lastSeen).toLocaleDateString()}</td>
                </tr>
              ))}
              {!accountsLoading && accountMetrics?.users.length === 0 && (
                <tr><td colSpan={13} style={styles.emptyCell}>No signed-in account usage in this window.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={styles.panel}>
        <h2 style={styles.heading}>Launch Gate</h2>
        <p style={styles.muted}>
          Full launch is green when the first five cards hit their targets and severe mobile/audio/reading bugs are quiet.
          {loading ? ' Loading latest events...' : ` Loaded ${rows.length} events from the last ${days} day${days === 1 ? '' : 's'}.`}
        </p>
      </section>
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  shell: {
    minHeight: '100vh',
    background: 'var(--paper, #ece7db)',
    color: 'var(--ink, #0b0b0b)',
    padding: '28px',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 34,
    lineHeight: 1,
    margin: '0 0 8px',
  },
  muted: { color: 'var(--dim, #6a6555)', margin: 0, lineHeight: 1.45 },
  segmented: { display: 'flex', border: '1px solid rgba(11,11,11,0.2)', borderRadius: 6, overflow: 'hidden' },
  segment: { border: 0, background: 'transparent', padding: '9px 12px', cursor: 'pointer', color: 'inherit' },
  segmentActive: { border: 0, background: 'var(--ink, #0b0b0b)', color: 'var(--paper, #ece7db)', padding: '9px 12px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 },
  metricCard: { border: '1px solid rgba(11,11,11,0.16)', borderRadius: 6, padding: 16, background: 'rgba(255,255,255,0.28)' },
  metricLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--dim, #6a6555)' },
  metricValue: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 34, lineHeight: 1.1, margin: '8px 0' },
  metricSub: { fontSize: 12, color: 'var(--dim, #6a6555)', marginTop: 7 },
  progressTrack: { height: 6, background: 'rgba(11,11,11,0.12)', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'var(--accent, #1f4a5c)' },
  twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 12 },
  panel: { border: '1px solid rgba(11,11,11,0.16)', borderRadius: 6, padding: 18, background: 'rgba(255,255,255,0.22)' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 12 },
  heading: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 21, margin: '0 0 12px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  tableScroll: { overflowX: 'auto', width: '100%' },
  emailCell: { minWidth: 210, fontWeight: 600 },
  emptyCell: { padding: '14px 0', color: 'var(--dim, #6a6555)' },
  inlineError: { color: '#9b2c2c', margin: '10px 0', fontSize: 13 },
  button: { border: '1px solid var(--ink, #0b0b0b)', borderRadius: 4, background: 'var(--ink, #0b0b0b)', color: 'var(--paper, #ece7db)', padding: '10px 14px', marginTop: 16, cursor: 'pointer' },
  error: { border: '1px solid #9b2c2c', color: '#9b2c2c', borderRadius: 6, padding: 12, marginBottom: 12 },
}
