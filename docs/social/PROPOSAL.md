# Readers, reading time and the leaderboard: proposal

**Status:** approved by Anders on 7 October 2026, including every decision below, with one change: the leaderboard uses the last 7 days, not a calendar week. Brief for the coding agent: `CODER-BRIEF.md`. Spec only; no app code.
**Mockup:** `mockup.html` in this folder (open it in a browser). The same page is Anders's private preview "Tinct Reading Together".

## The idea in one paragraph
Reading time becomes the number Tinct is built around. Every reader sees their hours, the account sheet in the reader shows this week's hours, and readers who want to can have a profile, follow friends and appear on a weekly leaderboard of time spent reading. Everything is private unless the reader chooses otherwise, and highlights, notes and conversations are never shown to anyone. Sign-up gains one optional step to create the profile.

## What we have today (main, 7 October)
| Area | Today | What it means for this proposal |
|---|---|---|
| Reading time | `labReadingYear.ts`: seconds count only while the reader is active (or audio plays) and the tab is visible; pages read forward; books with pages read. Synced per account as one `reading-year-2026` row in `user_data`, merged per device. | A good base for the reader's own numbers. **Not enough for a leaderboard:** the browser writes the totals (easy to inflate), there are only yearly totals (no weeks or days), and there is no time per book. |
| "Books" | Counts books with any page read. | Shows as "books" in the sheet, which reads as "books finished". Needs a real "finished" count (the position record already keeps finished chapters). |
| Account sheet (reader) | Email, Premium/Free, AI usage bar (behind its switch), This year: hours, pages, books; Manage account; Reset password. | Becomes the doorway (below). |
| Account page (`/sign-in`, account mode) | Email, $5/month or $50/year plans, Return to library, Sign out. | Gets profile and privacy settings on desktop. |
| Sign-up (`/sign-in`, create mode) | Google (Apple and GitHub hidden), email + password + confirm password, unticked "Email me now and then about my reading and Tinct. Optional; stop any time." Then a "Welcome to Tinct" screen. No email confirmation (decision of 9 May). | The welcome screen becomes the profile step. |
| Profiles table | Billing, AI allowance, `email_opt_in` + `email_opt_in_at`. No name, picture, handle or visibility. | Needs new columns (schema approval). |
| Analytics | Funnel events and per-reader AI/audio cost ledger shipped (#279). | Lets us measure whether this changes retention. |
| Sharing | Share a highlight as an image (#326, #328). | The same renderer makes the reading card. |
| Anonymous accounts | Not built. | Signed-out readers keep device-only hours; nothing social. |

## The proposal

### 1. Reading time you can trust (foundation)
- **Server ledger:** a small table of reading time per reader, per day and per book, split into reading and listening seconds. The reader sends a heartbeat about once a minute while it already counts time today (active, visible, or audio playing); the Worker adds it.
- **The Worker sets the limits, not the browser:** at most one heartbeat per ~50 seconds per reader, at most 60 seconds credited each, at most 16 hours a day. Listening counts only while narration is actually playing.
- **One source for every number:** the sheet, Your reading, profiles and the leaderboard all read the ledger. The existing yearly row stays as the signed-out and offline fallback and is merged in, so no reader loses time already counted.
- **Books finished** = reached the end of the last chapter, from the position record. Replace "books" (opened) with "finished" everywhere.
- **The last 7 days** (today plus the six days before, by the reader's own date) is the window for the sheet, profiles and the leaderboard, so the board is never empty after a reset and always moves. The 12-week chart on Your reading uses calendar weeks, Monday to Sunday.

### 2. The account sheet becomes the doorway (reader look)
Inside a book, everything stays in the reader's look (Paper, Night, e-ink). The sheet changes to:
- **Header:** picture, name, "tinct.app/name · who can see you", Premium/Free, and right under it **AI credits** as a slim bar ("15% left · renews 5 Nov"). The email moves to Manage account. The reader's t menu shows the same: picture, last-7-days hours and AI credits in its first row.
- **Last 7 days:** hours in large type, a 7-day bar, then "#3 among friends · 6-day streak · 41 h since July".
- **Three new rows:** Your reading, Leaderboard, Profile and privacy. Then AI use and Manage account as today.
- **Signed out:** hours on this device, and "Create a free account to keep your reading time and join the leaderboard."

### 3. Pages outside the book (library look)
These open in the library's night-green look with its covers. Your picture in the library top bar opens **You**, with two tabs (Reading, Profile) and AI credits at the top; the leaderboard is its own page, reached from a "#3 among friends ›" line on Reading, the sheet and the menu. Profile links are plain `tinct.app/anders`, without the @: handles can never match a book id or a route, and new books get ids that avoid taken handles (we choose book ids).
- **Your reading:** total hours as the hero ("41 h 20 m … about six Frankensteins"), hours per week for 12 weeks, this week's change, rank among friends, streak; books finished, chapters, listening, longest streak; Reading now and Finished, each cover with the hours spent in that book. Share button.
- **Leaderboard, a page of its own** (not a tab, so it has room): reading time (reading + listening) over the last 7 days, updated at least hourly; the top three on a podium, roomy rows below. Tabs: **Friends** (people you follow who follow you back, plus you) and **Everyone** (public profiles that chose to appear). Your own row and rank always show, so it never looks empty. Tapping a reader opens their profile.
- **A reader's profile** (`tinct.app/name`): picture, name, handle, Follow; hours in the last 7 days and this year; Reading now and Finished, as far as that reader allows.
- **Profile and privacy:** picture, name, link, who can see you, three switches (what I'm reading, how much I read, appear on the leaderboard). Also on the desktop account page.

### 4. Profiles and privacy
- **Fields:** display name, unique handle (3–20 letters, digits, `_` or `.`; reserved words, routes and every book id blocked), picture, visibility, three switches.
- **Picture:** a detail from a library cover, your initial, your Google photo, or an upload.
- **Background:** every profile has a banner. Pick a library scene, or upload your own.
- **Uploads** (picture and background) show to you at once and to others after a check: in v1 a small approval queue in the admin view (volume is tiny), later an automatic check. Images are resized and stripped of location data.
- **Who can see you:** Only me / Friends / Everyone. **Default when the step is skipped: Only me.** Everyone needs an explicit tap and a confirmed email.
- **Never shown:** highlights, notes, chats, Talk, email address.
- **Follows:** one-way follow; "friends" are mutual follows. Unfollow, remove a follower and block are in v1. No reader search in v1: people find each other through profile links and the Everyone board.
- **Public profile pages are not indexed by search engines** in v1 (noindex), and have a Report link.
- **Names and handles** pass a word filter; the admin view can rename or hide a profile.

### 5. Sign-up
- **Step 1, create account:** as today. Consent line, Anders's wording plus the opt-out the law asks for at the moment of consent:
  > ☐ Email me about my reading progress and ideas for what to read next. Stop any time.

  Unticked, as now. Record the wording version with the consent.
- **Step 2, profile:** replaces "Welcome to Tinct. Your account is ready." Picture, name (prefilled from Google or the email), handle (suggested), who can see you (Friends preselected), Start reading, or Skip for now (Only me).
- **Email confirmation without a gate:** sign-up stays instant. The welcome email carries one-click "Confirm your email". Reading emails start, and a profile can go public, only after that click. Google sign-ups count as confirmed. This keeps the May decision and stops mail going to mistyped or someone else's addresses.

### 6. What the consent line covers
"My reading progress and ideas for what to read next" covers `keep-reading` and `next-book`. It does **not** clearly cover the sales part of the trial emails ("Would you like to keep your companion… $5 a month"). So:
- Trial reminders go to everyone as a short, factual notice about their account (when the trial ends, what changes, how to keep Premium). That is service mail.
- `keep-companion` / `companion-ready` keep their warm tone but drop the push; the checkout link stays. If Anders wants the full pitch, the line needs "…and offers from Tinct".

### 7. Sharing
The highlight renderer also makes a **reading card**: "Finished Frankenstein · 6 h 20 m", or the last 7 days' hours. It links to the reader's public profile if they have one, otherwise to the book.

## Data changes (need Anders's approval)
1. `reading_time` (reader, day, book, read seconds, listen seconds) plus the Worker heartbeat route.
2. Profile columns: display name, handle (unique), picture kind and value, background kind and value, upload review state, visibility, three switches, email confirmed at, consent wording version.
3. `follows` (follower, followed, created at) and `blocks`.
Row-level security: readers write only their own rows; public data is served by the Worker from views that apply each reader's choices.

## Releases (agent pace)
1. **Reading time** (about a day): ledger and heartbeat, finished books, the new "Last 7 days" block in the sheet, the Your reading page. No social parts yet.
2. **Profiles** (about a day): profile fields, sign-up step 2, Profile and privacy, soft email confirmation, new consent line.
3. **Social** (one to two days): follows, Friends/Everyone leaderboard, public profile pages, the reading card.
Later: reading a book together (friends' notes up to your page), reader search, automatic upload checks.

**Measure:** share of signed-in readers who open Your reading or the leaderboard weekly; week-2 and week-4 return rate for readers with at least one friend vs none; profiles created at sign-up vs skipped; share cards opened.

## Decisions (approved by Anders, 7 October 2026)
1. Approve the three data changes.
2. Default when the profile step is skipped: **Only me** (recommended).
3. Leaderboard counts reading **and** listening (recommended), or reading only.
4. ~~Leaderboard week: Monday to Sunday, Copenhagen time.~~ **Changed by Anders: the last 7 days, rolling.**
5. Public profiles not indexed by search engines in v1 (recommended).
6. Soft email confirmation as above (recommended).
7. Consent line as in section 5, and factual trial notices as in section 6 (recommended), or add "…and offers from Tinct".

## Also fixed in this pass
The approved lifecycle templates said $3 a month; they now say $5 a month, matching the live price (#320, #336).

## Revision, 7 October 2026 (Anders's review of the storyboards)
`flows.html` (fourth pass) supersedes the earlier navigation and look details above where they differ.
- **Reader menu unchanged.** No picture or numbers in it; its "Account" row is renamed **Profile** and opens the Profile sheet: picture, name and link; **AI credits as their own shelf** (percent left, bar, renewal date, See what you used, Top up); last 7 days with rank; two rows, You and friends, and Settings.
- **You** (from the library picture) is one page in shelves, like the library: AI credits, Your reading, Friends (rank line), Settings. **Tap your picture to change it**: a sheet with **sets** (a picture and background from the same book, e.g. Stoic, At sea, Florence), upload a photo, upload a background, Google photo, initial.
- **Friends** page with underlined tabs: Friends (podium leaderboard), Everyone, **Find**. Find = search public readers by name or tinct.app link, "Also reading your books" (public readers who show what they read), and Invite (copy link, share). Search and "also reading" only ever show readers set to Everyone; Friends-only readers are reached by their link.
- **Settings** is one page, grouped: Profile, Privacy, **Reading** (New books open in: Modern English or Human translations; Narrator), Emails (reading emails on/off), Account (Premium, email and password, sign out). Choices open tick lists with one plain line each.
- **Sign-up is three steps:** account (one password field with show/hide, no confirm field; the unticked consent line), profile (picture from a set or upload, name, who can see your reading), and **"Modern English or human translations?"** (Modern English / Human translations, where books written in English open as written), which sets "New books open in"; each book remembers its own switch. Then back on the same page with "Welcome, Anders. Your place is saved." The account prompt in the reader becomes "Save your place".
- **House rules:** no all-capitals labels; no pill toggles (tick lists, and underlined words for tabs); no pictures in top bars except the library's, which is the way in; plain wording.
- **Emails get the library look:** the book's painting on top, a serif title, one dark rounded button, no monospace. The PM session redoes the templates in `docs/lifecycle-emails/` to match.
