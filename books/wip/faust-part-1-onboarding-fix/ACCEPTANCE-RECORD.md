# Acceptance Record — Faust Part I, onboarding correction

**Status: ACCEPTED, ready for Codex integration. Not published.**

| Item | Value |
|---|---|
| Package | `books/wip/faust-part-1-onboarding-fix/` |
| Branch | `claude/cool-clarke-ngd780` |
| `onboarding/faust-part-1.json` sha256 | `99cee4166ee959b8062919f9fabd54a45cf3673f4cdf28114929906101ff7816` |
| `onboarding/faust-part-1.da.json` sha256 | `e144ccbc5683ca25a611e0c5646f525ef4cfcf6f6cbac6fedb33e01acdb05def` |
| Independent reviewer | A separate Claude agent instance, verdict formed before reading `RELEASE-PACKET.md` |
| Review verdict | **ACCEPT** |

## Independent review summary

Confirmed both candidates' `openingText` fields are character-for-
character identical to the accepted `original-en`/`modern-da`
candidates' chapter 1 paragraph 0 — no truncation, no paraphrase.
Confirmed `openingChapterLabel` unchanged and correct in both files.
Programmatic key-by-key diff against the live pre-fix files confirmed
`openingText` is the ONLY field touched in either file.

**Independently re-assessed the spoiler-safety question** (not just
trusting this package's own framing): read the live, already-accepted
Macbeth onboarding cast array directly and confirmed it already
discloses, in equally blunt language, Duncan's murder, Banquo's murder,
Macduff's wife and children being "slaughtered in revenge," and Lady
Macbeth's death — at least as severe a spoiler category as Faust's cast
array. Independent conclusion: Faust's cast array is consistent with,
not beyond, established precedent. No rewrite warranted.

## What "accepted" does not mean

Accepted for integration; not published, not live. The character-card
gap documented in `RELEASE-PACKET.md` remains open — flagged for Codex/
the dedicated character-content authoring pipeline, not resolved by this
package. Codex owns integration and the serialized release process per
`books/BOOK-TASK-WORKFLOW.md`.
