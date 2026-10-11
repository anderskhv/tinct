/**
 * The six account cards (and the small cards behind their rows), as
 * cards.html draws them: You, Your reading, Leaderboard, Find readers, a
 * reader's profile and Settings; behind them Account, Choose a picture and
 * Change background.
 *
 * Data from the existing endpoints only (cardsApi.ts). Every reading figure
 * on You and Your reading comes from one readingTimeStats.
 */
import { CARDS_COPY } from './cardsCopy'
import { chartWeeks, dayMonth, dayMonthShort, dayMonthShortDate, durationShort, finishedValue, rankOf, readingFigures, shortEmail, weekHeights } from './cardsFormat'
import {
  blockedReaderId,
  deleteOwnAccount,
  fetchBoard,
  fetchFind,
  fetchProfile,
  openBillingPortal,
  saveProfile,
  searchReaders,
  socialAction,
  unblockReader,
  type BoardData,
  type BoardEntry,
  type FindRow,
  type OwnProfile,
  type ProfilePageData,
  type ProfilePicture,
  type ReadingLoad,
} from './cardsApi'
import { chapterFraction, followBackCount, followButton, leaderboardAllowed, privacyChange, readerCardView, relationAfter, type PrivacyFields } from './cardsRules'
import { CardStack, ICONS, el, group, heading, navBar, row, type CardHandle, type CardSpec } from './cardStack'
import { COVER_BOOK_IDS, LIBRARY_BACKGROUND, PICTURE_SETS, backgroundView, pictureView, type BackgroundKind, type NewBooksOpenIn, type PictureKind, type Relation, type Visibility } from '../social/profileRules'
import { privateImageUrl, rememberNewBooksOpenIn, resizePhoto, uploadProfileImage } from '../social/socialClient'
import { startTopUpCheckout, type AiAllowance, type TopUpPack } from '../lab/labAiAllowance'
import { startPremiumCheckout, type PremiumInterval } from '../lab/labPremiumOffer'

// ===== Shared state =====

export type FindData = NonNullable<Awaited<ReturnType<typeof fetchFind>>>

export interface CardsData {
  /** null: profiles are off or unavailable; the cards show what needs no profile. */
  profile: OwnProfile | null
  /** The ledger's figures and the books (null while reading time is off or unavailable). */
  reading: ReadingLoad | null
  allowance: AiAllowance | null
  plan: 'premium' | 'free' | null
  /** Premium intervals on sale to this reader (free readers only). */
  intervals: PremiumInterval[]
  /** "3rd of 5" among friends (/api/social/rank). */
  rank: string | null
  /**
   * The Friends board, asked for when the cards open so the Leaderboard card
   * paints at once (it refreshes behind). In memory only: it names other
   * readers, so it is never written to this device's storage.
   */
  board?: BoardData | null
  /** Find readers: Following you, Also reading your books, the invite link. */
  find: FindData | null
  /** Readers who follow you whom you do not follow back. */
  findBadge: number
  /** The account has a Stripe subscription, so Stripe's portal has something to manage. */
  billing?: boolean
  /** Not answered yet (and nothing cached): the You card shows a quiet skeleton there. */
  loading?: { profile?: boolean; reading?: boolean }
}

export interface CardsSession {
  token: string
  userId: string | null
  email: string | null
  /** The account's own name (Google's full name), for a reader without a profile. */
  accountName: string | null
}

export interface CardsEnv {
  session: CardsSession
  data: CardsData
  /** Leaderboard and Find readers exist (the Worker's SOCIAL_FRIENDS marker). */
  social: boolean
  /** Re-render the live cards after `data` changed. */
  changed: () => void
  /** Read Find readers again (after a follow). */
  reloadFind: () => void
  /** Sign out and wipe this device's reader data; then go to `landing` (default: the library). */
  signOut: (landing?: string) => Promise<void>
  resetPassword: () => Promise<string>
  navigate: (url: string) => void
  clipboard?: (text: string) => Promise<boolean>
}

// ===== Pictures =====

/** A picture: the reader's own ({ kind, value, url }) or the social API's ProfilePicture. */
export type CardPicture = Partial<ProfilePicture> & { kind?: PictureKind; value?: string | null; url?: string | null }

/** Draw a picture into a round element. Stored photos load with the reader's token. */
export function paintPicture(node: HTMLElement, picture: CardPicture | null | undefined, name: string, token: string | null): void {
  // No name, no letter: never a stand-in initial.
  const initial = (name.trim()[0] || '').toUpperCase()
  let view: { src: string | null; pos: string; cover: boolean; private: boolean; initial: string }
  if (picture?.kind) {
    const own = pictureView(picture.kind, picture.value ?? null, name, picture.url ?? null)
    view = own.kind === 'image' ? { src: own.src, pos: own.pos, cover: own.cover, private: Boolean(own.private), initial } : { src: null, pos: '', cover: false, private: false, initial: own.initial }
  } else if (picture?.src) {
    view = { src: picture.src, pos: picture.pos || '50% 35%', cover: picture.cover !== false, private: picture.private === true, initial: picture.initial || initial }
  } else {
    view = { src: null, pos: '', cover: false, private: false, initial: picture?.initial || initial }
  }
  node.textContent = ''
  node.style.backgroundImage = ''
  if (!view.src) {
    node.classList.add('is-init')
    node.textContent = view.initial
    return
  }
  node.classList.remove('is-init')
  node.style.backgroundPosition = view.pos
  node.style.backgroundSize = view.cover ? '260% auto' : 'cover'
  if (view.private) {
    if (token) void privateImageUrl(token, view.src).then(src => { if (src) node.style.backgroundImage = `url("${src}")` })
  } else {
    node.style.backgroundImage = `url("${view.src}")`
  }
}

function paintBanner(node: HTMLElement, view: { src: string; private?: boolean }, token: string | null): void {
  if (view.private) {
    if (token) void privateImageUrl(token, view.src).then(src => { if (src) node.style.setProperty('--bgimg', `url("${src}")`) })
  } else {
    node.style.setProperty('--bgimg', `url("${view.src}")`)
  }
}

