# R1 re-verification — Part D (ch4 Preliminary Expectoration, ¶12–17)

Re-verifier: fresh, independent (Danish → English). I compared `drafts/D-ch4.json` (r1) with `drafts/history/D-ch4.r0.json` (r0) and with `source/original-da-final.json`, chapter 4, ¶12–17, sentence by sentence, against `STYLE-AND-TERMINOLOGY.md`. I consulted no other English translation.

## Summary

- **Findings:** all 21 are **RESOLVED**. That is 1 MAJOR and 20 MINOR. None was declined.
- **The MAJOR (*umulig*):** the fix is correct. ¶17 now reads "impossible … impossible", and that feeds straight into "it is an impossibility". The n4.21a anchor was updated. It occurs exactly once and ends at the sentence boundary, matching the Danish marker after "…fra Idealiteten til Realiteten."
- **New defects from the edits:** 0 BLOCKER, 0 MAJOR, 3 MINOR (one of them optional).
  1. **¶16, "no solid citizen": MINOR, fix recommended.** The word "solid" is added. It echoes, and blurs, "He is solid through and through", said of the knight one sentence earlier.
  2. **¶17, "the relationship is such": MINOR.** Danish *Forholdet* here means "the circumstances". "Relationship" suggests a mutual relationship with the princess that the Danish does not assert.
  3. **¶12, "For he did not do this": MINOR, optional.** It now directly follows "…seventy times to his deed", so "this" briefly reads as referring to the deed.
- **Structure:** six slots, indices 12–17. No merges or splits. `sectionHeading` and `dividerBefore` are null. Notes n4.21a and n4.22a are unchanged apart from the n4.21a anchor. Both anchors occur exactly once in ¶17.
- **Verdict: APPROVABLE.** Part D can go to style review. I recommend applying fix 1 first, since it is a one-phrase edit. Fixes 2 and 3 are at the editor's discretion.

---

## 1. Finding-by-finding status

| # | ¶ | Sev. | Finding | r1 text checked against Danish | Status |
|---|---|---|---|---|---|
| 1 | 12 | MINOR | *naar det forlangtes*: "when" | "willing to sacrifice him when it was demanded." | RESOLVED |
| 2 | 12 | MINOR | *vel* is concessive | "So he was no doubt surprised by the outcome;". "So" carries *da* and "no doubt" carries *vel*. The awkward trailing "then" is gone. | RESOLVED |
| 3 | 12 | MINOR | *naaet hen til* | "he had arrived at his first condition" | RESOLVED |
| 4 | 12 | MINOR | Stand-alone *troede* | "Abraham had faith." | RESOLVED |
| 5 | 12 | MINOR | *salig … lyksalig* | "blessed in the world beyond … blessed with happiness here in this world". The echo is kept and *salig* stays "blessed". The phrasing is a little heavy, but it is accurate: *lyk-salig* is literally "happy-blessed". | RESOLVED |
| 6 | 12 | MINOR | *vreden* | "a back like a rope-dancer's, twisted when I was a child". "Like" also restores the simile (*som en Liniedandsers*). | RESOLVED |
| 7 | 12 | MINOR | *thi* dropped | "; for the marvelous I cannot do — I can only stand amazed at it." | RESOLVED |
| 8 | 12 | MINOR | *behøver jeg ikke Abraham* | "then I have no need of Abraham." | RESOLVED |
| 9 | 12 | MINOR | *nemlig* | "For he did not do this, as I can prove from the fact that…". See new defect N3. | RESOLVED |
| 10 | 14 | MINOR | *Intet … uden at forbauses* | "I can learn nothing from him except to be astonished." The negation and the verbal form are both restored. | RESOLVED |
| 11 | 14 | MINOR | *Leve-Viisdom* | "suck wisdom for living out of the paradox" | RESOLVED |
| 12 | 15 | MINOR | *Træl* | "the slave in Abraham's household". This is consistent with "slaves of wretchedness" in ¶17. | RESOLVED |
| 13 | 15 | MINOR | *svævende* | "their gait is gliding, bold." The Danish asyndeton is kept. | RESOLVED |
| 14 | 15 | MINOR | Philistine gloss chain | "…deeply despise: philistinism, the outlook of the philistine — the narrow, comfortable townsman." The dash now attaches the townsman to "the philistine", not to "philistinism". "Townsman" no longer appears in ¶16, so *Borgermand* and *Spidsborger* are now distinct. See new defect N1 on the ¶16 companion edit. | RESOLVED |
| 15 | 16 | MINOR | *ikke komme med* | "sit out and do not get into the dance" | RESOLVED |
| 16 | 16 | MINOR | *ikke usalig* | "a pastime not without its blessedness". The litotes is kept, and the word now matches "the blessedness of infinity" later in the same paragraph. | RESOLVED |
| 17 | 17 | **MAJOR** | *umulig* → impossible | "it is impossible for this love to be realized, impossible for it to be translated out of ideality into reality." The chain to "it is an impossibility" is now intact. The anchor is updated and verified. See new defect N2 on *Forholdet*. | **RESOLVED** |
| 18 | 17 | MINOR | *skrige* vs *qvække* | "naturally shriek: …" / "Let them croak undisturbed" | RESOLVED |
| 19 | 17 | MINOR | *Ruus* additions | "too sound and too proud to squander the least thing on an infatuation." "Of itself" and "passing" are removed. | RESOLVED |
| 20 | 17 | MINOR | *salig Vellyst* | "a blessed rapture" | RESOLVED |
| 21 | 17 | MINOR | *selv*, *opdage* | "for even at the moment he is nearest to it, he will suddenly discover that…" | RESOLVED |

