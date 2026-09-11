# apology — Apology (Plato)

**Reviewer:** batch agent, 2026-09-11 · **Scope:** public

## Edition snapshot (from Phase 1 mechanical data)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `a951009eaf834d24` | 3 | 92 | 11,383 | Jowett (1871) |
| modern-en | `f09399f0fe5348b3` | 3 | 92 | 7,856 | Modern English |
| modern-da | `7478955a3818154f` | 3 | 92 | 7,840 | Moderne Dansk |

`en_editions_aligned: true`, no paragraph-count mismatch, no empty paragraphs.
Mean weighted similarity **0.3598** (lowest in this batch). `pct_identical_long_paragraphs` 0.0.
**11 truncated paragraphs** flagged (ratio 0.54–0.60): ch1 ¶5, ¶16, ¶47, ¶51, ¶59, ¶69, ¶74, ¶75; ch2 ¶1, ¶5; ch3 ¶4.

Chapters: 1 "The Defense" (77 ¶, 8,659 → 5,961 w), 2 "The Penalty" (6 ¶, 1,074 → 774 w),
3 "Final Words" (9 ¶, 1,650 → 1,121 w).

### Core English text — provenance
Benjamin Jowett; registry label "Jowett (1871)". The file retains Jowett's
alternative-reading parentheticals (ch1 ¶0: "(Or, I am certain that I am right in
taking this course.)"), characteristic of the Project Gutenberg Jowett text. Complete —
the full defence, counter-penalty, and closing address. Exact Jowett edition year not verified.

## Phase 1 flags — confirmed / disconfirmed

**Low similarity — CONFIRMED as a genuine rewrite, NOT a pass-through.** 0% of long
paragraphs are byte-identical, 0% sit at ≥0.90 word similarity, and archaic-vocabulary
density drops from 11.3 to **0.0 per 10k words — a 100% reduction**. This is a real,
from-scratch modernisation and the prose is genuinely excellent to read.

**Truncation flags — CONFIRMED, and the problem is broader than the 11 flagged
paragraphs.** The compression is uniform across all three chapters (0.69 / 0.72 / 0.68
word ratio); the flagged paragraphs are just the tail of a distribution. Reading the
pairs, the compression is not achieved only by tightening — trailing clauses carrying
real content are repeatedly dropped. This is "missing substance concealed by fluent
prose", the first failure mode in the standard.

## Samples inspected (6 passages; the book is short, so coverage is high)

### 1. Ch1 ¶0–3 — the opening — **GOOD prose, one omission**
- SRC ¶0: "…they have scarcely spoken the truth at all; **but from me you shall hear the whole truth**: not, however, delivered after their manner in a set oration duly ornamented with words and phrases. **No, by heaven!** but I shall use the words and arguments which occur to me at the moment"
- MOD ¶0: "But you won't hear from me the kind of polished speech they gave. No — I'll use whatever words and arguments come to me in the moment."
- The pledge "from me you shall hear the whole truth" — the hinge of the whole exordium, and echoed later at ch1 ¶17 — is dropped, as is the oath "by heaven". (The oath-dropping is inconsistent: "by Zeus I will" is kept at ch1 ¶38, "By the goddess Here" is dropped at ch1 ¶29.)

### 2. Ch1 ¶2 — the old accusers — **OMISSIONS**
- SRC: "…and the cause when heard went by default, for there was none to answer. And hardest of all, I do not know and cannot tell the names of my accusers… **All who from envy and malice have persuaded you—some of them having first convinced themselves—all this class of men are most difficult to deal with**; for I cannot have them up here, and cross-examine them"
- MOD: "…and they caught you at your most impressionable age. Worst of all, I don't even know who most of them are — except perhaps some comic poet. I can't call them up here to cross-examine them. I have to fight shadows."
- Two distinct losses: the legal point that the case went undefended, and the whole
  characterisation of the accusers' motive ("envy and malice") with its sharpest touch
  ("some of them having first convinced themselves"). Both are substance, not ornament.

### 3. Ch1 ¶14–17 — the oracle, the craftsmen, the three accusers — **MOSTLY GOOD, one omission**
- ¶14 and ¶15 are well done; the Delphic-oracle logic ("only God is truly wise… he was using my name as an illustration") is intact.
- ¶16 drops the closing clause entirely: SRC "…and as they are numerous and ambitious and energetic, and **are drawn up in battle array** and have persuasive tongues, they have filled your ears with their loud and inveterate calumnies." MOD ends at "…making the weaker argument win." The military image and the explanation of *why* the slander stuck are both gone. "Images replaced by explanations" / dropped image.

