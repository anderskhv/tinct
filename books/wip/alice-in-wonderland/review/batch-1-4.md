# Chapters 1–4 review

Original 12-chapter baseline remains pinned as recorded in SOURCE.md. Review excerpts are named and scoped explicitly; they are not full editions. The candidate modern edition currently contains only these four completed chapters, with no placeholders.

Existing unmodified command:

```sh
python3 books/classify-modern-en.py "$PWD/books/wip/alice-in-wonderland/review/batch-1-4/alice-in-wonderland" --gate --chapters 1-4 --per-chapter
```

Exit code 0; complete output in `gate-1-4.txt`. The tool supports this because an absolute edition stem overrides its default directory through ordinary Path joining. Its algorithms, thresholds and alignment checks are unchanged. The literal bare-id invocation was also attempted and exited 1 with a missing live-app edition path; that is not the candidate result.

24 / 26 / 48 / 42 paragraphs respectively. JSON and every paragraph length checked, minimum ratio 75%. Every paragraph was rendered against its numbered original; first and last paragraph continuity checked. No API generation.

Spot-read notes:
- Chapter 1: narrator asides, Antipathies mistake, Latitude/Longitude ignorance, Dinah/cats/bats sequence, poison understatement and two-person croquet all retained.
- Chapter 2: wrong multiplication/geography, Ada/Mabel distinction, both crocodile stanzas, Latin case sequence, French accents and seaside bathing machines retained.
- Chapter 3: historical quotation remains verbatim; dry/dry and tale/tail/not/knot misunderstandings retained; Mouse’s poem remains complete; comfits receive a brief explanatory apposition.
- Chapter 4: Mary Ann is a mistaken identity, not Alice’s real name; Pat’s dialect and arrum remain; Bill’s launch and the puppy sequence retained in order. Source’s unusual “Shy” reading is deliberately preserved, not silently corrected. Glass cucumber-frame clarified without changing its role.

No independent accessibility reviewer has yet checked this candidate. Passing similarity is not semantic acceptance. The whole book remains NOT READY.
