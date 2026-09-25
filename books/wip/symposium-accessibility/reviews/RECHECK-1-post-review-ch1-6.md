# Recheck 1: post-review changes to the Symposium modern-en, chapters 1–6

- **Role:** independent recheck reviewer. I did not write the text under review or any of the earlier reviews.
- **Packet:** `review-in/recheck-packet-1.md`. It covers the 51 paragraphs in chapters 1–6 that changed after Reviews 1A, 1B and 2.
- **v3 sha256 (packet header):** `72838e2974791827de76d8d65900310541e4146abf71a975eb47d60b570e6ddf`. Verified against `cand/symposium-modern-en.json`.
- **v1 sha256 (packet header):** `46fa34ea4821eb2fa5e713915acb40bbf10fe224d79682adde9f68feb2b0113e`. Verified against `books/wip/symposium-accessibility/candidate/symposium-modern-en.json`.
- **Source and baseline:**
  - source: `base-original-en.json` (Jowett), sha256 `3521a12d…95a6`;
  - baseline: `base-modern-en.json`, sha256 `1e970b7b…374f`.

  Both match STYLE.md §1.
- **Standard:** `STYLE.md`, read in full. That includes §1a (source policy and documented exceptions), §3 (quotation and speaker conventions, as updated after the reviews) and §4 (glossary).
- **Date:** 2026-09-25

## Method

- **Packet integrity.**
  - For all 51 coordinates, the packet's JOWETT, V1 and V3 texts match the JSON files character for character.
  - The 51 coordinates are exactly the paragraphs that differ between v1 and v3 in chapters 1–6. None is missing and none is extra.
  - The structure is unchanged: 8 chapters, 226 paragraphs and the same titles.
- **Edit accounting.** I ran a word-level diff on every v1→v3 pair. It shows no change beyond the listed edit IDs. The 5.13 snippet labelled B13 also carries Review 1B #14 ("I know that").
- **Fidelity.**
  - I compared every V3 paragraph with Jowett sentence by sentence, not only at the edit sites.
  - I used the accepted baseline to label wording as either "baseline" (pre-existing) or "v1" (introduced by the accessibility pass).
  - Some findings say that v1 wording appears to follow Plato's Greek. That only explains the likely origin. Every finding rests on the comparison with Jowett, as §1a requires.
- **Continuity.** I read the neighboring paragraphs to check quotation levels and who is speaking: 1.13–1.25, 1.43–1.47, 5.1–5.2, 5.12–5.17, 6.0–6.12 and 7.0.
- **House style, all 51 paragraphs:**
  - the spaced em-dash is the only non-ASCII character;
  - there are no curly quotes and no `--`;
  - there are no British spellings;
  - no glossary source-terms are left: "want" survives only as desire, and "the God of War" is kept per §4;
  - contractions appear only in conversation and in 3.0, where §6 leaves them;
  - apart from pronouns replaced by the name ("this Love's" in 3.1, "serves Love" in 6.3), the only Love/love capital that differs from Jowett's is the one in #2 below.
- **Constraints kept.** I did not use the web or any external source. I made no helper files and ran no git commands. This report is the only file I wrote.

## Verdict: ACCEPT WITH CHANGES

**Every post-review edit in chapters 1–6 does what its finding asked, either verbatim or with an equivalent wording. None introduces an error that must be fixed.**

- **Review 1A:** its BLOCKING item (3.3, "the love of youths") and all eight of its SHOULD-FIX items are resolved.
- **Review 1B:** all of its chapter 5–6 SHOULD-FIX items are resolved.
- **Review 2:** the SHOULD-FIX rows that fall in this packet are resolved:
  - row 5, the verse quotation runs;
  - row 25, 'uses base' in 3.8;
  - row 30, "his rule" in 4.1;
  - row 39, the colon at 6.1, fixed at 6.2;
  - row 41, ":—" in 6.12.

  Row 1 (a label at 1.0) is outside the packet, because the restored opening is left unchanged on purpose.
- **Chapter 1 quotation runs.** 1.15–1.22 and 1.44–1.46 now follow §3.4 exactly:
  - the speaker's quotation stays open at the end of each paragraph and is reopened at the start of the next;
  - verse is nested in double marks;
  - the speech closes only at 1.19, 1.22 and 1.46.

  It is now always clear who is speaking.
