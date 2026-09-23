# Fidelity review — Book VI (6.0–6.58)
Reviewer: independent fidelity reviewer. Coverage: 6.0–6.58, all 59 paragraphs, each checked against Long sentence by sentence (ids are 0-based; the section number in the text is id + 1).

## Findings

### 6.7 — MINOR
- Source: "The ruling principle is that which rouses and turns itself"
- Candidate: "The ruling faculty is what wakes itself up and turns itself around."
- Problem: "turns itself" means the faculty directs itself (Greek τρέπον ἑαυτό). "Turns itself around" adds the idea of reversing direction, which the source does not say.
- Proposed: "The ruling faculty is what wakes itself up and turns itself where it wills." Or, more simply: "The ruling faculty is what rouses itself and directs itself."

### 6.23 — MINOR (image)
- Source: "Alexander the Macedonian and his groom"
- Candidate: "Alexander of Macedon and his stable boy"
- Problem: "boy" adds youth and pettiness that the source does not have. Long's "groom" (Greek ὀρεωκόμος, a mule-driver) is simply a humble servant.
- Proposed: "Alexander of Macedon and his stable hand were brought to the same state by death."

### 6.23 — MINOR (terminology/addition)
- Source: "received among the same seminal principles of the universe"
- Candidate: "taken back into the same seed-principles of the universe, from which all things grow"
- Problem: Book IV already renders this term as "generative principle" (IV.14, glossed "the seed of reason from which things grow") and "generative intelligence of the universe" (IV.21, no gloss). Here the candidate uses a different term, "seed-principles", and adds a second gloss. The added words do not change the meaning, but they break the standard's rule of one gloss and one stable term.
- Proposed: "Either they were taken back into the same generative principles of the universe, or they were both scattered alike among the atoms." (Alternatively, change IV to "seed-principle" and drop the gloss here. Either way, use one term.)

### 6.31 — AMBIGUITY
- Source: "And of these however only those which are done with reference to the present; for as to the future and the past activities of the mind, even these are for the present indifferent."
- Candidate: "And even of these, only the ones that concern the present count; for the mind's future and past activities are, for the present, indifferent too."
- Note: Long's clause is elliptical. It could mean (a) only the present activities are in its power (continuing the previous sentence), or (b) only the present activities are not indifferent (anticipating the "for" clause). The candidate's "count" deliberately leaves both open, which is defensible, but a listener may not know what they "count" as. If a reading is chosen, (a) follows Long's syntax most directly: "And even of these, only the ones that concern the present are in its power; …". Log in AMBIGUITIES.md either way.

### 6.40 — AMBIGUITY (textual; editor's query), with the candidate's reading endorsed
- Source (as served in source.json): "it must of necessity be that, if such a bad thing befall thee, or the loss of such a good thing, thou wilt not blame the gods, and hate men too"
- Candidate: "it is inevitable that when such a bad thing happens to you, or you lose such a good thing, you will blame the gods. And you will hate people too"
- Judgment: the candidate is **correct**, and "not" should not be restored. Reasons:
  1. The Greek says this is necessary: ἀνάγκη … μέμψασθαι θεοὺς καὶ ἀνθρώπους μισῆσαι, "you must blame the gods and hate men". There is no negative.
  2. Long's sentence only makes sense this way. "It must of necessity be that … thou wilt not blame the gods, and hate men too" is incoherent, because "and hate men too" adds a second bad consequence of the same kind. The next sentence says that people do injustice because they treat these things as mattering. The conclusion is that judging only what is in our power leaves "no reason either for finding fault with God or standing in a hostile attitude to man". That conclusion only works if the wrong judgment leads to blaming the gods.
  3. The live baseline (`baseline-live-modern-en.json`) also reads "you will blame the gods".
  - The "not" is most likely a transcription error in the served source. It could also be a slip in Long, or a surviving question form ("wilt thou not blame…?", which also means "you will blame"). The same "not" is present in the published `app/public/data/editions/meditations-original-en.json`, line 214. That edition is outside this review's scope, but someone should check it against a print copy of Long.
- Remaining issue: the drafting notes (drafts/NOTES-book06.md) record this departure from the served source text, but `AMBIGUITIES.md` has no Book VI entries. The standard requires deviations from Long's printed reading to be logged there.
- Proposed: keep the candidate text unchanged. Add to AMBIGUITIES.md: `| 6.40 | "thou wilt not blame the gods, and hate men too" | "you will blame the gods. And you will hate people too" | Served source has "not"; Greek (ἀνάγκη … μέμψασθαι θεούς) and Long's own conclusion require the positive. Probable transcription error; candidate follows the sense. Verify against print Long. |`
- Minor sub-point (optional): the split into two sentences slightly loosens "inevitable" from the second consequence. If that matters, use: "…you will blame the gods and hate people too: those who caused the misfortune or the loss, or those you suspect of being likely to cause it."

### 6.49 — AMBIGUITY
- Source: "But thou attainest thy object, if the things to which thou wast moved are [not] accomplished."
- Candidate: "And you achieve your aim, even if the things you set out to do are not accomplished."
- Note: the candidate follows Long's bracketed "[not]" and resolves "if" to "even if", which matches Long's intended sense. The Greek without Long's supplement (τούτου δὲ τυγχάνεις· ἐφ' ἃ προήχθημεν, ταῦτα γίνεται) is usually read as "and this you do attain; the things we were moved toward are coming about". On that reading the reserved effort itself is what is accomplished. The candidate's choice follows the standard (it follows Long). Log it in AMBIGUITIES.md.

### 6.49 — MINOR
- Source: "Let us try to persuade them [men]."
- Candidate: "Let us try to persuade them."
- Problem: the section opens with a "them" that has no antecedent. Long supplies one ("[men]"), and the standard says to resolve a dangling pronoun when its antecedent is clear.
- Proposed: "Let us try to persuade people. But act even against their will, when the principles of justice lead that way."

## Paragraphs with no findings
6.0, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 6.15, 6.16, 6.17, 6.18, 6.19, 6.20, 6.21, 6.22, 6.24, 6.25, 6.26, 6.27, 6.28, 6.29, 6.30, 6.32, 6.33, 6.34, 6.35, 6.36, 6.37, 6.38, 6.39, 6.41, 6.42, 6.43, 6.44, 6.45, 6.46, 6.47, 6.48, 6.50, 6.51, 6.52, 6.53, 6.54, 6.55, 6.56, 6.57, 6.58.

Notes on items checked and accepted (no action needed):
- 6.15: "If not, you will be neither free…" makes Long's implied condition explicit and is correct.
- 6.29: every member of the Antoninus list is present.
- 6.42: the gloss "Aesculapius, the god of healing" is a brief name gloss the reader needs.
- 6.46: the full roll of names is kept.
- Terminology is consistent with the standard: ruling faculty (6.7); nature of the universe (6.8, 6.57); providence (6.9, 6.43); impressions (6.12, 6.15, 6.27); "made for community" and "acts done for the common good" (6.6, 6.29, 6.43); "unpretentious" (6.29); "not bad for him" (6.32); "stuff you have been given to be made of" (6.48).

## Summary
- BLOCKING: 0
- MINOR: 4 (6.7; 6.23 ×2; 6.49)
- AMBIGUITY: 3 (6.31; 6.40; 6.49). The candidate's reading at 6.40 is endorsed; it only needs logging in AMBIGUITIES.md, which currently has no Book VI entries.

Verdict: **PASS** (no blocking findings).
