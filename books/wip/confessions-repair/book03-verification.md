# Confessions Book 3 — independent verification of the correction pass

- **Source (ground truth):** `book03-source.json` (Pusey 1838), 21 paragraphs
- **Pre-correction:** `book03-candidate.json` · **Under verification:** `book03-corrected.json`
- **Reference review:** `book03-review.md` (F1–F53: 6 major, 12 moderate, 35 minor)
- **Drafter's account:** `book03-corrections-log.md` — read, but **not** treated as evidence. Every verdict below was re-derived from the source clause.

**Structural checks (re-run, not taken on trust):**

| Check | Result |
|---|---|
| Paragraph count | 21 ↔ 21 ↔ 21 ✅ |
| `number` / `title` fields | unchanged (`3`, "Book 3") ✅ |
| Paragraphs actually changed | 18 — indices 0–10, 13, 15–20. Exactly the set the log claims ✅ |
| Paragraphs byte-identical to candidate | 11, 12, 14 — SHA-256 match ✅ |
| Length ratios (corrected/source words) | 0.94 – 1.15, mean ≈ 1.06. No summarisation, no padding ✅ |
| Archaism scan (Thou/Thee/hath/whence/unto/fain/…) | zero hits ✅ |
| Terminology consistency | no surviving "Wreckers"/"wreck" after the revert; "corn" gone; "spin" gone; "Augustine" gone ✅ |

---

## 1. The six majors — independent verdicts

| # | Para | Source clause | Corrected clause | Verdict |
|---|---|---|---|---|
| **F10** | 2 | "who lovest souls far more purely than we, and hast more incorruptibly pity on them, yet are wounded with no sorrowfulness" | "you love souls far more purely than we do, and your pity for them is **more incorruptible than ours**, yet you are wounded by **no sorrow**." | **CONFIRMED FIXED.** Invented "though never less than perfect" is gone; the dropped comparative is restored and correctly attached to *pity*, not to love; "wounded with no sorrowfulness" is back as a wound-clause, not a "untouched by pain" paraphrase. All three defects in one clause resolved. |
| **F24** | 9 | "But Thou, my soul's Love, **in looking for whom I fail, that I may become strong**" | "But you, love of my soul, **in looking for whom I fail, so that I may grow strong**" | **CONFIRMED FIXED** on fidelity — the failing/fainting half of the paradox is restored and the purpose clause still hangs off it correctly. See N5 below: the fix is literal to the point of costing readability. |
| **F28** | 10 | "barred from the very husks of the swine, **whom with husks I fed**" | "shut out even from the husks of the **pigs I myself was feeding with husks**" | **CONFIRMED FIXED.** The incoherent double ("husks the pigs ate, on which I fed myself with husks") is gone; the prodigal-son logic — he fed the swine and was barred from their feed — now reads correctly and in one pass. |
| **F31** | 13 | "I might not place every **foot** every where, but differently in different metres; nor even in any one metre the self-same **foot** in all places" | "I couldn't put any **metrical foot** anywhere I liked — different meters required different arrangements, and even within a single meter the same **foot** couldn't go just anywhere" | **CONFIRMED FIXED.** Both instances of "syllable" replaced; the technical claim is now true and the "one art, many rule-sets" analogy lands, which matters because the next sentence ("the art by which I wrote didn't have separate rules… it held them all within one single art") depends on it. |
| **F35** | 17 | "**that morsel** would seem as it were condemned to capital punishment, which should be given him" | "**the morsel given to him** would seem, to them, as good as condemned to death" | **CONFIRMED FIXED** on the inversion — the morsel, not the act of giving, is again the thing condemned, so the Manichee doctrine being mocked is visible. One new two-word defect introduced with the fix: see N3. |
| **F44** | 20 | "had by his seduced mother been consigned over to the Manichees" | "had been handed over to the Manichees by his own mother, who had been led astray herself" | **CONFIRMED FIXED.** The third-person gloss ("a heretical sect… which Augustine belonged to for years") is removed in full; first-person voice is unbroken. Bonus: F50 ("seduced" → "misguided") is resolved in the same clause. **Note on the log's stated reason:** it claims "Manichees" was "already established at paras 5 and 17" — para 5 is the *Subverters*, a different group. Verified by string search: "Manich*" occurs only in paras 17 and 20. The removal is still the right call (the review's first choice), but the log's justification is factually wrong, as one of its claims was last round. |

**6 of 6 majors genuinely resolved.**

### Rhetorical questions (paras 0, 7, 9, 19)

Source has a "?" in each; the candidate had none in any. Corrected: all four now carry "?" — and I checked that the interrogative *syntax*, not just the punctuation, is present:

- **Para 0** — "My God, my mercy, with how much bitterness **did you**, in your great goodness, season that sweetness for me?" — inverted, genuine question ✅
- **Para 9** — "how deeply, even then, **did** the very marrow of my soul long for you… though it was only an echo?" — inverted ✅
- **Para 19** — "**Where else could this have come from** — that when she had told me this vision… 'where you are, he will be too'"?" — inverted, and the long sentence now has the grammatical anchor it lacked ✅
- **Para 7** — "**How I burned** then, my God, how I burned to rise up… though I did not know what you meant to do with me**?**" — **NOT properly fixed.** See N1.

So: 3 of 4 genuine; the fourth is punctuation-only.

---

## 2. Newly introduced errors

| # | Para | Finding | Sev | Source | Corrected wording | Fix |
|---|---|---|---|---|---|---|
| **N1** | 7 | **A question mark bolted onto an exclamative clause.** Source uses interrogative inversion ("How **did I burn**… nor knew I what Thou wouldest do with me?"). The correction changed only the terminal punctuation and left the exclamative word order and the subordinating "though", so the sentence now reads as an exclamation wearing a question mark — a visible grammatical mismatch, and the one place in the chapter where the systemic question-restoration pass is cosmetic rather than real. | **moderate** | "How did I burn then, my God, how did I burn to re-mount from earthly things to Thee, nor knew I what Thou wouldest do with me?" | "How I burned then, my God, how I burned to rise up from earthly things back to you, though I did not know what you meant to do with me?" | "How did I burn then, my God, how did I burn to rise up from earthly things back to you — and did I even know what you meant to do with me?" |
| **N2** | 0 | **Word-repetition created by the F2 restoration.** Source deliberately varies the two nouns (*concupiscence* / *lustfulness*); restoring "hell of lust" next to the untouched "filth of lust" produces "lust… lust" in a single clause. Fidelity improved, prose degraded. | minor | "defiled the spring of friendship with the filth of **concupiscence**, and I beclouded its brightness with the hell of **lustfulness**" | "I fouled the spring of friendship with the filth of **lust**, and clouded its brightness with the hell of **lust**" | "…with the filth of craving, and clouded its brightness with the hell of lust" |
| **N3** | 17 | **Attributive added that contradicts the paragraph's own logic.** The source has no "to X" phrase at all. The candidate's "to us" was at least consistent with Augustine's position as a Manichee hearer; "to them" distances him from the belief two sentences after he says "And I, wretched fool, believed…". | minor | "that morsel would seem as it were condemned to capital punishment" | "the morsel given to him would seem, **to them**, as good as condemned to death" | drop "to them" |
| **N4** | 20 | **Tense mismatch introduced by the F48 fix.** The bishop is predicting what Augustine *will* find; the restored theological noun arrived with a past-tense verb inside a present/future frame: "what that error **is** and how great its impiety **was**." | minor | "he will of himself by reading find what that error is, and how great its impiety" | "He'll find out for himself, through his own reading, what that error is and how great its impiety **was**." | "…what that error is, and how great its impiety is" |
| **N5** | 9 | **Fidelity fix taken at a readability cost.** "in looking for whom I fail" is Pusey's syntax transplanted whole into a modern-English edition. *Fail* here means *grow faint*; a present-day reader will parse it as "fail to find you", which reverses the paradox. The review's own proposed wording had the same weakness, so this is inherited, not invented — but it should not ship unexamined in a `modern-en` edition. | minor | "in looking for whom I fail, that I may become strong" | "in looking for whom I fail, so that I may grow strong" | "in the search for whom I grow faint, so that I may grow strong" |

### Residual (not new, but not fully closed)

- **F8, para 1 — partially resolved.** The opening drift is fixed ("a person… he… his"), but the paragraph still runs a collective noun against a singular pronoun twice further down: "The audience isn't being called on to help anyone — only to feel sad, and the more sadness the play draws out of **him**…" and "…doesn't move the audience to tears, **he** leaves annoyed". Source is singular throughout ("the auditor… he"). **minor** — fix by making it "a spectator" / "the spectator" in both places.
- **F38, para 15 — partially resolved.** "instead of you" correctly dropped, but the two smaller additions the review flagged in the same finding survive: "picked out **from your creation**" (source: the deliberately loose "therefrom") and "the nature you created and ordained **for them**". **minor**, acceptable if consciously kept.
- **F11, para 2 — declined.** The reviewer marked it optional; the merge loses no content. Source has 8 "?", corrected has 7, and the missing one is exactly this merge — verified, nothing else was lost. **Accept the decline.**
- **F33, para 13 — declined in part.** "exactly" and "through them" were both removed; the remaining structure is fine. **Accept.**
- Observation, not a finding: para 2's "And who is sufficient for these things?" (2 Cor 2:16) renders as "And who is equal to this?", losing the Pauline echo. Pre-existing, unflagged in the original review, no action required.