function avatar(picture: CardPicture | null | undefined, name: string, token: string): HTMLElement {
  const node = el('span', { className: 'tc-av is-s', 'aria-hidden': 'true' })
  paintPicture(node, picture, name, token)
  return node
}

/** The reader's own name: the profile's, else the account's; '' rather than a stand-in. */
function ownName(env: CardsEnv): string {
  return env.data.profile?.name || env.session.accountName || ''
}

function planWord(env: CardsEnv): string {
  return env.data.plan === 'premium' ? CARDS_COPY.premium : env.data.plan === 'free' ? CARDS_COPY.free : ''
}

// ===== Small parts =====

function statusLine(text = ''): HTMLElement {
  return el('p', { className: 'tc-status', role: 'status', 'aria-live': 'polite', text })
}

function button(label: string, style: 'fill' | 'line', onClick: (() => void) | null, testid?: string): HTMLButtonElement {
  const node = el('button', { type: 'button', className: `tc-btn is-${style}`, text: label, dataset: testid ? { testid } : undefined }) as HTMLButtonElement
  if (onClick) node.addEventListener('click', event => { event.stopPropagation(); onClick() })
  else node.disabled = true
  return node
}

function segmented<T extends string>(label: string, options: Array<{ value: T; label: string }>, selected: T, choose: (value: T) => void, extra: { wide?: boolean; testid?: string } = {}): HTMLElement {
  const seg = el('div', { className: `tc-seg${extra.wide ? ' is-wide' : ''}`, role: 'radiogroup', 'aria-label': label, dataset: extra.testid ? { testid: extra.testid } : undefined })
  for (const option of options) {
    seg.append(el('button', {
      type: 'button', role: 'radio', 'aria-checked': String(option.value === selected), text: option.label, dataset: { value: option.value },
      onclick: () => { if (option.value !== selected) choose(option.value) },
    }))
  }
  return seg
}

function toggle(label: string, on: boolean, enabled: boolean, flip: () => void, testid: string): HTMLElement {
  return el('button', {
    type: 'button', role: 'switch', className: 'tc-sw', 'aria-checked': String(on), 'aria-label': label,
    'aria-disabled': enabled ? null : 'true', disabled: !enabled, dataset: { testid }, onclick: flip,
  })
}

/** The tap that closes a menu or a tip does only that: its click is swallowed. */
function swallowNextClick(): void {
  const swallow = (event: Event) => { event.stopPropagation(); event.preventDefault(); done() }
  const done = () => { document.removeEventListener('click', swallow, true); clearTimeout(timer) }
  const timer = setTimeout(done, 600)
  document.addEventListener('click', swallow, true)
}

/** A small menu where you tapped (cards.html step 2). Tap anywhere else to close. */
function popMenu(card: HTMLElement, top: number, items: Array<{ label: string; run: () => void; testid?: string }>, dim?: HTMLElement | null, align: 'start' | 'end' = 'start'): void {
  card.querySelector('.tc-pop')?.remove()
  const pop = el('div', { className: 'tc-pop', role: 'menu', dataset: { testid: 'card-menu' } },
    el('div', { className: 'tc-g' }, ...items.map(item => row({ label: item.label, onClick: () => { close(); item.run() }, testid: item.testid }))))
  pop.style.top = `${top}px`
  if (align === 'end') pop.classList.add('is-end')
  dim?.classList.add('tc-dim')
  function close() {
    pop.remove()
    dim?.classList.remove('tc-dim')
    card.removeEventListener('pointerdown', outside, true)
  }
  function outside(event: Event) {
    if (!pop.contains(event.target as Node)) { event.stopPropagation(); event.preventDefault(); swallowNextClick(); close() }
  }
  card.append(pop)
  setTimeout(() => card.addEventListener('pointerdown', outside, true), 0)
}

/** A dark explanation box under an (i) (cards.html step 9). Tap anywhere to close. */
function openTip(body: HTMLElement, rowNode: HTMLElement, info: HTMLElement, text: readonly [string, string]): void {
  body.querySelector('.tc-tip')?.remove()
  const tip = el('div', { className: 'tc-tip', role: 'tooltip', dataset: { testid: 'card-tip' } }, el('b', { text: text[0] }), text[1])
  const bodyBox = body.getBoundingClientRect()
  const rowBox = rowNode.getBoundingClientRect()
  const infoBox = info.getBoundingClientRect()
  tip.style.top = `${rowBox.bottom - bodyBox.top + 8}px`
  tip.style.setProperty('--arrow', `${Math.max(12, infoBox.left + infoBox.width / 2 - bodyBox.left - 16 - 6)}px`)
  body.append(tip)
  const close = (event: Event) => {
    event.stopPropagation()
    event.preventDefault()
    swallowNextClick()
    tip.remove()
    document.removeEventListener('pointerdown', close, true)
  }
  setTimeout(() => document.addEventListener('pointerdown', close, true), 0)
}

function bookRow(title: string, fraction: number | null, value: string, testid?: string): HTMLElement {
  const label = el('span', { className: 'tc-l' }, el('span', { className: 'tc-lt', text: title }))
  if (fraction !== null) {
    const bar = el('span', { className: 'tc-pr' }, el('i'))
    ;(bar.firstChild as HTMLElement).style.width = `${Math.round(Math.max(0, Math.min(1, fraction)) * 100)}%`
    label.append(bar)
  }
  return row({ label, value, className: fraction !== null ? 'is-bk' : '', testid })
}

function factsRow(facts: Array<{ value: string; label: string }>, ruled: boolean): HTMLElement | null {
  if (!facts.length) return null
  return el('div', { className: `tc-three${ruled ? ' is-ruled' : ''}`, dataset: { testid: 'card-facts' } },
    ...facts.map(fact => el('div', {}, el('b', { text: fact.value }), el('span', { text: fact.label }))))
}

function heroClose(card: CardHandle): HTMLElement {
  return el('button', { type: 'button', className: 'tc-disc is-x', 'aria-label': 'Close', html: ICONS.x, dataset: { testid: 'card-close' }, onclick: () => card.stack.closeAll() })
}

// ===== Cards =====

export type CardId = 'you' | 'reading' | 'leaderboard' | 'find' | 'settings' | 'account' | 'picture' | 'background'

