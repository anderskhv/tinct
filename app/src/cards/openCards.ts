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
/** The last data read, so a second open paints at once (then refreshes). */
let cached: { token: string; data: CardsData } | null = null

export function accountCardsOpen(): boolean {
  return Boolean(current && !current.stack.isClosed)
}

export function closeAccountCards(): void {
  current?.stack.closeAll()
}

async function readSession(): Promise<CardsSession | null> {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getSession()
    const session = data.session
    if (!session?.access_token) return null
    const meta = (session.user?.user_metadata ?? {}) as Record<string, unknown>
    const named = typeof meta.full_name === 'string' ? meta.full_name : typeof meta.name === 'string' ? meta.name : null
    return { token: session.access_token, userId: session.user?.id ?? null, email: session.user?.email ?? null, accountName: named }
  } catch {
    return null
  }
}

function emptyData(): CardsData {
  return { profile: null, reading: null, allowance: null, plan: null, intervals: [], rank: null, find: null, findBadge: 0 }
}

/** Read everything the cards show, in parallel; each part fills in as it arrives. */
function load(env: CardsEnv, social: boolean): void {
  const { token } = env.session
  const set = (patch: Partial<CardsData>) => {
    Object.assign(env.data, patch)
    if (cached?.token === token) cached.data = env.data
    env.changed()
  }
  void fetchOwnProfile(token, currentBookHint()).then(result => { if (result.ok) set({ profile: result.profile }) })
  void loadReading(token, env.session.userId).then(reading => { if (reading) set({ reading }) })
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
    set({ plan: paying ? 'premium' : 'free', intervals: premiumOfferIntervals(info) })
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
  const session = options.session ?? await readSession()
  if (!session) return false
  // A stack already open is replaced quietly: its own onClose is not told.
  if (current) { const previous = current; current = null; previous.stack.closeAll() }
  const social = options.social ?? socialFriendsOn()
  const data = cached?.token === session.token ? { ...cached.data } : emptyData()
  cached = { token: session.token, data }
  let stack: CardStack | null = null
  const env: CardsEnv = {
    session,
    data,
    social,
    changed: () => stack?.refreshLive(),
    reloadFind: () => loadFind(env, patch => { Object.assign(env.data, patch); env.changed() }),
    navigate: url => { location.assign(url) },
    signOut: async () => {
      try { await supabase?.auth.signOut() } catch { /* signed out locally below */ }
      clearSignedInCookie()
      // The next person on this device must not inherit this reader's data.
      wipeLabDeviceUserData()
      cached = null
      location.assign('/library')
    },
    resetPassword: async () => {
      if (!supabase || !session.email) return ''
      const back = returnTo()
      const { error } = await supabase.auth.resetPasswordForEmail(session.email, {
        redirectTo: await authRedirectTo(supabase, back, 'reset', `${location.origin}${LAB_AUTH_CALLBACK_PATH}?mode=reset&returnTo=${encodeURIComponent(back)}`),
      })
      return error ? error.message : 'Password reset email sent.'
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
  load(env, social)
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