### 4. Ch1 ¶28–39 — the Meletus cross-examination — **GOOD; one logical softening**
- The stepwise structure (all Athenians improve the young / horses / better to live among good citizens / therefore no one corrupts willingly) is preserved cleanly and reads much better than Jowett.
- One logical distinction lost: SRC ¶37 "One man is able to do them good, **or at least not many**;—the trainer of horses" → MOD "Only one person — the horse trainer — does them good". The source hedges; the modern asserts. Exactly the "some vs all" class the standard flags, in an argument built on that very asymmetry.

### 5. Ch1 ¶74–75 — refusing to parade his children — **OMISSION + person shift**
- SRC ¶74: "Perhaps there may be some one who is offended at me, when **he** calls to mind how **he himself** on a similar, or even a less serious occasion, prayed and entreated the judges with many tears" → MOD: "Some of you may resent me when **you** recall how, in similar situations, **you** begged the judges through tears". The hypothetical third-person juror becomes a direct accusation of the audience; the modern then reinstates the hedge ("If anyone feels this way — and I'm not saying anyone does"), so the paragraph contradicts itself in register.
- SRC: "I am a man, and like other men, a creature of flesh and blood, and not **'of wood or stone,' as Homer says**" → MOD: "I am a man too." The explicit Homeric quotation and attribution are deleted outright.

### 6. Ch2 ¶1–2 — the counter-penalty — **CONTENT DUPLICATED ACROSS PARAGRAPHS**
- SRC ¶1 ends: "…a reward which he deserves far more than the citizen who has won the prize at Olympia in the horse or chariot race, whether the chariots were drawn by two horses or by many."
- SRC ¶2 begins: "For I am in want, and he has enough; and **he only gives you the appearance of happiness, and I give you the reality.**"
- MOD ¶1 ends: "…a reward he deserves far more than an Olympic chariot winner. **That person gives you the appearance of happiness; I give you the real thing.**"
- MOD ¶2: "I'm poor, and the Olympic winner has plenty. **He gives you the appearance of happiness; I give you the reality.** …"
- The sentence has been pulled forward from ¶2 and then left in ¶2 as well, so the
  modern says it twice. That is a confirmed alignment defect in a paragraph-aligned
  edition: a split-pane reader sees ¶1 in the modern column carrying content that
  belongs to ¶2 in the source column.

### 7. Ch3 ¶3–5 — the closing address — **OMISSIONS**
- SRC ¶3: "**O my judges—for you I may truly call judges**—I should like to tell you of a wonderful circumstance." MOD: "I want to tell you something remarkable." Socrates's pointed insistence that only the acquitting minority deserve the title "judges" — a famous, deliberate rhetorical move — is deleted.
- SRC ¶5: "**Above all, I shall then be able to continue my search into true and false knowledge; as in this world, so also in the next; and I shall find out who is wise, and who pretends to be wise, and is not.**" MOD: "Best of all, I could continue doing what I do now: examining people." The content of the search — true vs false knowledge, the wise vs the pretenders — is compressed out of existence.
- SRC ¶4: "…and other **sons of God** who were righteous in their own life" → MOD "…and every other righteous soul."

**Socratic irony and voice:** where the modern keeps the material, the voice is good —
the mock-humility, the needling of Meletus, the cheerfulness about death all land. The
losses are of content and allusion, not of tone.

## Phase 3 — human-edition research

**Candidate A — F. J. Church, *The Trial and Death of Socrates: being the Euthyphron,
Apology, Crito, and Phaedo of Plato* (Macmillan, 1st ed. 1880; 2nd ed., Golden Treasury
Series, 1886; reprinted through 1895). RECOMMENDED CANDIDATE.**
- Translator: Frederick John Church (1854–1888).
- Completeness: complete for the Apology (pp. 33–78 of the 1895 printing), with light
  explanatory footnotes.
- Rights: **public domain, unambiguously.** US — published 1880/1886/1895, long before
  1 Jan 1931. EU/Denmark — author died 1888; life+70 expired 1958. No renewal question,
  no jurisdictional split.
- URL (full text I read): https://archive.org/details/trialanddeathofs00platiala
  (`trialanddeathofs00platiala_djvu.txt`)
