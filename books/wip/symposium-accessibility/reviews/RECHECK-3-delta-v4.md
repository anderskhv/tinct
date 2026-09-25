# Recheck 3: changes after v3, Symposium modern-en

- **Role:** independent recheck reviewer. I did not write the text or any earlier review.
- **Packet:** `review-in/delta-packet.md`. It covers the 37 paragraphs changed after v3 and the 49 edits that changed them: `edits-R1.json` (20), `edits-R2K.json` (28) and `edits-K-new.json` (1).
- **Hashes verified (sha256):**
  - v3, `v3-symposium-modern-en.json`: `72838e2974791827de76d8d65900310541e4146abf71a975eb47d60b570e6ddf`
  - FINAL, `cand/symposium-modern-en.json`: `50cc0004ebb506b6d947bb12140441a9f4d095afa1e9d7c6a296ef145e134b32`
  - source (Jowett), `base-original-en.json`: `3521a12d…95a6`, as STYLE §1 pins.
- **Standard:** `STYLE.md` as updated after the reviews, read in full, including §1a, §3.5, §4 and §5. I also read `SOURCE-NOTES.md` and every finding the edits cite in Recheck 1, Recheck 2 and the consistency pass.
- **Date:** 2026-09-25

## Method

- **Integrity.**
  - I compared v3 and FINAL paragraph by paragraph. Exactly the packet's 37 coordinates differ.
  - The structure is unchanged: 8 chapters and 226 paragraphs (49/8/12/10/18/13/69/47), with the same chapter numbers and titles. No other field changed.
  - I replayed the 49 edits on v3 in file order. Each "old" string occurs exactly once in its paragraph. The result equals FINAL. Written out in the same format (2-space indent, UTF-8), it reproduces FINAL byte for byte (`50cc0004…4b32`).
  - The packet's JOWETT, V3 and FINAL texts match the three files character for character. Its edit list matches the edit files.
- **Findings.** For each edit, I read the cited finding and compared the edit with the suggested fix.
- **Fidelity.**
  - I read all 37 FINAL paragraphs sentence by sentence against Jowett, not only at the edit sites.
  - For every departure from Jowett, I traced the wording back through the accepted baseline (`1e970b7b…374f`) and v1 (`candidate/symposium-modern-en.json`, `46fa34ea…113e`). That labels it baseline or v1 wording.
  - I listed every hedge and qualifier Jowett uses in the 37 paragraphs and checked that each survives.
- **Attribution and quotation.**
  - I read the neighbors in `review-in/v4-full-text.md`. That covers the ranges the brief names, plus 1.12–1.24, 1.43–1.47, 5.10–5.17, 7.1–7.44, 7.53–7.58, 8.9–8.13 and 8.40–8.46.
  - By script, I listed every place in the book where a tagged line is followed in the same paragraph by an untagged one, and every run of adjacent untagged quotations. I judged each by hand.
  - By script, I checked two things: every paragraph that ends with an open quotation is followed by a continuation mark, and double quotes balance in every paragraph. v3 and FINAL both have the same 28 open-ended paragraphs, all continued correctly.
- **House style.** I scanned the 37 paragraphs, and the whole book for characters.
  - The spaced em-dash is the only non-ASCII character: 219 of them, all spaced.
  - All quotes are straight.
  - There are no British spellings, doubled words, double spaces or `--`.
  - Contractions appear only where §6 allows them.
- **Names.** I checked name forms book-wide. I read the live character card (`app/public/data/characters/symposium.v1.json`) only for the forms §4 cites.
- **Constraints kept.**
  - I used no web or external source. Greek is cited from memory, and only to say where a wording probably came from; every finding rests on Jowett's text.
  - I ran read-only inline Python, made no helper files and ran no git commands.
  - This report is the only file I wrote.

## Verdict: ACCEPT

**Counts:** BLOCKING 0 · SHOULD-FIX 0 · OPTIONAL 9.

- **Every one of the 49 edits does what its finding asked.** Each uses the suggested wording or an equivalent that stays with Jowett. That includes:
  - both Recheck 1 SHOULD-FIX items: 3.5 "parents", and 5.1, where Homer is no longer made the teller of the round people's story;
  - all six SHOULD-FIX items from the consistency pass: 8.26, 7.45, 7.47, 7.51, 7.52 and Mantineia.
