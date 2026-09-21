# Wealth of Nations — Batch B (Chapter 10) — Independent Adversarial Review

**Verdict: ACCEPT WITH FIXES REQUIRED (one minor proper-noun fix).**

This is an independent re-read, not a re-run of the drafter's own notes. The
prior agent's "0 defects found" self-report is *mostly* correct — this chapter
is unusually clean — but it missed one real, if minor, fidelity violation: an
unauthorized "correction" of a proper noun that no longer matches the locked
source text.

## What was verified

1. **`wn-batchB-corrected.json` vs `wn-batchB-current-modern-en.json`**: byte-
   identical (`diff` returns no output). Confirmed.
2. **Paragraph count**: both source and modern-en have exactly 119 array
   entries (1 title line + 118 body paragraphs), chapter number 10. Confirmed
   programmatically and by full manual read.
3. **Full paragraph-by-paragraph read**, source vs. modern-en, indices 0–118,
   no sampling — every paragraph was read in full, not spot-checked.
4. **Independent programmatic cross-checks** (not part of the drafter's
   method, run fresh for this review):
   - Proper-noun/capitalized-token diff per paragraph (regex `\b[A-Z]\w+\b`),
     comparing the token sets source vs. modern per paragraph. This flags any
     paragraph where a capitalized word (name, place, title) present in one
     side is missing from the other.
   - Numeral-token diff per paragraph (regex `\d[\d,]*`), comparing digit
     sequences that appear only in one side.
5. **Statute/date/figure spot-checks** requested in the task, re-verified
   directly against source text (not taken from the drafter's notes):
   - Mason/bricklayer vs. common-labourer wage ladder (4–5s→7–8s; 6s→9–10s;
     9–10s→15–18s) — matches.
   - Collier vs. coal-heaver wages (double/triple common labour; 6–10s/day;
     6s ≈ 4× common labour) — matches.
   - Sailor wage differentials (guinea–27s/month merchant service; wartime
     rise to 40s–£3/month; London labourer 9–10s/week ≈ 40–45s/month) —
     matches.
   - Apprentice-limit statutes: Sheffield (1 cutler apprentice), Norfolk/
     Norwich (2 weaver apprentices, £5/month forfeit to king), hatters (2
     apprentices, £5/month split king/informer) — matches.
   - Curate/mason wage-history passage: 5 merks/marks ≈ £10; master mason
     4d/day ≈ 1 shilling present; journeyman mason 3d/day ≈ 9d present;
     Statute of Labourers 25 Ed. III; Queen Anne c.12 stipend £20–£50; modern
     curate pay ~£40/year; London shoemakers £40/year — all match.
   - Isocrates fee economics: 4 minae = £13:6:8; 5 minae = £16:13:4; 10 minae
     = £33:6:8; 100 scholars; 1,000 minae = £3,335:6:8 (didactron per
     Plutarch) — matches, comma-grouping is the only formatting difference.
   - Settlement-certificate statutes: 43rd Elizabeth c.2; 13th/14th Charles
     II; 1st James II; 3rd William III; 8th/9th William III; 12th Queen Anne
     stat.1 c.18 — matches.
   - Closing-chapter statutes: 8th George III tailors' wage cap (2s 7½d/day);
     31st George II assize of bread; 3rd George III remedy — matches.
   - All direct quotations (Doctor Burn ×3, the Queen Anne Act text, the
     Isocrates quotations) are preserved **verbatim**, unmodernized, as they
     should be for quoted primary-source material — correct handling.

No dropped clauses, no invented content, no negation/conditional inversions,
no compressed or summarized passages, and no numerical distortions were found
anywhere in the 119 paragraphs. All of the apparent numeral-token diffs from
the programmatic scan (paragraphs 64, 89, 94, 102, 103, 104, 105, 111, 117,
118) trace to legitimate spelled-out-vs-numeral modernization of regnal-year
statute citations (e.g. "5th of Elizabeth" → "fifth year of Elizabeth," "8th
of George III" → "eighth year of George III"), not to value changes — I
independently re-verified each of these by reading the surrounding sentence
in both files rather than trusting the drafter's characterization of them.

## Defect found

**Paragraph 99 (source array index 94, the Isocrates/eminent-teachers
paragraph): "Georgias" (source) silently changed to "Gorgias" (modern-en).**

- Source: *"Georgias made a present to the temple of Delphi of his own statue
  in solid gold."*
- Modern-en: *"Gorgias made a present to the temple of Delphi of a statue of
  himself in solid gold."*

`Georgias` appears nowhere else in either file — this is a one-off spelling
change to a proper name. It was caught independently by the programmatic
proper-noun diff (the only paragraph in the whole chapter where a capitalized
token is swapped for a different capitalized token rather than merely
dropped/added by rewording) and confirmed by direct reading.

This is very likely the drafter "silently correcting" what they took to be an
OCR or spelling slip in the source (the historical sophist's name is indeed
conventionally spelled "Gorgias" in English), but under this project's
fidelity rules the modern-en edition must track the locked source text
exactly, not a corrected version of it. Whatever the source says — right or
wrong — is what modern-en must preserve, or any deviation needs to be an
explicit, logged editorial decision, not a silent substitution. It is a real,
if very minor, defect, and it is exactly the kind of small proper-noun drift
a "0 defects found" self-report is supposed to catch and didn't.

## Recommendation

Do not treat this as a "do not accept" chapter — everything else is genuinely
clean across a full, non-sampled read plus two independent automated checks.
Fix is trivial: change "Gorgias" back to "Georgias" in
`wn-batchB-current-modern-en.json` (and `wn-batchB-corrected.json`, which is
currently identical to it) to match the locked source, or, if Anders wants
the historically correct spelling used instead, log that as an explicit
editorial decision rather than leaving it as an unflagged silent change.
