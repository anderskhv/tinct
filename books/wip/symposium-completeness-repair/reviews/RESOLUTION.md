# Review findings: resolution log

Two independent reviews were run on candidate v1:

- Review 1 (`REVIEW-1-completeness-fidelity.md`): full-book completeness and fidelity, with source access.
- Review 2 (`REVIEW-2-blind-reader.md`): a blind Modern English read, without source access.

Every finding is resolved below. Every change made in response was then re-verified independently (`REVERIFY.md`). Its findings are resolved at the end of this log, and the resulting final changes were checked again (`REVERIFY-DELTA.md`).

## Review 1 (completeness and fidelity): resolution

Reviewed v1 candidates: original-en `3521a12d…95a6`, modern-en `43f03333…e550`. After resolution (v2): original-en `3521a12d…95a6` (unchanged), modern-en `073ca5b4…3eae`. The final candidate (v3, after the re-verification below) is modern-en `1e970b7b…`; original-en is still unchanged.

| # | Finding | Decision | Result |
|---|---|---|---|
| F1 | BLOCKING (repo policy, pre-existing): modern-en fails the similarity gate (candidate 0.868; 6 of 8 chapters LIGHT) | **Escalated; not resolvable within this assignment**, which forbids rewriting clear passages merely to lower the score | Now 0.866, against 0.877 for the live baseline: no regression. Recorded as a decision for Anders in `RELEASE-PACKET.md` §6: a waiver for this completeness repair, and/or a separate modern-English re-rendering of chapters 2 and 4–8 |
| F2 | SHOULD-FIX: 3.7 drops "which custom allows" | **Fixed (C-06)** | Final wording: "…only one honorable way, allowed by custom, for the beloved to yield — the way of virtue." v2 read "that custom allows for", which could misparse (re-verification N11) |
| F3 | SHOULD-FIX: the proposed Phoenix card blames Phoenix for the vagueness | **Fixed** | "Philip's son, who heard about the banquet from Aristodemus and passed the story on; it reached Glaucon only as a vague second-hand account." |
| F4 | SHOULD-FIX: Danish would stay flagged `aligned` | **Made a hard release dependency, with a decision item** | `RELEASE-PACKET.md` §3.5 and §6.1; `impact/modern-da-report.md` recommends option A (`aligned: false`, text untouched) |
| F5 | NOTE: 8.0/8.1 split inside Alcibiades's speech | **Kept, documented** | Merging later would need an offset row (`CHANGES.md`) |
| F6 | NOTE: 20 notes, not 17; "(daimon)" is Jowett's gloss; "(Greek)" placeholder | **Corrected** | `COVERAGE.md` counts 20 notes in 17 paragraphs and classifies "(daimon)" as Jowett's gloss, kept in modern-en. `SOURCE.md` counts the 20 notes and discloses the "(Greek)" placeholder |
| F7 | NOTE: `SOURCE.md` shows only the TXT update date, misses six upstream slips, and "Jowett (1871)" is unverified | **Corrected** | Both header dates recorded. All 10 slips listed with coordinates. The edition-year caveat is recorded for the registry owner |
| F8 | NOTE: pre-existing modern-en nuances | **Partly fixed** | 3.3 garbled clause: **fixed (C-06)**. 3.8 dropped hedge "done his best" and quotation 'uses base': **fixed (C-06)**. 3.2 "But surely", 3.6 "both lover and beloved" and 4.1 "the poets here" are judged not defects of meaning: recorded, not changed. 1.46 inner quotation marks and the British spellings are cosmetic: recorded, not changed |
| F9 | NOTE: small additions in the restored paragraphs | **Adopted** | "only" removed (1.0); "not even three years" → "not yet three years" (1.3). "Whole story" was first kept on a mistaken rationale, then removed after re-verification N5; 1.7 now reads "let's hear the story" |
| F10 | NOTE: the package was still changing | **Handled in the final commit** | `STATUS.md` is replaced there, and `README.md`, `RELEASE-PACKET.md`, `ACCEPTANCE.md` and `HASHES.sha256` are added. All checks are re-run on the final bytes (`ACCEPTANCE.md`) |
| F11 | NOTE: unnamed informant card; possessive form | **Adopted** | Optional `glaucon-informant` proposal added. Subtitle uses the existing card's "Charmides’" form |
| F12 | NOTE: chapter 5 and 6 lead-ins | Agreed | No change |

**C7 after resolution.** Review 1 found C7 only partly held because of 3.7 (F2). With C-06 applied, and 3.8's hedge and quotation restored, the re-verification below checks whether any omission remains.

## Review 2 (blind reader): resolution

