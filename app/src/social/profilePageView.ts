/**
 * A reader's public profile page, tinct.app/@handle (social ship 3), as HTML.
 * Pure: the Worker renders it for a first paint (a signed-out visitor sees the
 * page as a stranger would), and the page's own script renders the same view
 * again for a signed-in visitor, with their follow state.
 *
 * Library look (flows.html, mockup.html "A reader's profile"): the reader's
 * background as a banner, picture, name, link, Follow; Last 7 days and This
 * year; Reading now and Finished, as far as the reader allows; a Report link.
 * Never shown: email, highlights, notes, chats, Talk.
 */
import type { Relation } from './profileRules'

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

/** The follow button for this visitor and relation. */
export function followButtonHtml(data: Pick<ProfilePageData, 'relation' | 'handle'>): string {
  const { relation, handle } = data
  if (relation === null) {
    return `<a class="primary" data-testid="profile-follow" href="/sign-in?returnTo=${encodeURIComponent(`/@${handle}`)}">Follow</a>`
  }
  if (relation === 'self') return `<a class="secondary" data-testid="profile-edit" href="/you?view=settings&amp;returnTo=${encodeURIComponent(`/@${handle}`)}">Edit profile</a>`
  if (relation === 'friend') return `<button type="button" class="secondary" data-action="unfollow" data-testid="profile-follow" aria-pressed="true">Friends</button>`
  if (relation === 'follower') return `<button type="button" class="secondary" data-action="unfollow" data-testid="profile-follow" aria-pressed="true">Following</button>`
  if (relation === 'followed') return `<button type="button" class="primary" data-action="follow" data-testid="profile-follow">Follow back</button>`
  return `<button type="button" class="primary" data-action="follow" data-testid="profile-follow">Follow</button>`
}

function shelfHtml(title: string, books: ProfileBook[], empty: string, testId: string): string {
  const items = books.map(book => {
    const cover = book.cover
      ? `<img class="cover" src="${esc(book.cover)}" alt="" loading="lazy">`
      : `<span class="cover paper">${esc(book.title)}</span>`
    return `<a class="book" href="/read/${esc(book.bookId)}">${cover}<span class="meta"><i>${esc(book.progress || book.title)}</i>${book.hours ? `<span>${esc(book.hours)}</span>` : ''}</span></a>`
  }).join('')
  return `<section class="shelf" data-testid="${testId}"><h2>${esc(title)}</h2>${books.length ? `<div class="books">${items}</div>` : `<p class="empty">${esc(empty)}</p>`}</section>`
}

/** Everything under the banner. */
export function profileMainHtml(data: ProfilePageData): string {
  const parts: string[] = []
  parts.push(`<div class="head">${avatarHtml(data.picture)}<h1 class="name">${esc(data.name)}</h1><p class="link">${esc(data.link)}</p>`)
  parts.push(`<div class="actions" data-actions>${followButtonHtml(data)}</div>`)
  if (data.relation === 'friend') parts.push('<p class="note">Friends: you follow each other.</p>')
  else if (data.relation === 'followed') parts.push(`<p class="note">${esc(data.name)} follows you.</p>`)
  parts.push('</div>')
  if (data.limited) {
    parts.push(`<p class="quiet" data-testid="profile-limited">${esc(data.name)} shares their reading with friends. Friends are people who follow each other.</p>`)
  } else {
    if (data.time) {
      parts.push(`<div class="stats" data-testid="profile-time"><div><span>Last 7 days</span><strong>${esc(data.time.last7)}</strong></div><div><span>This year</span><strong>${esc(data.time.year)}</strong></div></div>`)
    }
    if (data.readingNow) parts.push(shelfHtml('Reading now', data.readingNow, 'Nothing in progress.', 'profile-reading-now'))
    if (data.finished) parts.push(shelfHtml(`Finished${data.finished.length ? ` · ${data.finished.length} ${data.finished.length === 1 ? 'book' : 'books'}` : ''}`, data.finished, 'No finished books yet.', 'profile-finished'))
  }
  const links: string[] = []
  if (data.relation !== 'self') {
    if (data.followsYou && data.relation !== null) links.push('<button type="button" data-action="remove-follower">Remove follower</button>')
    if (data.relation !== null) links.push('<button type="button" data-action="block">Block</button>')
    links.push(data.relation === null
      ? `<a href="/sign-in?returnTo=${encodeURIComponent(`/@${data.handle}`)}" data-testid="profile-report">Report</a>`
      : '<button type="button" data-action="report" data-testid="profile-report">Report</button>')
  }
  parts.push(`<p class="fine">Highlights, notes and conversations are never shown to anyone.</p>`)
  if (links.length) parts.push(`<nav class="more" aria-label="More">${links.join('<span aria-hidden="true"> · </span>')}</nav>`)
  parts.push('<p class="status" role="status" data-status></p>')
  return parts.join('')
}

