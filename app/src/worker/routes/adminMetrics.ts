import { jsonResponse } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import { supabaseGet, type SupabaseEnv } from '../lib/supabase'

export type AdminMetricsEnv = SupabaseEnv

type VerifySiteAdmin = (env: AdminMetricsEnv, request: Request) => Promise<boolean>

type AnalyticsAdminRow = {
  event_type: string
  path: string
  duration_ms: number | null
  user_id: string | null
  session_id: string
  payload: Record<string, unknown> | null
  created_at: string
}

type AccountMetrics = {
  userId: string
  email: string
  sessions: Map<string, number>
  pageviews: number
  books: Set<string>
  chatInteractions: number
  feedInteractions: number
  audioBookInteractions: number
  castInteractions: number
  checkoutStarts: number
  firstSeen: string
  lastSeen: string
}

function analyticsEventName(row: { event_type: string; payload: Record<string, unknown> | null }): string {
  return row.event_type === 'event' ? String(row.payload?.type || '') : row.event_type
}

function analyticsBookId(path: string): string | null {
  const match = path.match(/^\/read\/([^/]+)(?:\/|$)/)
  if (!match || match[1] === 'undefined') return null
  return match[1]
}

function isExcludedMetricsEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  return normalized === 'ahvelplund@fastmail.com' || /^tinct\d+@fastmail\.com$/.test(normalized)
}

function formatSupabaseIn(values: string[]): string {
  return values.join(',')
}

export async function handleAdminMetricsUsers(
  request: Request,
  env: AdminMetricsEnv,
  verifySiteAdmin: VerifySiteAdmin,
): Promise<Response> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: 'Not configured' }, 500, request)
  }
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (!await verifySiteAdmin(env, request)) {
    return jsonResponse({ error: 'Forbidden' }, 403, request)
  }

  const url = new URL(request.url)
  const requestedDays = Number(url.searchParams.get('days') || '14')
  const days = [1, 7, 14, 30].includes(requestedDays) ? requestedDays : 14
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const analyticsRes = await supabaseGet(env, `analytics_events?select=event_type,path,duration_ms,user_id,session_id,payload,created_at&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=10000`)
  if (!analyticsRes.ok) {
    return jsonResponse({ error: 'Analytics query failed' }, 500, request)
  }

  const rows = await analyticsRes.json() as AnalyticsAdminRow[]
  const userIds = [...new Set(rows.map(row => row.user_id).filter((id): id is string => !!id && isValidUUID(id)))]

  const emailByUserId = new Map<string, string>()
  for (let i = 0; i < userIds.length; i += 100) {
    const chunk = userIds.slice(i, i + 100)
    if (chunk.length === 0) continue
    const profilesRes = await supabaseGet(env, `profiles?id=in.(${formatSupabaseIn(chunk)})&select=id,email`)
    if (!profilesRes.ok) continue
    const profiles = await profilesRes.json() as { id: string; email: string | null }[]
    for (const profile of profiles) {
      emailByUserId.set(profile.id, (profile.email || '').toLowerCase())
    }
  }

  const excludedUserIds = new Set(
    [...emailByUserId.entries()]
      .filter(([, email]) => isExcludedMetricsEmail(email))
      .map(([id]) => id),
  )
  const excludedSessions = new Set(
    rows
      .filter(row => row.user_id && excludedUserIds.has(row.user_id))
      .map(row => row.session_id),
  )
  const includedRows = rows.filter(row => {
    if (row.user_id && excludedUserIds.has(row.user_id)) return false
    if (excludedSessions.has(row.session_id)) return false
    return true
  })

  const accounts = new Map<string, AccountMetrics>()
  for (const row of includedRows) {
    if (!row.user_id) continue
    const email = emailByUserId.get(row.user_id) || '(unknown email)'
    const current = accounts.get(row.user_id) || {
      userId: row.user_id,
      email,
      sessions: new Map<string, number>(),
      pageviews: 0,
      books: new Set<string>(),
      chatInteractions: 0,
      feedInteractions: 0,
      audioBookInteractions: 0,
      castInteractions: 0,
      checkoutStarts: 0,
      firstSeen: row.created_at,
      lastSeen: row.created_at,
    }

    if (row.created_at < current.firstSeen) current.firstSeen = row.created_at
    if (row.created_at > current.lastSeen) current.lastSeen = row.created_at
    if (row.event_type === 'pageview') {
      current.pageviews += 1
      const bookId = analyticsBookId(row.path)
      if (bookId) current.books.add(bookId)
    }
    if (row.event_type === 'page_duration') {
      current.sessions.set(row.session_id, (current.sessions.get(row.session_id) || 0) + (row.duration_ms || 0))
      const bookId = analyticsBookId(row.path)
      if (bookId) current.books.add(bookId)
    }
    const payloadBookId = typeof row.payload?.book_id === 'string' ? row.payload.book_id : null
    if (payloadBookId) current.books.add(payloadBookId)

    const name = analyticsEventName(row)
    if (name === 'chat_message_sent' || name === 'chapter_reflection_started') current.chatInteractions += 1
    if (name === 'feed_opened') current.feedInteractions += 1
    if (name === 'audio_started') current.audioBookInteractions += 1
    if (name === 'cast_opened') current.castInteractions += 1
    if (name === 'checkout_started') current.checkoutStarts += 1

    accounts.set(row.user_id, current)
  }

  const users = [...accounts.values()]
    .map(account => {
      const sessionDurations = [...account.sessions.values()]
      const totalReadingMs = sessionDurations.reduce((sum, ms) => sum + ms, 0)
      return {
        userId: account.userId,
        email: account.email,
        sessions: sessionDurations.length,
        sessions2Min: sessionDurations.filter(ms => ms >= 2 * 60 * 1000).length,
        sessions10Min: sessionDurations.filter(ms => ms >= 10 * 60 * 1000).length,
        readingMinutes: Math.round((totalReadingMs / 60000) * 10) / 10,
        longestSessionMinutes: Math.round((Math.max(0, ...sessionDurations) / 60000) * 10) / 10,
        pageviews: account.pageviews,
        books: account.books.size,
        chatInteractions: account.chatInteractions,
        feedInteractions: account.feedInteractions,
        audioBookInteractions: account.audioBookInteractions,
        castInteractions: account.castInteractions,
        checkoutStarts: account.checkoutStarts,
        firstSeen: account.firstSeen,
        lastSeen: account.lastSeen,
      }
    })
    .sort((a, b) => b.readingMinutes - a.readingMinutes || b.sessions - a.sessions)

  return jsonResponse({
    days,
    generatedAt: new Date().toISOString(),
    excludedAccounts: excludedUserIds.size,
    excludedSessions: excludedSessions.size,
    users,
  }, 200, request)
}
