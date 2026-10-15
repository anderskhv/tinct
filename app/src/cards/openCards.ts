/**
 * Opening the account cards over the page the reader is on: the reader
 * (/reader, src/lab) and the library (/library). No page load to open or
 * close; the page behind never unloads.
 *
 * Old account URLs (/you, /your-reading, /friends, /sign-in?mode=account)
 * redirect to the page with `?card=<name>`; the page opens that card on
 * load and drops the parameter (cardRoutes.ts).
 */
import { supabase } from '../services/supabase'
import { clearSignedInCookie } from '../utils/authCookie'
import { authRedirectTo } from '../utils/nativeAuth'
import { isNativeCapacitor } from '../utils/nativePlatform'
import { LAB_AUTH_CALLBACK_PATH } from '../lab/labSignInProviders'
import { safeLabReturnTo } from '../lab/labSignInReturn'
import { wipeLabDeviceUserData } from '../lab/labSignOut'
import { fetchAiAllowance } from '../lab/labAiAllowance'
import { fetchSubscriptionInfo, premiumOfferIntervals } from '../lab/labPremiumOffer'
import { socialFriendsOn } from '../social/friendsClient'
import { fetchBoard, fetchFind, fetchOwnProfile, loadReading } from './cardsApi'
import { followBackCount } from './cardsRules'
import { rankOf } from './cardsFormat'
import type { CardName } from './cardRoutes'
import { CardStack } from './cardStack'
import { cardSpec, type CardsData, type CardsEnv, type CardsSession } from './cardViews'
import { readCardsCache, writeCardsCache } from './cardsCache'
import { CARDS_COPY } from './cardsCopy'
import { sessionStorageKey, storedSession, toCardsSession, type StoredAuthSession } from './cardsBoot'
import { currentBookHint } from '../social/socialClient'

export type { CardName } from './cardRoutes'
export { consumeCardParam, storedSession } from './cardsBoot'

export interface OpenCardsOptions {
  /** The card to show; You is always underneath, so back leads to it. */
  start?: CardName
  dark: boolean
  /** Desktop panel top: 76 over the reader (default), 68 over the library. */
  deskTop?: number
  onClose?: () => void
  /** Tests: a session instead of Supabase's. */
  session?: CardsSession
  /** Tests: the Leaderboard / Find readers switch instead of the page marker. */
  social?: boolean
}

let current: { stack: CardStack; env: CardsEnv } | null = null
/** The last data read in this page, so a second open paints at once (then refreshes). */
let cached: { userId: string | null; data: CardsData } | null = null

export function accountCardsOpen(): boolean {
  return Boolean(current && !current.stack.isClosed)
}

export function closeAccountCards(): void {
  current?.stack.closeAll()
}

/** How long Supabase's own answer is waited for before the open gives up (its lock can hold for ever on iPhone Safari). */
export const LIVE_SESSION_WAIT_MS = 4000

/** Supabase's own answer, or null once LIVE_SESSION_WAIT_MS has passed: it can wait a long time (or for ever) behind a token refresh stuck in its lock, e.g. on iPhone Safari after the page was suspended. */
async function readSession(): Promise<CardsSession | null> {
  if (!supabase) return null
  try {
    const answer = supabase.auth.getSession().then(({ data }) => toCardsSession(data.session as StoredAuthSession | null))
    const late = new Promise<null>(resolve => setTimeout(() => resolve(null), LIVE_SESSION_WAIT_MS))
    return await Promise.race([answer, late])
  } catch {
    return null
  }
}

/** What the open path can see of the session in this browser, as booleans only (for the funnel; never the token). */
export function sessionStorageState(): { key: boolean; raw: boolean; parsed: boolean; fresh: boolean; native: boolean } {
  const native = isNativeCapacitor()
  const key = sessionStorageKey()
  let raw: string | null = null
  try { raw = key ? localStorage.getItem(key) : null } catch { raw = null }
  const stored = storedSession()
  return { key: Boolean(key), raw: Boolean(raw), parsed: stored !== null, fresh: Boolean(stored?.fresh), native }
}

function emptyData(): CardsData {
  return { profile: null, reading: null, allowance: null, plan: null, intervals: [], rank: null, find: null, findBadge: 0, billing: false }
}

/**
 * What the cards paint first: this page's last data, else this device's last
 * profile and figures for this account (cardsCache.ts). Whatever is not known
 * yet is marked loading, so the You card shows a quiet skeleton, never a
 * placeholder name.
 */
function firstData(session: CardsSession): CardsData {
  if (cached && cached.userId === session.userId) return { ...cached.data, loading: { profile: !cached.data.profile, reading: !cached.data.reading } }
  const stored = readCardsCache(session.userId)
  const data = emptyData()
  if (stored) Object.assign(data, stored)
  data.loading = { profile: !data.profile, reading: !data.reading }
  return data
}