export function cardSpec(id: CardId, env: CardsEnv): CardSpec {
  switch (id) {
    case 'you': return youCard(env)
    case 'reading': return readingCard(env)
    case 'leaderboard': return leaderboardCard(env)
    case 'find': return findCard(env)
    case 'settings': return settingsCard(env)
    case 'account': return accountCard(env)
    case 'picture': return pictureCard(env)
    case 'background': return backgroundCard(env)
  }
}

/** 1 · You */
export function youCard(env: CardsEnv): CardSpec {
  let status = ''
  // One file field per slot for the card's life, so a re-render while the
  // system picker is open never drops the reader's choice.
  const files = { picture: fileField(), background: fileField() }
  for (const slot of ['picture', 'background'] as const) {
    const field = files[slot]
    field.addEventListener('change', async () => {
      const chosen = field.files?.[0]
      field.value = ''
      if (!chosen) return
      const image = await resizePhoto(chosen, slot)
      const saved = image ? await uploadProfileImage(env.session.token, slot, image) : null
      if (saved?.ok) env.data.profile = saved.profile
      else status = (saved && !saved.ok && saved.message) || CARDS_COPY.saveFailed
      env.changed()
    })
  }
  return {
    id: 'you',
    label: CARDS_COPY.you,
    live: true,
    render: card => {
      const { data, session } = env
      const profile = data.profile
      const waitingProfile = !profile && data.loading?.profile === true
      const name = waitingProfile ? '' : ownName(env)
      const bg = el('div', { className: 'tc-hero-bg' })
      // While the profile is on its way: no painting yet rather than the wrong one.
      if (!waitingProfile) paintBanner(bg, profile ? backgroundView(profile.background.kind, profile.background.value, profile.background.url) : { src: LIBRARY_BACKGROUND }, session.token)
      const pic = el('button', { type: 'button', className: `tc-av${waitingProfile ? ' is-skel' : ''}`, 'aria-label': CARDS_COPY.choosePicture, dataset: { testid: 'you-picture' } }) as HTMLButtonElement
      if (!waitingProfile) paintPicture(pic, profile?.picture ?? null, name, session.token)
      const body = el('div', { className: 'tc-body is-under-hero' })
      let bgButton: HTMLElement | null = null
      if (profile) {
        // Uploads only while the Worker accepts them (SOCIAL_PHOTO_UPLOADS); otherwise straight to the choices.
        const uploads = profile.uploads === true
        const menuTop = (anchor: HTMLElement) => {
          const box = card.element.getBoundingClientRect()
          return anchor.getBoundingClientRect().bottom - box.top + card.element.scrollTop + 6
        }
        // The picture: the camera on the avatar is for the profile picture only.
        pic.append(el('span', { className: 'tc-cam', html: ICONS.cam, 'aria-hidden': 'true' }))
        pic.addEventListener('click', () => {
          if (!uploads) { card.stack.push(pictureCard(env)); return }
          popMenu(card.element, menuTop(pic), [
            { label: CARDS_COPY.uploadPicture, run: () => files.picture.click(), testid: 'menu-upload' },
            { label: CARDS_COPY.choosePicture, run: () => card.stack.push(pictureCard(env)), testid: 'menu-choose' },
          ], body)
        })
        // The background: its own small button on the painting.
        const button = el('button', { type: 'button', className: 'tc-disc is-bg', 'aria-label': CARDS_COPY.changeBackground, html: ICONS.cam, dataset: { testid: 'you-background' } })
        button.addEventListener('click', () => {
          if (!uploads) { card.stack.push(backgroundCard(env)); return }
          popMenu(card.element, menuTop(button), [
            { label: CARDS_COPY.chooseBackground, run: () => card.stack.push(backgroundCard(env)), testid: 'menu-background' },
            { label: CARDS_COPY.uploadBackground, run: () => files.background.click(), testid: 'menu-upload-background' },
          ], body, 'end')
        })
        bgButton = button
        body.append(files.picture, files.background)
      } else {
        pic.disabled = true
        pic.removeAttribute('aria-label')
      }
      const nameNode = waitingProfile
        ? el('span', { className: 'tc-nm', dataset: { testid: 'you-name-skeleton' } }, el('i', { className: 'tc-skel is-name', 'aria-hidden': 'true' }))
        : el('span', { className: 'tc-nm' }, el('b', { text: name }), el('span', { text: planWord(env) }))
      const hero = el('div', { className: 'tc-hero' }, bg, bgButton, heroClose(card), el('div', { className: 'tc-who' }, pic, nameNode))

      const stats = data.reading?.stats
      const readingRow = stats
        ? row({ label: CARDS_COPY.yourReading, value: readingFigures(stats).youRow, chevron: true, onClick: () => card.stack.push(readingCard(env)), testid: 'you-reading' })
        : data.loading?.reading ? row({ label: CARDS_COPY.yourReading, value: el('i', { className: 'tc-skel', 'aria-hidden': 'true' }), testid: 'you-reading-skeleton' }) : null
      const readingGroup = group(
        readingRow,
        // Only once the reader joined the leaderboard.
        env.social && profile?.onLeaderboard ? row({ label: CARDS_COPY.leaderboard, value: data.rank, chevron: true, onClick: () => card.stack.push(leaderboardCard(env)), testid: 'you-leaderboard' }) : null,
      )
      const badge = data.findBadge > 0 ? el('span', { className: 'tc-badge', text: String(data.findBadge) }) : null
      const moreGroup = group(
        env.social && profile ? row({ label: CARDS_COPY.findReaders, value: badge, chevron: true, onClick: () => card.stack.push(findCard(env)), testid: 'you-find' }) : null,
        row({ label: CARDS_COPY.settings, chevron: true, onClick: () => card.stack.push(settingsCard(env)), testid: 'you-settings' }),
      )
      body.append(...[readingGroup, data.allowance ? creditsGroup(env, card) : null, moreGroup].filter(Boolean) as Node[], statusLine(status))
      status = ''
      return [hero, body]
    },
  }
}

function fileField(): HTMLInputElement {
  return el('input', { type: 'file', accept: 'image/*', className: 'tc-file', 'aria-hidden': 'true', tabindex: '-1' }) as HTMLInputElement
}

