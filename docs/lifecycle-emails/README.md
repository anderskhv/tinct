# Lifecycle emails: approved copy, ready to wire

**Approved by Anders, 30 September 2026; redesigned 7 October 2026** in the library's look (the book's painting on top, a serif title, one dark rounded button, plain sans footer, no monospace and no capital-letter labels), with factual trial notices in place of the sales emails. This folder is content only: templates, sample data and rules. The Worker does the sending (Brevo, `app/src/worker/routes/emails.ts`); that code belongs to the coding agent.

- `templates/*.html`: email-client-safe HTML (table layout, inline styles, 600px, Georgia fallback, hidden preheader, light colour scheme, bulletproof button).
- `templates/*.txt`: the plain-text part. Send both (`htmlContent` + `textContent`).
- `sample-data.json`: example values for every variable. All templates fill with no leftover `{{…}}`.
- "Your next book" content (quotes, pairings, reasons) lives in `books/wip/reader-acclaim/`.

## The emails

| Template | Kind | Subject | Preheader | Trigger | Suppression |
|---|---|---|---|---|---|
| `welcome` | Service | Welcome to Tinct | Your place in `{{book_title}}` is saved. | Email sign-up (event-driven) | Real accounts only. Carries the one-click confirm link |
| `welcome-google` | Service | Welcome to Tinct | Your place in `{{book_title}}` is saved. | Google sign-up (already confirmed) | Real accounts only |
| `keep-reading` / `keep-reading-with-question` | Opt-in | `{{book_title}}` | Where you left off. | 3 days without reading a started book | Opted in and email confirmed. At most weekly; **stop after 2 ignored**; then one stalled `next-book` for that book, then nothing |
| `next-book` / `next-book-classic-lead` | Opt-in | From `pairings.json` (`subject`), matched to the lead used | Target book hook | Finished a book, or 2 ignored `keep-reading` emails | Opted in and confirmed. Eligibility rules in `pairings.json` |
| `trial-ending` | Service | Your free month ends on `{{trial_end_date}}` | Reading stays free. | Trial day 25, every trial reader | Only once checkout works |
| `trial-ended` | Service | Your free month has ended | Every book is still yours to read. | Trial day 30, not subscribed | Only once checkout works |
| `announce` | Service (one-off) | Add any book to Tinct, plus a privacy update | More than 120,000 free classics… | Admin-triggered (`POST /api/admin/announce-email`) | Once per reader per campaign. Feature rows marked `<!-- feature: … -->` can be dropped at send time |

`keep-companion`, `keep-companion-light` and `companion-ready` are **retired** (7 October): the consent line covers reading progress and next-book ideas, not sales, so trial mail is a factual notice that goes to everyone. The automated day-7 check-in stays dropped; Anders writes those notes by hand from the reader dashboard.

## Global rules
- **From:** "Anders at Tinct" `<contact@tinct.app>`, with Reply-To set to Anders's own inbox. Replies are read.
- **Quiet readers only:** send nothing but `welcome` and the trial notices to someone who read in the last 48 hours.
- **Frequency:** at most one lifecycle email every 3 days per reader, and none between 21:00 and 08:00 in the reader's time zone (default Europe/Copenhagen).
- **Trial clock:** starts at real sign-up, not at anonymous-account creation.
- **Idempotency:** log every send (user, template, book, sent_at) and never send the same template/book pair twice.
- **Footers:** opt-in emails end with the sender line and "Stop reading emails" (`{{unsubscribe_url}}`); service emails say "You're getting this because you have a Tinct account." and the sender line.
- **Test gate:** keep the existing `isLifecycleTestRecipient` pause until Anders switches real sending on; test with the `tinct{n}@fastmail.com` aliases.

## Variables
Escape every variable as HTML, except `opening_line` and `month_summary`, which carry `<em>` for book titles. The `.txt` versions get the same values with tags stripped. If `month_summary` is empty (under an hour of use), drop its paragraph.

