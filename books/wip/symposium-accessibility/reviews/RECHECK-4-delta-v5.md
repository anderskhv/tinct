# Recheck 4: changes after v4, Symposium modern-en

- **Role:** independent recheck reviewer. I did not write the text or any earlier review.
- **Packet:** `review-in/delta2-packet.md`. It covers the 7 paragraphs changed after v4 (3.0, 3.1, 4.2, 7.45, 7.49, 7.54 and 8.30) and the 8 edits that changed them, in `edits-R3.json` (R3-1 to R3-7, with R3-4 in two parts).
- **Hashes verified (sha256):**
  - v4, `v4-symposium-modern-en.json`: `50cc0004ebb506b6d947bb12140441a9f4d095afa1e9d7c6a296ef145e134b32`
  - FINAL, `cand/symposium-modern-en.json`: `a848700fabaa280b3f174534df048cb3db14be5054a11c6e2a7095fb5536b76d`
  - source (Jowett), `base-original-en.json`: `3521a12d…95a6`, as STYLE §1 pins.
- **Standard:**
  - `STYLE.md`: §1a, §2, §3 (including the reworded §3.5), §4 and §6.
  - Findings #1–#8 of `reviews/RECHECK-3-delta-v4.md`.
  - To label older wording, I also read `SOURCE-NOTES.md`, the accepted baseline (`1e970b7b…374f`), v1 (`candidate/symposium-modern-en.json`, `46fa34ea…113e`) and what the earlier reviews said about these paragraphs.
- **Date:** 2026-09-25

## Method

- **Integrity.**
  - I compared v4 and FINAL paragraph by paragraph. Exactly the packet's 7 coordinates differ.
  - The structure is unchanged: 8 chapters and 226 paragraphs (49/8/12/10/18/13/69/47). The chapter numbers and titles are the same, and the titles match the source. No other field changed.
  - I replayed the 8 edits on v4 in file order. Each "old" string occurs exactly once in its paragraph, and no "new" string was already there. The result equals FINAL. Written out in the same format (2-space indent, UTF-8, no trailing newline), it reproduces FINAL byte for byte.
  - The packet's JOWETT, V4 and FINAL texts and its edit lines match the files character for character.
- **Findings.** For each edit, I read the Recheck 3 finding it cites and compared the edit with the suggested fix.
- **Fidelity.**
  - I read all 7 FINAL paragraphs sentence by sentence against Jowett, not only at the edit sites.
  - I traced each remaining departure from Jowett to the baseline or v1, and checked what Reviews 1A, 1C and 1D, Rechecks 1–3 and the consistency pass said about it.
- **Attribution and quotation.**
  - I read 7.44–7.56 and 8.29–8.31 in `review-in/v5-full-text.md`.
  - By script, I split each of those paragraphs into quoted and narrated segments and listed the turns. I judged each untagged line by hand against the reworded §3.5.
  - Book-wide, every paragraph that ends inside a quotation is followed by a continuation mark: 28 paragraphs, the same list in v4 and FINAL.
- **House style.**
  - I scanned the 7 paragraphs for non-ASCII characters, dash spacing, curly quotes, British spellings, contractions, doubled words and double spaces.
  - I also scanned the whole book for characters. The em-dash is the only non-ASCII character: 219 of them, as in v4. Each has a space on both sides, except the one that ends the verse paragraph 1.45, which has a space before it.
- **Constraints kept.**
  - I used no web or external source. Every finding rests on Jowett's text in the file. The Greek is mentioned only as the likely origin of a wording, from memory.
  - I ran read-only inline Python, made no helper files and ran no git commands.
  - This report is the only file I wrote.

## Verdict: ACCEPT

**Counts:** BLOCKING 0 · SHOULD-FIX 0 · OPTIONAL 1.

- **Each edit resolves its finding with the suggested wording, verbatim.** At 4.2, R3-3 takes the first of Recheck 3 #3's two options: it reverts rather than records. SOURCE-NOTES §3 now lists #3, #4 and #7 as reverted, which matches FINAL.
- **Each new sentence is faithful to Jowett and reads naturally,** aloud as well as on the page (see Coverage).
  - The restored words are "quite" (3.0), "tends to … as well as" (3.1) and "concerned with the principles of love" (4.2).
  - At 7.45 they are "nearly, if not exactly" and "this will be the easiest way, and I will", and at 7.49 "I imagine".
  - At 8.30 the understatement "had some attractions" is back.
- **No edit introduces an error.**
  - The new tag at 7.54 names Socrates. Jowett's separate quotation marks and the alternation of turns require this.
  - The answer after the new tag is a direct reply, and no later line changes speaker.
  - Quotation runs are unchanged, and house style holds.
- **The one OPTIONAL item is older v1 wording in 7.54, away from the edit.** v1 recast Jowett's conception image as childbirth. It changes no argument, so a record in SOURCE-NOTES is enough and no text change is needed.

## Findings

| # | Coordinate | Edit ID | Severity | Finding | Exact FINAL wording | Suggested fix |
|---|---|---|---|---|---|---|
| 1 | 7.54 | none (v1 wording; paragraph edited by R3-6) | OPTIONAL | **Departure from Jowett that is not recorded (§1a).** At two points Jowett speaks of conception: "the conceiving power is propitious … and not without a pang refrains from conception", and "when the hour of conception arrives, and the teeming nature is full". v1 speaks instead of childbirth by a creature that is already pregnant, and "full" became "full to bursting". The Greek is the likely origin. No argument changes. The recast also fits Jowett's own frame: "goddess of parturition who presides at birth", "the pain of travail", and 7.53's "all men are bringing to the birth". Review 1C and Recheck 2 read the paragraph and did not raise it. But SOURCE-NOTES §3 says that v1's Greek-derived wordings were reverted or recorded, and this one is neither. | `when the creature that has conceived comes near beauty`; `holds back from giving birth`; `when the time for birth comes and the pregnant creature is full to bursting` | Record it in SOURCE-NOTES §3 as a wording that makes Jowett's image consistent without changing the argument. No text change is needed. If the lead reverts it instead, revert the four phrases together, to Jowett's "the conceiving power", "refrains from conception", "the hour of conception" and "full", so that the image stays consistent. |

