# Account export and deletion (operator guide)

The privacy notice (`app/public/privacy.html`) promises that a reader can get a
copy of their data (access/portability) and that their account and all
associated data are deleted within **30 days of the request**. These two
admin-only routes are how that promise is kept. Only site admins (rows in
`site_admins`) can call them.

Code: `app/src/worker/routes/adminAccounts.ts`. Tests: `app/src/worker.adminAccounts.test.ts`.

## Handling a request

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

## What deletion does, in order

Each step reports `ok`, `failed` or `skipped`. Every step is idempotent.

1. **Durable Objects:** recap preparation, then reader position (alarm and all
   storage). Recap goes first because its alarm reads the position object.
2. **KV:** `lab-chat-history:<id>` (Talk/chat history) and `lab-position:<id>`
   (legacy position record).
3. **Rows that would otherwise survive as anonymous orphans** (`ON DELETE SET
   NULL`): anonymous `analytics_events` from the reader's devices (pre-sign-up
   history: rows with no user whose `device_id` appears on the reader's own
   rows), then the reader's `analytics_events`, `issue_reports` and
   `ai_usage_events`.
4. **Stripe:** every customer on the profile or tagged with the account id:
   live subscriptions cancelled, customer deleted.
5. **Supabase auth user.** This cascades `profiles`, `user_data`,
   `user_data_audit`, `token_usage`, `payments`, `reading_memory_sessions` and
   `site_admins`. It runs **only if every earlier step succeeded**, so the
   account and its email check survive for a re-run.
6. **Sweep and verify:** once sign-in is impossible, the Durable Object and KV
   steps run again, catching anything a still-open tab or an in-flight alarm
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
