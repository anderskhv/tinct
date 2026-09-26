# Acceptance Record — Faust Part I, original-de transcriber's-note removal

**Status: ACCEPTED, ready for Codex integration. Not published.**

| Item | Value |
|---|---|
| Package | `books/wip/faust-part-1-original-de-fix/` |
| Branch | `claude/cool-clarke-ngd780` |
| Candidate sha256 | `0dff98ddf2336b64769fe76e1658b61abfe178dd1c5b121c54927296afdd7d65` |
| Replaces live sha256 | `edb0081f759c0eb256ed303711932af743784a87f1cc6716dab7d15365bc83e5` |
| Independent reviewer | A separate Claude agent instance, working from the local raw PG #21000 source and a direct diff against the live-served file; verdict formed before reading this package's release packet |
| Review verdict | **ACCEPT — fix does exactly and only what it claims** |

## Independent review summary

Confirmed against `books/raw/faust-part-1/raw-de.txt` that the text
appended after the play's genuine final line ("Heinrich! Heinrich!") is
unambiguous PG transcriber apparatus — a German note followed by its
English counterpart, immediately preceding the "*** END OF THE PROJECT
GUTENBERG EBOOK ***" marker in the raw source.

Diffed the candidate directly against the currently-live
`app/public/data/editions/faust-part-1-original-de.json`: full
chapter-title and paragraph-by-paragraph comparison across all 28
chapters found **exactly one difference** — chapter 28 ("Kerker"), the
last paragraph (index 69 of 70), where the transcriber's-note text
(German + English) is removed, leaving only "STIMME. Heinrich!
Heinrich!". No other chapter title, paragraph count, or paragraph text
differs anywhere in the file. Paragraph count is unchanged (70 in both
live and candidate) — only the content of the last paragraph was
trimmed, nothing split, merged, added, or removed.

Structural sanity confirmed: valid JSON, 28 chapters matching the live
file, all chapter titles are genuine German scene/act divisions, no
apparatus/crosswalk/bracket-debris titles.

## What "accepted" does not mean

Accepted for integration; not published, not live. This fix is
independent of, and does not resolve, the separate open question of
whether to replace the served `original-en`/`modern-en` translation with
Taylor's — see `books/wip/faust-part-1-source-decision/DECISION.md` and
`books/wip/faust-part-1-english-repair/`. Codex owns integration and the
serialized release process per `books/BOOK-TASK-WORKFLOW.md`.
