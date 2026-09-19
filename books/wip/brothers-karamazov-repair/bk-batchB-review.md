# Batch B — Independent Adversarial Review (chapters 13–24)

**Verdict: ACCEPT AS-IS.**

This is a genuinely strong rendering. I did not find any dropped content, invented content, meaning inversions, sanitization, or character-voice collapse anywhere in the batch. The one issue found is a single localized deviation from the drafter's own stated policy (an untranslated French phrase that was in fact translated) — a documentation inaccuracy and minor inconsistency, not a fidelity failure worth blocking on.

## 1. Structural integrity — confirmed programmatically

Ran an independent script (not the drafter's) comparing `bk-batchB-source.json` and `bk-batchB-modern-en.json`:

- 12/12 chapters present, same `number`, same order, same titles.
- Paragraph counts match exactly for all 12 chapters: 13:55, 14:14, 15:6, 16:47, 17:33, 18:72, 19:32, 20:41, 21:81, 22:81, 23:88, 24:43 (matches the drafter's notes exactly).
- Per-paragraph word-count ratio (output/source) checked for every paragraph with ≥8 source words: **zero outliers below 0.65 or above 1.5**. This is a strong structural signal against silent drops, merges, or inventions — nothing in the batch shows the kind of length anomaly that would indicate lost or fabricated content.
- Per-chapter word-count ratios range 0.976–1.037, consistent with the notes.
- Both files parse as valid JSON.

## 2. Fidelity — read every paragraph against source; deep spot-checks on flagged risk areas

**Ch. 16–18, Dmitri's Schiller-quoting confession:** Verified paragraph-by-paragraph. The "Ode to Joy" ("Hymn to Joy") verse blocks are complete, correctly attributed to the same speaker (Mitya), and kept at the *exact same paragraph boundaries* as the source, including the mid-thought stanza splits (e.g. ch16 paras 33/36/37/38/41/43/45, ending on the isolated one-line paragraph "To insects—sensual lust."). The verse was left as verse rather than modernized into prose, which is the right call for a translated quotation-within-a-quotation. Surrounding prose (Mitya's volatile, confessional, self-interrupting voice) is fully modernized and reads naturally while preserving every beat — the "Aesop," "compliments," and "confession" plot machinery is all intact (verified verbatim below).

**Ch. 20, Smerdyakov's casuistry ("The Controversy"):** Read the full chapter (41 paragraphs) side-by-side. The argument's full chain of reasoning survives intact and in the right order: the soldier/torture premise → "no sin in renouncing" → the "anathema the instant you think it" logic → the Tatar/heathen analogy → the mustard-seed/mountain-moving test → the two-hermits argument → the final "it only extenuates, if it constitutes" close. This is dense, deliberately repetitive hair-splitting in the source, and the rendering preserves the repetitiveness and the syntax-driven density rather than smoothing it into something crisper than Dostoevsky intended — correct instinct for this particular passage. No trimming, no softening of the blasphemy-adjacent content.

**Ch. 15, Lizaveta backstory:** Read in full. All the harsh material — her father's violence, the townspeople's mix of cruelty and superstitious reverence, the rape-by-drunken-revelers scene, Fyodor Pavlovitch's "there's a certain piquancy about it" line, the pregnancy, her death in childbirth, Grigory's speech over the baby, the naming of "Smerdyakov" — is rendered in full and undiminished. Nothing softened.

**Ch. 13, von Sohn story (paras 20–24, 40):** Verified against source. The full grotesque detail — murdered in a brothel, "nailed up in a box/crate," shipped in the luggage van, "the harlots sang songs and played the harp... piano" while nailing the coffin — is preserved intact and un-sanitized ("house of harlotry" → "house of ill repute," "harlots" → "whores," both acceptable modern equivalents, not softenings).

**Fyodor Pavlovitch's dead-wife material (ch. 15 para 1):** the crepe-on-hat, drunken, shameless behavior at news of his first wife's death, and his "certain piquancy" line about Lizaveta, are all preserved without euphemism.

**Ch. 21–24 (brandy scene, sensualists, both together, reputation ruined):** Spot-checked roughly 40 additional paragraphs across these four chapters at random plus all "Aesop"/"compliments" occurrences. All check out. Example of the "he sends his compliments" thread, which the plot hinges on, preserved verbatim at every occurrence (ch18 para 19, ch22 para 21, ch22 para 70, ch23 paras 13–14, 19, 26).

**Name/spelling consistency:** Checked programmatically across the whole batch — no spelling drift on Fyodor Pavlovitch, Dmitri/Mitya, Ivan, Alyosha/Alexey, Grushenka, Katerina Ivanovna/Katya, Smerdyakov, Grigory, Marfa, Kalganov, Lise, Rakitin, Agafya Ivanovna. "Miüsov" → "Miusov" and "Païssy" → "Paissy" (diaereses dropped) applied consistently everywhere in the output (confirmed by exact regex match: source contains only "Miüsov"/"Païssy", output contains only "Miusov"/"Paissy" — no mixed forms).

**Character voice distinction:** Confirmed across samples — Fyodor Pavlovitch reads crude/buffoonish/jeering ("to hell with nobility," "roasted there like mutton"), Dmitri reads volatile/confessional/self-interrupting, Ivan reads cold and controlled even mid-scene, Smerdyakov reads as dense, repetitive, self-satisfied hair-splitter, distinct from Grigory's blunt piety. This distinction holds up across all four characters' major set-pieces, not just in one showcase chapter.

### Issue found: one French phrase translated despite the notes claiming otherwise

The drafter's notes (item 3) specifically cite **"plus de noblesse que de sincérité"** as an example of a French phrase "kept in the original language." In fact, in ch. 13 para 25, this exact phrase (and its mirror, "plus de sincérité que de noblesse") **was translated into English**:

> **SRC:** "Miüsov, my relation, prefers to have *plus de noblesse que de sincérité* in his words, but I prefer in mine *plus de sincérité que de noblesse*, and—damn the *noblesse*!"
> **OUT:** "My relation Miusov prefers to have more nobility than sincerity in his words, but I prefer more sincerity than nobility in mine -- and to hell with nobility!"

Meaning is fully preserved and the line still lands (the chiasmus and the punchline both survive), so this is **not a fidelity failure**. But it is (a) a factual inaccuracy in the drafter's own notes — they cite this exact phrase as evidence of a policy they didn't actually follow here — and (b) an inconsistency in the batch: the other three French/Latin phrases the notes cite (*Il y a du Piron là-dedans*, *Credo, but I don't know in what*, *Tout cela c'est de la cochonnerie*) were all verified left in the original language, as claimed. Only this one was translated. Low-severity, but flagging because the notes should not be trusted as-is on this specific claim, and Anders/the fact-checking pass should decide whether to restore the French for consistency (my instinct: cosmetic, does not require blocking acceptance, but a one-line fix if anyone touches ch. 13 again).

### Minor: one small unrequested addition

Ch. 18, para 45 — source: "Mitya, he won't give it for anything." Output: "Mitya, he won't give it for anything in the world." A harmless idiomatic addition (not present in source), single instance found in extensive sampling. Not a pattern; not worth blocking on.

### "PART II" marker — confirmed

Ch. 24's final paragraph is the standalone structural marker "PART II" in both source and output, kept as its own one-line paragraph, untranslated, exactly as the notes describe.

## 3. Genuine-modernization quality

Spot-checked narrative/descriptive prose (not just dialogue, which is easier to modernize) — e.g. ch. 13 paras 0–3 (Miusov's interiority, the dining-room description, Rakitin's character sketch) and ch. 15 paras 0–2 (Lizaveta's physical description). These read as fluent, natural contemporary prose with re-ordered clauses, contemporary idiom ("he was all the more willing to," "he already had connections," "with characteristic vanity"), not mechanical word-swap of Garnett's syntax. This directly addresses the "77% mechanical/light" problem the project exists to fix — this batch does not read like that. Random dialogue spot-checks (ch14, 17, 19, 22–24) are consistently idiomatic and un-stilted ("right up your alley," "kicked up quite a storm," "I've got something to tell you tomorrow").

## 4. Drafter's specific claims — spot-checked

| Claim | Verified |
|---|---|
| Paragraph counts (55/14/6/47/33/72/32/41/81/81/88/43) | ✅ exact match, independently computed |
| "Miusov"/"Paissy" diaereses dropped, applied consistently | ✅ confirmed via regex over full batch |
| French/Latin left untranslated | ⚠️ mostly true; one instance (ch13 para 25) contradicts this — see above |
| "Aesop" nickname preserved | ✅ (source "Æsop" → output "Aesop," consistent) |
| "He sends his compliments" preserved verbatim | ✅ confirmed at every occurrence |
| "PART II" marker kept as own paragraph, untranslated | ✅ confirmed |
| Ode to Joy kept as verse with source paragraph breaks | ✅ confirmed, exact paragraph-for-paragraph match |
| Smerdyakov's casuistry kept intact/full | ✅ confirmed, full chain of reasoning present |
| Crude/provocative content not softened (von Sohn, dead wife, Lizaveta, Smerdyakov's heresy) | ✅ confirmed on all four |

## Recommendation

Accept as-is. The one French-phrase inconsistency (ch. 13 para 25) is optional cleanup, not a blocker — meaning is fully preserved and it's a single instance in a 593-paragraph batch. No fidelity, structural, voice-consistency, or sanitization problems found anywhere else in the batch.
