# Release packet: Prince / Julius Caesar / Jekyll content follow-up (independently reviewed)

**Status: accepted for a narrow release. Not published.** Integration and deployment belong to the coding agent. See `REVIEW-RECORD.md` for the findings. This acceptance covers the listed paragraphs only, not the whole books.

## Files to apply

| Book | Reviewed candidate | Destination | Expected live baseline SHA-256 | Reviewed candidate SHA-256 | Changed paragraphs |
|---|---|---|---|---|---|
| The Prince | `reviewed/the-prince/candidate.json` | `app/public/data/editions/the-prince-modern-en.json` | `fbdf701292f34f01d5c0af0aad55975853de0157a3260ad3ebde164cfb7d1589` | `d99629fa3c3e1a345c92e1b9749115111985bfdff520fd7a37037d6a3731d582` | 29 |
| Julius Caesar | `reviewed/julius-caesar/candidate.json` | `app/public/data/editions/julius-caesar-modern-en.json` | `be475cf9c2b8ed2b85be22d8a1f8cb9bb1a89332e31bf390e1272323c02f52b9` | `95a3e5b7516276f703bd77fb42992c6d76f27894619e1d7f147c290170baa952` | 2 |
| Jekyll and Hyde | `reviewed/jekyll-and-hyde/candidate.json` | `app/public/data/editions/jekyll-and-hyde-modern-en.json` | `f2cf24e93c77b354a9fa617d3440b6daaa09acd36e6fdb1df236469ac570a5ae` | `7bcc0ee81b68635f017b8324fab9dc2e4cc3fc0febb827e0431ce876a2d0ac6b` | 1 |

The Prince's author candidate `d6ea5564…d9ba6a` is **superseded**; do not apply it. The Caesar and Jekyll reviewed candidates are byte-identical to the author candidates.

Changed paragraphs (one-based section.paragraph):
- The Prince: 16.1, 16.2, 17.1–17.5, 18.1, 18.3–18.6, 18.8–18.11, 19.2–19.5, 19.8–19.13, 26.7, 27.13, 27.14
- Julius Caesar: 4.8, 9.36
- Jekyll and Hyde: 10.24

The per-paragraph baseline and reviewed SHA-256 values are in each `reviewed/{book}/RELEASE-PACKET.md`, `changes.json` and `candidate-paragraph-hashes.tsv`.

## Preconditions and procedure

1. Confirm the live `{book}-modern-en.json` SHA-256 equals the expected baseline. As of `origin/main` `b91d4b8d8ceab2e3379cb6a83174ce97c7c47aec` (2026-09-24), all three match.
2. If a live file has changed since, do not copy the whole file. Apply only the listed paragraphs whose live paragraph hash still equals the baseline paragraph hash, and return any others for content reconciliation.
3. After applying, confirm the destination file hash equals the reviewed candidate SHA-256, and that chapter and paragraph counts are unchanged (Prince 27/254, Caesar 18/997, Jekyll 10/339).
4. Character cards: this review added or removed no names. Re-anchor mentions in the changed paragraphs using the existing process. No new identity or alias approvals are supplied.
5. There are no audio, voice, Kokoro or GPU steps, and no application, tooling or character-card changes. Verify versioned reader URLs after release.

## Remaining blockers

None within scope. Out-of-scope observations in unchanged paragraphs are listed in `REVIEW-RECORD.md` §6 and do not block this release.
