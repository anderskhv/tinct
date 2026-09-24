# R1 — Re-review of the pilot mapped into the final structure (P-ch5, P-ch6)

Reviewer: independent (Danish → English). Scope: the passages NOTES-P.md lists
for re-review only (joins, the two moved notes, the p. 223 correction). I
checked them against `source/original-da-final.json` ch. 5–6 and the v2 slot
boundaries in `source/original-da-v2.json`. I did not consult any other English
translation.

## Summary

- **Scripted comparison: PASS.** Every final paragraph equals the
  pilot paragraphs listed in its `fromPilot`, joined with a single space. The
  only other changes are: the `*` removed at two places (P-I 28, P-II 18), and
  the Lessing note's "p. 293" changed to "p. 223". Nothing else differs.
  The pilot paragraphs are all used exactly once and in order (ch5: 0–31 → 29
  paragraphs; ch6: 0–28 → 22 paragraphs). The titles are identical. No
  `sectionHeading` or `dividerBefore` is set. No `*` remains in any paragraph.
- **Joins:** all 8 are complete and faithful. No clause is duplicated, missing
  or out of order at any join. The old mid-sentence slot boundaries (e.g.
  "Tilnavn / Cunetator", "ene om / Alt", "ny / Inderlighed", "Troen er et /
  Vidunder") each appear exactly once in the English. **6 PASS, 2 FIX
  (minor).** In both FIXes, a repair that was needed at the old slot edge now
  reads a little heavy inside a single paragraph:
  - P-I 24: "sins against these images" → "sins against them"
  - P-II 15: "There was a Roman general … He stopped …" → one subject, as in
    the Danish
  
  Two optional smoothings are offered (P-I 20, P-II 10). They are not defects.
- **Notes n5.31a and n6.24a: PASS.** Both are faithful to the Danish. The page
  reference is now p. 223, which matches the corrected source and the scan
  (SCAN-VERIFICATION F2). The anchors correspond to the Danish marker
  positions.
  - One minor point is outside the brief: in the German quotation, the source
    has "Witz einer Bäuerin**:** aber", but the English note has
    "Bäuerin**;** aber". See the note on n5.31a below.

## 1. Joins

### P-I 20 (pilot 20 + 21) — PASS (optional smoothing)

The Danish has one sentence across the old boundary ("…hører et Svar i /
Retning af Paradoxet, da lyder det gjerne saaledes: det bedømmer man efter
Udfaldet."). The English renders it as two sentences:

> Now and then in our time one does hear an answer that points in the direction of the paradox. When one does, it usually runs like this: "It must be judged by the outcome."

This is complete and faithful: "leilighedsviis" = "now and then", and "i
Retning af" = "points in the direction of". Every clause appears once, and it
reads naturally inside the paragraph. The rest of the paragraph checks out
too: the skandalon gloss, "the lecturers" (Docenterne, per the style guide),
erectioris ingenii, and the closing sentences.

*Optional.* Now that no break intervenes, the two sentences can become one.
This follows the Danish "Forsaavidt …, da …" more closely and drops the echo
"one does … When one does":

> When, now and then in our time, one does hear an answer that points in the direction of the paradox, it usually runs like this: "It must be judged by the outcome."

### P-I 24 (pilot 25 + 26) — FIX (minor)

The old boundary is "…har faaet disse / Billeder frem". The Danish reads:

> thi den, der engang har faaet disse Billeder frem, han kan ikke blive af med dem igjen, og synder han mod dem, da hævne de sig …

The English reads:

> For whoever has once called up these images cannot get rid of them again. And if he sins against these images, they take revenge terribly …

Every clause is present once and in order. The repeated noun "these images",
however, was a slot-opening repair. The Danish has only "dem", and inside one
paragraph the repetition is heavy right after "get rid of them".

**Proposed:**

> For whoever has once called up these images cannot get rid of them again. And if he sins against them, they take revenge terribly, with a silent wrath more terrible than the loud clamor of ten ravening reviewers.

Everything else in the paragraph checks out against the Danish: Mary,
"nøden/angsten/paradoxet", the angel, "hun er ingenlunde … hun er ingenlunde",
and "bleve det ved disse".

### P-I 28 (pilot 30 + 31) — PASS

The old boundary fell in mid-sentence: "Troen er et / Vidunder". The English
has "…no one can advise, no one can understand. Faith is a miracle, and yet no
human being is excluded from it; for what unites all human life is passion,
and faith is a passion." The paragraph is complete, has no duplication and
reads well as one paragraph. The anchor for n5.31a is intact (see §2).

### P-II 2 (pilot 2 + 3) — PASS

The old boundary fell in mid-sentence: "men en ny / Inderlighed. Dette maa ikke
oversees." The English has "…but is a new inwardness. This point must not be
missed." "Inwardness" appears once, and the sentence is whole. The rest of the
paragraph (the philosophy/"the immediate" passage, nec opinate, Socrates,
infinite resignation, "only then…") is complete and in order.

### P-II 10 (pilot 11 + 12 + 13 + 14) — PASS (optional smoothing)

There are two old boundaries.

**(a) "ønske at opdage og / deri see en Sikkerhed for …".** The English
reorders this into two sentences:

> Had he any notion of what love is, he would hope to find that as a daughter and as a sister she loved perfectly. In that he would see a guarantee that his wife would love him as no one else in the kingdom does.

This is faithful: "hvis han opdagede, at…" is absorbed into "hope to find
that", and every element appears once. It reads correctly.

*Optional.* To mirror the single Danish sentence ("ønske at opdage og deri
see…"), write:

> Had he any notion of what love is, he would hope to find that as a daughter and as a sister she loved perfectly, and would see in that a guarantee that his wife would love him as no one else in the kingdom does.

**(b) The Danish dash-split "Hvad man da … / paa Egoisme og Dumhed, det skal
man …".** The source is now one sentence inside the paragraph:

> So: what one would regard in a human being as a sign of egoism and stupidity — that, with the help of an exegete, one is supposed to regard as a worthy conception of the deity.

Read as one sentence, this works. The dash plus the resumptive "that"
reproduce the Danish left-dislocation "Hvad …, det skal man …" with its
emphasis. "So:" renders the inferential "da". Nothing is duplicated or
missing. I would keep it. If the colon after "So" is felt to be a slot
artifact, the smallest change is to drop the colon and the dash in favor of:

> So what one would regard in a human being as a sign of egoism and stupidity is the very thing that, with the help of an exegete, one is supposed to regard as a worthy conception of the deity.

Simply deleting the colon ("So what one would …") risks a momentary misreading
as "So what?", so I do not recommend it.

### P-II 12 (pilot 16 + 17) — PASS

The old boundary fell in mid-clause: "og saa snart den / Enkelte er kommen ind
i Paradoxet". The English is:

> For as long as the single individual can get into the Church by a simple mediation, the idea of the Church is not qualitatively distinct from that of the state. And as soon as the single individual has entered the paradox, the idea of the Church is out of his reach; he cannot leave the paradox, and in it he must find either his blessedness or his perdition.

Both "saasnart" clauses appear once, and in the right logical relation. The
Danish chains them with ", og"; the English makes two sentences, with "And" as
the link. This reads correctly as one paragraph. The gloss on "Such an
ecclesiastical hero" and the closing sentence are complete.

### P-II 15 (pilot 20 + 21) — FIX (minor)

The old boundary fell in the middle of the subject: "berømt ved sit Tilnavn /
Cunetator, han standsede Fjenden". The Danish is one sentence:

> Hiin romerske Feltherre, der er berømt ved sit Tilnavn Cunetator, han standsede Fjenden ved sin Nølen — men hvad er dog Abraham ikke for en Nøler i Sammenligning med ham — men han frelser ikke Staten.

The English is:

> There was a Roman general famous by the surname Cunctator, "the Delayer." He stopped the enemy by delaying — but what a delayer Abraham is compared with him! Yet Abraham does not save the state.

Every clause is present once. The final "han" is correctly read as Abraham.
The "There was … He stopped…" frame, however, was a repair that let the slot
end in a whole sentence. Inside one paragraph it loses the deictic "Hiin" (that
famous general) and splits the subject from its verb for no reason. "Famous by
the surname" is also slightly off; "berømt ved" = famous *for*.

**Proposed** (smallest faithful change):

> That Roman general who is famous for his surname Cunctator, "the Delayer," stopped the enemy by delaying — but what a delayer Abraham is compared with him! Yet Abraham does not save the state.

The source prints "Cunetator", but the English correctly gives "Cunctator".
The rest of the paragraph is complete: the seventy years, Sarah/Hagar, the
vowel/"Hvilebogstav" image, 130 years, the contemporaries' speech and publici
juris.

### P-II 18 (pilot 24 + 25) — PASS

The old boundary fell in mid-sentence: "Troens Ridder er ene om / Alt." The
English has "…but the knight of faith is alone in everything. The tragic hero
does it and finds rest in the universal; the knight of faith is kept in
constant tension." "Everything" appears once, and the join reads naturally,
as NOTES-P.md says. The paragraph is complete through "benefits the universal
in no way". The n6.24a anchor is intact.

## 2. Footnotes

### n5.31a (Lessing), P-I 28 — PASS (one minor transcription point)

- **Translation.** The English is faithful to the Danish note sentence by
  sentence:
  - "har etsteds yttret" → "has somewhere said"
  - "reent æsthetisk" → "purely aesthetic"
  - Edvard den Anden → Edward II
  - "efter Diderot" → "following Diderot"
  - "Nu vedbliver han" → "He then continues"
  
  The German is kept, with a bracketed English rendering. That rendering is
  accurate.
- **Page reference.** "Cf. Sämtliche Werke, vol. 30, p. 223." This matches the
  source "Cfr. Sämtliche W. 30 B. p. 223" and scan p. 76
  (SCAN-VERIFICATION F2). The fix is applied correctly. The scan's "Sämtliche."
  with a full stop has no effect on the expanded English citation.
- **Anchor.** The English anchor is "what unites all human life is passion,".
  This corresponds to the Danish `anchorAfter` "alt Menneskeliv enes, er i
  Lidenskab,". The print has "Lidenskab*),", with the marker before the comma.
  The English anchor includes the comma, which matches the source's
  `anchorAfter` convention. The anchor occurs exactly once in P-I 28, and it
  ends exactly where the pilot's `*` stood.
- **Minor, outside the listed changes.** In the quoted German, the corrected
  source reads "Witz einer Bäuerin**:** aber", but the English note (inherited
  from the pilot) has "Bäuerin**;** aber". The German should be transcribed as
  the source prints it. Please confirm this on scan p. 76. If the colon
  stands, change the ";" to ":" in the German only. The bracketed English may
  keep its semicolon.

### n6.24a (wish/duty), P-II 18 — PASS

- **Translation.** The English is faithful and complete, from "Forskjellen
  mellem Collisionen …" to "… men ikke en absolut Pligt". The Agamemnon quote,
  "Det Lykkelige i Livet er, at det falder sammen", "der fordres, at han skal
  opgive begge Dele" and the final sentence are all rendered correctly. The
  note text is identical to the pilot's once the leading "* " is removed.
- **Anchor.** The English anchor is "truly loves Isaac with all his soul.".
  This corresponds to the Danish "elsker Isaak af sin ganske Sjæl." The print
  has "Sjæl*).". The anchor occurs once and ends exactly where the pilot's `*`
  stood.

## 3. Scripted comparison (method)

For each final paragraph `s`, I checked the following:

- `s.text == " ".join(pilot.paragraphs[i] for i in s.fromPilot)`, either
  exactly or after removing `*`.
- Each note's text equals the pilot's note with the leading "* " removed.
- The concatenated `fromPilot` lists equal `range(len(pilot.paragraphs))`.

**Results:**

- **ch5.** 28/29 paragraphs are exact. P-I 28 differs only by the `*`. The note
  differs by a single character ("9" → "2", in 293 → 223).
- **ch6.** 21/22 paragraphs are exact. P-II 18 differs only by the `*`. The
  note is identical.
- **Joins.** The joined slots are exactly the ones in NOTES-P.md §1: ch5
  (20:[20,21], 24:[25,26], 28:[30,31]); ch6 (2:[2,3], 10:[11–14], 12:[16,17],
  15:[20,21], 18:[24,25]).