- Church's own preface states the aim: the book "is intended principally for the large
  and increasing class of readers who wish to learn something of the masterpieces of
  Greek literature, and who cannot easily read them in Greek." It is a popular-audience
  translation by design, not a crib.
- Sample read (opening, the passage our modern-en truncates): "I cannot tell what
  impression my accusers have made upon you, Athenians: for my own part, I know that
  they nearly made me forget who I was, so plausible were they; and yet they have
  scarcely uttered one single word of truth… **My accusers, then I repeat, have said
  little or nothing that is true; but from me you shall hear the whole truth.**
  Certainly you will not hear an elaborate speech, Athenians, drest up, like theirs,
  with words and phrases."
- Assessment: plainer and more direct than Jowett (compare Jowett's inverted "How you,
  O Athenians, have been affected by my accusers, I cannot tell"), and it *keeps* the
  clauses our modern-en drops. Residual Victorian touches ("drest up", "so plausible
  were they"). Paragraph structure differs from ours — **alignment work required**.

**Candidate B — Harold North Fowler, *Plato I: Euthyphro, Apology, Crito, Phaedo,
Phaedrus* (Loeb Classical Library 36, Harvard/Heinemann, 1914).**
- Rights: **public domain.** US — published 1914. EU/Denmark — Fowler died 1955;
  life+70 expired 1 Jan 2026. Clear in both as of now.
- URL: https://archive.org/details/euthyphroapology0001plat ; also on Perseus
  (https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0170) — but note
  **Perseus applies CC BY-SA 3.0 US to its own digitisation**, a share-alike obligation
  on the Perseus text, not on the underlying PD translation. Source from the archive.org
  scan to avoid inheriting it.
- Sample read (Apology 17a): "How you, men of Athens, have been affected by my accusers,
  I do not know; but I, for my part, almost forgot my own identity, so persuasively did
  they talk…" (40c): "either it is virtually nothingness, so that the dead has no
  consciousness of anything, or it is, as people say, a change and migration of the soul
  from this to another place."
- Assessment: more literal than Jowett, but the register is 1914 academic and **not
  measurably more accessible**. Good as a fidelity cross-check when adjudicating a
  disputed Jowett period; not a reader-facing improvement. Rejected as the primary
  candidate on readability.

**Rejected:** W. H. D. Rouse's *Great Dialogues of Plato* (1956) — 20th century, in
copyright, not researched further.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 2 |
| first-read clarity | 25% | 5 |
| literary voice | 20% | 3 |
| restraint / no invention | 10% | 4 |
| naturalness | 5% | 5 |

**Weighted score: 3.3 — Band: Mixed**

Fidelity 2: confirmed substantive omissions in 5 of 6 sampled passages, plus one
cross-paragraph duplication. Clarity 5 and naturalness 5: as prose, this is the best-
reading edition in the batch. Voice 3: oaths and epithets dropped inconsistently, the
"judges" wordplay lost. Restraint 4: few outright inventions, but the duplicated
sentence and small unsourced glosses ("whether deserved or not").

## Recommendation

**RETRANSLATE** — confidence **high**. Correction scope: **substantial**.

A confirmed substantive omission rules out an unqualified keep, and here the omissions
are a *pattern*, not two bad paragraphs: a steady ~31% compression achieved partly by
amputating trailing clauses, found in the opening, the middle, the peroration, and the
counter-penalty alike. That is recurring and not local. The good news is that the
register and voice of this edition are the best in the batch — the retranslation brief
is "same voice, stop cutting", not "start over stylistically".

**Next action:** retranslate at a target word ratio of ~0.90–0.95 of Jowett rather than
0.69, with a per-paragraph completeness check (every source clause accounted for), and
fix the ch2 ¶1/¶2 duplication. Keep Church 1880 open alongside as a rights-clear human
control for what must survive.

## Limitations of this review

- 6 passages read as connected prose out of 92 paragraphs (~35% of the word count).
  Ch1 ¶4–13 (the Meletus indictment and the Chaerephon/oracle narrative), ¶18–27,
  ¶40–73 (including the Delium/Potidaea service and the "gadfly" passage), and ch2 ¶2–5
  were not read closely.
- I did not verify Church's Apology clause-by-clause against Jowett or the Greek; I read
  the opening and one technical passage.
- I have no Greek-side check anywhere in this review — all fidelity judgements are
  modern-en against original-en (Jowett), not against Plato.
- modern-da was not reviewed.
- Rights conclusions are date arithmetic, not legal advice.