function creditsGroup(env: CardsEnv, card: CardHandle): HTMLElement {
  const allowance = env.data.allowance!
  const left = Math.max(0, Math.min(100, Math.round((1 - (allowance.monthUsedFraction ?? allowance.usedFraction)) * 100)))
  const meter = (label: string, leftPercent: number, words: string, light: boolean, testid: string) => {
    const track = el('div', { className: 'tc-tr', role: 'meter', 'aria-label': label, 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(leftPercent) }, el('i'))
    ;(track.firstChild as HTMLElement).style.width = `${leftPercent}%`
    return el('div', { className: `tc-r tc-meter${light ? ' is-light' : ''}`, dataset: { testid } },
      el('div', { className: 'tc-top' }, el('span', { text: label }), el('span', { className: 'tc-v' }, el('b', { text: `${leftPercent}%` }), ` ${words}`)), track)
  }
  // The lighter top-up bar only once a top-up was bought this period.
  const topUpLeft = allowance.topUpLeftFraction
  const renews = dayMonthShort(allowance.resetsAt)
  const packs = allowance.topUps
  const topUpRow = packs.length ? row({
    label: CARDS_COPY.topUp,
    value: renews ? CARDS_COPY.renews(renews) : null,
    chevron: true,
    testid: 'you-top-up',
    onClick: () => {
      const rowNode = card.element.querySelector<HTMLElement>('[data-testid="you-top-up"]')
      const cardBox = card.element.getBoundingClientRect()
      const top = rowNode ? rowNode.getBoundingClientRect().bottom - cardBox.top + card.element.scrollTop + 4 : 180
      const buy = (pack: TopUpPack) => async () => {
        const url = await startTopUpCheckout(env.session.token, pack)
        if (url) { env.navigate(url); return }
        const line = card.element.querySelector('.tc-status')
        if (line) line.textContent = CARDS_COPY.topUpFailed
      }
      popMenu(card.element, top, [
        ...(packs.includes('chat_pack_200') ? [{ label: CARDS_COPY.buyTopUp, run: buy('chat_pack_200'), testid: 'menu-top-up' }] : []),
        ...(packs.includes('top_up_10') ? [{ label: CARDS_COPY.buyTopUpMore, run: buy('top_up_10'), testid: 'menu-top-up-more' }] : []),
      ])
    },
  }) : null
  return group(
    meter(CARDS_COPY.aiCredits, left, CARDS_COPY.leftThisMonth, false, 'you-ai-credits'),
    topUpLeft !== null ? meter(CARDS_COPY.topUpBar, Math.round(Math.max(0, Math.min(1, topUpLeft)) * 100), CARDS_COPY.left, true, 'you-top-up-bar') : null,
    topUpRow,
  )!
}

/** 2 · Your reading */
export function readingCard(env: CardsEnv): CardSpec {
  return {
    id: 'reading',
    label: CARDS_COPY.yourReading,
    live: true,
    render: card => {
      const reading = env.data.reading
      const body = el('div', { className: 'tc-body' })
      if (reading) {
        const { stats } = reading
        const seconds = new Map(stats.books.map(book => [book.bookId, book]))
        const figures = readingFigures(stats)
        const figure = el('div', { className: 'tc-figure', dataset: { testid: 'reading-total' } })
        for (const [n, unit] of figures.total) figure.append(n, el('small', { text: unit }))
        // One bar per week (Monday to Sunday), from the first reading week;
        // the dates under the first and last bar say what a bar is.
        const weeks = chartWeeks(stats.weeks, stats.firstDay)
        const bars = el('div', { className: 'tc-bars', 'aria-hidden': 'true', dataset: { testid: 'reading-weeks' } })
        bars.style.setProperty('--tc-weeks', String(weeks.length))
        for (const height of weekHeights(weeks)) {
          const bar = el('i')
          bar.style.height = `${height}%`
          bars.append(bar)
        }
        const axis = el('div', { className: 'tc-axis', 'aria-hidden': 'true' },
          el('span', { text: weeks.length > 1 ? dayMonthShortDate(weeks[0].start) : '' }),
          el('span', { text: CARDS_COPY.thisWeek }))
        const since = dayMonth(stats.firstDay)
        body.append(el('div', { className: 'tc-g' },
          el('div', { className: 'tc-sum' }, figure, since ? el('div', { className: 'tc-sub', text: CARDS_COPY.since(since) }) : null, bars, axis),
          factsRow([
            { value: figures.last7, label: CARDS_COPY.last7 },
            { value: String(reading.finished.length), label: CARDS_COPY.finished },
            { value: `${stats.streak} ${stats.streak === 1 ? 'day' : 'days'}`, label: CARDS_COPY.streak },
          ], true)))
        const time = (bookId: string) => {
          const s = seconds.get(bookId)?.seconds ?? 0
          return s >= 60 ? durationShort(s) : ''
        }
        if (reading.readingNow.length) {
          body.append(heading(CARDS_COPY.readingNow), group(...reading.readingNow.map(book => bookRow(book.title, book.fraction ?? 0, time(book.bookId), 'reading-now-row')))!)
        }
        if (reading.finished.length) {
          body.append(heading(CARDS_COPY.finishedHeading), group(...reading.finished.map(book => {
            const entry = seconds.get(book.bookId)
            return bookRow(book.title, null, finishedValue(entry?.lastDay ?? null, entry && entry.seconds >= 60 ? entry.seconds : null), 'finished-row')
          }))!)
        }
      }
      return [navBar(card, CARDS_COPY.yourReading), body]
    },
  }
}

