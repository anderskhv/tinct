# Resolution of review findings: Symposium modern-en accessibility pass

Every finding of the independent reviews, with its disposition. The lead (the author of the pass) resolved the findings. Every edit made after a review was then rechecked independently against the findings it resolves (Rechecks 1–4), and the whole book was read again for terminology, speaker attribution and consistency (the consistency pass).

**Candidate history**

| Version | sha256 | What changed |
|---|---|---|
| v1 | `46fa34ea4821eb2fa5e713915acb40bbf10fe224d79682adde9f68feb2b0113e` | Reviewed by Reviews 1A–1D (source) and Review 2 (blind reader) |
| v2 | `0f9d7c4c9cb7e97f89b93c7314aaa783d17375815d54d8d451a33ba01dba4d46` | Review 1A–1D findings resolved |
| v3 | `72838e2974791827de76d8d65900310541e4146abf71a975eb47d60b570e6ddf` | Review 2 findings resolved; STYLE.md conventions §3.4–§3.5 applied |
| v4 | `50cc0004ebb506b6d947bb12140441a9f4d095afa1e9d7c6a296ef145e134b32` | Recheck 1, Recheck 2 and consistency-pass findings resolved; STYLE §1a, §3.5, §4 and §5 aligned |
| v5 | `a848700fabaa280b3f174534df048cb3db14be5054a11c6e2a7095fb5536b76d` | Recheck 3 findings resolved (7 paragraphs); STYLE §3.5 and SOURCE-NOTES §3 aligned. Rechecked by Recheck 4 (accept; its one note recorded, no text change). **This is the final candidate.** |

**Edit IDs** (listed in the "Edits" column): A#, B#, C# and D# are finding numbers in Reviews 1A–1D; C28-* and D20* are items in those reviewers' lists of Greek-derived wording, reverted to Jowett; E# are item numbers in Review 2; CAP-* are the lead's capitalization audit against Jowett; E-bb is listed below; R1-#, R2-# and K-# are finding numbers in Recheck 1, Recheck 2 and the consistency pass; R3-# are finding numbers in Recheck 3. The final wording of every changed paragraph, with its reason, is in `CHANGES.md`.

## Summary

| Review | Reviewed | Verdict | Blocking | Should-fix | Optional | Outcome |
|---|---|---|---|---|---|---|
| [1A: source fidelity, chapters 1–4](REVIEW-1A-source-ch1-4.md) | v1 | ACCEPT WITH CHANGES | 1 | 8 | 14 | 23 adopted |
| [1B: source fidelity, chapters 5, 6 and 7.0–7.44](REVIEW-1B-source-ch5-7a.md) | v1 | ACCEPT WITH CHANGES | 0 | 11 | 11 | 20 adopted; 1 declined; 1 superseded |
| [1C: source fidelity, 7.45–7.68 (Diotima)](REVIEW-1C-source-7b.md) | v1 | ACCEPT WITH CHANGES | 5 | 11 | 12 | 28 adopted |
| [1D: source fidelity, chapter 8](REVIEW-1D-source-ch8.md) | v1 | ACCEPT WITH CHANGES | 2 | 18 | 14 | 31 adopted; 3 declined |
| [2: blind reader, whole book](REVIEW-2-blind-reader.md) | v1 | ACCEPT WITH CHANGES | 0 | 15 | 53 | 29 adopted; 27 declined; 7 already fixed; 3 already fixed in part; 2 partly adopted |
| [Recheck 1: every post-review change, chapters 1-6](RECHECK-1-post-review-ch1-6.md) | v3 | ACCEPT WITH CHANGES | 0 | 2 | 14 | 16 adopted |
| [Recheck 2: every post-review change, chapters 7-8](RECHECK-2-post-review-ch7-8.md) | v3 | ACCEPT | 0 | 0 | 16 | 16 adopted |
| [Consistency pass: whole book](CONSISTENCY-PASS-v3.md) | v3 | CONSISTENT WITH CHANGES | 0 | 6 | 14 | 15 adopted; 4 declined; 1 partly adopted |
| [Recheck 3: every change after v3](RECHECK-3-delta-v4.md) | v4 | ACCEPT | 0 | 0 | 9 | 9 adopted |
| [Recheck 4: every change after v4](RECHECK-4-delta-v5.md) | v5 | ACCEPT | 0 | 0 | 1 | 1 adopted |

**Blocking and should-fix findings:** 79 in all. Every one was adopted, already fixed or superseded by a later fix, except Review 2 #1. That item asked for a speaker label at 1.0: Jowett's opening has none (his labels begin at 1.8), and the restored opening 1.0-1.8 stays byte-identical to the accepted completeness text (SOURCE-NOTES.md §2). Every declined optional finding has its reason below.

## Review 1A: source fidelity, chapters 1–4

