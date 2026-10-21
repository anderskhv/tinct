# Invite a friend by email: test plan

Draft, 21 October 2026. Written before any code, against origin/main at 1668c3ac2. Names of modules and routes are the ones this plan assumes; Coder may rename, but every case below should exist under some name.

## Assumed shape

- **Pure rules:** `app/src/social/inviteRules.ts` (normalise and validate an address, clean a note, token and expiry rules, subject and sent-line builders, list states, sender-name cleaning). No I/O.
- **Store:** `app/src/worker/lib/inviteStore.ts` over the tables and RPCs in MIGRATION-DRAFT.sql (`reserve_invite`, `accept_invite`, `purge_invite_personal_data`).
- **Routes:** `app/src/worker/routes/invites.ts`, behind `INVITE_EMAILS = "1"` and `socialFriendsOn(env)`:
  - `POST /api/invites` `{ email, bookId?, note? }` sends one invite;
  - `GET /api/invites` lists Your invites;
  - `GET /api/invites/preview?t=<token>` serves the join page's data (inviter name and picture, book, prefilled address) for an open invite, and `{ state: 'expired' }` for anything else;
  - `POST /api/invites/accept` `{ token }` (signed in) runs `accept_invite`;
  - `GET /join/<token>` serves the join page; `GET|POST /invites/stop?t=<signed>` is the opt-out page.
