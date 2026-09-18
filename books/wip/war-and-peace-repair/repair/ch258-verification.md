Model: opus

# Chapter 258 — Book Eleven (1812), Chapter 29 — independent verification

Files verified: `ch258-candidate.json` (pre-correction), `ch258-corrected.json`, `ch258-corrections-log.md`, `ch258-source.json`. Fidelity review `ch258-fidelity.md` read for context only; every verdict below was re-derived from the source.

## 1. Diff vs log

Python diff of the two candidates, paragraph by paragraph (0-based indices):

| ¶ | Changed in file? | Logged? |
|---|---|---|
| 10 | yes | yes |
| 11 | yes | yes |
| 24 | yes | yes |
| 56 | yes | yes |
| 57 | yes | yes |

Five paragraphs changed; five logged. Every logged change appears in the file and every changed paragraph is logged. **No mismatch.**

Non-paragraph structure (`number` 258, `title` "Book Eleven (1812) — Chapter 29", key set) is identical between candidate and corrected.

## 2. Per-change verdicts (re-derived from source)

**¶56 — MODERATE (agent deleted from the husband/lover swap) + MINOR (magnanimity).**
Source: "Then he recounted an episode in which the husband played the part of the lover, and he—the lover—assumed the role of the husband"; and "The conflict of magnanimity between the mother and the daughter".
Corrected: "…the husband played the part of the lover and he—the lover—played the part of the husband"; "The conflict of magnanimity between mother and daughter".
Verdict: **correct.** "he—" is restored, so Ramballe is back in his own anecdote and "the lover" reads as the apposition the source intends rather than as a second unnamed party carried over from "her lover" in the preceding sentence. Retaining the candidate's "played the part of" in place of the source's "assumed the role of" is a register choice within the second clause only and changes nothing. "magnanimity" now matches the source term.

**¶57 — MINOR (second occurrence of the same term).**
Source: "prompted by magnanimity, the captain restored the wife to the husband".
Corrected: "prompted by magnanimity, the captain restored the wife to the husband".
Verdict: **correct and exact.** With ¶56 this restores the repetition across three sentences that carries the ironic tag on Ramballe's self-image.

**¶10 — MINOR ("Bah," and "by my pipe").**
Source: "Bah, really? So much the better! … The great redoubt held out well, by my pipe!"
Corrected: "Bah, really? So much the better! … The great redoubt held out well, by my pipe!"
Verdict: **correct and exact** for both restored items. The rest of the paragraph is untouched, so the candidate's other renderings ("brave enemies" for "brave foes", "I swear it" for "sure as I sit here", "gallant with the ladies" for "gallant... with the fair") stand as before; none was a logged finding and none is affected by this edit.

**¶11 — MINOR ("naïvely").**
Source: "The captain was so naïvely and good-humoredly gay".
Corrected: "The captain was so naïvely and good-humoredly cheerful".
Verdict: **correct.** "naïvely" restored with the diaeresis, matching the source spelling. "gay" → "cheerful" is the pre-existing modernisation and was not a finding.

**¶24 — MINOR ("stammered").**
Source: "'Is he in Moscow?' Pierre stammered with a guilty look."
Corrected: identical.
Verdict: **correct and exact.** Pierre's hesitation is back alongside the guilty look.

## 3. New-reader pass on the changed paragraphs

¶10: "Bah, really?" opens the captain's speech in his own voice and "by my pipe!" reads as a soldier's oath — an unfamiliar one, but transparently an oath in context, and it no longer duplicates the "by my word" already used at ¶8. ¶11: "so naïvely and good-humoredly cheerful" is clear and does the characterising work. ¶24 is a four-word line, unambiguous. ¶56: "the husband played the part of the lover and he—the lover—played the part of the husband" is the one construction worth a second look, but the em-dash apposition is standard and the reader tracks "he" to the captain without effort; the anecdote is now legible as his. ¶57 reads normally; "prompted by magnanimity" is plain English.

## 4. Structure and punctuation

- Paragraph count: source 73, candidate 73, corrected 73. Order unchanged; nothing merged, split or reordered.
- No empty or whitespace-only paragraphs.
- No paragraph falls below 75% of its source paragraph's word count.
- Exclamation-mark parity with source: exact in all 73 paragraphs.
- Question-mark parity: exact in 72 of 73. ¶6 has 2 vs the source's 1 — the source's "Monsieur Pierre, you say...." becomes "Monsieur Pierre, you say?...". This is the COSMETIC finding already recorded in the fidelity review, it is present in the pre-correction candidate, and it was not introduced by this round. Not blocking.

## 5. Findings for the record

- No MAJOR finding existed. The single MODERATE finding (¶56) is addressed.
- Several MINOR findings were declined and are not recorded in the log: ¶1 ("animated" dropped), ¶7 (`limonade de cochon` dropped at both occurrences; "and brought with them" dropped), ¶23 and ¶49 (`mon cher` translated), ¶29 ("evildoer" → "tyrant"), ¶55 (`l'amour`; "clodhoppers" → "peasants"), ¶59 ("pathetic and touching" → "deeply touching"), ¶57b ("assailed" → "overcame"), plus the two COSMETIC items at ¶6 and ¶22. The log format does not require declines to be listed, so this is not a diff/log mismatch, but the declines are undocumented. Non-blocking, with one caveat: the reviewer's advice that the French-token handling (`limonade de cochon`, `l'amour`, `mon cher`) be settled in a single pass across the edition rather than paragraph by paragraph still stands as open work outside this chapter.
- ¶29 ("to slay the evildoer" → "to kill the tyrant") is the declined MINOR with the most meaning in it — it shifts Pierre's framing of Napoleon from moral to political — but it is correctly graded MINOR and does not block acceptance of this round.
- No new drift was introduced by any of the five corrections.

Verification: ACCEPT
sha256: 17d300ef420e8c1c8a090e6fc4f12e961dc0c70e8f2933440ccfd3ab0869b224
