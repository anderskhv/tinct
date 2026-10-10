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
import { fetchFind, fetchOwnProfile, fetchRank, loadReading } from './cardsApi'
import { followBackCount } from './cardsRules'
import { rankOf } from './cardsFormat'
import { CARD_PARAM, isCardName, type CardName } from './cardRoutes'
import { CardStack } from './cardStack'
import { cardSpec, type CardsData, type CardsEnv, type CardsSession } from './cardViews'
import { readCardsCache, writeCardsCache } from './cardsCache'
import { CARDS_COPY } from './cardsCopy'
import { currentBookHint } from '../social/socialClient'

export type { CardName } from './cardRoutes'

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

type StoredAuthSession = { access_token?: unknown; expires_at?: unknown; user?: { id?: unknown; email?: unknown; user_metadata?: Record<string, unknown> } | null }

function toCardsSession(session: StoredAuthSession | null | undefined): CardsSession | null {
  if (!session || typeof session.access_token !== 'string' || !session.access_token) return null
  const meta = (session.user?.user_metadata ?? {}) as Record<string, unknown>
  const named = typeof meta.full_name === 'string' ? meta.full_name : typeof meta.name === 'string' ? meta.name : null
  return { token: session.access_token, userId: typeof session.user?.id === 'string' ? session.user.id : null, email: typeof session.user?.email === 'string' ? session.user.email : null, accountName: named }
}

/** Supabase's own answer. It can wait a long time (or for ever) behind a token refresh stuck in its lock, e.g. on iPhone Safari after the page was suspended. */
async function readSession(): Promise<CardsSession | null> {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getSession()
    return toCardsSession(data.session as StoredAuthSession | null)
  } catch {
    return null
  }
}

/**
 * The session Supabase keeps in this browser, read directly (no lock, no
 * network), so a tap on the picture opens the cards at once. `fresh` is false
 * once the access token has expired: the cards then paint from the device cache
 * and load only with the token Supabase hands back.
 */
function storedSession(): { session: CardsSession; fresh: boolean } | null {
  if (!supabase || isNativeCapacitor()) return null
  try {
    const key = (supabase.auth as unknown as { storageKey?: unknown }).storageKey
    if (typeof key !== 'string') return null
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredAuthSession & { currentSession?: StoredAuthSession }
    const stored = parsed.currentSession ?? parsed
    const session = toCardsSession(stored)
    if (!session) return null
    const expiresAt = typeof stored.expires_at === 'number' ? stored.expires_at * 1000 : 0
    return { session, fresh: expiresAt > Date.now() + 30_000 }
  } catch {
    return null
  }
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
    const { profile, reading, rank, plan, billing } = env.data
    writeCardsCache(userId, { profile, reading, rank, plan, billing: billing === true })
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
    void fetchRank(token).then(rank => { if (rank) set({ rank: rankOf(rank.rank, rank.total) }) })
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

// ===== ?card= on load =====

/** The card named in the page's URL (from an old link), removed from the URL without a reload. */
export function consumeCardParam(): CardName | null {
  try {
    const url = new URL(location.href)
    const name = url.searchParams.get(CARD_PARAM)
    if (!name) return null
    url.searchParams.delete(CARD_PARAM)
    history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`)
    return isCardName(name) ? name : null
  } catch {
    return null
  }
}