/** 3 · Leaderboard (Friends | Everyone; rows carry no link, by the privacy notice). */
export function leaderboardCard(env: CardsEnv): CardSpec {
  let tab: 'friends' | 'everyone' = 'friends'
  /** undefined: not asked yet; 'loading'; null: not available. */
  let board: BoardData | null | 'loading' | undefined
  let everyoneOpen = false
  return {
    id: 'leaderboard',
    label: CARDS_COPY.leaderboard,
    render: card => {
      // Friends: paint the board the cards fetched on open, and refresh it once behind.
      if (board === undefined && tab === 'friends' && env.data.board) {
        board = env.data.board
        if (env.data.board.everyoneOpen !== undefined) everyoneOpen = env.data.board.everyoneOpen === true
        void fetchBoard(env.session.token, 'friends').then(result => {
          if (tab !== 'friends' || !result) return
          board = result
          env.data.board = result
          if (result.everyoneOpen !== undefined) everyoneOpen = result.everyoneOpen === true
          if (!card.stack.isClosed) card.refresh()
        })
      }
      if (board === undefined) {
        board = 'loading'
        const asked = tab
        void fetchBoard(env.session.token, asked).then(result => {
          if (asked !== tab) return
          board = result ?? null
          if (result?.everyoneOpen !== undefined) everyoneOpen = result.everyoneOpen === true
          // No Everyone board (any more): the Friends board.
          if (!result && asked === 'everyone') { tab = 'friends'; everyoneOpen = false; board = undefined }
          if (result && asked === 'friends') {
            env.data.board = result
            const me = result.entries.find(entry => entry.me) ?? result.me
            env.data.rank = rankOf(me?.rank, result.total)
          }
          if (!card.stack.isClosed) card.refresh()
        })
      }
      const body = el('div', { className: 'tc-body is-tight' })
      if (everyoneOpen) {
        body.append(segmented(CARDS_COPY.leaderboard, [{ value: 'friends', label: CARDS_COPY.friends }, { value: 'everyone', label: CARDS_COPY.everyone }], tab, value => {
          tab = value
          board = undefined
          card.refresh()
        }, { wide: true, testid: 'board-tabs' }))
      }
      if (board && board !== 'loading') {
        const rows: BoardEntry[] = [...board.entries]
        // Your own row and rank always show.
        if (board.me && !rows.some(entry => entry.me)) rows.push(board.me)
        body.append(heading(CARDS_COPY.lastSevenDays, { marginBottom: '-16px' }))
        const list = group(...rows.map(entry => boardRow(env, entry)))
        if (list) { list.dataset.testid = 'board-rows'; body.append(list) }
      } else if (board === null) {
        body.append(el('p', { className: 'tc-foot', style: { margin: '0 16px' }, text: CARDS_COPY.boardUnavailable }))
      }
      body.append(group(row({ label: CARDS_COPY.findReaders, chevron: true, onClick: () => card.stack.push(findCard(env)), testid: 'board-find' }))!)
      return [navBar(card, CARDS_COPY.leaderboard), body]
    },
  }
}

function boardRow(env: CardsEnv, entry: BoardEntry): HTMLElement {
  const node = row({ label: entry.me ? CARDS_COPY.me : entry.name, value: durationShort(entry.seconds), className: `is-av${entry.me ? ' is-me' : ''}`, testid: entry.me ? 'board-me' : 'board-row' })
  node.prepend(el('span', { className: 'tc-rank', text: String(entry.rank) }), avatar(entry.picture, entry.name, env.session.token))
  return node
}

/** 4 · Find readers */
export function findCard(env: CardsEnv): CardSpec {
  let query = ''
  let results: FindRow[] | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  const relations = new Map<string, Relation>()
  let status = ''
  return {
    id: 'find',
    label: CARDS_COPY.findReaders,
    live: true,
    render: card => {
      const token = env.session.token
      const data = env.data.find
      const personRow = (person: FindRow, testid: string) => {
        const relation = relations.get(person.handle) ?? person.relation
        const spec = followButton(relation)
        const extra: Node[] = []
        if (spec) {
          const action = spec.action
          const btn = button(spec.label, spec.style, action ? async () => {
            btn.disabled = true
            relations.set(person.handle, relationAfter(relation, action === 'follow'))
            card.refresh()
            const result = await socialAction(token, action, person.handle)
            if (result.ok) {
              if (result.relation) relations.set(person.handle, result.relation)
              env.reloadFind()
            } else {
              relations.set(person.handle, relation)
              status = CARDS_COPY.actionFailed
            }
            card.refresh()
          } : null, `${testid}-button`)
          extra.push(btn)
        }
        const node = row({ label: person.name, className: 'is-av', testid, onClick: () => card.stack.push(profileCard(env, person.handle, person.name, person.picture)), extra })
        node.prepend(avatar(person.picture, person.name, token))
        return node
      }

      const input = el('input', { type: 'search', placeholder: CARDS_COPY.searchPlaceholder, 'aria-label': CARDS_COPY.searchPlaceholder, autocomplete: 'off', spellcheck: 'false', enterkeyhint: 'search' }) as HTMLInputElement
      input.value = query
      const resultsBox = el('div', { dataset: { testid: 'find-results' }, style: { display: 'contents' } })
      const browse = el('div', { style: { display: 'contents' } })
      const renderResults = () => {
        resultsBox.replaceChildren()
        if (results === null) { browse.hidden = false; return }
        browse.hidden = true
        resultsBox.append(results.length ? group(...results.map(person => personRow(person, 'find-result')))! : el('p', { className: 'tc-foot', style: { margin: '0 16px' }, text: CARDS_COPY.noSearchResult }))
      }
      input.addEventListener('input', () => {
        query = input.value
        if (timer) clearTimeout(timer)
        const q = query.trim()
        if (q.length < 2) { results = null; renderResults(); return }
        timer = setTimeout(async () => {
          const found = await searchReaders(token, q)
          if (query.trim() !== q || card.stack.isClosed) return
          // Search lists only readers set to Everyone (the server's rule).
          results = found?.results ?? []
          renderResults()
        }, 250)
      })
      const search = el('label', { className: 'tc-search', dataset: { testid: 'find-search' } }, el('span', { html: ICONS.search, style: { display: 'contents' } }), input)

      if (data?.followingYou.length) browse.append(heading(CARDS_COPY.followingYou), group(...data.followingYou.map(person => personRow(person, 'following-you-row')))!)
      if (data?.alsoReading.length) browse.append(heading(CARDS_COPY.readingYourBooks), group(...data.alsoReading.map(person => personRow(person, 'reader-row')))!)
      const link = data?.link ?? env.data.profile?.link ?? null
      if (link) {
        const say = (text: string) => { const line = card.element.querySelector('.tc-status'); if (line) line.textContent = text }
        const copy = button(CARDS_COPY.copy, 'line', async () => {
          const ok = env.clipboard ? await env.clipboard(`https://${link}`) : await copyText(`https://${link}`)
          say(ok ? CARDS_COPY.linkCopied : '')
        }, 'invite-copy')
        const share = row({
          label: CARDS_COPY.share, chevron: true, testid: 'invite-share', onClick: async () => {
            const outcome = await shareLink(`https://${link}`, env.clipboard)
            say(outcome === 'copied' ? CARDS_COPY.linkCopied : outcome === 'failed' ? CARDS_COPY.shareUnavailable : '')
          },
        })
        browse.append(heading(CARDS_COPY.inviteReader), group(row({ label: link, extra: [copy], testid: 'invite-link' }), share)!)
      }
      const body = el('div', { className: 'tc-body' }, search, resultsBox, browse, statusLine(status))
      status = ''
      renderResults()
      return [navBar(card, CARDS_COPY.findReaders), body]
    },
  }
}

