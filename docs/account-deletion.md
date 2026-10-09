# Account export and deletion (operator guide)

The privacy notice (`app/public/privacy.html`) promises that a reader can get a
copy of their data (access/portability), can delete their account and all
associated data themselves in Settings → Account, at once, and that an emailed
deletion request is completed within **30 days of the request**. These two
admin-only routes (and the reader's own route, which reuses the deletion) are
how that promise is kept. Only site admins (rows in
`site_admins`) can call them.

Code: `app/src/worker/routes/adminAccounts.ts`. Tests: `app/src/worker.adminAccounts.test.ts`.

## Readers delete their own account (since 2026-10-09)

Settings → Account → **Delete account** (in-card confirm) calls
`POST /api/account/delete` (`app/src/worker/routes/accountDelete.ts`) with the
reader's own token and the body `{"confirm":"delete-my-account","userId":"<own id>"}`.
It runs the same erasure as the admin route below (`deleteAccountData`), for
the caller's own account only, rate-limited to 3 requests a minute. Replies:

- `200 {"ok":true,"deleted":true}`: everything is gone; the app signs out
  (wiping local data) and goes to `/`.
- `500 {"ok":false,"deleted":false}`: an earlier step failed and the account
  is intact; the reader sees "That did not work. Please try again." and can retry.
- `200 {"ok":false,"deleted":true}`: the auth user is gone but the final sweep
  or cascade check failed. The app still signs out. Find the
  `account_self_delete_incomplete` log line (Workers logs; it carries the
  deleted account's full `userId` and the failed steps) and re-run the admin
  delete with that `userId` (any `confirmEmail`; the email check is skipped
  once the account is gone) to clear the leftovers.

The manual follow-up below applies to self-service deletions too, but there
is no request email to trigger it. The Worker only sends transactional email
through Brevo (`/v3/smtp/email`) and creates no Brevo contacts, so Brevo keeps
only its own send logs.

## Handling an emailed request

1. **Verify the requester owns the account.** Reply from the inbox to the
   account's email address and wait for a reply from that address (or have them
   send the request while signed in). Never act on a request from a different
   address.
2. **Log it** with the date received. The 30-day clock starts there.
3. **Export** (for access/portability requests, and as a last copy before a
   deletion if the reader asked for one). Send the JSON file to the verified
   address only.
4. **Delete** (for erasure requests). Check the step report; re-run until
   `"ok": true`.
5. **Reply** to confirm, and clean up manually what the routes cannot reach
   (below).

## Running it

### From the admin page

`https://tinct.app/admin/metrics` → **Accounts** table → **Export** or
**Delete…** on the row. Delete asks you to type the account email. The table
only lists accounts active in the selected window (and hides Anders' and test
accounts), so use curl for anyone else.

### With curl

Get your session access token from a signed-in browser (DevTools → Application
→ Local Storage → the `sb-…-auth-token` entry → `access_token`). It expires
after about an hour.

```sh
TOKEN='<your access token>'

# Export, by email or by userId
curl -sS -X POST https://tinct.app/api/admin/export-user \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"email":"reader@example.com"}' > export.json

# Delete: userId plus the account's email, typed out as confirmation
curl -sS -X POST https://tinct.app/api/admin/delete-user \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"userId":"<uuid>","confirmEmail":"reader@example.com"}'
```

The export response has `complete: true` when every store was read in full;
otherwise `errors` and `truncated` say what is missing. Re-run in that case.

`supabase.reading_time` is the reading-time ledger (seconds read and listened
per day and book; `app/supabase/migrations/20261008_reading_time.sql`). Until
that migration has run the table does not exist; export and deletion then
treat it as empty instead of failing.

`r2.userBooks` lists the reader's own uploaded PDF/EPUB files (id, file name,
title, author, type, size, upload date) from the private `tinct-user-books`
bucket. It does not contain the files themselves. If the reader asks for the
files, they can open each one from My shelf in the library while signed in
(`/library#my-shelf`, "My private uploads"), which downloads the account copy
to that device.

`r2.profileImages` lists the reader's stored profile pictures and backgrounds
(uploads and the copied Google photo, keys `profile/<id>/…` in the same private
bucket), without the bytes. `supabase.reader_profiles`, `follows_following`,
`follows_followers`, `blocks` (whom the reader blocked; never who blocked them)
and `email_log` (the lifecycle email send log) come from the profiles and email-log migrations of
2026-10-08, and `leaderboard_7d` (the reader's cached 7-day total) and
`profile_reports_filed` (reports this reader filed) from the social migration;
before those have run they export as `null` without an error. Reports *about*
the reader name their reporter and are not exported; they go with the account.

`r2.ownBookNarration` counts the recordings made when the reader chose Listen
on one of their own books (objects and bytes under `u/<id>/narration/`), never
the audio. `ownBookNarrationSpend` is the daily byte count of own-book
narration from the account's spend object (`own-user:<id>` in the
`NARRATION_COORDINATOR` Durable Object, routes/ownBookNarration.ts).