The blind reader had no source access, so every suggestion was checked against Jowett, and against the Greek where Jowett is ambiguous, before it was adopted. Adopted wording keeps to Jowett's meaning. Paragraph splits were declined throughout, because every restored paragraph must stay one-to-one with its source paragraph.

| # | Finding | Decision | Resulting text (modern-en) or reason |
|---|---|---|---|
| 1 | SHOULD-FIX, 1.7: the listener changes from Glaucon to the companion without any signal | **Adopted (adapted)** | "And that is why, as I told you at the start, I'm well prepared to do what you ask; I'll go through them again for you, if you like." "As I told you at the start" points back to 1.0, and Jowett's "your request" is the companion's. The paragraph split was declined (alignment) |
| 2 | SHOULD-FIX, 1.7: ambiguous "his account" | **Adopted** | "I have asked Socrates himself whether some parts of Aristodemus's account were true, and he confirmed them." Jowett's "his narrative" is Aristodemus's; the Greek reads "some of what I heard from him" |
| 3 | SHOULD-FIX, 1.8: nickname sentence hard to parse | **Adopted (adapted)** | "In this you live up to your old nickname, 'Apollodorus the madman.' I don't know how you came by it, but it suits you, for you're always raging against yourself and everybody except Socrates." "It suits you" renders Jowett's concessive "however deserved". The reader's "you certainly deserve it" was stronger than the source |
| 4 | "only just now" | **Adopted** | "I was just looking for you." |
| 5 | Ambiguous "his/He" and repeated "account" in 1.0 | **Adopted (adapted)** | "Someone told me what he had heard from Phoenix, the son of Philip, but his account was very vague. He did say, though, that you knew about them, so I'd like to hear them from you." The reader's "the whole story" was not adopted because it is not in Jowett. The final wording also drops a repeated "about them" (re-verification N11) |
| 6 | Name Socrates in "your friend's words" | **Declined** | Jowett and Plato leave the friend implicit. The reader can infer it from the list of speakers just before, and 1.3 confirms it |
| 7 | "know" used twice in 1.3 | **Adopted** | Final wording: "since I started spending time with Socrates". This is closer to the Greek (συνδιατρίβω). v2's "keeping company with" could read as courting (re-verification N11) |
| 8 | "well occupied" | **Adopted** | "thinking I was doing something worthwhile" (Jowett: "fancying myself to be well employed"). It echoes 1.7, as the same Greek phrase does |
| 9 | 1.5 could be read as dating the prize | **Adopted** | "…at the time Agathon won the prize with his first tragedy. It was the day after he and his chorus had offered their victory sacrifice." |
| 10 | 1.7 sentence order, and the unfamiliar word "deme" | **Adopted, except "deme"** | "'No, not Socrates,' I replied. 'It was the same man who told Phoenix — Aristodemus, of the deme of Cydathenaeum, a little fellow who never wore shoes." "Deme" is kept because it is Jowett's historical term and the edition keeps comparable terms ("Phaedrus the Myrrhinusian") |
| 11 | "the whole story again" implies Glaucon heard it before | **Adopted** | Final wording: "let's hear the story". "Over again" and the interim "whole" are dropped: the Greek asks simply "why not tell it to me?", and "whole" is not in Jowett (re-verification N5). The later "again" addressed to the companion stays, since Apollodorus has told it before. The paragraph split was declined (alignment) |
| 12 | "the talk of you rich men" misread; plural "my friends" | **Adopted reorder; plural kept** | "especially the talk of rich men and businessmen like you". The plural is kept because Jowett's "you who are my companions" is plural, as is the Greek |
| 13 | "I dare say… creature" dated, and "creature" repeated | **Adopted** | "I suppose you pity me in return and think I'm miserable" |
| 14–18, 20 | Notes confirming speaker framing, facts, house style and the ch 7/8 boundary | Noted | No action |
| 19 | 1.14 "I replied" and 1.26 "I turned round" slip into first person | **No change** | These are Aristodemus's own words ("the exact words of Aristodemus") in Jowett as well. They are faithful existing text |
| 21–22 | Existing-text typography: 8.1 and 7.68 quotation marks, "revellers"/"ribands", 1.33 doubled quotes, 1.20–1.22 quotes | **Recorded, not changed** | Pre-existing, outside the repair, and cosmetic. The paragraphs stay byte-identical so offsets are preserved exactly (`CHANGES.md`, "Checked and deliberately not changed") |

## Re-verification (independent): resolution

Verified v2: original-en `3521a12d…95a6`, modern-en `073ca5b4…3eae`. Verdicts: R1–R4, R6 and R7 CONFIRMED; R5 PARTLY (F1). No blocking finding.