async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true } catch { return false }
}

async function shareLink(url: string, clipboard?: (text: string) => Promise<boolean>): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> }
  if (nav.share) {
    try { await nav.share({ url, title: CARDS_COPY.shareTitle, text: CARDS_COPY.shareText }); return 'shared' } catch (error) { return (error as { name?: string })?.name === 'AbortError' ? 'cancelled' : 'failed' }
  }
  return (await (clipboard ?? copyText)(url)) ? 'copied' : 'failed'
}

/** 5 · A reader's profile (from Find readers); Unblock for a reader the viewer blocked. */
export function profileCard(env: CardsEnv, handle: string, name: string, picture: CardPicture | null): CardSpec {
  let data: ProfilePageData | null | undefined
  /** The relation while the profile cannot be seen (follow from a link still works). */
  let unseen: Relation | null = null
  let expanded = false
  let status = ''
  /** Set while the viewer has blocked this reader (their profile answers 404): the card offers Unblock. */
  let blockedId: string | null = null
  return {
    id: 'profile',
    label: name,
    render: card => {
      const token = env.session.token
      if (data === undefined) {
        data = null
        void fetchProfile(token, handle).then(async result => {
          data = result?.profile ?? null
          if (!data) blockedId = await blockedReaderId(token, handle)
          if (!card.stack.isClosed) card.refresh()
        })
      }
      const current = data
      const bg = el('div', { className: 'tc-hero-bg' })
      paintBanner(bg, current?.banner ?? { src: LIBRARY_BACKGROUND }, token)
      const back = el('button', { type: 'button', className: 'tc-disc is-b', 'aria-label': 'Back', html: ICONS.back, dataset: { testid: 'card-back' }, onclick: () => card.stack.back() })
      const pic = el('span', { className: 'tc-av', 'aria-hidden': 'true' })
      paintPicture(pic, current?.picture ?? picture, current?.name ?? name, token)
      const relation: Relation | null = current ? current.relation : unseen ?? 'stranger'
      const who = el('div', { className: 'tc-who' }, pic,
        el('span', { className: 'tc-nm' }, el('b', { text: current?.name ?? name }), current?.followsYou ? el('span', { text: CARDS_COPY.followsYou }) : null))
      const spec = followButton(relation)
      if (blockedId) {
        const id = blockedId
        const unblock = button(CARDS_COPY.unblock, 'line', async () => {
          unblock.disabled = true
          if (await unblockReader(token, id)) {
            blockedId = null
            data = (await fetchProfile(token, handle))?.profile ?? null
          } else status = CARDS_COPY.actionFailed
          card.refresh()
        }, 'profile-unblock')
        who.append(unblock)
      } else if (spec) {
        const action = spec.action
        const btn = button(spec.label, spec.style, action ? async () => {
          btn.disabled = true
          const result = await socialAction(token, action, handle)
          if (!result.ok) status = CARDS_COPY.actionFailed
          else {
            unseen = result.relation ?? relationAfter(relation, action === 'follow')
            // Following may open a Friends profile, unfollowing may close it: read it again.
            data = (await fetchProfile(token, handle))?.profile ?? null
            env.reloadFind()
          }
          card.refresh()
        } : null, 'profile-follow')
        who.append(btn)
      }
      const hero = el('div', { className: 'tc-hero' }, bg, back, heroClose(card), who)
      const body = el('div', { className: 'tc-body is-under-hero', dataset: { testid: 'profile-body' } })
      const view = current ? readerCardView(current) : null
      if (view && !view.limited) {
        const facts = factsRow(view.facts, false)
        if (facts) body.append(el('div', { className: 'tc-g' }, facts))
        if (view.readingNow) {
          body.append(heading(CARDS_COPY.readingNow), group(...view.readingNow.map(book => bookRow(book.title, chapterFraction(book.progress), book.progress ?? book.hours ?? '', 'profile-now-row')))!)
        }
        if (view.finished) {
          const shown = expanded ? view.finished : view.finished.slice(0, 2)
          const rest = view.finished.length - shown.length
          body.append(heading(CARDS_COPY.finishedHeading), group(
            ...shown.map(book => bookRow(book.title, null, book.hours ?? '', 'profile-finished-row')),
            rest > 0 ? row({ label: CARDS_COPY.more(rest), chevron: true, onClick: () => { expanded = true; card.refresh() }, testid: 'profile-more' }) : null,
          )!)
        }
      }
      body.append(statusLine(status))
      status = ''
      return [hero, body]
    },
  }
}