| Variable | Used in | Meaning |
|---|---|---|
| `subject` | all | The subject line (also the HTML `<title>`) |
| `sender_address` | all | "Tinct, Copenhagen, Denmark" |
| `unsubscribe_url` | opt-in emails | Per-reader signed link that switches off reading emails with one click |
| `first_name` | welcome | From Google, or the profile name |
| `confirm_url` | welcome | One-click email confirmation (signed, single use) |
| `book_title`, `continue_url` | welcome, keep-reading | The last-read book, and a reader link that resumes it (the app restores the place; the email never states it) |
| `art_url`, `art_alt` | welcome, keep-reading, next-book | The book's library painting as a hosted JPEG, cropped landscape to 1200 × 600 (the top of the painting), ≤150 KB; for next-book, the target book's painting. Welcome without a book uses the library hero |
| `recap` | keep-reading | Existing recap text, cut off at the reader's place (spoiler-safe) |
| `next_chapter_label`, `question` | keep-reading-with-question | Optional; only where a reviewed per-chapter question exists |
| `opening_line` | next-book | "You finished <em>X</em>." or the stalled line: "Not every book suits every moment. If <em>X</em> has stalled, this one may be the better fit for now." |
| `target_title`, `target_author`, `hook`, `start_url` | next-book | From the library introduction for the target book |
| `lead_quote`, `lead_label`, `lead_person`, `lead_context` | next-book | From `cards.json`. If a card has `display`, put that text in `lead_quote` and leave `lead_label` empty |
| `reason` | next-book | `pairings.json` |
| `classic_quote`, `classic_source`, `classic_context` | next-book | From the onboarding `acclaim` entry named in `pairings.json` |
| `trial_end_date`, `checkout_url` | trial notices | Local date ("30 October"); a link that opens the working checkout ($5 a month or $50 a year) |
| `month_summary` | trial-ending | One factual sentence, e.g. "This month you read for 6 hours and listened for 3, across <em>Frankenstein</em> and <em>The Odyssey</em>." Empty under an hour |

## Sending checklist (for the coding agent)
1. Headers: `List-Unsubscribe: <{{unsubscribe_url}}>, <mailto:…>` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (Gmail and Yahoo requirements for bulk senders). Brevo accepts these as custom headers.
2. Add an unsubscribe endpoint plus an opt-out flag on the profile. That is a schema change, so it needs Anders's approval.
3. Host book art as JPEG. Email clients don't reliably render WebP.
4. Pass `textContent` alongside `htmlContent`.
5. SPF/DKIM: Brevo DKIM (`brevo1`/`brevo2._domainkey`) is live and DMARC is `p=none`. The SPF record does not list Brevo; that is harmless because DKIM covers alignment, but tidy it later.

## Consent (decided by Anders, 30 September 2026)
Ask only at sign-up. There is no prompt or nudge anywhere in the reader.
- **The control:** one small, **unticked** checkbox on the sign-up sheet, directly under the sign-up buttons, applying to email and Google sign-up alike: **"☐ Email me about my reading progress and ideas for what to read next. Stop any time."** Use muted small print, no extra step and no layout shift, so it reads as a footnote. It must never be pre-ticked.
- **Ticked (and email confirmed):** the reader gets `keep-reading` and `next-book`.
- **Everyone** gets the service mail: `welcome` / `welcome-google` and the trial notices `trial-ending` and `trial-ended`.
- **Consent record:** store yes/no with a timestamp and the wording version on the profile. Every opt-in email carries one-click unsubscribe, and opting out takes effect immediately. Readers can switch reading emails on later from account settings.
- **Footer sender line:** "Tinct, Copenhagen, Denmark".
- **Why:** under Danish and EU rules, email promoting our own service counts as marketing even when it's free, and a notice alone or a pre-ticked box isn't consent. This is not legal advice.