## Coverage: 7 of 7 coordinates

| Coordinate | Edits verified | Result |
|---|---|---|
| 3.0 | R3-1 | OK. Resolves #1. "I don't think … has been framed quite correctly" is Jowett's "not been set before us, I think, quite in the right form". The negative moves to "think", as natural English does. The edit adds no contraction; the paragraph's contractions are the accepted 3.0 wording (§6). "Several", "oversight" and "vary in value" are accepted baseline wording |
| 3.1 | R3-2 | OK. Resolves #2. "Tends to" is Jowett's "is apt to", and "as well as" removes the claim of equal measure. As in Jowett, "tends" does not reach the next clause ("it is of the body"). The semicolon gives a clear pause aloud. No contraction |
| 4.2 | R3-3 | OK. Resolves #3 in Jowett's words; "they" plainly means the principles. The wording suits Eryximachus's technical register (§2), and "too" still links music to medicine (4.1) |
| 7.45 | R3-4a, R3-4b | OK. Resolves both parts of #4. "Nearly, if not exactly, the same" keeps the sense of Jowett's "nearly if not quite the same": nearly, and perhaps entirely, the same. "This will be the easiest way" points back to the plan just stated, as Jowett's colon did. "I will" keeps the fuller register of Socrates's narration (§6). The tag "Socrates went on:" is unchanged |
| 7.49 | R3-5 | OK. Resolves #5. "I" is plainly Diotima: the sentence is inside her tagged reply and follows "my dear Socrates". "What loves" is the documented exception (§1a) |
| 7.54 | R3-6 | Edit OK. Resolves #6 (see Attribution below). Finding #1 concerns older wording elsewhere in the paragraph |
| 8.30 | R3-7 | OK. Resolves #7. The understatement is back. "Really" goes with "thought", as it already did in v4, and keeps both the self-regard and the hedge of Jowett's "as I fancied". "Won't" is allowed in Alcibiades's speech (§6) |

Summary: all 7 edits are sound. One OPTIONAL finding concerns older wording in 7.54.

## Attribution around 7.45, 7.49 and 7.54 (reworded §3.5)

- **7.54.** The sequence now runs as in Jowett:
  - Diotima: "… love of the beautiful only."
  - Socrates, tagged: "What, then?" I asked.
  - Diotima, a direct reply: "The love of procreation …"
  - "Yes," I said. / "Yes, indeed," she replied. / "But why of procreation?" I asked. / "Because …," she replied.
  - It matches the identical exchange at 7.47. SOURCE-NOTES §3 already records that "But why of procreation?" follows Jowett's attribution. The new tag is consistent with that record.
- **7.44–7.56 as a whole.** Every new question or statement that follows the other speaker's tagged line is tagged. Every untagged line falls into one of two groups:
  - **Direct replies:** "Everyone.", "Yes.", "Yes, I have.", "He can't." (7.46); the answers at 7.47 and 7.54; "True." (7.51); the assents in 7.52; "But Diotima, …" (7.55), which answers her question and opens with her name.
  - **A turn after an untagged line, where the alternation stays clear:** Diotima's last three lines in 7.46 ("And you have agreed …", "But how can anyone …", "Then you see …"); "What is he, then, Diotima?" (7.47).
- **7.45 and 7.49.** The edits change no tag. The run 7.47→7.49 still opens and closes correctly.
- **The reworded §3.5 resolves Recheck 3 #8.**
  - The rule is now split by scope: several turns in one paragraph, or one turn per paragraph.
  - 5.15 and 7.30 are now under the one-turn bullet, and 1.15 stays under the pronoun bullet.
  - The text in 7.44–7.56 and 8.29–8.30 follows the rule as now worded.

## Checked and not raised

These older wordings in the 7 paragraphs keep Jowett's sense:

- **4.2.** v1 wording that Review 1A and Rechecks 1 and 3 read:
  - "In the basic structure of harmony and rhythm" for "in the essential nature". The paragraph has just defined harmony and rhythm by what they are made of.
  - "when you have to put them to use in real life" for "want to use them". Jowett's "want" can mean need (§1a).
  - "and there cannot be agreement" for "but …". It adds a premise; it does not change a contrast.
  - The dropped "Again".
- **7.45.** "Nearly, if not exactly, the same" is followed two sentences later by "almost exactly what Agathon said to me". The two compare different things, as Jowett's "nearly if not quite the same" and "in nearly the same words" do.
- **7.49.** "Quite natural" for "very natural": in American usage, "quite" here means "entirely", not "fairly".
- **8.30.**
  - "You are a long way from that yet" for "it will be a long time before you get old". "That" is the failing of the body's eyes, so the sense holds.
  - For "The mind's eye begins to see sharply", Review 1D (#28) asked only that "only" be dropped. It accepted "truly extraordinary creature" in its note on "monster".
  - "My father" for "a father" does not change the point.

## Other observations (not scored)

- **The staged candidate is still v1.** `candidate/symposium-modern-en.json` is still `46fa34ea…`, and FINAL exists only in the scratchpad.
- **`CHANGES.md` and `reviews/RESOLUTION.md` are still missing** from the package. STYLE §1a and SOURCE-NOTES §3 and §4 cite them.
