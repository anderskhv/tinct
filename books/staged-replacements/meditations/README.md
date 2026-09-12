# Meditations (Marcus Aurelius) — staged modern-English replacement

Content-only staged work. Nothing here is registered, live, merged or deployed.
No app code, registry entries, served editions, audio or database records are
touched by this package.

Start with `00-progress-ledger.md` (state, decisions, what needs Anders), then
`WORKFLOW.md` (the eight-step process and the rules), then `PROVENANCE.md`
(what the served file actually is, the edition assessment, rights, and the
staged corrected `original-en`).

- `meditations-original-en.staged.json` — George Long 1862, 12 books, 487
  paragraphs, one per numbered section. Built from `source/pg15877-long-1862.txt`
  by `scripts/build_original_en_from_pg15877.py`.
- `GLOSSARY.md` — stable renderings fixed before drafting.
- `bookN/` — per-book drafting, review-packet, correction and acceptance files.

Books I–VII are accepted (each `bookN/ACCEPTANCE.md` names the accepted file and
its hash). Book VIII is drafted and frozen at `book8/candidate-v1.json`, waiting
on its independent review.
