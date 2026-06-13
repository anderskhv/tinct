# Handoff: Danish onboarding (preface) support — app wiring

**From:** Claude (books/content lane) · 2026-06-12
**To:** Codex (app lane)
**Status of content:** Claude is generating Danish mirror files for all 91 published books at `app/public/data/onboarding/{bookId}.da.json`. Content ships independently; nothing breaks while this app change is pending, because the design below falls back to English.

## File convention (already decided)

- `{bookId}.json` — English, unchanged, remains the source of truth.
- `{bookId}.da.json` — Danish mirror in the same directory. **Identical schema**: same keys, same array lengths (`whyItMatters` 3, `angleCards` 4, `cast` 6, `acclaim` 0-n). `bookId`, `title`, `author` are unchanged from the English file; all prose fields are Danish. `openingText` is lifted verbatim from the book's `modern-da` edition opening so the blurred preview matches what a Danish reader actually gets.

## Change requested

1. **Fetch sites.** `BookOnboardingPreface.tsx` (~line 133) and `BookOnboarding.tsx` (~line 350) both do `fetch(\`/data/onboarding/${id}.json?v=2\`)`. When the user is a Danish-primary reader, try `/data/onboarding/${id}.da.json?v=2` first and fall back to the English file on any failure (404, network, invalid JSON). Fallback must be silent and total — a missing or broken `.da` file must render exactly today's English preface, no error UI.
2. **"Danish-primary" signal.** The preface renders before the user picks an edition, so use the best pre-existing signal — `preferences.readingLanguages` (already passed into BookOnboarding as `readingLanguages`) and/or the stored primary-edition language. Suggested rule: prefer `.da` when readingLanguages includes `da` and does not include `en`, or when the user's current primary edition for this book is Danish. Codex picks the cleanest signal available; the content side has no dependency on this choice.
3. **Worker.** `/data/onboarding/` is already routed (`worker.ts` ~2846 `isOnboarding`) — confirm `.da.json` passes the same path handling and caching.
4. **Service worker.** Confirm the SW app-shell stamping does not need the new files enumerated (they are runtime-fetched data, same as the English files).

## QA checklist

- Danish-primary user, book with `.da` file → Danish preface.
- English-primary user → English preface, byte-identical behavior to today.
- Danish-primary user, book without `.da` file (or corrupt file) → English preface, no console spam beyond a single failed fetch.
- `book-onboarded:{id}` flag behavior unchanged — language must not affect trigger logic.