- **No edit introduces an error.**
  - Every new tag names the right speaker:
    - Socrates at 1.15, 5.15, 7.30 and 7.45;
    - Diotima and then Socrates at 7.47;
    - Diotima at 7.51 and 7.52.
  - Quotation runs open and close exactly as in v3.
  - The documented 7.0 gloss fits Jowett's restored frame.
- **Nothing else changed.**

The nine OPTIONAL items are of three kinds:

- **Older wording away from the edit sites that departs from a Jowett qualifier (#1–#5, #7).**
  - Four are v1 wordings (4.2, 7.45, 7.49, 8.30), and two are baseline wording (3.0, 3.1).
  - None changes an argument.
  - §1a says v1's Greek-based wordings were reverted, so the v1 items should be reverted or recorded, as after Rechecks 1 and 2.
- **One attribution point (#6):** 7.54 "What, then?", from the declined consistency #16.
- **Two documentation points (#8, #9):** the scope of §3.5, and the list in SOURCE-NOTES §3.

## Findings

| # | Coordinate | Edit ID | Severity | Finding | Exact FINAL wording | Suggested fix |
|---|---|---|---|---|---|---|
| 1 | 3.0 | none (baseline wording; paragraph edited by R1-2) | OPTIONAL | Jowett's softener is lost. He has "the argument has not been set before us, I think, quite in the right form". Without "quite", Pausanias's opening criticism is blunter than in Jowett. | `Phaedrus, I don't think the question has been framed correctly.` | `Phaedrus, I don't think the question has been framed quite correctly.` |
| 2 | 3.1 | none (baseline wording; paragraph edited by K-9) | OPTIONAL | Jowett: "and is apt to be of women as well as of youths". "Directed equally" drops the tendency ("apt to") and adds a claim of equal measure. The Greek "no less than" is the likely origin. K-9 itself is correct. | `This is the love the baser sort of men feel, directed equally at women and at youths, and it is of the body rather than the soul.` | `This is the love the baser sort of men feel; it tends to be directed at women as well as at youths, and it is of the body rather than the soul.` |
| 3 | 4.2 | none (v1 wording; paragraph edited by R1-9a, R1-9b) | OPTIONAL | Jowett: "thus music, too, is concerned with the principles of love in their application to harmony and rhythm". The baseline had those words. v1 calls music a *knowledge* of love, as the Greek does (*episteme* is the likely origin). The shift is small and echoes 4.1's "knowledge of the body's loves". But it is not recorded, and §1a says such v1 wordings were reverted. | `So music, too, is knowledge of love as it applies to harmony and rhythm.` | `So music, too, is concerned with the principles of love as they apply to harmony and rhythm.` Or record it as accepted in SOURCE-NOTES §3. |
| 4 | 7.45 | none (v1 wording; paragraph edited by K-2, K-6a) | OPTIONAL | Two of Jowett's qualifications are changed; the baseline had both. **(a)** "nearly if not quite the same" (perhaps identical) becomes "much the same". **(b)** Jowett has "I think that this will be the easiest way, and I shall take both parts myself". "This" is the plan just stated. v1 makes playing both parts the thing called easiest. | `which are much the same as the ones I agreed to when the wise woman questioned me. I think the easiest way is to play both parts myself, as well as I can.` | `which are nearly, if not exactly, the same as the ones I agreed to when the wise woman questioned me. I think this will be the easiest way, and I will play both parts myself, as well as I can.` |
| 5 | 7.49 | none (v1 wording; paragraph edited by K-17) | OPTIONAL | Diotima's hedge is lost. Jowett: "as I imagine from what you say, has arisen out of a confusion of love and the beloved". The baseline had those words. "Judging from what you say" keeps the inference but drops her "I imagine". §2 keeps qualifiers of this kind. | `Judging from what you say, it came from confusing love with the beloved` | `Judging from what you say, I imagine it came from confusing love with the beloved` |
| 6 | 7.54 | none (consistency #16, declined) | OPTIONAL | **Attribution.** "What, then?" is a new question from Socrates, after Diotima's speech (tagged "she replied" at 7.53). It is not a direct reply. §3.5 lists 7.54 among the paragraphs where the rule was applied, and K-4 tagged the identical line at 7.47. Heard aloud, "…love of the beautiful only. What, then? The love of procreation …" can pass as Diotima asking and answering her own question. One tag is enough, and nothing cascades: the answer is a direct reply, and the next line is already tagged. | `love of the beautiful only.' 'What, then?' 'The love of procreation and of giving birth in beauty.'` | `love of the beautiful only.' 'What, then?' I asked. 'The love of procreation and of giving birth in beauty.'` |
| 7 | 8.30 | none (v1 wording; paragraph edited by R2-12) | OPTIONAL | Jowett's understatement "which really, as I fancied, had some attractions" becomes "something special". That raises Alcibiades's claim for his own beauty. The baseline had Jowett's words. The Greek idiom "I thought it was something" is the likely origin. | `which I really thought was something special` | `which I really thought had some attractions` |
| 8 | STYLE §3.5 | K-12a, K-12b, K-4 (documentation) | OPTIONAL | **(a) Scope.** As worded, the rule also covers the exchanges where each paragraph holds one turn. There the text relies on the paragraph break and leaves such lines untagged: 7.2, 7.4, 7.6, 7.10, 7.16, 7.24, 7.28, 7.32, 7.34, 7.36 and 7.44, and 8.20. The stated reason (the convention inside a paragraph) implies the intended scope, but the rule does not say so. **(b) 5.15 and 7.30.** They are described as places "where a pronoun tag could point to the wrong person". But in v3 they had no tag at all. They are the main rule applied across a paragraph break. | "In exchanges, a new question or statement by the other speaker that follows a tagged line is itself tagged …"; "Speakers are also named where a pronoun tag could point to the wrong person (1.15, 5.15, 7.30)." | For example: "Where a paragraph holds more than one turn (as in 7.45–7.58 and 8.29), a new question or statement by the other speaker that follows a tagged line is tagged … Where each paragraph holds one turn (7.0–7.44), the paragraph break marks the change, and a tag is added only where the line could still be heard as the previous speaker's (5.15, 7.30)." Keep 1.15 under the pronoun sentence. |
| 9 | SOURCE-NOTES §3 | R1-14 (documentation) | OPTIONAL | The closing paragraph lists the smaller Greek-derived wordings that were reverted. It omits 5.7 "as I asked", which Review 1B's verdict named, Recheck 1 #14 raised and R1-14 reverted. | "and Recheck 1 (#8, #16) found a few more in 4.1 and 6.6." | "and Recheck 1 (#8, #14, #16) found a few more in 4.1, 5.7 and 6.6." If #3, #4, #5 or #7 is kept rather than reverted, record it here as accepted. |

## Where the lead chose different wording

- **5.6, "obtain the good, of which Love is our lord and provider" (R1-13): sound.**
  - It keeps Jowett's own verb and object, "obtain the good". That is closer than the suggested "win the good things".
  - It takes the reviewer's alternative, "provider". To a modern reader "minister" suggests an official or a clergyman. "Provider" keeps Jowett's sense of the one who serves out the good.
  - The lord/servant contrast is weaker, but a modern reader would already miss it in "minister".
  - The new §4 row records the choice.
- **6.6, "caring for the good, careless of the bad" (R1-15): sound.** It is the reviewer's first option. It keeps Agathon's jingle, and "careless of" (paying no heed to) reads correctly.
- **7.47, the added "I asked" (K-4): right, and needed.** After "'No,' she said.", an untagged "'What, then?'" would read as Diotima going on, by the convention §3.5 states. With both tags the alternation is clear:
  - the answer that follows is a direct reply;
  - the vocative fixes "What is he, then, Diotima?" as Socrates's.
- **7.49, the dash (K-17): sound.** It is the consistency pass's fix and the baseline's punctuation. It removes the double colon and keeps Jowett's explanatory link.
- **8.45, "made up a plausible excuse" (R2-16): sound.**
  - "Made up" restores the invention in Jowett's "invented", which v1's "found" had lost, and "readily" is back.
  - "A plausible excuse" is today's idiom for "a specious reason": "excuse" carries the pretext, and "made up" carries the falsehood.
- **Also judged.**
  - **7.45 (K-2):** the tag, without the v3 vocative, matches Jowett, who has no vocative there ("And now, taking my leave of you"). It also satisfies "Nothing else is added". After 7.44, "you" is plainly Agathon.
  - **5.15 (K-12a):** "said Socrates", in place of the suggested "Socrates went on", is fine after Agathon's line.
  - **7.64 (R2-8):** the relative "which" may attach to "things" rather than "beauties". Either reading keeps the contrast with the everlasting beauty.

## Coverage: 37 of 37 coordinates

| Coordinate | Edits verified | Result |
|---|---|---|
| 1.15 | K-7 | OK. Socrates is named. The quotation run 1.15–1.19 is intact |
| 1.45 | R1-1 | OK. The verse wording is Jowett's, and the dash is now outside the marks. Every em-dash in the book is now spaced |
| 3.0 | R1-2 | #1. R1-2 follows Jowett's lowercase |
| 3.1 | K-9 | #2. "This is" parallels the paragraph's later "This is the love …" |
| 3.2 | R1-3 | OK. Jowett's explanatory "for surely"; "altogether" is gone |
| 3.5 | R1-4, R1-5, R1-6 | OK. Jowett's "parents", "refuse" and "slavery" |
| 3.8 | R1-7 | OK. The tenseless "yields"; 'uses base' and its gloss are intact |
| 4.1 | R1-8a, R1-8b | OK. Jowett's "or" and "our friends the poets"; the documented exception is unchanged |
| 4.2 | R1-9a, R1-9b | #3. Both edits follow Jowett |
| 4.8 | R1-10 | OK |
| 5.1 | R1-11, R1-12 | OK. Homer is cited only for the attempt on heaven |
| 5.6 | R1-13 | OK (see the section above) |
| 5.7 | R1-14 | OK. Jowett's "I must beg you"; the fuller register is kept |
| 5.15 | K-12a | OK. Socrates, after 5.14 "said Agathon"; 5.16 follows correctly |
| 6.6 | R1-15, R1-16a, R1-16b, R1-16c | OK. Jowett's "men … them … our lord", "parent" and "half playful, yet …"; "us" is also gone from "sends courtesy", as in Jowett |
| 7.0 | K-13a, R2-1 | OK. Jowett's frame ("I do not want you to say … that would be ridiculous"); the documented gloss fits it |
| 7.8 | K-13b | OK. A retained baseline paragraph, touched only to match the identical question in 7.0 |
| 7.20 | K-14 | OK. The third-level quotation takes single marks; double quotes balance |
| 7.30 | K-12b | OK. Socrates, after 7.29 "said Agathon" |
| 7.42 | K-15 | OK. Jowett repeats "love" |
| 7.45 | K-2, K-6a | #4. The tag names Socrates; the vocative is gone, as in Jowett; "Mantineia" as in Jowett, §4 and the card |
| 7.47 | K-4 | OK (see the section above) |
| 7.49 | K-17 | #5. "what loves" is kept, as documented |
| 7.50 | R2-5 | OK. Punctuation only |
| 7.51 | K-3, R2-6 | OK. K-3 fixes the attribution across 7.50→7.51; Jowett's "only" stays with "is called poetry" |
| 7.52 | K-5 | OK. The "forever" question is Diotima's, as in Jowett |
| 7.60 | R2-7 | OK. Jowett's "a far nearer tie … a closer friendship" |
| 7.63 | R2-4 | OK. Jowett's "being not like a servant" |
| 7.64 | R2-8 | OK. Jowett's words, moved into a relative clause |
| 7.65 | K-6b | OK |
| 8.10 | R2-9 | OK. The quotation run 8.10–8.12 is intact; the text matches §5 |
| 8.26 | R2-10 | OK. Now matches the §1a example |
| 8.30 | R2-12 | #7 |
| 8.37 | R2-13 | OK |
| 8.39 | R2-14 | OK. Jowett's two parallel clauses |
| 8.43 | R2-15 | OK. Jowett's "out of order"; "If Agathon lies between us" refers back to 8.42 |
| 8.45 | K-18, R2-16 | OK |

Summary: 31 coordinates are OK. Six carry findings: 3.0, 3.1, 4.2, 7.45, 7.49 and 8.30. Finding #6 (7.54) lies outside the 37.

## Declined findings

### Consistency #10 (3.4, "his love"): the decline holds
- 3.4 is identical to the accepted baseline. STYLE governs the paragraphs this pass changed, and §6 names 3.4's accepted wording.
- "In pursuing his love" reads clearly as the person pursued.
- The lead's second reason, "current, unambiguous English", would argue against the §4 row itself. The decline rests on the first reason.

### Consistency #11 (3.9, "in praise of Love"): the decline holds
- 3.9 is identical to the baseline. The capital changes neither the sense nor the audio.
- The pass did touch one retained paragraph, 7.8, to change a capital. That was to match the identical question in 7.0, so the two decisions do not conflict.

### Consistency #16 (7.46 "He can't."; 7.54 "What, then?"): holds for 7.46, not fully for 7.54
- **7.46:** "He can't." is a direct reply to the question just asked.
  - That question is untagged, so §3.5 does not call for a tag.
  - "Then you see that you, too, deny …" confirms the concession at once.
  - A tag here would call for another on Diotima's next line, so the cascade argument is right.
- **7.54:** the stated reasons do not fit.
  - "What, then?" is a new question, not a reply.
  - One tag would not cascade.
  - The identical line is tagged at 7.47.
  - In print the line is readable, because the quotation closes and reopens. A listener cannot hear that, though. See #6.

### Consistency #19 and #20 (8.46): the decline holds
- 8.46 is identical to the accepted baseline.
- SOURCE-NOTES §3 records "from left to right" accurately. Jowett has only "passed round". His own "from left to right", at 1.46 and 8.13, describes the order of speaking. The detail is harmless.
- "Someone leaving had left" is awkward but clear. It is a style point, so it needs no source note.

### Consistency #2, optional part (tag 7.44): the decline holds
- The line is plainly Socrates's:
  - it is a one-turn paragraph straight after Agathon's tagged line;
  - it is addressed to "my beloved Agathon";
  - 7.45 now opens "Socrates went on:", which confirms it.
- The stated reason, "follows Agathon's tagged line", is the very condition under which §3.5, as worded, asks for a tag. That is the scope point in #8.

## STYLE and SOURCE-NOTES

- **§1a.** Every example checks out in FINAL:
  - "young" (5.3), "embrace" (5.4), "born" (7.48) and "my beloved Agathon" (7.44);
  - "lord and provider" (5.6), "parent" (6.6), "I do not want you to say" (7.0), "closer friendship" (7.60) and "are ridiculous" (8.37);
  - the Jowett softenings "true love" (7.64) and "hear him tell what he knew" (8.26);
  - "what loves" (7.49), which is the only v1 choice kept on purpose.

  The statement that v1's Greek-based wordings were reverted still has small exceptions that no review had listed: #3, #4(b) and #7. #5 is a lost hedge rather than a Greek-based wording. Revert them or record them.
- **§3.5.**
  - Within paragraphs that hold several turns, the text follows the rule. The scan found one exception, 7.54 (#6).
  - The bullet on the resumed set speech (7.45) matches the text.
  - "Nothing else is added" now holds, because the v3 vocative is gone.
  - The rule's scope and the description of 5.15 and 7.30 need rewording (#8).
- **§4.**
  - "lord and provider" matches 5.6.
  - "Mantineia" matches 7.45, 7.65 and the character card (twice). No "Mantinea" remains.
  - Otys, Athene, Kronos and Acusilaus keep Jowett's forms in FINAL and appear in the card, as the row says.
- **§5.**
  - "In Homer's words" is at 8.10, where Jowett's note cites Pope's Homer.
  - Jowett names Homer at 1.19, 2.5 and 7.60. Neither Jowett nor FINAL names Odysseus.
  - The reworded sentence on new names is consistent with 8.29 and 8.33.
- **SOURCE-NOTES §3, new rows.** Each quotation of Jowett matches `base-original-en.json`, and each rendering matches FINAL: 3.5, 4.2, 5.6, 7.0, 7.60, 7.63, 8.26, 8.37, 8.39, 8.43 and 8.45.
  - The 8.46 paragraph is accurate.
  - The §2 row for 7.0 matches the new tag at 7.45.
  - One omission: #9.

## Checked and not raised

These keep Jowett's sense:

- 7.50 "for the happy are happy because …": an explanatory "for" that Jowett leaves implicit.
- 7.52 "Then in short, love is …": Jowett has "may be described generally as". The line is a question, and "in short" renders "generally".
- 7.63 "the kind of thoughts that make the young better": Jowett has "which may improve".
- 7.65 "so entrances you that": Jowett joins the two clauses with "and".
- 7.47 "magic": Jowett has "incantation".

## Other observations (not scored)

- **The staged candidate is still v1.** `books/wip/symposium-accessibility/candidate/symposium-modern-en.json` is v1 (`46fa34ea…`). FINAL exists only in the scratchpad.
- **Two cited files are missing.** `CHANGES.md` and `reviews/RESOLUTION.md`, which STYLE §1a and SOURCE-NOTES §4 cite, are not yet in the staging folder.