## 2. New defects introduced by the edits

I read every changed sentence in ¶12, 14, 15, 16 and 17, and the changed n4.21a anchor, against the Danish. ¶13 and both note texts are unchanged.

### N1 — ¶16 — MINOR — ADDITION, false lexical echo (fix recommended)

- **Danish:** "Han er heelt igjennem solid. Hans Fodfæste? er kraftigt, tilhører ganske Endeligheden, ingen **pyntet Borgermand**, der Søndag-Eftermiddag gaaer ud paa Fresberg, træder grundigere paa Jorden"
- **r1:** "He is solid through and through. His footing? It is sturdy, and belongs wholly to finitude; no **solid citizen**, dressed up for his Sunday-afternoon walk out to Frederiksberg, treads the ground more firmly."
- **The problem:** "Solid" is not in the Danish for *Borgermand*; the attribute there is *pyntet*, "dressed up". "Solid citizen" is an idiom that adds a value judgment (respectable). It also repeats the word Johannes has just used for the knight (*solid*), one sentence earlier. The Danish contrast is the knight versus a dressed-up burgher. The edit makes it read as the solid knight versus a solid citizen, which blunts the satire.
- **Minor further point:** "dressed up *for* his … walk" adds a causal link. The Danish only juxtaposes "dressed up" with "who walks out".
- **Fix:** "no dressed-up citizen walking out to Frederiksberg on a Sunday afternoon treads the ground more firmly." "Burgher" would also work.

### N2 — ¶17 — MINOR — slight meaning shift in a companion edit

- **Danish:** "og dog er **Forholdet** et saadant, at den umulig lader sig realisere"
- **r1:** "and yet **the relationship** is such that it is impossible for this love to be realized"
- **The problem:** *Forholdet* here is "the circumstances" or "the state of affairs". "The relationship" suggests an existing relationship between the young man and the princess, which the Danish does not assert. The whole case is that he loves her and it cannot be realized. The change was made only to avoid a screen run. The MAJOR wording itself ("impossible … impossible") is correct.
- **Fix:** "and yet the circumstances are such that it is impossible for this love to be realized, …". This also breaks the 14-word run, because "circumstances" replaces "situation", which leaves a shared run of 12 words at most.

### N3 — ¶12 — MINOR (optional) — pronoun reference

- **Danish:** "…saa behøver jeg ikke Abraham, medens jeg nu bøier mig … halvfjerdsindstyve Gange for hans Gjerning. **Dette** har han nemlig ikke gjort, hvad jeg kan bevise…"
- **r1:** "…seventy times to his deed. For he did not do this, as I can prove…"
- **The problem:** "This" now comes directly after "his deed", so on a first reading it can seem to deny the deed. The referent is actually "told himself 'Isaac is lost now…'". The brief allows pronoun resolution.
- **Fix:** "For he did no such thing, as I can prove from the fact that…". This keeps *nemlig* as "For" and *gjort* as "did".

### Checked and found clean

- ¶12: "when it was demanded", "So … no doubt", "arrived at", "Abraham had faith. He did not believe…", "twisted when I was a child", "for the marvelous I cannot do", "I have no need of Abraham". All are grammatical, faithful and without additions.
- ¶14: both edits are clean.
- ¶15: "slave", "gliding, bold" and the colon-plus-dash gloss are all clean. The colon for the Danish dash before *med Spidsborgerlighed* is acceptable, and dropping "to" is idiomatic.
- ¶16: "do not get into the dance" and "not without its blessedness" are clean.
- ¶17: "shriek" / "croak", "squander the least thing on an infatuation", "a blessed rapture", and "even … discover" are clean. "Impossible for it to be translated": "it" clearly refers to "this love".
- Terminology: "blessed" / "blessedness" for *salig* / *Salighed*, "impossible" / "impossibility", "movement", "infinite resignation" and "philistinism" all match the table.
- Voice: Johannes's first person and self-deprecation are intact throughout.

## 3. Verdict

**Part D is APPROVABLE.** All round-1 findings are resolved, including the MAJOR. The edits introduced no BLOCKER or MAJOR defects. Three MINOR issues remain. N1 ("solid citizen") should be fixed before style review, because it is an addition that creates a false echo. N2 and N3 are small, optional clean-ups.
