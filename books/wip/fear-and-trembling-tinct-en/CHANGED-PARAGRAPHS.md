# Changed paragraphs: Fear and Trembling replacement package

**Every paragraph of `modern-en` is new.** The edition is a fresh translation from the Danish, not a repair of the served text. The paragraph structure also changes from 232 served slots to the 184 printed paragraphs (`STRUCTURE-MAP.md`). So this record lists, for every final paragraph, the served slots it replaces and any restoration or footnote it carries. Hashes (first 16 hex characters of sha256) are in `accepted-paragraph-hashes.tsv`.

## A. Restored omissions (text absent from every served edition)

| Final ¶ | Restored | Served location | Evidence |
|---|---|---|---|
| 2.7 | Attunement: the weaning passage after variation II ("When the child has grown big and it is time to wean it …"), 29 Danish words | lost from served slot 2.6 | raw 475-478, scans (`source/CORRECTIONS.md` §2, `SCAN-VERIFICATION.md`) |
| 2.10 | Attunement: the weaning passage after variation III ("When it is time to wean the child, the mother is not without sorrow either …"), 61 Danish words | lost from served slot 2.8 | raw 508-513, scans |
| 6.6 | Problema II: the final word *fatte* ("comprehend"), lost at a page break. The served original-en misplaced it at the start of the next slot | served 6.7/6.8 | raw 3165 |
| 7.18 | P-III: the conjectural *i* in "en Havmand i Nærheden" (the sentence needs it; medium-high confidence) | served 7.27 | raw 4337/4377 |
| 2.3, 2.6, 2.8, 2.11 | the section numerals I.–IV. of the Attunement (structural fields, `candidate/structure.json`) | dropped in served | raw 390, 455, 484, 516 |

## B. Footnotes (18): served status and new placement

Every note is now a separate record in `candidate/footnotes.json`, with its exact anchor. The main text carries no markers. Five notes were missing entirely from the served editions and two were partly missing. Five had been spliced into the running text and eight stood as body paragraphs.

