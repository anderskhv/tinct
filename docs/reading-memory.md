# Reading memory

Tinct keeps two reading-history layers with different jobs:

- `reading-log:{bookId}` in `public.user_data` remains the compatibility and Reading Feed store. It is a bounded whole-book JSON blob and is not the cross-device source of truth for new voice recall.
- `public.reading_activity_sessions` is the durable signed-in activity stream. Each device creates a stable UUID for a reading/listening session and extends only that row while the user remains in the same book, chapter, edition, and mode within a 30-minute gap.

The durable row contains the authenticated user, book, chapter, edition, read/listened mode, start/end timestamps, paragraph range, and a monotonic client revision. The RPC accepts only the authenticated user, keeps the session identity immutable, and ignores an older retry after a newer revision. Separate device sessions therefore add independent rows instead of competing over a whole JSON blob.

The browser queues the newest revision for each session in local storage before attempting Supabase. It retries after further activity, reload, or the browser returning online. Session UUID plus revision makes replay idempotent. RLS limits select/insert/update to the owning authenticated user, and user/time plus user/book/time indexes support the voice lookup.

Voice queries the indexed session table at tool-call time, so an early “what did I read yesterday?” does not depend on the generic `user_data` Phase A cache. It merges the matching local legacy mirror without duplicating it and falls back to legacy logs if durable history is temporarily unavailable. Passage excerpts are loaded only for the returned chapter/paragraph ranges. Book-scoped chat history and the bounded reader profile remain separate continuity inputs; voice is instructed to use them quietly, never recite a profile, and never substitute them for factual dated reading history.

## Privacy and signed-out reading

Durable history is deliberately signed-in-only. Tinct does not persist anonymous reading activity or chat history; a guest keeps only the existing local resume position and device preferences. This sacrifices cross-session “what did I read?” recall for guests, but avoids silently creating a detailed behavioral history contrary to the current anonymous-storage policy. Voice should explain this boundary briefly when relevant and offer sign-in rather than pretending a guest history exists.

## Migration and historical limits

The additive migration leaves `user_data` untouched. Its one-time backfill copies only explicit `sessions` arrays that V1 recorded after commit `9704fcb4`. It does not turn older `firstReadAt`, `lastReadAt`, progress, completion, or saved-position values into detailed sessions. Legacy timestamp-only rows can still support a clearly marked fallback, but Tinct cannot accurately reconstruct paragraph ranges or earlier visits that were never recorded.