/** 6 · Settings */
export function settingsCard(env: CardsEnv): CardSpec {
  let status = ''
  /** Change password: sending, then the confirmation line under the row (kept while the card is open). */
  let sendingReset = false
  let resetStatus = ''
  return {
    id: 'settings',
    label: CARDS_COPY.settings,
    live: true,
    render: card => {
      const body = el('div', { className: 'tc-body', dataset: { testid: 'settings-body' } })
      const profile = env.data.profile
      const post = async (patch: Record<string, unknown>, undo: () => void) => {
        const saved = await saveProfile(env.session.token, patch)
        if (saved.ok) env.data.profile = saved.profile
        else { undo(); status = saved.message || CARDS_COPY.saveFailed }
        env.changed()
      }
      if (profile) {
        const setPrivacy = (change: Partial<PrivacyFields>) => {
          const before = env.data.profile
          if (!before) return
          const { next, patch } = privacyChange(before, change)
          if (!Object.keys(patch).length) return
          env.data.profile = { ...before, ...next }
          env.changed()
          // A choice of who can see you also marks the profile set up (as the You page did).
          void post('visibility' in patch ? { ...patch, setUp: true } : patch, () => { env.data.profile = before })
        }
        const withInfo = (text: string, tip: readonly [string, string], testid: string) => {
          const info = el('button', { type: 'button', className: 'tc-info', 'aria-label': `About ${text}`, text: 'i', dataset: { testid } })
          info.addEventListener('click', event => {
            event.stopPropagation()
            openTip(body, info.closest('.tc-r') as HTMLElement, info, tip)
          })
          return el('span', { className: 'tc-l' }, el('span', { className: 'tc-lt', text }), info)
        }
        const allowed = leaderboardAllowed(profile)
        body.append(group(
          row({
            label: withInfo(CARDS_COPY.profile, CARDS_COPY.tipProfile, 'info-profile'), className: 'is-seg', testid: 'settings-visibility-row',
            extra: [segmented<Visibility>(CARDS_COPY.profile, [{ value: 'only_me', label: CARDS_COPY.onlyMe }, { value: 'friends', label: CARDS_COPY.friends }, { value: 'everyone', label: CARDS_COPY.everyone }], profile.visibility, value => setPrivacy({ visibility: value }), { testid: 'settings-visibility' })],
          }),
          row({ label: CARDS_COPY.showReading, className: 'is-seg', extra: [toggle(CARDS_COPY.showReading, profile.showReading, true, () => setPrivacy({ showReading: !profile.showReading }), 'settings-show-reading')] }),
          row({ label: CARDS_COPY.showTime, className: 'is-seg', extra: [toggle(CARDS_COPY.showTime, profile.showTime, true, () => setPrivacy({ showTime: !profile.showTime }), 'settings-show-time')] }),
          row({
            label: withInfo(CARDS_COPY.leaderboard, CARDS_COPY.tipLeaderboard, 'info-leaderboard'), className: `is-seg${allowed ? '' : ' tc-dim'}`, testid: 'settings-leaderboard-row',
            extra: [toggle(CARDS_COPY.leaderboard, allowed && profile.onLeaderboard, allowed, () => setPrivacy({ onLeaderboard: !profile.onLeaderboard }), 'settings-leaderboard')],
          }),
        )!)
        const chooseNewBooks = (value: NewBooksOpenIn) => {
          const before = env.data.profile
          if (!before) return
          env.data.profile = { ...before, newBooksOpenIn: value }
          rememberNewBooksOpenIn(value)
          env.changed()
          void post({ newBooksOpenIn: value }, () => { env.data.profile = before; rememberNewBooksOpenIn(before.newBooksOpenIn) })
        }
        body.append(group(row({ label: CARDS_COPY.newBooksOpenIn, className: 'is-seg', extra: [segmented<NewBooksOpenIn>(CARDS_COPY.newBooksOpenIn, [{ value: 'modern', label: CARDS_COPY.modern }, { value: 'human', label: CARDS_COPY.original }], profile.newBooksOpenIn, chooseNewBooks, { testid: 'settings-new-books' })] }))!,
          el('p', { className: 'tc-foot', text: CARDS_COPY.newBooksFoot }))
      }
      const password = env.session.email ? row({
        label: CARDS_COPY.password, chevron: true, testid: 'settings-password', onClick: async () => {
          if (sendingReset) return
          sendingReset = true
          resetStatus = ''
          card.refresh()
          try { resetStatus = await env.resetPassword() } catch { resetStatus = CARDS_COPY.actionFailed }
          sendingReset = false
          if (card.stack.isClosed) return
          card.refresh()
          // The line sits under the row, in view, not at the foot of a card taller than the screen.
          card.element.querySelector<HTMLElement>('[data-testid="settings-password-status"]')?.scrollIntoView?.({ block: 'nearest' })
        },
      }) as HTMLButtonElement : null
      if (password && sendingReset) { password.disabled = true; password.setAttribute('aria-busy', 'true') }
      body.append(group(
        row({ label: CARDS_COPY.account, value: planWord(env), chevron: true, onClick: () => card.stack.push(accountCard(env)), testid: 'settings-account' }),
        env.session.email ? row({ label: CARDS_COPY.email, value: shortEmail(env.session.email), testid: 'settings-email' }) : null,
        password,
      )!)
      if (password) {
        const line = statusLine(resetStatus)
        line.dataset.testid = 'settings-password-status'
        body.append(line)
      }
      body.append(group(row({ label: CARDS_COPY.signOut, className: 'is-center', onClick: () => void env.signOut(), testid: 'settings-sign-out' }))!)
      body.append(statusLine(status))
      status = ''
      return [navBar(card, CARDS_COPY.settings), body]
    },
  }
}