- **Greek-based wording that Review 1B named** is back to Jowett in this packet: 5.1 ("made up of"), 5.3 ("at least" deleted, "young"), 5.4 ("embrace") and 5.7 ("so" became "but"; see #14 for the rest of that phrase). 5.6's "escape the one fate" is also back to Jowett's "avoid evil".
- **Documented exceptions.** Both exceptions in this packet, 4.1 and 3.8, are justified on their merits (see below).
- **Nothing accepted was reverted.** The three confirmation sentences and the opening 1.0–1.8 are intact.

**Changes are still needed.** Checking whole paragraphs found two fidelity slips in wording that the edits did not touch, inside paragraphs that were edited. The reviews missed both:

- **3.5 (#4):** "fathers" for Jowett's "parents". This comes from the baseline.
- **5.1 (#11):** the text makes Homer the one who tells the story about the round people. This was introduced in v1.

Each is a one-phrase fix.

**The 14 OPTIONAL items are of two kinds:**

- **Small nuances lost by the edits themselves:** #1, #5, #7, #10 and #12.
- **Older wording that departs from Jowett:** #2, #3, #6, #8, #9 and #13–#16.
  - Most of the v1 items appear to follow the Greek.
  - §1a states that v1 changes following the Greek "were reverted". To keep that statement accurate, the lead should either revert #8, #9, #13, #14 and #16, or record them in §1a as accepted renderings that change nothing of substance.

**Counts:** BLOCKING 0 · SHOULD-FIX 2 · OPTIONAL 14.

## Findings

| # | Coordinate | Edit ID | Severity | Finding | Exact V3 wording | Suggested fix |
|---|---|---|---|---|---|---|
| 1 | 1.45 | E5h | OPTIONAL | **New typographic slip.** The added inner double quotes now enclose the editorial dash, so the dash reads as part of Euripides's line. Jowett's line is 'Not mine the word', with no dash; the dash comes from the baseline. Elsewhere only Jowett's own punctuation sits inside the verse marks (1.16, 1.18, 1.21). At 8.11, the model for nested verse, nothing is added inside. The wording is intact (item 5). | `'"Not mine the word —"` | `'"Not mine the word" —` |
| 2 | 3.0 | none (baseline wording; same passage as A23) | OPTIONAL | **Capitalization rule.** The glossary rule is "As Jowett capitalizes", which was applied after the reviews in 4.0 and 4.1 (CAP-40, CAP-41). This is the only place in the 51 paragraphs where V3 writes "Love" for Jowett's lowercase "love": Jowett has "as the other love is called heavenly". The capitals on Heavenly and Common follow the glossary's naming rule and are not at issue. It is visual only; the audio is unaffected. | "just as the other Love is called Heavenly" | "just as the other love is called Heavenly". Or record the capital as a deliberate exception; it parallels "the Love who works alongside her". |
| 3 | 3.2 | none (baseline wording) | OPTIONAL | **Connective changed (§1a).** Jowett's explanatory "for surely nothing that is decorously and lawfully done can justly be censured" becomes an adversative "But surely". That turns Pausanias's explanation (the censure arises from improper conduct) into a rebuttal of the critics. The added "altogether" sharpens the rebuttal further. | "and some have been led to deny the lawfulness of such attachments altogether because they see the impropriety and evil in them. But surely nothing done decorously and lawfully can justly be censured." | "and some have been led to deny the lawfulness of such attachments because they see the impropriety and evil in them; for surely nothing done decorously and lawfully can justly be censured." |
| 4 | 3.5 | none (baseline wording) | SHOULD-FIX | **Relationship term narrowed.** Jowett: "But when parents forbid their sons to talk with their lovers". "Fathers" leaves out mothers. §2 keeps relationships as the source states them, and §1a forbids changing a relationship on the strength of the Greek, whose *pateres* is the likely origin. This is a one-word fix in a paragraph that was edited after the reviews (A5). | "But then again — when fathers forbid their sons to speak with their lovers" | "But then again — when parents forbid their sons to speak with their lovers" |
| 5 | 3.5 | A5 | OPTIONAL | **Nuance lost by the fix.** The fix correctly removes the pronoun reversal. But it drops Jowett's "refuse" ("their elders refuse to silence the reprovers and do not rebuke them"). A deliberate refusal becomes mere inaction, which weakens the evidence Pausanias is lining up. | "and their elders neither silence nor rebuke those who taunt them" | "and their elders refuse to silence or rebuke those who taunt them" |
| 6 | 3.5 | none (baseline wording) | OPTIONAL | **Softening.** Jowett's "endure a slavery worse than that of any slave" becomes "servitude". §2 keeps slavery as the source states it, and the slavery/slave echo is the rhetorical point. | "endure a servitude worse than any slave's" | "endure a slavery worse than any slave's" |
| 7 | 3.8 | A7 | OPTIONAL | **Tense introduced.** Otherwise the fix does what Review 1A #7 asked: it uses the glossary's "beloved" and reads Victorian "gracious" as "granting favors", which the same paragraph's "yields to a lover" confirms. But Jowett's tenseless "his gracious loving one" becomes a completed act, "who has yielded to him". The same sentence ends "and only then, may the beloved yield honorably". Heard in order, the beloved has already yielded before the condition for yielding is stated. | "for the beloved who has yielded to him" | "for the beloved who yields to him" (or "who grants him favors") |
| 8 | 4.1 | none (v1 wording) | OPTIONAL | **(a) Connective changed (§1a).** Jowett: "the best physician is he who is able to separate fair love from foul, or to convert one into the other". "And" makes the two abilities a joint requirement. **(b) Minor omission:** Jowett's "as our friends the poets here tell us" loses "friends", Eryximachus's nod to Agathon and Aristophanes. The documented exception in the same paragraph is fine (see below). | "The best physician is the one who can tell the noble love from the base, and can turn one into the other"; "as our poets here tell us" | "...from the base, or can turn one into the other"; "as our friends the poets here tell us" |
| 9 | 4.2 | none (v1 wording; the second item is in the sentence A19a edited) | OPTIONAL | **(a) Qualifier added (§1a).** Jowett's "symphony is an agreement" becomes "a kind of agreement"; the Greek *tis* is the likely origin. **(b) Scope narrowed.** Jowett has "as in the former instance, medicine, so in all these other cases, music implants". V3 has "Here", which after the sentence about rhythm reads as rhythm alone. | "For harmony is consonance, and consonance is a kind of agreement"; "Here it is music that creates this agreement, as medicine does in the body" | "and consonance is an agreement"; "In all these cases it is music that creates this agreement, as medicine does in the body" |
| 10 | 4.8 | E34 | OPTIONAL | **Qualifier dropped.** The restructure correctly settles what the dash refers to. But it drops Jowett's "only" ("I shall only be laughed at by them"): what Aristophanes fears is being merely laughed at. | `but that they will laugh at me.'` | `but that they will only laugh at me.'` |
| 11 | 5.1 | none (v1 wording; the baseline kept Jowett's construction) | SHOULD-FIX | **Changes who says what.** Jowett: "of them is told the tale of Otys and Ephialtes who, as Homer says, dared to scale heaven". Homer is cited only for the pair's attempt on heaven. The link between that tale and the round people is made in the passive and credited to no one. V3 makes Homer the one who tells the story about the round people. Jowett makes no such claim, and a reader who knows Homer will find it false. | "It is of them that Homer tells the story of Otys and Ephialtes, who dared to climb up to heaven and would have laid hands on the gods." | "It is of them that the story of Otys and Ephialtes is told — the two who, as Homer says, dared to climb up to heaven and would have laid hands on the gods." |
| 12 | 5.1 | B2 | OPTIONAL | **Listening stumble.** B2 correctly restores "made up of" and the child relation. But the verb is still left out: Review 1B's wording had "was", and V3 does not. Heard aloud, "female the child" runs together. | "and the one that was both male and female the child of the moon, which is made up of sun and earth." | "and the one that was both male and female was the child of the moon, which is made up of sun and earth." |
| 13 | 5.6 | none (v1 wording; same clause as B9) | OPTIONAL | **Love's role changed.** Jowett: "the good, of which Love is to us the lord and minister", so Love rules the good and hands it out. v1's "lord and guide, leads us to" (likely from the Greek *hegemon*, leader) replaces "minister" with a leader, and the pairing of lord and servant is lost. B9 restored Jowett's wording for the other v1 departure in this clause ("avoid evil"), but not for this one. | "so that we may avoid evil and win the good things that Love, our lord and guide, leads us to" | "so that we may avoid evil and win the good things of which Love is our lord and minister" (or "our lord and provider") |
| 14 | 5.7 | none (v1 wording; same sentence as B11) | OPTIONAL | **Addition not licensed by STYLE.** Jowett has no "as I asked"; he writes "which, although different to yours, I must beg you to leave unassailed". Review 1B's verdict listed "so, as I asked" among the wordings that follow the Greek, but only "so" was reverted. The content is harmless, since 5.6 did make the request, but the phrase turns a fresh plea into a reminder. | "It is different from yours, but, as I asked, please do not make it a target for your jokes" | "It is different from yours, but I must beg you not to make it a target for your jokes" |
| 15 | 6.6 | none (v1 wording; paragraph edited by E-bb) | OPTIONAL | **Agathon's ornament flattened.** STYLE §2 says Agathon is "fond of balanced, rhyming phrases" and his ornament is "not flattened". Jowett's jingle "regardful of the good, regardless of the evil" becomes the unrhymed "mindful ... heedless". E-bb restored Jowett's ornament one line later; the same treatment fits here. | "mindful of the good, heedless of the bad" | "caring for the good, careless of the bad" (or Jowett's "regardful of the good, regardless of the evil") |
| 16 | 6.6 | none (v1 wording) | OPTIONAL | **v1 wording that follows the Greek rather than Jowett**, contrary to §1a's statement that such changes were reverted: (a) "in sacrifices, feasts, dances, he is our lord" becomes "leads us", so lord becomes leader; (b) "parent of" becomes "father of"; (c) "half-playful, yet having a certain measure of seriousness" becomes "partly playful and partly, in a modest way, serious", losing the concessive "yet"; (d) two minor changes: "men/them" becomes "us", and "banquets such as these" becomes "gatherings like this one". None changes the substance of the hymn. Revert them, or record them in §1a as accepted. | "who brings us together at gatherings like this one, and leads us at sacrifices, feasts and dances"; "He is the father of delicacy"; "partly playful and partly, in a modest way, serious" | "...and is our lord at sacrifices, feasts and dances"; "He is the parent of delicacy"; "half playful, yet with a certain measure of seriousness" |

## Documented exceptions, judged on their merits

### 4.1, "under the rule of love": justified

- **Grammar favors Asclepius, but the sense does not.** Jowett's "his dominion" ends a sentence whose subject is Asclepius. Asclepius founded medicine, but nothing makes him the ruler of physical training and farming. Read that way, the sentence becomes a stray boast.
- **The speech's own argument fixes the referent:**
  - 4.0 states the thesis, "his rule extends over all things", which "the rule of love" now echoes;
  - 4.1 opens by defining medicine as knowledge of the body's loves and desires;
  - the next sentence, "the same reconciliation of opposites" in music, extends the pattern that love governs.
- **The wording is minimal.** It names the referent and adds nothing else. The lowercase "love" matches Jowett's own name for the god in 4.0, "the deity of love" (CAP-40).
- **Status.** It is documented in §1a, and it resolves Review 1A #8 and Review 2 row 30.

### 3.8, 'uses base' followed by "would let anyone use him basely": justified

- **The quotation is kept verbatim,** so the confirmation sentence is intact.
- **The gloss restates Jowett's own image.** It imports nothing from the Greek and adds no judgment beyond the source's "base". It is set off with dashes, not brackets, as §5 requires.
- **It works when heard.** It parses as a second verb phrase under "to show that he", and it resolves Review 2 row 25.

## Coverage: 51 of 51 coordinates

| Coordinate | Edits verified | Result |
|---|---|---|
| 1.9 | E4 | OK |
| 1.12 | A10 | OK |
| 1.15 | E5a | OK (quotation left open) |
| 1.16 | E5b | OK (verse wording = Jowett) |
| 1.17 | E5c | OK |
| 1.18 | E5d | OK (verse wording = Jowett) |
| 1.19 | A11a, A11b | OK (lowercase continuation; speech closes here) |
| 1.20 | E5e | OK ("after all" renders Jowett's "still", meaning "nevertheless") |
| 1.21 | E5f | OK (verse wording = Jowett) |
| 1.26 | A12 | OK |
| 1.32 | A13 | OK ("my" is Apollodorus, the frame narrator) |
| 1.33 | A2 | OK (antecedent "lost in thought" at 1.25 and 1.32) |
| 1.36 | A3 | OK |
| 1.44 | E5g | OK |
| 1.45 | E5h | #1 (verse wording = Jowett plus the dash inherited from the baseline) |
| 1.46 | A4 | OK (= Jowett's "offer him a contribution"; nested quotation of Phaedrus balanced; the speech closes here) |
| 2.0 | A14 | OK |
| 2.4 | A15 | OK |
| 2.6 | E15 | OK |
| 3.0 | A23 | #2 (A23 itself is correct per the glossary's "capitalized when naming") |
| 3.1 | E17 | OK (same referent as Jowett's "his") |
| 3.2 | E18 | #3 (E18 correct: Jowett's "play the fool with" means "make fools of" here, as his context shows) |
| 3.3 | A1, E20a | OK (Review 1A's BLOCKING item resolved; confirmation present) |
| 3.5 | A5 | #4, #5, #6 (the pronoun reversal is fixed) |
| 3.6 | A16a, A16b | OK |
| 3.7 | A17 | OK (confirmation present) |
| 3.8 | A6, A7, E25 (exception), E26 | #7 (confirmation present; exception justified) |
| 3.10 | E28 | OK (the gloss names the pun; Jowett's "balanced" and "the wise" kept) |
| 4.0 | A18, CAP-40, E29 | OK |
| 4.1 | A8, superseded by CAP-41 (exception) | #8 (exception justified) |
| 4.2 | A19a, A19b, E31 | #9 |
| 4.3 | A9, A20a, A20b, E33 | OK |
| 4.4 | A21 | OK |
| 4.5 | A22 | OK |
| 4.8 | E34 | #10 |
| 5.0 | B1 | OK |
| 5.1 | B2 | #11, #12 |
| 5.2 | B4 | OK |
| 5.3 | B5, B6, E37 | OK |
| 5.4 | B7a, B7b, B8 | OK |
| 5.6 | B9, B10 | #13 |
| 5.7 | B11 | #14 |
| 5.13 | B13 (also carries B14) | OK |
| 5.15 | B15 | OK |
| 5.16 | B16 | OK |
| 6.2 | B17, E39 | OK (lowercase continuation after the colon ending 6.1's verse, like Jowett's "herein") |
| 6.3 | B18 | OK |
| 6.4 | B12, B19 | OK |
| 6.6 | E-bb | #15, #16 (E-bb = Jowett's "leader best and brightest") |
| 6.11 | B20 | OK (6.12's "I grant the permission" now has its antecedent) |
| 6.12 | E41 | OK |

Summary: 39 coordinates are OK. The other 12 carry findings: 1.45, 3.0, 3.2, 3.5, 3.8, 4.1, 4.2, 4.8, 5.1, 5.6, 5.7 and 6.6.

## Confirmations (items 4 and 5)

- **Opening 1.0–1.8:** unchanged. It is identical to v1 and to the accepted baseline, and none of it is in this packet.
- **3.3:** "For Aristogeiton's love and Harmodius's constancy proved strong enough to bring down their power." Present verbatim, and it occurs once in the whole edition (at 3.3).
- **3.7:** "There remains, then, only one honorable way, allowed by custom, for the beloved to yield — the way of virtue." Present verbatim, once (at 3.7).
- **3.8:** "because he has done his best to show that he would give himself up to anyone's 'uses base'". Present verbatim, once (at 3.8). The E25 gloss follows immediately.
- **Verse lines:**
  - with quotation marks removed, 1.16, 1.18 and 1.21 are identical to Jowett and to v1;
  - 1.45 is identical to v1, and to Jowett's "Not mine the word" plus the editorial dash inherited from the baseline (see #1);
  - in all four, only the quotation marks changed.
- **No other reversal:** the word-level diff shows that nothing else in the 51 paragraphs changed.