| # | Finding | Decision | Result |
|---|---|---|---|
| F1 | SHOULD-FIX: modern-en `paragraphHashesChaptersToRecompute` still `[1, 7, 8]`; it should be `[1, 3, 7, 8]` after C-06 | **Fixed** | The list is now *derived* by comparing the baseline card's hashes with the candidate, instead of being asserted: original-en `[1, 7, 8]`, modern-en `[1, 3, 7, 8]`. `IMPACT.md` §2 corrected |
| N2 | Stale `IMPACT.md` sentences ("No offset changes"; "All 217 old paragraphs … unchanged"; seek maps omitting modern chapter 3) | **Fixed** | All three corrected |
| N3 | `build-summary.json` counted 217 carried paragraphs for both editions | **Fixed** | Now per edition: original-en 217, modern-en 214, plus 3 corrected under C-06 |
| N4 | `MAPPING.md` said the 3.3 anchors fall "inside equal spans"; they sit at insertion boundaries | **Fixed** | Rewritten: the mentions coincide with equal spans; the anchors are at span ends and should be applied as listed (998, 1019), not re-projected |
| N5 | "Whole story" rationale inaccurate and inconsistent with item 5 | **Fixed in text** | 1.7 now reads "let's hear the story" |
| N6 | The resolution log reported future work as done | **Fixed** | Wording corrected; all of it is true at the final commit, as checked in `ACCEPTANCE.md` |
| N7 | `COVERAGE.md` blamed Phoenix for the garbled account | **Fixed** | The go-between is now the source of the vagueness, as in the corrected card |
| N8 | `CHANGES.md` listed 4 upstream slips; `SOURCE.md` lists 10 | **Fixed** | `CHANGES.md` references all 10 |
| N9 | `SOURCE.md` claimed modern-en renders the intended sense of every slip, including 6.4 and 6.10 | **Fixed** | Now notes that those two sit inside Jowett notes that modern-en omits |
| N10 | 0.4896 is inside REAL-HEAVY, not at the boundary | **Fixed** | v3 figure is 0.487, "just inside the REAL-HEAVY band" |
| N11 | Optional polish: 1.0 "about them" repeated; 1.3 "keeping company" can read as courting; 3.7 "that custom allows for" can misparse | **Adopted** | 1.0 "so I'd like to hear them from you"; 1.3 "since I started spending time with Socrates"; 3.7 "only one honorable way, allowed by custom, for the beloved to yield" |
| N12 | Remaining chapter-3 nuance shifts (pre-existing, not omissions) | **Recorded** | Listed in `CHANGES.md` for a later modern-English pass |
| N13 | Similarity-gate failure (pre-existing) still open | **Escalated** | Decision for Anders (`RELEASE-PACKET.md` §6) |

The final text changes (N5, N11: modern-en 1.0, 1.3, 1.7 and 3.7) and the corrected records were re-verified by the same independent re-verifier. See `REVERIFY-DELTA.md`.

## Delta re-verification (v2 → v3): resolution

Verified v3: original-en `3521a12d…95a6` (unchanged), modern-en `1e970b7beb3f098095ecf1a9fc7d78a8855d75e6ffc3bba14edc69db0e05374f`. Verdicts: D1–D3 CONFIRMED; D4 PARTLY (two wording errors in `IMPACT.md`); D5 notes only. Nothing blocking. No text changed after this check. The fixes below touch records only.

| # | Finding | Decision | Result |
|---|---|---|---|
| D-N1 | 3.7 "allowed by custom" is an aside where Jowett's clause restricts; the qualification is present | **No action** (the reviewer required none) | Kept. The Greek, "by our custom … one way", supports it. A later modern-English pass may tighten it |
| D-N2 | `CHANGES.md` gave the wrong reason for dropping "over again" in 1.7 | **Fixed** | The note now gives the Greek (no "again") as the reason |
| D-N3 | `IMPACT.md` said "described below" | **Fixed** | Now "described above" |
| D-N4 | `IMPACT.md` said the 3.3 anchors "project exactly through equal spans" | **Fixed** | Now says to apply the listed values (998, 1019) as given, matching `MAPPING.md` |
| D-N5 | Statements about the final commit cannot be checked until it exists | **Done in the final commit** | `STATUS.md` removed; `README.md`, `RELEASE-PACKET.md` (§3.5 Danish dependency; §6 decisions, including the gate), `ACCEPTANCE.md`, `reviews/REVERIFY-DELTA.md` and `HASHES.sha256` (every package file) present |
| D-N6 | Chapter-3 nuance list missed a 3.4 shift | **Fixed** | Added to `CHANGES.md` |