| Note | Final ¶ | English anchor (marker goes after) | Served status |
|---|---|---|---|
| n4.2a | 4.2 | “things in the world do not go as the pastor preaches.” | spliced into slot 4 |
| n4.21a | 4.17 | “impossible for it to be translated out of ideality into reality.” | spliced into slot 21 ("…thi dette Øie- +) Det følger …") |
| n4.22a | 4.17 | “everything depends on the movement taking place in the proper way.” | last 6 words (tail "ein seliger Sprung in die Ewigkeit.") spliced at end of slot 22; first 147 words missing |
| n5.31a | 5.28 | “what unites all human life is passion,” | missing (Lessing note) |
| n6.24a | 6.18 | “truly loves Isaac with all his soul.” | missing (wish/duty note) |
| n7.15a | 7.13 | “in their anxiety they may discover one thing or another.” | own slot 16 |
| n7.15b | 7.14 | “he will not have the wedding. I need no more.” | spliced into slot 17 (start of slot, plus "røver. Dette er … Tempelrøver." in the middle of "behjælpelig \ |
| n7.19a | 7.15 | “in the same style as Axel and Valborg.” | own slots 20 and 23 (note continues on the next page) |
| n7.27a | 7.18 | “I have allowed myself a small change” | own slot 28 |
| n7.33a | 7.22 | “where the grandeur lies.” | spliced into slot 34 (at the start, and "…Et lyk-" / "keligt Ægteskab! … Pecus." later) |
| n7.34a | 7.23 | “anywhere in what has gone before.” | own slot 36 |
| n7.37a | 7.25 | “discover with anxiety and horror” | own slot 38 |
| n7.47a | 7.31 | “Faust is a doubter” | first part (322 words, ironist/Aristophanes) missing; continuation (108 words, "Tilværelsen. Jeg fordrer …") in own slot 50 |
| n7.67a | 7.46 | “Wer sprach von Liebe.” | missing ("Cfr. 2. Akt 1. Scene.") |
| n7.77a | 7.54 | “to hold him up with pathos.” | own slot 79 |
| n7.81a | 7.56 | “precisely in the silence: Abraham cannot speak.” | own slot 83 |
| n8.5a | 8.3 | “one cannot go through the same river twice.” | missing (Greek Cratylus quotation) |
| n8.5b | 8.3 | “one cannot even do it once.” | missing (Tennemann reference, not in caller's list) |

## C. Every final paragraph

| Final ¶ | Replaces served slot(s) | Relation | Notes | modern-en hash |
|---|---|---|---|---|
| 1.0 | 1.0, 1.1 | joined |  | da494dce7a3b0a32 |
| 1.1 | 1.2 | identical-extent |  | 677d5f8fc4b53aaf |
| 1.2 | 1.3 | identical-extent |  | d6b59d3d9f2f97cb |
| 1.3 | 1.4 | identical-extent |  | f103678a199d2f7a |
| 2.0 | 2.0 | identical-extent |  | 372713c9a640656c |
| 2.1 | 2.1 | identical-extent |  | f34caa9784e9b31f |
| 2.2 | 2.2 | identical-extent |  | 64edb57e48a657c9 |
| 2.3 | 2.3 | identical-extent |  | 568cbd15c2ff113a |
| 2.4 | 2.4 | identical-extent |  | c7ffb09cbe6781d8 |
| 2.5 | 2.5 | identical-extent |  | 95a8d2664984f8fc |
| 2.6 | 2.6 | split |  | 0d0f875a2eb43c28 |
| 2.7 | 2.6 | split + restored passage |  | 86d3fe3fdd315a5b |
| 2.8 | 2.7 | identical-extent |  | 4499884cbe116de7 |
| 2.9 | 2.8 | split |  | b8695c469e52422a |
| 2.10 | 2.8 | split + restored passage |  | ba64e97835c5e39f |
| 2.11 | 2.9 | identical-extent |  | 5d15efa3e4f3f1ff |
| 2.12 | 2.10 | identical-extent |  | 14404f91ac62c987 |
| 2.13 | 2.11 | identical-extent |  | a5de99dd9db57328 |
| 2.14 | 2.12 | identical-extent |  | 96c9d95232a6eb9e |
| 3.0 | 3.0 | identical-extent |  | 91bd3471053570da |
| 3.1 | 3.1, 3.2 | joined |  | 38f5fd483122dd83 |
| 3.2 | 3.3 | split |  | 1b7af96c9bbaa3ae |
| 3.3 | 3.3 | split |  | aabc678d0121e209 |
| 3.4 | 3.4 | identical-extent |  | 332d492d75bb0776 |
| 3.5 | 3.5 | identical-extent |  | 89860ecd162f4591 |
| 3.6 | 3.6, 3.7 | joined |  | 4684fe5c0b45946c |
| 3.7 | 3.8 | identical-extent |  | ee0b7c1d69bed1e6 |
| 3.8 | 3.9 | identical-extent |  | 66abb1c869587767 |
| 3.9 | 3.10 | identical-extent |  | 7673636fd3f3164b |
| 3.10 | 3.11, 3.12 | joined |  | 3cc899aed85fbcbc |
| 3.11 | 3.13 | identical-extent |  | db555759aafe0e7f |
| 3.12 | 3.14 | identical-extent |  | f8b12e1ea0d861f5 |
| 3.13 | 3.15, 3.16 | joined |  | f3cca8125bdd8ba1 |
| 4.0 | 4.0 | identical-extent |  | ce6ff660d5c5cbde |
| 4.1 | 4.1 | identical-extent |  | 901b1c6d7e379515 |
| 4.2 | 4.2 | identical-extent | n4.2a | 1644abc3fb32b772 |
| 4.3 | 4.3 | identical-extent |  | c1ffbeb1e379843c |
| 4.4 | 4.4, 4.5 | joined |  | 82e28d4b87491da0 |
| 4.5 | 4.6 | identical-extent |  | 31a1e439a62a81b2 |
| 4.6 | 4.7 | split |  | b563c45e93bc05b5 |
| 4.7 | 4.7 | split |  | 1058be68dfbbe45c |
| 4.8 | 4.8, 4.9, 4.10 | joined |  | 31d58bd1caa06d17 |
| 4.9 | 4.11, 4.12 | joined |  | 4364dcf589a1892e |
| 4.10 | 4.13 | identical-extent |  | 7c157877ac41538c |
| 4.11 | 4.14 | identical-extent |  | 37db791faf2edd2c |
| 4.12 | 4.15 | identical-extent |  | 6e5206f03c8c30f4 |
| 4.13 | 4.16 | identical-extent |  | d08cee20ab1ed214 |
| 4.14 | 4.17 | identical-extent |  | 9e709cd932c050a3 |
| 4.15 | 4.18 | split |  | 5d4fd4b2c38b9a30 |
| 4.16 | 4.18, 4.19, 4.20 | joined, split |  | 11d9264faa9d8c79 |
| 4.17 | 4.21, 4.22, 4.23 | joined | n4.21a, n4.22a | ce095e5a901c5abc |
| 4.18 | 4.24 | identical-extent |  | 3444c1e52ab574c7 |
| 4.19 | 4.25 | identical-extent |  | 939f9314e69503c2 |
| 4.20 | 4.26 | identical-extent |  | 44d6608fd3cfac81 |
| 4.21 | 4.27 | identical-extent |  | 8ada5124d44ecc8f |
| 4.22 | 4.28 | identical-extent |  | 34df2b4eeceb0a09 |
| 4.23 | 4.29 | identical-extent |  | df0b041e8bfba91a |
| 4.24 | 4.30 | identical-extent |  | 000690ad0692a203 |
| 4.25 | 4.31 | identical-extent |  | 183957d9bc63190b |
| 4.26 | 4.32, 4.33 | joined |  | d868737f6a9f068b |
| 4.27 | 4.34 | identical-extent |  | 00d794f9ac074754 |
| 4.28 | 4.35 | identical-extent |  | 36aca8781fdf49cb |
| 4.29 | 4.36 | identical-extent |  | 2a1a0ca91c7a1c25 |
| 4.30 | 4.37 | identical-extent |  | f90ecd7e349bc85d |
| 4.31 | 4.38 | identical-extent |  | 01e0bd6500b7ac18 |
| 4.32 | 4.39 | identical-extent |  | ff4185de3796d7c7 |
| 4.33 | 4.40 | identical-extent |  | 0db3aa96f152a518 |
| 4.34 | 4.41 | identical-extent |  | e4e38eebc8edcf5b |
| 5.0 | 5.0 | identical-extent |  | d28aa00a732a5071 |
| 5.1 | 5.1 | identical-extent |  | 2695dda8cb709ed8 |
| 5.2 | 5.2 | identical-extent |  | ec58f08d6a7531fc |
| 5.3 | 5.3 | identical-extent |  | 84fbaeb99174db69 |
| 5.4 | 5.4 | identical-extent |  | d560f14eecca9f94 |
| 5.5 | 5.5 | identical-extent |  | 6dec24172b6490b0 |
| 5.6 | 5.6 | identical-extent |  | 1675c8598794d0fa |
| 5.7 | 5.7 | identical-extent |  | d1425015ab988fe0 |
| 5.8 | 5.8 | identical-extent |  | e449c520080ee1a2 |
| 5.9 | 5.9 | identical-extent |  | 4e40f8e64e8ca4a8 |
| 5.10 | 5.10 | identical-extent |  | df77686837a78515 |
| 5.11 | 5.11 | identical-extent |  | 96e89f8a5deeeca9 |
| 5.12 | 5.12 | identical-extent |  | 507c34472e9f913c |
| 5.13 | 5.13 | identical-extent |  | b7b7347fbdedd9c0 |
| 5.14 | 5.14 | identical-extent |  | cbe63a211c54e1e3 |
| 5.15 | 5.15 | identical-extent |  | 6d09d655e92c4c43 |
| 5.16 | 5.16 | identical-extent |  | a7ebf36894c8cf5a |
| 5.17 | 5.17 | identical-extent |  | 1edec892e6fb27f1 |
| 5.18 | 5.18 | identical-extent |  | b2e3761ba00f535b |
| 5.19 | 5.19 | identical-extent |  | e506f0bc96fb16e3 |
| 5.20 | 5.20, 5.21 | joined |  | 52d83676dfd781c6 |
| 5.21 | 5.22 | identical-extent |  | d6a7902ea00e0b01 |
| 5.22 | 5.23 | identical-extent |  | 45afcccd5acc892c |
| 5.23 | 5.24 | identical-extent |  | c406a49ce33cbc50 |
| 5.24 | 5.25, 5.26 | joined |  | a2d2b733521e272f |
| 5.25 | 5.27 | identical-extent |  | 1f771f1119852879 |
| 5.26 | 5.28 | identical-extent |  | c168ea8e1c25be5a |
| 5.27 | 5.29 | identical-extent |  | 4d72156e6cccde83 |
| 5.28 | 5.30, 5.31 | joined | n5.31a | a6bced6e025438bf |
| 6.0 | 6.0 | identical-extent |  | 2fcd211a11bbf7a9 |
| 6.1 | 6.1 | identical-extent |  | 3c2796cb3e3d1002 |
| 6.2 | 6.2, 6.3 | joined |  | 5d687c548be4924c |
| 6.3 | 6.4 | identical-extent |  | df8ea52f49c642e3 |
| 6.4 | 6.5 | identical-extent |  | d45dfe64022a9d51 |
| 6.5 | 6.6 | identical-extent |  | fd88ac9df1a5a7c4 |
| 6.6 | 6.7 | identical-extent |  | 75a1a6714d7e04c0 |
| 6.7 | 6.8 | identical-extent |  | 6c4ff84f5792e516 |
| 6.8 | 6.9 | identical-extent |  | 8723599631ebe18b |
| 6.9 | 6.10 | identical-extent |  | 43672b873502fe5c |
| 6.10 | 6.11, 6.12, 6.13, 6.14 | joined |  | fe72c1905d288377 |
| 6.11 | 6.15 | identical-extent |  | 42ed02cc8aa96e75 |
| 6.12 | 6.16, 6.17 | joined |  | 3e99516932bf6f7c |
| 6.13 | 6.18 | identical-extent |  | ec9b1b05fa623e0b |
| 6.14 | 6.19 | identical-extent |  | 38ae204e721f5b8e |
| 6.15 | 6.20, 6.21 | joined |  | 5f95c51920ceb895 |
| 6.16 | 6.22 | identical-extent |  | 4d86bf02bccf9d0b |
| 6.17 | 6.23 | identical-extent |  | 2c07f61f8a0e6300 |
| 6.18 | 6.24, 6.25 | joined | n6.24a | 8d0613e7c35a809a |
| 6.19 | 6.26 | identical-extent |  | 3946b31e6ea42d20 |
| 6.20 | 6.27 | identical-extent |  | b0c9007dcdb2419d |
| 6.21 | 6.28 | identical-extent |  | 2eee77fe842ab6ba |
| 7.0 | 7.0 | identical-extent |  | cfadc9bcf3186944 |
| 7.1 | 7.1 | identical-extent |  | f6db18a2e4f73d81 |
| 7.2 | 7.2 | identical-extent |  | f39f3974a4079faa |
| 7.3 | 7.3 | identical-extent |  | eb099022e0fc21c5 |
| 7.4 | 7.4, 7.5 | joined |  | 40204205390b9f5c |
| 7.5 | 7.6 | identical-extent |  | 025ae3746c15a5d0 |
| 7.6 | 7.7 | identical-extent |  | 4284a75fde6369a2 |
| 7.7 | 7.8 | identical-extent |  | 47c8a3716c4c0e11 |
| 7.8 | 7.9 | identical-extent |  | a60bba1442972b0b |
| 7.9 | 7.10 | identical-extent |  | 9ffe97572608366c |
| 7.10 | 7.11 | identical-extent |  | 3912827bed0e9aa9 |
| 7.11 | 7.12 | identical-extent |  | ed6e36d35f0222eb |
| 7.12 | 7.13 | identical-extent |  | e026701ec5b6a7f8 |
| 7.13 | 7.14, 7.15, 7.16 | absorbs-footnote-slot, joined, split | n7.15a | 84877bcfe0c6a594 |
| 7.14 | 7.15, 7.17, 7.18 | joined, split | n7.15b | 3b6b70b345f6fc4c |
| 7.15 | 7.19, 7.20, 7.21, 7.23 | absorbs-footnote-slot, joined | n7.19a | 4851f60645abd5c8 |
| 7.16 | 7.22, 7.24 | joined |  | b37d3fa973e6b88e |
| 7.17 | 7.25, 7.26 | joined |  | e9801b2a7ceb4c58 |
| 7.18 | 7.27, 7.28, 7.29 | absorbs-footnote-slot, joined | n7.27a | c951707265a5ef8a |
| 7.19 | 7.30 | identical-extent |  | 2709c539992147f9 |
| 7.20 | 7.31 | identical-extent |  | e28055872727bdc5 |
| 7.21 | 7.32 | identical-extent |  | a80064755d3614b0 |
| 7.22 | 7.33, 7.34 | joined, split | n7.33a | 8c39fe0a82412ca7 |
| 7.23 | 7.34, 7.36 | absorbs-footnote-slot, split | n7.34a | 1211d47ba98e830d |
| 7.24 | 7.35, 7.37 | joined, split |  | d426c3a0334251e3 |
| 7.25 | 7.37, 7.38, 7.39 | absorbs-footnote-slot, joined, split | n7.37a | 604dc13227b1cfda |
| 7.26 | 7.40, 7.41 | joined |  | 25620caa6d24b609 |
| 7.27 | 7.42 | identical-extent |  | a02a2a62e46c7d6b |
| 7.28 | 7.43, 7.44 | joined |  | e0fda9b5144b2eab |
| 7.29 | 7.45 | identical-extent |  | 361e65c970addd38 |
| 7.30 | 7.46 | identical-extent |  | 57c8d6bbf78b9843 |
| 7.31 | 7.47, 7.48, 7.50 | absorbs-footnote-slot, joined | n7.47a | 16cd0f50d2b20fd4 |
| 7.32 | 7.49, 7.51 | joined |  | 321c2aca139d0571 |
| 7.33 | 7.52 | identical-extent |  | 20579f744d7dd9d7 |
| 7.34 | 7.53 | identical-extent |  | ac5e43a74bbad783 |
| 7.35 | 7.54, 7.55 | joined |  | 669df078f5875da2 |
| 7.36 | 7.56 | identical-extent |  | 8448c27ed061ce79 |
| 7.37 | 7.57 | identical-extent |  | 43b52ed861b36c87 |
| 7.38 | 7.58 | identical-extent |  | b008783270d23019 |
| 7.39 | 7.59 | identical-extent |  | e0b9334955021071 |
| 7.40 | 7.60 | identical-extent |  | 3bd1f5090e19bdc3 |
| 7.41 | 7.61, 7.62 | joined |  | f57e8a3df74fd7c8 |
| 7.42 | 7.63 | identical-extent |  | 22ce2f76c7f75014 |
| 7.43 | 7.64 | identical-extent |  | d3b7591751e3914c |
| 7.44 | 7.65 | identical-extent |  | 078291657765ebba |
| 7.45 | 7.66 | identical-extent |  | e82a101c2fc8ca25 |
| 7.46 | 7.67 | identical-extent | n7.67a | 74c742b3b36cc396 |
| 7.47 | 7.68 | identical-extent |  | b62e276661656381 |
| 7.48 | 7.69 | identical-extent |  | 9ff9974e3498c405 |
| 7.49 | 7.70, 7.71, 7.72 | joined |  | 002c8b4ee58f08bf |
| 7.50 | 7.73 | identical-extent |  | aaf1dd58ebec927f |
| 7.51 | 7.74 | identical-extent |  | 76656aa73049497a |
| 7.52 | 7.75 | identical-extent |  | 1387bf8f425e091e |
| 7.53 | 7.76, 7.77 | joined, split |  | 2533e385fb4817ed |
| 7.54 | 7.77, 7.79 | absorbs-footnote-slot, split | n7.77a | e90023c73c175831 |
| 7.55 | 7.78, 7.80 | joined |  | e37900865202e55f |
| 7.56 | 7.81, 7.83 | absorbs-footnote-slot, identical-extent | n7.81a | 56550d12a19a7c4e |
| 7.57 | 7.82, 7.84 | joined |  | 7e380ff9c308a954 |
| 7.58 | 7.85 | identical-extent |  | 8ffe18f54819503c |
| 7.59 | 7.86 | identical-extent |  | 762c10c89387101c |
| 7.60 | 7.87 | identical-extent |  | 3b0e813eae79b5d8 |
| 8.0 | 8.0, 8.1 | joined |  | 2fb48a5cc78dab77 |
| 8.1 | 8.2 | identical-extent |  | 3bf22eb6ecae0671 |
| 8.2 | 8.3 | identical-extent |  | bf0b815b0c22b01e |
| 8.3 | 8.4, 8.5 | joined | n8.5a, n8.5b | 33b426d5516066ef |
