# Release Packet — Discourse on Inequality, modern-da Part 2 translation

Status: candidate, awaiting independent review. Not published. Authorized
under the 2026-09-26 assignment's explicit Danish-repair carve-out.

## What this fixes

`CONFIRMED-DEFECTS.md` G09-discourse-on-inequality-04 (S2): `modern-da`
chapter 4 (Part 2 of Rousseau's Discourse — the famous "The first man who,
having enclosed a piece of ground..." opening and the account of property,
inequality and society) was served entirely in untranslated English, byte-
identical to `modern-en`, across all 67 paragraphs.

## Baseline

Accepted, clean `modern-en` chapter 4 ("no truncations" per the audit) —
the same edition already served live, used as the source for this Danish
translation.

## Candidate

| Item | Value |
|---|---|
| `editions/discourse-on-inequality-modern-da.json` | sha256 `b7143d44f029fad16d1d4baa38ba7e8307929338f6fc1f980daea2f638fcf439` — 4 chapters, same structure as live; only chapter 4's 67 paragraphs replaced |
| Replaces live sha256 | `383db95bbf30559d6ba41eb2045d37f2a24db49e9a3e80b2e246efb8e6b2c224` (matches the audit's reported prefix) |
| Change | Chapter 4 ("Del 2"), all 67 paragraphs: fresh Danish translation replacing the English text |

## Verification performed

- Valid JSON.
- Paragraph count (67) and chapter structure unchanged from live; only
  chapter 4's paragraph text changed — no reading-position remap needed
  beyond the usual "text changed under an unchanged coordinate" case.
- Confirmed no paragraph is byte-identical to the English baseline (i.e.
  none left untranslated) and every paragraph contains Danish-specific
  characters (æ/ø/å).
- ~13 paragraphs spot-checked against the English baseline for completeness
  (every premise/clause/proper noun preserved, dense multi-clause argument
  intact) — see translator's own report for the exact list checked.

## Character-card / threads impact

Checked `app/public/data/characters/discourse-on-inequality.v1.json` — no
`modern-da` edition entry exists there (only English editions are
character-carded for this book), so no re-anchoring is needed.

## What independent review should check

Re-read a substantial sample of the 67 paragraphs against the English
baseline for completeness and fidelity (this is dense 18th-century
argumentative prose; check that no premise or logical step was dropped or
softened), and confirm the Danish is fluent, idiomatic, and consistent with
Part 1's already-accepted register (not a literal English calque).
