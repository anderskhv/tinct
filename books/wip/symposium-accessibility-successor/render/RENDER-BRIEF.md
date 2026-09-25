# Symposium — accessibility successor: renderer brief

You are rendering a **Tinct Modern English** repair for the paragraphs of Plato's *Symposium* that an independent assessor marked `REPAIR`. The baseline is Benjamin Jowett's 1871 translation, as served in the corrected `original-en` (`3521a12d…`). The paragraphs you repair replace the corresponding paragraphs of the accepted `modern-en` (`1e970b7b…`).

## Which paragraphs you may change

- **`REPAIR` only.** Rewrite each REPAIR paragraph in full.
- **`KEEP`:** produce no output. These stay byte-identical.
- **`PROTECTED`:** never produce output. This covers the restored opening 1.0–1.8 and the corrected 3.3, 3.7 and 3.8, which were accepted in the completeness repair. If you see a real defect in one, mention it in your final message only.

## The target

Clear present-day English that a curious 16-year-old, or an adult listening to it read aloud, can follow without footnotes, and that remains Plato in Jowett's reading.

1. **Complete and faithful to Jowett.** Keep:
   - every claim, example, name, quotation, qualification, hedge, joke and step of argument;
   - their order;
   - the dialogue framing ("said Aristodemus", "he replied", "she said").

   Do not summarize, condense, moralize, add arguments, or import readings from other translations or the Greek. Jowett's text is the baseline. His bracketed editorial notes are omitted in modern-en, as before.
2. **Sentence by sentence.** Break up Victorian periodic sentences, undo inversions and stacked relative clauses, and replace archaic wording (fain, herein, adduce, flexile, verily, "of a truth", "say rather", "I dare say" where it no longer means what it meant). A light spelling or punctuation pass is **not** a repair. Paragraph N must begin with content equivalent to Jowett's first sentence of paragraph N. Keep one output paragraph for each input paragraph. Length is normally 85–125% of Jowett's word count, and never below 75% unless Jowett is genuinely redundant (explain why in `notes`).
3. **Historical senses and references.** Where a word's meaning has shifted, or a reference is opaque, fold a few clarifying words into the sentence. Examples:
   - "vulgar" meaning common or popular (Pandemus);
   - Urania as the heavenly Aphrodite;
   - the lover (the older man who courts) and the beloved (the younger man courted);
   - a named myth, poet or place the argument depends on.

   Do not use brackets or footnotes. Keep proper names as Jowett has them. "Love" remains the name of the god, as in the kept paragraphs.
4. **Arguments must be followable.** Make the logical connectives explicit where Jowett's "for", "then", "wherefore" or "but" hide the step. This applies especially to Eryximachus on harmony and medicine, Agathon's claims, Socrates' questioning of Agathon, and Diotima's ladder. Keep each speaker's actual reasoning, including its weak or playful steps; do not improve the argument.
5. **Voice.** Each speaker keeps his register:
   - Phaedrus: earnest;
   - Pausanias: lawyerly;
   - Eryximachus: pompous and technical;
   - Aristophanes: comic and fantastical;
   - Agathon: deliberately showy, balanced and rhyming rhetoric. Keep it recognizably ornate in modern words;
   - Socrates: ironic;
   - Diotima: oracular;
   - Alcibiades: drunk, candid and funny.

   The frank discussion of male love and desire stays frank and accurate, neither euphemized nor sensationalized.
6. **Conventions.** Match the kept paragraphs around you:
   - straight quotation marks, with single quotes `'...'` for speech. In chapter 7, where the neighbouring paragraphs use straight double quotes for the Socrates–Agathon and Diotima exchanges, match the neighbours;
   - American spelling ("honor");
   - spaced em dash ` — `;
   - no ellipses (`...` or `…`); the quality gate treats them as truncation;
   - no double spaces.

## Output

Write JSON to `/tmp/claude-0/-home-user-tinct/781378ba-275b-5897-8531-920676c586a7/scratchpad/out/symp-render-<ID>.json`:

```json
{"renderer": "<ID>", "paragraphs": [
  {"id": "2.4", "modern": "<the full new paragraph>", "notes": "optional: choices worth a reviewer's eye"}
]}
```

Include exactly one entry for **every** REPAIR paragraph in your packet, and nothing else.

## Before finishing

1. Validate the JSON (`python3 -m json.tool`).
2. For each paragraph, compare your word count with Jowett's.
3. Check that every proper name and quotation in Jowett's paragraph appears in yours.
4. Re-read your output once against Jowett, fixing omissions, inventions and misreadings.

Your final message should list any paragraph below 80% of Jowett's length with the reason, and any passage you are unsure about.