## Wiring (social ship 4, 8 October 2026)
The Worker code lives in `app/src/worker/lifecycle/`. Everything is off until the switches below are set, and while `isLifecycleTestRecipient` gates (`LIFECYCLE_TEST_GATE` in `app/src/worker/routes/emails.ts`) only `tinct{n}@fastmail.com` and Anders's own account are even read from the database.

- **Switches** (`app/wrangler.jsonc` vars): `LIFECYCLE_EMAILS` ("1" runs the engine and retires the legacy 09:00 trial-day emails; the issue-anomaly alert stays) and `LIFECYCLE_TRIAL_NOTICES` ("1" sends `trial-ending` / `trial-ended`; keep "0" until checkout is confirmed). **Secrets:** `EMAIL_LINK_SECRET` (signs unsubscribe and confirm links; without it no opt-in email and no `welcome` goes out) and optionally `LIFECYCLE_REPLY_TO` (Anders's inbox for Reply-To).
- **Schema:** `app/supabase/migrations/20261008_email_log.sql`: the `email_log` send log (unique per reader and key) and `profiles.email_opt_out_at`. Ship 2 adds `profiles.email_confirmed_at`; until it exists, opt-in emails don't send and an email sign-up's `welcome` waits.
- **Schedule:** the every-10-minutes cron sends `welcome` (accounts 5 minutes to 48 hours old) and, once an hour, the reading emails and trial notices, so quiet hours are honoured in every time zone.
- **Rules as built** (`rules.ts`): one email per reader per run; 3-day frequency counts every logged email; welcome and the announcement are exempt from quiet hours, frequency and the 48-hour rule; trial notices from the 48-hour rule only (a notice held by the 3-day rule waits, up to day 29 / day 36). keep-reading goes for the most recently read started book only, at most weekly; "ignored" means the book was not opened after the email; the stalled `next-book` is keyed to the book, so a book gets one next-book email, finished or stalled. keep-reading's key carries the reading episode, so "the same template/book pair never twice" and "up to 2 keep-reading" agree.
- **Recap:** keep-reading uses the reader's already prepared recap (recap preparation) only when it ends at or before the reader's place; with none, nothing is sent and no AI is called. `keep-reading-with-question` is wired but unused until reviewed per-chapter questions exist.
- **Next book** (`nextBook.ts`, content copied from `books/wip/reader-acclaim` to `app/src/worker/lifecycle/content/`): cards with an open pre-send check (C05, C14, and C07's bookshelf screenshot) do not lead until listed in `CLEARED_PRE_SEND_CHECKS`; the email then leads with the classic quote and its subject becomes `{surname} on {Target}: "{first eight words…}"`. Lead context is the card's `context` plus its year; classic context is the onboarding `acclaim` text as is.
- **Welcome without a book** drops the book lines (and the preheader) and shows the library art; without a first name the title reads "Welcome".
- **Art:** `app/public/email-art/{book}.jpg` and `library.jpg`, made by `node app/scripts/generate-email-art.mjs` (committed; 1200 × 600 top crop, ≤150 KB). Templates are bundled by `node app/scripts/generate-email-templates.mjs`; a test fails if the bundle drifts from these files.
- **Unsubscribe:** `/unsubscribe?t=…` (signed, never expires). The mail client's one-click POST, or the page's own form, sets `email_opt_in = false` and `email_opt_out_at`; a GET shows a page that posts itself, so link scanners can't unsubscribe anyone. Switching reading emails on again later (an opt-in newer than the opt-out) resumes them. `/confirm?t=…` sets `email_confirmed_at` for the address the link was sent to (valid 30 days); like unsubscribe, a GET shows a page that posts itself (one click for the reader, nothing for link scanners). It is the only confirm route: profiles (ship 2) read the same column.
- **Announcement:** `POST /api/admin/announce-email` (site admins, `LIFECYCLE_EMAILS` on) with `{"campaign": "add-any-book-2026-10", "omitFeatures": [], "dryRun": true}`; drop `dryRun` to send. Feature ids: `reading-time`, `profiles-friends-leaderboard`, `listen-own-books`, `librarian`, `search`.