---

## 3. Untouched-paragraph claim (11, 12, 14)

**Confirmed.** SHA-256 of each paragraph string is identical between `book03-candidate.json` and `book03-corrected.json`:

- para 11 `b633557fed9028a7…`
- para 12 `6ecc8a81b406a49b…`
- para 14 `aed8f79da0cba888…`

No silent drift, no whitespace or punctuation churn. The top-level `number` and `title` fields are also unchanged.

---

## 4. Whole-chapter read

Read straight through, 21 paragraphs, corrected file only.

**Seams.** The chapter's two worst voice breaks are gone. The third-person "which Augustine belonged to for years" (para 20) and "spin" (para 19) were the only two moments where the prose stopped sounding like one narrator; both are cleanly excised, and nothing has taken their place. The edited paragraphs do not read as patched — the corrections are clause-level substitutions inside sentences the drafter had already built, and the register (elevated-but-plain, second-person address to God, no contemporary idiom) holds across the edited/unedited boundary. Paragraphs 10→11, 12→13 and 14→15 — the three places where an unedited paragraph sits next to a heavily edited one — read continuously; the metre analogy in the rewritten para 13 now sits correctly between para 12's armoury/household analogies and para 14's Sodom argument, which it did not when "foot" was "syllable".

**Improvements that carry across paragraphs, not just locally.** Three of the fixes repair links rather than words: para 1's "mercy" now feeds para 2's "truer mercy" (the pair was broken); para 5's revert to "Subverters" restores the subverted/Subverters wordplay the source builds the sentence on, and the question now closes where the source closes it, so the appositive that follows reads as an appositive; para 9's restored "the Paraclete" puts the full Trinitarian naming back in the one place the chapter names it.

**Remaining rough edges.** Two. Para 7's opening sentence (N1) is the only sentence in the chapter whose punctuation and syntax disagree, and it sits in a prominent position — the first line of the *Hortensius* episode. Para 9's "in looking for whom I fail" (N5) is now the single most opaque clause in 5,800 words; it is fidelity-correct and reader-hostile at the same time. Para 15's long enumerated sentence is still long, but F36's fix did land — "resents a rival he fears may become his equal, or resents that he already is" is followed on a straight read without a re-read, which the old clause was not.

**Systemic patterns from the original review.** The four flattened questions: 3 genuinely restored, 1 punctuation-only (N1). The "added interpretive connective" pattern: "beneath that lay", "was meant to", "that wisdom promises", "yet lofty", "instead of you", "through my mother", "supposedly", "appropriate to" — all eight verified removed against source. That sweep was done properly.

---

## 5. Verdict

**Not yet "corrected and verified" — but one micro-round away, not another correction round in any meaningful sense.**

- All **6 majors: independently confirmed resolved.**
- All **12 moderates: resolved** — except that the F20 fix (para 7) was executed as punctuation only and leaves a new moderate-severity grammatical mismatch in its place (N1).
- **35 minors:** resolved or consciously declined, with two partials (F8, F38) and four new minors (N2–N5).

The single blocking item is **N1 (para 7)**. It is a moderate by the same yardstick as the original review, and the rule stated for acceptance is "no unresolved major/moderate findings remain", so Book 3 cannot be marked corrected-and-verified as the file stands. Everything else on the list is minor.

**Recommended action — five edits, all single-clause, none touching surrounding text:** N1 (para 7, invert to "How did I burn"), N2 (para 0, vary the noun), N3 (para 17, delete "to them"), N4 (para 20, "impiety is"), N5 (para 9, "grow faint" for "fail"); optionally F8's two residual "audience… he" mismatches in para 1. No re-draft, no re-alignment, no structural work. I would not ask for another full review cycle after these — a targeted spot-check of the six clauses is sufficient, because none of them interacts with anything else in the chapter.

**On whole-book editorial acceptance for Book 3:** with those five edits applied, **yes — I would call Book 3 editorially accepted.** The foundation was never in question (21/21 alignment, no archaism, no summarisation, blunt material unsoftened) and the correction pass has now closed every fidelity defect that mattered: the invented clause, the dropped paradox, the garbled prodigal-son allusion, the false metrical claim, the inverted Manichee doctrine, and the voice-breaking gloss. What remains after the five edits is a chapter whose worst surviving problem is a mildly over-literal relative clause. Until those five edits are in the file, the status is **corrected, verification held**.

**Scope note:** this is acceptance of **Book 3 only**. Confessions has 13 books; nothing here licenses any claim about Books 1–2 or 4–13, and the two systemic patterns found in Book 3 (flattened rhetorical questions, added interpretive connectives) are drafting habits, not paragraph-local accidents — they should be assumed present in the other books until each is checked with the same two automated scans (`?`-count per paragraph, source vs candidate; and a connective-addition sweep).