`r2.ownBookRecaps` counts the Catch me up recaps of the reader's own books
(objects and bytes under `u/<id>/recaps/`: one per finished chapter and one
for the chapter in progress, per book, routes/ownCatchUp.ts), never the text.
Deleting one book from Your books (`DELETE /api/user-books/<fileId>`) deletes
that book's narration and recaps (`u/<id>/narration/<bookHex>/`,
`u/<id>/recaps/<bookHex>/`) with the file.

## What deletion does, in order

Each step reports `ok`, `failed` or `skipped`. Every step is idempotent.

1. **Durable Objects:** recap preparation, then reader position (alarm and all
   storage). Recap goes first because its alarm reads the position object.
2. **KV:** `lab-chat-history:<id>` (Talk/chat history) and `lab-position:<id>`
   (legacy position record). The own-book narration spend object
   (`own-user:<id>`, purged). Then **R2:** every object under `u/<id>/` in the
   private `tinct-user-books` bucket (the reader's own PDF/EPUB files, their
   narration under `u/<id>/narration/` and their Catch me up recaps under
   `u/<id>/recaps/`,
   `app/src/worker/routes/userBooks.ts`), listed and deleted page by page until
   none remain; then every object under `profile/<id>/` in the same bucket
   (profile pictures and backgrounds, `app/src/worker/routes/profiles.ts`).
3. **Rows that would otherwise survive as anonymous orphans** (`ON DELETE SET
   NULL`): anonymous `analytics_events` from the reader's devices (pre-sign-up
   history: rows with no user whose `device_id` appears on the reader's own
   rows), then the reader's `analytics_events`, `issue_reports` and
   `ai_usage_events`.
4. **Stripe:** every customer on the profile or tagged with the account id:
   live subscriptions cancelled, customer deleted.
5. **Supabase auth user.** This cascades `profiles`, `user_data` (every
   per-user row, including synced highlights and notes, `lab-highlights:{bookId}`),
   `user_data_audit`, `token_usage`, `payments`, `reading_memory_sessions`,
   `site_admins`, and (once their migrations have run) `reading_time` (the
   reading-time ledger), `reader_profiles`, `follows` and `blocks` in both
   directions, the lifecycle email send log `email_log`, `leaderboard_7d` and
   reports about the reader in `profile_reports` (reports the reader filed keep
   no reporter: ON DELETE SET NULL) (all exported too;
   a not-yet-created table counts as empty). It runs **only if every earlier step succeeded**, so the
   account and its email check survive for a re-run.
6. **Sweep and verify:** once sign-in is impossible, the Durable Object, KV
   and R2 steps run again, catching anything a still-open tab or an in-flight alarm
   wrote meanwhile. Then every table is checked for leftover rows.

A re-run after the account is gone returns `accountAlreadyDeleted: true` and
only clears leftovers keyed by that id (no email check is possible then).

The email check applies to every account, admins included. There is no
override.

## What it does not cover (manual follow-up)

- **Brevo:** transactional email logs and any contact record. Delete the
  contact in the Brevo dashboard if one exists.
- **Inbox copies:** issue-report notification emails and the request thread
  itself in Anders' mailbox. Delete those messages (keep only a minimal note
  that a request was handled, if needed).
- **Cloudflare platform logs** (Workers logs/analytics): short-lived, not
  per-account deletable; they expire on Cloudflare's retention schedule.
- **AI providers** (Anthropic, xAI, OpenAI): prompts and outputs sent to them
  are held under their own retention policies and cannot be deleted from here.
- **Stripe records required by law:** Stripe keeps charges, invoices and the
  deleted customer object for its own legal and accounting obligations.
  Tinct's own bookkeeping obligations for paid accounts may also apply; check
  before deleting financial records held outside Stripe.
- **Short-lived counters:** per-account rate-limit windows in the usage
  coordinator hold only a count and expire within minutes.
- **Signed-out data:** anonymous AI usage rows are keyed by a hashed network
  key, not the account, and cannot be attributed to the reader.
- **Data on the reader's own devices** (browser storage, the Android app):
  stays until the reader signs out, clears site data or uninstalls. Say so in
  the confirmation reply.
- **Backups:** Supabase point-in-time backups roll off on their own schedule.