/** Read everything the cards show, in parallel; each part fills in as it arrives. */
function load(env: CardsEnv, social: boolean): void {
  const { token, userId } = env.session
  const set = (patch: Partial<CardsData>) => {
    Object.assign(env.data, patch)
    if (cached?.userId === userId) cached.data = env.data
    const { profile, reading, rank, plan, billing, allowance } = env.data
    writeCardsCache(userId, { profile, reading, rank, plan, billing: billing === true, allowance: allowance ?? null })
    env.changed()
  }
  const settled = (part: 'profile' | 'reading') => ({ ...env.data.loading, [part]: false })
  // Profile, reading time and rank are asked for at once; each paints as it arrives.
  void fetchOwnProfile(token, currentBookHint()).then(result => {
    // Profiles off or unavailable: the card shows what needs no profile (the last one stays painted if it was).
    set(result.ok ? { profile: result.profile, loading: settled('profile') } : { loading: settled('profile') })
  })
  void loadReading(token, userId).then(reading => set(reading ? { reading, loading: settled('reading') } : { loading: settled('reading') }))
  if (social) {
    // The Friends board now: the You row's rank comes from it (one request, not
    // /api/social/rank as well, which computes the same board again: 1-2 s each,
    // 10 Oct 2026), and Leaderboard opens without a wait. Kept in memory only.
    void fetchBoard(token, 'friends').then(board => {
      if (!board) return
      env.data.board = board
      const me = board.entries.find(entry => entry.me) ?? board.me
      set({ rank: rankOf(me?.rank, board.total) })
    })
    loadFind(env, set)
  }
  void fetchAiAllowance(token).then(allowance => set({ allowance }))
  void fetchSubscriptionInfo(token).then(info => {
    if (!info) return
    const status = info.subscription_status ?? null
    const paying = status === 'active' || status === 'trialing' || status === 'past_due'
      || (status === 'canceled' && Boolean(info.subscription_period_end) && new Date(info.subscription_period_end!).getTime() > Date.now())
    // Stripe's portal only for an account with a Stripe subscription to manage
    // (not Premium by grant, whose portal would be empty).
    set({ plan: paying ? 'premium' : 'free', intervals: premiumOfferIntervals(info), billing: Boolean(info.stripe) })
  })
}

function loadFind(env: CardsEnv, set: (patch: Partial<CardsData>) => void): void {
  void fetchFind(env.session.token).then(find => { if (find) set({ find, findBadge: followBackCount(find.followingYou) }) })
}

function returnTo(): string {
  try { return safeLabReturnTo(location.pathname + location.search + location.hash) } catch { return '/library' }
}

/**
 * Open the cards. Resolves false (and opens nothing) for a signed-out reader;
 * the caller sends them to sign in.
 */
export async function openAccountCards(options: OpenCardsOptions): Promise<boolean> {
  // Signed in on this device: open now from the stored session; Supabase's own
  // answer follows and replaces the token (or closes the cards if signed out).
  const stored = options.session ? null : storedSession()
  const live = options.session || stored?.fresh ? null : readSession()
  const session = options.session ?? stored?.session ?? await live
  if (!session) return false
  // A stack already open is replaced quietly: its own onClose is not told.
  if (current) { const previous = current; current = null; previous.stack.closeAll() }
  const social = options.social ?? socialFriendsOn()
  const data = firstData(session)
  cached = { userId: session.userId, data }
  let stack: CardStack | null = null
  const env: CardsEnv = {
    session,
    data,
    social,
    changed: () => stack?.refreshLive(),
    reloadFind: () => loadFind(env, patch => { Object.assign(env.data, patch); env.changed() }),
    navigate: url => { location.assign(url) },
    signOut: async (landing = '/library') => {
      try { await supabase?.auth.signOut() } catch { /* signed out locally below */ }
      clearSignedInCookie()
      // The next person on this device must not inherit this reader's data.
      wipeLabDeviceUserData()
      cached = null
      location.assign(landing)
    },
    // The sign-in page's reset flow (labSignIn.ts 'forgot'): the same email, the same return link.
    resetPassword: async () => {
      if (!supabase || !session.email) return CARDS_COPY.actionFailed
      try {
        const back = returnTo()
        const { error } = await supabase.auth.resetPasswordForEmail(session.email, {
          redirectTo: await authRedirectTo(supabase, back, 'reset', `${location.origin}${LAB_AUTH_CALLBACK_PATH}?mode=reset&returnTo=${encodeURIComponent(back)}`),
        })
        // Supabase's own words for its refusals (e.g. asking again too soon); anything else is ours.
        if (error) return typeof (error as { status?: unknown }).status === 'number' && error.message ? error.message : CARDS_COPY.actionFailed
        return CARDS_COPY.resetSent
      } catch {
        return CARDS_COPY.actionFailed
      }
    },
  }
  stack = new CardStack({
    dark: options.dark,
    deskTop: options.deskTop,
    onClosed: () => {
      if (current?.stack !== stack) return
      current = null
      options.onClose?.()
    },
  })
  current = { stack, env }
  stack.push(cardSpec('you', env))
  const start = options.start && options.start !== 'you' ? options.start : null
  if (start) stack.push(cardSpec(start, env))
  if (stored && !stored.fresh && live) {
    // An expired token: paint the cached data, load once Supabase has refreshed it.
    void live.then(fresh => {
      if (current?.env !== env) return
      if (!fresh || fresh.userId !== session.userId) { stack?.closeAll(); if (!fresh) location.assign(`/sign-in?returnTo=${encodeURIComponent(returnTo())}`); return }
      env.session.token = fresh.token
      load(env, social)
    })
  } else {
    load(env, social)
  }
  return true
}