/** Behind Settings → Account: the plan, changing it, and deleting the account. */
export function accountCard(env: CardsEnv): CardSpec {
  let confirming = false
  let deleting = false
  let status = ''
  return {
    id: 'account',
    label: CARDS_COPY.account,
    live: true,
    render: card => {
      const token = env.session.token
      const premium = env.data.plan === 'premium'
      const body = el('div', { className: 'tc-body' })
      // Manage (Stripe's portal) only with a Stripe subscription to manage; Premium by
      // grant has none, and its portal would say "No payment method": the plan row alone.
      const plans = premium
        ? (env.data.billing ? [row({
          label: CARDS_COPY.manage, chevron: true, testid: 'account-manage', onClick: async () => {
            const url = await openBillingPortal(token)
            if (url) env.navigate(url)
            else { status = CARDS_COPY.actionFailed; card.refresh() }
          },
        })] : [])
        : env.data.intervals.map(interval => row({
          label: interval === 'year' ? CARDS_COPY.yearly : CARDS_COPY.monthly,
          value: interval === 'year' ? CARDS_COPY.yearlyPrice : CARDS_COPY.monthlyPrice,
          chevron: true,
          testid: `account-plan-${interval}`,
          onClick: async () => {
            try { env.navigate(await startPremiumCheckout(token, interval)) } catch { status = CARDS_COPY.paymentFailed; card.refresh() }
          },
        }))
      body.append(group(row({ label: premium ? CARDS_COPY.premiumAccount : CARDS_COPY.freeAccount, testid: 'account-plan' }), ...plans)!)
      if (confirming) {
        body.append(
          el('p', { className: 'tc-foot', style: { margin: '0 16px -16px' }, text: CARDS_COPY.deleteConfirm }),
          group(
            row({ label: CARDS_COPY.cancel, className: 'is-center', onClick: () => { confirming = false; card.refresh() }, testid: 'account-delete-cancel' }),
            // Deleted at once (privacy notice, "Data retention and deletion"), then signed out to the front page.
            row({
              label: CARDS_COPY.deleteAccount, className: 'is-center', testid: 'account-delete-confirm', onClick: async () => {
                if (deleting || !env.session.userId) return
                deleting = true
                const deleted = await deleteOwnAccount(token, env.session.userId)
                deleting = false
                if (deleted) { await env.signOut('/'); return }
                status = CARDS_COPY.actionFailed
                card.refresh()
              },
            }),
          )!,
        )
      } else {
        body.append(group(row({ label: CARDS_COPY.deleteAccount, className: 'is-center', onClick: () => { confirming = true; card.refresh() }, testid: 'account-delete' }))!)
      }
      body.append(statusLine(status))
      status = ''
      return [navBar(card, CARDS_COPY.account), body]
    },
  }
}

// ===== Pictures and backgrounds =====

export interface PictureChoice { kind: PictureKind; value: string; src: string; pos: string }

/** The 4 × 2 grid: details from the library's paintings (the picture sets, then more covers). */
export function pictureChoices(): PictureChoice[] {
  const sets = PICTURE_SETS.map(set => ({ kind: 'set' as PictureKind, value: set.id, src: set.cover, pos: set.pos }))
  const used = new Set(PICTURE_SETS.map(set => set.bookId))
  const preferred = ['frankenstein', 'iliad', 'notes-from-underground']
  const covers = [...preferred, ...COVER_BOOK_IDS.filter(id => !preferred.includes(id))]
    .filter(id => COVER_BOOK_IDS.includes(id) && !used.has(id))
    .map(id => {
      const view = pictureView('cover', id, '')
      return { kind: 'cover' as PictureKind, value: id, src: view.kind === 'image' ? view.src : '', pos: view.kind === 'image' ? view.pos : '50% 38%' }
    })
  return [...sets, ...covers].slice(0, 8)
}

export function pictureCard(env: CardsEnv): CardSpec {
  const current = env.data.profile?.picture
  let chosen = current && (current.kind === 'set' || current.kind === 'cover') ? `${current.kind}:${current.value}` : ''
  let status = ''
  return {
    id: 'picture',
    label: CARDS_COPY.choosePicture,
    render: card => {
      const grid = el('div', { className: 'tc-grid4', role: 'radiogroup', 'aria-label': CARDS_COPY.choosePicture, dataset: { testid: 'picture-grid' } })
      for (const choice of pictureChoices()) {
        const key = `${choice.kind}:${choice.value}`
        const option = el('button', { type: 'button', role: 'radio', 'aria-checked': String(key === chosen), 'aria-label': choice.value, onclick: () => { chosen = key; card.refresh() } })
        option.style.backgroundImage = `url("${choice.src}")`
        option.style.backgroundPosition = choice.pos
        grid.append(option)
      }
      const use = button(CARDS_COPY.useThisPicture, 'fill', async () => {
        if (!chosen) return
        const [kind, value] = chosen.split(':') as [PictureKind, string]
        use.disabled = true
        const saved = await saveProfile(env.session.token, { picture: { kind, value }, setUp: true })
        if (saved.ok) {
          env.data.profile = saved.profile
          env.changed()
          card.stack.back()
        } else {
          status = saved.message || CARDS_COPY.saveFailed
          card.refresh()
        }
      }, 'picture-use')
      use.classList.add('is-wide')
      if (!chosen) use.disabled = true
      const body = el('div', { className: 'tc-body is-tight' }, el('div', { className: 'tc-g' }, grid), use, statusLine(status))
      status = ''
      return [navBar(card, CARDS_COPY.choosePicture), body]
    },
  }
}

export function backgroundCard(env: CardsEnv): CardSpec {
  let status = ''
  return {
    id: 'background',
    label: CARDS_COPY.chooseBackground,
    render: card => {
      const current = env.data.profile?.background
      const grid = el('div', { className: 'tc-grid4 is-scenes', role: 'radiogroup', 'aria-label': CARDS_COPY.chooseBackground, dataset: { testid: 'background-grid' } })
      const choices: Array<{ kind: BackgroundKind; value: string | null; src: string }> = [
        ...PICTURE_SETS.map(set => ({ kind: 'set' as BackgroundKind, value: set.id, src: set.room })),
        { kind: 'library', value: null, src: LIBRARY_BACKGROUND },
      ]
      for (const choice of choices) {
        const on = current ? current.kind === choice.kind && (choice.kind === 'library' || current.value === choice.value) : choice.kind === 'library'
        const option = el('button', {
          type: 'button', role: 'radio', 'aria-checked': String(on), 'aria-label': choice.value ?? 'library',
          onclick: async () => {
            const saved = await saveProfile(env.session.token, { background: { kind: choice.kind, value: choice.value }, setUp: true })
            if (saved.ok) { env.data.profile = saved.profile; env.changed(); card.stack.back() } else { status = saved.message || CARDS_COPY.saveFailed; card.refresh() }
          },
        })
        option.style.backgroundImage = `url("${choice.src}")`
        grid.append(option)
      }
      grid.style.gridTemplateColumns = 'repeat(3, 1fr)'
      const body = el('div', { className: 'tc-body is-tight' }, el('div', { className: 'tc-g' }, grid), statusLine(status))
      status = ''
      return [navBar(card, CARDS_COPY.chooseBackground), body]
    },
  }
}

export { followBackCount, CardStack }