export const PROFILE_PAGE_CSS = `
:root{color-scheme:dark;--bg:#10150f;--raised:#172015;--sheet:#1a2318;--ink:#eee7d0;--sage:#b1bba4;--dim:#7f8a76;--gold:#c2aa74;--gold-hi:#e8d59e;--line:rgba(238,231,208,.13);--glass:rgba(238,231,208,.07);--glass-line:rgba(238,231,208,.16);--serif:'EB Garamond',Georgia,"Times New Roman",serif;--sans:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--bg);color:var(--ink);font-family:var(--serif)}a{color:inherit}button{font:inherit;color:inherit;cursor:pointer}
.profile{max-width:640px;margin:0 auto;padding-bottom:calc(40px + env(safe-area-inset-bottom))}
.top{display:flex;align-items:center;gap:10px;min-height:56px;padding:env(safe-area-inset-top) 12px 0;position:absolute;inset:0 0 auto 0;z-index:2}
.top .back{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;text-decoration:none;font:400 20px var(--sans)}
.top .logo{font-size:26px;letter-spacing:-1.4px;text-decoration:none}
.banner{position:relative;height:190px;background:linear-gradient(0deg,var(--bg) 3%,rgba(16,21,15,.15) 60%,rgba(16,21,15,.5)),var(--scene,none) center 35%/cover;background-color:var(--raised)}
main{padding:0 16px}
.head{display:flex;flex-direction:column;align-items:center;gap:4px;margin-top:-56px;text-align:center;position:relative}
.tinct-avatar{display:inline-grid;place-items:center;width:44px;height:44px;border-radius:50%;background-color:var(--raised);background-repeat:no-repeat;color:var(--gold-hi);font:400 18px/1 var(--serif);box-shadow:0 0 0 1px var(--glass-line);overflow:hidden;flex:none}
.tinct-avatar[data-kind=initial]{background-image:linear-gradient(150deg,#2a3a2a,#18241a)}
.head .tinct-avatar{width:96px;height:96px;font-size:38px;box-shadow:0 0 0 3px var(--bg)}
.name{margin:8px 0 0;font-size:30px;font-weight:400;letter-spacing:-.02em}
.link{margin:0;color:var(--sage);font-size:15px;font-style:italic}
.actions{display:flex;gap:10px;justify-content:center;margin:16px 0 4px}
.primary,.secondary{display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:120px;padding:0 24px;border-radius:999px;font:600 15px var(--sans);text-decoration:none}
.primary{border:0;background:var(--ink);color:var(--bg)}
.secondary{border:1px solid var(--glass-line);background:transparent;color:var(--ink)}
.primary:disabled,.secondary:disabled{opacity:.6}
.note{margin:6px 0 0;color:var(--sage);font-size:15px;font-style:italic}
.quiet{margin:22px 0 0;padding:14px 16px;border:1px solid var(--glass-line);border-radius:14px;background:var(--glass);font-size:17px;line-height:1.45;text-align:center}
.stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:24px 0 0}
.stats div{border:1px solid var(--glass-line);border-radius:14px;background:var(--glass);padding:12px 14px;text-align:center}
.stats span{display:block;color:var(--sage);font:400 13px var(--sans)}
.stats strong{display:block;margin-top:4px;font-size:30px;font-weight:400;letter-spacing:-.02em}
.shelf{margin-top:28px}
.shelf h2{margin:0 0 12px;font:700 17px var(--sans)}
.books{display:flex;gap:14px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px}
.book{flex:0 0 auto;width:112px;text-decoration:none}
.cover{display:block;width:112px;aspect-ratio:2/3;border-radius:2px;object-fit:cover;background:#253026;box-shadow:0 10px 20px #0007}
.paper{display:flex;align-items:center;justify-content:center;padding:10px;text-align:center;font-size:15px;line-height:1.2}
.meta{display:flex;justify-content:space-between;gap:6px;margin-top:8px;font-size:13px}
.meta i{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--sage)}.meta span{flex:0 0 auto;white-space:nowrap}
.empty{margin:0;color:var(--sage);font-style:italic}
.fine{margin:32px 0 0;color:var(--dim);font-size:14px;font-style:italic;text-align:center}
.more{margin:10px 0 0;text-align:center;color:var(--dim);font:400 14px var(--sans)}
.more a,.more button{border:0;background:none;padding:6px 4px;color:var(--sage);text-decoration:underline;text-underline-offset:3px;font:inherit}
.status{min-height:1.2em;margin:12px 0 0;text-align:center;color:var(--gold-hi);font:400 14px var(--sans)}
.missing{max-width:520px;margin:20vh auto 0;padding:0 16px;text-align:center}
.missing h1{font-size:30px;font-weight:400;margin:0 0 10px}.missing p{color:var(--sage);font-size:18px;margin:0 0 20px}
.loading main{visibility:hidden}
.scrim{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:5}
.sheet{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(100%,560px);background:var(--sheet);border-radius:22px 22px 0 0;box-shadow:0 -18px 40px rgba(0,0,0,.5);padding:14px 16px calc(20px + env(safe-area-inset-bottom));z-index:6}
.sheet h2{margin:0 0 6px;font:700 17px var(--sans)}.sheet p{margin:0 0 10px;color:var(--sage);font-size:15px}
.sheet .item{display:flex;justify-content:space-between;align-items:center;width:100%;min-height:48px;padding:10px 0;border:0;border-bottom:1px solid var(--line);background:transparent;text-align:left;font-size:17px;color:var(--ink)}
.sheet .item:first-of-type{border-top:1px solid var(--line)}
.sheet .cancel{display:block;width:100%;min-height:44px;margin-top:8px;border:0;background:transparent;color:var(--sage);font:15px var(--serif)}
@media(min-width:900px){.profile{padding-top:24px}.banner{border-radius:18px;overflow:hidden;height:240px}.top{position:static;padding:0 0 8px}.head{margin-top:-64px}}
`

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
<meta name="theme-color" content="#10150f">
<title>${esc(title)}</title>
<link rel="icon" href="/favicon.svg">
<link rel="stylesheet" href="/fonts/tinct-fonts.css">
<style>${PROFILE_PAGE_CSS}</style>
${options.markers ?? ''}
<script type="module" src="/lab/display-profile.js"></script>
</head>
<body>
<div id="tinct-profile" class="profile${options.loading ? ' loading' : ''}" data-handle="${esc(options.handle)}" data-state="${options.loading ? 'loading' : data ? 'ready' : 'missing'}">
<header class="top"><a class="back" href="/library" aria-label="Back" data-back>←</a><a class="logo" href="/library">tinct</a></header>
<div class="banner" data-banner${banner}></div>
${body}
</div>
<script type="module" src="/lab/social-profile.js"></script>
</body>
</html>`
}

/** The page for a handle nobody may see (missing, Only me, hidden or blocked): the same as a missing one. */
export function profileMissingHtml(): string {
  return '<section class="missing" data-testid="profile-missing"><h1>No profile here</h1><p>This link does not lead to a profile you can see.</p><a class="primary" href="/library">Open the library</a></section>'
}