| # | Severity | Finding | Disposition | Note | Edits |
|---|---|---|---|---|---|
| 1 | BLOCKING | 3.3 "love between males" generalizes Jowett's "loves of youths" (pre-existing) | Adopted |  | A1 |
| 2 | SHOULD-FIX | 1.33 orphaned "the fit" | Adopted |  | A2 |
| 3 | SHOULD-FIX | 1.36 misplaced "badly" | Adopted |  | A3 |
| 4 | SHOULD-FIX | 1.46 "in his honor" changes who is honored | Adopted |  | A4 |
| 5 | SHOULD-FIX | 3.5 "rebuke them" pronoun can reverse sense (pre-existing) | Adopted |  | A5 |
| 6 | SHOULD-FIX | 3.8 "the love of youth" (pre-existing) | Adopted |  | A6 |
| 7 | SHOULD-FIX | 3.8 "gracious loved one" (pre-existing) | Adopted |  | A7 |
| 8 | SHOULD-FIX | 4.1 "his rule" reads as Asclepius's | Adopted | Documented exception (STYLE §1a); lowercase "love" per glossary (CAP-41) | A8, CAP-41 |
| 9 | SHOULD-FIX | 4.3 "excess" softens "licentiousness" | Adopted |  | A9 |
| 10 | OPTIONAL | 1.12 causal link weakened | Adopted |  | A10 |
| 11 | OPTIONAL | 1.19 superlative; lowercase continuation | Adopted |  | A11a, A11b |
| 12 | OPTIONAL | 1.26 he/his ambiguity | Adopted |  | A12 |
| 13 | OPTIONAL | 1.32 "my informant" lost | Adopted |  | A13 |
| 14 | OPTIONAL | 2.0 "The proof" for "a proof" | Adopted |  | A14 |
| 15 | OPTIONAL | 2.4 adverbial "cowardly" | Adopted |  | A15 |
| 16 | OPTIONAL | 3.6 "both lover and beloved"; "isn't" (pre-existing) | Adopted |  | A16a, A16b |
| 17 | OPTIONAL | 3.7 "by the fear of losing them" (pre-existing) | Adopted |  | A17 |
| 18 | OPTIONAL | 4.0 healthy/diseased as two bodies | Adopted |  | A18 |
| 19 | OPTIONAL | 4.2 "latter"; "did" | Adopted |  | A19a, A19b |
| 20 | OPTIONAL | 4.3 Urania's epithet; "overindulgence" added | Adopted |  | A20a, A20b |
| 21 | OPTIONAL | 4.4 "feelings" became "conduct" | Adopted |  | A21 |
| 22 | OPTIONAL | 4.5 "fulfilled with" | Adopted |  | A22 |
| 23 | OPTIONAL | Glossary: fair (moral) → noble; Heavenly/Common capitals | Adopted | STYLE §4 rows added; 3.0 aligned with 3.1 | A23 |

## Review 1B: source fidelity, chapters 5, 6 and 7.0–7.44

| # | Severity | Finding | Disposition | Note | Edits |
|---|---|---|---|---|---|
| 1 | OPTIONAL | 5.0 number agreement | Adopted |  | B1 |
| 2 | SHOULD-FIX | 5.1 "shares in" for "is made up of" | Adopted |  | B2 |
| 3 | OPTIONAL | Otys, Athene spellings | Declined | Jowett's forms kept as recognizable and as card mention texts; recorded in STYLE §4 |  |
| 4 | SHOULD-FIX | 5.2 survivor sentence | Adopted |  | B4 |
| 5 | SHOULD-FIX | 5.3 "at least" (Greek-based) | Adopted | Reverted to Jowett | B5 |
| 6 | SHOULD-FIX | 5.3 "boys" for Jowett's "young" | Adopted | Reverted to Jowett | B6 |
| 7 | SHOULD-FIX | 5.4 "welcome" softens "embrace" | Adopted |  | B7a, B7b |
| 8 | OPTIONAL | 5.4 "as I may say" | Adopted |  | B8 |
| 9 | SHOULD-FIX | 5.6 "escape the one fate" | Adopted |  | B9 |
| 10 | OPTIONAL | 5.6 "gravestones" for "monuments" | Adopted |  | B10 |
| 11 | SHOULD-FIX | 5.7 "so" for "although" | Adopted |  | B11 |
| 12 | OPTIONAL | Contractions in set speeches | Adopted | Fixed in 5.7 and 6.4; STYLE §6 rule refined (Alcibiades and remembered dialogue allowed) | B11, B12 |
| 13 | SHOULD-FIX | 5.13 "foolish" dropped | Adopted |  | B13 |
| 14 | OPTIONAL | 5.13 "I know" dropped | Adopted |  | B13 |
| 15 | OPTIONAL | 5.15 "even"; "in their presence" | Adopted |  | B15 |
| 16 | OPTIONAL | 5.16 "won't care in the least" | Adopted |  | B16 |
| 17 | OPTIONAL | 6.2 "The proof" | Adopted |  | B17 |
| 18 | OPTIONAL | 6.3 personification of the laws flattened | Adopted | Reordered to avoid a comma pile-up | B18 |
| 19 | SHOULD-FIX | 6.4 "the love of beauty" lowercases Jowett's "Love" | Adopted | Glossary rule: as Jowett capitalizes | B19 |
| 20 | SHOULD-FIX | 6.11 "permission" dropped (6.12 refers back) | Adopted |  | B20 |
| 21 | OPTIONAL | 7.0 father/mother remark opaque | Superseded | Resolved by Review 2 #42 (documented gloss) | E42 |
| 22 | SHOULD-FIX | 7.44 "beloved Agathon" softened; "for" dropped | Adopted |  | B22 |

## Review 1C: source fidelity, 7.45–7.68 (Diotima)

