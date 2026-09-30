# Verification — 30 September 2026

Branch: `codex/addbooks-search-prototype`. Base: `claude/eager-edison-6csbv8` at `962c195e6`.

## Final end-to-end build

| Measure | Result |
|---|---:|
| Gutenberg records read | 79,499 |
| Public-domain text editions retained | 77,823 |
| Gutenberg text records without EPUB (retained, null URL) | 248 |
| Standard Ebooks feed entries / metadata packages | 15 |
| Total editions | 77,838 |
| Works | 76,988 |
| Duplicate editions merged into works | 850 |
| Works with both sources | 4 |
| Live Tinct books inspected | 101 |
| Live Tinct books matched | 68 |
| Catalogue works marked On Tinct | 92 |
| Raw index bytes | 107,191,845 |
| Gzipped index bytes | 11,146,512 |

66 language codes retained. Excluded 861 records without the required US public-domain statement and 815 non-text records. Tinct: 27 unmatched and 6 title/author ambiguities remain unbadged. Full rows are in [build-report.json](build-report.json).

**Standard Ebooks coverage is partial:** 15 public recent releases. The full feed needs authorized access. Source author dates and translators are kept when known; original language remains unknown in this snapshot. The generated index is ignored because its gzip size exceeds 5 MB.

## Search acceptance

| Query | 1 | 2 | 3 |
|---|---|---|---|
| Odyssey | The Odyssey | A Martian Odyssey | The Authoress of the Odyssey |
| dostoevsky | Crime and Punishment | The Brothers Karamazov | White nights, and other stories |
| pride prejudice | Pride and Prejudice | Pride and Prejudice, a play founded on Jane Austen's novel | — |
| meditations marcus | Meditations | — | — |

A dash means fewer than three matching works. Translations of the Odyssey and Meditations are grouped, not repeated to fill result slots. All meaningful query words must match. `oddysey`, `prdie prejudice` and translator search `Constance Garnett` also pass. Full results, IDs, counts and timings: [search-results.json](qa/search-results.json).

## Browser acceptance

Isolated, headless Chromium with `--mute-audio`, new browser context per viewport. No personal browser session, microphone, audio playback, app integration or deploy.

| Viewport | Initial local load | Offline reload | Horizontal overflow |
|---|---:|---|---|
| desktop (1440 × 1080) | 1,232 ms | Passed | None |
| phone (390 × 844) | 1,208 ms | Passed | None |

Measured search latency for the four examples: 26.3 ms, 17 ms, 28.8 ms, 21.8 ms. Timings are from local headless Chromium on this Mac, not a throttled low-end phone. No page exceptions. English default, combined subject/SE filters, French filtering, empty/no-results states, typo matching, disabled Add and offline reload all passed. Nine focused Python builder regressions and the full-index Node search/data assertions pass.

The browser check found and corrected a worker/controller timing bug: the search worker is now created after service-worker control, so catalogue fetches are cached before offline reload. Typographic covers remain visible while source images load.

## Screenshots

| State | Desktop | Phone |
|---|---|---|
| empty | [PNG](qa/desktop-empty.png) | [PNG](qa/phone-empty.png) |
| results | [PNG](qa/desktop-results.png) | [PNG](qa/phone-results.png) |
| no-results | [PNG](qa/desktop-no-results.png) | [PNG](qa/phone-no-results.png) |
| filters | [PNG](qa/desktop-filters.png) | [PNG](qa/phone-filters.png) |

All eight screenshots were inspected visually. They capture the actual viewport, not a scaled full-page thumbnail. Source covers are remote; typography is the intentional loading/offline fallback. Browser measurements: [browser-report.json](qa/browser-report.json).

## Scope verification

`git diff --stat 962c195e6` is recorded in [qa/diff-stat.txt](qa/diff-stat.txt). Every changed path is under `addbooks/`, except the root `.gitignore` entries for the raw cache and oversized generated index. App/Worker/config/registry/taxonomy/Supabase/CI files are untouched. No new dependencies are installed in the app. No merge or deploy.

## Remaining decisions

- Authorized complete Standard Ebooks feed access.
- Whether translations and cross-language titles should share a work ID and expose an edition selector; current matching is intentionally conservative.
- Authority/title mappings for the 33 unmatched or ambiguous live Tinct books, complete original-language/first-publication metadata, and region/licence clearance before imports.
- Index size/device memory strategy before production. See [README.md](README.md) for the Wikisource/open-access → scans → converter/import sequence.
