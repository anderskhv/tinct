# Independent Review — Faust Part I Onboarding `openingText` Fix

## Verdict: ACCEPT

## 1. English `openingText` — verbatim check

Candidate (`books/wip/faust-part-1-onboarding-fix/onboarding/faust-part-1.json`):

> "Again ye come, ye hovering Forms! I find ye, As early to my clouded sight ye shone! Shall I attempt, this once, to seize and bind ye? Still o'er my heart is that illusion thrown? Ye crowd more near! Then, be the reign assigned ye, And sway me from your misty, shadowy zone! My bosom thrills, with youthful passion shaken, From magic airs that round your march awaken."

Accepted `original-en` candidate, chapter 1 ("Dedication"), paragraph 0
(`books/wip/faust-part-1-english-repair/editions/faust-part-1-original-en.json`):

Programmatically extracted and compared string-for-string via Python `repr()` — **identical, character for character**, including the curly apostrophe in "o'er." No truncation, no paraphrase.

## 2. Danish `openingText` — verbatim check

Candidate (`.da.json`):

> "I kommer igen, I svævende skikkelser, som I engang viste jer for mit tågede blik. Skal jeg denne gang forsøge at gribe og holde jer fast? Har den gamle vildfarelse endnu et sådant tag i mit hjerte? I trænger jer nærmere. Nuvel, så råd da over mig, som I stiger op af tåge og dis omkring jer! Mit bryst skælver af en ungdommelig lidenskab, rørt af den fortryllende luftning, der rejser sig ved jeres komme."

Accepted `modern-da` candidate, chapter 1, paragraph 0
(`books/wip/faust-part-1-modern-da-repair/editions/faust-part-1-modern-da.json`):

Compared via Python `repr()` — **identical, character for character**. No truncation, no paraphrase.

## 3. `openingChapterLabel` unchanged

- EN: `"Dedication"` in both candidate and live pre-fix file — unchanged, correct.
- DA: `"Tilegnelse"` in both candidate and live pre-fix file — unchanged, correct.

## 4. No other field altered

Programmatic key-by-key comparison of candidate vs. live pre-fix JSON (all top-level keys, excluding `openingText`) for both files:

```
EN diff keys other than openingText: []
DA diff keys other than openingText: []
```

Only `openingText` differs in either file. `about`, `angleCards`, `cast`, `acclaim`, `whyItMatters`, `preReadingChat`, `whyItMattersItems`, `era`, `length`, `estimatedTime`, `title`, `author`, `bookId` are byte-identical to the live versions.

## 5. Independent spoiler-safety comparison: Faust `cast` vs. Macbeth `cast`

Read both `app/public/data/onboarding/macbeth.json` (live, accepted) and the Faust candidate's `cast` array directly, without relying on the package's framing.

**Macbeth's cast already reveals, in plain language:**
- Duncan is "killed in his sleep early in Act II."
- Banquo: "Macbeth has him murdered."
- Macduff's family: Macbeth "has Macduff's wife and children slaughtered in revenge" — i.e., Macbeth's own cast bios already disclose the murder of children, arguably the single bluntest kind of plot spoiler a cast array can carry.
- Lady Macbeth: "her death — offstage, almost casually reported — is the moment Macbeth realizes nothing matters anymore" (death disclosed, method left implicit).
- Macbeth's own death is disclosed in the `about` field (not the `cast` array): "He dies in single combat at the end of Act V, his head carried onstage."

**Faust's cast reveals, in plain language:**
- Faust: "Seduces Gretchen... kills her brother... abandons her on the eve of her execution."
- Gretchen: "drowns the infant she bears... arrested, goes mad in the dungeon."
- Valentin: "killed in the resulting street fight."
- The Lord: spells out "Gretchen's ruin, Valentin's death, the infanticide, the dungeon" as a summary list.

**My own assessment:** Faust's cast is consistent with, not categorically beyond, Macbeth's established precedent. Macbeth's own accepted cast array already discloses a killing of children (Macduff's family) in blunt, undisguised language — that is at least as severe a spoiler as Gretchen's infanticide, and arguably worse since it's presented as Macbeth's deliberate act of revenge against innocents rather than a single desperate act by a victimized character. Both arrays disclose: who dies, who kills whom, and the emotional/moral shape of the ending, without describing staging or exact final lines.

One real difference worth flagging (not disqualifying): Faust's cast entries are somewhat more procedural about *how* events unfold — the Gretchen entry walks through the mechanics of the seduction (jewels, bribed neighbor, sleeping draught) in addition to the outcome — where Macbeth's entries stay closer to outcome-level statements. This is a difference of narrative density, not of spoiler category or severity; Macbeth's own bios go into comparable mechanism-level detail elsewhere (e.g., the witches' prophecy and Banquo's ghost at the banquet). I would not block or force a rewrite on this basis, but if the project wants to tighten the house style further, this is the specific texture to look at — not whether Faust's cast is spoiler-heavy at all (it plainly is, by design, matching Macbeth).

**Conclusion on item 5:** Faust's cast array is consistent with established convention as demonstrated by the live Macbeth cast array. It does not go meaningfully further in severity. No rewrite is warranted on spoiler-safety grounds.

## 6. JSON validity

Both candidate files parse cleanly with `python3 -m json.tool`:
- `books/wip/faust-part-1-onboarding-fix/onboarding/faust-part-1.json` — valid.
- `books/wip/faust-part-1-onboarding-fix/onboarding/faust-part-1.da.json` — valid.

## Overall verdict: ACCEPT

The fix does exactly what it claims: it replaces the stale `openingText` in both the English and Danish onboarding files with an exact, verbatim quotation of the corresponding accepted replacement edition's chapter 1, paragraph 0 — nothing more, nothing less. `openingChapterLabel` was correctly left untouched in both files. No other field was altered. Both files are valid JSON. The package's separate claim about cast-array spoiler consistency with Macbeth also holds up under independent comparison of the actual live Macbeth cast text.
