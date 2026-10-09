/**
 * A reader's public profile page, tinct.app/@handle (social ship 3), as HTML.
 * Pure: the Worker renders it for a first paint (a signed-out visitor sees the
 * page as a stranger would), and the page's own script renders the same view
 * again for a signed-in visitor, with their follow state.
 *
 * The account cards' look (docs/social/cards.html "A reader's profile",
 * CARDS-BRIEF.md): the reader's background as a banner, picture, name, Follow;
 * last 7 days, this year and finished; Reading now and Finished, as far as the
 * reader allows; a Report link.
 * Never shown: email, highlights, notes, chats, Talk.
 */
import type { Relation } from './profileRules'
import { PRIVATE_BOOK_ID } from '../readingTime/model'

export interface ProfileBook {
  bookId: string
  title: string
  cover: string | null
  /** "Ch. 9 of 26" for a book in progress. */
  progress: string | null
  /** "4 h 10 m", only when the reader shows their reading time. */
  hours: string | null
}

export interface ProfilePicture {
  /** A library cover detail or a stored photo; null = the initial. */
  src: string | null
  pos: string
  cover: boolean
  /** A stored photo: the page loads it with the visitor's sign-in (owner, or a friend of a Friends profile). */
  private: boolean
  initial: string
}

export interface ProfilePageData {
  handle: string
  name: string
  link: string
  picture: ProfilePicture
  banner: { src: string; private: boolean }
  /** null = a signed-out visitor. */
  relation: Relation | null
  /** The owner follows the visitor (remove follower is offered). */
  followsYou: boolean
  /** Friends-only profile seen by a non-friend: the card only. */
  limited: boolean
  time: { last7: string; year: string } | null
  readingNow: ProfileBook[] | null
  finished: ProfileBook[] | null
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export function esc(value: string): string {
  return String(value).replace(/[&<>"']/g, char => ESC[char])
}

/** CSS url() for a path we built ourselves (library assets or our own image route). */
function cssUrl(src: string): string {
  return `url(&quot;${esc(src).replace(/[()]/g, '')}&quot;)`
}

export function avatarHtml(picture: ProfilePicture, className = 'tinct-avatar'): string {
  if (!picture.src) return `<span class="${className}" data-kind="initial">${esc(picture.initial)}</span>`
  if (picture.private) {
    return `<span class="${className}" data-kind="photo" data-private-src="${esc(picture.src)}" data-initial="${esc(picture.initial)}">${esc(picture.initial)}</span>`
  }
  const size = picture.cover ? '260% auto' : 'cover'
  return `<span class="${className}" data-kind="${picture.cover ? 'cover' : 'photo'}" style="background-image:${cssUrl(picture.src)};background-position:${esc(picture.pos)};background-size:${size}"></span>`
}

/** The follow button for this visitor and relation: black for an action, outlined for a state (cards.html). */
export function followButtonHtml(data: Pick<ProfilePageData, 'relation' | 'handle'>): string {
  const { relation, handle } = data
  if (relation === null) {
    return `<a class="primary" data-testid="profile-follow" href="/sign-in?returnTo=${encodeURIComponent(`/@${handle}`)}">Follow</a>`
  }
  if (relation === 'self') return `<a class="secondary" data-testid="profile-edit" href="/library?card=settings">Edit profile</a>`
  if (relation === 'friend') return `<button type="button" class="secondary" data-action="unfollow" data-testid="profile-follow" aria-pressed="true">Friends</button>`
  if (relation === 'follower') return `<button type="button" class="secondary" data-action="unfollow" data-testid="profile-follow" aria-pressed="true">Following</button>`
  if (relation === 'followed') return `<button type="button" class="primary" data-action="follow" data-testid="profile-follow">Follow back</button>`
  return `<button type="button" class="primary" data-action="follow" data-testid="profile-follow">Follow</button>`
}

/** "Ch. 9 of 26" as a fraction for the thin progress line. */
function chapterShare(progress: string | null): number | null {
  const match = /Ch\.\s*(\d+)\s+of\s+(\d+)/.exec(progress || '')
  return match && Number(match[2]) > 0 ? Math.min(1, Number(match[1]) / Number(match[2])) : null
}

function bookRowHtml(book: ProfileBook, value: string | null, line: boolean): string {
  const share = line ? chapterShare(book.progress) : null
  const title = `<span class="l"><span class="t">${esc(book.title)}</span>${share !== null ? `<span class="pr"><i style="width:${Math.round(share * 100)}%"></i></span>` : ''}</span>`
  const inner = `${title}${value ? `<span class="v">${esc(value)}</span>` : ''}`
  // A reader's own book: "a private book", no link.
  if (book.bookId === PRIVATE_BOOK_ID) return `<span class="r${share !== null ? ' bk' : ''}" data-private-book>${inner}</span>`
  return `<a class="r${share !== null ? ' bk' : ''}" href="/read/${esc(book.bookId)}">${inner}</a>`
}

function shelfHtml(title: string, books: ProfileBook[], empty: string, testId: string, inProgress: boolean): string {
  const rows = books.map(book => bookRowHtml(book, inProgress ? book.progress ?? book.hours : book.hours, inProgress)).join('')
  return `<section class="shelf" data-testid="${testId}"><h2 class="gh">${esc(title)}</h2>${books.length ? `<div class="g">${rows}</div>` : `<p class="foot">${esc(empty)}</p>`}</section>`
}

/** Everything under the banner: the reader's card (cards.html "A reader's profile"). */
export function profileMainHtml(data: ProfilePageData): string {
  const parts: string[] = []
  const sub = data.followsYou && data.relation !== 'self' && data.relation !== null ? 'Follows you' : data.link
  parts.push(`<div class="who">${avatarHtml(data.picture)}<span class="nm"><h1 class="name">${esc(data.name)}</h1><span>${esc(sub)}</span></span><div class="actions" data-actions>${followButtonHtml(data)}</div></div>`)
  parts.push('<div class="body">')
  // The follower view (a reader who follows you, whose profile you may not otherwise
  // see) is the name and link alone: it says nothing about what they share.
  if (!data.limited) {
    const facts: string[] = []
    if (data.time) facts.push(`<div><b>${esc(data.time.last7)}</b><span>last 7 days</span></div>`, `<div><b>${esc(data.time.year)}</b><span>this year</span></div>`)
    if (data.finished) facts.push(`<div><b>${data.finished.length}</b><span>finished</span></div>`)
    if (facts.length) parts.push(`<div class="g" data-testid="profile-time"><div class="three">${facts.join('')}</div></div>`)
    if (data.readingNow) parts.push(shelfHtml('Reading now', data.readingNow, 'Nothing in progress.', 'profile-reading-now', true))
    if (data.finished) parts.push(shelfHtml('Finished', data.finished, 'No finished books yet.', 'profile-finished', false))
  }
  const links: string[] = []
  if (data.relation !== 'self') {
    if (data.followsYou && data.relation !== null) links.push('<button type="button" data-action="remove-follower">Remove follower</button>')
    if (data.relation !== null) links.push('<button type="button" data-action="block">Block</button>')
    links.push(data.relation === null
      ? `<a href="/sign-in?returnTo=${encodeURIComponent(`/@${data.handle}`)}" data-testid="profile-report">Report</a>`
      : '<button type="button" data-action="report" data-testid="profile-report">Report</button>')
  }
  parts.push(`<p class="foot fine">Highlights, notes and conversations are never shown to anyone.</p>`)
  if (links.length) parts.push(`<nav class="foot more" aria-label="More">${links.join('<span aria-hidden="true"> · </span>')}</nav>`)
  parts.push('<p class="foot status" role="status" data-status></p>')
  parts.push('</div>')
  return parts.join('')
}

/** The account cards' grammar (src/cards/cards.css) as a page: greyscale, white groups, Playfair only for the name and figures. */
export const PROFILE_PAGE_CSS = `
:root{--ground:#f2f2f2;--cell:#fff;--ink:#0a0a0a;--sec:#8a8a8a;--ter:#c2c2c2;--sep:#e1e1e1;--track:#e6e6e6;--fill:#0a0a0a;--disc:rgba(255,255,255,.9);--sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,system-ui,sans-serif;--play:"Playfair Display",Georgia,serif;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--ground:#000;--cell:#1c1c1c;--ink:#f5f5f5;--sec:#8d8d8d;--ter:#5a5a5a;--sep:#2c2c2c;--track:#333;--fill:#f5f5f5;color-scheme:dark}}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--ground);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased}a{color:inherit}button{font:inherit;color:inherit;cursor:pointer}
.profile{max-width:440px;margin:0 auto;padding-bottom:calc(32px + env(safe-area-inset-bottom));position:relative;overflow:hidden}
.banner{position:relative;height:106px;background:var(--scene,none) center 45%/cover;background-color:#3a3a3a}
.banner::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.25),transparent 50%)}
.top{position:absolute;top:calc(16px + env(safe-area-inset-top));left:16px;z-index:2}
.top .back{width:32px;height:32px;border-radius:50%;background:var(--disc);color:#0a0a0a;display:grid;place-items:center;text-decoration:none}
.top .back svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
main{position:relative}
.who{display:flex;align-items:flex-end;gap:14px;margin-top:-14px;padding:0 16px}
.tinct-avatar{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:50%;background-color:#6a6a6a;background-repeat:no-repeat;color:#fff;font:700 15px/1 var(--play);overflow:hidden;flex:none}
.who .tinct-avatar{width:76px;height:76px;font-size:28px;box-shadow:0 0 0 4px var(--ground)}
.tinct-avatar[data-kind=cover],.tinct-avatar[data-kind=photo]{background-color:#d0d0d0}
.nm{padding-bottom:6px;line-height:1.2;min-width:0;flex:1}
.name{font:700 24px var(--play);letter-spacing:-.01em;margin:0;font-variant-numeric:lining-nums;overflow-wrap:anywhere}
.nm span{font-size:15px;color:var(--sec)}
.actions{margin-bottom:10px;flex:none}
.primary,.secondary{display:inline-block;font:600 15px var(--sans);border-radius:999px;padding:7px 14px;white-space:nowrap;text-decoration:none;border:0}
.primary{background:var(--fill);color:var(--cell)}
.secondary{background:none;color:var(--ink);box-shadow:inset 0 0 0 1.5px var(--ter)}
.primary:disabled,.secondary:disabled{opacity:.55}
.body{padding:28px 16px 24px;display:flex;flex-direction:column;gap:32px}
.g{background:var(--cell);border-radius:12px;overflow:hidden}
.gh{font:400 13px var(--sans);color:var(--sec);margin:0 0 8px 16px}
.three{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr))}
.three div{padding:14px 8px 16px;text-align:center;position:relative}
.three div+div::after{content:"";position:absolute;left:0;top:16px;bottom:16px;width:1px;background:var(--sep)}
.three b{display:block;font:700 20px var(--play);font-variant-numeric:lining-nums;white-space:nowrap}
.three span{font-size:13px;color:var(--sec)}
.r{display:flex;align-items:center;gap:12px;min-height:48px;padding:0 16px;position:relative;font-size:17px;letter-spacing:-.01em;text-decoration:none;color:var(--ink)}
.r+.r::before{content:"";position:absolute;top:0;left:16px;right:0;height:1px;background:var(--sep)}
.r.bk{min-height:60px}
.r .l{flex:1;min-width:0;display:flex;flex-direction:column}
.r .t{padding:12px 0;overflow-wrap:anywhere}.r.bk .t{padding:14px 0 0}
.r .v{color:var(--sec);white-space:nowrap;font-variant-numeric:tabular-nums}
.pr{height:4px;border-radius:2px;background:var(--track);overflow:hidden;margin:7px 0 14px}.pr i{display:block;height:100%;background:var(--fill)}
.foot{font-size:13px;color:var(--sec);line-height:1.45;margin:0 16px}
.fine{margin-top:-8px}
.more{margin-top:-24px}
.more a,.more button{border:0;background:none;padding:6px 2px;color:var(--sec);text-decoration:underline;text-underline-offset:3px;font:inherit}
.status:empty{display:none}
.missing{padding:96px 16px 0;text-align:center;display:flex;flex-direction:column;gap:16px;align-items:center}
.missing h1{font:700 24px var(--play);margin:0}.missing p{color:var(--sec);font-size:17px;margin:0}
.loading main{visibility:hidden}
.scrim{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:5}
.sheet{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(100%,440px);background:var(--ground);border-radius:20px 20px 0 0;padding:16px 16px calc(20px + env(safe-area-inset-bottom));z-index:6}
.sheet h2{margin:0 0 6px;font:700 20px var(--play)}.sheet p{margin:0 0 14px;color:var(--sec);font-size:15px}
.sheet .item{display:flex;align-items:center;width:100%;min-height:48px;padding:0 16px;border:0;background:var(--cell);text-align:left;font-size:17px;color:var(--ink);position:relative}
.sheet .item:first-of-type{border-radius:12px 12px 0 0}.sheet .item:last-of-type{border-radius:0 0 12px 12px}.sheet .item:only-of-type{border-radius:12px}
.sheet .item+.item::before{content:"";position:absolute;top:0;left:16px;right:0;height:1px;background:var(--sep)}
.sheet .cancel{display:block;width:100%;min-height:48px;margin-top:12px;border:0;border-radius:12px;background:var(--cell);color:var(--ink);font:500 17px var(--sans)}
@media(min-width:700px){.profile{margin-top:40px;border-radius:18px;background:var(--ground);box-shadow:0 20px 50px rgba(0,0,0,.18)}}
`

const BACK_ICON = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M9 2.5 4.5 7 9 11.5"/></svg>'

/** The whole page. `loading`: a signed-in visitor (cookie) gets an empty page their script fills in, so a blocked visitor never sees it. */
export function profileDocument(data: ProfilePageData | null, options: { handle: string; loading: boolean; markers?: string }): string {
  const title = data ? `${data.name} (@${data.handle}) · Tinct` : 'Tinct'
  const banner = data && !data.banner.private ? ` style="--scene:${cssUrl(data.banner.src)}"` : ''
  const body = data && !options.loading
    ? `<main data-main>${profileMainHtml(data)}</main>`
    : '<main data-main></main>'
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow, noarchive">
<meta name="theme-color" content="#f2f2f2" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
<title>${esc(title)}</title>
<link rel="icon" href="/favicon.svg">
<link rel="stylesheet" href="/fonts/tinct-fonts.css">
<style>${PROFILE_PAGE_CSS}</style>
${options.markers ?? ''}
<script type="module" src="/lab/display-profile.js"></script>
</head>
<body>
<div id="tinct-profile" class="profile${options.loading ? ' loading' : ''}" data-handle="${esc(options.handle)}" data-state="${options.loading ? 'loading' : data ? 'ready' : 'missing'}">
<header class="top"><a class="back" href="/library" aria-label="Back" data-back>${BACK_ICON}</a></header>
<div class="banner" data-banner${banner}></div>
${body}
</div>
<script type="module" src="/lab/social-profile.js"></script>
</body>
</html>`
}

/**
 * The page for a handle nobody may see (missing, Only me, a Friends profile to
 * a non-friend, hidden or blocked): the same in every case. With `follow` (the
 * Follow button for a well-formed link) a reader can follow from a link they
 * were given; the button is the same whoever, if anyone, has the link, and a
 * Friends profile opens once they follow each other.
 */
/** A reader the visitor blocked: what that means, and Unblock (so a block is never permanent by accident). */
export function profileBlockedHtml(): string {
  return '<section class="missing" data-testid="profile-blocked"><h1>Blocked</h1><p>You and this reader no longer see each other on Tinct.</p><div class="actions" data-actions><button type="button" class="secondary" data-action="unblock" data-testid="profile-unblock">Unblock</button></div><p class="foot status" role="status" data-status></p></section>'
}

export function profileMissingHtml(follow?: string): string {
  const actions = follow ? `<div class="actions" data-actions>${follow}</div>` : ''
  return `<section class="missing" data-testid="profile-missing"><h1>No profile here</h1><p>This link does not lead to a profile you can see.</p>${actions}<a class="secondary" href="/library">Open the library</a><p class="foot status" role="status" data-status></p></section>`
}