- **Emails:** templates `invite`, `invite-no-book`, `invite-joined` rendered by `lifecycle/render.ts` `renderEmail()`, sent with `sendEmail()`.
- **Test accounts:** `tinct{n}@fastmail.com` (Anders's aliases; the only addresses the lifecycle test gate lets through), flagged internal with `?internal=1` at the start of each browser profile. Never write their passwords anywhere. `qa-*@test.tinct.app` accounts cannot receive mail, so they are inviters only, never invitees.

## 1. Unit tests (`inviteRules.test.ts`, vitest)

**Addresses**
- trims and lower-cases; `" Anna@X.COM "` and `"anna@x.com"` give the same normalised address and the same keyed hash;
- rejects empty, no `@`, two `@`, spaces inside, over 254 characters, a missing domain dot, and display-name forms (`Anna <a@x.com>`);
- rejects reserved test domains as invitees (`example.com`, `.test`, `.invalid`, `test.tinct.app`): `isReservedTestEmail` is true for them and nobody can receive mail there;
- the hash is HMAC (changes with the secret), 64 lower-case hex, and never equals plain SHA-256 of the address.

**Notes**
- empty and whitespace-only notes become null;
- at most 280 characters after cleaning; 281 is refused, not cut;
- links are stripped: `http://…`, `https://…`, `www.…`, bare domains (`evil.com/x`), `mailto:`; the "links left out" flag is set;
- control characters and `<` `>` removed; line breaks collapse to at most one blank line;
- the profile word filter (`passesWordFilter`) applies: a blocked word refuses the note (`inviteNoteFiltered`), an ordinary name (Scunthorpe, Dickens) passes;
- the cleaned note is what is stored, emailed and shown (no second cleaning path).

**Tokens**
- 32 random bytes, base64url, 43 characters; two tokens never equal across 10 000 draws;
- `hashToken` is SHA-256 hex; a malformed token (wrong length, other characters) is rejected before any lookup;
- expiry is sent + 30 days; open at 29 d 23 h, expired at 30 d exactly.

**Limits** (the pure mirror of `reserve_invite`, so the copy can name the date)
- 9 sent today: allowed; 10: `daily_limit`; the 24 hours are rolling;
- 49 in 30 days: allowed; 50: `monthly_limit`, and the "send more from" date is the day the oldest of the 50 drops out;
- same address within 14 days: `already_invited` with the earlier date; at 14 days exactly: allowed;
- exempt (internal or test account): no daily or monthly limit, but the 14-day rule and suppression still apply;
- order of checks: suppression, then 14-day, then daily, then monthly (so a suppressed address never says "Already invited").

**Copy builders**
- subject with a book: "Anna invited you to read Frankenstein"; without: "Anna invited you to read with them on Tinct";
- sent line: all four variants (book and note, book only, note only, neither);
- list state: Sent today / yesterday / n days ago / date; Joined; Expired; a `withheld` invite reads exactly like a sent one;
- sender name: `Anna "The Reader" <x>` becomes `Anna The Reader via Tinct`; a name that cleans to nothing becomes "A reader via Tinct"; never contains `@`, `<`, `>`, quotes or a line break.

**Templates** (`templates.test.ts` style)
- all three render from sample data with no leftover `{{…}}`;
- an empty `note` drops the note block in both parts; an empty `book_author` drops its line; exactly one of `avatar_url` / `inviter_initial` survives;
- the inviter's name and note are HTML-escaped (`<script>` arrives as text);
- no `Reply-To` and no inviter email anywhere in the rendered output;
- the bundle matches the docs templates (the existing drift test).

**New sign-up defaults** (only if Anders approves them; see OPEN-QUESTIONS.md)
- step 2 opens with the chosen default preselected; Skip saves exactly what the brief says (Friends + leaderboard + show time on), and `profiles.ts` `skip` no longer forces Only me;
- "Show me on the leaderboard" on turns "Show my reading time" on; off leaves it alone;
- Everyone still needs an explicit tap and a confirmed address (the existing `everyoneNote`);
- an existing account's settings never change (no code path writes defaults to a profile with `set_up_at`).

## 2. Database (run the migration on a scratch Postgres twice, then these)

Done once while drafting (21 Oct, local Postgres 16 with stub `auth.users`, `follows`, `blocks`): the file runs twice cleanly, and `ok`, `already_invited`, `suppressed`, `daily_limit`, `monthly_limit`, `self`, `ok` with both follows, `used`, `invalid`, `blocked` and `expired` all came back as expected; the purge cleared an expired row's address and note. Repeat in CI or Supabase branch:
- `accept_invite` inserts both follows in one statement; a pre-existing one-way follow either way does not error;
- a constraint stops any accepted row keeping its address;
- two concurrent `reserve_invite` calls for the same inviter at 9 sent: exactly one is `ok`;
- deleting the inviter's auth user removes their invites; deleting the accepter leaves the row with `accepted_by` null;
- `anon` and `authenticated` cannot select either table or execute any of the three functions.

## 3. Worker route tests (`worker.invites.test.ts`, the style of `worker.social.test.ts`)

**POST /api/invites**
- signed out: 401; switch off: 404; tables missing: 503 `unavailable`;
- profile not set up: 422 `profile_needed`; (if required) email not confirmed: 422 `confirm_needed`;
- own address (the account's email, any case): 422 `own_email`; nothing stored, nothing sent;
- invalid address: 422; note filtered: 422 with `field: note`;
- `bookId` not in the catalogue, or an uploaded book id: 422; omitted: no-book template;
- suppressed: 422 `refused` with the neutral line; nothing stored;
- already invited: 409 with the date; daily / monthly: 429 with the code;
- internal account (`x-tinct-check: 1`) or test account: 11th invite of the day is sent;
- per-minute limiter (`checkRateLimit('invite:<id>', …, 5)`) answers 429 `rate_limited` and fails closed;
- Brevo refuses: 502 `send_failed`, the reserved row is deleted, so the limit count and the 14-day rule are unchanged;
- the response is the same whether or not the address has a Tinct account (body, status and timing class); no field ever names an account;
- `sendEmail` is called with `senderName: "<name> via Tinct"`, no `replyTo`, `text` present, `List-Unsubscribe` and `List-Unsubscribe-Post` headers pointing at the opt-out link;
- the raw address is never logged (assert on `console.*` output).

**Blocked pair at send time** (whichever Anders picks in OPEN-QUESTIONS.md)
- silent: 200 like a send, row `delivery = withheld`, `sendEmail` not called, list shows Sent then Expired;
- or neutral refusal: 422 `refused`, identical to suppression.

**GET /api/invites**
- only the caller's invites, newest first, at most 50;
- open: address and Sent; accepted: Joined with the friend's name and picture as the friend's own settings allow them to be shown to the inviter (an Only me friend shows the initial); expired: no address;
- never another reader's invites; never the token or hashes.

**GET /api/invites/preview**
- open token: inviter's display name and picture (public assets only), book, the invited address for prefill;
- expired, used, unknown and malformed tokens: the same `{ state: 'expired' }` body, status and headers;
- GET never consumes the token (call it 5 times, then accept: ok);
- `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`, `Referrer-Policy: no-referrer` on `/join/<token>`.

**POST /api/invites/accept**
- signed out: 401; ok: both follows exist, `relationOf` is `friend` both ways, the invite is accepted and its address is gone;
- the inviter's Following you list does not show the friend as a request, and `useFollowRequestDot` shows no dot for either reader;
- second accept (same or other account): `expired`, no new follows;
- self: `self`, no follows, invite still open;
- blocked either way: answers `none` (the client then behaves as after a plain sign-in: no card, no book), never `blocked`; no follows; invite still open;
- expired: no follows; the client gets `expired`;
- the joined email is sent once (retry the accept: not again; `joined_notified_at` set);
- the joined email is not sent when the inviter's account is gone or the pair is blocked.

**Opt-out**
- GET shows the page and suppresses nothing (link scanners); POST suppresses; POST twice is fine;
- a tampered or unsigned token: the bad-link page, nothing stored;
- after suppression, a new invite from anyone to that address is refused.

**Retention**
- the retention cron calls `purge_invite_personal_data()` and deletes rows older than 12 months by `sent_at` (add to `RETENTION_TABLES`, and to `retention.test.ts`'s table list).

**Account deletion**
- `deleteAccountData` leaves no invites by the deleted reader (cascade) and the admin purge report lists the step.

## 4. End to end (Playwright where it can, by hand where mail is involved)

Run each on **desktop** (Chrome, 1440 px) and **phone** (iPhone Safari, and the Android app for the join link opening in the browser). Before each run: open `tinct.app/?internal=1` in every browser profile used. Use a fresh browser profile for the invitee.

1. **New account via Google.** A (tinct3, profile set up) invites tinct5 from the You page with Frankenstein and a note. Check the Sent line and Your invites "Sent today". In tinct5's inbox: sender "A via Tinct", no reply-to, subject with the book, avatar, note, cover, button, footer links. Open the link in a fresh profile: join page shows A, the book, "Opens right after you join". Continue with Google. Step 2 shows "You and A will follow each other." Finish. Lands in the returning-reader library, Frankenstein on the table tagged "From A", arrival card with the note. Start reading opens Frankenstein. Back in A: Your invites "Joined · follows you"; A got the joined email; the Friends board and Find readers show tinct5 as a friend, with no request dot for either.
2. **New account via email.** As 1, from Find readers, with the address prefilled on the join page; also change the prefilled address to another one and sign up: decide per OPEN-QUESTIONS.md ("forwarded links") and check that rule.
3. **Existing account.** tinct6 already has an account. A invites tinct6 from the t menu. tinct6 opens the link signed out, uses "Already on Tinct? Sign in". Same follows, same card and book. Repeat with tinct6 already signed in on that device (one tap, no sign-in).
4. **No book.** Invite without a book: no-book email; join page without the book card; arrival card without Start reading; nothing added to the table.
5. **Book already started.** Invitee who already has the book further along: the place is kept (never lose reading position), the book is not reset.
6. **Blocked pair.** tinct6 blocks A, then opens A's invite and signs in: no follows, no card, no tag, nothing says why. A's list never shows Joined.
7. **Self-invite.** A invites A's own address: refused at send. Then A opens a token A sent to someone else while signed in as A: nothing happens (or the "own invite" line), no follows.
8. **Expired token.** Set an invite's `expires_at` in the past (admin SQL on a test row): the join page says "This invite has expired", sign-up works, no follows, no card.
9. **Used token.** Open an accepted invite's link in another fresh profile: the same expired page.
10. **Suppression.** From tinct7's invite email, "Never send me invites": page, button, done line. Then A and B both try to invite tinct7: neutral refusal for both.
11. **Rate limits.** With a non-internal test inviter (a fresh account without `?internal=1`): 10 invites to aliases, the 11th says "You’ve sent 10 invites today…". The same address twice: "Already invited on …". Then flag it internal: the 11th goes.
12. **Internal accounts exempt.** An account flagged with `?internal=1` is never daily- or monthly-limited, but still gets "Already invited" and suppression.
13. **Profile not set up.** An account that has not finished sign-up step 2 (no `set_up_at`): the sheet shows "Set up your profile first…".
14. **Phone layout.** Sheet, Sent, Your invites, join page and arrival card at 375 px: no horizontal scroll, keyboard does not cover the Send button, the email field uses `type=email` and `autocomplete=email`.
15. **Followers mark.** For 7 days A sees "Joined from your invite" on tinct5's row (wherever Anders places it); on day 8 it is gone.
16. **Privacy page.** `/privacy#invites` opens at the new section; the email's footer link lands there.

## 5. Abuse cases

- **Harassment by repeat invites:** one address, one inviter: once per 14 days; many inviters to one address: each once, and one click stops all of them for good.
- **Spam run:** a script with a fresh account: blocked by "profile set up" (and confirmed email, if chosen), 5 a minute, 10 a day, 50 a month; the address word filter does not apply but the note filter does.
- **Account enumeration:** compare responses (status, body, time to answer within noise) for an address with and without an account, an address of a reader who blocked the inviter, and a suppressed one vs. a blocked pair (if blocked is silent, it must look like a send).
- **Link scanners:** Outlook Safe Links, Gmail and corporate scanners GET the join and opt-out links: neither consumes nor suppresses.
- **Forwarded invite:** a third person with the link joins; behaviour per OPEN-QUESTIONS.md, and the inviter's reading is not shown to them unless that rule allows it.
- **Token brute force:** 43-character tokens; `/api/invites/preview` and `/accept` are rate-limited per IP and per account; a malformed token never reaches the database.
- **Note as a phishing vehicle:** links stripped (including obfuscated `hxxp`, `example[.]com` left as plain text is acceptable), no HTML, 280 characters; the email's only link targets are tinct.app.
- **Sender-name spoofing:** a display name like "Tinct Support" or "Your bank" is already blocked by `RESERVED_FRAGMENTS` for handles only; names are word-filtered but not reserved-checked. Check what "Tinct via Tinct" or "PayPal via Tinct" looks like and decide (OPEN-QUESTIONS.md).
- **Header injection:** a display name with `\r\n` never reaches a header.
- **Invite to a test domain:** refused (cannot receive mail; protects Brevo reputation).
- **Inviting a deleted account's address:** works like any address; the old account's data is gone.
- **Mass suppression by a third party:** someone with the opt-out link of another person's invite could suppress that person: acceptable (it only stops invites), but the link must not reveal the address.

## 6. What to check in Brevo

- **Transactional log:** each invite appears once, with the right recipient, subject and sender name "<name> via Tinct" <contact@tinct.app>; no Reply-To.
- **Headers on the received message** (show original in Gmail and Fastmail): `List-Unsubscribe` with the opt-out URL and the mailto, `List-Unsubscribe-Post: List-Unsubscribe=One-Click`, DKIM pass with d=tinct.app (brevo1/brevo2 selectors), DMARC pass; SPF may still show Brevo outside the record (README: harmless, tidy later).
- **Click and open tracking:** off for invites if Brevo allows per message, or account-wide decision: click tracking rewrites the join link through Brevo's redirect, which puts the token in Brevo's logs and makes scanners hit it. If it cannot be turned off, confirm the redirect still lands on `/join/<token>` and that GETs never consume.
- **Tags:** if `sendEmail` gains a `tags` option, tag `invite` and `invite-joined`, so bounces and complaints can be read per type.
- **Bounces and complaints:** a hard bounce or a spam complaint on an invite should add the address hash to `invite_suppressions` (source `bounce`) via a Brevo webhook, or at least be visible in Brevo's blocklist. Check what Brevo does with a recipient it has already blocklisted (it silently drops: our row says Sent).
- **Daily quota:** the plan's daily sending limit covers invites plus lifecycle mail on a busy day.
- **Rendering:** Litmus or Brevo's preview in Gmail web and app, Apple Mail iOS and macOS, Outlook web and Windows (the round avatar shows square in Outlook desktop; acceptable), dark-mode clients (the template forces light).
- **Spam score:** send one to mail-tester.com from production; aim for 9/10 or better.
