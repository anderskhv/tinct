# Review findings: resolution log

Two independent reviews were run on candidate v1:

- Review 1 (`REVIEW-1-completeness-fidelity.md`): full-book completeness and fidelity, with source access.
- Review 2 (`REVIEW-2-blind-reader.md`): a blind Modern English read, without source access.

Every finding is resolved below. Every change made in response was then re-verified independently (`REVERIFY.md`).

## Review 1 (completeness and fidelity): resolution

Reviewed v1 candidates: original-en `3521a12d…95a6`, modern-en `43f03333…e550`. After resolution: original-en `3521a12d…95a6` (unchanged), modern-en `073ca5b4…3eae`.

| # | Finding | Decision | Result |
|---|---|---|---|
| F1 | BLOCKING (repo policy, pre-existing): modern-en fails the similarity gate (candidate 0.868; 6 of 8 chapters LIGHT) | **Escalated; not resolvable within this assignment**, which forbids rewriting clear passages merely to lower the score | Now 0.866, against 0.877 for the live baseline: no regression. Recorded as a decision for Anders in `RELEASE-PACKET.md` §6: a waiver for this completeness repair, and/or a separate modern-English re-rendering of chapters 2 and 4–8 |
| F2 | SHOULD-FIX: 3.7 drops "which custom allows" | **Fixed (C-06)** | "…only one honorable way that custom allows for the beloved to yield — the way of virtue." |
| F3 | SHOULD-FIX: the proposed Phoenix card blames Phoenix for the vagueness | **Fixed** | "Philip's son, who heard about the banquet from Aristodemus and passed the story on; it reached Glaucon only as a vague second-hand account." |
| F4 | SHOULD-FIX: Danish would stay flagged `aligned` | **Made a hard release dependency, with a decision item** | `RELEASE-PACKET.md` §3.5 and §6.1; `impact/modern-da-report.md` recommends option A (`aligned: false`, text untouched) |
| F5 | NOTE: 8.0/8.1 split inside Alcibiades's speech | **Kept, documented** | Merging later would need an offset row (`CHANGES.md`) |
| F6 | NOTE: 20 notes, not 17; "(daimon)" is Jowett's gloss; "(Greek)" placeholder | **Corrected** | `COVERAGE.md` and `SOURCE.md` count 20 notes in 17 paragraphs and classify "(daimon)" as a gloss kept in modern-en. The "(Greek)" placeholder is disclosed |
| F7 | NOTE: `SOURCE.md` shows only the TXT update date, misses six upstream slips, and "Jowett (1871)" is unverified | **Corrected** | Both header dates recorded. All 10 slips listed with coordinates. The edition-year caveat is recorded for the registry owner |
| F8 | NOTE: pre-existing modern-en nuances | **Partly fixed** | 3.3 garbled clause: **fixed (C-06)**. 3.8 dropped hedge "done his best" and quotation 'uses base': **fixed (C-06)**. 3.2 "But surely", 3.6 "both lover and beloved" and 4.1 "the poets here" are judged not defects of meaning: recorded, not changed. 1.46 inner quotation marks and the British spellings are cosmetic: recorded, not changed |
| F9 | NOTE: small additions in the restored paragraphs | **Adopted in part** | "only" removed (1.0); "not even three years" → "not yet three years" (1.3). "Whole story" kept: after dropping "again" (Review 2, finding 11), it renders Jowett's "the tale over again", meaning in full |
| F10 | NOTE: the package was still changing | **Handled at finalization** | `STATUS.md` removed. `README.md`, `RELEASE-PACKET.md`, `ACCEPTANCE.md` and `HASHES.sha256` written. All checks re-run on the final bytes |
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
| 5 | Ambiguous "his/He" and repeated "account" in 1.0 | **Adopted (adapted)** | "Someone told me what he had heard from Phoenix, the son of Philip, but his account was very vague. He did say, though, that you knew about them, so I'd like to hear about them from you." The reader's "the whole story" was not adopted because it is not in Jowett |
| 6 | Name Socrates in "your friend's words" | **Declined** | Jowett and Plato leave the friend implicit. The reader can infer it from the list of speakers just before, and 1.3 confirms it |
| 7 | "know" used twice in 1.3 | **Adopted** | "since I began keeping company with Socrates". This is closer to the Greek (συνδιατρίβω) and keeps Jowett's sense |
| 8 | "well occupied" | **Adopted** | "thinking I was doing something worthwhile" (Jowett: "fancying myself to be well employed"). It echoes 1.7, as the same Greek phrase does |
| 9 | 1.5 could be read as dating the prize | **Adopted** | "…at the time Agathon won the prize with his first tragedy. It was the day after he and his chorus had offered their victory sacrifice." |
| 10 | 1.7 sentence order, and the unfamiliar word "deme" | **Adopted, except "deme"** | "'No, not Socrates,' I replied. 'It was the same man who told Phoenix — Aristodemus, of the deme of Cydathenaeum, a little fellow who never wore shoes." "Deme" is kept because it is Jowett's historical term and the edition keeps comparable terms ("Phaedrus the Myrrhinusian") |
| 11 | "the whole story again" implies Glaucon heard it before | **Adopted** | "let's have the whole story". The Greek asks simply "why not tell it to me?". The later "again" addressed to the companion stays, since Apollodorus has told it before. The paragraph split was declined (alignment) |
| 12 | "the talk of you rich men" misread; plural "my friends" | **Adopted reorder; plural kept** | "especially the talk of rich men and businessmen like you". The plural is kept because Jowett's "you who are my companions" is plural, as is the Greek |
| 13 | "I dare say… creature" dated, and "creature" repeated | **Adopted** | "I suppose you pity me in return and think I'm miserable" |
| 14–18, 20 | Notes confirming speaker framing, facts, house style and the ch 7/8 boundary | Noted | No action |
| 19 | 1.14 "I replied" and 1.26 "I turned round" slip into first person | **No change** | These are Aristodemus's own words ("the exact words of Aristodemus") in Jowett as well. They are faithful existing text |
| 21–22 | Existing-text typography: 8.1 and 7.68 quotation marks, "revellers"/"ribands", 1.33 doubled quotes, 1.20–1.22 quotes | **Recorded, not changed** | Pre-existing, outside the repair, and cosmetic. The paragraphs stay byte-identical so offsets are preserved exactly (`CHANGES.md`, "Checked and deliberately not changed") |