| # | Severity | Finding | Disposition | Note | Edits |
|---|---|---|---|---|---|
| 1 | BLOCKING | 7.48 "conceived" for Jowett's "born" | Adopted |  | C1 |
| 2 | BLOCKING | 7.54 question attributed to Diotima | Adopted | Tagged "I asked"; answer tagged "she replied" as in Jowett | C2 |
| 3 | BLOCKING | 7.60 "married" image lost | Adopted | "wedded by a far closer tie" | C3 |
| 4 | BLOCKING | 7.63 "boy" for "youth"; "devoted to" for "in love with" | Adopted |  | C4 |
| 5 | BLOCKING | 7.66 "enabled to" lost | Adopted |  | C5 |
| 6 | SHOULD-FIX | 7.47 "commonplace" softens "vulgar" | Adopted |  | C6 |
| 7 | SHOULD-FIX | 7.48 negation scope | Adopted |  | C7 |
| 8 | SHOULD-FIX | 7.51 "every cause" (Greek) for Jowett's "all creation" | Adopted |  | C8 |
| 9 | SHOULD-FIX | 7.55 "Don't be surprised if" misparse | Adopted |  | C9 |
| 10 | SHOULD-FIX | 7.56 "to us mortals" dropped | Adopted |  | C10 |
| 11 | SHOULD-FIX | 7.60 "in touch with" for "at the touch of" | Adopted |  | C11 |
| 12 | SHOULD-FIX | 7.60 "ordinary" moved; "mortal children" | Adopted |  | C3, C12 |
| 13 | SHOULD-FIX | 7.61 "non-Greeks" for "barbarians" | Adopted | Consistent with 3.3 and the source | C13 |
| 14 | SHOULD-FIX | 7.63 temporal "until" and "is a trifle" | Adopted |  | C14 |
| 15 | SHOULD-FIX | 7.64 "appear to him" (Greek) | Adopted |  | C15 |
| 16 | SHOULD-FIX | 7.65 negation scope of "colors and vanities" | Adopted |  | C16 |
| 17 | OPTIONAL | 7.45 elliptical question | Adopted |  | C17 |
| 18 | OPTIONAL | 7.45/7.46 Love/love capitalization | Adopted | Both lowercase, as in Jowett (glossary rule) | C18 |
| 19 | OPTIONAL | 7.46 "and" for "or" | Adopted |  | C19 |
| 20 | OPTIONAL | 7.47 "rites" for "mysteries" | Adopted |  | C20 |
| 21 | OPTIONAL | 7.48 "always" added; "dying"; "what is beautiful and good" | Adopted |  | C7, C21b, C21c |
| 22 | OPTIONAL | 7.49 hedge and intensifier added; colon | Adopted |  | C22a, C22bc |
| 23 | OPTIONAL | 7.53 awkward question | Adopted |  | C23 |
| 24 | OPTIONAL | 7.59 "people" for "men" | Adopted |  | C24 |
| 25 | OPTIONAL | 7.62 "in general"; "in its company"; front-loaded clause | Adopted | "beauty of form" later revised to "bodily beauty" (Review 2 #52) | C25a, C25b, C25c, E52a |
| 26 | OPTIONAL | 7.66 "in that communion"; "has hold of" | Adopted |  | C26a, C26b |
| 27 | OPTIONAL | 7.54/7.60/7.61 small additions; "Athens's" | Adopted |  | C27a, C27b, C27c |
| 28 | OPTIONAL | Systemic Greek-derived wording (list) | Adopted | Reverted to Jowett throughout 7.45–7.68 except "what loves" (7.49, kept for the love/beloved distinction, which Jowett's "principle of love" states) and "He will no longer be" (7.63, syntax only) | C28-747, C28-748a, C28-749, C28-751, C28-752, C28-753, C28-755, C28-759a, C28-759b, C28-760a, C28-760b, C28-764a, C28-764b, C28-764c, C28-765 |

## Review 1D: source fidelity, chapter 8

| # | Severity | Finding | Disposition | Note | Edits |
|---|---|---|---|---|---|
| 1 | BLOCKING | 8.31 "much less" weakened to "no more than" | Adopted |  | D1 |
| 2 | BLOCKING | 8.36 "never touched" softened to "hardly ever" | Adopted |  | D2 |
| 3 | SHOULD-FIX | 8.0 "his own speech" ambiguous | Adopted |  | D3 |
| 4 | SHOULD-FIX | 8.4 "bodily fear" and "attempts" lost | Adopted |  | D4 |
| 5 | SHOULD-FIX | 8.4 "good-looking" (glossary); "other" dropped | Adopted |  | D5 |
| 6 | SHOULD-FIX | 8.23 "deny yourself" idiom | Adopted |  | D6 |
| 7 | SHOULD-FIX | 8.23 Olympus unexplained | Adopted | "Olympus, Marsyas's pupil" (STYLE §5 example) | D7 |
| 8 | SHOULD-FIX | 8.23 "possess the soul" became "cast a spell" | Adopted |  | D8 |
| 9 | SHOULD-FIX | 8.28 "dined on" | Adopted |  | D9 |
| 10 | SHOULD-FIX | 8.28 "likely" dropped | Adopted |  | D10 |
| 11 | SHOULD-FIX | 8.28 "some other part" (Greek) | Adopted |  | D11 |
| 12 | SHOULD-FIX | 8.29 "too modest to say so" | Adopted |  | D12 |
| 13 | SHOULD-FIX | 8.29 "infinitely" weakened | Adopted |  | D13 |
| 14 | SHOULD-FIX | 8.36 "rolling his eyes" (modern sense) | Adopted |  | D14 |
| 15 | SHOULD-FIX | 8.36 "likely" dropped | Adopted |  | D15 |
| 16 | SHOULD-FIX | 8.37 comparison reversed | Adopted |  | D16 |
| 17 | SHOULD-FIX | 8.37 "statues" vs "busts" of Silenus | Adopted |  | D17a, D17b |
| 18 | SHOULD-FIX | 8.37 "whole duty" changed (Greek) | Adopted |  | D18 |
| 19 | SHOULD-FIX | 8.43 "the youth" became "the young man" | Adopted |  | D19 |
| 20 | SHOULD-FIX | Systemic Greek-derived wording (list) | Adopted | Reverted to Jowett; policy recorded in STYLE §1a | D20a, D20b, D20c, D20d, D20e, D20f |
| 21 | OPTIONAL | 8.3 "managed" for "contrived" | Adopted |  | D21 |
| 22 | OPTIONAL | 8.5 "despot" softened | Adopted |  | D22 |
| 23 | OPTIONAL | Contractions in Alcibiades's speech | Declined | STYLE §6 now allows contractions in Alcibiades's drunken speech |  |
| 24 | OPTIONAL | 8.24 small losses in the first sentence | Adopted |  | D24 |
| 25 | OPTIONAL | 8.24 "needs" vs "lacks" | Adopted |  | D25 |
| 26 | OPTIONAL | 8.26 "teasing" softens "flouting" | Adopted |  | D26 |
| 27 | OPTIONAL | 8.28 proverb quotation marks | Adopted | Further revised after Review 2 #62 | D27, E62 |
| 28 | OPTIONAL | 8.30 "only" added | Adopted |  | D28 |
| 29 | OPTIONAL | 8.33 "as Homer says of Odysseus" | Declined | Would add a name Jowett does not give and a new card character; "as Homer puts it" kept |  |
| 30 | OPTIONAL | 8.35 "again" lost; "cannot" | Adopted |  | D30 |
| 31 | OPTIONAL | 8.37 "wanton satyr" | Declined | "insolent" kept for consistency with 8.23 (same Greek word; Jowett's "bully") |  |
| 32 | OPTIONAL | 8.37 "for" added; "other generals" | Adopted |  | D32a, D32b |
| 33 | OPTIONAL | 8.39 "everyone laughed" | Adopted |  | D33 |
| 34 | OPTIONAL | 8.45 erotic sense of "attracting ... to himself" | Adopted |  | D34 |

## Review 2: blind reader

The reviewer read v1 cold, without the source, in parallel with Reviews 1A–1D; items already fixed in resolving Review 1 are marked so. Findings are summarized here; the full wording is in the review. "Declined" items were each checked against Jowett: the reason is given.

| # | Where | Severity | Finding (short) | Disposition | Note | Edits |
|---|---|---|---|---|---|---|
| 1 | 1.0; 1.8–1.11 | SHOULD-FIX | The opening conversation changes format partway through. | Declined | Jowett's 1.0 has no speaker label (labels begin at 1.8); the restored opening stays byte-identical as accepted in the completeness repair |  |
| 2 | 1.7 | OPTIONAL | The story of meeting Glaucon (two days earlier) ends and the present conversation resumes in the middle of a paragraph that already has two speakers. | Declined | Paragraph boundaries are fixed; the restored opening is protected |  |
| 3 | 1.7; 1.41 | OPTIONAL | "deme" is never explained. | Declined | "deme" matches the protected 1.7; the Cast card covers the term |  |
| 4 | 1.9 | OPTIONAL | Usage error: "the reason … is because". | Adopted |  | E4 |
| 5 | 1.15–1.22; 1.44–1.46 | SHOULD-FIX | Quotation marks around verse lines set as separate paragraphs break the edition's own continuation rule. | Adopted | Rule recorded as STYLE §3.4 (verse inside a continuing quotation: continuation mark plus nested double quotes); applied at 1.15-1.22 and 1.44-1.46 | E5a, E5b, E5c, E5d, E5e, E5f, E5g, E5h |
| 6 | 1.19 | OPTIONAL | It is hard to see how Homer's example (the weaker Menelaus going uninvited to the stronger Agamemnon's feast) "supports this change" (the good going … | Declined | Jowett's argument kept as stated |  |
| 7 | 1.20 | OPTIONAL | "still" makes the sentence hard to parse. | Adopted | Adopted by rewording "still" ("that this may be my case after all") | E5e |
| 8 | 1.26 | OPTIONAL | Three men in two clauses: "he … his" could be Socrates or Aristodemus. | Already fixed | Fixed by A12 |  |
| 9 | 1.33 | OPTIONAL | Agathon says there is "no one to give you orders" while he is giving orders, so the joke reads as a contradiction. | Already fixed in part | Fixed by A2 ("the fit"). Remainder: "no one to give you orders" is Jowett's joke (the host hands control to the servants) |  |
| 10 | 1.36 | OPTIONAL | Misplaced adverb: it reads as "drinking badly". | Already fixed | Fixed by A3 |  |
| 11 | 1.43–1.44 | OPTIONAL | Double speech tag: "went on:" and then "he said". | Declined | Jowett has both tags |  |
| 12 | 1.46 | OPTIONAL | Two key terms are not explained where they first appear. | Already fixed in part | Fixed by A4 ("in his honor"). Remainder: glossing "sophists" or "Love (Eros)" would add words to Phaedrus's complaint; not needed to follow the sentence |  |
| 13 | 2.0–2.4 | OPTIONAL | Phaedrus's is the only speech without a direct tag of the "X began:" kind. | Declined | The slide from reported into direct speech is the source's own |  |
| 14 | 2.3 | OPTIONAL | It is unclear who "he" is: Parmenides or Generation? | Declined | The gloss "the power that brings things to birth" already identifies the "he" of the verse |  |
| 15 | 2.6 | OPTIONAL | Awkward, and "herself" can be misread. | Adopted |  | E15 |
| 16 | 2.7 | OPTIONAL | The reason given does not obviously explain why the gods reward a beloved's devotion more. | Declined | Supplying the missing step would insert an interpretation into Phaedrus's argument |  |
| 17 | 3.1 | OPTIONAL | The Common Love is "it" for three clauses and then suddenly "his". | Adopted |  | E17 |
| 18 | 3.2 | OPTIONAL | "Intelligent beings" sounds like science fiction. | Adopted |  | E18 |
| 19 | 3.3 | OPTIONAL | The cause and effect are garbled: why would poor speaking make the law simple? | Declined | Jowett's reasoning kept |  |
| 20 | 3.3 | OPTIONAL | "Barbarians" suggests savages, but here it must mean non-Greek rule; 7.61 says "non-Greeks". | Partly adopted | "gymnastics" -> "physical training" in 3.3 and "athletics" -> "physical training" in 7.52 (STYLE §4) Declined remainder: Remainder: "barbarians" kept (source term; consistent with 7.61 after Review 1C #13) | E20a, E20b |
| 21 | 3.3 | OPTIONAL | "Their power" can be read as the two men's own power. | Declined | Protected C-06 sentence; "their" refers to the tyrants named in the preceding clause |  |
| 22 | 3.4 | OPTIONAL | It is unclear why "philosophy" is the judge here. | Declined | Jowett says "philosophy" |  |
| 23 | 3.6 | OPTIONAL | "The love of a noble disposition" is ambiguous: love felt by a noble character, or love for one? | Declined | Jowett's wording; "have us yield" is Pausanias's first person |  |
| 24 | 3.7 | OPTIONAL | "The love of money" blurs the speech's key word. | Declined | Jowett's list kept |  |
| 25 | 3.8 | SHOULD-FIX | "'uses base'" is an archaic word order in quotation marks with no source given. | Adopted | Documented exception (STYLE §1a): the accepted C-06 wording 'uses base' is kept verbatim and glossed | E25 |
| 26 | 3.8 | OPTIONAL | A single very long sentence with a colon, two dashes and "then, when … and only then". | Adopted | "the love of youths" and "the beloved who has yielded to him" (A6, A7); "particular" -> "aspect" | E26, A6, A7 |
| 27 | 3.9 | OPTIONAL | "Acceptance of another" is too vague to decode. | Declined | "the acceptance of another" is Jowett's phrase, in accepted text |  |
| 28 | 3.10 | OPTIONAL | The joke depends on noticing the sound-echo in "Pausanias paused", but "balanced phrase" does not describe that kind of echo, and the narrator's … | Adopted |  | E28 |
| 29 | 4.0 | OPTIONAL | "Or toward anything else" makes the clause read as a denial that love is aimed at anything at all. | Adopted |  | E29 |
| 30 | 4.1 | SHOULD-FIX | The pronoun misleads. | Already fixed | Fixed by A8 |  |
| 31 | 4.2 | OPTIONAL | A qualifier has been dropped, so the sentence contradicts the ones before it: music does bring into harmony what once disagreed. | Adopted |  | E31 |
| 32 | 4.2 | OPTIONAL | Why is performing existing songs "called education"? | Declined | Jowett's clause kept; "the latter of which" restored by A19 |  |
| 33 | 4.3 | OPTIONAL | An elliptical clause that I could not apply to music. | Adopted |  | E33 |
| 34 | 4.8 | OPTIONAL | Because of the dash, "that would be all to the good" seems to refer to people not laughing with him. | Adopted |  | E34 |
| 35 | 5.1 | OPTIONAL | Unusual spelling of the giant's name. | Declined | Otys kept (STYLE §4) |  |
| 36 | 5.2 | OPTIONAL | "Sorb-apple" means nothing to most readers. | Declined | Jowett's image; the context shows a fruit halved |  |
| 37 | 5.3 | OPTIONAL | The second clause restates the first, so the sentence goes in a circle and reads as if a specific term was avoided. | Adopted |  | E37 |
| 38 | 5.6 | OPTIONAL | Nothing in the text says Pausanias and Agathon are a couple, so this joke (and "manly by nature") is opaque. | Declined | No insertion into Aristophanes's speech; an in-app note would be coding-owner scope |  |
| 39 | 6.1 | SHOULD-FIX | Punctuation error: the verse ends with a colon, but a new sentence follows. | Adopted |  | E39 |
| 40 | 6.4 | OPTIONAL | Apollo "discovered" his arts as Love's pupil, but the other gods' arts, "likewise", were "invented" by Love, so the two claims do not match. | Declined | Jowett's "discovered"/"invented"; capitalization follows Jowett |  |
| 41 | 6.12 | SHOULD-FIX | Victorian colon-and-dash. | Adopted |  | E41 |
| 42 | 7.0 | SHOULD-FIX | I could not make sense of this. | Adopted | Documented exception (STYLE §1a): "that is, whose child Love is"; Jowett's frame around it restored after Recheck 2 #1 | E42, R2-1 |
| 43 | 7.0; 7.45 | OPTIONAL | Socrates's first turn (7.0) has no quotation marks, like a set speech, but his later turns (7.2–7.44) are quoted. | Partly adopted | Partly adopted: 7.45 now opens with the tag "Socrates went on:" (K-2, after the consistency pass; it replaced the v3 address "Agathon"). 7.0 stays unquoted, because 6.12 introduces it as a set speech ("Socrates then proceeded as follows:"), the convention of STYLE §3 | E43, K-2 |
| 44 | 7.45 | SHOULD-FIX | The line is given to the wrong speaker. | Adopted | Tagging rule recorded as STYLE §3.5 | E44 |
| 45 | 7.46; 7.50; 7.52 | SHOULD-FIX | The same pattern gives Diotima's questions to Socrates: each follows his tagged reply with no tag of its own. | Adopted | STYLE §3.5 | E45a, E45b, E45c, E45d |
| 46 | 7.47 | OPTIONAL | First, all dealings between gods and humans go "through Love"; then Love is only one of many such spirits. | Declined | Jowett's wording |  |
| 47 | 7.51–7.52 | SHOULD-FIX | The worst of the wrong attributions. | Adopted | STYLE §3.5 | E47 |
| 48 | 7.54 | OPTIONAL | "The Fate, the goddess of childbirth" merges two figures, and "the Fate" is not explained. | Adopted |  | E48a, E48b |
| 49 | 7.55 | OPTIONAL | "Don't be surprised … if you believe" first reads as "it would not be surprising if you came to believe". | Already fixed | Fixed by C9 |  |
| 50 | 7.56 | OPTIONAL | "Recollection" may mislead readers who know Plato's theory of recollection. | Declined | Jowett's word "recollection" kept (source policy) |  |
| 51 | 7.59 | OPTIONAL | Misplaced "only": pregnant only in body, or turning only to women? | Adopted |  | E51 |
| 52 | 7.62 | OPTIONAL | "Beauty of form" can be read as Plato's technical "Form". | Adopted |  | E52a, E52b |
| 53 | 7.62–7.65 | SHOULD-FIX | The stages of the ascent are named differently in the description and the recap, so I could not line them up. | Adopted | Stage names aligned with the recap: practices and laws, branches of knowledge (STYLE §4 glossary) | E53a, E53b, E53c, E53d |
| 54 | 7.63 | OPTIONAL | "Beauty everywhere" seems to contradict 7.64, where beauty itself is not found "in an animal … or on earth, or anywhere else". | Declined | Jowett's "the science of beauty everywhere" |  |
| 55 | 7.65 | OPTIONAL | "With all the colors and vanities" can attach to "divine beauty" and reverse the sense. | Already fixed | Fixed by C16 |  |
| 56 | 8.0 | OPTIONAL | "His own speech" could be read as Socrates's, and the allusion (Diotima's "other half" remark in 7.52) is easy to miss. | Already fixed in part | Fixed by D3 ("his own speech"). Remainder: "the terms I mentioned" refers back to "Will you let a very drunk man join your party?" in the same paragraph |  |
| 57 | 8.4; 8.14 | OPTIONAL | In modern English this idiom means sexual eagerness. | Declined | Jowett's idiom; the violent sense is clear from context |  |
| 58 | 8.10–8.12 | SHOULD-FIX | The same quotation problem as in chapter 1. | Adopted | "In Homer's words" (revised from "As Homer says" after Recheck 2 #9) follows Jowett's own note (Pope's Homer); quotation left open through 8.11 (STYLE §3.4) | E58a, E58b, R2-9 |
| 59 | 8.23 | SHOULD-FIX | "Olympus" will be read as the gods' mountain, but "who taught them to him" shows it is a person: the legendary musician taught by Marsyas. | Already fixed | Fixed by D7 |  |
| 60 | 8.23 | OPTIONAL | "Miserable" reads as "unhappy". | Adopted |  | E60 |
| 61 | 8.27 | OPTIONAL | Logic slip: after "far into the night" it really was late, so "pretended" does not fit. | Declined | Jowett: "I pretended that the hour was late" |  |
| 62 | 8.28 | SHOULD-FIX | Opaque proverb. | Adopted | The proverb is given in the form the joke needs, then Alcibiades's gloss | E62 |
| 63 | 8.29 | SHOULD-FIX | The line is given to the wrong speaker. | Adopted | STYLE §3.5 | E63 |
| 64 | 8.35 | OPTIONAL | "Until noon" implies he stopped at noon, but he stands there all night. | Declined | Jowett: "from early dawn until noon" |  |
| 65 | 8.36 | OPTIONAL | The image is hard to picture (pelicans don't stalk), and "rolling his eyes" now means exasperation, not glancing around. | Already fixed | Fixed by D14 |  |
| 66 | 8.38 | OPTIONAL | A first-time reader may take this Glaucon for the Glaucon of 1.1. | Declined | Jowett quotes the advice; a name note would be coding-owner scope |  |
| 67 | 8.39 | OPTIONAL | Possessive puzzle: praise of your satyr, or satyr-like praise? | Declined | Jowett's phrase |  |
| 68 | 8.43 | OPTIONAL | "All over again" implies Agathon has praised Socrates before, and the logic of seats and turns takes some working out. | Adopted |  | E68 |

## Lead's own fixes (not from a single finding)

- **E-bb** (6.6): Agathon's hymn: the modern cliché "the best and brightest of leaders" (noted in Review 2 §4, Tone) replaced by Jowett's "leader best and brightest".
- **CAP-40, CAP-41** (4.0, 4.1): Capitalization audit against Jowett (STYLE §4: "Love/love as Jowett capitalizes"): "the god of love", "the rule of love".
- **CAP-749, CAP-750, CAP-754, CAP-767, CAP-768** (7.49, 7.50, 7.54, 7.67, 7.68): Same audit: lowercase where Jowett has "love"; 7.50 restores Jowett's "Of the beautiful in what sense".

## Recheck 1: every post-review change, chapters 1-6

Read v3. Verdict: ACCEPT WITH CHANGES. Full report: `RECHECK-1-post-review-ch1-6.md`.

| # | Where | Severity | Finding | Disposition | Note | Edits |
|---|---|---|---|---|---|---|
| 1 | 1.45 | OPTIONAL | Editorial dash inside the nested verse marks | Adopted |  | R1-1 |
| 2 | 3.0 | OPTIONAL | "the other Love": Jowett lowercases | Adopted | Glossary rule "as Jowett capitalizes"; the card mention becomes text "love" (same character) | R1-2 |
| 3 | 3.2 | OPTIONAL | "But surely" for Jowett's explanatory "for surely"; "altogether" added (baseline wording) | Adopted |  | R1-3 |
| 4 | 3.5 | SHOULD-FIX | "fathers" for Jowett's "parents" (baseline wording) | Adopted |  | R1-4 |
| 5 | 3.5 | OPTIONAL | Jowett's "refuse" dropped by the A5 fix | Adopted |  | R1-5 |
| 6 | 3.5 | OPTIONAL | "servitude" for Jowett's "slavery" (baseline wording) | Adopted |  | R1-6 |
| 7 | 3.8 | OPTIONAL | "who has yielded" introduces a tense | Adopted | "who yields to him", matching the paragraph's later "yields to a lover" | R1-7 |
| 8 | 4.1 | OPTIONAL | "and" for Jowett's "or"; "friends" dropped (v1) | Adopted |  | R1-8a, R1-8b |
| 9 | 4.2 | OPTIONAL | "a kind of agreement" (Greek); "Here" narrows Jowett's scope (v1) | Adopted |  | R1-9a, R1-9b |
| 10 | 4.8 | OPTIONAL | Jowett's "only" dropped by E34 | Adopted |  | R1-10 |
| 11 | 5.1 | SHOULD-FIX | Homer made the teller of the round people's story (v1) | Adopted | The recheck's wording | R1-11 |
| 12 | 5.1 | OPTIONAL | Missing verb "was" | Adopted |  | R1-12 |
| 13 | 5.6 | OPTIONAL | "lord and guide, leads us to" (Greek) for Jowett's "lord and minister" | Adopted | "lord and provider": "minister" now suggests an official or a clergyman (STYLE §4 row added) | R1-13 |
| 14 | 5.7 | OPTIONAL | "as I asked" not in Jowett (v1) | Adopted |  | R1-14 |
| 15 | 6.6 | OPTIONAL | Agathon's "regardful/regardless" jingle flattened | Adopted | "caring for the good, careless of the bad" | R1-15 |
| 16 | 6.6 | OPTIONAL | v1 wordings that follow the Greek: "leads us", "father of", "partly playful", "us", "gatherings" | Adopted | Jowett's "our lord", "parent", "half playful, yet", "men", "banquets" | R1-16a, R1-16b, R1-16c |

## Recheck 2: every post-review change, chapters 7-8

Read v3. Verdict: ACCEPT. Full report: `RECHECK-2-post-review-ch7-8.md`.

| # | Where | Severity | Finding | Disposition | Note | Edits |
|---|---|---|---|---|---|---|
| 1 | 7.0 | OPTIONAL | The frame around the documented gloss is v1's and follows the Greek | Adopted | Jowett's "I do not want you to say ... that would be ridiculous" | R2-1 |
| 2 | 7.45-7.52 | OPTIONAL | STYLE §3.5 is broader than the text's practice; the 7.45 vocative is not covered | Adopted | §3.5 reworded: a new question or statement after a tagged line is tagged, a direct reply is not; a resumed set speech gets a tag. The vocative was replaced by "Socrates went on:" (consistency pass #2) | STYLE |
| 3 | 7.49 | OPTIONAL | Two colons in one sentence | Adopted | Fixed with the consistency pass's dash (#17) | K-17 |
| 4 | 7.49, 7.63 | OPTIONAL | STYLE §1a and SOURCE-NOTES disagree; "no longer" (7.63) is not syntax-only | Adopted | 7.63 reverted to Jowett's "will not be"; §1a now names the one kept choice, "what loves" (7.49) | R2-4 |
| 5 | 7.50 | OPTIONAL | Elliptical question hard to parse | Adopted |  | R2-5 |
| 6 | 7.51 | OPTIONAL | Three "only"s; the first is v1's | Adopted |  | R2-6 |
| 7 | 7.60 | OPTIONAL | "firmer friendship" (Greek) for Jowett's "closer friendship" | Adopted | Jowett's "a far nearer tie" and "a closer friendship" | R2-7 |
| 8 | 7.64 | OPTIONAL | "ever-growing" now means "constantly increasing" | Adopted |  | R2-8 |
| 9 | 8.10 | OPTIONAL | "As Homer says" attributes Alcibiades's whole sentence to Homer | Adopted | "In Homer's words"; STYLE §5 example updated | R2-9 |
| 10 | 8.26 | OPTIONAL | "everything he knew" (Greek) contradicts STYLE §1a's example | Adopted | Same as consistency pass #1 | R2-10 |
| 11 | 8.29, 8.33 | OPTIONAL | STYLE §5's no-added-names sentence conflicts with "Diomedes in Homer" | Adopted | §5 reworded: a gloss does not add a name that Jowett's text and notes never use (Homer is named throughout; Odysseus never) | STYLE |
| 12 | 8.30 | OPTIONAL | Stray comma | Adopted |  | R2-12 |
| 13 | 8.37 | OPTIONAL | "seem ridiculous" (Greek) for Jowett's "are ridiculous" | Adopted |  | R2-13 |
| 14 | 8.39 | OPTIONAL | Causal "because" (Greek) for Jowett's parallel "and your notion is" | Adopted |  | R2-14 |
| 15 | 8.43 | OPTIONAL | "have to" (Greek) loses Jowett's "out of order" | Adopted |  | R2-15 |
| 16 | 8.45 | OPTIONAL | "found a plausible excuse" (Greek) for Jowett's "invented a specious reason" | Adopted | "made up a plausible excuse", with Jowett's "readily"; "specious" avoided as a hard word | R2-16 |

## Consistency pass: whole book

Read v3. Verdict: CONSISTENT WITH CHANGES. Full report: `CONSISTENCY-PASS-v3.md`.

| # | Where | Severity | Finding | Disposition | Note | Edits |
|---|---|---|---|---|---|---|
| 1 | 8.26 | SHOULD-FIX | The text contradicts STYLE §1a's example | Adopted | Same as Recheck 2 #10 | R2-10 |
| 2 | 7.44-7.45 | SHOULD-FIX | Socrates's account of Diotima opens with no tag | Adopted | "Socrates went on:" replaces the v3 address "Agathon". Declined optional part: tagging 7.44, a one-turn paragraph straight after Agathon's (§3.5: the paragraph break marks the change there), addressed to "my beloved Agathon" and followed by "Socrates went on:" | K-2 |
| 3 | 7.50-7.51 | SHOULD-FIX | Diotima's question untagged after a tagged line | Adopted |  | K-3 |
| 4 | 7.47 | SHOULD-FIX | Untagged changes of speaker | Adopted | "'No,' she said." and, by the same rule, "'What, then?' I asked." | K-4 |
| 5 | 7.52 | SHOULD-FIX | The "forever" question reads as Socrates's | Adopted |  | K-5 |
| 6 | 7.45, 7.65 | SHOULD-FIX | "Mantinea" for Jowett's "Mantineia", undocumented | Adopted | Jowett's form restored (STYLE §4); it also matches the card text | K-6a, K-6b |
| 7 | 1.14-1.15 | OPTIONAL | "he said" now points to Aristodemus | Adopted |  | K-7 |
| 8 | 3.0 | OPTIONAL | Capital against the rule "as Jowett capitalizes" | Adopted | Lowercased (Recheck 1 #2) | R1-2 |
| 9 | 3.1 | OPTIONAL | Love referred to as "It" | Adopted |  | K-9 |
| 10 | 3.4 | OPTIONAL | "his love" for the person pursued | Declined | Retained accepted paragraph: STYLE governs the paragraphs this pass changes, and §6 names 3.4's accepted wording. The phrase reads clearly as the person pursued |  |
| 11 | 3.9 | OPTIONAL | "in praise of Love" capitalized against the rule | Declined | Retained accepted paragraph; the rule governs the paragraphs this pass changes (STYLE preamble), and the capital changes neither sense nor audio |  |
| 12 | 5.15; 7.30 | OPTIONAL | Untagged changes of speaker | Adopted |  | K-12a, K-12b |
| 13 | 7.0, 7.8 | OPTIONAL | Capital after a colon in two questions | Adopted |  | K-13a, K-13b |
| 14 | 7.20 | OPTIONAL | Third-level quotation unmarked | Adopted |  | K-14 |
| 15 | 7.42 | OPTIONAL | "it" for love | Adopted | Jowett repeats "love" | K-15 |
| 16 | 7.46; 7.54 | OPTIONAL | Short replies untagged | Partly adopted | 7.54 "What, then?" tagged after Recheck 3 (#6): it is a new question, and one tag does not cascade. 7.46 "He can't." stays untagged: a direct reply to the question just asked (§3.5), and a tag would call for another on Diotima's next line | R3-6 |
| 17 | 7.49 | OPTIONAL | Two colons | Adopted |  | K-17 |
| 18 | 8.45 | OPTIONAL | "the beautiful ones" (glossary: beautiful people) | Adopted |  | K-18 |
| 19 | 8.46 | OPTIONAL | "from left to right" not in Jowett (baseline wording) | Declined | Retained accepted closing paragraph; the detail matches Jowett's own "from left to right" at 1.46 and 8.13. Recorded in SOURCE-NOTES.md §3 |  |
| 20 | 8.46 | OPTIONAL | "Someone leaving had left" is awkward (baseline wording) | Declined | Retained accepted closing paragraph; the sentence is clear |  |

## Recheck 3: every change after v3

Read v4. Verdict: ACCEPT. Full report: `RECHECK-3-delta-v4.md`.

| # | Where | Severity | Finding | Disposition | Note | Edits |
|---|---|---|---|---|---|---|
| 1 | 3.0 | OPTIONAL | Jowett's softener "quite" lost (baseline wording) | Adopted |  | R3-1 |
| 2 | 3.1 | OPTIONAL | "directed equally" for Jowett's "apt to be of women as well as of youths" (baseline wording) | Adopted |  | R3-2 |
| 3 | 4.2 | OPTIONAL | "knowledge of love" (Greek) for Jowett's "concerned with the principles of love" (v1) | Adopted |  | R3-3 |
| 4 | 7.45 | OPTIONAL | "much the same" and "the easiest way is to play both parts" alter Jowett's qualifications (v1) | Adopted |  | R3-4a, R3-4b |
| 5 | 7.49 | OPTIONAL | Diotima's hedge "I imagine" lost (v1) | Adopted |  | R3-5 |
| 6 | 7.54 | OPTIONAL | "What, then?" untagged: a new question, as at 7.47 | Adopted | Consistency pass #16 now partly adopted | R3-6 |
| 7 | 8.30 | OPTIONAL | "something special" (Greek) for Jowett's "had some attractions" (v1) | Adopted |  | R3-7 |
| 8 | STYLE §3.5 | OPTIONAL | The rule's scope does not match the one-turn exchanges; 5.15 and 7.30 misdescribed | Adopted | §3.5 now distinguishes paragraphs with several turns from one-turn exchanges and names 1.15 as the pronoun case | STYLE |
| 9 | SOURCE-NOTES §3 | OPTIONAL | The list of reverted wordings omits 5.7 "as I asked" | Adopted | Added, with the Recheck 3 reversions (4.2, 7.45, 8.30) | SOURCE-NOTES |

## Recheck 4: every change after v4

Read v5. Verdict: ACCEPT. Full report: `RECHECK-4-delta-v5.md`.

| # | Where | Severity | Finding | Disposition | Note | Edits |
|---|---|---|---|---|---|---|
| 1 | 7.54 | OPTIONAL | v1 recast Jowett's conception image as childbirth ("holds back from giving birth", "the time for birth", "full to bursting"); not recorded | Adopted | Recorded as a kept v1 choice in STYLE §1a and SOURCE-NOTES §3, as the reviewer suggested; it changes no argument and fits Jowett's own frame ("goddess of parturition", "travail"). No text change | SOURCE-NOTES |
